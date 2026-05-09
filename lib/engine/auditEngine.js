/**
 * lib/engine/auditEngine.js
 *
 * AI Spend Audit — Core Calculation Engine
 *
 * Architecture: Pure functional pipeline. No side effects. No shared state.
 * Every stage is independently testable and replaceable.
 *
 * Pipeline:
 *   normalizeInput → calculateSpend → detectOverlaps → detectUnderutilization
 *   → generateRecommendations → calculateWasteScore → calculateAuditScore
 *   → buildSummary → structured result
 *
 * Public API:
 *   runAudit(formData) → AuditResult
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Functional categories for overlap detection.
 * Each tool maps to a canonical category. When ≥2 tools share a category,
 * an OVERLAP recommendation is generated.
 */
const TOOL_CATEGORIES = {
    // Coding assistants
    "GitHub Copilot": "coding",
    "Cursor": "coding",
    "Codeium": "coding",
    "Tabnine": "coding",
    "Amazon CodeWhisperer": "coding",
    "Replit AI": "coding",

    // General-purpose chat / reasoning
    "ChatGPT": "general_ai",
    "Claude": "general_ai",
    "Gemini": "general_ai",
    "Microsoft Copilot": "general_ai",
    "Perplexity": "general_ai",
    "Grok": "general_ai",

    // AI writing
    "Jasper": "ai_writing",
    "Copy.ai": "ai_writing",
    "Writesonic": "ai_writing",
    "Notion AI": "ai_writing",
    "Grammarly": "ai_writing",

    // Image / design generation
    "Midjourney": "image_gen",
    "DALL·E": "image_gen",
    "Stable Diffusion": "image_gen",
    "Adobe Firefly": "image_gen",
    "Canva AI": "image_gen",

    // Data / analytics AI
    "Julius AI": "data_analytics",
    "Akkio": "data_analytics",
    "Obviously AI": "data_analytics",

    // Search / research
    "Perplexity Pro": "ai_search",
    "You.com": "ai_search",
    "Kagi": "ai_search",
};

/**
 * Plans considered "enterprise-tier" for mismatch detection.
 * Enterprise plans on small teams are a reliable waste signal.
 */
const ENTERPRISE_PLANS = new Set([
    "enterprise",
    "enterprise plus",
    "business",
    "team",
    "pro team",
    "teams",
]);

/**
 * Team size below which an enterprise plan is flagged as a mismatch.
 */
const ENTERPRISE_TEAM_THRESHOLD = 10;

/**
 * Seat utilization ratio below which seat waste is flagged.
 * If seats > teamSize × this multiplier, excess seats are flagged.
 */
const SEAT_UTILIZATION_THRESHOLD = 1.25;

/**
 * Tool-to-team-size ratio above which consolidation is recommended.
 * e.g. 8 tools for a team of 5 is flagged; 3 tools for a team of 20 is fine.
 */
const TOOL_DENSITY_THRESHOLD = 0.6;

/** Waste dimension weights — must sum to 1.0 */
const WASTE_WEIGHTS = {
    overlap: 0.35,
    seatWaste: 0.30,
    planMismatch: 0.20,
    toolDensity: 0.15,
};

/** Audit score grade bands */
const SCORE_GRADES = [
    { min: 90, grade: "Excellent", label: "Lean & Optimized" },
    { min: 75, grade: "Good", label: "Minor Opportunities" },
    { min: 60, grade: "Fair", label: "Savings Available" },
    { min: 40, grade: "Poor", label: "Significant Waste" },
    { min: 0, grade: "Critical", label: "Immediate Action Required" },
];

// ─── Stage 1: Normalize Input ─────────────────────────────────────────────────

/**
 * Sanitizes and normalizes raw form data into a consistent internal shape.
 * Coerces types, fills defaults, and lowercases plan names for comparison.
 *
 * @param {object} raw - Raw form submission data.
 * @returns {NormalizedInput}
 */
