"use client";

import { motion } from "framer-motion";

/**
 * SectionLabel — small eyebrow label above section headings.
 * Props: children, className
 */
export function SectionLabel({ children, className = "" }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.04] text-[#777] text-xs font-mono tracking-widest uppercase ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * SectionHeading — large heading with optional gradient span.
 * Props: children, className
 */
export function SectionHeading({ children, className = "" }) {
  return (
    <h2
      className={`font-syne font-800 text-3xl sm:text-4xl xl:text-5xl leading-[1.1] tracking-[-0.03em] text-balance ${className}`}
    >
      {children}
    </h2>
  );
}

/**
 * SectionWrapper — consistent section padding + fade-in animation.
 * Props: children, className, id
 */
export function SectionWrapper({ children, className = "", id }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative py-24 lg:py-32 overflow-hidden ${className}`}
    >
      {children}
    </motion.section>
  );
}

/**
 * Container — max-width centering wrapper.
 */
export function Container({ children, className = "" }) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-6 ${className}`}>
      {children}
    </div>
  );
}
