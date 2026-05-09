"use client";

/**
 * components/primitives/Badge.jsx
 *
 * Reusable badge/pill primitives used throughout the dashboard.
 *
 * Variants:
 *   <Badge variant="emerald" dot pulse>Live</Badge>     — status pill
 *   <Badge variant="amber" icon={Zap}>High</Badge>      — icon pill
 *   <Badge variant="ghost">Label</Badge>                — muted pill
 *   <ConfidenceBadge score={87} />                      — confidence indicator
 *   <GradeBadge grade="A" />                            — audit grade
 *
 * All badges use the .insight-badge CSS class for hover brightness.
 */

import { Zap, ShieldCheck, TrendingDown, Info, Sparkles } from "lucide-react";

// ─── Token map ────────────────────────────────────────────────────────────────

const VARIANT_TOKENS = {
  emerald: {
    bg:     "rgba(0,232,122,0.1)",
    border: "rgba(0,232,122,0.22)",
    text:   "#00e87a",
    dot:    "#00e87a",
  },
  amber: {
    bg:     "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.22)",
    text:   "#f59e0b",
    dot:    "#f59e0b",
  },
  rose: {
    bg:     "rgba(244,63,94,0.1)",
    border: "rgba(244,63,94,0.22)",
    text:   "#f43f5e",
    dot:    "#f43f5e",
  },
  violet: {
    bg:     "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.22)",
    text:   "#a78bfa",
    dot:    "#7c3aed",
  },
  blue: {
    bg:     "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.22)",
    text:   "#60a5fa",
    dot:    "#3b82f6",
  },
  ghost: {
    bg:     "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.09)",
    text:   "#6a6a7a",
    dot:    "#4a4a5a",
  },
};

// ─── Badge ────────────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {"emerald"|"amber"|"rose"|"violet"|"blue"|"ghost"} [props.variant="ghost"]
 * @param {React.ComponentType} [props.icon] — Lucide icon component
 * @param {boolean} [props.dot]  — show colored dot
 * @param {boolean} [props.pulse] — animate dot with pulse
 * @param {React.ReactNode} props.children
 */
export function Badge({
  variant = "ghost",
  icon: Icon,
  dot,
  pulse,
  children,
  className = "",
}) {
  const t = VARIANT_TOKENS[variant] ?? VARIANT_TOKENS.ghost;

  return (
    <span
      className={`insight-badge ${className}`}
      style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.text }}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          {pulse && (
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: t.dot }}
            />
          )}
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: t.dot }}
          />
        </span>
      )}
      {Icon && <Icon size={10} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────

const CONFIDENCE_TIERS = [
  { min: 88, label: "High Confidence",   variant: "emerald", Icon: ShieldCheck },
  { min: 70, label: "Moderate",          variant: "amber",   Icon: Zap },
  { min: 0,  label: "Low Confidence",    variant: "rose",    Icon: Info },
];

/**
 * @param {object}  props
 * @param {number}  props.score — 0–100
 * @param {boolean} [props.showScore=true]
 */
export function ConfidenceBadge({ score, showScore = true }) {
  const tier = CONFIDENCE_TIERS.find((t) => score >= t.min) ?? CONFIDENCE_TIERS.at(-1);
  return (
    <Badge variant={tier.variant} icon={tier.Icon}>
      {tier.label}{showScore ? ` · ${score}%` : ""}
    </Badge>
  );
}

// ─── Grade Badge ──────────────────────────────────────────────────────────────

const GRADE_TOKENS = {
  A: { label: "Lean Stack",          variant: "emerald" },
  B: { label: "Optimized",           variant: "emerald" },
  C: { label: "Savings Available",   variant: "amber"   },
  D: { label: "Significant Waste",   variant: "rose"    },
  F: { label: "Critical",            variant: "rose"    },
};

/**
 * @param {object} props
 * @param {string} props.grade — A|B|C|D|F
 */
export function GradeBadge({ grade }) {
  const g = GRADE_TOKENS[grade] ?? { label: "Under Review", variant: "ghost" };
  return (
    <Badge variant={g.variant} icon={Sparkles}>
      Grade {grade} · {g.label}
    </Badge>
  );
}

// ─── Audit Status Badge ───────────────────────────────────────────────────────

export function AuditStatusBadge({ status = "complete" }) {
  if (status === "complete") {
    return <Badge variant="emerald" dot pulse>Audit Complete</Badge>;
  }
  if (status === "running") {
    return <Badge variant="amber" dot pulse>Analysing…</Badge>;
  }
  return <Badge variant="ghost" dot>Pending</Badge>;
}

export default Badge;
