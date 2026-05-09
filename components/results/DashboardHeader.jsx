"use client";

/**
 * components/results/DashboardHeader.jsx
 *
 * Sticky dashboard header for the results page.
 * Includes:
 *   - Audit status badge
 *   - Report title + meta
 *   - Export dropdown (PDF, CSV, JSON, Link)
 *   - New Audit CTA
 *   - Scroll-aware opacity/blur transition
 *
 * Uses .dashboard-header CSS class from globals.css.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, FileText, Table2, Code2, Link2,
  ChevronDown, Plus, Zap, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Badge, AuditStatusBadge } from "@/components/primitives/Badge";

// ─── Export Options ───────────────────────────────────────────────────────────

const EXPORT_OPTIONS = [
  { id: "pdf",  label: "Export PDF",      Icon: FileText, description: "Executive report" },
  { id: "csv",  label: "Export CSV",      Icon: Table2,   description: "Raw data table"   },
  { id: "json", label: "Export JSON",     Icon: Code2,    description: "Full audit data"  },
  { id: "link", label: "Copy Share Link", Icon: Link2,    description: "Shareable URL"    },
];

// ─── Export Dropdown ──────────────────────────────────────────────────────────

function ExportDropdown({ meta }) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const dropRef             = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleExport = useCallback((id) => {
    setOpen(false);
    if (id === "link") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    if (id === "json") {
      try {
        const raw = localStorage.getItem("ais_audit_v1");
        if (!raw) return;
        const blob = new Blob([raw], { type: "application/json" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = `spendlens-audit-${meta?.reportId ?? "report"}.json`;
        a.click(); URL.revokeObjectURL(url);
      } catch {}
    }
    // PDF/CSV: placeholders — would integrate with a library in production
  }, [meta]);

  return (
    <div ref={dropRef} className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all hover:brightness-110"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.09)",
          color: "#9090a0",
        }}
      >
        {copied
          ? <CheckCircle2 size={14} style={{ color: "#00e87a" }} />
          : <Download size={14} />}
        <span className="hidden sm:inline">{copied ? "Copied!" : "Export"}</span>
        <ChevronDown
          size={12}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Export options"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.95, y: -4   }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="export-dropdown absolute right-0 top-full mt-2 w-56 z-[100] overflow-hidden"
          >
            {EXPORT_OPTIONS.map(({ id, label, Icon, description }) => (
              <button
                key={id}
                role="option"
                onClick={() => handleExport(id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 first:pt-4 last:pb-4"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon size={13} style={{ color: "#6a6a7a" }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#d0d0e0" }}>{label}</p>
                  <p className="text-[10px]" style={{ color: "#4a4a5a" }}>{description}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.meta        — { auditDate, reportId, toolCount, teamSize }
 * @param {number}  [props.scrollY]   — current scroll position (from useScroll)
 */
export default function DashboardHeader({ meta }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sticky top-0 z-40 dashboard-header transition-all duration-300"
      style={{ boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.3)" : "none" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center justify-between gap-4">

        {/* Left: badge + title */}
        <div className="flex items-center gap-3 min-w-0">
          <AuditStatusBadge status="complete" />

          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "#4a4a5a" }}>
            <span
              aria-hidden
              className="w-px h-4"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            {meta?.toolCount && <span>{meta.toolCount} tools analysed</span>}
            {meta?.teamSize  && (
              <>
                <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>{meta.teamSize} seat team</span>
              </>
            )}
            {meta?.auditDate && (
              <>
                <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>{meta.auditDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ExportDropdown meta={meta} />

          <Link
            href="/audit"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #00e87a 0%, #00d4a0 100%)",
              color: "#050507",
            }}
          >
            <Plus size={12} />
            <span className="hidden sm:inline">New Audit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
