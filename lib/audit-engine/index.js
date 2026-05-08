/**
 * lib/audit-engine/index.js
 *
 * ORCHESTRATOR — AI Spend Audit Engine
 *
 * This is the single public entry point for the entire audit engine.
 * External callers (API routes, server actions, CLI) import only this file.
 * Nothing else in lib/audit-engine/ is part of the public API.
 *
 * Pipeline stages (in execution order):
 *   0. Validate     — Reject malformed input before any computation
 *   1. Normalize    — Resolve tool/plan names, enrich entries with pricing metadata
 *   2. Per-tool     — Route each enriched entry to its dedicated rule module
 *   3. Cross-tool   — Detect overlaps and redundant category coverage
 *   4. Compute      — Run calculator layer over all accumulated findings
 *   5. Assemble     — Shape the final AuditReport output object
 *
 * Error model:
 *   - Validation failures  → throw AuditValidationError (caller handles)
 *   - Individual rule failures → isolated, report includes a warnings[] array
 *   - Unrecognized tools   → pass-through with a basic spend entry, no findings
 *
 * Extending the engine:
 *   1. Create lib/audit-engine/rules/newtool.js
 *   2. Register it in RULE_REGISTRY below — nothing else changes
 *
 * @module audit-engine
 */

import {
  resolveToolKey,
  resolvePlanKey,
  getPlanMeta,
  getDowngradePlans,
  computePlanCost,
} from "./pricing.js";

import {
  computeEffectiveMonthlySpend,
  computeTotalMonthlySpend,
  computePerSeatCost,
  buildSpendBreakdown,
  buildSavingsSummary,
  buildRecommendations,
  computeWasteScore,
  computeAuditGrade,
  summarizeFindingTypes,
  groupFindingsByTool,
  annualizeSavings,
  round,
  formatUSD,
} from "./calculator.js";

// ─── Rule Registry ────────────────────────────────────────────────────────────

/**
 * RULE_REGISTRY maps canonical tool keys → their rule module's auditTool function.
 *
 * This is the ONLY place a new tool needs to be registered.
 * Import the rule, add one line here. Zero changes to pipeline logic.
 *
 * Each rule module must export: auditTool(enrichedEntry, auditContext) → Finding[]
 */
import { auditTool as auditChatGPT  } from "./rules/chatgpt.js";
import { auditTool as auditClaude   } from "./rules/claude.js";
import { auditTool as auditCursor   } from "./rules/cursor.js";
import { auditTool as auditCopilot  } from "./rules/copilot.js";
import { auditTool as auditGemini   } from "./rules/gemini.js";
import { auditTool as auditOpenAIApi} from "./rules/openai.js";

const RULE_REGISTRY = {
  chatgpt:    auditChatGPT,
  claude:     auditClaude,
  cursor:     auditCursor,
  copilot:    auditCopilot,
  gemini:     auditGemini,
  openai_api: auditOpenAIApi,
};

// ─── Engine Constants ─────────────────────────────────────────────────────────

/** Current engine version — included in every report for cache-busting and debugging. */
const ENGINE_VERSION = "1.0.0";

/**
 * Feature tag groups used for cross-tool overlap detection.
 *
 * If two or more tools in the same audit share tags from the same group,
 * they are flagged as overlapping. Groups are ordered by severity:
 * LLM overlap is more wasteful than coding tool overlap.
 *
 * Extending: Add new feature groups here as new tool categories emerge.
 * Feature tags must match those declared in pricing.js plan entries.
 */
const OVERLAP_FEATURE_GROUPS = [
  {
    groupKey:    "llm_chat",
    label:       "General LLM / Chat",
    featureTags: ["llm_chat"],
    severity:    "high",
    savingsHint: "Consolidate to a single LLM provider to eliminate redundant subscriptions.",
  },
  {
    groupKey:    "ai_code_editor",
    label:       "AI Code Editor",
    featureTags: ["ai_code_editor", "autocomplete"],
    severity:    "high",
    savingsHint: "Developers should use one AI coding tool, not multiple.",
  },
  {
    groupKey:    "workspace_ai",
    label:       "Workspace / Productivity AI",
    featureTags: ["workspace_integration", "gmail_ai", "docs_ai"],
    severity:    "medium",
    savingsHint: "Multiple workspace AI tools create redundant coverage.",
  },
];

