import React from "react";
import { TbX } from "react-icons/tb";
import type { Tag } from "@/app/types";
import { cn } from "@/app/utils/cn";
import { motion, AnimatePresence } from "motion/react";

interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  size?: "xs" | "sm" | "md";
  variant?: "soft" | "solid" | "outline";
  className?: string;
}

/** Returns true when the hex color is dark enough to need white text. */
export function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 160;
}

export default function TagChip({ tag, onRemove, size = "sm", variant = "solid", className }: TagChipProps) {
  const sizeClasses = {
    xs: "text-xs px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
  };

  const bgColor = tag.color ?? "#6b7280";

  const solidStyle = {
    backgroundColor: bgColor,
    color: isDark(bgColor) ? "#ffffff" : "#1b1b1b",
    borderColor: bgColor,
    transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
  };

  const softStyle = {
    backgroundColor: bgColor + "22",
    color: bgColor,
    borderColor: bgColor + "44",
    transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
  };

  const outlineStyle = {
    backgroundColor: "transparent",
    color: bgColor,
    borderColor: bgColor,
    transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
  };

  const styleMap = { solid: solidStyle, soft: softStyle, outline: outlineStyle };

  return (
    <motion.span
      layout="size"
      transition={{ duration: 0.2, ease: "backOut" }}
      className={cn(
        "inline-flex items-center rounded-full font-medium border select-none overflow-hidden",
        sizeClasses[size],
        className
      )}
      style={styleMap[variant]}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: variant === "solid"
            ? (isDark(bgColor) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)")
            : bgColor,
          transition: "background-color 0.2s",
        }}
      />

      {tag.name}

      <AnimatePresence initial={false}>
        {onRemove && (
          <motion.span
            key="remove"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "backOut" }}
            className="overflow-hidden flex items-center flex-shrink-0"
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="flex-shrink-0"
              aria-label={`Remove tag ${tag.name}`}
            >
              <TbX size={14} strokeWidth={2.5} />
            </button>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
