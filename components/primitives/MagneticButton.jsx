"use client";

/**
 * components/primitives/MagneticButton.jsx
 *
 * Physics-based CTA button with:
 *   - Magnetic attraction toward cursor
 *   - Spring bounce on click
 *   - Glow pulse animation (.cta-magnetic CSS class)
 *   - Shimmer sweep on hover
 *   - Reduced-motion safe (disables magnet on prefers-reduced-motion)
 *
 * Usage:
 *   <MagneticButton onClick={...} variant="primary">
 *     Start Free Audit
 *   </MagneticButton>
 *
 *   <MagneticButton variant="ghost">
 *     Learn More
 *   </MagneticButton>
 */

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ─── Variants ─────────────────────────────────────────────────────────────────

const VARIANTS = {
  primary: {
    background: "linear-gradient(135deg, #00e87a 0%, #00d4a0 100%)",
    color: "#050507",
    border: "1px solid rgba(0,232,122,0.4)",
    glow: true,
    shimmer: true,
  },
  secondary: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
    color: "#f0f0f5",
    border: "1px solid rgba(255,255,255,0.1)",
    glow: false,
    shimmer: false,
  },
  ghost: {
    background: "transparent",
    color: "#9090a0",
    border: "1px solid rgba(255,255,255,0.07)",
    glow: false,
    shimmer: false,
  },
  danger: {
    background: "rgba(244,63,94,0.12)",
    color: "#f43f5e",
    border: "1px solid rgba(244,63,94,0.22)",
    glow: false,
    shimmer: false,
  },
};

// ─── Shimmer overlay ──────────────────────────────────────────────────────────

function ShimmerSweep({ active }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        background:
          "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
        backgroundSize: "200% 100%",
        backgroundPosition: active ? "-200% 0" : "200% 0",
        transition: "background-position 0.45s ease",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * @param {object}          props
 * @param {"primary"|"secondary"|"ghost"|"danger"} [props.variant="primary"]
 * @param {React.ReactNode} props.children
 * @param {function}        [props.onClick]
 * @param {boolean}         [props.disabled]
 * @param {string}          [props.className]
 * @param {object}          [props.style]
 * @param {string}          [props.type="button"]
 * @param {number}          [props.magnetStrength=0.35] — 0 = off, 1 = full travel
 * @param {React.ComponentType} [props.iconLeft]
 * @param {React.ComponentType} [props.iconRight]
 */
export default function MagneticButton({
  variant      = "primary",
  children,
  onClick,
  disabled     = false,
  className    = "",
  style        = {},
  type         = "button",
  magnetStrength = 0.35,
  iconLeft: IconLeft,
  iconRight: IconRight,
  size         = "md",
  ...rest
}) {
  const ref       = useRef(null);
  const [hover, setHover] = useState(false);

  // Spring-damped magnet position
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 22 });
  const y = useSpring(rawY, { stiffness: 280, damping: 22 });

  const prefersReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const handleMouseMove = useCallback((e) => {
    if (!ref.current || prefersReduced || disabled) return;
    const rect  = ref.current.getBoundingClientRect();
    const relX  = e.clientX - rect.left - rect.width  / 2;
    const relY  = e.clientY - rect.top  - rect.height / 2;
    rawX.set(relX * magnetStrength);
    rawY.set(relY * magnetStrength);
  }, [rawX, rawY, magnetStrength, prefersReduced, disabled]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    setHover(false);
  }, [rawX, rawY]);

  const vt = VARIANTS[variant] ?? VARIANTS.primary;

  const SIZE_CLASSES = {
    sm: "px-4 py-2 text-xs gap-1.5 rounded-xl",
    md: "px-6 py-3 text-sm gap-2   rounded-xl",
    lg: "px-8 py-4 text-base gap-2.5 rounded-2xl",
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, ...style }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`relative inline-flex items-center justify-center font-semibold
        overflow-hidden select-none transition-opacity
        disabled:opacity-40 disabled:cursor-not-allowed
        ${vt.glow && !disabled ? "cta-magnetic" : ""}
        ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md}
        ${className}`}
      style={{
        background: vt.background,
        color:      vt.color,
        border:     vt.border,
        willChange: "transform",
        ...style,
      }}
      {...rest}
    >
      {vt.shimmer && <ShimmerSweep active={hover} />}
      {IconLeft  && <IconLeft  size={size === "sm" ? 12 : size === "lg" ? 18 : 14} />}
      <span className="relative z-10">{children}</span>
      {IconRight && <IconRight size={size === "sm" ? 12 : size === "lg" ? 18 : 14} />}
    </motion.button>
  );
}
