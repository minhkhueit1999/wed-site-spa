'use client';

import * as React from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useQualityTier } from './QualityTierContext';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { mode, tier } = useQualityTier();
  const lenisRef = React.useRef<Lenis | null>(null);

  React.useEffect(() => {
    // Nếu người dùng chọn Tĩnh / Tier 1 thì giữ cuộn tự nhiên của hệ thống
    if (mode === 'reduced' || tier === 1 || typeof window === 'undefined') {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Đồng bộ Lenis scroll với GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Hợp nhất nhịp render loop: GSAP ticker điều khiển Lenis raf
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [mode, tier]);

  return <>{children}</>;
}
