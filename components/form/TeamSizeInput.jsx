"use client";

import { Users } from "lucide-react";

/**
 * TeamSizeInput
 * Controlled integer input for team headcount.
 * Enforces min=1, integer-only, with the project's dark glass aesthetic.
 *
 * @param {object}        props
 * @param {number|string} props.value    - Current team size
 * @param {function}      props.onChange - Called with the new numeric value
 */
export default function TeamSizeInput({ value, onChange }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      // Let the field appear empty while typing; parent treats "" as invalid
      onChange("");
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      onChange(parsed);
    }
  };

  return (
    <div>
      <label className="block text-[9px] font-mono text-[#3a3a4a] uppercase tracking-[0.14em] mb-1.5">
        Team Size
      </label>
      <div
        className="relative h-10 rounded-xl flex items-center gap-2 px-3 transition-all duration-200 focus-within:ring-1"
        style={{
          background: "rgba(255,255,255,0.038)",
          border: "1px solid rgba(255,255,255,0.065)",
          "--tw-ring-color": "rgba(0,232,122,0.4)",
        }}
      >
        <Users size={11} className="text-[#3a3a4a] flex-shrink-0" />
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={10000}
          step={1}
          placeholder="e.g. 12"
          value={value}
          onChange={handleChange}
          className="w-full bg-transparent text-sm font-mono text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#2a2a3a]"
          aria-label="Number of people on your team"
        />
      </div>
    </div>
  );
}
