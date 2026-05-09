/**
 * app/results/loading.js
 *
 * Results dashboard skeleton — shown while results/page.js loads.
 * Exactly mirrors the results page layout to prevent layout shift.
 */
export default function ResultsLoading() {
  const Bone = ({ w = "100%", h = 20, r = 8, className = "" }) => (
    <div
      className={`skeleton ${className}`}
      style={{ width: w, height: h, borderRadius: r }}
      aria-hidden="true"
    />
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "#050507" }}
      role="status"
      aria-label="Loading audit results…"
    >
      {/* Route progress bar */}
      <div className="route-progress" aria-hidden="true" />

      {/* Sticky header skeleton */}
      <div
        className="sticky top-0 z-40 dashboard-header px-4 sm:px-6 lg:px-10 py-4"
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bone w={120} h={20} r={99} />
            <Bone w={80} h={20} r={8} />
          </div>
          <div className="flex items-center gap-2">
            <Bone w={90} h={34} r={10} />
            <Bone w={34} h={34} r={10} />
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10 py-8 space-y-8">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="kpi-card rounded-2xl p-5 space-y-3"
            >
              <Bone w="60%" h={10} r={6} />
              <Bone w="75%" h={28} r={6} />
              <Bone w="45%" h={10} r={6} />
            </div>
          ))}
        </div>

        {/* Hero skeleton */}
        <div
          className="rounded-2xl p-8 space-y-6"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <Bone w={160} h={10} r={6} />
              <Bone w="55%" h={60} r={10} />
              <Bone w="80%" h={14} r={6} />
            </div>
            <div className="hidden md:block w-56 space-y-3">
              <Bone w="100%" h={120} r={12} />
              <Bone w="100%" h={60} r={12} />
            </div>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Bone key={i} w="100%" h={64} r={10} />
            ))}
          </div>
        </div>

        {/* Metric cards skeleton */}
        <div>
          <Bone w={180} h={14} r={6} className="mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5 space-y-4"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Bone w="50%" h={10} r={6} />
                <Bone w="70%" h={36} r={8} />
                <Bone w="40%" h={10} r={6} />
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations skeleton */}
        <div>
          <Bone w={200} h={14} r={6} className="mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 space-y-4"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Bone w={40} h={40} r={10} />
                  <div className="flex-1 space-y-2">
                    <Bone w="60%" h={12} r={6} />
                    <Bone w="40%" h={10} r={6} />
                  </div>
                </div>
                <Bone w="100%" h={48} r={8} />
                <div className="flex justify-between">
                  <Bone w="40%" h={10} r={6} />
                  <Bone w="30%" h={10} r={6} />
                </div>
                <Bone w="100%" h={36} r={10} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
