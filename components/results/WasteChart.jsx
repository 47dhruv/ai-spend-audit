"use client";

/**
 * components/results/WasteChart.jsx
 *
 * Spend breakdown charts — built with pure SVG + CSS.
 * No recharts dependency. Fully animated with Framer Motion.
 *
 * Sections:
 *   1. SVG donut ring — waste vs efficient spend
 *   2. Horizontal bar chart — per-tool spend breakdown
 */

import { useMemo, memo, useState } from "react";
import { motion } from "framer-motion";
import EmptyState from "@/components/primitives/EmptyState";

// ─── Colour palette ───────────────────────────────────────────────────────────

const TOOL_COLORS = [
  "#f43f5e", "#00e87a", "#7c3aed", "#3b82f6",
  "#f59e0b", "#06b6d4", "#ec4899", "#84cc16",
];

// ─── Donut ring helpers ───────────────────────────────────────────────────────

/**
 * Converts a percentage to an SVG stroke-dasharray value
 * on a circle with r=54 (circumference ≈ 339.3)
 */
const CIRCUMFERENCE = 2 * Math.PI * 54; // ≈ 339.3

function pctToDash(pct) {
  return `${(pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
}

// ─── Donut chart ─────────────────────────────────────────────────────────────

function DonutChart({ wastePercent, efficient, waste }) {
  const [hovered, setHovered] = useState(null);

  // Two segments: waste (red) first, then efficient (green)
  const segments = [
    { label: "Waste",     pct: wastePercent,       color: "#f43f5e", value: waste    },
    { label: "Efficient", pct: 100 - wastePercent, color: "#00e87a", value: efficient },
  ];

  // Stroke offsets — each segment starts where the previous ended
  let cumulativeOffset = CIRCUMFERENCE * 0.25; // start at 12 o'clock
  const segmentsWithOffset = segments.map((seg) => {
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += (seg.pct / 100) * CIRCUMFERENCE;
    return { ...seg, dashOffset };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 120 120">
          {/* Track ring */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />

          {/* Segments */}
          {segmentsWithOffset.map((seg, i) => (
            <motion.circle
              key={seg.label}
              cx="60" cy="60" r="54"
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === i ? 14 : 12}
              strokeLinecap="round"
              strokeDasharray={pctToDash(seg.pct)}
              strokeDashoffset={seg.dashOffset}
              style={{ opacity: hovered !== null && hovered !== i ? 0.3 : 0.9, cursor: "pointer", transition: "stroke-width 0.2s ease, opacity 0.2s ease" }}
              initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
              animate={{ strokeDasharray: pctToDash(seg.pct) }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {/* Centre text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ gap: 2 }}
        >
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: "#f0f0f5", fontFamily: "var(--font-syne,Syne,sans-serif)", lineHeight: 1 }}
          >
            {wastePercent}%
          </span>
          <span
            className="text-[10px] tracking-widest uppercase"
            style={{ color: "#4a4a5a", letterSpacing: "0.12em" }}
          >
            waste
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
              <span style={{ color: "#6a6a7a" }}>{seg.label}</span>
            </div>
            <span className="font-semibold tabular-nums" style={{ color: "#c0c0d0" }}>
              ${seg.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal bar chart ─────────────────────────────────────────────────────

function HorizBar({ tool, spend, maxSpend, color, index }) {
  const pct = maxSpend > 0 ? (spend / maxSpend) * 100 : 0;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-3 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tool name */}
      <div
        className="text-xs w-24 flex-shrink-0 truncate text-right"
        style={{ color: hovered ? "#c0c0d0" : "#6a6a7a", transition: "color 0.2s ease" }}
        title={tool}
      >
        {tool}
      </div>

      {/* Bar track */}
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 8, background: "rgba(255,255,255,0.04)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, opacity: hovered ? 1 : 0.8 }}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.1 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Value */}
      <div
        className="text-xs tabular-nums w-16 flex-shrink-0 font-semibold"
        style={{ color: hovered ? color : "#4a4a5a", transition: "color 0.2s ease" }}
      >
        ${spend.toLocaleString()}
      </div>
    </div>
  );
}

// ─── Main chart component ─────────────────────────────────────────────────────

const WasteChart = memo(function WasteChart({ auditData }) {
  const {
    totalMonthlySpend = 0,
    estimatedSavings  = 0,
    wastePercentage   = 0,
    toolBreakdown,
  } = auditData ?? {};

  const efficient = Math.max(totalMonthlySpend - estimatedSavings, 0);

  // Per-tool bar data
  const barData = useMemo(() => {
    if (!toolBreakdown) return [];
    return Object.values(toolBreakdown)
      .map((t, i) => ({
        name:  t.name  ?? `Tool ${i + 1}`,
        spend: t.effectiveMonthlyCost ?? t.monthlySpend ?? 0,
        color: TOOL_COLORS[i % TOOL_COLORS.length],
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 8);
  }, [toolBreakdown]);

  const maxSpend = barData[0]?.spend ?? 1;

  if (!totalMonthlySpend) {
    return (
      <EmptyState
        variant="empty-chart"
        action={{ label: "New Audit", href: "/audit" }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0   }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 lg:grid-cols-5 gap-5"
    >
      {/* ── Donut ── */}
      <div className="chart-surface lg:col-span-2 p-6 space-y-5">
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "#f0f0f5", fontFamily: "var(--font-syne,Syne,sans-serif)" }}
          >
            Spend Composition
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#4a4a5a" }}>
            Waste vs efficient spend
          </p>
        </div>

        <DonutChart
          wastePercent={wastePercentage}
          efficient={efficient}
          waste={estimatedSavings}
        />
      </div>

      {/* ── Horizontal bars ── */}
      <div className="chart-surface lg:col-span-3 p-6 space-y-5">
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "#f0f0f5", fontFamily: "var(--font-syne,Syne,sans-serif)" }}
          >
            Per-Tool Monthly Cost
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#4a4a5a" }}>
            Sorted by spend · hover to highlight
          </p>
        </div>

        {barData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs" style={{ color: "#3a3a4a" }}>No per-tool data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {barData.map((d, i) => (
              <HorizBar
                key={d.name}
                tool={d.name}
                spend={d.spend}
                maxSpend={maxSpend}
                color={d.color}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Total row */}
        <div
          className="pt-3 flex items-center justify-between text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span style={{ color: "#4a4a5a" }}>Total Monthly</span>
          <span className="font-bold tabular-nums" style={{ color: "#f0f0f5" }}>
            ${totalMonthlySpend.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default WasteChart;