function normalizeInput(raw) {
    const teamSize = Math.max(1, parseInt(raw.teamSize, 10) || 1);

    const tools = (Array.isArray(raw.tools) ? raw.tools : []).map((t, idx) => ({
        id: t.id || `tool_${idx}`,
        name: (t.tool || t.name || "Unknown Tool").trim(),
        plan: (t.plan || "Unknown").trim(),
        planNormalized: (t.plan || "").toLowerCase().trim(),
        monthlySpend: Math.max(0, parseFloat(t.monthlySpend) || 0),
        seats: Math.max(1, parseInt(t.seats, 10) || 1),
        category: TOOL_CATEGORIES[t.tool] || TOOL_CATEGORIES[t.name] || "other",
    }));

    return {
        teamSize,
        useCase: (raw.useCase || "general").trim(),
        tools,
    };
}

// ─── Stage 2: Calculate Spend ─────────────────────────────────────────────────

/**
 * Computes total monthly and annual spend across all tools.
 * Each tool's effective cost = monthlySpend × seats.
 *
 * @param {NormalizedInput} input
 * @returns {SpendData}
 */
function calculateSpend(input) {
    const toolCosts = input.tools.map((tool) => ({
        ...tool,
        effectiveMonthlyCost: tool.monthlySpend * tool.seats,
        effectiveAnnualCost: tool.monthlySpend * tool.seats * 12,
    }));

    const totalMonthlySpend = toolCosts.reduce(
        (sum, t) => sum + t.effectiveMonthlyCost,
        0
    );

    return {
        toolCosts,
        totalMonthlySpend: round2(totalMonthlySpend),
        annualSpend: round2(totalMonthlySpend * 12),
    };
}

// ─── Stage 3: Detect Overlapping Tools ───────────────────────────────────────

/**
 * Groups tools by functional category and flags groups with ≥2 tools
 * as overlaps — each group represents redundant spend.
 *
 * @param {EnrichedTool[]} toolCosts
 * @returns {OverlapGroup[]}
 */
function detectOverlaps(toolCosts) {
    const categoryMap = {};

    for (const tool of toolCosts) {
        if (tool.category === "other") continue;
        if (!categoryMap[tool.category]) categoryMap[tool.category] = [];
        categoryMap[tool.category].push(tool);
    }

    return Object.entries(categoryMap)
        .filter(([, tools]) => tools.length >= 2)
        .map(([category, tools]) => ({
            category,
            tools,
            // Recommend keeping the cheapest tool; flag rest as redundant
            redundantCost: tools
                .slice()
                .sort((a, b) => a.effectiveMonthlyCost - b.effectiveMonthlyCost)
                .slice(0, -1) // all but the cheapest
                .reduce((sum, t) => sum + t.effectiveMonthlyCost, 0),
        }));
}

// ─── Stage 4: Detect Underutilization ────────────────────────────────────────

/**
 * Detects seat waste (seats >> teamSize) and plan mismatches
 * (enterprise plan on a small team).
 *
 * @param {EnrichedTool[]} toolCosts
 * @param {number} teamSize
 * @returns {UnderutilizationIssue[]}
 */
function detectUnderutilization(toolCosts, teamSize) {
    const issues = [];

    for (const tool of toolCosts) {
        const excessSeats = tool.seats - Math.ceil(teamSize * SEAT_UTILIZATION_THRESHOLD);

        // Seat waste: more seats than team could reasonably use
        if (excessSeats > 0) {
            const moneySaved = round2(excessSeats * tool.monthlySpend);
            issues.push({
                type: "SEAT_WASTE",
                tool,
                excessSeats,
                estimatedMonthlySaving: moneySaved,
                estimatedAnnualSaving: round2(moneySaved * 12),
            });
        }

        // Plan mismatch: enterprise-tier plan on a sub-threshold team
        if (
            ENTERPRISE_PLANS.has(tool.planNormalized) &&
            teamSize < ENTERPRISE_TEAM_THRESHOLD
        ) {
            // Estimate ~30% saving from downgrading to individual/pro plan
            const saving = round2(tool.effectiveMonthlyCost * 0.3);
            issues.push({
                type: "PLAN_MISMATCH",
                tool,
                estimatedMonthlySaving: saving,
                estimatedAnnualSaving: round2(saving * 12),
            });
        }
    }

    return issues;
}

// ─── Stage 5: Generate Recommendations ───────────────────────────────────────

/**
 * Converts overlap groups and underutilization issues into structured
 * recommendation objects consumable by RecommendationCard components.
 *
 * Recommendations are sorted by estimated annual saving (highest first).
 *
 * @param {OverlapGroup[]} overlaps
 * @param {UnderutilizationIssue[]} underutilizationIssues
 * @param {NormalizedInput} input
 * @param {SpendData} spendData
 * @returns {Recommendation[]}
 */
