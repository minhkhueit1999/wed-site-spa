'use client';

import React from 'react';
import { spaSoundscape } from '@/lib/spaSoundscape';
import { useCartStore } from '@/infrastructure/store/useCartStore';

export function SoundscapeToggle() {
  const isPlaying = useCartStore((state) => state.isSoundPlaying);
  const setSoundPlaying = useCartStore((state) => state.setSoundPlaying);

  const handleToggle = () => {
    const active = spaSoundscape.toggle();
    setSoundPlaying(active);
  };

  return (
    <div className="fixed right-6 bottom-6 z-40">
      <button
        onClick={handleToggle}
        type="button"
        aria-label={
          isPlaying
            ? 'Tắt âm thanh không gian MK SPA 432Hz'
            : 'Bật âm thanh chuông xoay và tiếng suối 432Hz'
        }
        className={`group flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium shadow-lg backdrop-blur-md transition-all duration-300 ${
          isPlaying
            ? 'border border-[#D4AF37]/50 bg-[#2A3B31]/90 text-[#D4AF37] ring-2 shadow-[#1F2B24]/40 ring-[#D4AF37]/30'
            : 'border border-[#E2D9CC] bg-[#FAF7F2]/85 text-[#4A3B32] hover:border-[#D4AF37]/50 hover:bg-[#FAF7F2] hover:text-[#2A3B31]'
        }`}
      >
        {/* Animated wave bars */}
        <div className="flex h-3.5 items-end gap-0.5">
          <span
            className={`w-0.5 rounded-full bg-current transition-all ${
              isPlaying ? 'h-3 animate-[bounce_1s_infinite_100ms]' : 'h-1.5'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-current transition-all ${
              isPlaying ? 'h-3.5 animate-[bounce_1s_infinite_300ms]' : 'h-2'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-current transition-all ${
              isPlaying ? 'h-2.5 animate-[bounce_1s_infinite_200ms]' : 'h-1.5'
            }`}
          />
        </div>

        <span className="tracking-wide">
          {isPlaying ? 'Thanh âm 432Hz (Đang phát)' : 'Thanh âm Spa (432Hz)'}
        </span>
      </button>
    </div>
  );
}
