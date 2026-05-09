"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features",  href: "#features"  },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing",   href: "#pricing"   },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 20));

  // lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#00e87a] flex items-center justify-center">
              <Zap size={14} className="text-[#080808]" fill="currentColor" />
            </div>
            <span className="font-syne font-700 text-base text-white tracking-tight">
              SpendLens
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-dm text-[#777] hover:text-white transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/audit"
              className="text-sm font-dm text-[#777] hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link href="/audit">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,232,122,0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00e87a] text-[#080808] font-syne font-700 text-sm hover:bg-[#00ff87] transition-colors"
              >
                <Zap size={13} fill="currentColor" />
                Free Audit
              </motion.button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#777] hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile drawer — AnimatePresence enables the exit animation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 pt-16 bg-[#080808]/95 backdrop-blur-xl flex flex-col p-6 gap-6 md:hidden"
          >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-syne font-700 text-white hover:text-[#00e87a] transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link href="/audit" onClick={() => setMobileOpen(false)}>
            <button className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#00e87a] text-[#080808] font-syne font-700 text-base">
              <Zap size={16} fill="currentColor" />
              Start Free Audit
            </button>
          </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
