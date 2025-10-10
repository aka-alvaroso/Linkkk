import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { cn } from "@/app/utils/cn";

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
  selected?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  customClassName?: string;
  selectedClassName?: string;
}

interface SelectProps {
  options: Option[];
  value: string | number | null;
  onChange: Dispatch<SetStateAction<string | number | null>>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  listClassName?: string;
  optionClassName?: string;
  optionSelectedClassName?: string;
}

export default function Select({
  options,
  value,
  onChange,
  label,
  placeholder = "Selecciona una opción",
  required = false,
  error = "",
  disabled = false,
  className,
  buttonClassName,
  listClassName,
  optionClassName,
  optionSelectedClassName,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(v: string | number, disabledOption?: boolean) {
    if (!disabled && !disabledOption) {
      onChange(v);
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      {label && (
        <label className="block mb-1 text-xs font-bold text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        ref={buttonRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "w-full py-2 px-4 border rounded-md text-left text-sm transition",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          error ? "border-red-500" : "border-gray-300 focus:ring focus:ring-blue-100",
          buttonClassName
        )}
      >
        {value !== null && value !== undefined
          ? options.find((opt) => opt.value === value)?.label
          : <span className="text-gray-400">{placeholder}</span>}
        <span className="float-right ml-2 text-gray-500">&#9662;</span>
      </button>

      {menuVisible && (
        <ul
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute z-10 w-full mt-1 bg-white shadow-md border border-gray-200 rounded-md transition-all duration-200 ease-in-out transform origin-top",
            animateOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
            listClassName
          )}
        >
          {options.map((opt) => {
            const isSelected = value === opt.value || opt.selected;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                onClick={() => handleSelect(opt.value, opt.disabled)}
                className={cn(
                  "flex items-center px-4 py-2 cursor-pointer select-none transition",
                  opt.disabled ? "cursor-not-allowed opacity-50" : "hover:bg-blue-50",
                  isSelected ? (opt.selectedClassName || optionSelectedClassName) : '',
                  optionClassName,
                  opt.customClassName
                )}
              >
                {opt.leftIcon && (
                  <span className="mr-2 flex-shrink-0">
                    {opt.leftIcon}
                  </span>
                )}
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.rightIcon && (
                  <span className="ml-2 flex-shrink-0">
                    {opt.rightIcon}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}
