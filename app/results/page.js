"use client";

/**
 * app/results/page.js — Premium Dashboard Results Page
 *
 * Architecture:
 *  1. Load localStorage → run engine → transform → state
 *  2. Sticky DashboardHeader (always visible)
 *  3. KPIStrip — 4 animated metric cards
 *  4. SavingsHero — big savings number + grade
 *  5. WasteChart — donut + bar charts
 *  6. Recommendations — grid with EmptyState fallback
 *  7. AISummary — AI analysis section
 *
 * UX additions vs previous version:
 *  - Page entrance animation (.page-enter CSS class)
 *  - Sticky header with export + new audit
 *  - KPI strip replaces static metric cards
 *  - Recharts WasteChart section
 *  - EmptyState for zero recommendations
 *  - Section dividers with ambient glow
 *  - Floating ambient bg glow layers
 */

import { useEffect, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ── Dashboard components ──────────────────────────────────────────────────────
import SavingsHero        from "@/components/results/SavingsHero";
import RecommendationCard from "@/components/results/RecommendationCard";
import AISummary          from "@/components/results/AISummary";
import DashboardHeader    from "@/components/results/DashboardHeader";
import KPIStrip           from "@/components/results/KPIStrip";
import WasteChart         from "@/components/results/WasteChart";

// ── Primitives ────────────────────────────────────────────────────────────────
import EmptyState         from "@/components/primitives/EmptyState";

// ── Data layer ────────────────────────────────────────────────────────────────
import { getAuditData }         from "@/lib/utils/storage";
import { runAudit }             from "@/lib/engine/auditEngine";
import { transformAuditResult } from "@/lib/engine/transformAuditResult";

// ── Section shell ─────────────────────────────────────────────────────────────
const Section = memo(function Section({ tag, title, description, children, id }) {
  return (
    <section id={id} className="space-y-5" aria-labelledby={id ? `${id}-heading` : undefined}>
      {(tag || title) && (
        <header className="space-y-0.5">
          {tag && (
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#3a3a4a" }}>
              {tag}
            </p>
          )}
          {title && (
            <div className="flex items-baseline gap-4 flex-wrap">
              <h2
                id={id ? `${id}-heading` : undefined}
                className="text-base font-semibold tracking-tight"
                style={{ color: "#e0e0f0", fontFamily: "var(--font-syne,Syne,sans-serif)" }}
              >
                {title}
              </h2>
              {description && (
                <span className="text-xs hidden sm:inline" style={{ color: "#3a3a4a" }}>
                  {description}
                </span>
              )}
            </div>
          )}
        </header>
      )}
      {children}
    </section>
  );
});

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div
      aria-hidden
      className="h-px w-full"
      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)" }}
    />
  );
}

// ── Background canvas ─────────────────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div style={{ position: "absolute", inset: 0, background: "#050507" }} />
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "55%", height: "55%", background: "radial-gradient(ellipse, rgba(0,232,122,0.055) 0%, transparent 65%)", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", top: "30%", right: "-10%", width: "45%", height: "45%", background: "radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 60%)", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: "0", left: "20%", width: "60%", height: "40%", background: "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 60%)", filter: "blur(40px)" }} />
      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050507" }} role="status" aria-label="Generating report…">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "#00e87a", borderRightColor: "rgba(0,232,122,0.15)", animationDuration: "0.85s" }} />
          <div className="absolute inset-2.5 rounded-full" style={{ background: "rgba(0,232,122,0.07)" }} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold" style={{ color: "#e0e0f0", fontFamily: "var(--font-syne,Syne,sans-serif)" }}>Generating Report</p>
          <p className="text-xs" style={{ color: "#4a4a5a" }}>Analysing your AI spend patterns…</p>
        </div>
      </div>
    </div>
  );
}

// ── Fade-up variant for section entrances ─────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 20, filter: "blur(3px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [error,   setError]   = useState(null);

  const handleNewAudit = useCallback(() => router.push("/audit"), [router]);

  useEffect(() => {
    const stored = getAuditData();
    if (!stored) { router.push("/"); return; }

    try {
      const raw       = runAudit(stored);
      const dashboard = transformAuditResult(raw);
      setResults(dashboard);
    } catch (err) {
      console.error("[ResultsPage]", err);
      setError(err?.message ?? "Audit computation failed.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#050507" }}>
        <div className="max-w-md w-full">
          <EmptyState
            variant="failed"
            action={{ label: "Try Again", onClick: () => { setError(null); window.location.reload(); } }}
            secondaryAction={{ label: "New Audit", href: "/audit" }}
          />
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!results) return <LoadingScreen />;

  const { auditData, metrics, recommendations, aiInsights, meta } = results;

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-zinc-100" style={{ background: "#050507" }}>
      <AmbientBackground />

      {/* Sticky Header */}
      <DashboardHeader meta={meta} />

      {/* Page body */}
      <main
        className="relative z-10 mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10 py-8 space-y-10 page-enter"
        id="main-content"
      >
        {/* ── KPI Strip ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <KPIStrip metrics={metrics} />
        </motion.div>

        <Divider />

        {/* ── Savings Hero ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
          <Section tag="Overview" id="overview">
            <SavingsHero auditData={auditData} />
          </Section>
        </motion.div>

        <Divider />

        {/* ── Spend Charts ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Section tag="Analytics" title="Spend Breakdown" id="analytics">
            <WasteChart auditData={auditData} />
          </Section>
        </motion.div>

        <Divider />

        {/* ── Recommendations ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
          <Section
            tag="Optimization Opportunities"
            title="Recommendations"
            description={recommendations.length ? `${recommendations.length} action${recommendations.length !== 1 ? "s" : ""} identified` : undefined}
            id="recommendations"
          >
            {recommendations.length === 0 ? (
              <EmptyState
                variant="no-recommendations"
                action={{ label: "Start New Audit", href: "/audit" }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {recommendations.map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Section>
        </motion.div>

        <Divider />

        {/* ── AI Summary ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Section tag="Intelligence" title="AI Analysis" id="ai-analysis">
            <AISummary summary={aiInsights.summary} onViewPlan={false} />
          </Section>
        </motion.div>

        {/* ── Footer ── */}
        <footer
          className="pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#3a3a4a" }}
        >
          <p>SpendLens AI Audit Platform · Confidential</p>
          <div className="flex items-center gap-4">
            {meta?.auditDate && <span>{meta.auditDate}</span>}
            {meta?.reportId  && <span className="font-mono">ref: {meta.reportId}</span>}
          </div>
        </footer>
      </main>
    </div>
  );
}