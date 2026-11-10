'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui';
import { DisplayModeSwitcher } from '@/components/features/DisplayModeSwitcher';
import { useCartStore } from '@/infrastructure/store/useCartStore';

export function PublicHeader() {
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const items = useCartStore((state) => state.items);
  const flyAnimationCount = useCartStore((state) => state.flyAnimationCount);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2D9CC] bg-[#FAF7F2]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-[#1F2B24] sm:text-2xl"
        >
          <span className="text-xl">🌿</span>
          <span>MK SPA Botanical</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/shop"
            className="text-xs font-semibold text-[#1F2B24] transition-colors hover:text-[#D4AF37] sm:text-sm"
          >
            Cửa Hàng
          </Link>
          <Link
            href="/orders"
            className="hidden text-xs font-medium text-[#635B54] transition-colors hover:text-[#405C4E] sm:inline-block sm:text-sm"
          >
            Đơn Hàng
          </Link>
          <Link
            href="/trieu-chung"
            className="hidden text-xs font-medium text-[#635B54] transition-colors hover:text-[#405C4E] sm:text-sm md:inline-block"
          >
            Triệu Chứng
          </Link>

          {/* Nút Giỏ Hàng với Spring Bounce khi có sản phẩm bay vào */}
          <motion.button
            key={flyAnimationCount}
            initial={{ scale: 1 }}
            animate={flyAnimationCount > 0 ? { scale: [1, 1.25, 0.95, 1.05, 1] } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Mở giỏ hàng (${totalItems} sản phẩm)`}
            className="relative flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#1F2B24] shadow-xs hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <span>🧺</span>
            <span className="hidden sm:inline">Giỏ Hàng</span>
            {totalItems > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C68B59] px-1 text-[10px] font-bold text-[#141C17]">
                {totalItems}
              </span>
            )}
          </motion.button>

          <DisplayModeSwitcher />

          <Link href="/tu-van" className="hidden sm:inline-block">
            <Button size="sm" variant="primary">
              Trắc Nghiệm
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
