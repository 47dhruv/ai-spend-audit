"use client";

/**
 * components/results/KPIStrip.jsx
 *
 * Top-of-dashboard animated KPI strip.
 * 4 key metrics displayed as interactive cards with:
 *   - Count-up animation on first view
 *   - Hover lift + glow
 *   - Tooltip with metric explanation
 *   - Mobile horizontal scroll snap
 *   - Trend delta indicators
 *
 * Receives pre-formatted metric array from transformAuditResult.
 * Augments with icon and tooltip content at this layer (not the data layer).
 */

import { useRef, useEffect, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  DollarSign, TrendingDown, Zap, Target,
  ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import Tooltip from "@/components/primitives/Tooltip";

// ─── Icon + tooltip map ───────────────────────────────────────────────────────

const METRIC_META = {
  monthly_spend: {
    Icon: DollarSign,
    tooltip: "Total amount your team currently pays for all AI tool subscriptions per month.",
    trendLabel: (change) => change,
  },
  annual_spend: {
    Icon: TrendingDown,
    tooltip: "Annualised cost based on current monthly spend. Applies if no changes are made.",
    trendLabel: (change) => change,
  },
  monthly_savings: {
    Icon: Zap,
    tooltip: "Estimated monthly savings if all recommendations in this report are implemented.",
    trendLabel: (change) => change,
  },
  audit_score: {
    Icon: Target,
    tooltip: "Composite score (0–100) measuring AI spend efficiency. Higher = less waste.",
    trendLabel: (change) => change,
  },
};

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(rawValue, active, duration = 1000) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!active) return;
    const match = String(rawValue).match(/^([^0-9]*)([0-9,.]+)([^0-9]*)$/);
    if (!match) { setDisplay(rawValue); return; }

    const [, prefix, numStr, suffix] = match;
    const target   = parseFloat(numStr.replace(/,/g, ""));
    const decimals = numStr.includes(".")
      ? (numStr.split(".")[1] ?? "").length
      : 0;

    if (isNaN(target)) { setDisplay(rawValue); return; }

    const startTime = performance.now();
    function easeOut(t) { return 1 - (1 - t) ** 3; }

    function tick(now) {
      const t       = Math.min((now - startTime) / duration, 1);
      const current = target * easeOut(t);
      const formatted = decimals
        ? current.toFixed(decimals)
        : Math.round(current).toLocaleString();
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [active, rawValue, duration]);

  return display;
}

// ─── Trend Arrow ──────────────────────────────────────────────────────────────

function TrendArrow({ trend }) {
  if (trend === "positive") return <ArrowUpRight size={12} style={{ color: "#00e87a" }} />;
  if (trend === "negative") return <ArrowDownRight size={12} style={{ color: "#f43f5e" }} />;
  return <Minus size={12} style={{ color: "#6a6a7a" }} />;
}

// ─── Single KPI card ──────────────────────────────────────────────────────────

function KPICard({ metric, index }) {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const display  = useCountUp(metric.value, isInView, 900 + index * 80);
  const [hovered, setHovered] = useState(false);

  const meta = METRIC_META[metric.id] ?? {};
  const { Icon = DollarSign, tooltip } = meta;

  const trendColor = {
    positive: "rgba(0,232,122,0.7)",
    negative: "rgba(244,63,94,0.7)",
    warning:  "rgba(245,158,11,0.7)",
    neutral:  "rgba(99,102,241,0.7)",
  }[metric.trend] ?? "rgba(144,144,160,0.6)";

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="kpi-card rounded-2xl p-5 cursor-default select-none relative overflow-hidden"
      style={{
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${trendColor}30`
          : "0 4px 16px rgba(0,0,0,0.2)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease",
      }}
      aria-label={`${metric.title}: ${metric.value}`}
    >
      {/* Top accent line */}
      <div
        aria-hidden
        className="absolute top-0 left-4 right-4 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${trendColor}60, transparent)` }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${trendColor}18`, border: `1px solid ${trendColor}25` }}
          >
            <Icon size={13} style={{ color: trendColor }} strokeWidth={2} />
          </div>
          <span
            className="text-[11px] font-medium tracking-wide uppercase"
            style={{ color: "#4a4a5a", letterSpacing: "0.1em" }}
          >
            {metric.title}
          </span>
        </div>

        {tooltip && (
          <Tooltip content={tooltip} placement="top">
            <button
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.04)", color: "#3a3a4a" }}
              aria-label={`Info: ${metric.title}`}
            >
              <span className="text-[10px] font-bold">?</span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* Value */}
      <div
        className="text-2xl font-bold tabular-nums mb-1.5"
        style={{
          color: "#f0f0f5",
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          letterSpacing: "-0.02em",
        }}
      >
        {display}
      </div>

      {/* Delta */}
      <div className="flex items-center gap-1.5">
        <TrendArrow trend={metric.trend} />
        <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
          {metric.change}
        </span>
      </div>
    </motion.article>
  );
}

// ─── Strip ────────────────────────────────────────────────────────────────────

/**
 * @param {object}    props
 * @param {Array}     props.metrics — from transformAuditResult().metrics
 */
export default function KPIStrip({ metrics = [] }) {
  return (
    <section aria-label="Key performance indicators">
      {/* Desktop: grid — Mobile: horizontal scroll */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {metrics.map((metric, i) => (
          <KPICard key={metric.id} metric={metric} index={i} />
        ))}
      </div>
    </section>
  );
}
