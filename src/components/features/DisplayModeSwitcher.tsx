'use client';

import * as React from 'react';
import { useQualityTier, MotionMode } from '@/infrastructure/motion/QualityTierContext';

export function DisplayModeSwitcher({ className = '' }: { className?: string }) {
  const { mode, setMode, tier, isWebGLSupported } = useQualityTier();
  const [isOpen, setIsOpen] = React.useState(false);

  const modes: { id: MotionMode; label: string; icon: string; desc: string }[] = [
    {
      id: 'immersive',
      label: 'Sống động 3D',
      icon: '✨',
      desc: 'Hiệu ứng WebGL, mặt nước khúc xạ, hạt chiều sâu & chuyển động điện ảnh',
    },
    {
      id: 'standard',
      label: 'Tiêu chuẩn',
      icon: '🌿',
      desc: 'Chuyển động nhẹ nhàng, hiệu ứng mượt mà tối ưu pin và phần cứng',
    },
    {
      id: 'reduced',
      label: 'Tĩnh',
      icon: '🍃',
      desc: 'Giảm chuyển động tối đa, nền tĩnh thanh lịch, tối ưu khả năng tiếp cận',
    },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Tùy chọn chế độ hiển thị và hiệu ứng chuyển động"
        className="flex items-center gap-1.5 rounded-full border border-[#E2D9CC] bg-[#FAF7F2]/90 px-3 py-1.5 text-xs font-medium text-[#405C4E] shadow-sm backdrop-blur-md transition-all hover:border-[#405C4E] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#405C4E] focus-visible:outline-none"
      >
        <span className="text-sm">
          {mode === 'immersive' ? '✨' : mode === 'standard' ? '🌿' : '🍃'}
        </span>
        <span className="hidden sm:inline">Hiệu ứng:</span>
        <span className="font-semibold">
          {mode === 'immersive' ? '3D Sống động' : mode === 'standard' ? 'Tiêu chuẩn' : 'Tĩnh'}
        </span>
        <span className="ml-0.5 text-[10px] text-[#8C827A]">
          {isWebGLSupported ? `T${tier}` : 'CSS'}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border border-[#E2D9CC] bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none"
          >
            <div className="border-b border-[#F0EAE1] px-3 py-2">
              <p className="text-xs font-semibold text-[#2B2622]">Chế độ trải nghiệm không gian</p>
              <p className="text-[11px] text-[#635B54]">
                Tự động thích ứng phần cứng & tôn trọng giảm chuyển động
              </p>
            </div>

            <div className="py-1">
              {modes.map((item) => {
                const isActive = mode === item.id;
                return (
                  <button
                    key={item.id}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setMode(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-colors ${
                      isActive ? 'bg-[#E5EDE8] text-[#2D4137]' : 'text-[#2B2622] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span className="mt-0.5 text-base">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{item.label}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-[#405C4E]">Đang chọn</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-tight text-[#635B54]">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {!isWebGLSupported && (
              <div className="mt-1 rounded-lg bg-[#FAF7F2] p-2 text-center text-[10px] text-[#8C827A]">
                Thiết bị không hỗ trợ WebGL. Chế độ tĩnh được áp dụng tự động.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