function generateRecommendations(overlaps, underutilizationIssues, input, spendData) {
    const recs = [];

    // ── Overlap Recommendations ──────────────────────────────────────────────
    for (const group of overlaps) {
        const cheapest = group.tools
            .slice()
            .sort((a, b) => a.effectiveMonthlyCost - b.effectiveMonthlyCost)
            .at(-1); // the one to keep

        const redundantNames = group.tools
            .filter((t) => t.id !== cheapest.id)
            .map((t) => t.name);

        recs.push({
            id: `overlap_${group.category}`,
            type: "OVERLAP",
            priority: savingToPriority(group.redundantCost * 12),
            title: `Consolidate ${formatCategory(group.category)} Tools`,
            description: `You're paying for ${group.tools.length} overlapping ${formatCategory(group.category).toLowerCase()} tools. Keep ${cheapest.name} and remove ${listify(redundantNames)} to eliminate redundant spend.`,
            estimatedMonthlySaving: round2(group.redundantCost),
            estimatedAnnualSaving: round2(group.redundantCost * 12),
            affectedTools: group.tools.map((t) => t.name),
            action: "Remove duplicate subscriptions",
        });
    }

    // ── Underutilization Recommendations ─────────────────────────────────────
    for (const issue of underutilizationIssues) {
        if (issue.type === "SEAT_WASTE") {
            recs.push({
                id: `seat_waste_${issue.tool.id}`,
                type: "SEAT_WASTE",
                priority: savingToPriority(issue.estimatedAnnualSaving),
                title: `Reduce ${issue.tool.name} Seats`,
                description: `You have ${issue.tool.seats} seats for a team of ${input.teamSize}. Removing ${issue.excessSeats} unused seat${issue.excessSeats > 1 ? "s" : ""} saves ~$${issue.estimatedMonthlySaving}/mo without impacting coverage.`,
                estimatedMonthlySaving: issue.estimatedMonthlySaving,
                estimatedAnnualSaving: issue.estimatedAnnualSaving,
                affectedTools: [issue.tool.name],
                action: "Adjust seat count in billing settings",
            });
        }

        if (issue.type === "PLAN_MISMATCH") {
            recs.push({
                id: `plan_mismatch_${issue.tool.id}`,
                type: "PLAN_MISMATCH",
                priority: savingToPriority(issue.estimatedAnnualSaving),
                title: `Downgrade ${issue.tool.name} Plan`,
                description: `Your team of ${input.teamSize} is on a ${issue.tool.plan} plan designed for larger organizations. A Pro or individual plan likely covers your actual usage at ~30% lower cost.`,
                estimatedMonthlySaving: issue.estimatedMonthlySaving,
                estimatedAnnualSaving: issue.estimatedAnnualSaving,
                affectedTools: [issue.tool.name],
                action: "Review plan options at next billing cycle",
            });
        }
    }

    // ── Tool Density Recommendation ───────────────────────────────────────────
    const toolDensityRatio = input.tools.length / input.teamSize;
    if (toolDensityRatio > TOOL_DENSITY_THRESHOLD && input.tools.length >= 4) {
        const densitySaving = round2(spendData.totalMonthlySpend * 0.15);
        recs.push({
            id: "tool_density",
            type: "CONSOLIDATION",
            priority: "medium",
            title: "Audit Tool Stack for Redundancy",
            description: `With ${input.tools.length} AI tools for a team of ${input.teamSize}, your stack may have significant overlap. A structured consolidation audit could reduce spend by an estimated 15–25%.`,
            estimatedMonthlySaving: densitySaving,
            estimatedAnnualSaving: round2(densitySaving * 12),
            affectedTools: input.tools.map((t) => t.name),
            action: "Schedule a quarterly tool stack review",
        });
    }

    // Sort by annual saving descending — highest impact first
    return recs.sort((a, b) => b.estimatedAnnualSaving - a.estimatedAnnualSaving);
}

// ─── Stage 6: Calculate Waste Score ──────────────────────────────────────────

