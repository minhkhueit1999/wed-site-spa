'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useQualityTier } from '@/infrastructure/motion/QualityTierContext';

const DynamicHeroScene = dynamic(() => import('./HeroSceneImpl').then((mod) => mod.HeroSceneImpl), {
  ssr: false,
  loading: () => <StaticHeroFallback />,
});

function StaticHeroFallback() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      {/* Vòng hào quang tĩnh */}
      <div className="absolute h-64 w-64 animate-pulse rounded-full border border-[#D99B4B]/30" />
      <div className="absolute h-80 w-80 rounded-full border border-[#405C4E]/20" />
      {/* Viên đá thiền định 2D hữu cơ mềm */}
      <div className="relative flex h-48 w-60 items-center justify-center rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-tr from-[#2D4137] via-[#405C4E] to-[#5B7B6A] shadow-2xl transition-transform hover:scale-105">
        <div className="h-16 w-16 rounded-full bg-white/10 blur-xl" />
      </div>
    </div>
  );
}

export function HeroScene({ className = '' }: { className?: string }) {
  const { tier, mode, isWebGLSupported, isContextLost } = useQualityTier();
  const isStatic = tier === 1 || mode === 'reduced' || !isWebGLSupported || isContextLost;

  return (
    <div
      aria-hidden="true"
      className={`relative h-[320px] w-full sm:h-[400px] lg:h-[480px] ${className}`}
    >
      {isStatic ? <StaticHeroFallback /> : <DynamicHeroScene tier={tier} />}
    </div>
  );
}
