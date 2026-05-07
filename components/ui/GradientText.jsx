"use client";

/**
 * GradientText — renders text with a CSS gradient fill.
 * Props: children, variant ("green"|"fire"|"blue"|"custom"), from, to, angle, className, as
 */
export default function GradientText({
  children,
  variant = "green",
  from,
  to,
  angle = 135,
  className = "",
  as: Tag = "span",
}) {
  const gradients = {
    green: "linear-gradient(135deg, #00e87a 0%, #00c4ff 100%)",
    fire:  "linear-gradient(120deg, #ff6b6b 0%, #f59e0b 100%)",
    blue:  "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
    purple:"linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)",
  };

  const gradient =
    variant === "custom" && from && to
      ? `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`
      : gradients[variant] ?? gradients.green;

  return (
    <Tag
      className={className}
      style={{
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        display: "inline",
      }}
    >
      {children}
    </Tag>
  );
}
