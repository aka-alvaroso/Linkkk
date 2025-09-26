import React, { useState, useRef, useEffect, useCallback } from 'react';

interface FloatingDropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface FloatingDropdownProps {
  trigger: React.ReactNode;
  items: FloatingDropdownItem[];
  direction?: 'left';
  spacing?: number;
  animationDuration?: number;
  staggerDelay?: number;
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

// Layouts predefinidos para dirección LEFT (distribución vertical)
const LEFT_LAYOUTS: Record<number, Position[]> = {
  1: [
    { x: 20, y: -20 }
  ],
  2: [
    { x: 20, y: -50 },
    { x: 20, y: 0 }
  ],
  3: [
    { x: 0, y: -80 },
    { x: 20, y: -20 },
    { x: 0, y: 40 }
  ],
  4: [
    { x: -20, y: -100 },
    { x: 20, y: -50 },
    { x: 20, y: 0 },
    { x: -20, y: 50 }
  ],
  5: [
    { x: -20, y: -120 },
    { x: 0, y: -70 },
    { x: 20, y: -20 },
    { x: 0, y: 30 },
    { x: -20, y: 80 }
  ],
  6: [
    { x: -20, y: -140 },
    { x: -10, y: -90 },
    { x: 10, y: -40 },
    { x: 10, y: 10 },
    { x: -10, y: 60 },
    { x: -20, y: 110 }
  ],
  7: [
    { x: -20, y: -170 },
    { x: -10, y: -120 },
    { x: 10, y: -70 },
    { x: 20, y: -20 },
    { x: 10, y: 30 },
    { x: -10, y: 80 },
    { x: -20, y: 130 }
  ],
  8: [
    { x: -30, y: -190 },
    { x: -20, y: -140 },
    { x: -10, y: -90 },
    { x: 10, y: -40 },
    { x: 10, y: 10 },
    { x: -10, y: 60 },
    { x: -20, y: 110 },
    { x: -30, y: 160 }
  ]
};

export const FloatingDropdown: React.FC<FloatingDropdownProps> = ({
  trigger,
  items,
  direction = 'left',
  spacing = 80,
  animationDuration = 300,
  staggerDelay = 80,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Función para abrir con animación
  const openDropdown = useCallback(() => {
    setIsOpen(true);
    // Pequeño delay para que el DOM se renderice antes de la animación
    setTimeout(() => {
      setIsAnimating(true);
    }, 10);
  }, []);

  // Función para cerrar con animación
  const closeDropdown = useCallback(() => {
    setIsClosing(true);
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, animationDuration + (items.length * staggerDelay));
  }, [animationDuration, items.length, staggerDelay]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (isOpen || isClosing) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, isClosing, openDropdown, closeDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeDropdown]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, closeDropdown]);

  const handleItemClick = (item: FloatingDropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      closeDropdown();
    }
  };

  const getPositions = (): Position[] => {
    const count = items.length;
    if (count === 0) return [];
    
    return LEFT_LAYOUTS[count] || LEFT_LAYOUTS[8];
  };

  const positions = getPositions();

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={toggleDropdown}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Floating Options */}
      {(isOpen || isClosing) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          {items.map((item, index) => {
            const position = positions[index];
            if (!position) return null;

            // Calcular delays para abrir y cerrar
            const openDelay = index * staggerDelay;
            const closeDelay = (items.length - 1 - index) * (staggerDelay / 2); // Cerrar en orden inverso más rápido

            // Estados de animación
            const isVisible = isAnimating && !isClosing;
            const animationState = isVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-75 translate-y-2';

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  absolute pointer-events-auto
                  px-3 py-2 rounded-lg shadow-xl border
                  flex items-center gap-2 text-sm font-medium
                  transition-all duration-300 ease-out
                  transform-gpu backdrop-blur-sm
                  ${item.disabled 
                    ? 'bg-gray-100/90 text-gray-400 cursor-not-allowed border-gray-200' 
                    : item.variant === 'danger'
                      ? 'bg-danger/5 text-danger border-danger hover:bg-danger/20 hover:scale-110 hover:shadow-red-200/50'
                      : 'bg-light text-dark border-dark/50 hover:bg-dark/10 hover:scale-110 hover:shadow-lg'
                  }
                  ${animationState}
                `}
                style={{
                  right: `${position.x}px`,
                  top: `${position.y}px`,
                  transitionDelay: isClosing ? `${closeDelay}ms` : `${openDelay}ms`,
                  transformOrigin: 'center',
                  zIndex: 9999,
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
                }}
              >
                {item.icon && (
                  <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                )}
                <span className="whitespace-nowrap font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FloatingDropdown;
