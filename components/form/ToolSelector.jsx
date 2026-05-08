"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

/* ── Tool registry ──────────────────────────────────────────── */
export const AI_TOOLS = {
  ChatGPT:       { plans: ["Plus", "Team", "Enterprise"],   color: "#10a37f", icon: "🤖" },
  Claude:        { plans: ["Pro", "Max", "Team"],           color: "#d97706", icon: "✦"  },
  Cursor:        { plans: ["Pro", "Business"],              color: "#6366f1", icon: "⚡" },
  GitHubCopilot: { plans: ["Individual", "Business"],      color: "#7c3aed", icon: "🐙" },
  Gemini:        { plans: ["Advanced", "API"],              color: "#3b82f6", icon: "♊" },
  OpenAI:        { plans: ["API"],                          color: "#10a37f", icon: "◎"  },
};

const TOOL_NAMES = Object.keys(AI_TOOLS);

/* ── Animation variants ─────────────────────────────────────── */
const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, y: -4, scale: 0.97,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -6 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── ToolDropdown ───────────────────────────────────────────── */
function ToolDropdown({ value, onChange, color, icon }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const id   = useId();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keyboard: Escape to close, arrows in list
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
  }, []);

  const handleSelect = useCallback((name) => {
    onChange(name);
    setOpen(false);
  }, [onChange]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onKeyDown={handleKeyDown}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-10 rounded-xl flex items-center gap-2 px-3 transition-all duration-200 outline-none group"
        style={{
          background: open
            ? "rgba(255,255,255,0.055)"
            : "rgba(255,255,255,0.035)",
          border: open
            ? `1px solid ${color}45`
            : "1px solid rgba(255,255,255,0.065)",
          boxShadow: open ? `0 0 0 3px ${color}15` : "none",
        }}
      >
        {/* Tool icon + name */}
        <span className="text-sm leading-none flex-shrink-0">{icon}</span>
        <span className="flex-1 text-left text-sm font-dm text-white truncate">{value}</span>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
        >
          <ChevronDown size={13} style={{ color: open ? color : "#4a4a5a" }} />
        </motion.span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-labelledby={id}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 rounded-xl overflow-hidden py-1"
            style={{
              background: "linear-gradient(145deg, #13131e 0%, #0e0e18 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05) inset",
            }}
          >
            {TOOL_NAMES.map((name, i) => {
              const meta    = AI_TOOLS[name];
              const active  = name === value;
              return (
                <motion.li
                  key={name}
                  role="option"
                  aria-selected={active}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handleSelect(name)}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors duration-150 group/item"
                  style={{
                    background: active ? `${meta.color}12` : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.035)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = active ? `${meta.color}12` : "transparent"; }}
                >
                  <span className="text-base leading-none w-5 text-center flex-shrink-0">{meta.icon}</span>
                  <span
                    className="flex-1 text-sm font-dm"
                    style={{ color: active ? meta.color : "#a0a0b0" }}
                  >
                    {name}
                  </span>
                  {/* Active checkmark */}
                  {active && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Check size={12} style={{ color: meta.color }} />
                    </motion.span>
                  )}
                  {/* Color accent on right edge */}
                  <div
                    className="w-0.5 h-3 rounded-full opacity-0 group-hover/item:opacity-60 transition-opacity duration-150"
                    style={{ backgroundColor: meta.color }}
                  />
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── PlanPills ──────────────────────────────────────────────── */
function PlanPills({ plans, value, onChange, color }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {plans.map((plan) => {
        const active = plan === value;
        return (
          <motion.button
            key={plan}
            type="button"
            onClick={() => onChange(plan)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="relative h-8 px-3 rounded-lg text-[11px] font-mono transition-colors duration-200 overflow-hidden"
            style={{
              background: active
                ? `linear-gradient(135deg, ${color}22 0%, ${color}10 100%)`
                : "rgba(255,255,255,0.03)",
              border: active
                ? `1px solid ${color}40`
                : "1px solid rgba(255,255,255,0.055)",
              color: active ? color : "#4a4a5a",
              boxShadow: active ? `0 0 16px ${color}18` : "none",
            }}
          >
            {/* Active top edge shimmer */}
            {active && (
              <div
                className="absolute top-0 inset-x-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
              />
            )}
            {plan}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── ToolSelector (exported) ────────────────────────────────── */
/**
 * @param {object}   props
 * @param {string}   props.tool     — currently selected tool name
 * @param {string}   props.plan     — currently selected plan
 * @param {function} props.onChange — called as onChange(toolName, planName)
 */
export default function ToolSelector({ tool, plan, onChange }) {
  const meta  = AI_TOOLS[tool] ?? AI_TOOLS.ChatGPT;
  const color = meta.color;

  // When tool changes, reset plan to first available if current plan is invalid
  const handleToolChange = useCallback((newTool) => {
    const newMeta  = AI_TOOLS[newTool];
    const newPlan  = newMeta.plans.includes(plan) ? plan : newMeta.plans[0];
    onChange(newTool, newPlan);
  }, [plan, onChange]);

  const handlePlanChange = useCallback((newPlan) => {
    onChange(tool, newPlan);
  }, [tool, onChange]);

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] font-mono text-[#3a3a4a] uppercase tracking-[0.14em]">
          AI Tool
        </label>
        {/* Color dot — reflects active tool brand */}
        <motion.div
          key={color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>

      {/* Tool dropdown */}
      <ToolDropdown
        value={tool}
        onChange={handleToolChange}
        color={color}
        icon={meta.icon}
      />

      {/* Plan pills */}
      <div>
        <label className="block text-[9px] font-mono text-[#3a3a4a] uppercase tracking-[0.14em] mb-1.5">
          Plan
        </label>
        <PlanPills
          plans={meta.plans}
          value={plan}
          onChange={handlePlanChange}
          color={color}
        />
      </div>
    </div>
  );
}
