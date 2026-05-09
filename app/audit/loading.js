/**
 * app/audit/loading.js
 * Audit form page skeleton shown during navigation.
 */
export default function AuditLoading() {
  const Bone = ({ w = "100%", h = 16, r = 8 }) => (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} aria-hidden="true" />
  );

  return (
    <div className="min-h-screen" style={{ background: "#050507" }} role="status" aria-label="Loading audit form…">
      <div className="route-progress" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        {/* Heading skeleton */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
          <div className="flex justify-center"><Bone w={100} h={24} r={99} /></div>
          <Bone w="55%" h={40} r={10} />
          <Bone w="70%" h={18} r={6} />
        </div>

        {/* Form skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Bone w="40%" h={14} r={6} />
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4,5,6].map((i) => <Bone key={i} w="100%" h={36} r={10} />)}
              </div>
            </div>
            <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Bone w="30%" h={14} r={6} />
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Bone w="35%" h={40} r={10} />
                  <Bone w="25%" h={40} r={10} />
                  <Bone w="20%" h={40} r={10} />
                  <Bone w="15%" h={40} r={10} />
                </div>
              ))}
            </div>
            <Bone w="100%" h={52} r={12} />
          </div>
          <div className="hidden lg:block rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Bone w="60%" h={14} r={6} />
            <Bone w="100%" h={80} r={10} />
            <Bone w="100%" h={60} r={10} />
            <Bone w="100%" h={48} r={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
