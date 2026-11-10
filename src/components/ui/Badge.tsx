import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'terracotta'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#EAE1D3] text-[#2B2622] border-transparent',
    primary: 'bg-[#405C4E] text-[#FAF7F2] border-transparent',
    secondary: 'bg-[#F3EDE3] text-[#405C4E] border-[#5B7B6A]/30',
    terracotta: 'bg-[#F4EAE4] text-[#B8714F] border-[#B8714F]/30',
    success: 'bg-[#E5F3EB] text-[#2F6A4F] border-[#2F6A4F]/30',
    warning: 'bg-[#FEF5E7] text-[#9E6700] border-[#9E6700]/30',
    error: 'bg-[#FDECEC] text-[#9E3838] border-[#9E3838]/30',
    outline: 'bg-transparent text-[#2B2622] border-[#E2D9CC]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
