"use client";

import Link from "next/link";
import { Zap, ExternalLink } from "lucide-react";

const FOOTER_LINKS = {
  Product:  [{ label: "Features", href: "#features" }, { label: "How it works", href: "#how-it-works" }, { label: "Pricing", href: "#pricing" }, { label: "Changelog", href: "#" }],
  Company:  [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }, { label: "Press", href: "#" }],
  Legal:    [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Security", href: "#" }, { label: "SOC 2", href: "#" }],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand col */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#00e87a] flex items-center justify-center">
                <Zap size={14} className="text-[#080808]" fill="currentColor" />
              </div>
              <span className="font-syne font-700 text-base text-white">SpendLens</span>
            </Link>
            <p className="text-sm font-dm text-[#555] leading-relaxed max-w-xs">
              Stop overpaying for AI tools. Audit your entire AI stack in 60 seconds and cut what you&apos;re not using.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { label: "𝕏",  href: "#" },
                { label: "GH", href: "#" },
                { label: "in", href: "#" },
              ].map(({ label, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-lg glass border border-white/[0.06] flex items-center justify-center text-[#555] hover:text-white hover:border-white/[0.12] transition-colors font-mono text-[10px] font-medium"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-mono text-[#444] uppercase tracking-widest mb-4">{group}</p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm font-dm text-[#555] hover:text-[#aaa] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-dm text-[#444]">
            © 2025 SpendLens, Inc. All rights reserved.
          </p>
          <p className="text-xs font-dm text-[#333]">
            Built with ❤️ for lean engineering teams
          </p>
        </div>
      </div>
    </footer>
  );
}
