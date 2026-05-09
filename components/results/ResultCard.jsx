"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  DollarSign,
  Percent,
  Zap,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Trend Token System ────────────────────────────────────────────────────────

const TREND_CONFIG = {
  positive: {
    color: "rgba(52,211,153,1)",
    colorMuted: "rgba(52,211,153,0.7)",
    glow: "rgba(52,211,153,0.18)",
    glowStrong: "rgba(52,211,153,0.28)",
    border: "rgba(52,211,153,0.2)",
    bg: "rgba(52,211,153,0.1)",
    gradient: "linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.08) 100%)",
    TrendIcon: TrendingUp,
    DeltaIcon: ArrowUpRight,
    label: "Positive",
  },
  warning: {
    color: "rgba(251,191,36,1)",
    colorMuted: "rgba(251,191,36,0.75)",
    glow: "rgba(251,191,36,0.15)",
    glowStrong: "rgba(251,191,36,0.25)",
    border: "rgba(251,191,36,0.18)",
    bg: "rgba(251,191,36,0.08)",
    gradient: "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.07) 100%)",
    TrendIcon: AlertTriangle,
    DeltaIcon: ArrowUpRight,
    label: "Warning",
  },
  negative: {
    color: "rgba(251,113,133,1)",
    colorMuted: "rgba(251,113,133,0.7)",
    glow: "rgba(251,113,133,0.18)",
    glowStrong: "rgba(251,113,133,0.28)",
    border: "rgba(251,113,133,0.2)",
    bg: "rgba(251,113,133,0.1)",
    gradient: "linear-gradient(135deg, rgba(251,113,133,0.18) 0%, rgba(244,63,94,0.08) 100%)",
    TrendIcon: TrendingDown,
    DeltaIcon: ArrowDownRight,
    label: "Negative",
  },
  neutral: {
    color: "rgba(56,189,248,1)",
    colorMuted: "rgba(56,189,248,0.7)",
    glow: "rgba(56,189,248,0.15)",
    glowStrong: "rgba(56,189,248,0.25)",
    border: "rgba(56,189,248,0.18)",
    bg: "rgba(56,189,248,0.08)",
    gradient: "linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(14,165,233,0.07) 100%)",
    TrendIcon: Minus,
    DeltaIcon: Minus,
    label: "Neutral",
  },
};

// ─── Icon map (string → component) ────────────────────────────────────────────

const ICON_MAP = {
  DollarSign,
  Percent,
  Zap,
  BarChart2,
  TrendingUp,
  TrendingDown,
};

