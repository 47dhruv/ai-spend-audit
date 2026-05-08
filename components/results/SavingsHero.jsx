"use client";

/**
 * components/results/SavingsHero.jsx
 *
 * THE FINANCIAL IMPACT MOMENT.
 *
 * This is the first thing a user sees after submitting their audit.
 * One question must be answered instantly, viscerally: "How much am I wasting?"
 *
 * Visual architecture:
 *   LEFT  60% — Hero savings number (96px, animated counter) + waste context
 *   RIGHT 40% — Metric stack (spend, annual) + waste arc gauge
 *   BOTTOM     — Three metric pills anchoring the section
 *
 * Aesthetic: Precision Finance Dark
 *   - Background: near-black #050812 with emerald radial glow
 *   - Primary accent: #10e898 (electric emerald — unmistakably "saved money")
 *   - Numbers: JetBrains Mono — every digit feels authoritative
 *   - Labels: Syne — geometric, editorial, distinctive
 *   - Borders: 1px rgba(255,255,255,0.06) hairline
 *
 * Setup required in layout.jsx or globals.css:
 *   @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
 *
 * Props:
 *   auditData {object} — Full AuditReport from lib/audit-engine/index.js
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion";
import {
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Zap,
  DollarSign,
  Calendar,
  BarChart3,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────

const TOKENS = {
  emerald:      "#10e898",
  emeraldDim:   "#0a9e68",
  emeraldGlow:  "rgba(16, 232, 152, 0.12)",
  amber:        "#f59e0b",
  amberGlow:    "rgba(245, 158, 11, 0.12)",
  red:          "#ef4444",
  redGlow:      "rgba(239, 68, 68, 0.12)",
  bgPrimary:    "#050812",
  bgSurface:    "rgba(255, 255, 255, 0.025)",
  bgSurfaceHov: "rgba(255, 255, 255, 0.045)",
  border:       "rgba(255, 255, 255, 0.06)",
  borderHov:    "rgba(255, 255, 255, 0.12)",
  textPrimary:  "#f0f4ff",
  textSecondary:"#6b7a99",
  textMuted:    "#3d4a63",
};

// ─── Waste color resolver ─────────────────────────────────────────────────────

/**
 * Returns the accent color for a given waste percentage.
 * Visually communicates urgency: green (ok) → amber (warn) → red (critical).
 */
function resolveWasteColor(pct) {
  if (pct >= 40) return { color: TOKENS.red,    glow: TOKENS.redGlow    };
  if (pct >= 20) return { color: TOKENS.amber,  glow: TOKENS.amberGlow  };
  return           { color: TOKENS.emerald, glow: TOKENS.emeraldGlow };
}

// ─── Animated counter ─────────────────────────────────────────────────────────

/**
 * Counts from 0 → target using Framer Motion's animate() with spring easing.
 * Triggers on scroll into view (once). Delays allow staggered entry.
 *
 * @param {number} target     - Final value to count to
 * @param {number} duration   - Animation duration in seconds
 * @param {number} delay      - Delay before counter starts (seconds)
 * @param {number} decimals   - Decimal places in output
 */
function useAnimatedCounter(target, { duration = 2.2, delay = 0, decimals = 0 } = {}) {
  const [count, setCount] = useState(0);
  const ref               = useRef(null);
  const inView            = useInView(ref, { once: true, margin: "-80px" });
  const started           = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const timer = setTimeout(() => {
      const controls = animate(0, target, {
        duration,
        ease: [0.16, 1, 0.3, 1], // expo-out — fast start, smooth settle
        onUpdate: (v) =>
          setCount(decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.floor(v)),
      });
      return controls.stop;
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [inView, target, duration, delay, decimals]);

  return { count, ref };
}

// ─── Waste Arc (SVG gauge) ────────────────────────────────────────────────────

/**
 * A 270° arc gauge showing the waste percentage.
 * Animated fill on scroll entry. Color shifts with severity.
 */
function WasteArc({ percentage, size = 108 }) {
  const [progress, setProgress] = useState(0);
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-80px" });
  const started = useRef(false);

  const { color } = resolveWasteColor(percentage);
  const radius        = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcSpan       = circumference * 0.75;             // 270° of 360°
  const offset        = arcSpan - (progress / 100) * arcSpan;

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const timer = setTimeout(() => {
      const controls = animate(0, percentage, {
        duration: 2.5,
        delay: 0.3,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setProgress(v),
      });
      return controls.stop;
    }, 200);

    return () => clearTimeout(timer);
  }, [inView, percentage]);

  return (
    <div
      ref={ref}
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Waste gauge: ${percentage}% of AI budget is wasted`}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          transform: "scale(1.15)",
        }}
      />

      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(135deg)", overflow: "visible" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TOKENS.border}
          strokeWidth={5}
          strokeDasharray={`${arcSpan} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Animated fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={`${arcSpan} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${color}90)`,
            transition: "stroke 0.4s ease",
          }}
        />
      </svg>

      {/* Center label */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ paddingBottom: "8px" }} // visual optical center for 270° arc
      >
        <span
          className="font-mono font-bold leading-none"
          style={{ fontSize: "22px", color, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {Math.round(progress)}%
        </span>
        <span
          className="uppercase tracking-widest mt-1"
          style={{ fontSize: "9px", color: TOKENS.textSecondary, letterSpacing: "0.12em" }}
        >
          waste
        </span>
      </div>
    </div>
  );
}

