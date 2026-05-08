"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowRight,
  BadgeCheck,
  Bot,
  ChevronRight,
  CircleDollarSign,
  Flame,
  Info,
  Layers,
  Lightbulb,
  Minus,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";
import { useRef } from "react";

// ─────────────────────────────────────────────
// SEVERITY CONFIG — single source of truth
// ─────────────────────────────────────────────
const SEVERITY_CONFIG = {
  high: {
    label: "High Priority",
    glow: "rgba(249,115,22,0.35)",
    glowStrong: "rgba(239,68,68,0.5)",
    border: "rgba(249,115,22,0.5)",
    badgeBg: "rgba(239,68,68,0.12)",
    badgeText: "#f87171",
    badgeBorder: "rgba(239,68,68,0.3)",
    iconColor: "#f97316",
    gradientFrom: "rgba(239,68,68,0.06)",
    gradientTo: "rgba(249,115,22,0.03)",
    Icon: Flame,
    pulse: "shadow-[0_0_30px_rgba(249,115,22,0.25)]",
  },
  medium: {
    label: "Medium Priority",
    glow: "rgba(234,179,8,0.3)",
    glowStrong: "rgba(234,179,8,0.45)",
    border: "rgba(234,179,8,0.4)",
    badgeBg: "rgba(234,179,8,0.1)",
    badgeText: "#facc15",
    badgeBorder: "rgba(234,179,8,0.3)",
    iconColor: "#eab308",
    gradientFrom: "rgba(234,179,8,0.06)",
    gradientTo: "rgba(161,98,7,0.02)",
    Icon: AlertTriangle,
    pulse: "shadow-[0_0_30px_rgba(234,179,8,0.2)]",
  },
  low: {
    label: "Low Priority",
    glow: "rgba(99,102,241,0.3)",
    glowStrong: "rgba(99,102,241,0.45)",
    border: "rgba(99,102,241,0.35)",
    badgeBg: "rgba(99,102,241,0.1)",
    badgeText: "#818cf8",
    badgeBorder: "rgba(99,102,241,0.3)",
    iconColor: "#818cf8",
    gradientFrom: "rgba(99,102,241,0.06)",
    gradientTo: "rgba(67,56,202,0.02)",
    Icon: Info,
    pulse: "shadow-[0_0_25px_rgba(99,102,241,0.2)]",
  },
};

// ─────────────────────────────────────────────
// RECOMMENDATION TYPE CONFIG
// ─────────────────────────────────────────────
const TYPE_CONFIG = {
  downgrade: { label: "Plan Downgrade", Icon: ArrowDownCircle, color: "#34d399" },
  upgrade: { label: "Plan Upgrade", Icon: TrendingDown, color: "#60a5fa" },
  consolidate: { label: "Consolidate", Icon: Layers, color: "#c084fc" },
  eliminate: { label: "Eliminate", Icon: Minus, color: "#f87171" },
  optimize: { label: "Optimize Usage", Icon: Zap, color: "#fbbf24" },
};

