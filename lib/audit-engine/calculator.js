/**
 * lib/audit-engine/calculator.js
 *
 * PURE MATH LAYER — Audit Engine Calculator
 *
 * Responsibilities:
 *   - Spend aggregation (total, per-tool, per-seat)
 *   - Savings computation (monthly, annual, ROI, payback period)
 *   - Seat utilization analysis (fill rate, waste ratio, idle cost)
 *   - Audit scoring (waste score 0–100, letter grade A–F)
 *   - Finding aggregation (roll-up from rule outputs)
 *   - Confidence-weighted recommendation shaping
 *
 * Architecture contract:
 *   - ZERO imports from other audit-engine modules
 *   - ZERO side effects — all functions are pure
 *   - ZERO tool-specific logic — this layer is domain-agnostic
 *   - All monetary values in USD/month unless annotated otherwise
 *   - Input validation is the orchestrator's job; this layer trusts its inputs
 *
 * Extending:
 *   - Add a new utility function → export it, done
 *   - Never add tool names, plan names, or pricing data to this file
 *   - Never import from rules/ or pricing.js
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Months in a year — used for annualization. Obvious but named for clarity. */
const MONTHS_PER_YEAR = 12;

/**
 * Seat utilization thresholds.
 * Below CRITICAL → immediate action. Below WARNING → flagged. Above OK → healthy.
 * Rules read these via getUtilizationBand() to generate consistent severity signals.
 */
export const UTILIZATION_THRESHOLDS = {
  CRITICAL: 0.50,  // <50% seats used → high waste
  WARNING:  0.75,  // <75% seats used → moderate waste
  OK:       0.90,  // <90% seats used → acceptable
  // ≥90% → fully utilized, no action needed
};

/**
 * Waste score thresholds → audit letter grades.
 * Score is 0–100 where 100 = maximum waste detected.
 * Grades map to UI badge colors in the front-end layer.
 */
export const GRADE_THRESHOLDS = [
  { minScore: 0,  maxScore: 10,  grade: "A", label: "Optimized",    color: "#22c55e" },
  { minScore: 10, maxScore: 25,  grade: "B", label: "Good",         color: "#84cc16" },
  { minScore: 25, maxScore: 45,  grade: "C", label: "Fair",         color: "#eab308" },
  { minScore: 45, maxScore: 65,  grade: "D", label: "Needs Work",   color: "#f97316" },
  { minScore: 65, maxScore: 100, grade: "F", label: "High Waste",   color: "#ef4444" },
];

/**
 * Severity → numeric weight used in waste score computation.
 * High-severity findings contribute more to the overall waste signal.
 */
const SEVERITY_WEIGHTS = {
  high:   1.0,
  medium: 0.6,
  low:    0.3,
};

/**
 * Finding type → base waste score contribution (0–20 per finding).
 * Overlap waste is penalized harder than mild over-provisioning.
 */
const FINDING_TYPE_BASE_SCORES = {
  overlap:       20,
  remove:        18,
  downgrade:     12,
  seat_waste:    10,
  plan_mismatch:  8,
  optimization:   5,
};

// ─── Spend Calculations ───────────────────────────────────────────────────────

/**
 * Computes the effective monthly spend for a single tool entry.
 *
 * Handles three billing models:
 *   1. Flat monthly  (e.g., ChatGPT Plus at $20/seat as a single-user product)
 *   2. Seat-based    (e.g., Cursor Business at $40/seat × N seats)
 *   3. Consumption   (e.g., OpenAI API — user-reported spend is the truth)
 *
 * Priority: user-reported monthlySpend wins over computed cost when both exist.
 * This ensures the audit reflects real invoices, not theoretical pricing.
 *
 * @param {object} toolEntry  - Enriched tool entry from orchestrator
 * @param {number} toolEntry.monthlySpend     - User-reported spend (truth source)
 * @param {number} [toolEntry.seats]          - Number of licensed seats
 * @param {object} [toolEntry.planMeta]       - Plan metadata from pricing.js
 * @returns {number} Effective monthly spend in USD
 */
