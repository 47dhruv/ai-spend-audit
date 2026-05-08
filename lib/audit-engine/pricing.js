// lib/audit-engine/pricing.js

/**
 * PRICING REGISTRY — Single source of truth for all AI tool plan data.
 *
 * Design principles:
 * - Plans are keyed by normalized tool name + plan tier
 * - Each plan entry carries both per-seat AND flat pricing signals
 * - `tier` is an ordinal rank — used by rules to reason about downgrades
 * - `features` are semantic tags — used by overlap detection
 * - All prices in USD/month
 *
 * To add a new tool: add a new top-level key with the same schema.
 * To update pricing: edit values here — no rule files need to change.
 */

export const PRICING = {

  // ─── ChatGPT (OpenAI Consumer) ──────────────────────────────────────────────
  chatgpt: {
    free: {
      planKey:      "free",
      displayName:  "Free",
      tier:         0,
      pricePerSeat: 0,
      flatMonthly:  0,
      seats:        "unlimited",
      features:     ["llm_chat", "gpt4o_limited"],
      limits: {
        messagesPerDay: 10,
        advancedModel:  false,
      },
    },
    plus: {
      planKey:      "plus",
      displayName:  "Plus",
      tier:         1,
      pricePerSeat: 20,
      flatMonthly:  20,      // single-user product
      seats:        1,
      features:     ["llm_chat", "gpt4o", "code_interpreter", "plugins", "dalle"],
      limits: {
        messagesPerDay: null, // unlimited
        advancedModel:  true,
      },
    },
    team: {
      planKey:      "team",
      displayName:  "Team",
      tier:         2,
      pricePerSeat: 25,      // billed monthly; $30/seat annual
      flatMonthly:  null,    // seat-based
      seats:        "variable",
      minimumSeats: 2,
      features:     [
        "llm_chat", "gpt4o", "code_interpreter", "plugins", "dalle",
        "admin_console", "team_workspace", "higher_limits",
      ],
      limits: {
        messagesPerDay: null,
        advancedModel:  true,
      },
    },
    enterprise: {
      planKey:      "enterprise",
      displayName:  "Enterprise",
      tier:         3,
      pricePerSeat: 60,      // estimated — negotiated, not public
      flatMonthly:  null,
      seats:        "variable",
      minimumSeats: 150,
      features:     [
        "llm_chat", "gpt4o", "code_interpreter", "plugins", "dalle",
        "admin_console", "team_workspace", "sso", "audit_logs",
        "custom_data_retention", "priority_support",
      ],
      limits: {
        messagesPerDay: null,
        advancedModel:  true,
      },
    },
  },

  // ─── Claude (Anthropic) ─────────────────────────────────────────────────────
  claude: {
    free: {
      planKey:      "free",
      displayName:  "Free",
      tier:         0,
      pricePerSeat: 0,
      flatMonthly:  0,
      seats:        1,
      features:     ["llm_chat", "claude3_limited"],
      limits: {
        messagesPerDay: 15,
        advancedModel:  false,
      },
    },
    pro: {
      planKey:      "pro",
      displayName:  "Pro",
      tier:         1,
      pricePerSeat: 20,
      flatMonthly:  20,
      seats:        1,
      features:     ["llm_chat", "claude3_opus", "extended_context", "priority_access", "projects"],
      limits: {
        messagesPerDay: null,
        advancedModel:  true,
      },
    },
    team: {
      planKey:      "team",
      displayName:  "Team",
      tier:         2,
      pricePerSeat: 30,      // $25/seat annual
      flatMonthly:  null,
      seats:        "variable",
      minimumSeats: 5,
      features:     [
        "llm_chat", "claude3_opus", "extended_context", "priority_access",
        "projects", "admin_console", "team_billing", "higher_limits",
      ],
      limits: {
        messagesPerDay: null,
        advancedModel:  true,
      },
    },
    enterprise: {
      planKey:      "enterprise",
      displayName:  "Enterprise",
      tier:         3,
      pricePerSeat: 50,      // estimated — negotiated
      flatMonthly:  null,
      seats:        "variable",
      minimumSeats: 1,
      features:     [
        "llm_chat", "claude3_opus", "extended_context", "priority_access",
        "projects", "admin_console", "sso", "audit_logs", "custom_retention",
        "dedicated_support", "api_access",
      ],
      limits: {
        messagesPerDay: null,
        advancedModel:  true,
      },
    },
  },

  // ─── Cursor ──────────────────────────────────────────────────────────────────
  cursor: {
    free: {
      planKey:      "free",
      displayName:  "Hobby",
      tier:         0,
      pricePerSeat: 0,
      flatMonthly:  0,
      seats:        1,
      features:     ["ai_code_editor", "gpt4o_limited", "autocomplete_limited"],
      limits: {
        fastRequests:   50,
        slowRequests:   200,
        advancedModel:  false,
      },
    },
    pro: {
      planKey:      "pro",
      displayName:  "Pro",
      tier:         1,
      pricePerSeat: 20,
      flatMonthly:  20,
      seats:        1,
      features:     [
        "ai_code_editor", "gpt4o", "claude3_opus", "autocomplete_unlimited",
        "codebase_indexing", "fast_requests",
      ],
      limits: {
        fastRequests:   500,
        slowRequests:   null,
        advancedModel:  true,
      },
    },
    business: {
      planKey:      "business",
      displayName:  "Business",
      tier:         2,
      pricePerSeat: 40,
      flatMonthly:  null,
      seats:        "variable",
      minimumSeats: 1,
      features:     [
        "ai_code_editor", "gpt4o", "claude3_opus", "autocomplete_unlimited",
        "codebase_indexing", "fast_requests", "admin_dashboard",
        "enforce_privacy_mode", "centralized_billing", "sso",
      ],
      limits: {
        fastRequests:   500,
        slowRequests:   null,
        advancedModel:  true,
      },
    },
  },

  // ─── GitHub Copilot ──────────────────────────────────────────────────────────
  copilot: {
    individual: {
      planKey:      "individual",
      displayName:  "Individual",
      tier:         0,
      pricePerSeat: 10,
      flatMonthly:  10,
      seats:        1,
      features:     ["ai_code_editor", "autocomplete", "chat_in_ide", "cli_support"],
      limits: {
        suggestions: null,
      },
    },
    business: {
      planKey:      "business",
      displayName:  "Business",
      tier:         1,
      pricePerSeat: 19,
      flatMonthly:  null,
      seats:        "variable",
      minimumSeats: 1,
      features:     [
        "ai_code_editor", "autocomplete", "chat_in_ide", "cli_support",
        "admin_console", "policy_management", "audit_logs", "ip_indemnity",
      ],
      limits: {
        suggestions: null,
      },
    },
    enterprise: {
      planKey:      "enterprise",
      displayName:  "Enterprise",
      tier:         2,
      pricePerSeat: 39,
      flatMonthly:  null,
      seats:        "variable",
      minimumSeats: 1,
      features:     [
        "ai_code_editor", "autocomplete", "chat_in_ide", "cli_support",
        "admin_console", "policy_management", "audit_logs", "ip_indemnity",
        "fine_tuned_models", "knowledge_base", "dotcom_chat",
      ],
      limits: {
        suggestions: null,
      },
    },
  },

  // ─── Gemini (Google) ─────────────────────────────────────────────────────────
  gemini: {
    free: {
      planKey:      "free",
      displayName:  "Free",
      tier:         0,
      pricePerSeat: 0,
      flatMonthly:  0,
      seats:        1,
      features:     ["llm_chat", "gemini_pro_limited"],
      limits: {
        messagesPerDay: 60,
        advancedModel:  false,
      },
    },
    advanced: {
      planKey:      "advanced",
      displayName:  "Advanced",
      tier:         1,
      pricePerSeat: 20,      // via Google One AI Premium
      flatMonthly:  20,
      seats:        1,
      features:     [
        "llm_chat", "gemini_ultra", "workspace_integration",
        "extended_context", "google_one_2tb",
      ],
      limits: {
        messagesPerDay: null,
        advancedModel:  true,
      },
    },
    workspace: {
      planKey:      "workspace",
      displayName:  "Workspace (Business)",
      tier:         2,
      pricePerSeat: 30,      // Workspace Business Standard + Gemini add-on estimate
      flatMonthly:  null,
      seats:        "variable",
      minimumSeats: 1,
      features:     [
        "llm_chat", "gemini_ultra", "workspace_integration",
        "gmail_ai", "docs_ai", "sheets_ai", "meet_ai",
        "admin_console", "audit_logs",
      ],
      limits: {
        messagesPerDay: null,
        advancedModel:  true,
      },
    },
  },

  // ─── OpenAI API (Direct API usage) ──────────────────────────────────────────
  openai_api: {
    /**
     * API pricing is consumption-based, not seat-based.
     * We model it as monthly spend buckets for audit purposes.
     * `estimatedCallsPerDollar` helps rules reason about efficiency.
     */
    pay_as_you_go: {
      planKey:      "pay_as_you_go",
      displayName:  "Pay As You Go",
      tier:         0,
      pricePerSeat: null,    // consumption-based
      flatMonthly:  0,
      seats:        null,
      billingModel: "consumption",
      features:     ["api_access", "gpt4o", "gpt4_turbo", "embeddings", "whisper", "dalle"],
      models: {
        "gpt-4o":          { inputPer1M: 2.50,  outputPer1M: 10.00 },
        "gpt-4o-mini":     { inputPer1M: 0.15,  outputPer1M: 0.60  },
        "gpt-4-turbo":     { inputPer1M: 10.00, outputPer1M: 30.00 },
        "gpt-3.5-turbo":   { inputPer1M: 0.50,  outputPer1M: 1.50  },
        "text-embedding-3-small": { inputPer1M: 0.02, outputPer1M: null },
        "text-embedding-3-large": { inputPer1M: 0.13, outputPer1M: null },
      },
    },
    committed_usage: {
      planKey:      "committed_usage",
      displayName:  "Committed Use Discount",
      tier:         1,
      pricePerSeat: null,
      flatMonthly:  null,    // negotiated — typically 25–35% discount
      billingModel: "consumption_with_commitment",
      seats:        null,
      features:     ["api_access", "gpt4o", "gpt4_turbo", "embeddings", "priority_support"],
      discountRange: { min: 0.25, max: 0.35 }, // 25–35% off list
    },
  },
};