/**
 * Use-case → relevant tool feature tag groups.
 * Used to detect plan mismatches where a team's use-case doesn't
 * require the features they're paying for.
 */
const USECASE_FEATURE_RELEVANCE = {
  coding:     ["ai_code_editor", "autocomplete", "llm_chat"],
  writing:    ["llm_chat"],
  research:   ["llm_chat", "extended_context"],
  data:       ["llm_chat", "code_interpreter", "api_access"],
  design:     ["dalle", "llm_chat"],
  operations: ["llm_chat", "workspace_integration"],
  general:    ["llm_chat"],
};

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Custom error class for input validation failures.
 * Includes a structured `errors` array for API response formatting.
 */
export class AuditValidationError extends Error {
  /**
   * @param {string[]} errors - Array of human-readable validation messages
   */
  constructor(errors) {
    super(`Audit input validation failed: ${errors.join("; ")}`);
    this.name    = "AuditValidationError";
    this.errors  = errors;
    this.code    = "AUDIT_VALIDATION_ERROR";
  }
}

/**
 * Validates raw audit input before any enrichment or computation.
 *
 * Validation philosophy: collect ALL errors before throwing.
 * This gives API callers a complete error list in one round-trip,
 * rather than fixing one error at a time.
 *
 * @param {object} input - Raw audit input from caller
 * @throws {AuditValidationError} if input is invalid
 */
function validateInput(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    throw new AuditValidationError(["Input must be a non-null object."]);
  }

  // teamSize
  if (input.teamSize === undefined || input.teamSize === null) {
    errors.push("teamSize is required.");
  } else if (typeof input.teamSize !== "number" || !Number.isInteger(input.teamSize)) {
    errors.push("teamSize must be an integer.");
  } else if (input.teamSize < 1 || input.teamSize > 100_000) {
    errors.push("teamSize must be between 1 and 100,000.");
  }

  // useCase
  const validUseCases = Object.keys(USECASE_FEATURE_RELEVANCE);
  if (!input.useCase) {
    errors.push(`useCase is required. Valid values: ${validUseCases.join(", ")}.`);
  } else if (!validUseCases.includes(input.useCase)) {
    errors.push(`useCase "${input.useCase}" is not recognized. Valid: ${validUseCases.join(", ")}.`);
  }

  // tools
  if (!Array.isArray(input.tools)) {
    errors.push("tools must be an array.");
  } else if (input.tools.length === 0) {
    errors.push("tools array must contain at least one entry.");
  } else if (input.tools.length > 50) {
    errors.push("tools array must not exceed 50 entries.");
  } else {
    input.tools.forEach((t, i) => {
      const prefix = `tools[${i}]`;

      if (!t || typeof t !== "object") {
        errors.push(`${prefix} must be an object.`);
        return;
      }
      if (!t.tool || typeof t.tool !== "string") {
        errors.push(`${prefix}.tool must be a non-empty string.`);
      }
      if (!t.plan || typeof t.plan !== "string") {
        errors.push(`${prefix}.plan must be a non-empty string.`);
      }
      if (typeof t.monthlySpend !== "number" || t.monthlySpend < 0) {
        errors.push(`${prefix}.monthlySpend must be a non-negative number.`);
      }
      if (t.seats !== undefined) {
        if (!Number.isInteger(t.seats) || t.seats < 1) {
          errors.push(`${prefix}.seats must be a positive integer.`);
        }
      }
    });
  }

  if (errors.length > 0) throw new AuditValidationError(errors);
}

// ─── Stage 1: Normalization ───────────────────────────────────────────────────

/**
 * Normalizes and enriches a single raw tool entry.
 *
 * Transforms user-supplied strings into structured, typed objects that
 * rule modules and the calculator can consume without defensive coding.
 *
 * Enrichment adds:
 *   - toolKey:       canonical pricing registry key
 *   - planKey:       canonical plan key
 *   - planMeta:      full plan metadata object from pricing.js
 *   - perSeatCost:   computed per-seat monthly cost
 *   - effectiveSpend: authoritative monthly cost (user-reported or computed)
 *   - isRecognized:  false if tool is not in the registry (passthrough mode)
 *   - isKnownPlan:   false if plan name didn't resolve (rule will handle gracefully)
 *
 * @param {object} rawEntry - Raw tool entry from caller input
 * @returns {EnrichedToolEntry}
 */
