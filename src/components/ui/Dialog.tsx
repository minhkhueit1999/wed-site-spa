'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Xử lý đóng khi bấm Escape
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Nền tối làm mờ */}
      <div
        className="animate-in fade-in fixed inset-0 bg-[#2B2622]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Nội dung Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-2xl transition-all',
          'animate-in zoom-in-95 duration-200',
          className,
        )}
      >
        <div className="flex items-start justify-between pb-4">
          <div className="space-y-1">
            <h2 id="dialog-title" className="font-serif text-2xl font-semibold text-[#2B2622]">
              {title}
            </h2>
            {description && (
              <p id="dialog-description" className="text-sm text-[#635B54]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#635B54] hover:bg-[#F3EDE3] hover:text-[#2B2622] focus-visible:ring-2 focus-visible:ring-[#405C4E] focus-visible:outline-none"
            aria-label="Đóng cửa sổ"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="py-2 text-[#2B2622]">{children}</div>
      </div>
    </div>
  );
}
