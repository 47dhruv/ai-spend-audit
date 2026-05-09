"use client";

/**
 * components/primitives/Tooltip.jsx
 *
 * Premium tooltip with Framer Motion animations.
 * Supports content, placement, and delay.
 *
 * Usage:
 *   <Tooltip content="Estimated monthly savings if all recommendations are applied">
 *     <InfoButton />
 *   </Tooltip>
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PLACEMENT_STYLES = {
  top: {
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
  },
  bottom: {
    top: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
  },
  left: {
    right: "calc(100% + 8px)",
    top: "50%",
    transform: "translateY(-50%)",
  },
  right: {
    left: "calc(100% + 8px)",
    top: "50%",
    transform: "translateY(-50%)",
  },
};

const ENTRANCE = {
  top:    { hidden: { opacity: 0, y: 4,  scale: 0.94 }, visible: { opacity: 1, y: 0,  scale: 1 } },
  bottom: { hidden: { opacity: 0, y: -4, scale: 0.94 }, visible: { opacity: 1, y: 0,  scale: 1 } },
  left:   { hidden: { opacity: 0, x: 4,  scale: 0.94 }, visible: { opacity: 1, x: 0,  scale: 1 } },
  right:  { hidden: { opacity: 0, x: -4, scale: 0.94 }, visible: { opacity: 1, x: 0,  scale: 1 } },
};

/**
 * @param {object}        props
 * @param {React.ReactNode} props.content   — tooltip text or node
 * @param {React.ReactNode} props.children  — trigger element
 * @param {"top"|"bottom"|"left"|"right"} [props.placement="top"]
 * @param {number}        [props.delay=300] — show delay in ms
 * @param {boolean}       [props.disabled]
 */
export default function Tooltip({
  content,
  children,
  placement = "top",
  delay = 300,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);
  const timerRef  = useRef(null);
  const wrapperRef = useRef(null);

  const show = useCallback(() => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [disabled, delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!content || disabled) return <>{children}</>;

  const posStyle = PLACEMENT_STYLES[placement] ?? PLACEMENT_STYLES.top;
  const anim     = ENTRANCE[placement]          ?? ENTRANCE.top;

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            role="tooltip"
            initial={anim.hidden}
            animate={anim.visible}
            exit={anim.hidden}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="tooltip-surface pointer-events-none absolute z-[9999] max-w-[240px] rounded-xl px-3 py-2"
            style={posStyle}
          >
            {typeof content === "string" ? (
              <p className="text-xs leading-relaxed whitespace-normal" style={{ color: "#c0c0d0" }}>
                {content}
              </p>
            ) : content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
