"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, TrendingDown, Shield, Zap, BarChart3, Sparkles, AlertCircle, CheckCircle2, Lock, Users, Star } from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import GradientText from "@/components/ui/GradientText";

const AI_TOOLS = [
  { name: "ChatGPT",  logo: "🤖", monthly: 180, waste: 67, color: "#10a37f", position: { top: "6%",   right: "4%"  }, delay: 0    },
  { name: "Cursor",   logo: "⚡", monthly: 192, waste: 48, color: "#6366f1", position: { top: "36%",  right: "-3%" }, delay: 0.15 },
  { name: "Copilot",  logo: "🐙", monthly: 228, waste: 55, color: "#7c3aed", position: { bottom: "20%", right: "2%" }, delay: 0.3  },
  { name: "Claude",   logo: "✦",  monthly: 84,  waste: 31, color: "#d97706", position: { top: "20%",  left: "-5%" }, delay: 0.1  },
  { name: "Gemini",   logo: "♊", monthly: 96,  waste: 72, color: "#3b82f6", position: { bottom: "28%", left: "-3%" }, delay: 0.25 },
];

const SPEND_BARS = [
  { label: "OpenAI API",   amount: 1840, used: 42, color: "#10a37f" },
  { label: "Cursor IDE",   amount: 576,  used: 65, color: "#6366f1" },
  { label: "Copilot",      amount: 684,  used: 55, color: "#7c3aed" },
  { label: "ChatGPT Plus", amount: 540,  used: 33, color: "#10a37f" },
  { label: "Claude Pro",   amount: 252,  used: 71, color: "#d97706" },
  { label: "Gemini Adv.",  amount: 288,  used: 28, color: "#3b82f6" },
];

const TRUST_ITEMS = [
  { icon: Shield, text: "SOC 2 Type II" },
  { icon: Lock,   text: "No data stored" },
  { icon: Users,  text: "2,400+ audits"  },
  { icon: Zap,    text: "60-sec setup"   },
];

const STAR_REVIEWS = [
  { name: "Sarah K.",  role: "CTO @ Synthwave",       avatar: "SK", text: "Found $3,200/mo we were burning." },
  { name: "Marcus R.", role: "Eng Lead @ Doppler",     avatar: "MR", text: "Instant ROI. Run this yesterday." },
  { name: "Priya M.",  role: "Head of Infra @ Memo",   avatar: "PM", text: "Best $0 I've ever spent."         },
];

function ToolCard({ tool, index }) {
  const isHigh = tool.waste > 60;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.9 + tool.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={tool.position}
      className="absolute z-20"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + index * 1.2, ease: "easeInOut", repeat: Infinity }}
        className="glass rounded-xl px-3 py-2.5 flex items-center gap-2.5 cursor-default"
        style={{ borderColor: `${tool.color}28`, boxShadow: `0 0 20px ${tool.color}10` }}
      >
        <span className="text-base leading-none">{tool.logo}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-syne font-700 text-white leading-none mb-1">{tool.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#6a6a7a]">${tool.monthly}/mo</span>
            <span className={`text-[9px] font-mono px-1 rounded ${isHigh ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
              {tool.waste}% waste
            </span>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isHigh ? "bg-red-400" : "bg-amber-400"}`}
        />
      </motion.div>
    </motion.div>
  );
}

