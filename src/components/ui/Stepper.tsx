import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  className?: string;
}

export function Stepper({ steps, currentStepIndex, className }: StepperProps) {
  return (
    <nav aria-label="Tiến trình hoàn thành" className={cn('w-full', className)}>
      <ol className="flex w-full items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex flex-1 flex-col items-center text-center',
                index !== steps.length - 1 &&
                  "after:absolute after:top-4 after:left-1/2 after:h-0.5 after:w-full after:-translate-y-1/2 after:content-['']",
                index !== steps.length - 1 &&
                  (isCompleted ? 'after:bg-[#405C4E]' : 'after:bg-[#E2D9CC]'),
              )}
            >
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200',
                  isCompleted && 'bg-[#405C4E] text-[#FAF7F2]',
                  isCurrent && 'bg-[#B8714F] text-[#FAF7F2] ring-4 ring-[#F4EAE4]',
                  !isCompleted &&
                    !isCurrent &&
                    'border border-[#E2D9CC] bg-[#F3EDE3] text-[#635B54]',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'mt-2 max-w-[90px] truncate text-xs font-medium',
                  isCurrent ? 'font-semibold text-[#B8714F]' : 'text-[#635B54]',
                )}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