// ─── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(rawValue, active, duration = 900) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!active) return;

    // Extract numeric part and prefix/suffix
    const match = String(rawValue).match(/^([^0-9]*)([0-9,.]+)([^0-9]*)$/);
    if (!match) {
      setDisplay(rawValue);
      return;
    }

    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr.replace(/,/g, ""));
    if (isNaN(target)) { setDisplay(rawValue); return; }

    const hasDecimals = numStr.includes(".");
    const decimals = hasDecimals ? (numStr.split(".")[1] || "").length : 0;
    const startTime = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = target * easeOut(progress);

      const formatted = hasDecimals
        ? current.toFixed(decimals)
        : Math.round(current).toLocaleString();

      setDisplay(`${prefix}${formatted}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [active, rawValue, duration]);

  return display;
}

// ─── Mini spark bars ───────────────────────────────────────────────────────────

function SparkBars({ trend, color }) {
  const heights = trend === "positive"
    ? [30, 45, 38, 55, 48, 70, 65, 85]
    : trend === "negative"
    ? [85, 70, 75, 60, 55, 45, 38, 30]
    : trend === "warning"
    ? [40, 65, 45, 70, 50, 60, 55, 68]
    : [50, 55, 48, 60, 52, 58, 54, 57];

  return (
    <div className="flex items-end gap-[3px] h-7" aria-hidden="true">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${h}%`, opacity: i === heights.length - 1 ? 1 : 0.35 + (i / heights.length) * 0.45 }}
          transition={{ duration: 0.5, delay: 0.7 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="w-1 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ResultCard({
  title,
  value,
  change,
  trend = "neutral",
  description,
  icon,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  const cfg = TREND_CONFIG[trend] ?? TREND_CONFIG.neutral;
  const { TrendIcon, DeltaIcon } = cfg;

  // Resolve icon — accept component or string
  const MetricIcon =
    typeof icon === "string" ? (ICON_MAP[icon] ?? BarChart2) : (icon ?? BarChart2);

  const displayValue = useCountUp(value, isInView);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.018 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-label={`${title}: ${value}`}
      className="relative cursor-default select-none"
      style={{ transformOrigin: "center bottom" }}
    >
      {/* ── Hover glow bloom ──────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow} 0%, transparent 65%)`,
          filter: "blur(16px)",
        }}
        aria-hidden="true"
      />

      {/* ── Card shell ────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden h-full"
        style={{
          background: "linear-gradient(145deg, rgba(15,23,42,0.94) 0%, rgba(13,19,36,0.96) 100%)",
          border: `0.5px solid ${hovered ? cfg.border : "rgba(255,255,255,0.08)"}`,
          boxShadow: hovered
            ? `0 20px 50px rgba(0,0,0,0.5), 0 0 0 0.5px ${cfg.glow} inset, 0 4px 16px ${cfg.glow}`
            : "0 8px 32px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* ── Left trend accent bar ──────────────────────────────────────── */}
        <div
          className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${cfg.color} 30%, ${cfg.color} 70%, transparent 100%)`,
            opacity: 0.7,
          }}
          aria-hidden="true"
        />

        {/* ── Top edge highlight ─────────────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${cfg.glow} 40%, ${cfg.glow} 60%, transparent 100%)`,
          }}
          aria-hidden="true"
        />

        {/* ── Corner gradient accent ─────────────────────────────────────── */}
        <div
          className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${cfg.glow} 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative p-6 flex flex-col gap-4">

          {/* ── Zone A: Header row ─────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-3">
            {/* Icon capsule */}
            <div
              className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: cfg.gradient,
                border: `0.5px solid ${cfg.border}`,
                boxShadow: hovered ? `0 0 16px ${cfg.glowStrong}` : `0 0 8px ${cfg.glow}`,
                transition: "box-shadow 0.3s ease",
              }}
            >
              <MetricIcon
                className="w-4.5 h-4.5"
                style={{ color: cfg.color }}
                strokeWidth={2}
              />
            </div>

            {/* Trend badge */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase flex-shrink-0"
              style={{
                background: cfg.bg,
                border: `0.5px solid ${cfg.border}`,
                color: cfg.colorMuted,
              }}
            >
              <TrendIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
              <span>{cfg.label}</span>
            </div>
          </div>

          {/* Title */}
          <p
            className="text-[11px] font-medium tracking-[0.12em] uppercase leading-none"
            style={{ color: "rgba(148,163,184,0.55)" }}
          >
            {title}
          </p>

          {/* ── Zone B: Metric value ───────────────────────────────────────── */}
          <div className="space-y-1.5">
            <div
              className="text-4xl lg:text-[2.6rem] font-bold tabular-nums leading-none tracking-tight"
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {displayValue}
            </div>

            {/* Change delta */}
            {change && (
              <div className="flex items-center gap-1">
                <DeltaIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg.color }} strokeWidth={2.5} />
                <span
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: cfg.color }}
                >
                  {change}
                </span>
                <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.4)" }}>
                  vs. current
                </span>
              </div>
            )}
          </div>

          {/* ── Zone C: Footer ─────────────────────────────────────────────── */}
          <div
            className="pt-3 mt-auto"
            style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-end justify-between gap-3">
              <p
                className="text-[12px] leading-snug flex-1"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                {description}
              </p>
              <SparkBars trend={trend} color={cfg.color} />
            </div>
          </div>

        </div>
      </div>
    </motion.article>
  );
}