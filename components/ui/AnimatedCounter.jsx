"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AnimatedCounter — counts from `from` to `to` using rAF.
 * Props: from, to, prefix, suffix, decimals, duration, className
 */
export default function AnimatedCounter({
  from = 0,
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1200,
  className = "",
}) {
  const [value, setValue] = useState(from);
  const startedAt = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    startedAt.current = null;

    const step = (ts) => {
      if (!startedAt.current) startedAt.current = ts;
      const elapsed = ts - startedAt.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [from, to, duration]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