/**
 * Computes a 0–100 waste score from four weighted dimensions.
 * Higher = more waste. Each dimension is capped before weighting
 * to prevent outliers from dominating.
 *
 * @param {OverlapGroup[]} overlaps
 * @param {UnderutilizationIssue[]} underutilizationIssues
 * @param {NormalizedInput} input
 * @param {SpendData} spendData
 * @returns {number} 0–100
 */
function calculateWasteScore(overlaps, underutilizationIssues, input, spendData) {
    // Dimension 1: Overlap waste (0–100)
    const overlapWasteRaw = overlaps.length > 0
        ? Math.min(100, (overlaps.length / input.tools.length) * 200)
        : 0;

    // Dimension 2: Seat waste (0–100)
    const seatWasteIssues = underutilizationIssues.filter((i) => i.type === "SEAT_WASTE");
    const totalExcessSeatCost = seatWasteIssues.reduce(
        (sum, i) => sum + i.estimatedMonthlySaving,
        0
    );
    const seatWasteRaw = spendData.totalMonthlySpend > 0
        ? Math.min(100, (totalExcessSeatCost / spendData.totalMonthlySpend) * 100)
        : 0;

    // Dimension 3: Plan mismatch (0–100)
    const planMismatchCount = underutilizationIssues.filter(
        (i) => i.type === "PLAN_MISMATCH"
    ).length;
    const planMismatchRaw = Math.min(100, (planMismatchCount / Math.max(1, input.tools.length)) * 150);

    // Dimension 4: Tool density (0–100)
    const densityRatio = input.tools.length / input.teamSize;
    const toolDensityRaw = Math.min(100, Math.max(0, (densityRatio - 0.2) * 80));

    const wasteScore =
        overlapWasteRaw * WASTE_WEIGHTS.overlap +
        seatWasteRaw * WASTE_WEIGHTS.seatWaste +
        planMismatchRaw * WASTE_WEIGHTS.planMismatch +
        toolDensityRaw * WASTE_WEIGHTS.toolDensity;

    return Math.min(100, Math.max(0, Math.round(wasteScore)));
}

// ─── Stage 7: Calculate Audit Score ──────────────────────────────────────────

/**
 * Converts waste score into a 0–100 health score with a grade label.
 * Includes a small baseline bonus (5 pts) for completing the audit at all.
 *
 * @param {number} wasteScore
 * @returns {{ score: number, grade: string, label: string }}
 */
function calculateAuditScore(wasteScore) {
    const rawScore = Math.min(100, Math.max(0, 100 - wasteScore + 5));
    const score = Math.round(rawScore);
    const band = SCORE_GRADES.find((b) => score >= b.min) || SCORE_GRADES.at(-1);

    return {
        score,
        grade: band.grade,
        label: band.label,
    };
}

// ─── Stage 8: Build Summary ───────────────────────────────────────────────────

/**
 * Generates a structured narrative summary for the AISummary component.
 * Strings are intentionally written as data, not prose templates,
 * so the AISummary component can render them with its own styling.
 *
 * @param {object} params
 * @returns {AuditSummary}
 */
