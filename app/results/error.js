"use client";

/**
 * app/results/error.js — Results page error boundary
 *
 * Shown when the audit engine throws or localStorage is corrupted.
 * Gives users clear recovery options instead of a white screen.
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ArrowLeft, FileSearch } from "lucide-react";

export default function ResultsError({ error, reset }) {
  useEffect(() => {
    console.error("[SpendLens/results] Error:", error);
  }, [error]);

  const isNoData = error?.message?.includes("No audit") ||
                   error?.message?.includes("storage");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#050507" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8 text-center space-y-6"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.016) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
            style={{
              background: isNoData
                ? "rgba(99,102,241,0.1)"
                : "rgba(244,63,94,0.1)",
              border: `1px solid ${isNoData ? "rgba(99,102,241,0.25)" : "rgba(244,63,94,0.2)"}`,
            }}
          >
            {isNoData
              ? <FileSearch size={28} style={{ color: "#818cf8" }} />
              : <AlertTriangle size={28} style={{ color: "#f43f5e" }} />
            }
          </div>

          {/* Copy */}
          <div className="space-y-2">
            <h1
              className="text-xl font-semibold"
              style={{ color: "#f0f0f5", fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {isNoData ? "No Audit Found" : "Something Went Wrong"}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#6a6a7a" }}>
              {isNoData
                ? "We couldn't find a completed audit. Please run a new audit to see your results."
                : "The audit engine encountered an unexpected error. Your data is safe — try again or start a new audit."
              }
            </p>
          </div>

          {/* Dev error detail */}
          {process.env.NODE_ENV === "development" && error?.message && !isNoData && (
            <pre
              className="text-left text-xs p-3 rounded-xl overflow-auto max-h-28"
              style={{
                background: "rgba(244,63,94,0.06)",
                border: "1px solid rgba(244,63,94,0.15)",
                color: "#f87171",
                fontFamily: "monospace",
              }}
            >
              {error.message}
            </pre>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {!isNoData && (
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#00e87a", color: "#050507" }}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            )}

            <a
              href="/audit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#9090a0",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <ArrowLeft size={14} />
              New Audit
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