function normalizeToolEntry(rawEntry) {
  const toolKey = resolveToolKey(rawEntry.tool);
  const planKey = toolKey ? resolvePlanKey(toolKey, rawEntry.plan) : null;
  const planMeta = (toolKey && planKey) ? getPlanMeta(toolKey, planKey) : null;

  const seats = rawEntry.seats ?? 1;

  // Effective spend: prefer user-reported; fall back to computed
  const computedCost    = (toolKey && planKey) ? computePlanCost(toolKey, planKey, seats) : 0;
  const effectiveSpend  = rawEntry.monthlySpend > 0 ? rawEntry.monthlySpend : computedCost;

  // Per-seat cost for utilization math
  const perSeatCost = planMeta?.pricePerSeat
    ?? (effectiveSpend > 0 && seats > 0 ? round(effectiveSpend / seats) : 0);

  return {
    // Raw fields (preserved)
    tool:          rawEntry.tool,
    plan:          rawEntry.plan,
    monthlySpend:  rawEntry.monthlySpend,
    seats,

    // Resolved fields
    toolKey,
    planKey,
    planMeta,
    perSeatCost,
    effectiveSpend,

    // Status flags for pipeline decisions
    isRecognized: toolKey !== null,
    isKnownPlan:  planKey !== null,
  };
}

/**
 * Builds the shared AuditContext object.
 * Every rule receives this as its second argument.
 *
 * Context gives rules access to the global picture — team size, use-case,
 * all sibling tools — enabling cross-aware rule logic without coupling rule
 * files to each other.
 *
 * @param {object} rawInput              - Validated raw input
 * @param {EnrichedToolEntry[]} entries  - All enriched tool entries
 * @returns {AuditContext}
 */
function buildAuditContext(rawInput, entries) {
  const relevantFeatures = USECASE_FEATURE_RELEVANCE[rawInput.useCase] ?? [];

  // Build a fast lookup: toolKey → entry (used in overlap detection)
  const toolIndex = entries.reduce((map, e) => {
    if (e.toolKey) map[e.toolKey] = e;
    return map;
  }, {});

  // All recognized feature tags across all subscribed tools
  const allSubscribedFeatures = entries
    .flatMap((e) => e.planMeta?.features ?? []);

  return {
    teamSize:             rawInput.teamSize,
    useCase:              rawInput.useCase,
    relevantFeatures,
    allEntries:           entries,
    toolIndex,
    allSubscribedFeatures,
    overlapGroups:        OVERLAP_FEATURE_GROUPS,
    usecaseRelevance:     USECASE_FEATURE_RELEVANCE,
  };
}

// ─── Stage 2: Per-Tool Rule Dispatch ─────────────────────────────────────────

/**
 * Dispatches a single enriched entry to its rule module.
 *
 * Isolation guarantee: if a rule throws, we catch it here, log a warning,
 * and continue. The audit report will include a partial result rather than
 * failing entirely. Useful during rule development and for unknown edge cases.
 *
 * @param {EnrichedToolEntry} entry
 * @param {AuditContext}      context
 * @param {string[]}          warnings  - Mutable array for pipeline warnings
 * @returns {Promise<Finding[]>}
 */
async function dispatchToRule(entry, context, warnings) {
  if (!entry.isRecognized) {
    // Unknown tool → generate a passthrough spend entry with no findings
    warnings.push(
      `Tool "${entry.tool}" is not in the rule registry. ` +
      `Spend of ${formatUSD(entry.effectiveSpend)}/mo recorded but not analyzed.`
    );
    return [];
  }

  const ruleFn = RULE_REGISTRY[entry.toolKey];
  if (!ruleFn) {
    // Tool is in pricing.js but has no rule file yet
    warnings.push(
      `Tool "${entry.tool}" has pricing data but no audit rule. ` +
      `Register a rule in rules/${entry.toolKey}.js to enable analysis.`
    );
    return [];
  }

  try {
    const findings = await Promise.resolve(ruleFn(entry, context));
    return Array.isArray(findings) ? findings : [];
  } catch (err) {
    warnings.push(
      `Rule for "${entry.tool}" encountered an error and was skipped: ${err.message}`
    );
    return [];
  }
}

