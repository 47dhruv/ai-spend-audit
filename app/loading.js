/**
 * app/loading.js — Root route transition loader
 *
 * Shown by Next.js App Router automatically during any route-level
 * Suspense boundary (page navigation) at the root level.
 * Uses the .route-progress bar from globals.css for a Stripe-like top bar.
 */
export default function RootLoading() {
  return (
    <>
      {/* Slim top progress bar */}
      <div className="route-progress" aria-hidden="true" />

      {/* Full-screen centered spinner for root transitions */}
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#050507" }}
        role="status"
        aria-label="Loading SpendLens…"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Logo mark spinner */}
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
              style={{
                borderTopColor: "#00e87a",
                borderRightColor: "rgba(0,232,122,0.2)",
                animationDuration: "0.9s",
              }}
            />
            <div
              className="absolute inset-2 rounded-full"
              style={{ background: "rgba(0,232,122,0.08)" }}
            />
          </div>

          <p
            className="text-xs font-mono tracking-widest uppercase"
            style={{ color: "#4a4a5a", letterSpacing: "0.16em" }}
          >
            Loading…
          </p>
        </div>
      </div>
    </>
  );
}
