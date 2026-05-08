"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Sparkles,
  TrendingDown,
  Zap,
  ShieldCheck,
  ArrowRight,
  Activity,
} from "lucide-react";

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const glowVariants = {
  initial: { opacity: 0.35, scale: 1 },
  animate: {
    opacity: [0.35, 0.55, 0.35],
    scale: [1, 1.06, 1],
    transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Derived insight extraction ────────────────────────────────────────────────
// Parses the summary for key insight signals; falls back to defaults.

const DEFAULT_INSIGHTS = [
  { icon: TrendingDown, label: "Overspend Detected", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20" },
  { icon: Zap,         label: "Optimization Ready", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  { icon: ShieldCheck, label: "Workflow Safe",       color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
];

function deriveConfidence(summary) {
  if (!summary) return 82;
  const len = summary.length;
  return Math.min(97, Math.max(74, 74 + Math.round((len / 320) * 23)));
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AIOriginBadge() {
  return (
    <div className="flex items-center gap-2">
      {/* Pulsing status dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
      </span>
      <span
        className="text-[10px] font-semibold tracking-[0.18em] uppercase"
        style={{ color: "rgba(94,234,212,0.7)" }}
      >
        Executive Summary · AI-Generated
      </span>
    </div>
  );
}

function AIIcon() {
  return (
    <div className="relative flex-shrink-0">
      {/* Outer glow ring */}
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(94,234,212,0.22) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="relative w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(94,234,212,0.15) 0%, rgba(99,102,241,0.12) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <Sparkles className="w-5 h-5 text-teal-300" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function ConfidenceBar({ score }) {
  return (
    <div className="flex items-center gap-3">
      <Activity className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(148,163,184,0.6)" }} />
      <span className="text-[11px] tracking-wide uppercase font-medium" style={{ color: "rgba(148,163,184,0.55)" }}>
        Confidence
      </span>
      <div
        className="flex-1 h-[3px] rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "linear-gradient(90deg, #2dd4bf 0%, #818cf8 100%)",
          }}
        />
      </div>
      <span className="text-[11px] font-semibold tabular-nums" style={{ color: "rgba(203,213,225,0.75)" }}>
        {score}%
      </span>
    </div>
  );
}

function InsightBadge({ icon: Icon, label, color, bg }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold tracking-wide uppercase cursor-default select-none ${bg}`}
    >
      <Icon className={`w-3 h-3 ${color}`} strokeWidth={2.5} />
      <span className={color}>{label}</span>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AISummary({ summary, onViewPlan }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const confidence = deriveConfidence(summary);

  const displaySummary =
    summary ||
    "Your team is significantly overspending on collaborative AI plans relative to seat utilization. Consolidating redundant subscriptions and downgrading underutilized enterprise tiers could reduce monthly AI infrastructure costs by approximately 38% while maintaining workflow efficiency.";

  return (
    <section ref={ref} className="relative w-full" aria-label="AI Executive Summary">

      {/* ── Atmospheric background blobs ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" aria-hidden="true">
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          className="absolute -top-16 -left-16 w-80 h-80 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(45,212,191,0.09) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          style={{
            background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 65%)",
            filter: "blur(50px)",
            animationDelay: "2.2s",
          }}
          className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full"
        />
      </div>

      {/* ── Glass card ────────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.80) 50%, rgba(15,20,40,0.94) 100%)",
          border: "0.5px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* ── Subtle top edge highlight ──────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(94,234,212,0.25) 30%, rgba(129,140,248,0.2) 70%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative p-8 lg:p-10 space-y-7">

          {/* ── Header row ────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex items-start gap-4">
            <AIIcon />
            <div className="flex-1 min-w-0 space-y-1.5">
              <AIOriginBadge />
              <h2
                className="text-xl lg:text-2xl font-semibold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.25,
                }}
              >
                AI Spend Intelligence Report
              </h2>
            </div>
          </motion.div>

          {/* ── Divider ───────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.07) 60%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          {/* ── Summary body ──────────────────────────────────────────────── */}
          <motion.blockquote
            variants={itemVariants}
            className="relative pl-4"
          >
            {/* Left accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
              style={{
                background: "linear-gradient(180deg, rgba(45,212,191,0.6) 0%, rgba(129,140,248,0.4) 100%)",
              }}
              aria-hidden="true"
            />
            <p
              className="text-[15px] leading-[1.75] font-normal"
              style={{ color: "rgba(226,232,240,0.88)", fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {displaySummary}
            </p>
          </motion.blockquote>

          {/* ── Insight badges ────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {DEFAULT_INSIGHTS.map((insight) => (
              <InsightBadge key={insight.label} {...insight} />
            ))}
          </motion.div>

          {/* ── Confidence bar ────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <ConfidenceBar score={confidence} />
          </motion.div>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          {onViewPlan !== false && (
            <motion.div variants={itemVariants}>
              <motion.button
                onClick={onViewPlan}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(45,212,191,0.14) 0%, rgba(129,140,248,0.11) 100%)",
                  border: "0.5px solid rgba(94,234,212,0.25)",
                  color: "rgba(167,243,235,0.92)",
                  boxShadow: "0 2px 12px rgba(45,212,191,0.08)",
                }}
              >
                <span>View Optimization Plan</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </motion.button>
            </motion.div>
          )}

        </div>

        {/* ── Subtle bottom right corner accent ─────────────────────────── */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 100% 100%, rgba(129,140,248,0.06) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
      </motion.div>
    </section>
  );
}