export function computeEffectiveMonthlySpend(toolEntry) {
  const { monthlySpend, seats = 1, planMeta } = toolEntry;

  // User-reported spend is the authoritative source
  if (typeof monthlySpend === "number" && monthlySpend > 0) {
    return round(monthlySpend);
  }

  // Fall back to computed cost from plan metadata
  if (planMeta) {
    if (planMeta.flatMonthly !== null && planMeta.flatMonthly !== undefined) {
      return round(planMeta.flatMonthly * seats);
    }
    if (planMeta.pricePerSeat !== null && planMeta.pricePerSeat !== undefined) {
      return round(planMeta.pricePerSeat * seats);
    }
  }

  return 0;
}

/**
 * Sums total monthly spend across all tool entries.
 *
 * @param {Array<object>} toolEntries - Array of enriched tool entries
 * @returns {number} Total monthly spend in USD
 */
export function computeTotalMonthlySpend(toolEntries) {
  if (!Array.isArray(toolEntries) || toolEntries.length === 0) return 0;

  return round(
    toolEntries.reduce((sum, entry) => sum + computeEffectiveMonthlySpend(entry), 0)
  );
}

/**
 * Computes the effective per-seat cost for a tool entry.
 * For flat/consumption billing, distributes total cost across seats.
 * Used by seat utilization analysis to price idle seats correctly.
 *
 * @param {object} toolEntry
 * @returns {number} Cost per seat per month in USD
 */
export function computePerSeatCost(toolEntry) {
  const { seats = 1, planMeta, monthlySpend } = toolEntry;
  const effectiveSeats = Math.max(seats, 1);

  // Seat-based plans: use plan's per-seat price directly
  if (planMeta?.pricePerSeat != null) {
    return round(planMeta.pricePerSeat);
  }

  // Flat or consumption plans: distribute reported spend
  if (monthlySpend > 0) {
    return round(monthlySpend / effectiveSeats);
  }

  return 0;
}

/**
 * Builds a spend breakdown map keyed by tool name.
 * Used by the orchestrator to attach per-tool cost context to the audit report.
 *
 * @param {Array<object>} toolEntries
 * @returns {Record<string, { monthlySpend: number, seats: number, perSeatCost: number }>}
 */
export function buildSpendBreakdown(toolEntries) {
  if (!Array.isArray(toolEntries)) return {};

  return toolEntries.reduce((map, entry) => {
    const key = entry.tool ?? "unknown";
    map[key] = {
      monthlySpend: computeEffectiveMonthlySpend(entry),
      seats:        entry.seats ?? 1,
      perSeatCost:  computePerSeatCost(entry),
    };
    return map;
  }, {});
}

// ─── Savings Calculations ─────────────────────────────────────────────────────

/**
 * Annualizes a monthly savings figure.
 *
 * @param {number} monthlySavings - Monthly savings in USD
 * @returns {number} Annual savings in USD
 */
export function annualizeSavings(monthlySavings) {
  if (typeof monthlySavings !== "number" || monthlySavings <= 0) return 0;
  return round(monthlySavings * MONTHS_PER_YEAR);
}

/**
 * Computes total actionable savings from a findings array.
 *
 * Only counts findings with a positive savings value.
 * Deduplicated by (tool, type) pair — prevents double-counting when a tool
 * triggers both a downgrade and a seat_waste finding for the same root cause.
 *
 * @param {Array<object>} findings - All findings from rule evaluation
 * @returns {number} Total monthly savings in USD
 */
export function computeTotalSavings(findings) {
  if (!Array.isArray(findings) || findings.length === 0) return 0;

  const seen = new Set();

  const deduped = findings.filter((f) => {
    if (!f.savings || f.savings <= 0) return false;

    const key = `${f.tool}::${f.type}`;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });

  return round(deduped.reduce((sum, f) => sum + (f.savings ?? 0), 0));
}

/**
 * Computes savings as a percentage of total current spend.
 * Returns 0 if totalSpend is 0 to avoid division-by-zero.
 *
 * @param {number} totalSavings
 * @param {number} totalSpend
 * @returns {number} Savings percentage (0–100)
 */
