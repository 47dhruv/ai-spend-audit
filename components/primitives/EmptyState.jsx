"use client";

/**
 * components/primitives/EmptyState.jsx
 *
 * Reusable premium empty state with animated SVG illustrations.
 *
 * Usage:
 *   <EmptyState
 *     variant="no-recommendations"
 *     action={{ label: "New Audit", href: "/audit" }}
 *   />
 *
 * Variants:
 *   "no-recommendations" — all clear, optimized stack
 *   "no-audit"           — no completed audit found
 *   "failed"             — engine/data error
 *   "empty-chart"        — chart has no data
 */

import { motion } from "framer-motion";
import { CheckCircle2, FileSearch, AlertTriangle, BarChart3 } from "lucide-react";
import Link from "next/link";

// ─── Variant config ────────────────────────────────────────────────────────────

const VARIANTS = {
  "no-recommendations": {
    Icon: CheckCircle2,
    iconBg:     "rgba(0,232,122,0.1)",
    iconBorder: "rgba(0,232,122,0.2)",
    iconColor:  "#00e87a",
    title: "Your stack is well-optimized",
    description:
      "No significant waste or overlap detected. Your team is running an efficient AI stack. Check back after adding new tools.",
    badge: { text: "All Clear", color: "#00e87a", bg: "rgba(0,232,122,0.08)", border: "rgba(0,232,122,0.18)" },
  },
  "no-audit": {
    Icon: FileSearch,
    iconBg:     "rgba(99,102,241,0.1)",
    iconBorder: "rgba(99,102,241,0.22)",
    iconColor:  "#818cf8",
    title: "No audit found",
    description:
      "Run your first AI Spend Audit to see a detailed breakdown of savings, waste, and optimization opportunities.",
    badge: null,
  },
  "failed": {
    Icon: AlertTriangle,
    iconBg:     "rgba(244,63,94,0.1)",
    iconBorder: "rgba(244,63,94,0.2)",
    iconColor:  "#f43f5e",
    title: "Audit data unavailable",
    description:
      "Something went wrong while loading your audit results. Your data is intact — please try again.",
    badge: null,
  },
  "empty-chart": {
    Icon: BarChart3,
    iconBg:     "rgba(59,130,246,0.1)",
    iconBorder: "rgba(59,130,246,0.2)",
    iconColor:  "#60a5fa",
    title: "Not enough data for chart",
    description:
      "Add at least two AI tools to see a visual spend breakdown.",
    badge: null,
  },
};

// ─── Animated decoration rings ────────────────────────────────────────────────

function PulseRings({ color }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width:  40 + i * 30,
            height: 40 + i * 30,
            borderColor: color,
            opacity: 0.12 - i * 0.03,
          }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.12 - i * 0.03, 0.06, 0.12 - i * 0.03] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {keyof VARIANTS} [props.variant="no-audit"]
 * @param {{ label: string, href?: string, onClick?: function }} [props.action]
 * @param {{ label: string, href?: string, onClick?: function }} [props.secondaryAction]
 * @param {string}  [props.title]        — override default title
 * @param {string}  [props.description]  — override default description
 * @param {string}  [props.className]
 */
export default function EmptyState({
  variant = "no-audit",
  action,
  secondaryAction,
  title: titleOverride,
  description: descOverride,
  className = "",
}) {
  const v = VARIANTS[variant] ?? VARIANTS["no-audit"];
  const { Icon } = v;
  const title   = titleOverride || v.title;
  const desc    = descOverride  || v.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0   }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-2xl px-8 py-14 text-center overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.032) 0%, rgba(255,255,255,0.012) 100%)",
        border: "1px solid rgba(255,255,255,0.065)",
      }}
    >
      {/* Ambient glow from icon color */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-48 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 50% 0%, ${v.iconColor}12, transparent)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-sm mx-auto">
        {/* Icon with pulse rings */}
        <div className="relative">
          <PulseRings color={v.iconColor} />
          <motion.div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center z-10"
            style={{ background: v.iconBg, border: `1px solid ${v.iconBorder}` }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon size={26} style={{ color: v.iconColor }} strokeWidth={1.6} />
          </motion.div>
        </div>

        {/* Badge */}
        {v.badge && (
          <span
            className="insight-badge"
            style={{ background: v.badge.bg, border: `1px solid ${v.badge.border}`, color: v.badge.color }}
          >
            {v.badge.text}
          </span>
        )}

        {/* Text */}
        <div className="space-y-2">
          <h3
            className="text-lg font-semibold"
            style={{ color: "#f0f0f5", fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#6a6a7a" }}>
            {desc}
          </p>
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {action && (
              action.href ? (
                <Link
                  href={action.href}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "#00e87a", color: "#050507" }}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "#00e87a", color: "#050507" }}
                >
                  {action.label}
                </button>
              )
            )}
            {secondaryAction && (
              secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#9090a0", border: "1px solid rgba(255,255,255,0.09)" }}
                >
                  {secondaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#9090a0", border: "1px solid rgba(255,255,255,0.09)" }}
                >
                  {secondaryAction.label}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
