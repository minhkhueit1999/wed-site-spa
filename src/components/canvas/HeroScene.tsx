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

      {/* Tác phẩm Đóa Sen Nở Rộ & Tán Lá Thảo Mộc */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Hạt phấn sen vàng lơ lửng */}
        <div className="-mb-4 flex space-x-3">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#D4AF37]/60 blur-[0.5px]" />
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-[#FFF0F5]/80 blur-[0.5px] delay-150" />
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#D4AF37]/50 blur-[0.5px] delay-300" />
        </div>

        {/* Đóa sen hồng ngọc nở rộ trung tâm */}
        <div className="relative z-30 flex flex-col items-center justify-center">
          <span className="text-8xl drop-shadow-[0_12px_24px_rgba(230,92,123,0.35)] filter transition-transform hover:scale-110">
            🪷
          </span>
        </div>

        {/* Nhánh lá sả và thảo mộc xanh vươn ra 2 bên */}
        <div className="relative z-20 -mt-6 flex w-72 items-center justify-between px-4">
          <span className="rotate-[-25deg] text-4xl opacity-90 drop-shadow-md select-none">🌿</span>
          <span className="rotate-[25deg] text-4xl opacity-90 drop-shadow-md select-none">🍃</span>
        </div>

        {/* Tán lá sen ngọc bích lớn bên dưới */}
        <div className="relative z-10 -mt-5 h-12 w-64 rounded-[50%] border-t border-[#8DAA72]/40 bg-gradient-to-r from-[#244A37] via-[#3B6E55] to-[#1F3D2E] shadow-xl" />

        {/* Đĩa nước ngọc bích phản chiếu */}
        <div className="-mt-6 h-8 w-80 rounded-[50%] bg-gradient-to-r from-[#3D6756]/20 via-[#3D6756]/40 to-[#3D6756]/20 blur-sm" />
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