// ─────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────
const fmt = {
  currency: (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n),
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function SeverityBadge({ severity, config }) {
  const { Icon } = config;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase"
      style={{
        background: config.badgeBg,
        color: config.badgeText,
        border: `1px solid ${config.badgeBorder}`,
      }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-white/5 text-white/50 border border-white/10">
      <Sparkles size={10} strokeWidth={2} />
      {category}
    </span>
  );
}

function TypeChip({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.optimize;
  const { Icon } = cfg;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
      style={{
        background: `${cfg.color}14`,
        color: cfg.color,
        border: `1px solid ${cfg.color}30`,
      }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function ToolIcon({ tool }) {
  return (
    <motion.div
      whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/8 border border-white/12 backdrop-blur-sm"
    >
      <Bot size={18} className="text-white/70" strokeWidth={1.5} />
      <span
        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f1117]"
        aria-hidden="true"
      />
    </motion.div>
  );
}

function SavingsHero({ savings, annualSavings }) {
  return (
    <div className="relative flex items-end justify-between py-5">
      {/* Monthly savings — dominant */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-white/30 mb-1">
          Monthly Savings
        </p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-5xl font-black tracking-tight text-white leading-none"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {fmt.currency(savings)}
        </motion.p>
        <p className="text-[12px] text-white/35 mt-1 font-medium">per month</p>
      </div>

      {/* Annual savings — secondary */}
      <div className="flex flex-col items-end gap-0.5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-white/30 mb-1">
          Annual Impact
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="flex items-center gap-1.5"
        >
          <CircleDollarSign size={16} className="text-emerald-400" strokeWidth={2} />
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">
            {fmt.currency(annualSavings)}
          </p>
        </motion.div>
        <p className="text-[12px] text-white/35 font-medium">saved per year</p>
      </div>
    </div>
  );
}

function SavingsDivider({ severityConfig }) {
  return (
    <div
      className="h-px w-full mb-5"
      style={{
        background: `linear-gradient(to right, transparent, ${severityConfig.border}, transparent)`,
      }}
    />
  );
}

function RecommendationMessage({ recommendation }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center">
        <Lightbulb size={13} className="text-amber-300" strokeWidth={2} />
      </div>
      <p className="text-[15px] font-semibold text-white/85 leading-snug tracking-[-0.01em]">
        {recommendation}
      </p>
    </div>
  );
}

function ConfidenceBar({ confidence }) {
  const tier =
    confidence >= 85 ? { label: "High Confidence", color: "#34d399" } :
    confidence >= 65 ? { label: "Moderate Confidence", color: "#fbbf24" } :
                      { label: "Low Confidence", color: "#f87171" };

  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] uppercase tracking-widest text-white/30 font-medium">
            Confidence
          </span>
          <span className="text-[11px] font-bold" style={{ color: tier.color }}>
            {confidence}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${tier.color}99, ${tier.color})` }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      </div>
      <BadgeCheck size={15} style={{ color: tier.color }} strokeWidth={2} />
    </div>
  );
}

function CardCTA({ tool, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction}
        className="group/btn w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white/90 bg-white/8 border border-white/12 hover:bg-white/12 hover:border-white/20 transition-all duration-200"
      >
        <span>Apply to {tool}</span>
        <ArrowRight
          size={13}
          className="transition-transform duration-200 group-hover/btn:translate-x-1"
        />
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MOUSE-TRACKING SPOTLIGHT HOOK
// ─────────────────────────────────────────────
function useSpotlight(ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(320px circle at ${x}px ${y}px, rgba(255,255,255,0.04), transparent 70%)`;

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return { background, handleMouseMove };
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function RecommendationCard({
  recommendation: rec,
  onAction,
  showCTA = true,
}) {
  const cardRef = useRef(null);
  const {
    tool,
    type,
    savings,
    annualSavings,
    recommendation,
    severity = "medium",
    confidence,
    category,
  } = rec;

  const sev = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  const { background, handleMouseMove } = useSpotlight(cardRef);

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: "easeOut" } }}
      className="relative w-full max-w-sm rounded-2xl overflow-hidden cursor-default select-none"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${sev.border}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 48px rgba(0,0,0,0.4), 0 0 40px ${sev.glow}`,
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Mouse-tracking spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0 rounded-2xl"
        style={{ background }}
      />

      {/* Severity gradient bleed — top */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-0"
        style={{
          background: `linear-gradient(180deg, ${sev.gradientFrom} 0%, transparent 100%)`,
        }}
      />

      {/* Animated top border glow */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${sev.glowStrong}, transparent)`,
          filter: "blur(1px)",
        }}
      />

      {/* Card content */}
      <div className="relative z-10 p-6">
        {/* ── HEADER ── */}
        <header className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <ToolIcon tool={tool} />
            <div>
              <p className="text-[15px] font-bold text-white tracking-tight leading-none mb-1">
                {tool}
              </p>
              <TypeChip type={type} />
            </div>
          </div>
          <SeverityBadge severity={severity} config={sev} />
        </header>

        {/* ── CATEGORY ── */}
        <div className="mb-1">
          <CategoryBadge category={category} />
        </div>

        {/* ── SAVINGS HERO ── */}
        <SavingsHero savings={savings} annualSavings={annualSavings} />

        <SavingsDivider severityConfig={sev} />

        {/* ── RECOMMENDATION ── */}
        <RecommendationMessage recommendation={recommendation} />

        {/* ── CONFIDENCE ── */}
        <ConfidenceBar confidence={confidence} />

        {/* ── CTA ── */}
        {showCTA && <CardCTA tool={tool} onAction={onAction} />}
      </div>

      {/* Bottom glow leak */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-12 pointer-events-none blur-2xl opacity-40"
        style={{ background: sev.glow }}
      />
    </motion.article>
  );
}