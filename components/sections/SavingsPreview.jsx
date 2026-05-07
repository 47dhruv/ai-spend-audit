"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper, Container, SectionLabel, SectionHeading } from "@/components/ui/Section";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Minus, Plus, TrendingDown } from "lucide-react";

const TOOLS = [
  { name: "ChatGPT Plus",    seats: 8,  cost: 20,   efficiency: 55, color: "#10a37f" },
  { name: "GitHub Copilot",  seats: 10, cost: 19,   efficiency: 65, color: "#7c3aed" },
  { name: "Cursor",          seats: 10, cost: 20,   efficiency: 40, color: "#6366f1" },
  { name: "Claude Pro",      seats: 6,  cost: 20,   efficiency: 72, color: "#d97706" },
  { name: "OpenAI API",      seats: 1,  cost: 1840, efficiency: 42, color: "#10a37f", isApi: true },
  { name: "Gemini Advanced", seats: 8,  cost: 20,   efficiency: 28, color: "#3b82f6" },
];

function buildRecommendation(tools) {
  // Simple rule-based savings calculator
  let savings = 0;
  const recs = [];

  tools.forEach((t) => {
    const unused = 100 - t.efficiency;
    const monthlyTotal = t.isApi ? t.cost : t.seats * t.cost;
    const potentialSaving = Math.round(monthlyTotal * (unused / 100) * 0.7);
    if (potentialSaving > 30) {
      savings += potentialSaving;
      recs.push({ tool: t.name, saving: potentialSaving });
    }
  });

  return { savings, recs };
}

export default function SavingsPreview() {
  const [tools, setTools] = useState(TOOLS);

  const updateSeats = (index, delta) => {
    setTools((prev) =>
      prev.map((t, i) =>
        i === index
          ? { ...t, seats: Math.max(1, Math.min(50, t.seats + delta)) }
          : t
      )
    );
  };

  const totalMonthly = tools.reduce(
    (sum, t) => sum + (t.isApi ? t.cost : t.seats * t.cost),
    0
  );

  const { savings, recs } = buildRecommendation(tools);
  const annualSavings = savings * 12;

  return (
    <SectionWrapper id="savings" className="bg-[#0a0a0a]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#00e87a]/[0.03] rounded-full blur-[100px] -translate-y-1/2" />
      </div>

      <Container>
        <div className="text-center mb-14">
          <SectionLabel className="mb-4">Interactive preview</SectionLabel>
          <SectionHeading className="text-white mb-3">
            See your savings<br />
            <span className="gradient-green">before you commit</span>
          </SectionHeading>
          <p className="text-[#555] font-dm text-base max-w-md mx-auto">
            Adjust your team size and tool mix below — watch your potential savings update in real time.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
          {/* Tool configurator */}
          <div className="glass-strong rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-xs font-mono text-[#555] uppercase tracking-widest">Your AI stack</p>
              <p className="text-xs font-mono text-[#555]">
                Total: <span className="text-white">${totalMonthly.toLocaleString()}/mo</span>
              </p>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {tools.map((tool, i) => {
                const monthlyTotal = tool.isApi ? tool.cost : tool.seats * tool.cost;
                const wasteAmt = Math.round(monthlyTotal * ((100 - tool.efficiency) / 100));
                return (
                  <div key={tool.name} className="px-6 py-4 flex items-center gap-4">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: tool.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-dm text-white">{tool.name}</p>
                        <p className="text-xs font-mono text-[#666]">${monthlyTotal.toLocaleString()}/mo</p>
                      </div>
                      {/* Usage bar */}
                      <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 bottom-0 rounded-full transition-all"
                          style={{ width: `${tool.efficiency}%`, background: tool.color }}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 rounded-r-full bg-red-500/40"
                          style={{ width: `${100 - tool.efficiency}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] font-mono text-[#444]">{tool.efficiency}% used</span>
                        <span className="text-[10px] font-mono text-red-400">~${wasteAmt}/mo waste</span>
                      </div>
                    </div>
                    {/* Seat adjuster (not for API) */}
                    {!tool.isApi && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateSeats(i, -1)}
                          className="w-6 h-6 rounded-md bg-white/[0.05] hover:bg-white/[0.09] flex items-center justify-center text-[#777] hover:text-white transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-xs font-mono text-white">{tool.seats}</span>
                        <button
                          onClick={() => updateSeats(i, 1)}
                          className="w-6 h-6 rounded-md bg-white/[0.05] hover:bg-white/[0.09] flex items-center justify-center text-[#777] hover:text-white transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings result */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Big savings number */}
            <div className="glass-strong rounded-2xl p-7 text-center">
              <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-3">
                Estimated monthly savings
              </p>
              <div className="text-5xl font-syne font-800 text-[#00e87a] leading-none mb-2">
                <AnimatedCounter from={0} to={savings} prefix="$" duration={600} />
              </div>
              <p className="text-sm font-dm text-[#555]">
                That&apos;s <span className="text-white font-medium">${annualSavings.toLocaleString()}/year</span> back in your runway
              </p>

              <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[#555]">
                <TrendingDown size={14} className="text-[#00e87a]" />
                <span className="text-xs font-mono">
                  {savings > 0 ? Math.round((savings / totalMonthly) * 100) : 0}% reduction in AI spend
                </span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-3">Top recommendations</p>
              <AnimatePresence mode="popLayout">
                {recs.slice(0, 4).map((r) => (
                  <motion.div
                    key={r.tool}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="flex items-center justify-between gap-4"
                  >
                    <p className="text-xs font-dm text-[#777] truncate">{r.tool}</p>
                    <span className="text-xs font-mono text-[#00e87a] flex-shrink-0">
                      −${r.saving}/mo
                    </span>
                  </motion.div>
                ))}
                {recs.length === 0 && (
                  <p className="text-xs font-dm text-[#444] text-center py-2">
                    Adjust team size to see recommendations
                  </p>
                )}
              </AnimatePresence>
            </div>

            <button className="w-full py-4 rounded-xl bg-[#00e87a] text-[#080808] font-syne font-700 text-sm hover:bg-[#00ff87] transition-colors">
              Run full audit free →
            </button>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