export function computeSavingsPercentage(totalSavings, totalSpend) {
  if (!totalSpend || totalSpend <= 0) return 0;
  return round((totalSavings / totalSpend) * 100, 1);
}

/**
 * Computes the monthly spend after all recommendations are applied.
 *
 * @param {number} totalSpend
 * @param {number} totalSavings
 * @returns {number} Optimized monthly spend in USD
 */
export function computeOptimizedSpend(totalSpend, totalSavings) {
  return round(Math.max(0, totalSpend - totalSavings));
}

/**
 * Computes ROI of acting on the audit recommendations.
 * In this context: "investment" = time cost of implementing changes (estimated
 * as a flat $0 since the audit itself is the product — returns pure savings ratio).
 *
 * Expressed as a multiple: 3.0 = "$3 saved per $1 of current spend reallocated".
 * Used for executive summary copy generation.
 *
 * @param {number} annualSavings
 * @param {number} currentAnnualSpend
 * @returns {number} ROI multiple (e.g., 2.4 = 240% return)
 */
export function computeROIMultiple(annualSavings, currentAnnualSpend) {
  if (!currentAnnualSpend || currentAnnualSpend <= 0) return 0;
  return round(annualSavings / currentAnnualSpend, 2);
}

/**
 * Estimates payback period in months — how quickly savings recoup the
 * cost of switching (e.g., migration effort, training).
 *
 * Assumes a flat implementation overhead of $0 for pure plan changes,
 * configurable for tooling migrations.
 *
 * @param {number} implementationCost - One-time cost to implement recommendations
 * @param {number} monthlySavings
 * @returns {number|null} Months to payback, or null if savings are zero
 */
export function computePaybackMonths(implementationCost, monthlySavings) {
  if (!monthlySavings || monthlySavings <= 0) return null;
  if (!implementationCost || implementationCost <= 0) return 0;
  return Math.ceil(implementationCost / monthlySavings);
}

// ─── Seat Utilization Analysis ────────────────────────────────────────────────

/**
 * Computes the seat utilization rate for a tool entry.
 *
 * `activeSeats` must be provided by the rule (derived from usage data or
 * estimated from teamSize × useCase overlap). If unknown, returns null
 * rather than a misleading number.
 *
 * @param {number} activeSeats  - Seats with measured/estimated activity
 * @param {number} totalSeats   - Licensed seat count
 * @returns {number|null} Utilization rate 0–1, or null if unknown
 */
export function computeUtilizationRate(activeSeats, totalSeats) {
  if (totalSeats == null || totalSeats <= 0) return null;
  if (activeSeats == null) return null;
  return round(Math.min(activeSeats / totalSeats, 1), 3);
}

/**
 * Returns the utilization band for a given rate.
 * Used by rules and the orchestrator to generate severity-consistent signals.
 *
 * @param {number|null} rate - Utilization rate 0–1
 * @returns {{ band: string, severity: string, label: string }}
 */
export function getUtilizationBand(rate) {
  if (rate === null || rate === undefined) {
    return { band: "unknown", severity: "low", label: "Unknown utilization" };
  }

  if (rate < UTILIZATION_THRESHOLDS.CRITICAL) {
    return { band: "critical", severity: "high",   label: "Critically underutilized" };
  }
  if (rate < UTILIZATION_THRESHOLDS.WARNING) {
    return { band: "warning",  severity: "medium", label: "Underutilized"            };
  }
  if (rate < UTILIZATION_THRESHOLDS.OK) {
    return { band: "ok",       severity: "low",    label: "Lightly underutilized"    };
  }

  return { band: "healthy", severity: null, label: "Healthy utilization" };
}

/**
 * Computes the number of idle (unused) seats.
 *
 * @param {number} activeSeats
 * @param {number} totalSeats
 * @returns {number} Count of idle seats (non-negative)
 */
export function computeIdleSeats(activeSeats, totalSeats) {
  if (totalSeats == null || activeSeats == null) return 0;
  return Math.max(0, Math.floor(totalSeats - activeSeats));
}

