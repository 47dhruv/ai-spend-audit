"use client";

/**
 * components/primitives/Skeleton.jsx
 *
 * Reusable skeleton loading system.
 * Uses the .skeleton CSS class from globals.css for the shimmer sweep.
 *
 * Usage:
 *   <Skeleton.Line />
 *   <Skeleton.Card />
 *   <Skeleton.KPI />
 *   <Skeleton.RecommendationCard />
 *
 * All skeletons are aria-hidden to keep the screen reader experience clean.
 */

/** Primitive bone — a single shimmer block */
function Bone({ w = "100%", h = 16, r = 8, className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: w, height: h, borderRadius: r, flexShrink: 0 }}
      aria-hidden="true"
    />
  );
}

/** Single text line */
function Line({ w = "100%", h = 14, className = "" }) {
  return <Bone w={w} h={h} r={6} className={className} />;
}

/** Metric / KPI card skeleton */
function KPI() {
  return (
    <div
      className="kpi-card rounded-2xl p-5 space-y-3"
      aria-hidden="true"
    >
      <Bone w="55%" h={10} r={6} />
      <Bone w="70%" h={32} r={6} />
      <Bone w="40%" h={10} r={6} />
    </div>
  );
}

/** Full result card skeleton */
function Card({ h = 120 }) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Bone w={40} h={40} r={10} />
        <div className="flex-1 space-y-2">
          <Bone w="55%" h={12} r={6} />
          <Bone w="40%" h={10} r={6} />
        </div>
        <Bone w={72} h={22} r={99} />
      </div>
      <Bone w="100%" h={h} r={10} />
      <div className="flex justify-between items-center">
        <Bone w="45%" h={10} r={6} />
        <Bone w="25%" h={10} r={6} />
      </div>
    </div>
  );
}

/** Recommendation card skeleton */
function RecommendationCard() {
  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Bone w={40} h={40} r={10} />
          <div className="space-y-2">
            <Bone w={120} h={12} r={6} />
            <Bone w={80}  h={10} r={6} />
          </div>
        </div>
        <Bone w={72} h={22} r={99} />
      </div>
      <Bone w="100%" h={52} r={8} />
      <div>
        <div className="flex justify-between mb-1.5">
          <Bone w="35%" h={10} r={6} />
          <Bone w="20%" h={10} r={6} />
        </div>
        <Bone w="100%" h={4} r={4} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Bone w="100%" h={52} r={10} />
        <Bone w="100%" h={52} r={10} />
      </div>
    </div>
  );
}

/** Hero section skeleton */
function Hero() {
  return (
    <div
      className="rounded-2xl p-8 space-y-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      aria-hidden="true"
    >
      <div className="flex justify-between items-start flex-wrap gap-6">
        <div className="space-y-4 flex-1 min-w-64">
          <Bone w={140} h={10} r={99} />
          <Bone w="65%" h={64} r={10} />
          <Bone w="85%" h={14} r={6} />
        </div>
        <div className="w-48 space-y-3 hidden md:block">
          <Bone w="100%" h={120} r={16} />
          <Bone w="100%" h={56}  r={16} />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <Bone key={i} w="100%" h={60} r={10} />)}
      </div>
    </div>
  );
}

export const Skeleton = { Bone, Line, KPI, Card, RecommendationCard, Hero };
export default Skeleton;
