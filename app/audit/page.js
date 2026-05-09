/**
 * app/audit/page.js
 *
 * The AI Spend Audit form page.
 * Renders the AuditForm inside the page shell with a minimal scaffold.
 * AuditForm handles its own submit logic (saves to localStorage + router.push("/results")).
 *
 * This is a client boundary — AuditForm is "use client" and uses
 * hooks, event handlers, and localStorage. We let Next.js resolve the
 * client boundary automatically via the child component.
 */

import AuditForm from "@/components/form/AuditForm";

export const metadata = {
  title: "Start Your AI Spend Audit — SpendLens",
  description:
    "Add your AI tools and monthly spend. We'll identify waste, overlaps, and savings opportunities across your entire AI stack in seconds.",
};

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-[#050507] overflow-x-hidden">
      {/* Page background layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 80% 50% at 20% 110%, rgba(0,232,122,0.07) 0%, transparent 55%)",
            "radial-gradient(ellipse 60% 45% at 80% -10%, rgba(124,58,237,0.07) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      {/* Dot grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-100"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        {/* Page heading */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-5"
            style={{
              background: "rgba(0,232,122,0.07)",
              border: "1px solid rgba(0,232,122,0.2)",
              color: "#00e87a",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#00e87a] animate-pulse"
              aria-hidden="true"
            />
            Free Audit
          </span>

          <h1 className="font-syne font-800 text-3xl sm:text-4xl text-white tracking-tight mb-3">
            Audit Your AI Stack
          </h1>

          <p className="text-base text-[#6a6a7a] font-dm leading-relaxed">
            Add your AI tools below. We'll identify overlaps, unused seats, and
            the exact monthly savings available to your team.
          </p>
        </div>

        {/* Form */}
        <AuditForm />
      </div>
    </main>
  );
}
