"use client";
import React from "react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

/**
 * Interactive pill for the rules section with animated tooltip.
 */
export default function RulePill({
  icon: Icon,
  label,
  color,
  description,
  activePill,
  setActivePill,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  description: string;
  activePill: string | null;
  setActivePill: (v: string | null) => void;
}) {
  const isActive = activePill === label;

  return (
    <div className="rule-pill" style={{ zIndex: isActive ? 50 : 1 }}>
      <button
        onClick={() => setActivePill(isActive ? null : label)}
        className={`
          relative flex items-center gap-1 px-3 py-1.5 rounded-full border md:border-2
          font-black italic text-sm transition-all duration-200 cursor-pointer
          ${color}
          ${isActive ? "shadow-[3px_3px_0_var(--color-dark)] -translate-y-0.5" : "hover:-translate-y-0.5"}
        `}
      >
        <Icon size={20} strokeWidth={2} />
        <span className="font-black">{label}</span>
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "backOut" }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-warning text-dark text-xs font-bold italic px-3 py-2 rounded-xl whitespace-nowrap shadow-md"
          >
            {description}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
