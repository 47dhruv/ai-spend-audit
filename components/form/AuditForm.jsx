"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap, ArrowRight, Sparkles, TrendingDown, DollarSign, Users, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import ToolSelector from "./ToolSelector";
import SpendInput from "./SpendInput";
import TeamSizeInput from "./TeamSizeInput";
import { saveAuditData } from "@/lib/utils/storage";


/* ── Constants ─────────────────────────────────────────────── */
export const AI_TOOLS = {
  ChatGPT:      ["Plus", "Team", "Enterprise"],
  Claude:       ["Pro", "Max", "Team"],
  Cursor:       ["Pro", "Business"],
  GitHubCopilot:["Individual", "Business"],
  Gemini:       ["Advanced", "API"],
  OpenAI:       ["API"],
};

const TOOL_COLORS = {
  ChatGPT:       "#10a37f",
  Claude:        "#d97706",
  Cursor:        "#6366f1",
  GitHubCopilot: "#7c3aed",
  Gemini:        "#3b82f6",
  OpenAI:        "#10a37f",
};

const USE_CASES = [
  { value: "coding",    label: "Engineering",  icon: "⚡" },
  { value: "writing",   label: "Content",      icon: "✍️" },
  { value: "design",    label: "Design",       icon: "🎨" },
  { value: "data",      label: "Data / ML",    icon: "📊" },
  { value: "ops",       label: "Operations",   icon: "⚙️" },
  { value: "mixed",     label: "Mixed",        icon: "🔀" },
];

const INITIAL_TOOL = { tool: "ChatGPT", plan: "Plus", monthlySpend: 20, seats: 1 };