// ─── Utility: Normalize tool name to pricing registry key ────────────────────

/**
 * Maps user-supplied tool names (case-insensitive, flexible) to
 * the canonical keys used in the PRICING registry.
 *
 * Extending: add aliases to the map — no other changes needed.
 */
const TOOL_NAME_ALIASES = {
  chatgpt:        "chatgpt",
  "chat gpt":     "chatgpt",
  "openai chat":  "chatgpt",
  claude:         "claude",
  "anthropic":    "claude",
  cursor:         "cursor",
  copilot:        "copilot",
  "github copilot":"copilot",
  "gh copilot":   "copilot",
  gemini:         "gemini",
  "google gemini":"gemini",
  "bard":         "gemini",
  "openai api":   "openai_api",
  "openai":       "openai_api",
  "openai_api":   "openai_api",
};

/**
 * Resolves a user-supplied tool name to its canonical pricing registry key.
 * Returns null if the tool is not recognized — callers must handle gracefully.
 *
 * @param {string} toolName - Raw tool name from user input
 * @returns {string|null} Canonical pricing key or null
 */
export function resolveToolKey(toolName) {
  if (!toolName || typeof toolName !== "string") return null;
  return TOOL_NAME_ALIASES[toolName.toLowerCase().trim()] ?? null;
}

