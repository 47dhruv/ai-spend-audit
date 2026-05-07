"use client";

import { motion } from "framer-motion";
import { SectionWrapper, Container, SectionLabel, SectionHeading } from "@/components/ui/Section";
import { AlertCircle, CreditCard, Copy, TrendingUp } from "lucide-react";

const WASTE_ITEMS = [
  {
    icon: CreditCard,
    color: "#f59e0b",
    title: "Duplicate seats",
    description: "4 engineers have individual ChatGPT Plus ($80/mo) AND your team pays for ChatGPT Team. Classic overlap.",
    wasted: "$80/mo",
  },
  {
    icon: Copy,
    color: "#ef4444",
    title: "Overlapping tools",
    description: "Cursor and GitHub Copilot do the same job. 60% of your engineers use one, 40% use the other — you pay for both.",
    wasted: "$576/mo",
  },
  {
    icon: AlertCircle,
    color: "#6366f1",
    title: "Idle API credits",
    description: "Your OpenAI API key hit $1,840 last month. Usage analytics show only 42% was from production — the rest? Dev experiments nobody deleted.",
    wasted: "$1,067/mo",
  },
  {
    icon: TrendingUp,
    color: "#3b82f6",
    title: "Wrong tier",
    description: "You're on Claude Pro ($20/seat × 6 = $120/mo) but API usage logs show your team only hits 12% of the context limit. Downgrade saves 60%.",
    wasted: "$72/mo",
  },
];

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Problem() {
  return (
    <SectionWrapper id="problem" className="bg-[#0a0a0a]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-red-500/[0.025] rounded-full blur-[100px]" />
      </div>

      <Container>
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
          {/* Left: copy */}
          <div>
            <SectionLabel className="mb-5">The problem</SectionLabel>
            <SectionHeading className="text-white mb-6">
              Your AI bill is a<br />
              <span className="gradient-fire">money bonfire</span><br />
              and nobody noticed.
            </SectionHeading>
            <p className="text-[#555] font-dm text-base leading-relaxed mb-8">
              The average 10-person engineering team wastes <strong className="text-[#aaa]">$3,400/month</strong> on AI subscriptions they don&apos;t fully use — duplicate seats, overlapping tools, idle API credits, and wrong-tier plans.
            </p>
            <p className="text-[#555] font-dm text-base leading-relaxed">
              Most finance teams can&apos;t see it. Most CTOs don&apos;t have time to audit it. That&apos;s{" "}
              <strong className="text-[#aaa]">$40,800/year</strong> quietly disappearing.
            </p>

            {/* Burn rate visual */}
            <div className="mt-8 p-4 rounded-xl bg-red-500/[0.06] border border-red-500/[0.15] flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                🔥
              </div>
              <div>
                <p className="text-sm font-syne font-700 text-white">Avg. waste per team</p>
                <p className="text-xs font-mono text-red-400">$3,400/month · $40,800/year</p>
              </div>
            </div>
          </div>

          {/* Right: waste breakdown cards */}
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {WASTE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className="glass rounded-xl p-5 flex gap-4 hover:border-white/[0.1] transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
                  >
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-syne font-700 text-white">{item.title}</p>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ color: item.color, background: `${item.color}18` }}
                      >
                        {item.wasted}
                      </span>
                    </div>
                    <p className="text-xs font-dm text-[#555] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Total bar */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-5 bg-gradient-to-r from-red-500/[0.08] to-amber-500/[0.06] border border-red-500/[0.2]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-syne font-700 text-white">Total hidden waste</p>
                <p className="text-lg font-syne font-800 text-red-400">$1,795/mo</p>
              </div>
              <p className="text-[11px] font-mono text-[#555] mt-1">= $21,540/year you could keep</p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