/**
 * Runs all per-tool rules in parallel.
 * Returns a flat array of all findings from all rules.
 *
 * @param {EnrichedToolEntry[]} entries
 * @param {AuditContext}        context
 * @param {string[]}            warnings
 * @returns {Promise<Finding[]>}
 */
async function runPerToolRules(entries, context, warnings) {
  const findingGroups = await Promise.all(
    entries.map((entry) => dispatchToRule(entry, context, warnings))
  );

  return findingGroups.flat();
}

// ─── Stage 3: Cross-Tool Analysis ────────────────────────────────────────────

/**
 * Detects tools that share feature coverage within the same semantic group.
 *
 * Algorithm:
 *   For each overlap group, collect all subscribed tools whose plan includes
 *   at least one tag from that group's featureTags.
 *   If more than one tool covers the same group → overlap finding generated.
 *
 * Savings estimate: cheapest overlapping tool's monthly spend (the one to cut).
 * Confidence scales with number of overlapping tools.
 *
 * @param {EnrichedToolEntry[]} entries
 * @param {AuditContext}        context
 * @returns {Finding[]}
 */
function detectOverlappingTools(entries, context) {
  const findings = [];

  for (const group of OVERLAP_FEATURE_GROUPS) {
    // Find all entries that cover any tag in this group
    const overlapping = entries.filter((e) => {
      if (!e.planMeta?.features) return false;
      return group.featureTags.some((tag) => e.planMeta.features.includes(tag));
    });

    if (overlapping.length < 2) continue;

    // Sort by spend ascending — the cheapest is the "remove" candidate
    const sorted = [...overlapping].sort(
      (a, b) => a.effectiveSpend - b.effectiveSpend
    );

    // The most expensive stays; the cheaper ones are redundant
    const [cheapest, ...dominant] = sorted;
    const dominantTool = dominant[dominant.length - 1];

    const savings     = cheapest.effectiveSpend;
    const confidence  = Math.min(0.6 + overlapping.length * 0.15, 0.95);

    findings.push({
      tool:           cheapest.tool,
      type:           "overlap",
      severity:       group.severity,
      confidence,
      savings,
      currentPlan:    cheapest.plan,
      suggestedPlan:  null,
      overlappingWith: overlapping
        .filter((e) => e.tool !== cheapest.tool)
        .map((e) => e.tool),
      recommendation: [
        `"${cheapest.tool}" overlaps with ${overlapping
          .filter((e) => e.tool !== cheapest.tool)
          .map((e) => `"${e.tool}"`)
          .join(", ")} in the ${group.label} category.`,
        `Consider consolidating on "${dominantTool.tool}" and removing "${cheapest.tool}".`,
        group.savingsHint,
      ].join(" "),
      meta: {
        overlapGroup:     group.groupKey,
        overlapGroupLabel: group.label,
        affectedTools:    overlapping.map((e) => e.tool),
      },
    });
  }

  return findings;
}

/**
 * Detects use-case misalignment — tools whose features don't serve
 * the team's declared use-case.
 *
 * Example: A "coding" team paying for Gemini Workspace features like gmail_ai
 * or docs_ai is unlikely to extract full value from those plan features.
 *
 * @param {EnrichedToolEntry[]} entries
 * @param {AuditContext}        context
 * @returns {Finding[]}
 */
function detectUseCaseMismatches(entries, context) {
  const findings = [];
  const { relevantFeatures, useCase } = context;

  for (const entry of entries) {
    if (!entry.planMeta?.features) continue;

    const planFeatures    = entry.planMeta.features;
    const relevantMatch   = planFeatures.filter((f) => relevantFeatures.includes(f));
    const irrelevantCount = planFeatures.length - relevantMatch.length;

    // Only flag if more than half the plan's features are irrelevant to the use-case
    if (planFeatures.length > 0 && irrelevantCount / planFeatures.length > 0.5) {
      findings.push({
        tool:           entry.tool,
        type:           "plan_mismatch",
        severity:       "medium",
        confidence:     0.65,
        savings:        0,  // Informational — savings come from downgrade rules
        currentPlan:    entry.plan,
        suggestedPlan:  null,
        recommendation: `"${entry.tool}" ${entry.plan} plan includes features primarily outside ` +
          `your "${useCase}" use-case. Review whether a lower tier covers your actual needs.`,
        meta: {
          useCase,
          relevantFeatures:   relevantMatch,
          irrelevantFeatures: planFeatures.filter((f) => !relevantFeatures.includes(f)),
        },
      });
    }
  }

  return findings;
}

