import React from 'react';
import { TbMinus, TbCircle } from 'react-icons/tb';
import { cn } from '@/app/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onChange,
      disabled = false,
      className = '',
      size = 'md',
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'rounded-full flex items-center justify-center transition-all duration-200 ease-in-out',
          'focus:outline-none shadow-[_2px_2px_0_var(--color-dark)] border border-dark',
          sizeClasses[size],
          checked
            ? 'bg-success text-dark hover:bg-success/90 '
            : 'bg-danger text-light hover:bg-danger/90',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer',
          className
        )}
      >
        {checked ? (
          <TbMinus size={iconSizes[size]} strokeWidth={3} className='rotate-90' />
        ) : (
          <TbCircle size={iconSizes[size]} strokeWidth={2.5} />
        )}
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