/**
 * Computes the monthly cost of idle seats — i.e., direct waste.
 *
 * @param {number} idleSeats
 * @param {number} perSeatCost - Monthly cost per seat
 * @returns {number} Monthly idle seat cost in USD
 */
export function computeIdleSeatCost(idleSeats, perSeatCost) {
  if (!idleSeats || !perSeatCost) return 0;
  return round(idleSeats * perSeatCost);
}

/**
 * Computes the minimum seat count needed to support the active user base,
 * with a configurable headroom buffer for growth.
 *
 * @param {number} activeSeats       - Currently active seat count
 * @param {number} [headroomPct=0.1] - Growth buffer (default: 10%)
 * @returns {number} Recommended seat count
 */
export function computeRecommendedSeats(activeSeats, headroomPct = 0.10) {
  if (!activeSeats || activeSeats <= 0) return 1;
  return Math.ceil(activeSeats * (1 + headroomPct));
}

/**
 * Full seat utilization analysis for a single tool entry.
 * Returns a structured object consumed directly by the orchestrator.
 *
 * @param {object} params
 * @param {number} params.totalSeats
 * @param {number|null} params.activeSeats    - null if usage data unavailable
 * @param {number} params.perSeatCost
 * @param {number} [params.headroomPct=0.10]
 * @returns {SeatAnalysis}
 */
export function analyzeSeatUtilization({ totalSeats, activeSeats, perSeatCost, headroomPct = 0.10 }) {
  const rate       = computeUtilizationRate(activeSeats, totalSeats);
  const band       = getUtilizationBand(rate);
  const idleSeats  = computeIdleSeats(activeSeats ?? 0, totalSeats);
  const idleCost   = computeIdleSeatCost(idleSeats, perSeatCost);
  const recommended = activeSeats != null
    ? computeRecommendedSeats(activeSeats, headroomPct)
    : null;
  const seatSavings = recommended != null
    ? computeIdleSeatCost(Math.max(0, totalSeats - recommended), perSeatCost)
    : 0;

  return {
    totalSeats,
    activeSeats:      activeSeats ?? null,
    idleSeats,
    recommendedSeats: recommended,
    utilizationRate:  rate,
    utilizationBand:  band.band,
    severity:         band.severity,
    bandLabel:        band.label,
    idleSeatCostMonthly:  idleCost,
    potentialSeatSavings: seatSavings,
    annualSeatSavings:    annualizeSavings(seatSavings),
  };
}

// ─── Audit Scoring ────────────────────────────────────────────────────────────

/**
 * Computes a waste score (0–100) from a findings array.
 *
 * Algorithm:
 *   1. Each finding has a base score from FINDING_TYPE_BASE_SCORES
 *   2. Multiplied by severity weight from SEVERITY_WEIGHTS
 *   3. Multiplied by the finding's confidence score (0–1)
 *   4. Summed and normalized against a theoretical max score
 *   5. Clamped to 0–100
 *
 * This means a single high-confidence, high-severity overlap finding
 * contributes more than three low-confidence, low-severity optimizations.
 *
 * @param {Array<object>} findings
 * @returns {number} Waste score 0–100
 */
export function computeWasteScore(findings) {
  if (!Array.isArray(findings) || findings.length === 0) return 0;

  const rawScore = findings.reduce((sum, f) => {
    const base       = FINDING_TYPE_BASE_SCORES[f.type]    ?? 5;
    const severity   = SEVERITY_WEIGHTS[f.severity]         ?? 0.3;
    const confidence = typeof f.confidence === "number"
      ? clamp(f.confidence, 0, 1)
      : 0.7; // Default confidence when rule doesn't specify

    return sum + base * severity * confidence;
  }, 0);

  // Theoretical max: N findings all at max base (20), max severity (1.0), max confidence (1.0)
  const theoreticalMax = findings.length * 20 * 1.0 * 1.0;
  if (theoreticalMax === 0) return 0;

  return round(clamp((rawScore / theoreticalMax) * 100, 0, 100), 1);
}

/**
 * Converts a waste score (0–100) to a letter grade with metadata.
 *
 * @param {number} score - Waste score from computeWasteScore()
 * @returns {{ grade: string, label: string, color: string, score: number }}
 */
