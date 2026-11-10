'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useQualityTier } from '@/infrastructure/motion/QualityTierContext';
import type { AmbientVariant } from './AmbientCanvasImpl';

// Dynamic import WebGL canvas với ssr: false để không chặn FCP/LCP
const DynamicAmbientCanvas = dynamic(
  () => import('./AmbientCanvasImpl').then((mod) => mod.AmbientCanvasImpl),
  {
    ssr: false,
    loading: () => <StaticSpaBackdrop variant="calm" />,
  },
);

interface AmbientBackgroundProps {
  variant?: AmbientVariant;
  className?: string;
  showScrim?: boolean;
}

/**
 * Lớp nền tĩnh CSS/SVG cao cấp (Fallback cho Tier 1 & prefers-reduced-motion)
 */
function StaticSpaBackdrop({ variant = 'fluid-aurora' }: { variant?: AmbientVariant }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Lớp gradient mesh đa tầng mô phỏng ánh sáng spa hữu cơ */}
      <div
        className={`absolute -top-[25%] -left-[15%] h-[70vw] w-[70vw] rounded-full blur-[100px] transition-opacity duration-1000 ${
          variant === 'zen-water'
            ? 'bg-[#E5EDE8]/60'
            : variant === 'calm'
              ? 'bg-[#EAE1D3]/50'
              : 'bg-[#5B7B6A]/20'
        }`}
      />
      <div
        className={`absolute top-[20%] -right-[15%] h-[60vw] w-[60vw] rounded-full blur-[120px] transition-opacity duration-1000 ${
          variant === 'zen-water' ? 'bg-[#FAF7F2]/80' : 'bg-[#B8714F]/15'
        }`}
      />
      <div className="absolute -bottom-[20%] left-[20%] h-[55vw] w-[55vw] rounded-full bg-[#FAF7F2]/90 blur-[90px]" />
    </div>
  );
}

const emptySubscribe = () => () => {};
function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function AmbientBackground({
  variant = 'fluid-aurora',
  className = '',
  showScrim = true,
}: AmbientBackgroundProps) {
  const { tier, mode, isWebGLSupported, isContextLost } = useQualityTier();
  const isMounted = useIsMounted();

  const isStaticMode =
    !isMounted || tier === 1 || mode === 'reduced' || !isWebGLSupported || isContextLost;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none ${className}`}
    >
      {isStaticMode ? (
        <StaticSpaBackdrop variant={variant} />
      ) : (
        <>
          <DynamicAmbientCanvas variant={variant} tier={tier} />
          {/* Lớp scrim mềm mại đảm bảo tương phản chữ đạt chuẩn WCAG AA */}
          {showScrim && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/40 via-transparent to-[#FAF7F2]/70" />
          )}
        </>
      )}
    </div>
  );
}
