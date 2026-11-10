'use client';

import * as React from 'react';
import { QualityTierProvider } from '@/infrastructure/motion/QualityTierContext';
import { SmoothScrollProvider } from '@/infrastructure/motion/SmoothScrollProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QualityTierProvider>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </QualityTierProvider>
  );
}