export function computeAuditGrade(score) {
  const entry = GRADE_THRESHOLDS.find(
    (t) => score >= t.minScore && score < t.maxScore
  ) ?? GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]; // Default to F if somehow out of range

  return {
    grade: entry.grade,
    label: entry.label,
    color: entry.color,
    score,
  };
}

// ─── Finding Aggregation ──────────────────────────────────────────────────────

/**
 * Filters findings to only those that have actionable savings (savings > 0).
 * Non-savings findings (e.g., informational overlap flags) are preserved
 * for the report but excluded from savings math.
 *
 * @param {Array<object>} findings
 * @returns {Array<object>} Findings with positive savings
 */
export function filterActionableFindings(findings) {
  if (!Array.isArray(findings)) return [];
  return findings.filter((f) => typeof f.savings === "number" && f.savings > 0);
}

/**
 * Sorts findings by savings impact descending.
 * Used to surface the highest-ROI recommendations first in the report.
 *
 * @param {Array<object>} findings
 * @returns {Array<object>} Sorted findings (highest savings first)
 */
export function sortFindingsByImpact(findings) {
  if (!Array.isArray(findings)) return [];
  return [...findings].sort((a, b) => (b.savings ?? 0) - (a.savings ?? 0));
}

/**
 * Groups findings by tool name.
 * Used by the orchestrator to build per-tool report sections.
 *
 * @param {Array<object>} findings
 * @returns {Record<string, Array<object>>}
 */
export function groupFindingsByTool(findings) {
  if (!Array.isArray(findings)) return {};

  return findings.reduce((map, finding) => {
    const key = finding.tool ?? "unknown";
    if (!map[key]) map[key] = [];
    map[key].push(finding);
    return map;
  }, {});
}

/**
 * Groups findings by type.
 * Used to count how many of each finding type exist across all tools.
 * Useful for the "N overlapping tools detected" summary line.
 *
 * @param {Array<object>} findings
 * @returns {Record<string, Array<object>>}
 */
export function groupFindingsByType(findings) {
  if (!Array.isArray(findings)) return {};

  return findings.reduce((map, finding) => {
    const key = finding.type ?? "unknown";
    if (!map[key]) map[key] = [];
    map[key].push(finding);
    return map;
  }, {});
}

/**
 * Produces a flat summary of finding counts by type.
 * Drives the "Audit Overview" stats row in the UI.
 *
 * @param {Array<object>} findings
 * @returns {{ overlaps: number, downgrades: number, seatWaste: number, removals: number, total: number }}
 */
export function summarizeFindingTypes(findings) {
  const grouped = groupFindingsByType(findings);

  return {
    overlaps:   (grouped.overlap        ?? []).length,
    downgrades: (grouped.downgrade      ?? []).length,
    seatWaste:  (grouped.seat_waste     ?? []).length,
    removals:   (grouped.remove         ?? []).length,
    total:      (findings ?? []).length,
  };
}

// ─── Report Assembly Helpers ──────────────────────────────────────────────────

/**
 * Computes the full savings summary block.
 * This is the canonical savings object attached to every audit report.
 *
 * @param {object} params
 * @param {number} params.totalMonthlySpend
 * @param {Array<object>} params.findings
 * @returns {SavingsSummary}
 */
export function buildSavingsSummary({ totalMonthlySpend, findings }) {
  const monthlySavings   = computeTotalSavings(findings);
  const annualSavings    = annualizeSavings(monthlySavings);
  const savingsPct       = computeSavingsPercentage(monthlySavings, totalMonthlySpend);
  const optimizedSpend   = computeOptimizedSpend(totalMonthlySpend, monthlySavings);
  const currentAnnual    = annualizeSavings(totalMonthlySpend);
  const roiMultiple      = computeROIMultiple(annualSavings, currentAnnual);

  return {
    currentMonthlySpend:   round(totalMonthlySpend),
    currentAnnualSpend:    round(currentAnnual),
    estimatedMonthlySavings: round(monthlySavings),
    estimatedAnnualSavings:  round(annualSavings),
    optimizedMonthlySpend:   round(optimizedSpend),
    optimizedAnnualSpend:    round(annualizeSavings(optimizedSpend)),
    savingsPercentage:       savingsPct,
    roiMultiple,
  };
}

