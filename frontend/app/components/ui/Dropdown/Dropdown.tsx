"use client";
import { useState, useRef, useEffect, ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { cn } from "@/app/utils/cn";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  separator?: boolean;
  customClassName?: string;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  itemClassName?: string;
  disabled?: boolean;
}

const placementClasses: Record<string, string> = {
  "bottom-left":  "top-full left-0 mt-1 origin-top-left",
  "bottom-right": "top-full right-0 mt-1 origin-top-right",
  "top-left":     "bottom-full left-0 mb-1 origin-bottom-left",
  "top-right":    "bottom-full right-0 mb-1 origin-bottom-right",
};

export default function Dropdown({
  trigger,
  items,
  placement = "bottom-right",
  className,
  triggerClassName,
  menuClassName,
  itemClassName,
  disabled = false,
}: DropdownProps) {
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

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          triggerClassName
        )}
      >
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown-menu"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: "backOut" }}
            className={cn(
              "absolute z-50 min-w-40 py-1 bg-light border border-dark/10 rounded-2xl overflow-hidden",
              placementClasses[placement],
              menuClassName
            )}
          >
            {items.map((item, index) => (
              <div key={`${item.value}-${index}`}>
                {item.separator && index > 0 && (
                  <div className="my-1 border-t border-dark/5" />
                )}
                <motion.button
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + index * 0.04, ease: "backOut" }}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer",
                    "hover:bg-dark/5",
                    item.danger && "text-danger hover:bg-danger/10",
                    item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                    itemClassName,
                    item.customClassName
                  )}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 text-dark/50">{item.icon}</span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                </motion.button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
