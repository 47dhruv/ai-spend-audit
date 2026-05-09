/**
 * lib/design-system/tokens.js
 *
 * Single source of truth for all design tokens used in inline styles.
 * These mirror the CSS custom properties in globals.css so both
 * inline-style components and CSS-class components share the same values.
 *
 * Usage:
 *   import { TOKENS, color, shadow } from "@/lib/design-system/tokens";
 *   style={{ background: TOKENS.surface }}
 */

// ─── Color primitives ─────────────────────────────────────────────────────────

export const COLORS = {
  bg:         "#050507",
  bg2:        "#08080f",
  surface:    "#0d0d16",
  surface2:   "#13131e",
  surface3:   "#17172a",

  // Accent
  emerald:    "#00e87a",
  emeraldDim: "rgba(0,232,122,0.08)",
  emeraldMid: "rgba(0,232,122,0.18)",
  emeraldGlow:"rgba(0,232,122,0.28)",
  violet:     "#7c3aed",
  blue:       "#3b82f6",
  amber:      "#f59e0b",
  rose:       "#f43f5e",

  // Text
  textPrimary:   "#f0f0f5",
  textSecondary: "#9090a0",
  textMuted:     "#4a4a5a",

  // Borders
  border:       "rgba(255,255,255,0.055)",
  borderMid:    "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.14)",

  // Grade palette
  gradeA: "#22c55e",
  gradeB: "#84cc16",
  gradeC: "#eab308",
  gradeD: "#f97316",
  gradeF: "#ef4444",
};

// ─── Semantic token aliases ────────────────────────────────────────────────────

export const TOKENS = {
  ...COLORS,

  // Glassmorphism layers
  glass:         "rgba(255,255,255,0.028)",
  glassStrong:   "rgba(255,255,255,0.044)",
  glassMid:      "rgba(255,255,255,0.036)",

  // Gradients (as CSS strings)
  gradientSurface:
    "linear-gradient(145deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.016) 100%)",
  gradientEmerald:
    "linear-gradient(135deg, rgba(0,232,122,0.12) 0%, rgba(0,232,122,0.04) 100%)",
  gradientCard:
    "linear-gradient(145deg, rgba(15,23,42,0.94) 0%, rgba(13,19,36,0.96) 100%)",

  // Radius
  radius:    "16px",
  radiusSm:  "10px",
  radiusLg:  "20px",
  radiusXl:  "24px",
  radiusFull:"9999px",
};

// ─── Shadow helpers ────────────────────────────────────────────────────────────

export const SHADOWS = {
  card:     "0 8px 32px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
  cardHover:"0 20px 60px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.08) inset",
  panel:    "0 1px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 24px 80px rgba(0,0,0,0.55)",
  emerald:  "0 0 0 1px rgba(0,232,122,0.2), 0 0 24px rgba(0,232,122,0.12)",
  glow:     "0 0 60px rgba(0,232,122,0.08)",
};

// ─── Motion presets ────────────────────────────────────────────────────────────
// These are Framer Motion variant objects for common transitions.

export const MOTION = {
  // Standard page/section entry
  fadeUp: {
    hidden:  { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0,  filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  },

  // Stagger container
  stagger: (delay = 0.07) => ({
    hidden:  {},
    visible: { transition: { staggerChildren: delay, delayChildren: 0.1 } },
  }),

  // Spring scale-in
  scaleIn: {
    hidden:  { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1,
      transition: { type: "spring", stiffness: 360, damping: 26 } },
  },

  // Slide from right (route transition)
  slideRight: {
    hidden:  { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0,
      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, x: -16,
      transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } },
  },
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

/** Returns rgba string with given alpha from a hex color */
export function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Grade letter → canonical color token */
export function gradeColor(letter) {
  return {
    A: COLORS.gradeA,
    B: COLORS.gradeB,
    C: COLORS.gradeC,
    D: COLORS.gradeD,
    F: COLORS.gradeF,
  }[letter] ?? COLORS.textSecondary;
}
