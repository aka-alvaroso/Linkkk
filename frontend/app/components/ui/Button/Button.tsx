import React from 'react';
import { cn } from '@/app/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      size = 'md',
      rounded = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const roundedClasses = {
      none: 'rounded-none',
      xs: 'rounded-xs',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      '4xl': 'rounded-4xl',
      full: 'rounded-full'
    };

    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'cursor-pointer',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none'
    ];

    const variantClasses = {
      solid: [
        'bg-dark',
        'text-light',
        'hover:bg-dark/90'
      ],
      outline: [
        'border-2',
        'border-dark/90',
        'bg-transparent',
        'text-dark',
        'hover:bg-dark/90',
        'hover:text-light'
      ],
      ghost: [
        'bg-transparent',
        'text-dark',
        'hover:bg-dark/5'
      ],
      link: [
        'bg-transparent',
        'text-dark',
        'hover:bg-dark/5'
      ]
    };

    const sizeClasses = {
      xs: iconOnly 
        ? ['w-6', 'h-6', 'p-1', 'text-xs'] 
        : ['px-2', 'py-1', 'text-xs'],
      sm: iconOnly 
        ? ['w-8', 'h-8', 'p-1.5', 'text-sm'] 
        : ['px-3', 'py-1.5', 'text-sm'],
      md: iconOnly 
        ? ['w-10', 'h-10', 'p-2', 'text-base'] 
        : ['px-4', 'py-2', 'text-base'],
      lg: iconOnly 
        ? ['w-12', 'h-12', 'p-2.5', 'text-lg'] 
        : ['px-6', 'py-3', 'text-lg'],
      xl: iconOnly 
        ? ['w-14', 'h-14', 'p-3', 'text-xl']
        : ['px-8', 'py-4', 'text-xl'],
    };

    const additionalClasses = [
      loading && 'cursor-wait'
    ].filter(Boolean);

    const buttonClasses = cn(
      ...baseClasses,
      roundedClasses[rounded],
      ...variantClasses[variant],
      ...sizeClasses[size],
      ...additionalClasses,
      className
    );

    const buttonContent = () => {
      if (loading) {
        return (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {!iconOnly && (children || 'Loading...')}
          </>
        );
      }

      if (iconOnly) {
        return leftIcon || rightIcon || children;
      }

      return (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      );
    };

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;