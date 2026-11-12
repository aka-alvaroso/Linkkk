import React, { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, useId } from 'react';
import { cn } from '@/app/utils/cn';

interface BaseInputProps {
  value?: string;
  label?: string;
  error?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  textarea?: boolean;
}

type InputProps = BaseInputProps &
  (
    | ({ textarea?: false } & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>)
    | ({ textarea: true } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  );

const sizeStyles = {
  sm: 'text-sm py-1 px-2',
  md: 'text-base py-2 px-3',
  lg: 'text-lg py-3 px-4',
  xl: 'text-xl py-4 px-5',
};

const roundedStyles = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  'full': 'rounded-full',
};

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      value,
      label,
      error,
      description,
      size = 'md',
      rounded = 'md',
      leftIcon,
      rightIcon,
      className,
      textarea = false,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    const commonClasses = cn(
      'block w-full bg-dark/5 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed focus:border-dark focus:outline-none',
      sizeStyles[size],
      roundedStyles[rounded],
      hasError && 'border-danger',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block mb-1 text-sm font-medium text-dark">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{leftIcon}</div>}
          {textarea ? (
            <textarea id={inputId} ref={ref as React.Ref<HTMLTextAreaElement>} className={commonClasses} {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
          ) : (
            <input
              id={inputId}
              value={value}
              ref={ref as React.Ref<HTMLInputElement>}
              className={commonClasses}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${inputId}-error` : description ? `${inputId}-desc` : undefined}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
          {rightIcon && <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">{rightIcon}</div>}
        </div>
        {description && !hasError && (
          <p id={`${inputId}-desc`} className="mt-1 text-sm text-dark/70">
            {description}
          </p>
        )}
        {hasError && (
          <p id={`${inputId}-error`} role="alert" className="mt-1 text-sm font-medium text-dark flex items-center gap-1.5 before:content-[''] before:size-2 before:rounded-full before:bg-danger before:shrink-0">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
