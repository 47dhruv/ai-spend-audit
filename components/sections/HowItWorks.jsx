"use client";

import { motion } from "framer-motion";
import { SectionWrapper, Container, SectionLabel, SectionHeading } from "@/components/ui/Section";
import { ClipboardList, Zap, TrendingDown } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: ClipboardList,
    color: "#00e87a",
    title: "List your AI tools",
    description:
      "Tell us what you're paying for — ChatGPT, Cursor, Copilot, Claude, OpenAI API keys. Takes 2 minutes. No integrations required.",
    detail: "Supports 40+ AI tools and APIs",
  },
  {
    number: "02",
    icon: Zap,
    color: "#6366f1",
    title: "SpendLens audits instantly",
    description:
      "Our engine cross-references your stack against team size, usage patterns, and known pricing tiers. It finds overlaps, idle plans, and wrong-tier subscriptions.",
    detail: "AI-powered waste detection engine",
  },
  {
    number: "03",
    icon: TrendingDown,
    color: "#f59e0b",
    title: "Get your savings report",
    description:
      "A clear, prioritized list of exactly what to cancel, downgrade, or consolidate — with dollar amounts. Share it with your CFO or act on it yourself in minutes.",
    detail: "Shareable link · No login for viewer",
  },
];

export default function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" className="bg-[#080808]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[400px] h-[500px] bg-[#6366f1]/[0.03] rounded-full blur-[120px] -translate-y-1/2" />
      </div>

      <Container>
        <div className="text-center mb-16">
          <SectionLabel className="mb-4">How it works</SectionLabel>
          <SectionHeading className="text-white mb-3">
            From &quot;I think we&apos;re overpaying&quot;<br />
            to{" "}
            <span className="gradient-green">&quot;I just saved $2,840/mo&quot;</span>
          </SectionHeading>
          <p className="text-[#555] font-dm text-base max-w-sm mx-auto">
            Three steps. Under five minutes. Zero engineering work.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="relative glass-strong rounded-2xl p-8 flex flex-col gap-5 hover:border-white/[0.12] transition-all duration-300 group overflow-hidden"
                >
                  {/* Background glow on hover */}
                  <div
                    className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `${step.color}20` }}
                  />

                  {/* Step number + icon */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                      style={{ background: `${step.color}18`, border: `1px solid ${step.color}33` }}
                    >
                      <Icon size={20} style={{ color: step.color }} />
                    </div>
                    <span
                      className="font-syne font-800 text-5xl leading-none opacity-10 group-hover:opacity-20 transition-opacity"
                      style={{ color: step.color }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-syne font-700 text-white text-xl mb-3">{step.title}</h3>
                    <p className="text-[#555] font-dm text-sm leading-relaxed">{step.description}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/[0.05]">
                    <p
                      className="text-xs font-mono"
                      style={{ color: step.color }}
                    >
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Time indicator */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 flex items-center justify-center gap-6 text-[#444]"
        >
          {["Step 1: 2 min", "Step 2: Auto", "Step 3: Instant"].map((t, i) => (
            <div key={t} className="flex items-center gap-2 text-xs font-mono">
              {i > 0 && <div className="w-6 h-px bg-white/[0.08]" />}
              <span>{t}</span>
            </div>
          ))}
        </motion.div>
      </Container>
    </SectionWrapper>
  );
}