function buildSummary({
    input,
    spendData,
    overlaps,
    underutilizationIssues,
    recommendations,
    wasteScore,
    auditScore,
    estimatedSavings,
}) {
    const savingsPct = spendData.totalMonthlySpend > 0
        ? Math.round((estimatedSavings.monthly / spendData.totalMonthlySpend) * 100)
        : 0;

    const topRec = recommendations[0];

    const headline =
        wasteScore >= 60
            ? `Your AI stack has significant optimization opportunities — up to $${estimatedSavings.annual.toLocaleString()} in annual savings identified.`
            : wasteScore >= 30
                ? `Your AI spend is above average efficiency, with ~$${estimatedSavings.annual.toLocaleString()} in recoverable annual costs.`
                : `Your AI stack is well-optimized. Minor tuning could recover ~$${estimatedSavings.annual.toLocaleString()} annually.`;

    const insights = [
        overlaps.length > 0
            ? `${overlaps.length} overlapping tool categor${overlaps.length > 1 ? "ies" : "y"} detected across your ${input.tools.length}-tool stack.`
            : null,
        underutilizationIssues.some((i) => i.type === "SEAT_WASTE")
            ? `Excess seat allocations found — you're paying for capacity your team of ${input.teamSize} isn't using.`
            : null,
        underutilizationIssues.some((i) => i.type === "PLAN_MISMATCH")
            ? `Enterprise-tier plans detected that are sized beyond your current team footprint.`
            : null,
        savingsPct > 0
            ? `Implementing all recommendations could reduce your AI spend by ~${savingsPct}%.`
            : null,
    ].filter(Boolean);

    const topAction = topRec
        ? `Highest-impact action: ${topRec.title} — saves $${topRec.estimatedAnnualSaving.toLocaleString()}/yr.`
        : "No critical actions required at this time.";

    return {
        headline,
        insights,
        topAction,
        scoreContext: `Audit score of ${auditScore.score}/100 (${auditScore.grade}) based on ${input.tools.length} tools, ${input.teamSize} team members, and $${spendData.totalMonthlySpend.toLocaleString()}/mo total spend.`,
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs the full audit pipeline on raw form data.
 *
 * @param {object} formData - Raw audit form submission.
 * @returns {AuditResult}
 *
 * @example
 * const result = runAudit({
 *   teamSize: 12,
 *   useCase: "coding",
 *   tools: [
 *     { tool: "ChatGPT", plan: "Team", monthlySpend: 30, seats: 5 },
 *     { tool: "Claude",  plan: "Pro",  monthlySpend: 20, seats: 5 },
 *   ]
 * });
 */
export function runAudit(formData) {
    // ── Pipeline ────────────────────────────────────────────────────────────
    const input = normalizeInput(formData);
    const spendData = calculateSpend(input);
    const overlaps = detectOverlaps(spendData.toolCosts);
    const underutil = detectUnderutilization(spendData.toolCosts, input.teamSize);
    const recs = generateRecommendations(overlaps, underutil, input, spendData);
    const wasteScore = calculateWasteScore(overlaps, underutil, input, spendData);
    const auditScore = calculateAuditScore(wasteScore);

    // ── Aggregate savings from all recommendations ──────────────────────────
    const totalMonthlySaving = round2(
        recs.reduce((sum, r) => sum + r.estimatedMonthlySaving, 0)
    );
    const estimatedSavings = {
        monthly: totalMonthlySaving,
        annual: round2(totalMonthlySaving * 12),
    };

    const summary = buildSummary({
        input,
        spendData,
        overlaps,
        underutilizationIssues: underutil,
        recommendations: recs,
        wasteScore,
        auditScore,
        estimatedSavings,
    });

    // ── Result ──────────────────────────────────────────────────────────────
    return {
        summary: {
            totalMonthlySpend: spendData.totalMonthlySpend,
            estimatedSavings: estimatedSavings.monthly,
            annualSavings: estimatedSavings.annual,
            wastePercentage: wasteScore,
            auditScore: auditScore.score,
            auditGrade: auditScore.grade,
        },

        aiInsights: summary,

        recommendations: recs,

        metrics: spendData.toolCosts.map((t) => ({
            id: t.id,
            name: t.name,
            plan: t.plan,
            category: t.category,
            seats: t.seats,
            monthlySpend: t.monthlySpend,
            effectiveMonthlyCost: t.effectiveMonthlyCost,
            effectiveAnnualCost: t.effectiveAnnualCost,
        })),

        meta: {
            toolCount: input.tools.length,
            teamSize: input.teamSize,
            useCase: input.useCase,
            overlapCount: overlaps.length,
            underutilizationCount: underutil.length,
            recommendationCount: recs.length,
            generatedAt: new Date().toISOString(),
        },
    };
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

/** Round to 2 decimal places */
function round2(n) {
    return Math.round(n * 100) / 100;
}

/**
 * Maps an annual saving amount to a priority tier.
 * Priority drives visual treatment in RecommendationCard.
 */
function savingToPriority(annualSaving) {
    if (annualSaving >= 2000) return "high";
    if (annualSaving >= 600) return "medium";
    return "low";
}

/** Converts a snake_case category key to a readable label */
function formatCategory(category) {
    return {
        coding: "Coding Assistant",
        general_ai: "General AI",
        ai_writing: "AI Writing",
        image_gen: "Image Generation",
        data_analytics: "Data Analytics",
        ai_search: "AI Search",
    }[category] || category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Formats an array of strings as a natural English list */
function listify(arr) {
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    return `${arr.slice(0, -1).join(", ")}, and ${arr.at(-1)}`;
}