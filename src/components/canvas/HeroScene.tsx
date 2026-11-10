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
      {/* Gợn sóng nước hồ thiền định */}
      <div className="absolute h-72 w-72 animate-ping rounded-full border border-[#7DA48D]/20 duration-1000" />
      <div className="absolute h-96 w-96 rounded-full border border-[#D99B4B]/20" />

      {/* Tác phẩm Tháp Đá Nóng Zen & Hoa Sen Spa */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Làn sương tinh dầu thảo mộc */}
        <div className="-mb-2 flex space-x-2">
          <span className="inline-block h-6 w-1 animate-pulse rounded-full bg-gradient-to-t from-[#D99B4B]/40 to-transparent blur-[1px]" />
          <span className="inline-block h-8 w-1 animate-pulse rounded-full bg-gradient-to-t from-white/40 to-transparent blur-[1px] delay-150" />
          <span className="inline-block h-5 w-1 animate-pulse rounded-full bg-gradient-to-t from-[#D99B4B]/30 to-transparent blur-[1px] delay-300" />
        </div>

        {/* Viên đá đỉnh tròn nhỏ */}
        <div className="relative z-30 h-10 w-24 rounded-[50%] border-t border-white/10 bg-gradient-to-r from-[#2A312B] via-[#3D4740] to-[#252B26] shadow-md" />

        {/* Viên đá thân vừa nghiêng nhẹ */}
        <div className="relative z-20 -mt-2 h-14 w-36 -rotate-2 rounded-[50%] border-t border-white/10 bg-gradient-to-r from-[#222824] via-[#2E3530] to-[#1C201D] shadow-lg" />

        {/* Viên đá đáy lớn bazan than chì */}
        <div className="relative z-10 -mt-3 h-16 w-52 rounded-[50%] border-t border-white/10 bg-gradient-to-r from-[#181C19] via-[#222623] to-[#151816] shadow-xl" />

        {/* Đóa sen thanh tịnh bên cạnh */}
        <div className="absolute -right-10 bottom-2 z-40 flex items-center justify-center">
          <span className="text-3xl drop-shadow-[0_4px_8px_rgba(223,138,154,0.3)] filter">🪷</span>
        </div>

        {/* Đĩa nước ngọc bích */}
        <div className="-mt-4 h-8 w-64 rounded-[50%] bg-gradient-to-r from-[#3D6756]/20 via-[#3D6756]/40 to-[#3D6756]/20 blur-sm" />
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
