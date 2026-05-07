"use client";

import { motion } from "framer-motion";
import { SectionWrapper, Container, SectionLabel, SectionHeading } from "@/components/ui/Section";
import { Zap, BarChart3, Sparkles, Share2, Cpu, Search } from "lucide-react";

const FEATURES = [
  {
    icon: Zap, color: "#00e87a",
    title: "Instant audit",
    description: "Connect your billing or paste subscription data. SpendLens maps your entire AI stack in under 60 seconds — no engineering work required.",
    span: "lg:col-span-2 lg:row-span-1", big: true,
    accent: "rgba(0,232,122,0.08)",
  },
  {
    icon: BarChart3, color: "#6366f1",
    title: "Savings breakdown",
    description: "See exactly where money leaks: unused seats, idle API spend, duplicate tools, and wrong-tier plans — all with dollar amounts attached.",
    span: "", accent: "rgba(99,102,241,0.08)",
  },
  {
    icon: Sparkles, color: "#f59e0b",
    title: "AI recommendations",
    description: "Our AI analyzes usage patterns across your team and generates a prioritized cut list. Not generic advice — your specific waste.",
    span: "", accent: "rgba(245,158,11,0.08)",
  },
  {
    icon: Share2, color: "#3b82f6",
    title: "Shareable reports",
    description: "Generate a public audit link. Share with your CFO, board, or investors. One click — no login required to view.",
    span: "", accent: "rgba(59,130,246,0.08)",
  },
  {
    icon: Cpu, color: "#ec4899",
    title: "API spend optimizer",
    description: "Connect OpenAI and Anthropic API keys. Analyze token usage, identify waste by endpoint, and suggest model downgrades saving 40–70%.",
    span: "", accent: "rgba(236,72,153,0.08)",
  },
  {
    icon: Search, color: "#a78bfa",
    title: "Continuous monitoring",
    description: "Set spend thresholds. Get Slack alerts when a tool crosses budget. Stop discovering waste months after it started.",
    span: "", accent: "rgba(167,139,250,0.08)",
  },
];

const item = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Features() {
  return (
    <SectionWrapper id="features" className="bg-[#080810]">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#6366f1]/[0.05] rounded-full blur-[130px]" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#00e87a]/[0.03] rounded-full blur-[100px]" />
      </div>

      <Container>
        {/* Header — left-aligned for asymmetry */}
        <div className="mb-16 max-w-xl">
          <SectionLabel className="mb-4">Features</SectionLabel>
          <SectionHeading className="text-white mb-4">
            Everything you need to stop<br />
            <span className="gradient-green">overpaying for AI</span>
          </SectionHeading>
          <p className="text-[#6a6a7a] font-dm text-base leading-relaxed">
            From first audit to ongoing monitoring, SpendLens covers the full lifecycle of AI spend management.
          </p>
        </div>

        {/* Bento grid */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid lg:grid-cols-3 gap-4"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={item}
                className={`bento-card p-7 flex flex-col gap-5 group ${feature.span}`}
              >
                {/* Accent glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[20px]"
                  style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${feature.accent} 0%, transparent 70%)` }}
                />

                {/* Top line accent */}
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${feature.color}50, transparent)` }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center relative flex-shrink-0"
                  style={{
                    background: `linear-gradient(145deg, ${feature.color}20, ${feature.color}08)`,
                    border: `1px solid ${feature.color}28`,
                    boxShadow: `0 0 20px ${feature.color}12`,
                  }}
                >
                  <Icon size={20} style={{ color: feature.color }} />
                </div>

                <div className="flex-1 relative z-10">
                  <h3 className="font-syne font-700 text-white text-lg mb-2.5 leading-tight">{feature.title}</h3>
                  <p className="text-[#6a6a7a] font-dm text-sm leading-relaxed">{feature.description}</p>
                </div>

                {/* Bottom metric chip for hero card */}
                {feature.big && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="px-3 py-1.5 rounded-full text-[11px] font-mono border"
                      style={{ color: feature.color, borderColor: `${feature.color}30`, background: `${feature.color}0c` }}>
                      ⚡ ~60 seconds
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-[11px] font-mono border border-white/[0.07] text-[#6a6a7a]">
                      No engineering required
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </SectionWrapper>
  );
}