// ─── Metric pill ──────────────────────────────────────────────────────────────

/**
 * A compact stat chip used in the bottom bar.
 * Subtle glass surface with icon, label, and animated value.
 */
function MetricPill({ icon: Icon, label, value, accent = TOKENS.textPrimary, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 flex-1 min-w-0"
      style={{
        background: TOKENS.bgSurface,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: "12px",
        padding: "14px 18px",
      }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: 34,
          height: 34,
          background: `${accent}14`,
          border: `1px solid ${accent}28`,
        }}
      >
        <Icon size={15} style={{ color: accent }} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p
          className="uppercase tracking-widest truncate"
          style={{ fontSize: "10px", color: TOKENS.textSecondary, letterSpacing: "0.1em", marginBottom: 3 }}
        >
          {label}
        </p>
        <p
          className="font-mono font-semibold truncate"
          style={{ fontSize: "16px", color: TOKENS.textPrimary, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Right-column stat row ────────────────────────────────────────────────────

/**
 * A single stat row in the right panel.
 */
function StatRow({ label, value, sub, accent }) {
  return (
    <div className="flex flex-col gap-1">
      <p
        className="uppercase tracking-widest"
        style={{ fontSize: "10px", color: TOKENS.textSecondary, letterSpacing: "0.1em" }}
      >
        {label}
      </p>
      <p
        className="font-mono font-bold"
        style={{
          fontSize: "28px",
          color: accent ?? TOKENS.textPrimary,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "12px", color: TOKENS.textSecondary }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Background grid ──────────────────────────────────────────────────────────

/**
 * Renders a precise CSS grid overlay that evokes financial chart infrastructure.
 * Purely decorative — aria-hidden.
 */
function BackgroundGrid() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ borderRadius: "inherit" }}
    >
      {/* Fine grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Coarse grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "192px 192px",
        }}
      />
      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{ background: `linear-gradient(to bottom, ${TOKENS.bgPrimary}, transparent)` }}
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{ background: `linear-gradient(to top, ${TOKENS.bgPrimary}, transparent)` }}
      />
    </div>
  );
}

// ─── Noise overlay ────────────────────────────────────────────────────────────

/**
 * SVG grain texture overlay. Adds subtle materiality to the dark surface.
 * Prevents the "flat rectangle" look of purely digital dark backgrounds.
 */
function NoiseOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.035, mixBlendMode: "overlay", borderRadius: "inherit" }}
    >
      <filter id="noise-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
  );
}

// ─── Waste progress bar ───────────────────────────────────────────────────────

/**
 * A horizontal bar showing spend split: optimized vs. waste.
 * Animates from left on scroll entry.
 */
function WasteBar({ wastePercentage }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { color } = resolveWasteColor(wastePercentage);
  const optimized = 100 - wastePercentage;

  return (
    <div ref={ref} className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span style={{ fontSize: "11px", color: TOKENS.textSecondary, letterSpacing: "0.06em" }}>
          Budget allocation
        </span>
        <span style={{ fontSize: "11px", color: TOKENS.textSecondary }}>
          <span style={{ color: TOKENS.emerald }}>{optimized}%</span>
          {" "}efficient
          {" / "}
          <span style={{ color }}>{wastePercentage}%</span>
          {" "}waste
        </span>
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{
          height: "6px",
          borderRadius: "99px",
          background: TOKENS.bgSurface,
          border: `1px solid ${TOKENS.border}`,
        }}
      >
        {/* Optimized segment */}
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{
            borderRadius: "99px 0 0 99px",
            background: `linear-gradient(90deg, ${TOKENS.emeraldDim}, ${TOKENS.emerald})`,
            boxShadow: `0 0 12px ${TOKENS.emerald}60`,
          }}
          initial={{ width: "0%" }}
          animate={inView ? { width: `${optimized}%` } : { width: "0%" }}
          transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Waste segment */}
        <motion.div
          className="absolute top-0 h-full"
          style={{
            borderRadius: "0 99px 99px 0",
            background: `linear-gradient(90deg, ${color}80, ${color})`,
          }}
          initial={{ width: "0%", left: `${optimized}%` }}
          animate={
            inView
              ? { width: `${wastePercentage}%`, left: `${optimized}%` }
              : { width: "0%", left: `${optimized}%` }
          }
          transition={{ duration: 1.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ─── SavingsHero ─────────────────────────────────────────────────────────────

/**
 * The primary hero section of the audit results dashboard.
 *
 * @param {object}  props
 * @param {object}  props.auditData          - Full AuditReport from the audit engine
 * @param {boolean} [props.isLoading=false]  - Skeleton state while data resolves
 */
export default function SavingsHero({ auditData, isLoading = false }) {
  // ── Data extraction ──────────────────────────────────────────────────────
  const {
    totalMonthlySpend    = 0,
    estimatedSavings     = 0,
    annualSavings        = 0,
    wastePercentage      = 0,
    executiveSummary     = {},
    recommendations      = [],
    grade                = {},
    findingSummary       = {},
  } = auditData ?? {};

  const findingCount = findingSummary?.total ?? recommendations?.length ?? 0;
  const { color: wasteColor } = resolveWasteColor(wastePercentage);

  // ── Animated counters ────────────────────────────────────────────────────
  const savings  = useAnimatedCounter(estimatedSavings, { duration: 2.4, delay: 0.3 });
  const spend    = useAnimatedCounter(totalMonthlySpend, { duration: 2.0, delay: 0.5 });
  const annual   = useAnimatedCounter(annualSavings, { duration: 2.2, delay: 0.7 });

  // ── Section ref for orchestrating entry animation ─────────────────────────
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-40px" });

  // ── Framer Motion variants ────────────────────────────────────────────────
  const containerVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const fadeUp = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  const fadeIn = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // ── Format helpers ────────────────────────────────────────────────────────
  const fmt = (n) => n.toLocaleString("en-US");

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return <SavingsHeroSkeleton />;
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: TOKENS.bgPrimary,
        borderRadius: "20px",
        border: `1px solid ${TOKENS.border}`,
        padding: "0",
        fontFamily: "'Syne', system-ui, sans-serif",
      }}
      aria-label="AI spend audit savings summary"
    >
      {/* ── Decorative layers ──────────────────────────────────────────────── */}
      <BackgroundGrid />
      <NoiseOverlay />

      {/* ── Emerald glow — positioned behind the hero number ──────────────── */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "-60px",
          left: "-40px",
          width: "520px",
          height: "520px",
          background: `radial-gradient(ellipse at 40% 40%, ${TOKENS.emeraldGlow} 0%, transparent 65%)`,
          filter: "blur(1px)",
        }}
      />

      {/* ── Waste glow — top right ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "-80px",
          right: "-60px",
          width: "360px",
          height: "360px",
          background: `radial-gradient(ellipse at 60% 40%, ${wasteColor}0D 0%, transparent 65%)`,
        }}
      />

      {/* ── Inner content ─────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={sectionInView ? "visible" : "hidden"}
        className="relative z-10"
        style={{ padding: "40px 44px 36px" }}
      >

        {/* ── Top badge row ──────────────────────────────────────────────── */}
        <motion.div
          variants={fadeIn}
          className="flex items-center justify-between flex-wrap gap-3 mb-10"
        >
          {/* Status pill */}
          <div
            className="flex items-center gap-2"
            style={{
              background: "rgba(16, 232, 152, 0.06)",
              border: `1px solid rgba(16, 232, 152, 0.18)`,
              borderRadius: "99px",
              padding: "6px 14px 6px 10px",
              width: "fit-content",
            }}
          >
            {/* Pulse dot */}
            <span className="relative flex items-center justify-center" style={{ width: 8, height: 8 }}>
              <span
                className="absolute inline-flex rounded-full animate-ping"
                style={{
                  width: "100%",
                  height: "100%",
                  background: TOKENS.emerald,
                  opacity: 0.5,
                  animationDuration: "2s",
                }}
              />
              <span
                className="relative inline-flex rounded-full"
                style={{ width: 6, height: 6, background: TOKENS.emerald }}
              />
            </span>
            <span
              className="uppercase tracking-widest"
              style={{ fontSize: "11px", color: TOKENS.emerald, letterSpacing: "0.1em", fontWeight: 600 }}
            >
              Audit complete
            </span>
          </div>

          {/* Finding count badge */}
          {findingCount > 0 && (
            <div
              className="flex items-center gap-2"
              style={{
                background: TOKENS.bgSurface,
                border: `1px solid ${TOKENS.border}`,
                borderRadius: "99px",
                padding: "6px 14px",
              }}
            >
              <AlertCircle size={12} style={{ color: wasteColor }} />
              <span style={{ fontSize: "12px", color: TOKENS.textSecondary }}>
                <span style={{ color: TOKENS.textPrimary, fontWeight: 600 }}>{findingCount}</span>
                {" "}finding{findingCount !== 1 ? "s" : ""} across{" "}
                <span style={{ color: TOKENS.textPrimary, fontWeight: 600 }}>
                  {Object.keys(auditData?.toolBreakdown ?? {}).length}
                </span>
                {" "}tools
              </span>
            </div>
          )}
        </motion.div>

        {/* ── Main grid: left hero + right panel ─────────────────────────── */}
        <div
          className="grid gap-10 mb-10"
          style={{ gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)" }}
        >

          {/* LEFT — Hero savings number ─────────────────────────────────── */}
          <div className="flex flex-col justify-between gap-8">

            {/* Recoverable label + number */}
            <div>
              <motion.p
                variants={fadeUp}
                className="uppercase tracking-widest mb-3"
                style={{
                  fontSize: "11px",
                  color: TOKENS.textSecondary,
                  letterSpacing: "0.14em",
                  fontWeight: 600,
                }}
              >
                Recoverable per month
              </motion.p>

              {/* The hero number — Layer 1 visual */}
              <motion.div
                variants={fadeUp}
                ref={savings.ref}
                className="flex items-start leading-none"
              >
                <span
                  className="font-bold"
                  style={{
                    fontSize: "clamp(52px, 8vw, 88px)",
                    color: TOKENS.emerald,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 0.95,
                    textShadow: `0 0 60px ${TOKENS.emerald}40, 0 0 120px ${TOKENS.emerald}18`,
                  }}
                  aria-label={`$${fmt(estimatedSavings)} per month recoverable`}
                >
                  <span
                    style={{
                      fontSize: "0.42em",
                      verticalAlign: "top",
                      marginTop: "0.18em",
                      display: "inline-block",
                      color: `${TOKENS.emerald}90`,
                      marginRight: "2px",
                    }}
                  >
                    $
                  </span>
                  {fmt(savings.count)}
                </span>
                <span
                  className="ml-3 mt-2 font-mono"
                  style={{
                    fontSize: "14px",
                    color: TOKENS.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                    alignSelf: "flex-start",
                    paddingTop: "8px",
                  }}
                >
                  /mo
                </span>
              </motion.div>

              {/* Waste context line */}
              <motion.p
                variants={fadeUp}
                className="mt-4"
                style={{ fontSize: "15px", color: TOKENS.textSecondary, lineHeight: 1.6, maxWidth: "480px" }}
              >
                Your team is spending{" "}
                <span
                  className="font-mono font-semibold"
                  style={{ color: wasteColor, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ${fmt(totalMonthlySpend)}
                </span>
                {" "}per month on AI tools.{" "}
                <span style={{ color: TOKENS.textPrimary }}>
                  {wastePercentage}% is recoverable waste
                </span>
                {" "}— money you could reallocate today.
              </motion.p>
            </div>

            {/* Waste bar */}
            <motion.div variants={fadeUp}>
              <WasteBar wastePercentage={wastePercentage} />
            </motion.div>

          </div>

          {/* RIGHT — Stat stack + gauge ──────────────────────────────────── */}
          <motion.div
            variants={fadeIn}
            className="flex flex-col justify-between gap-6"
            style={{
              background: TOKENS.bgSurface,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            {/* Waste arc gauge */}
            <div className="flex items-center gap-5">
              <WasteArc percentage={wastePercentage} size={108} />
              <div>
                <p
                  className="uppercase tracking-widest mb-1"
                  style={{ fontSize: "10px", color: TOKENS.textSecondary, letterSpacing: "0.1em" }}
                >
                  Waste score
                </p>
                <p style={{ fontSize: "13px", color: TOKENS.textSecondary, lineHeight: 1.5, maxWidth: "140px" }}>
                  {wastePercentage >= 40
                    ? "Critical — immediate action needed."
                    : wastePercentage >= 20
                    ? "Significant waste detected."
                    : "Minor inefficiencies found."}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: TOKENS.border }} />

            {/* Stat rows */}
            <div className="flex flex-col gap-5" ref={spend.ref}>

              <StatRow
                label="Current monthly spend"
                value={`$${fmt(spend.count)}`}
                sub="Before optimization"
                accent={TOKENS.textPrimary}
              />

              <div style={{ height: "1px", background: TOKENS.border }} />

              <div ref={annual.ref}>
                <StatRow
                  label="Projected annual savings"
                  value={`$${fmt(annual.count)}`}
                  sub="If all recommendations applied"
                  accent={TOKENS.emerald}
                />
              </div>

            </div>

            {/* Audit grade chip */}
            {grade?.letter && (
              <>
                <div style={{ height: "1px", background: TOKENS.border }} />
                <div className="flex items-center justify-between">
                  <span
                    className="uppercase tracking-widest"
                    style={{ fontSize: "10px", color: TOKENS.textSecondary, letterSpacing: "0.1em" }}
                  >
                    Audit grade
                  </span>
                  <div
                    className="flex items-center gap-2"
                    style={{
                      background: `${grade.color ?? wasteColor}14`,
                      border: `1px solid ${grade.color ?? wasteColor}30`,
                      borderRadius: "8px",
                      padding: "5px 12px",
                    }}
                  >
                    <span
                      className="font-mono font-bold"
                      style={{
                        fontSize: "18px",
                        color: grade.color ?? wasteColor,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {grade.letter}
                    </span>
                    <span style={{ fontSize: "12px", color: TOKENS.textSecondary }}>
                      {grade.label}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>

        </div>

        {/* ── Bottom metric pills ─────────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <MetricPill
            icon={DollarSign}
            label="Monthly spend"
            value={`$${totalMonthlySpend.toLocaleString()}`}
            accent={TOKENS.textPrimary}
            delay={0.6}
          />
          <MetricPill
            icon={Calendar}
            label="Annual savings"
            value={`$${annualSavings.toLocaleString()}`}
            accent={TOKENS.emerald}
            delay={0.72}
          />
          <MetricPill
            icon={BarChart3}
            label="Waste detected"
            value={`${wastePercentage}% of budget`}
            accent={wasteColor}
            delay={0.84}
          />
          <MetricPill
            icon={Zap}
            label="Recommendations"
            value={`${recommendations.length} actions`}
            accent={TOKENS.amber}
            delay={0.96}
          />
        </div>

      </motion.div>
    </section>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

/**
 * Pulse skeleton shown while audit data is loading.
 * Matches the hero layout exactly to prevent layout shift.
 */
function SavingsHeroSkeleton() {
  const Bone = ({ w = "100%", h = 20, r = 8, style = {} }) => (
    <div
      className="animate-pulse"
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "rgba(255,255,255,0.06)",
        ...style,
      }}
    />
  );

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: TOKENS.bgPrimary,
        borderRadius: "20px",
        border: `1px solid ${TOKENS.border}`,
        padding: "40px 44px 36px",
        fontFamily: "'Syne', system-ui, sans-serif",
      }}
      aria-label="Loading audit results…"
      aria-busy="true"
    >
      <BackgroundGrid />

      <div className="flex justify-between mb-10">
        <Bone w={160} h={28} r={99} />
        <Bone w={200} h={28} r={99} />
      </div>

      <div className="grid gap-10 mb-10" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Bone w={180} h={12} />
            <Bone w={320} h={76} r={12} />
            <Bone w="90%" h={16} />
            <Bone w="70%" h={16} />
          </div>
          <Bone w="100%" h={28} r={99} />
        </div>

        <Bone w="100%" h={300} r={16} />
      </div>

      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Bone key={i} w="100%" h={68} r={12} />
        ))}
      </div>
    </section>
  );
}