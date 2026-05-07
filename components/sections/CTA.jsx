"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionWrapper, Container } from "@/components/ui/Section";
import { Zap, ArrowRight, Sparkles, Shield, Lock, Users } from "lucide-react";
import GradientText from "@/components/ui/GradientText";

const TRUST = [
  { icon: Shield, text: "SOC 2 Type II" },
  { icon: Lock,   text: "No data stored" },
  { icon: Users,  text: "2,400+ audits"  },
];

export default function CTA() {
  return (
    <SectionWrapper id="cta" className="bg-[#050507]">
      {/* Deep background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#00e87a]/[0.05] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#7c3aed]/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#3b82f6]/[0.04] rounded-full blur-[80px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      <Container>
        {/* Cinematic CTA card — full-width, no centering crutch */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.016) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(0,232,122,0.07)",
          }}
        >
          {/* Inner corner glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#00e87a]/[0.06] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#7c3aed]/[0.07] rounded-full blur-3xl pointer-events-none" />

          {/* Top edge glow line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00e87a]/30 to-transparent" />

          {/* Shimmer sweep */}
          <div className="shimmer-sweep opacity-50" />

          {/* Content — asymmetric: left-heavy */}
          <div className="relative z-10 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center px-12 py-16 sm:px-16 sm:py-20">

            {/* Left: headline */}
            <div>
              <div className="flex items-center gap-2 mb-7">
                <Sparkles size={13} className="text-[#00e87a]" />
                <span className="text-[11px] font-mono text-[#4a4a5a] uppercase tracking-[0.18em]">
                  Free forever · No credit card
                </span>
              </div>

              <h2 className="font-syne font-800 leading-[1.05] tracking-[-0.035em] text-[clamp(2.2rem,4vw,3.8rem)] mb-6">
                Your AI bill is{" "}
                <GradientText variant="fire">lying to you.</GradientText>
                <br />
                <span className="text-white/80">Find out what you&apos;re</span>
                <br />
                <GradientText variant="green">actually wasting.</GradientText>
              </h2>

              <p className="text-[#6a6a7a] font-dm text-lg leading-relaxed max-w-md">
                Run your first audit in 60 seconds. No engineering required. Just a clear, honest breakdown of where your AI money is going — and what to cut.
              </p>
            </div>

            {/* Right: CTA block */}
            <div className="flex flex-col gap-5">
              {/* Primary CTA */}
              <Link href="/audit">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 50px rgba(0,232,122,0.35), 0 0 100px rgba(0,232,122,0.12)" }}
                  whileTap={{ scale: 0.97 }}
                  className="relative group w-full flex items-center justify-center gap-3 px-8 py-4.5 rounded-xl bg-[#00e87a] text-[#050507] font-syne font-700 text-base hover:bg-[#00ff87] transition-colors overflow-hidden"
                >
                  <div className="shimmer-sweep" />
                  <Zap size={18} fill="currentColor" />
                  Start Free Audit
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-200" />
                </motion.button>
              </Link>

              {/* Secondary CTA */}
              <Link href="#demo">
                <motion.button
                  whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.16)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass border border-white/[0.08] text-[#8a8a9a] hover:text-white font-dm text-sm transition-all"
                >
                  See a sample report
                </motion.button>
              </Link>

              {/* Trust row */}
              <div className="flex items-center justify-center gap-5 pt-1">
                {TRUST.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-[#3a3a4a]">
                    <Icon size={11} className="text-[#00e87a]/50" />
                    <span className="text-[11px] font-mono">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </SectionWrapper>
  );
}
