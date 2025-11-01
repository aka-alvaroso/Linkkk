import { useState, useRef, useEffect } from "react";
import { cn } from "@/app/utils/cn";
import { TbX } from "react-icons/tb";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

interface Option {
  label?: string;
  value: string | number;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  title?: string; // Tooltip when hovering (useful for icon-only)
}

interface InlineSelectProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  disabled?: boolean;
  showCloseButton?: boolean;
  className?: string;
  buttonClassName?: string;
  selectedClassName?: string;
}

export default function InlineSelect({
  options,
  value,
  onChange,
  disabled = false,
  showCloseButton = false,
  className = "",
  buttonClassName = "",
  selectedClassName = "",
}: InlineSelectProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isExpanded]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsExpanded(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-flex", className)}>
      <motion.div
        layout
        className={cn(
          "inline-flex items-center rounded-full",
          isExpanded ? "gap-1 bg-dark/5 p-1" : "p-1"
        )}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {!isExpanded ? (
          // Collapsed state - single button
          <motion.button
            layout
            onClick={handleToggle}
            disabled={disabled}
            title={selectedOption?.title}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5",
              "border border-dark rounded-2xl",
              "bg-light text-dark font-medium text-sm",
              "transition-all duration-200",
              "hover:shadow-[2px_2px_0_var(--color-dark)]",
              "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none hover:cursor-pointer",
              selectedClassName,
              buttonClassName
            )}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {selectedOption?.leftIcon && (
              <span className="flex-shrink-0">{selectedOption.leftIcon}</span>
            )}
            {selectedOption?.label && <span>{selectedOption.label}</span>}
            {!selectedOption?.label && !selectedOption?.leftIcon && !selectedOption?.rightIcon && (
              <span>Select...</span>
            )}
            {selectedOption?.rightIcon && (
              <span className="flex-shrink-0">{selectedOption.rightIcon}</span>
            )}
          </motion.button>
        ) : (
          // Expanded state - multiple buttons
          <>
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  layout: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
                  opacity: { duration: 0.15, delay: index * 0.03 },
                  scale: { duration: 0.2, delay: index * 0.03, ease: "backOut" }
                }}
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                title={option.title}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 whitespace-nowrap",
                  "border rounded-2xl",
                  "text-dark font-medium text-sm",
                  "transition-all duration-200",
                  "hover:shadow-[2px_2px_0_var(--color-dark)]",
                  "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none hover:cursor-pointer",
                  option.value === value
                    ? "bg-primary border-dark"
                    : "bg-light border-dark/30",
                  option.className
                )}
              >
                {option.leftIcon && (
                  <span className="flex-shrink-0">{option.leftIcon}</span>
                )}
                {option.label && <span>{option.label}</span>}
                {option.rightIcon && (
                  <span className="flex-shrink-0">{option.rightIcon}</span>
                )}
              </motion.button>
            ))}

            {showCloseButton && (
              <motion.button
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  layout: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
                  opacity: { duration: 0.15, delay: options.length * 0.03 },
                  scale: { duration: 0.2, delay: options.length * 0.03 }
                }}
                onClick={handleClose}
                className={cn(
                  "inline-flex items-center justify-center",
                  "w-8 h-8 rounded-2xl",
                  "bg-dark/10",
                  "text-dark ",
                  "transition-all duration-200",
                  "hover:shadow-[2px_2px_0_var(--color-dark)]",
                  "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                )}
              >
                <TbX size={16} />
              </motion.button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
