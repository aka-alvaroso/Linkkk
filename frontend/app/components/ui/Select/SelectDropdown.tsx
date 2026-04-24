"use client";
import { useState, useRef, useEffect, ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { TbChevronDown, TbCheck, TbX } from "react-icons/tb";
import { cn } from "@/app/utils/cn";

export interface SelectOption {
  label: string;
  value: string | number;
  color?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

// ─── Single-select props ───────────────────────────────────────────────────────
interface SingleProps {
  mode?: "single";
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  values?: never;
  onChangeMulti?: never;
  showAllOption?: never;
  allLabel?: never;
}

// ─── Multi-select props ────────────────────────────────────────────────────────
interface MultiProps {
  mode: "multi";
  values: (string | number)[];
  onChangeMulti: (values: (string | number)[]) => void;
  value?: never;
  onChange?: never;
  showAllOption?: boolean;
  allLabel?: string;
}

type ModeProps = SingleProps | MultiProps;

interface BaseProps {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  showNoneOption?: boolean;
  noneLabel?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  placement?: "bottom-left" | "bottom-right";
  maxHeight?: number;
}

export type SelectDropdownProps = BaseProps & ModeProps;

export default function SelectDropdown({
  options,
  placeholder = "Select…",
  label,
  showNoneOption = false,
  noneLabel = "None",
  disabled = false,
  className,
  triggerClassName,
  placement = "bottom-left",
  maxHeight = 240,
  ...modeProps
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Outside-click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const isMulti = modeProps.mode === "multi";

  // ─── Trigger label ────────────────────────────────────────────────────────────
  const triggerContent = () => {
    if (isMulti) {
      const { values } = modeProps as MultiProps;
      if (!values.length) return <span className="text-dark/35">{placeholder}</span>;
      if (values.length === 1) {
        const opt = options.find((o) => o.value === values[0]);
        return (
          <span className="flex items-center gap-1.5">
            {opt?.color && (
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
            )}
            {opt?.icon && <span className="flex-shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt?.label ?? values[0]}</span>
          </span>
        );
      }
      return <span className="text-dark/70">{values.length} selected</span>;
    } else {
      const { value } = modeProps as SingleProps;
      if (value === null || value === undefined) return <span className="text-dark/35">{placeholder}</span>;
      const opt = options.find((o) => o.value === value);
      return (
        <span className="flex items-center gap-1.5">
          {opt?.color && (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
          )}
          {opt?.icon && <span className="flex-shrink-0">{opt.icon}</span>}
          <span className="truncate">{opt?.label ?? value}</span>
        </span>
      );
    }
  };

  // ─── Toggle helpers ────────────────────────────────────────────────────────────
  const handleSingleSelect = (val: string | number | null) => {
    (modeProps as SingleProps).onChange(val);
    setOpen(false);
  };

  const handleMultiToggle = (val: string | number) => {
    const p = modeProps as MultiProps;
    const next = p.values.includes(val)
      ? p.values.filter((v) => v !== val)
      : [...p.values, val];
    p.onChangeMulti(next);
  };

  const handleSelectAll = () => {
    const p = modeProps as MultiProps;
    p.onChangeMulti(options.filter((o) => !o.disabled).map((o) => o.value));
  };

  const handleClearAll = () => {
    const p = modeProps as MultiProps;
    p.onChangeMulti([]);
  };

  const placementClass = placement === "bottom-right"
    ? "right-0 origin-top-right"
    : "left-0 origin-top-left";

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {label && (
        <span className="block mb-1 text-xs font-semibold text-dark/40">{label}</span>
      )}

      {/* ── Trigger ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm border transition-all cursor-pointer select-none",
          "rounded-xl bg-light border-dark/20 hover:border-dark/40 shadow-sm",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          triggerClassName
        )}
      >
        <span className="flex-1 text-left text-sm">{triggerContent()}</span>
        <TbChevronDown
          size={14}
          className={cn(
            "flex-shrink-0 text-dark/40 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: "backOut" }}
            className={cn(
              "absolute top-full mt-1 z-50 bg-light border border-dark/10 rounded-2xl overflow-hidden py-1 min-w-40",
              placementClass
            )}
            style={{ maxHeight: maxHeight + 48, overflowY: "auto", overflowX: "hidden" }}
          >
            {/* Multi: All / None controls */}
            {isMulti && (modeProps as MultiProps).showAllOption && (
              <div className="flex gap-0 border-b border-dark/5 mb-1 pb-1">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex-1 px-4 py-1.5 text-xs text-dark/50 hover:text-dark hover:bg-dark/5 transition-colors text-left"
                >
                  {(modeProps as MultiProps).allLabel ?? "All"}
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-1.5 text-xs text-dark/50 hover:text-dark hover:bg-dark/5 transition-colors text-left"
                >
                  {noneLabel}
                </button>
              </div>
            )}

            {/* Single: None / clear option */}
            {!isMulti && showNoneOption && (
              <button
                type="button"
                onClick={() => handleSingleSelect(null)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-dark/5 transition-colors text-dark/40",
                  "border-b border-dark/5 mb-1"
                )}
              >
                <TbX size={14} className="flex-shrink-0" />
                <span className="flex-1 text-left">{noneLabel}</span>
                {(modeProps as SingleProps).value === null && (
                  <TbCheck size={14} className="flex-shrink-0 text-dark/40" />
                )}
              </button>
            )}

            {/* Options */}
            <div style={{ maxHeight, overflowY: "auto", overflowX: "hidden" }}>
              {options.map((opt, index) => {
                const isSelected = isMulti
                  ? (modeProps as MultiProps).values.includes(opt.value)
                  : (modeProps as SingleProps).value === opt.value;

                return (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + index * 0.03, ease: "backOut" }}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      if (opt.disabled) return;
                      isMulti
                        ? handleMultiToggle(opt.value)
                        : handleSingleSelect(opt.value);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-dark/5 transition-colors cursor-pointer",
                      opt.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                      isSelected && !isMulti && "font-medium"
                    )}
                  >
                    {/* Multi: checkbox on left */}
                    {isMulti && (
                      <span
                        className={cn(
                          "w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-dark border-dark"
                            : "border-dark/20 bg-transparent"
                        )}
                      >
                        {isSelected && <TbCheck size={11} strokeWidth={3} className="text-light" />}
                      </span>
                    )}

                    {/* Color dot */}
                    {opt.color && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}

                    {/* Icon */}
                    {opt.icon && !opt.color && (
                      <span className="flex-shrink-0 text-dark/50">{opt.icon}</span>
                    )}

                    {/* Label */}
                    <span className="flex-1 text-left truncate">{opt.label}</span>

                    {/* Single: check on right */}
                    {!isMulti && isSelected && (
                      <TbCheck size={14} className="flex-shrink-0 text-dark/60" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
