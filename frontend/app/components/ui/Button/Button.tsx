import React, { useState } from 'react';
import { cn } from '@/app/utils/cn';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  expandOnHover?: 'text' | 'icon' | 'none';
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
      expandOnHover = 'none',
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
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
      'disabled:pointer-events-none',
      'disabled:hover:shadow-none'
    ];

    const variantClasses = {
      solid: [
        'bg-dark',
        'text-light',
        'border',
        'border-dark',
        'hover:shadow-[2px_2px_0_var(--color-dark)]',
        'active:shadow-none',
        'active:translate-x-[2px]',
        'active:translate-y-[2px]'
      ],
      outline: [
        'border',
        'border-dark',
        'bg-light',
        'text-dark',
        'hover:shadow-[2px_2px_0_var(--color-dark)]',
        'active:shadow-none',
        'active:translate-x-[2px]',
        'active:translate-y-[2px]'
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

    const t = useTranslations('Common');

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
            {!iconOnly && (children || t('loading'))}
          </>
        );
      }

      if (iconOnly) {
        return leftIcon || rightIcon || children;
      }

      // expandOnHover="text" - Show icon only, expand to show text on hover
      if (expandOnHover === 'text') {
        if (leftIcon) {
          return (
            <>
              <span>{leftIcon}</span>
              <AnimatePresence>
                {isHovered && children && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {children}
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          );
        }
        if (rightIcon) {
          return (
            <>
              <AnimatePresence>
                {isHovered && children && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginRight: 0 }}
                    animate={{ width: "auto", opacity: 1, marginRight: 8 }}
                    exit={{ width: 0, opacity: 0, marginRight: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {children}
                  </motion.span>
                )}
              </AnimatePresence>
              <span>{rightIcon}</span>
            </>
          );
        }
      }

      // expandOnHover="icon" - Show text only, expand to show icon on hover
      if (expandOnHover === 'icon') {
        if (leftIcon) {
          return (
            <>
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginRight: 0 }}
                    animate={{ width: "auto", opacity: 1, marginRight: 8 }}
                    exit={{ width: 0, opacity: 0, marginRight: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {leftIcon}
                  </motion.span>
                )}
              </AnimatePresence>
              {children}
            </>
          );
        }
        if (rightIcon) {
          return (
            <>
              {children}
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {rightIcon}
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          );
        }
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {buttonContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;