import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/app/utils/cn";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  separator?: boolean;
  customClassName?: string;
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle animation timing
  useEffect(() => {
    let openTimeout: NodeJS.Timeout;
    let closeTimeout: NodeJS.Timeout;

    if (open) {
      setMenuVisible(true);
      openTimeout = setTimeout(() => setAnimateOpen(true), 20);
    } else {
      setAnimateOpen(false);
      closeTimeout = setTimeout(() => setMenuVisible(false), 200);
    }

    return () => {
      clearTimeout(openTimeout);
      clearTimeout(closeTimeout);
    };
  }, [open]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      setOpen(false);
    }
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case "bottom-left":
        return "top-full left-0 mt-2 origin-top-left";
      case "bottom-right":
        return "top-full right-0 mt-2 origin-top-right";
      case "top-left":
        return "bottom-full left-0 mb-2 origin-bottom-left";
      case "top-right":
        return "bottom-full right-0 mb-2 origin-bottom-right";
      default:
        return "top-full right-0 mt-2 origin-top-right";
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Trigger */}
      <div
        ref={triggerRef}
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
      {menuVisible && (
        <div
          ref={menuRef}
          className={cn(
            "absolute z-50 min-w-[12rem] py-1 bg-white rounded-xl shadow-lg border border-dark/10",
            "transition-all duration-200 ease-in-out transform",
            animateOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
            getPlacementClasses(),
            menuClassName
          )}
        >
          {items.map((item, index) => (
            <div key={`${item.value}-${index}`}>
              {item.separator && index > 0 && (
                <div className="my-1 border-t border-dark/5" />
              )}
              <button
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                  "hover:bg-dark/5 active:bg-dark/10",
                  item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                  itemClassName,
                  item.customClassName
                )}
              >
                {item.icon && (
                  <span className="flex-shrink-0 text-lg">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