function DashboardMockup() {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 600); return () => clearTimeout(t); }, []);
  const total = SPEND_BARS.reduce((a, b) => a + b.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1400 }}
      className="relative w-full max-w-[580px] mx-auto"
    >
      {/* Multi-layer glow */}
      <div className="absolute -inset-6 bg-[#00e87a]/[0.06] rounded-3xl blur-[60px] animate-aurora" />
      <div className="absolute -inset-2 bg-gradient-to-br from-[#00e87a]/10 via-transparent to-[#7c3aed]/08 rounded-2xl blur-md" />

      {/* Orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[110%] h-[110%] rounded-full border border-[#00e87a]/[0.04] animate-orbit-slow absolute" />
        <div className="w-[130%] h-[130%] rounded-full border border-[#7c3aed]/[0.03] animate-orbit-mid absolute" />
      </div>

      {/* Card */}
      <div className="relative depth-card rounded-2xl overflow-hidden scan-line">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 mx-4 h-5 rounded bg-white/[0.04] flex items-center px-3">
            <span className="text-[10px] font-mono text-[#3a3a4a]">app.spendlens.io/audit/acme-corp</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00e87a]/10 border border-[#00e87a]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00e87a] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00e87a]">LIVE</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.05]">
          {[
            { label: "Monthly Spend",    value: `$${total.toLocaleString()}`, delta: "+12%", bad: true  },
            { label: "Detected Waste",   value: "$2,840",                     delta: "53%",  bad: true  },
            { label: "Potential Savings",value: "$2,840",                     delta: "↓ $34k/yr", green: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0a0a12] px-4 py-3">
              <p className="text-[9px] text-[#4a4a5a] font-mono mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-sm font-syne font-700 ${stat.green ? "text-[#00e87a]" : "text-white"}`}>
                {stat.green ? <AnimatedCounter from={0} to={2840} prefix="$" duration={1600} className="text-sm font-syne font-700 text-[#00e87a]" /> : stat.value}
              </p>
              <span className={`text-[9px] font-mono mt-0.5 block ${stat.bad ? "text-red-400" : "text-[#00e87a]"}`}>{stat.delta}</span>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono text-[#4a4a5a] uppercase tracking-wider">AI Tool Breakdown</p>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <AlertCircle size={10} className="text-amber-400" />
              <span className="text-amber-400">3 alerts</span>
            </div>
          </div>
          <div className="space-y-3">
            {SPEND_BARS.map((bar, i) => {
              const isWasteHigh = bar.used < 50;
              return (
                <div key={bar.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[#8a8a9a] font-dm">{bar.label}</span>
                    <div className="flex items-center gap-2">
                      {isWasteHigh && (
                        <motion.span
                          initial={{ opacity: 0, x: 4 }}
                          animate={{ opacity: animate ? 1 : 0, x: animate ? 0 : 4 }}
                          transition={{ delay: 1.2 + i * 0.08 }}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20"
                        >
                          {100 - bar.used}% unused
                        </motion.span>
                      )}
                      <span className="text-[11px] font-mono text-[#5a5a6a]">${bar.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="relative h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: animate ? `${bar.used}%` : "0%" }}
                      transition={{ duration: 1.0, delay: 0.8 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-0 bottom-0 rounded-full"
                      style={{ backgroundColor: bar.color, boxShadow: `0 0 8px ${bar.color}60` }}
                    />
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: animate ? `${100 - bar.used}%` : "0%", opacity: animate ? 0.22 : 0 }}
                      transition={{ duration: 0.8, delay: 1.0 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-0 bottom-0 rounded-r-full bg-red-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 8 }}
            transition={{ delay: 2.0, duration: 0.5 }}
            className="mt-5 flex items-start gap-3 p-3 rounded-xl bg-[#00e87a]/[0.05] border border-[#00e87a]/[0.12]"
            style={{ boxShadow: "0 0 30px rgba(0,232,122,0.04)" }}
          >
            <Sparkles size={13} className="text-[#00e87a] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-dm text-[#00e87a] font-medium">AI Recommendation</p>
              <p className="text-[10px] text-[#6a6a7a] font-dm mt-0.5 leading-relaxed">
                Downgrade 4 ChatGPT Plus seats → Team. Consolidate Cursor + Copilot. Savings:{" "}
                <span className="text-[#00e87a] font-mono">$2,840/mo</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating tool cards */}
      {AI_TOOLS.map((tool, i) => <ToolCard key={tool.name} tool={tool} index={i} />)}
    </motion.div>
  );
}

/* ─── Main Hero ──────────────────────────────────────────────── */
export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
  const item    = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden mesh-gradient bg-grid pt-24 pb-16 lg:pb-28"
    >
      {/* ── Background layers ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary green glow — bottom left */}
        <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#00e87a]/[0.06] blur-[130px] animate-aurora" />
        {/* Violet glow — top right */}
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/[0.06] blur-[110px]" />
        {/* Blue accent — centre */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[#3b82f6]/[0.03] blur-[80px]" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,transparent_40%,#050507_80%)]" />
        {/* Diagonal accent line */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#7c3aed]/20 to-transparent opacity-40" style={{ right: "38%" }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 xl:px-8">
        {/* Asymmetric grid: copy is narrower, visual takes more space */}
        <div className="grid lg:grid-cols-[5fr_7fr] gap-10 xl:gap-16 items-center">

          {/* ── LEFT: Copy ── */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6 lg:gap-7 lg:pr-4">

            {/* Eyebrow */}
            <motion.div variants={item} className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-[#00e87a]/25 text-[#00e87a]"
                style={{ boxShadow: "0 0 20px rgba(0,232,122,0.08)" }}>
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[#00e87a]" />
                <span className="text-[11px] font-mono tracking-widest uppercase">Beta · 2,400+ audits run</span>
              </div>
              <div className="hidden sm:flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#f59e0b" className="text-amber-400" />)}
              </div>
            </motion.div>

            {/* Headline — large, weighted, asymmetric line breaks */}
            <motion.div variants={item}>
              <h1 className="font-syne font-800 leading-[1.04] tracking-[-0.035em] text-[clamp(2.6rem,5vw,4.2rem)] text-balance">
                <span className="block text-white/90">Stop burning</span>
                <GradientText variant="custom" from="#ff5757" to="#f59e0b" angle={120} className="font-syne font-800 block" as="span">
                  $4,200/mo
                </GradientText>
                <span className="block text-white/80">on AI you&apos;re not</span>
                <span className="block text-white/60">using.</span>
              </h1>
            </motion.div>

            {/* Sub-copy */}
            <motion.p variants={item} className="text-base sm:text-[1.05rem] text-[#6a6a7a] font-dm leading-relaxed max-w-[440px]">
              SpendLens scans your entire AI stack in{" "}
              <span className="text-[#c8c8d8] font-medium">60 seconds</span>, identifies wasted subscriptions, duplicate tools and unused API credits — then tells you{" "}
              <span className="text-[#c8c8d8] font-medium">exactly what to cut</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap gap-3">
              <Link href="/audit">
                <motion.button
                  whileHover={{ scale: 1.025, boxShadow: "0 0 40px rgba(0,232,122,0.3), 0 0 80px rgba(0,232,122,0.12)" }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#00e87a] text-[#050507] font-syne font-700 text-sm overflow-hidden transition-colors hover:bg-[#00ff87]"
                >
                  <div className="shimmer-sweep" />
                  <Zap size={15} fill="currentColor" />
                  Start Free Audit
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>
              </Link>
              <Link href="#demo">
                <motion.button
                  whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.18)" }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl glass border border-white/[0.08] text-[#8a8a9a] hover:text-white text-sm font-dm transition-colors duration-200"
                >
                  <BarChart3 size={14} />
                  See Sample Report
                  <ArrowRight size={13} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust strip */}
            <motion.div variants={item} className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-[#4a4a5a]">
                  <Icon size={11} className="text-[#00e87a]/60" />
                  <span className="text-[11px] font-dm">{text}</span>
                </div>
              ))}
            </motion.div>

            {/* Social proof */}
            <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {STAR_REVIEWS.map((r) => (
                    <div key={r.name}
                      className="w-8 h-8 rounded-full border-2 border-[#050507] bg-gradient-to-br from-[#1a1a28] to-[#0d0d16] flex items-center justify-center"
                      title={`${r.name} — ${r.role}`}>
                      <span className="text-[9px] font-syne font-700 text-white">{r.avatar}</span>
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[#050507] bg-[#0d0d16] flex items-center justify-center">
                    <span className="text-[8px] font-mono text-[#4a4a5a]">+2k</span>
                  </div>
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={10} fill="#f59e0b" className="text-amber-400" />)}</div>
                  <p className="text-[11px] text-[#4a4a5a] font-dm">Loved by 2,400+ engineering teams</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />
              <div>
                <p className="text-lg font-syne font-700 text-white leading-none">
                  <AnimatedCounter from={0} to={4.2} prefix="$" suffix="M+" decimals={1} duration={2000} />
                </p>
                <p className="text-[11px] text-[#4a4a5a] font-dm mt-0.5">saved for teams this month</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Dashboard — parallax on scroll ── */}
          <motion.div style={{ y }} className="relative lg:block hidden">
            <DashboardMockup />
          </motion.div>
        </div>

        {/* Mobile dashboard */}
        <div className="lg:hidden mt-14">
          <DashboardMockup />
        </div>

        {/* ── Tool ticker ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.7 }} className="mt-16 lg:mt-24">
          <p className="text-center text-[10px] font-mono text-[#3a3a4a] uppercase tracking-[0.2em] mb-5">Audits spend across every major AI tool</p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050507] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050507] to-transparent z-10" />
            <div className="flex gap-3 overflow-hidden">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                className="flex gap-3 flex-shrink-0"
              >
                {[
                  { name: "OpenAI", icon: "⚡", color: "#10a37f" }, { name: "Anthropic API", icon: "✦", color: "#d97706" },
                  { name: "ChatGPT Plus", icon: "🤖", color: "#10a37f" }, { name: "Claude Pro", icon: "✦", color: "#d97706" },
                  { name: "Cursor", icon: "⚡", color: "#6366f1" }, { name: "GitHub Copilot", icon: "🐙", color: "#7c3aed" },
                  { name: "Gemini Advanced", icon: "♊", color: "#3b82f6" }, { name: "Perplexity Pro", icon: "🔮", color: "#a78bfa" },
                  { name: "Midjourney", icon: "🎨", color: "#ec4899" }, { name: "Runway ML", icon: "🎬", color: "#f43f5e" },
                  { name: "Eleven Labs", icon: "🎙️", color: "#06b6d4" }, { name: "Cohere", icon: "🧠", color: "#22c55e" },
                  { name: "OpenAI", icon: "⚡", color: "#10a37f" }, { name: "Anthropic API", icon: "✦", color: "#d97706" },
                  { name: "ChatGPT Plus", icon: "🤖", color: "#10a37f" }, { name: "Claude Pro", icon: "✦", color: "#d97706" },
                  { name: "Cursor", icon: "⚡", color: "#6366f1" }, { name: "GitHub Copilot", icon: "🐙", color: "#7c3aed" },
                  { name: "Gemini Advanced", icon: "♊", color: "#3b82f6" }, { name: "Perplexity Pro", icon: "🔮", color: "#a78bfa" },
                  { name: "Midjourney", icon: "🎨", color: "#ec4899" }, { name: "Runway ML", icon: "🎬", color: "#f43f5e" },
                  { name: "Eleven Labs", icon: "🎙️", color: "#06b6d4" }, { name: "Cohere", icon: "🧠", color: "#22c55e" },
                ].map((tool, i) => (
                  <div key={`${tool.name}-${i}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass border border-white/[0.04] flex-shrink-0 hover:border-white/[0.09] transition-colors"
                    style={{ boxShadow: `0 0 12px ${tool.color}08` }}>
                    <span className="text-sm">{tool.icon}</span>
                    <span className="text-xs font-dm text-[#5a5a6a] whitespace-nowrap">{tool.name}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}