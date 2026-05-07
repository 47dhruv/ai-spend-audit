"use client";

import { motion } from "framer-motion";
import { SectionWrapper, Container, SectionLabel, SectionHeading } from "@/components/ui/Section";
import { TrendingUp, Star, Quote } from "lucide-react";

const LOGOS = [
  { name: "Acme Corp",    abbr: "AC", color: "#6366f1" },
  { name: "Doppler",      abbr: "DP", color: "#3b82f6" },
  { name: "Synthwave",    abbr: "SW", color: "#10a37f" },
  { name: "Memo AI",      abbr: "MA", color: "#f59e0b" },
  { name: "Forge Labs",   abbr: "FL", color: "#ec4899" },
  { name: "Prismatic",    abbr: "PR", color: "#7c3aed" },
  { name: "Cascade",      abbr: "CS", color: "#06b6d4" },
  { name: "Vertex",       abbr: "VX", color: "#22c55e" },
];

const METRICS = [
  { value: "$4.2M+", label: "Saved this month",    color: "#00e87a" },
  { value: "2,400+", label: "Audits completed",    color: "#6366f1" },
  { value: "53%",    label: "Average waste found", color: "#f59e0b" },
  { value: "60s",    label: "Time to first audit", color: "#3b82f6" },
];

const TESTIMONIALS = [
  {
    name:    "Sarah Kim",
    role:    "CTO @ Synthwave",
    avatar:  "SK",
    color:   "#10a37f",
    rating:  5,
    text:    "We found $3,200/mo in wasted AI subscriptions on the first run. Four engineers had ChatGPT Plus when we were already paying for the Team plan. SpendLens caught it instantly.",
  },
  {
    name:    "Marcus Reid",
    role:    "Engineering Lead @ Doppler",
    avatar:  "MR",
    color:   "#3b82f6",
    rating:  5,
    text:    "Instant ROI. We cut our AI bill by 47% without losing any capability. The duplicate-seat detection alone paid for a year of SpendLens in one audit.",
  },
  {
    name:    "Priya Mehta",
    role:    "Head of Infrastructure @ Memo",
    avatar:  "PM",
    color:   "#f59e0b",
    rating:  5,
    text:    "Best $0 we've ever spent. The AI recommendation engine told us to consolidate Cursor and Copilot — we didn't even realize both were active. $580/mo back.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function SocialProof() {
  return (
    <SectionWrapper id="social-proof" className="bg-[#080808]">
      {/* Subtle top separator glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00e87a]/20 to-transparent" />

      <Container>
        {/* Section label */}
        <div className="text-center mb-12">
          <SectionLabel className="mb-4">Trusted by lean teams</SectionLabel>
          <SectionHeading className="text-white mb-3">
            The teams that move fast<br />
            <span className="gradient-green">save even faster</span>
          </SectionHeading>
          <p className="text-[#555] font-dm text-base max-w-md mx-auto">
            Startups from pre-seed to Series B use SpendLens to keep their AI spend lean.
          </p>
        </div>

        {/* Logo grid */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-16"
        >
          {LOGOS.map((logo) => (
            <motion.div
              key={logo.name}
              variants={itemVariants}
              title={logo.name}
              className="flex flex-col items-center gap-2 group cursor-default"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-syne font-700 text-white transition-transform group-hover:scale-110"
                style={{ background: `${logo.color}22`, border: `1px solid ${logo.color}33` }}
              >
                {logo.abbr}
              </div>
              <span className="text-[10px] font-dm text-[#444] text-center hidden sm:block">
                {logo.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Metric bar */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.06] mb-16"
        >
          {METRICS.map((m) => (
            <motion.div
              key={m.label}
              variants={itemVariants}
              className="flex flex-col items-center justify-center py-8 px-6 bg-[#0d0d0d] hover:bg-[#111] transition-colors"
            >
              <div
                className="text-3xl sm:text-4xl font-syne font-800 leading-none mb-2"
                style={{ color: m.color }}
              >
                {m.value}
              </div>
              <p className="text-xs font-mono text-[#555] text-center uppercase tracking-wider">
                {m.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={itemVariants}
              className="glass-strong rounded-2xl p-6 flex flex-col gap-4 hover:border-white/[0.12] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="#f59e0b" className="text-amber-400" />
                  ))}
                </div>
                <Quote size={16} className="text-[#333]" />
              </div>
              <p className="text-[#aaa] font-dm text-sm leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-syne font-700 text-white flex-shrink-0"
                  style={{ background: `${t.color}33`, border: `1px solid ${t.color}44` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-syne font-700 text-white leading-none">{t.name}</p>
                  <p className="text-[11px] font-dm text-[#555] mt-0.5">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </SectionWrapper>
  );
}