/**
 * Shapes the final recommendations array from findings.
 *
 * Transforms raw finding objects into user-facing recommendation objects:
 *   - Sorted by savings impact (highest first)
 *   - Filtered to actionable items only
 *   - Stripped of internal-only fields (confidence, raw rule metadata)
 *
 * @param {Array<object>} findings
 * @returns {Array<Recommendation>}
 */
export function buildRecommendations(findings) {
  if (!Array.isArray(findings)) return [];

  return sortFindingsByImpact(filterActionableFindings(findings)).map((f) => ({
    tool:            f.tool,
    type:            f.type,
    severity:        f.severity,
    savings:         round(f.savings ?? 0),
    annualSavings:   round(annualizeSavings(f.savings ?? 0)),
    currentPlan:     f.currentPlan     ?? null,
    suggestedPlan:   f.suggestedPlan   ?? null,
    recommendation:  f.recommendation  ?? "",
    impact:          classifyImpact(f.savings ?? 0, f),
  }));
}

/**
 * Classifies a recommendation's impact level for UI prioritization.
 *
 * @param {number} savings
 * @param {object} finding
 * @returns {"critical" | "high" | "medium" | "low"}
 */
export function classifyImpact(savings, finding) {
  // Type-based overrides
  if (finding.type === "overlap" && finding.severity === "high") return "critical";
  if (finding.type === "remove")                                  return "high";

  // Savings-based classification
  if (savings >= 200) return "critical";
  if (savings >= 100) return "high";
  if (savings >= 50)  return "medium";
  return "low";
}

// ─── Math Utilities ───────────────────────────────────────────────────────────

/**
 * Rounds a number to N decimal places.
 * Default: 2 (dollar-precision). Use 0 for whole numbers.
 *
 * @param {number} value
 * @param {number} [decimals=2]
 * @returns {number}
 */
export function round(value, decimals = 2) {
  if (typeof value !== "number" || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamps a number between min and max.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Safe percentage: (part / whole) × 100, guarded against division by zero.
 *
 * @param {number} part
 * @param {number} whole
 * @param {number} [decimals=1]
 * @returns {number}
 */
export function safePct(part, whole, decimals = 1) {
  if (!whole || whole === 0) return 0;
  return round((part / whole) * 100, decimals);
}

/**
 * Formats a USD value for display (non-i18n, server-side safe).
 * Use only for audit report string fields, not for UI rendering.
 *
 * @param {number} value
 * @returns {string} e.g., "$1,240.00"
 */
export function formatUSD(value) {
  if (typeof value !== "number") return "$0.00";
  return `$${round(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── JSDoc Type Definitions ───────────────────────────────────────────────────

/**
 * @typedef {object} SeatAnalysis
 * @property {number}      totalSeats
 * @property {number|null} activeSeats
 * @property {number}      idleSeats
 * @property {number|null} recommendedSeats
 * @property {number|null} utilizationRate
 * @property {string}      utilizationBand
 * @property {string|null} severity
 * @property {string}      bandLabel
 * @property {number}      idleSeatCostMonthly
 * @property {number}      potentialSeatSavings
 * @property {number}      annualSeatSavings
 */

/**
 * @typedef {object} SavingsSummary
 * @property {number} currentMonthlySpend
 * @property {number} currentAnnualSpend
 * @property {number} estimatedMonthlySavings
 * @property {number} estimatedAnnualSavings
 * @property {number} optimizedMonthlySpend
 * @property {number} optimizedAnnualSpend
 * @property {number} savingsPercentage
 * @property {number} roiMultiple
 */

/**
 * @typedef {object} Recommendation
 * @property {string}      tool
 * @property {string}      type
 * @property {string}      severity
 * @property {number}      savings
 * @property {number}      annualSavings
 * @property {string|null} currentPlan
 * @property {string|null} suggestedPlan
 * @property {string}      recommendation
 * @property {string}      impact
 */