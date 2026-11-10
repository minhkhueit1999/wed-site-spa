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
import { AuthContext, UserSession } from './AuthContext';

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

  const [clientSession, setClientSession] = React.useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('mk_spa_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email) {
            return {
              email: parsed.email,
              name: parsed.name ?? null,
              role: parsed.role ?? 'CUSTOMER',
            };
          }
        }
      } catch {
        // ignore storage parse error
      }
    }
    return null;
  });

  const [isLoggedOut, setIsLoggedOut] = React.useState(false);

  // Sync state if server props switch to authenticated
  const [prevServerAuth, setPrevServerAuth] = React.useState(isAuthenticated);
  if (isAuthenticated !== prevServerAuth) {
    setPrevServerAuth(isAuthenticated);
    if (isAuthenticated) {
      setIsLoggedOut(false);
    }
  }

  const effectiveAuth = React.useMemo(() => {
    if (isLoggedOut) {
      return {
        isAuthenticated: false,
        userEmail: null,
        userName: null,
        userRole: null,
      };
    }
    if (clientSession) {
      const computedName =
        clientSession.name ?? (clientSession.email ? clientSession.email.split('@')[0] : null);
      return {
        isAuthenticated: true,
        userEmail: clientSession.email,
        userName: computedName || null,
        userRole: clientSession.role || 'CUSTOMER',
      };
    }
    return {
      isAuthenticated,
      userEmail,
      userName,
      userRole,
    };
  }, [isLoggedOut, clientSession, isAuthenticated, userEmail, userName, userRole]);

  const setSession = React.useCallback((session: UserSession | null) => {
    if (session) {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('mk_spa_unlocked', 'true');
          window.localStorage.setItem('sa_spa_unlocked', 'true');
          window.localStorage.setItem('mk_spa_user', JSON.stringify(session));
          document.cookie = 'mk_spa_unlocked=true; path=/; max-age=2592000; SameSite=Lax';
          document.cookie = 'sa_spa_unlocked=true; path=/; max-age=2592000; SameSite=Lax';
        } catch {
          // ignore storage errors
        }
      }
      setIsLoggedOut(false);
      setClientSession(session);
    } else {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem('mk_spa_unlocked');
          window.localStorage.removeItem('sa_spa_unlocked');
          window.localStorage.removeItem('mk_spa_user');
          document.cookie = 'mk_spa_unlocked=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'sa_spa_unlocked=; path=/; max-age=0; SameSite=Lax';
        } catch {
          // ignore
        }
      }
      setIsLoggedOut(true);
      setClientSession(null);
    }
  }, []);

  const syncSession = React.useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = (await res.json()) as {
          user?: { email?: string; name?: string; role?: string };
        };
        if (data?.user?.email) {
          setSession({
            email: data.user.email,
            name: data.user.name || null,
            role: data.user.role || 'CUSTOMER',
          });
          return;
        }
      }
    } catch {
      // ignore network errors
    }
  }, [setSession]);

  const openGate = React.useCallback((tab: 'login' | 'register' = 'login') => {
    setForcedTab(tab);
    setIsGateForcedOpen(true);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      setSession(null);
      if (typeof window !== 'undefined') {
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
  }, [router, setSession]);

  const contextValue = React.useMemo(
    () => ({
      isAuthenticated: effectiveAuth.isAuthenticated,
      userEmail: effectiveAuth.userEmail,
      userName: effectiveAuth.userName,
      userRole: effectiveAuth.userRole,
      logout,
      openGate,
      setSession,
      syncSession,
    }),
    [effectiveAuth, logout, openGate, setSession, syncSession],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <QualityTierProvider>
        <SmoothScrollProvider>
          <AuthPortalGate
            isAuthenticated={effectiveAuth.isAuthenticated}
            userEmail={effectiveAuth.userEmail}
            userName={effectiveAuth.userName}
            userRole={effectiveAuth.userRole}
            isForcedOpen={isGateForcedOpen}
            defaultTab={forcedTab}
            onCloseGate={() => setIsGateForcedOpen(false)}
            onSetSession={setSession}
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