/**
 * Runs all cross-tool analysis passes and returns combined findings.
 *
 * Structured as a pipeline of analyzer functions so new cross-tool
 * detectors can be added here without touching per-tool rules.
 *
 * @param {EnrichedToolEntry[]} entries
 * @param {AuditContext}        context
 * @returns {Finding[]}
 */
function runCrossToolAnalysis(entries, context) {
  return [
    ...detectOverlappingTools(entries, context),
    ...detectUseCaseMismatches(entries, context),
  ];
}

// ─── Stage 4: Compute Metrics ─────────────────────────────────────────────────

/**
 * Builds the spend breakdown enriched with per-tool savings context.
 * Merges the raw spend breakdown with per-tool finding data.
 *
 * @param {EnrichedToolEntry[]} entries
 * @param {Finding[]}           allFindings
 * @returns {Record<string, ToolSpendSummary>}
 */
function buildEnrichedSpendBreakdown(entries, allFindings) {
  const rawBreakdown   = buildSpendBreakdown(entries);
  const findingsByTool = groupFindingsByTool(allFindings);

  return Object.entries(rawBreakdown).reduce((map, [toolName, spend]) => {
    const toolFindings  = findingsByTool[toolName] ?? [];
    const toolSavings   = toolFindings.reduce((s, f) => s + (f.savings ?? 0), 0);

    map[toolName] = {
      ...spend,
      annualSpend:           annualizeSavings(spend.monthlySpend),
      findingCount:          toolFindings.length,
      potentialMonthlySavings: round(toolSavings),
      potentialAnnualSavings:  round(annualizeSavings(toolSavings)),
    };

    return map;
  }, {});
}

// ─── Stage 5: Executive Summary ───────────────────────────────────────────────

/**
 * Generates a structured executive summary from computed audit data.
 *
 * This is the "above the fold" data in the report — what a CFO or
 * engineering manager sees first. Copy is generated programmatically
 * using audit metrics, not hardcoded strings.
 *
 * @param {object} params
 * @returns {ExecutiveSummary}
 */
function generateExecutiveSummary({
  teamSize,
  useCase,
  toolCount,
  savings,
  grade,
  findingSummary,
  warnings,
}) {
  const { grade: letterGrade, label: gradeLabel } = grade;
  const { estimatedMonthlySavings, estimatedAnnualSavings, savingsPercentage, roiMultiple } = savings;

  // Headline copy — varies by waste grade
  const headlines = {
    A: `Your AI stack is well-optimized. Minor refinements could yield ${formatUSD(estimatedMonthlySavings)}/mo.`,
    B: `Your AI stack is in good shape with ${formatUSD(estimatedMonthlySavings)}/mo in identified savings.`,
    C: `Your AI stack has actionable inefficiencies. ${formatUSD(estimatedMonthlySavings)}/mo in savings identified.`,
    D: `Significant AI spend waste detected. ${formatUSD(estimatedAnnualSavings)}/yr in savings available.`,
    F: `Critical AI spend waste detected. Immediate action could save ${formatUSD(estimatedAnnualSavings)}/yr.`,
  };

  // Finding summary sentences
  const findingLines = [];
  if (findingSummary.overlaps > 0) {
    findingLines.push(
      `${findingSummary.overlaps} overlapping tool${findingSummary.overlaps > 1 ? "s" : ""} detected.`
    );
  }
  if (findingSummary.downgrades > 0) {
    findingLines.push(
      `${findingSummary.downgrades} plan downgrade${findingSummary.downgrades > 1 ? "s" : ""} recommended.`
    );
  }
  if (findingSummary.seatWaste > 0) {
    findingLines.push(
      `${findingSummary.seatWaste} seat waste issue${findingSummary.seatWaste > 1 ? "s" : ""} identified.`
    );
  }
  if (findingSummary.removals > 0) {
    findingLines.push(
      `${findingSummary.removals} tool${findingSummary.removals > 1 ? "s" : ""} flagged for removal.`
    );
  }

  return {
    headline:         headlines[letterGrade] ?? headlines.C,
    grade:            letterGrade,
    gradeLabel,
    teamSize,
    useCase,
    toolsAnalyzed:    toolCount,
    totalFindings:    findingSummary.total,
    findingBreakdown: findingLines,
    keyMetrics: {
      monthlySavings:  formatUSD(estimatedMonthlySavings),
      annualSavings:   formatUSD(estimatedAnnualSavings),
      savingsPct:      `${savingsPercentage}%`,
      roiMultiple:     `${roiMultiple}x`,
    },
    hasWarnings:      warnings.length > 0,
  };
}

