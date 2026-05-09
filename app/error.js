/**
 * app/error.js — Global error boundary
 *
 * Catches unhandled errors at the root level and shows a recovery UI.
 * Must be a Client Component (required by Next.js App Router).
 */
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log to error monitoring (Sentry, etc.) when integrated
    console.error("[SpendLens] Unhandled error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#050507", margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: "#050507" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md w-full text-center space-y-6"
          >
            {/* Icon */}
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}
            >
              <AlertTriangle size={28} style={{ color: "#f43f5e" }} />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1
                className="text-xl font-semibold"
                style={{ color: "#f0f0f5", fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                Something went wrong
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "#6a6a7a" }}>
                An unexpected error occurred. This has been logged and we'll look into it.
              </p>
            </div>

            {/* Error detail (dev only) */}
            {process.env.NODE_ENV === "development" && error?.message && (
              <pre
                className="text-left text-xs p-4 rounded-xl overflow-auto max-h-32"
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
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "#00e87a",
                  color: "#050507",
                }}
              >
                <RefreshCw size={14} />
                Try Again
              </button>

              <a
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "#9090a0",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <Home size={14} />
                Home
              </a>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
