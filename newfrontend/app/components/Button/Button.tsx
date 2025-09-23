import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
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
    // Mapeo de rounded
    const roundedClasses = {
      none: 'rounded-none',
      xs: 'rounded-xs',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full'
    };

    // Clases base
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      roundedClasses[rounded],
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'cursor-pointer',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none'
    ];

    // Variantes de estilo
    const variantClasses = {
      solid: [
        'bg-black',
        'text-white',
        'hover:bg-black/90'
      ],
      outline: [
        'border-2',
        'border-black',
        'bg-transparent',
        'text-black',
        'hover:bg-black',
        'hover:text-white'
      ],
      ghost: [
        'bg-transparent',
        'text-black',
        'hover:bg-black/10'
      ]
    };

    // Tamaños
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

    // Clases adicionales
    const additionalClasses = [
      iconOnly && 'rounded-full',
      loading && 'cursor-wait'
    ].filter(Boolean);

    // Combinar todas las clases
    const buttonClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[size],
      ...additionalClasses,
      className
    ].join(' ');

    // Contenido del botón
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