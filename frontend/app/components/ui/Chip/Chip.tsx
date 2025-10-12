import React from 'react';
import { cn } from '@/app/utils/cn';

interface ChipProps {
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'dark' | 'info' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  iconOnly?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  iconOnly = false,
  className = '',
  onClick,
}) => {
  // Check if className contains custom color classes (bg- or text-)
  const hasCustomColors = className.includes('bg-') || className.includes('text-');
  const effectiveVariant = hasCustomColors ? 'custom' : variant;

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition duration-200';

  // Size styles
  const sizeStyles = {
    sm: iconOnly ? 'h-6 w-6 text-xs' : 'h-6 px-2 text-xs gap-1',
    md: iconOnly ? 'h-8 w-8 text-sm' : 'h-8 px-3 text-sm gap-1.5',
    lg: iconOnly ? 'h-10 w-10 text-base' : 'h-10 px-4 text-base gap-2',
  };

  // Rounded styles
  const roundedStyles = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Variant styles
  const variantStyles = {
    default: 'text-dark bg-dark/10 hover:bg-dark/20',
    success: 'text-success bg-success/10 hover:bg-success/20',
    warning: 'text-warning bg-warning/10 hover:bg-warning/20',
    danger: 'text-danger bg-danger/10 hover:bg-danger/20',
    dark: 'text-light bg-dark hover:bg-dark/80',
    info: 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20',
    custom: '', // No styles for custom variant - uses only className
  };

  // Cursor style
  const cursorStyle = onClick ? 'cursor-pointer' : 'cursor-default';

  // Combine all styles using cn()
  const chipClasses = cn(
    baseStyles,
    sizeStyles[size],
    roundedStyles[rounded],
    variantStyles[effectiveVariant],
    cursorStyle,
    className
  );

  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if(e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={chipClasses}
    >
      {leftIcon && (
        <span className="flex-shrink-0">
          {leftIcon}
        </span>
      )}

      {!iconOnly && children && (
        <span className="truncate">
          {children}
        </span>
      )}

      {iconOnly && !leftIcon && !rightIcon && (
        <span className="flex-shrink-0">
          {children}
        </span>
      )}

      {rightIcon && (
        <span className="flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </span>
  );
};

export default Chip;
