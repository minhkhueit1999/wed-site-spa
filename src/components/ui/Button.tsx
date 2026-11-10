import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'terracotta' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      primary:
        'bg-[#405C4E] text-[#FAF7F2] hover:bg-[#2D4137] focus-visible:ring-[#405C4E] shadow-sm',
      secondary:
        'bg-[#F3EDE3] text-[#2B2622] hover:bg-[#EAE1D3] border border-[#E2D9CC] focus-visible:ring-[#5B7B6A]',
      terracotta:
        'bg-[#B8714F] text-[#FAF7F2] hover:bg-[#9E5D3D] focus-visible:ring-[#B8714F] shadow-sm',
      ghost: 'bg-transparent text-[#2B2622] hover:bg-[#F3EDE3] focus-visible:ring-[#5B7B6A]',
      danger: 'bg-[#9E3838] text-[#FAF7F2] hover:bg-[#832B2B] focus-visible:ring-[#9E3838]',
      outline:
        'border border-[#405C4E] text-[#405C4E] bg-transparent hover:bg-[#405C4E]/10 focus-visible:ring-[#405C4E]',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm rounded-lg min-h-[36px] min-w-[36px]',
      md: 'h-11 px-5 text-base rounded-xl min-h-[44px] min-w-[44px]',
      lg: 'h-13 px-7 text-lg rounded-xl min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <span>Đang xử lý...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