/**
 * Resolves a user-supplied plan name to its canonical plan key for a given tool.
 * Case-insensitive. Returns null if not found.
 *
 * @param {string} toolKey   - Canonical tool key (from resolveToolKey)
 * @param {string} planName  - Raw plan name from user input
 * @returns {string|null}
 */
export function resolvePlanKey(toolKey, planName) {
  if (!toolKey || !planName) return null;
  const toolPlans = PRICING[toolKey];
  if (!toolPlans) return null;

  const normalized = planName.toLowerCase().trim();

  // Direct key match
  if (toolPlans[normalized]) return normalized;

  // Match by displayName (case-insensitive)
  const entry = Object.entries(toolPlans).find(
    ([, plan]) => plan.displayName.toLowerCase() === normalized
  );

  return entry ? entry[0] : null;
}

/**
 * Returns the full plan metadata object for a tool + plan combination.
 * This is the primary accessor used by the orchestrator and calculator.
 *
 * @param {string} toolKey  - Canonical tool key
 * @param {string} planKey  - Canonical plan key
 * @returns {object|null}   - Plan metadata or null
 */
export function getPlanMeta(toolKey, planKey) {
  return PRICING[toolKey]?.[planKey] ?? null;
}

/**
 * Returns all plans for a tool, sorted ascending by tier.
 * Used by rules to find valid downgrade targets.
 *
 * @param {string} toolKey
 * @returns {Array<object>} Sorted plan entries as [{ planKey, ...planMeta }]
 */
export function getPlansForTool(toolKey) {
  const toolPlans = PRICING[toolKey];
  if (!toolPlans) return [];

  return Object.entries(toolPlans)
    .map(([planKey, meta]) => ({ planKey, ...meta }))
    .sort((a, b) => a.tier - b.tier);
}

/**
 * Returns plans below the given tier for a tool — i.e., valid downgrade options.
 * Filters out free tier unless explicitly allowed.
 *
 * @param {string} toolKey
 * @param {number} currentTier
 * @param {boolean} includeFree
 * @returns {Array<object>}
 */
export function getDowngradePlans(toolKey, currentTier, includeFree = false) {
  return getPlansForTool(toolKey).filter((plan) => {
    if (!includeFree && plan.tier === 0) return false;
    return plan.tier < currentTier;
  });
}

/**
 * Returns the effective monthly cost for a tool entry.
 * Handles both seat-based and flat pricing models.
 *
 * @param {string} toolKey
 * @param {string} planKey
 * @param {number} seats
 * @returns {number} Monthly cost in USD
 */
export function computePlanCost(toolKey, planKey, seats = 1) {
  const meta = getPlanMeta(toolKey, planKey);
  if (!meta) return 0;

  if (meta.billingModel === "consumption") return 0; // API — cost is user-reported
  if (meta.flatMonthly !== null) return meta.flatMonthly; // Single-user flat fee
  return (meta.pricePerSeat ?? 0) * seats;              // Seat-based
}