// ─── Report Builder ───────────────────────────────────────────────────────────

/**
 * Assembles the final AuditReport from all pipeline outputs.
 *
 * @param {object} params
 * @returns {AuditReport}
 */
function assembleReport({
  rawInput,
  entries,
  allFindings,
  savings,
  spendBreakdown,
  grade,
  wasteScore,
  findingSummary,
  recommendations,
  warnings,
}) {
  const executiveSummary = generateExecutiveSummary({
    teamSize:       rawInput.teamSize,
    useCase:        rawInput.useCase,
    toolCount:      entries.length,
    savings,
    grade,
    findingSummary,
    warnings,
  });

  return {
    // ── Report identity ─────────────────────────────────────────────
    meta: {
      engineVersion:  ENGINE_VERSION,
      generatedAt:    new Date().toISOString(),
      auditId:        generateAuditId(),
    },

    // ── Top-level summary (backward-compatible output contract) ──────
    totalMonthlySpend:  savings.currentMonthlySpend,
    totalAnnualSpend:   savings.currentAnnualSpend,
    estimatedSavings:   savings.estimatedMonthlySavings,
    annualSavings:      savings.estimatedAnnualSavings,
    optimizedSpend: {
      monthly: savings.optimizedMonthlySpend,
      annual:  savings.optimizedAnnualSpend,
    },
    savingsPercentage: savings.savingsPercentage,
    roiMultiple:       savings.roiMultiple,

    // ── Audit scoring ────────────────────────────────────────────────
    wasteScore,
    grade: {
      letter:  grade.grade,
      label:   grade.label,
      color:   grade.color,
      score:   grade.score,
    },

    // ── Executive summary ────────────────────────────────────────────
    executiveSummary,

    // ── Recommendations (sorted by savings impact) ───────────────────
    recommendations,

    // ── Findings (full detail for advanced consumers) ────────────────
    findings: allFindings,

    // ── Per-tool breakdown ───────────────────────────────────────────
    toolBreakdown: spendBreakdown,

    // ── Finding type counts ──────────────────────────────────────────
    findingSummary,

    // ── Input echo (for report rendering / caching) ──────────────────
    input: {
      teamSize: rawInput.teamSize,
      useCase:  rawInput.useCase,
      tools:    rawInput.tools,
    },

    // ── Pipeline warnings (non-fatal issues) ─────────────────────────
    warnings,
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Generates a lightweight audit ID for tracing and caching.
 * Not cryptographically secure — used for correlation only.
 *
 * @returns {string} e.g. "audit_1721234567890_x4f2k"
 */
function generateAuditId() {
  const ts     = Date.now();
  const suffix = Math.random().toString(36).slice(2, 7);
  return `audit_${ts}_${suffix}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * runAudit — Primary entry point for the AI Spend Audit Engine.
 *
 * Executes the full 5-stage audit pipeline and returns a structured
 * AuditReport. Throws AuditValidationError for invalid input.
 * Never throws for rule failures — those are isolated to warnings[].
 *
 * @param {AuditInput}   rawInput  - Caller-supplied audit input
 * @returns {Promise<AuditReport>} Fully computed audit report
 * @throws {AuditValidationError}  On invalid input schema
 *
 * @example
 * const report = await runAudit({
 *   teamSize: 10,
 *   useCase: "coding",
 *   tools: [
 *     { tool: "ChatGPT", plan: "Team",     monthlySpend: 200, seats: 8 },
 *     { tool: "Cursor",  plan: "Business", monthlySpend: 400, seats: 10 },
 *   ],
 * });
 */
export async function runAudit(rawInput) {
  const warnings = [];

  // ── Stage 0: Validate ─────────────────────────────────────────────
  validateInput(rawInput);

  // ── Stage 1: Normalize ────────────────────────────────────────────
  const entries = rawInput.tools.map(normalizeToolEntry);
  const context = buildAuditContext(rawInput, entries);

  // ── Stage 2: Per-Tool Rules ───────────────────────────────────────
  const perToolFindings = await runPerToolRules(entries, context, warnings);

  // ── Stage 3: Cross-Tool Analysis ─────────────────────────────────
  const crossToolFindings = runCrossToolAnalysis(entries, context);

  // Merge all findings
  const allFindings = [...perToolFindings, ...crossToolFindings];

  // ── Stage 4: Compute Metrics ──────────────────────────────────────
  const totalMonthlySpend = computeTotalMonthlySpend(entries);
  const savings           = buildSavingsSummary({ totalMonthlySpend, findings: allFindings });
  const wasteScore        = computeWasteScore(allFindings);
  const grade             = computeAuditGrade(wasteScore);
  const findingSummary    = summarizeFindingTypes(allFindings);
  const spendBreakdown    = buildEnrichedSpendBreakdown(entries, allFindings);
  const recommendations   = buildRecommendations(allFindings);

  // ── Stage 5: Assemble Report ──────────────────────────────────────
  return assembleReport({
    rawInput,
    entries,
    allFindings,
    savings,
    spendBreakdown,
    grade,
    wasteScore,
    findingSummary,
    recommendations,
    warnings,
  });
}

/**
 * getEngineVersion — Returns the current audit engine version.
 * Useful for health check endpoints and cache validation.
 *
 * @returns {string}
 */
export function getEngineVersion() {
  return ENGINE_VERSION;
}

/**
 * getSupportedTools — Returns all tool keys currently in the rule registry.
 * Useful for UI dropdowns and input validation on the frontend.
 *
 * @returns {string[]}
 */
export function getSupportedTools() {
  return Object.keys(RULE_REGISTRY);
}

/**
 * getSupportedUseCases — Returns all valid use-case values.
 *
 * @returns {string[]}
 */
export function getSupportedUseCases() {
  return Object.keys(USECASE_FEATURE_RELEVANCE);
}

// ─── JSDoc Type Definitions ───────────────────────────────────────────────────

/**
 * @typedef {object} AuditInput
 * @property {number}         teamSize            - Total headcount
 * @property {string}         useCase             - Primary use-case key
 * @property {RawToolEntry[]} tools               - Array of tool subscriptions
 */

/**
 * @typedef {object} RawToolEntry
 * @property {string} tool          - Tool name (e.g., "ChatGPT")
 * @property {string} plan          - Plan name (e.g., "Team")
 * @property {number} monthlySpend  - Reported monthly spend in USD
 * @property {number} [seats]       - Licensed seat count (default: 1)
 */

/**
 * @typedef {object} EnrichedToolEntry
 * @property {string}      tool
 * @property {string}      plan
 * @property {number}      monthlySpend
 * @property {number}      seats
 * @property {string|null} toolKey
 * @property {string|null} planKey
 * @property {object|null} planMeta
 * @property {number}      perSeatCost
 * @property {number}      effectiveSpend
 * @property {boolean}     isRecognized
 * @property {boolean}     isKnownPlan
 */

/**
 * @typedef {object} AuditContext
 * @property {number}                teamSize
 * @property {string}                useCase
 * @property {string[]}              relevantFeatures
 * @property {EnrichedToolEntry[]}   allEntries
 * @property {Record<string,object>} toolIndex
 * @property {string[]}              allSubscribedFeatures
 * @property {object[]}              overlapGroups
 * @property {object}                usecaseRelevance
 */

/**
 * @typedef {object} Finding
 * @property {string}      tool
 * @property {string}      type
 * @property {string}      severity
 * @property {number}      confidence
 * @property {number}      savings
 * @property {string|null} currentPlan
 * @property {string|null} suggestedPlan
 * @property {string}      recommendation
 * @property {object}      [meta]
 */

/**
 * @typedef {object} AuditReport
 * @property {object}   meta
 * @property {number}   totalMonthlySpend
 * @property {number}   totalAnnualSpend
 * @property {number}   estimatedSavings
 * @property {number}   annualSavings
 * @property {object}   optimizedSpend
 * @property {number}   savingsPercentage
 * @property {number}   roiMultiple
 * @property {number}   wasteScore
 * @property {object}   grade
 * @property {object}   executiveSummary
 * @property {object[]} recommendations
 * @property {object[]} findings
 * @property {object}   toolBreakdown
 * @property {object}   findingSummary
 * @property {object}   input
 * @property {string[]} warnings
 */