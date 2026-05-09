"use client";

import { DollarSign } from "lucide-react";

/**
 * SpendInput
 * Controlled numeric input for monthly spend per tool.
 * Renders a dollar-prefixed text field with the project's dark glass aesthetic.
 *
 * @param {object}   props
 * @param {number|string} props.value    - Current spend value
 * @param {function} props.onChange      - Called with the new numeric value
 */
export default function SpendInput({ value, onChange }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    // Allow empty string during typing; pass 0 for the engine
    if (raw === "" || raw === "-") {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  };

  return (
    <div>
      <label className="block text-[9px] font-mono text-[#3a3a4a] uppercase tracking-[0.14em] mb-1.5">
        Monthly Spend
      </label>
      <div
        className="relative h-10 rounded-xl flex items-center gap-2 px-3 transition-all duration-200 focus-within:ring-1"
        style={{
          background: "rgba(255,255,255,0.038)",
          border: "1px solid rgba(255,255,255,0.065)",
          "--tw-ring-color": "rgba(0,232,122,0.4)",
        }}
      >
        <DollarSign size={11} className="text-[#3a3a4a] flex-shrink-0" />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={1}
          placeholder="0"
          value={value === 0 ? "" : value}
          onChange={handleChange}
          className="w-full bg-transparent text-sm font-mono text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#2a2a3a]"
          aria-label="Monthly spend in USD"
        />
      </div>
    </div>
  );
}
