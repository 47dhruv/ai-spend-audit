/**
 * lib/engine/transformAuditResult.js
 *
 * Adapts the raw output of runAudit() (lib/engine/auditEngine.js)
 * into the prop shapes expected by each dashboard component.
 *
 * runAudit() returns:
 * {
 *   summary: { totalMonthlySpend, estimatedSavings, annualSavings,
 *               wastePercentage, auditScore, auditGrade },
 *   aiInsights: { headline, insights, topAction, scoreContext },
 *   recommendations: Recommendation[],
 *   metrics: EnrichedTool[],   ← per-tool cost objects, NOT UI metric cards
 *   meta: { toolCount, teamSize, useCase, ... },
 * }
 *
 * Dashboard components expect:
 *   SavingsHero   → { auditData: { totalMonthlySpend, estimatedSavings,
 *                                   annualSavings, wastePercentage,
 *                                   findingSummary, recommendations, grade } }
 *   ResultCard    → { title, value, change, trend, description }
 *   RecommendationCard → { recommendation: { tool, type, severity, savings,
 *                                             annualSavings, recommendation,
 *                                             confidence, category } }
 *   AISummary     → { summary: string, insights: string[], topAction: string,
 *                     scoreContext: string }
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (typeof n !== "number" || isNaN(n)) return "0";
  return n.toLocaleString("en-US");
}

function fmtUSD(n) {
  return `$${fmt(n)}`;
}

/** Generates a short report ID without relying on crypto.randomUUID() */
function generateReportId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${ts}-${rand}`;
}

// ─── Main transform ───────────────────────────────────────────────────────────

/**
 * @param {object} result - Raw output from runAudit()
 * @returns {DashboardProps}
 */
export function transformAuditResult(result) {
  // ── Destructure top-level engine output ────────────────────────────────────
  const {
    summary = {},
    aiInsights = {},
    recommendations = [],
    metrics: rawMetrics = [],
    meta = {},
  } = result;

  const {
    totalMonthlySpend = 0,
    estimatedSavings  = 0,
    annualSavings     = 0,
    wastePercentage   = 0,
    auditScore        = 0,
    auditGrade        = "N/A",
  } = summary;

  // ── auditData object → SavingsHero ────────────────────────────────────────
  // SavingsHero expects: auditData.totalMonthlySpend, .estimatedSavings,
  //   .annualSavings, .wastePercentage, .recommendations[], .grade,
  //   .findingSummary, .toolBreakdown
  const auditData = {
    totalMonthlySpend,
    estimatedSavings,
    annualSavings,
    wastePercentage,
    // Grade object: SavingsHero reads grade.letter and grade.color
    grade: {
      letter: auditGrade,
      label:  gradeToLabel(auditGrade),
      color:  gradeToColor(auditGrade),
    },
    // Finding summary for badge counts
    findingSummary: {
      total: recommendations.length,
    },
    // Recommendations array (SavingsHero reads .length for pills)
    recommendations,
    // toolBreakdown: SavingsHero reads Object.keys(toolBreakdown).length
    // Build it from the raw per-tool metrics array
    toolBreakdown: rawMetrics.reduce((map, t) => {
      map[t.name] = t;
      return map;
    }, {}),
  };

  // ── UI metric cards → ResultCard ─────────────────────────────────────────
  // ResultCard expects: { title, value, change, trend, description }
  const uiMetrics = [
    {
      id:          "monthly_spend",
      title:       "Monthly Spend",
      value:       fmtUSD(totalMonthlySpend),
      change:      `${wastePercentage}% waste detected`,
      trend:       "negative",
      description: "Total AI tool subscriptions this month",
    },
    {
      id:          "annual_spend",
      title:       "Annual Spend",
      value:       fmtUSD(totalMonthlySpend * 12),
      change:      "Projected yearly cost",
      trend:       "neutral",
      description: "Current run-rate annualized",
    },
    {
      id:          "monthly_savings",
      title:       "Recoverable Savings",
      value:       fmtUSD(estimatedSavings),
      change:      "Per month",
      trend:       "positive",
      description: "Monthly savings if all recommendations applied",
    },
    {
      id:          "audit_score",
      title:       "Audit Score",
      value:       `${auditScore}/100`,
      change:      gradeToLabel(auditGrade),
      trend:       auditScore >= 75 ? "positive" : auditScore >= 50 ? "warning" : "negative",
      description: `Grade: ${auditGrade} — ${gradeToLabel(auditGrade)}`,
    },
  ];

  // ── Shaped recommendations → RecommendationCard ──────────────────────────
  // RecommendationCard expects a single `recommendation` prop (object),
  // which it destructures: { tool, type, savings, annualSavings,
  //                          recommendation, severity, confidence, category }
  //
  // runAudit() produces: { id, type, priority, title, description,
  //                         estimatedMonthlySaving, estimatedAnnualSaving,
  //                         affectedTools, action }
  const shapedRecommendations = recommendations.map((rec) => ({
    id:             rec.id,
    // RecommendationCard displays rec.tool as the card title
    tool:           (rec.affectedTools?.[0]) ?? rec.title ?? "Tool",
    type:           mapRecType(rec.type),
    severity:       rec.priority ?? "medium",       // priority="high|medium|low"
    savings:        rec.estimatedMonthlySaving ?? 0,
    annualSavings:  rec.estimatedAnnualSaving  ?? 0,
    recommendation: rec.description ?? "",
    confidence:     confidenceFromPriority(rec.priority),
    category:       rec.type ?? "optimization",
    action:         rec.action ?? "",
    affectedTools:  rec.affectedTools ?? [],
  }));

  // ── AISummary props ────────────────────────────────────────────────────────
  // AISummary expects: { summary: string, insights?: string[],
  //                      topAction?: string, scoreContext?: string }
  const aiSummaryProps = {
    summary:      aiInsights.headline ?? buildFallbackSummary(summary),
    insights:     aiInsights.insights ?? [],
    topAction:    aiInsights.topAction ?? null,
    scoreContext: aiInsights.scoreContext ?? null,
  };

  // ── Report meta ────────────────────────────────────────────────────────────
  const reportMeta = {
    companyName: null,   // Not collected in form — shown as null → header omits it
    auditDate:   new Date().toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    }),
    reportId:    generateReportId(),
    toolCount:   meta.toolCount ?? rawMetrics.length,
    teamSize:    meta.teamSize  ?? 0,
    useCase:     meta.useCase   ?? "general",
  };

  return {
    auditData,           // → SavingsHero
    metrics: uiMetrics,  // → ResultCard (via MetricsGrid)
    recommendations: shapedRecommendations,  // → RecommendationCard
    aiInsights: aiSummaryProps,              // → AISummary
    meta: reportMeta,                        // → PageHeader
  };
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/** Maps engine audit grade letter → human label */
function gradeToLabel(grade) {
  return {
    A: "Lean & Optimized",
    B: "Good Shape",
    C: "Fair — Savings Available",
    D: "Significant Waste",
    F: "Critical — Immediate Action",
  }[grade] ?? "Under Review";
}

/** Maps engine audit grade letter → hex color (matches SavingsHero TOKENS) */
function gradeToColor(grade) {
  return {
    A: "#10e898",
    B: "#84cc16",
    C: "#eab308",
    D: "#f97316",
    F: "#ef4444",
  }[grade] ?? "#6b7a99";
}

/** Maps engine recommendation type → RecommendationCard TYPE_CONFIG key */
function mapRecType(type) {
  const map = {
    OVERLAP:       "consolidate",
    SEAT_WASTE:    "optimize",
    PLAN_MISMATCH: "downgrade",
    CONSOLIDATION: "consolidate",
    overlap:       "consolidate",
    downgrade:     "downgrade",
    seat_waste:    "optimize",
    remove:        "eliminate",
    optimization:  "optimize",
  };
  return map[type] ?? "optimize";
}

/** Derives a numeric confidence from priority string */
function confidenceFromPriority(priority) {
  return { high: 90, medium: 72, low: 55 }[priority] ?? 70;
}

/** Fallback summary string when aiInsights.headline is missing */
function buildFallbackSummary({ totalMonthlySpend, estimatedSavings, wastePercentage }) {
  if (!totalMonthlySpend) return "Complete the audit form to generate your AI spend analysis.";
  return `Your team is spending ${fmtUSD(totalMonthlySpend)}/mo on AI tools. ` +
    `${wastePercentage}% of that budget (${fmtUSD(estimatedSavings)}/mo) is ` +
    `recoverable through optimization.`;
}