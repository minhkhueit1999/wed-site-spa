'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui';
import { DisplayModeSwitcher } from '@/components/features/DisplayModeSwitcher';
import { useCartStore } from '@/infrastructure/store/useCartStore';
import { useAuth } from './AuthContext';

export function PublicHeader() {
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const items = useCartStore((state) => state.items);
  const flyAnimationCount = useCartStore((state) => state.flyAnimationCount);
  const { isAuthenticated, userName, userRole, logout, openGate } = useAuth();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2D9CC] bg-[#FAF7F2]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo Thương Hiệu MK SPA */}
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-[#1F2B24] sm:text-2xl"
        >
          <span className="text-xl">🌿</span>
          <span>MK SPA Botanical</span>
        </Link>

        {/* Thanh Điều Hướng & Đăng Nhập / Đăng Xuất */}
        <nav className="flex items-center gap-2 sm:gap-3 lg:gap-4">
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

          {/* Nút Giỏ Hàng */}
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

          <Link href="/tu-van" className="hidden lg:inline-block">
            <Button size="sm" variant="secondary" className="text-xs">
              Trắc Nghiệm
            </Button>
          </Link>

          {/* KHỐI XÁC THỰC: ĐĂNG NHẬP / ĐĂNG KÝ / ĐĂNG XUẤT */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 border-l border-[#E2D9CC] pl-2 sm:gap-2.5 sm:pl-3">
              {/* Nút đi tới bảng điều khiển theo vai trò */}
              {userRole === 'ADMIN' ? (
                <Link
                  href="/quan-tri"
                  className="inline-flex items-center gap-1 rounded-full border border-[#B85D38]/50 bg-[#FDECEC] px-2.5 py-1 text-xs font-semibold text-[#B85D38] transition-colors hover:bg-[#B85D38] hover:text-white"
                >
                  <span>⚙️</span>
                  <span className="hidden sm:inline">Quản Trị</span>
                </Link>
              ) : userRole === 'THERAPIST' ? (
                <Link
                  href="/ky-thuat-vien"
                  className="inline-flex items-center gap-1 rounded-full border border-[#405C4E]/50 bg-[#E8EFE9] px-2.5 py-1 text-xs font-semibold text-[#405C4E] transition-colors hover:bg-[#405C4E] hover:text-white"
                >
                  <span>🩺</span>
                  <span className="hidden sm:inline">Bàn KTV</span>
                </Link>
              ) : (
                <Link
                  href="/tai-khoan"
                  className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/50 bg-[#FAF7F2] px-2.5 py-1 text-xs font-semibold text-[#755428] transition-colors hover:border-[#D4AF37]"
                >
                  <span>👤</span>
                  <span className="max-w-[80px] truncate sm:max-w-[120px]">
                    {userName || 'Tài Khoản'}
                  </span>
                </Link>
              )}

              {/* NÚT ĐĂNG XUẤT NỔI BẬT */}
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất khỏi tài khoản và khóa cổng"
                className="inline-flex items-center gap-1 rounded-full border border-[#B85D38]/40 bg-[#FAF7F2] px-2.5 py-1 text-xs font-medium text-[#B85D38] transition-all hover:bg-[#B85D38] hover:text-white"
              >
                <span>🚪</span>
                <span>Đăng Xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 border-l border-[#E2D9CC] pl-2 sm:gap-2 sm:pl-3">
              <button
                type="button"
                onClick={() => openGate('login')}
                className="rounded-full border border-[#D4AF37]/60 bg-transparent px-3 py-1 text-xs font-medium text-[#755428] transition-colors hover:bg-[#D4AF37]/15"
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => openGate('register')}
                className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C68B59] px-3 py-1 text-xs font-semibold text-[#141C17] shadow-xs transition-transform hover:scale-105"
              >
                Đăng Ký
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