const rowVariants = {
  hidden:  { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

/* ── Live Summary ───────────────────────────────────────────── */
function LiveSummary({ tools, teamSize }) {
  const total   = tools.reduce((s, t) => s + (Number(t.monthlySpend) || 0) * (Number(t.seats) || 1), 0);
  const annual  = total * 12;
  const perHead = teamSize ? Math.round(total / Number(teamSize)) : null;
  const toolCount = tools.length;

  const estimatedSavings = Math.round(total * 0.38);

  return (
    <div className="sticky top-28 flex flex-col gap-3">

      {/* ── Main depth card ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.058) 0%, rgba(255,255,255,0.022) 55%, rgba(0,232,122,0.008) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 48px 140px rgba(0,0,0,0.6), 0 0 80px rgba(0,232,122,0.04)",
        }}
      >
        {/* Top edge glow line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00e87a]/30 to-transparent" />

        {/* Header bar */}
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.055)", background: "rgba(255,255,255,0.018)" }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e87a] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e87a]" />
            </span>
            <span className="text-[10px] font-mono text-[#4a4a5a] uppercase tracking-[0.18em]">Live Estimate</span>
          </div>
          <span
            className="text-[9px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,232,122,0.08)", color: "#00e87a", border: "1px solid rgba(0,232,122,0.18)" }}
          >
            {toolCount} tool{toolCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Big spend number */}
          <div>
            <p className="text-[9px] font-mono text-[#3a3a4a] uppercase tracking-[0.18em] mb-2">Monthly Spend</p>
            <motion.p
              key={total}
              initial={{ opacity: 0.5, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-syne font-800 leading-none"
              style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", color: total > 0 ? "#fff" : "#2a2a3a" }}
            >
              ${total.toLocaleString()}
              <span className="text-sm font-dm font-400 ml-1.5" style={{ color: "#3a3a4a" }}>/mo</span>
            </motion.p>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Stat cells */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Annual",   value: `$${annual.toLocaleString()}` },
              { label: "Per Seat", value: perHead ? `$${perHead}` : "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-[8px] font-mono text-[#3a3a4a] uppercase tracking-widest mb-1.5">{label}</p>
                <motion.p key={value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-sm font-syne font-700 text-white">
                  {value}
                </motion.p>
              </div>
            ))}
          </div>

          {/* Savings potential */}
          {total > 80 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-xl p-3.5"
              style={{
                background: "linear-gradient(135deg, rgba(0,232,122,0.07) 0%, rgba(0,232,122,0.03) 100%)",
                border: "1px solid rgba(0,232,122,0.15)",
                boxShadow: "0 0 24px rgba(0,232,122,0.05)",
              }}
            >
              <div className="shimmer-sweep opacity-30" />
              <div className="flex items-start gap-2.5 relative z-10">
                <Sparkles size={11} className="text-[#00e87a] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-mono text-[#00e87a] uppercase tracking-wider mb-1">Potential Savings</p>
                  <p className="text-[10px] font-dm leading-relaxed" style={{ color: "#5a7a6a" }}>
                    Avg. audit recovers{" "}
                    <span className="font-syne font-700 text-[#00e87a]">${estimatedSavings.toLocaleString()}/mo</span>
                    {" "}for teams like yours.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Breakdown card ── */}
      {tools.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-mono text-[#3a3a4a] uppercase tracking-[0.18em]">Breakdown</p>
            <span className="text-[9px] font-mono text-[#2a2a3a]">% of total</span>
          </div>
          <div className="space-y-3">
            {tools.map((t, i) => {
              const lineTotal = (Number(t.monthlySpend) || 0) * (Number(t.seats) || 1);
              const pct = total > 0 ? Math.round((lineTotal / total) * 100) : 0;
              const color = TOOL_COLORS[t.tool] ?? "#6a6a7a";
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[10px] font-dm" style={{ color: "#6a6a7a" }}>
                        {t.tool}<span className="opacity-50 ml-1">{t.plan}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono" style={{ color: `${color}cc` }}>{pct}%</span>
                      <span className="text-[10px] font-mono" style={{ color: "#4a4a5a" }}>${lineTotal}</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}70` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

}

/* ── Tool Row ───────────────────────────────────────────────── */
function ToolRow({ row, index, onChange, onRemove, canRemove }) {
  const color = TOOL_COLORS[row.tool] ?? "#6a6a7a";

  const set = useCallback(
    (field) => (val) => onChange(index, { ...row, [field]: val }),
    [index, row, onChange]
  );

  return (
    <motion.div
      layout
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ borderColor: `${color}35` }}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.046) 0%, rgba(255,255,255,0.018) 100%)",
        border: `1px solid rgba(255,255,255,0.065)`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.04) inset",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {/* Hover glow — top edge */}
      <div
        className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }}
      />

      {/* Left color accent bar */}
      <div
        className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full transition-all duration-300 opacity-40 group-hover:opacity-90 group-hover:top-0 group-hover:bottom-0"
        style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
      />

      {/* Inner corner glow on hover */}
      <div
        className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `${color}10` }}
      />

      <div className="pl-6 pr-4 py-4 relative z-10">
        {/* Row header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Colored index chip */}
            <div
              className="h-5 flex items-center px-2 rounded-full"
              style={{ background: `${color}14`, border: `1px solid ${color}28` }}
            >
              <span className="text-[9px] font-mono" style={{ color }}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            {/* Tool name display */}
            <span className="text-xs font-syne font-700 text-white/80">{row.tool}</span>
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", color: "#4a4a5a", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {row.plan}
            </span>
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 rounded-lg text-[#2a2a3a] hover:text-red-400 hover:bg-red-500/[0.08] border border-transparent hover:border-red-500/20 transition-all duration-200"
              aria-label="Remove tool"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2">
            <ToolSelector
              tool={row.tool}
              plan={row.plan}
              onChange={(tool, plan) => onChange(index, { ...row, tool, plan })}
            />
          </div>

          <div>
            <SpendInput
              value={row.monthlySpend}
              onChange={set("monthlySpend")}
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono text-[#3a3a4a] uppercase tracking-[0.14em] mb-1.5">
              Seats
            </label>
            <div
              className="relative h-10 rounded-xl flex items-center px-3 gap-2 transition-all duration-200 focus-within:ring-1"
              style={{
                background: "rgba(255,255,255,0.038)",
                border: "1px solid rgba(255,255,255,0.065)",
                "--tw-ring-color": `${color}40`,
              }}
            >
              <Users size={11} className="text-[#3a3a4a] flex-shrink-0" />
              <input
                type="number"
                min={1}
                max={999}
                value={row.seats}
                onChange={(e) => set("seats")(Math.max(1, Number(e.target.value)))}
                className="w-full bg-transparent text-sm font-mono text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Footer: line total */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[9px] font-mono text-[#2a2a3a] uppercase tracking-wider">Line Total</span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ color, background: `${color}12`, border: `1px solid ${color}20` }}
          >
            ${((Number(row.monthlySpend) || 0) * (Number(row.seats) || 1)).toLocaleString()}/mo
          </span>
        </div>
      </div>
    </motion.div>
  );

}

/* ── Main Form ──────────────────────────────────────────────── */
export default function AuditForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [auditData, setAuditData] = useState({
    teamSize: "",
    useCase: "coding",
    tools: [{ ...INITIAL_TOOL }],
  });

  /* ── Handlers ── */
  const setField = (field) => (val) =>
    setAuditData((prev) => ({ ...prev, [field]: val }));

  const handleToolChange = useCallback((index, updated) => {
    setAuditData((prev) => {
      const tools = [...prev.tools];
      tools[index] = updated;
      return { ...prev, tools };
    });
  }, []);

  const addTool = () => {
    setAuditData((prev) => ({
      ...prev,
      tools: [...prev.tools, { ...INITIAL_TOOL }],
    }));
  };

  const removeTool = useCallback((index) => {
    setAuditData((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!auditData.teamSize || auditData.tools.length === 0) return;

  setSubmitting(true);

  const result = saveAuditData(auditData);

  if (!result.ok) {
    console.error(result.error);
    setSubmitting(false);
    return;
  }

  // Small UX delay for premium feel
  await new Promise((r) => setTimeout(r, 800));

  router.push("/results");
};

  const isValid = auditData.teamSize && auditData.tools.length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 xl:gap-8 items-start">

        {/* ── LEFT: Form fields ── */}
        <div className="space-y-4">

          {/* ── Section: Team Context ── */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.046) 0%, rgba(255,255,255,0.016) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            {/* Top edge accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00e87a]/20 to-transparent" />

            <div className="p-6">
              {/* Section label */}
              <div className="flex items-center gap-2.5 mb-6">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.2)" }}
                >
                  <Briefcase size={11} className="text-[#00e87a]" />
                </div>
                <div>
                  <p className="text-xs font-syne font-700 text-white/80">Team Context</p>
                  <p className="text-[9px] font-mono text-[#3a3a4a] mt-0.5">Tell us about your team</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <TeamSizeInput value={auditData.teamSize} onChange={setField("teamSize")} />

                {/* Use case */}
                <div>
                  <label className="block text-[9px] font-mono text-[#3a3a4a] uppercase tracking-[0.16em] mb-2.5">
                    Primary Use Case
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {USE_CASES.map(({ value, label, icon }) => {
                      const active = auditData.useCase === value;
                      return (
                        <motion.button
                          key={value}
                          type="button"
                          onClick={() => setField("useCase")(value)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl text-center transition-colors duration-200"
                          style={{
                            background: active
                              ? "linear-gradient(135deg, rgba(0,232,122,0.1) 0%, rgba(0,232,122,0.05) 100%)"
                              : "rgba(255,255,255,0.025)",
                            border: active ? "1px solid rgba(0,232,122,0.28)" : "1px solid rgba(255,255,255,0.055)",
                            boxShadow: active ? "0 0 20px rgba(0,232,122,0.08), 0 1px 0 rgba(255,255,255,0.04) inset" : "none",
                          }}
                        >
                          <span className="text-base leading-none">{icon}</span>
                          <span
                            className="text-[9px] font-mono leading-tight transition-colors duration-200"
                            style={{ color: active ? "#00e87a" : "#3a3a4a" }}
                          >
                            {label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section: AI Tools ── */}
          <div>
            {/* Tools header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)" }}
                >
                  <Zap size={11} className="text-[#6366f1]" />
                </div>
                <div>
                  <p className="text-xs font-syne font-700 text-white/80">AI Tools</p>
                </div>
                <div
                  className="h-5 flex items-center px-2 rounded-full"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                >
                  <span className="text-[9px] font-mono text-[#6366f1]">{auditData.tools.length}</span>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={addTool}
                disabled={auditData.tools.length >= 8}
                whileHover={auditData.tools.length < 8 ? { scale: 1.03 } : {}}
                whileTap={auditData.tools.length < 8 ? { scale: 0.97 } : {}}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-200 disabled:opacity-30"
                style={{
                  color: "#00e87a",
                  background: "rgba(0,232,122,0.06)",
                  border: "1px solid rgba(0,232,122,0.18)",
                }}
              >
                <Plus size={11} className="group-hover:rotate-90 transition-transform duration-200" />
                Add Tool
              </motion.button>
            </div>

            {/* Animated rows */}
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {auditData.tools.map((row, i) => (
                  <ToolRow
                    key={`tool-${i}`}
                    row={row}
                    index={i}
                    onChange={handleToolChange}
                    onRemove={removeTool}
                    canRemove={auditData.tools.length > 1}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Submit — mobile only */}
          <div className="lg:hidden pt-1">
            <SubmitButton submitting={submitting} isValid={isValid} />
          </div>
        </div>

        {/* ── RIGHT: Sticky summary + desktop submit ── */}
        <div className="hidden lg:flex flex-col gap-3">
          <LiveSummary tools={auditData.tools} teamSize={auditData.teamSize} />
          <SubmitButton submitting={submitting} isValid={isValid} />
        </div>
      </div>
    </form>
  );
}

/* ── Submit Button ──────────────────────────────────────────── */
function SubmitButton({ submitting, isValid }) {
  return (
    <motion.button
      type="submit"
      disabled={!isValid || submitting}
      whileHover={isValid && !submitting ? { scale: 1.015 } : {}}
      whileTap={isValid && !submitting ? { scale: 0.985 } : {}}
      className="relative w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-syne font-700 text-sm overflow-hidden transition-all duration-300 disabled:cursor-not-allowed"
      style={{
        background: isValid
          ? "linear-gradient(135deg, #00e87a 0%, #00d4a0 100%)"
          : "rgba(255,255,255,0.04)",
        color: isValid ? "#050507" : "#2a2a3a",
        border: isValid ? "1px solid rgba(0,232,122,0.5)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isValid
          ? "0 1px 0 rgba(255,255,255,0.3) inset, 0 0 0 1px rgba(0,232,122,0.25), 0 8px 40px rgba(0,232,122,0.25)"
          : "none",
        opacity: !isValid && !submitting ? 0.45 : 1,
      }}
    >
      {isValid && <div className="shimmer-sweep" />}
      {submitting ? (
        <>
          <div className="w-4 h-4 border-2 border-[#050507]/30 border-t-[#050507] rounded-full animate-spin" />
          <span>Analysing your stack…</span>
        </>
      ) : (
        <>
          <Zap size={15} fill="currentColor" />
          <span>Generate Audit Report</span>
          <ArrowRight size={14} className="ml-auto" />
        </>
      )}
    </motion.button>
  );
}