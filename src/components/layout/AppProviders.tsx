'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QualityTierProvider } from '@/infrastructure/motion/QualityTierContext';
import { SmoothScrollProvider } from '@/infrastructure/motion/SmoothScrollProvider';
import { AuthPortalGate } from '@/components/auth/AuthPortalGate';
import { SaSpaBotanicalOverlay } from '@/components/canvas/SaSpaBotanicalOverlay';
import { SoundscapeToggle } from '@/components/ui/SoundscapeToggle';
import { CartDrawer } from '@/components/ecommerce/CartDrawer';
import { FlyToCartOverlay } from '@/components/ecommerce/FlyToCartOverlay';
import { AuthContext } from './AuthContext';

export { useAuth } from './AuthContext';

interface AppProvidersProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string | null;
}

export function AppProviders({
  children,
  isAuthenticated = false,
  userEmail = null,
  userName = null,
  userRole = null,
}: AppProvidersProps) {
  const router = useRouter();
  const [isGateForcedOpen, setIsGateForcedOpen] = React.useState(false);
  const [forcedTab, setForcedTab] = React.useState<'login' | 'register'>('login');

  const openGate = React.useCallback((tab: 'login' | 'register' = 'login') => {
    setForcedTab(tab);
    setIsGateForcedOpen(true);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sa_spa_unlocked');
        localStorage.removeItem('mk_spa_unlocked');
        document.cookie = 'sa_spa_unlocked=; path=/; max-age=0';
        document.cookie = 'mk_spa_unlocked=; path=/; max-age=0';
        try {
          const res = await fetch('/api/auth/csrf');
          const data = (await res.json()) as { csrfToken?: string };
          await fetch('/api/auth/signout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              csrfToken: data.csrfToken || '',
              callbackUrl: '/',
            }),
          });
        } catch {
          // ignore network error
        }
      }
    } finally {
      router.push('/');
      router.refresh();
    }
  }, [router]);

  const contextValue = React.useMemo(
    () => ({
      isAuthenticated,
      userEmail,
      userName,
      userRole,
      logout,
      openGate,
    }),
    [isAuthenticated, userEmail, userName, userRole, logout, openGate],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <QualityTierProvider>
        <SmoothScrollProvider>
          <AuthPortalGate
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            userName={userName}
            userRole={userRole}
            isForcedOpen={isGateForcedOpen}
            defaultTab={forcedTab}
            onCloseGate={() => setIsGateForcedOpen(false)}
          >
            {children}
            {/* Lớp phủ đa giác quan MK SPA & Thanh âm 432Hz */}
            <SaSpaBotanicalOverlay />
            <SoundscapeToggle />
            {/* Giỏ hàng trượt thông minh & Hiệu ứng bay vào giỏ */}
            <CartDrawer />
            <FlyToCartOverlay />
          </AuthPortalGate>
        </SmoothScrollProvider>
      </QualityTierProvider>
    </AuthContext.Provider>
  );
}
