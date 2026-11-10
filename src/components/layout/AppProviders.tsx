'use client';

import * as React from 'react';
import { QualityTierProvider } from '@/infrastructure/motion/QualityTierContext';
import { SmoothScrollProvider } from '@/infrastructure/motion/SmoothScrollProvider';
import { AuthPortalGate } from '@/components/auth/AuthPortalGate';
import { SaSpaBotanicalOverlay } from '@/components/canvas/SaSpaBotanicalOverlay';
import { SoundscapeToggle } from '@/components/ui/SoundscapeToggle';
import { CartDrawer } from '@/components/ecommerce/CartDrawer';
import { FlyToCartOverlay } from '@/components/ecommerce/FlyToCartOverlay';

interface AppProvidersProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  userEmail?: string | null;
  userName?: string | null;
}

export function AppProviders({
  children,
  isAuthenticated = false,
  userEmail,
  userName,
}: AppProvidersProps) {
  return (
    <QualityTierProvider>
      <SmoothScrollProvider>
        <AuthPortalGate isAuthenticated={isAuthenticated} userEmail={userEmail} userName={userName}>
          {children}
          {/* Lớp phủ đa giác quan Sả Spa & Thanh âm 432Hz */}
          <SaSpaBotanicalOverlay />
          <SoundscapeToggle />
          {/* Giỏ hàng trượt thông minh & Hiệu ứng bay vào giỏ */}
          <CartDrawer />
          <FlyToCartOverlay />
        </AuthPortalGate>
      </SmoothScrollProvider>
    </QualityTierProvider>
  );
}
