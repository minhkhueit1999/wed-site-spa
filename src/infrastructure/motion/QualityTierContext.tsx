'use client';

import * as React from 'react';
import { getPrefersReducedMotion } from '@/lib/motion';

export type QualityTier = 1 | 2 | 3;
export type MotionMode = 'immersive' | 'standard' | 'reduced';

export interface QualityTierContextValue {
  tier: QualityTier;
  mode: MotionMode;
  setMode: (mode: MotionMode) => void;
  isWebGLSupported: boolean;
  isContextLost: boolean;
  fps: number;
  reportFpsDrop: () => void;
}

const QualityTierContext = React.createContext<QualityTierContextValue>({
  tier: 3,
  mode: 'immersive',
  setMode: () => {},
  isWebGLSupported: true,
  isContextLost: false,
  fps: 60,
  reportFpsDrop: () => {},
});

const STORAGE_KEY = 'spa_motion_mode';

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

function detectDefaultTier(mode: MotionMode, isWebGL: boolean): QualityTier {
  if (!isWebGL || mode === 'reduced') return 1;
  if (typeof window === 'undefined') return 2;

  // Nếu là thiết bị di động màn hình nhỏ hoặc ít CPU core
  const isMobile =
    window.innerWidth < 768 ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  if (mode === 'standard') return 2;
  return isMobile ? 2 : 3;
}

export function QualityTierProvider({ children }: { children: React.ReactNode }) {
  const [isWebGLSupported] = React.useState<boolean>(() => {
    return checkWebGLSupport();
  });

  const [mode, setModeState] = React.useState<MotionMode>(() => {
    if (typeof window === 'undefined') return 'immersive';
    try {
      const saved = window.localStorage?.getItem(STORAGE_KEY) as MotionMode | null;
      if (saved && ['immersive', 'standard', 'reduced'].includes(saved)) return saved;
    } catch {
      // ignore
    }
    const hasWebGL = checkWebGLSupport();
    const prefersReduced = getPrefersReducedMotion();
    if (prefersReduced || !hasWebGL) return 'reduced';
    return 'immersive';
  });

  const [tier, setTier] = React.useState<QualityTier>(() => {
    const hasWebGL = checkWebGLSupport();
    return detectDefaultTier(
      typeof window !== 'undefined' && (getPrefersReducedMotion() || !hasWebGL)
        ? 'reduced'
        : 'immersive',
      hasWebGL,
    );
  });

  const [isContextLost, setIsContextLost] = React.useState(false);
  const [fps, setFps] = React.useState(60);

  // 1. Lắng nghe thay đổi prefers-reduced-motion từ hệ điều hành
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const hasWebGL = checkWebGLSupport();
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (!window.localStorage?.getItem(STORAGE_KEY)) {
        const nextMode = e.matches ? 'reduced' : 'immersive';
        setModeState(nextMode);
        setTier(detectDefaultTier(nextMode, hasWebGL));
      }
    };

    mql.addEventListener('change', handleMotionChange);
    return () => mql.removeEventListener('change', handleMotionChange);
  }, []);

  // 2. Chuyển chế độ người dùng
  const setMode = React.useCallback(
    (newMode: MotionMode) => {
      setModeState(newMode);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, newMode);
        }
      } catch {
        // bỏ qua nếu private mode
      }
      setTier(detectDefaultTier(newMode, isWebGLSupported));
    },
    [isWebGLSupported],
  );

  // 3. Runtime FPS Guard: Tự hạ cấp khi thiết bị giật khung hình
  const reportFpsDrop = React.useCallback(() => {
    setTier((prevTier) => {
      if (prevTier === 3) return 2;
      if (prevTier === 2) return 1;
      return 1;
    });
  }, []);

  // 4. Lắng nghe mất ngữ cảnh WebGL
  React.useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setIsContextLost(true);
      setTier(1);
    };

    const handleContextRestored = () => {
      setIsContextLost(false);
      setTier(detectDefaultTier(mode, isWebGLSupported));
    };

    window.addEventListener('webglcontextlost', handleContextLost, false);
    window.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      window.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [mode, isWebGLSupported]);

  // 5. FPS Monitor nhẹ nhàng trong 120 khung hình đầu tiên
  React.useEffect(() => {
    if (tier === 1) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = (now: number) => {
      frameCount++;
      const delta = now - lastTime;

      if (delta >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / delta);
        setFps(currentFps);

        // Nếu FPS < 30 trong 2 giây liên tiếp -> hạ cấp tự động để bảo toàn trải nghiệm mượt mà
        if (currentFps < 30) {
          reportFpsDrop();
        }

        frameCount = 0;
        lastTime = now;
      }

      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, [tier, reportFpsDrop]);

  return (
    <QualityTierContext.Provider
      value={{
        tier,
        mode,
        setMode,
        isWebGLSupported,
        isContextLost,
        fps,
        reportFpsDrop,
      }}
    >
      {children}
    </QualityTierContext.Provider>
  );
}

export function useQualityTier(): QualityTierContextValue {
  return React.useContext(QualityTierContext);
}
