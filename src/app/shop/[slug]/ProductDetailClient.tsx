'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { SaSpaProduct } from '@/data/saSpaProducts';
import { useCartStore } from '@/infrastructure/store/useCartStore';
import { formatCurrencyVND } from '@/lib/utils';
import { LivingProductCard } from '@/components/ecommerce/LivingProductCard';

interface ProductDetailClientProps {
  product: SaSpaProduct;
  relatedProducts: SaSpaProduct[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [selectedVolume, setSelectedVolume] = useState<string>(product.volumes[0]?.size || '30ml');
  const [quantity, setQuantity] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'ritual' | 'scent' | 'reviews'>('ritual');
  const [isAdded, setIsAdded] = useState(false);
  const [isBundleAdded, setIsBundleAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const isInWishlist = useCartStore((state) => state.isInWishlist(product.id));

  const currentPrice =
    product.volumes.find((v) => v.size === selectedVolume)?.price || product.price;

  const handleAddToCart = () => {
    addItem(product, selectedVolume, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setCartOpen(true);
    }, 600);
  };

  const handleAddBundle = () => {
    addItem(product, selectedVolume, 1);
    if (relatedProducts[0]) {
      addItem(relatedProducts[0], relatedProducts[0].volumes[0]?.size, 1);
    }
    setIsBundleAdded(true);
    setTimeout(() => {
      setIsBundleAdded(false);
      setCartOpen(true);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[#8C827A]">
        <Link href="/" className="hover:text-[#1F2B24]">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#1F2B24]">
          Cửa hàng MK SPA
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1F2B24]">{product.name}</span>
      </nav>

      {/* Khối Chi Tiết Sản Phẩm Chính */}
      <div
        className={`grid grid-cols-1 gap-8 rounded-3xl border p-6 shadow-lg transition-colors duration-500 md:grid-cols-2 md:p-10 lg:gap-12 ${
          isDarkMode
            ? 'border-[#D4AF37]/30 bg-[#1F2B24] text-[#FAF7F2]'
            : 'border-[#E2D9CC] bg-[#FAF7F2] text-[#2B2622]'
        }`}
      >
        {/* CỘT TRÁI: Multi-layer Living Render & Đổi Ánh Sáng Phòng Spa */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`relative flex h-80 w-full items-center justify-center overflow-hidden rounded-3xl border transition-colors duration-500 sm:h-96 ${
              isDarkMode
                ? 'border-[#D4AF37]/20 bg-[#141C17]'
                : 'border-[#E2D9CC] bg-gradient-to-b from-[#F4EFEA] to-[#EAE1D3]/60'
            }`}
          >
            {/* Quầng sáng nến / thảo mộc */}
            <div
              className="absolute inset-10 rounded-full opacity-60 blur-3xl filter"
              style={{ background: product.themeColor.glow }}
            />

            {/* Nút đổi sang Dark Ambience Mode */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="absolute top-4 right-4 z-20 rounded-full border border-[#D4AF37]/40 bg-black/30 px-3 py-1.5 text-xs text-[#D4AF37] backdrop-blur-md hover:bg-black/50"
            >
              {isDarkMode ? '☀️ Ánh Sáng Tự Nhiên' : '🌙 Không Gian Spa Ấm'}
            </button>

            {/* Visual Ảnh Thực Tế MK SPA */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-0.5, 0.5, -0.5],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/40 bg-white/70 p-3 shadow-2xl backdrop-blur-xs">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={240}
                  height={288}
                  className="h-64 w-52 rounded-2xl object-cover shadow-sm sm:h-72 sm:w-60"
                />
                <div className="absolute top-4 right-4 rounded-full bg-[#1F2B24]/85 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#D4AF37]">
                  MK SPA
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {product.botanicalElements.map((el) => (
                  <span
                    key={el}
                    className="rounded-full border border-[#D4AF37]/40 bg-[#FAF7F2]/10 px-2.5 py-1 text-xs text-[#D4AF37]"
                  >
                    ✦ {el}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* CỘT PHẢI: Thông tin, Dung tích, Nghi thức & Nút mua */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
                {product.categoryName} • {product.badge || 'MK SPA Selection'}
              </span>

              {/* Nút Yêu Thích */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`rounded-full border p-2 transition-all ${
                  isInWishlist
                    ? 'border-[#B85D38] bg-[#FDECEC] text-[#B85D38]'
                    : 'border-current/20 hover:border-[#D4AF37]'
                }`}
              >
                {isInWishlist ? '♥ Yêu Thích' : '♡ Thêm Vào Wishlist'}
              </button>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-light text-current sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-current/80 italic">{product.subtitle}</p>

            {/* Đánh giá sao */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <div className="flex text-[#D4AF37]">
                {'★★★★★'.slice(0, Math.round(product.rating))}
              </div>
              <span className="font-bold">{product.rating.toFixed(1)}/5.0</span>
              <span className="text-current/60">({product.reviewCount} đánh giá từ khách spa)</span>
            </div>

            {/* Mô tả chi tiết */}
            <p className="mt-4 text-xs leading-relaxed text-current/90 sm:text-sm">
              {product.description}
            </p>

            {/* Chọn dung tích */}
            <div className="mt-6">
              <span className="text-xs font-semibold tracking-wide text-current">
                Chọn Dung Tích / Quy Cách Đóng Gói:
              </span>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {product.volumes.map((vol) => (
                  <button
                    key={vol.size}
                    type="button"
                    onClick={() => setSelectedVolume(vol.size)}
                    className={`rounded-2xl border px-4 py-2 text-xs font-medium transition-all ${
                      selectedVolume === vol.size
                        ? 'border-[#D4AF37] bg-[#D4AF37]/20 font-bold text-[#D4AF37] ring-1 ring-[#D4AF37]'
                        : 'border-current/25 text-current/80 hover:border-[#D4AF37]/60'
                    }`}
                  >
                    <span>{vol.size}</span> — <span>{formatCurrencyVND(vol.price)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs: Nghi Thức Sử Dụng, Tầng Hương, Đánh Giá */}
            <div className="mt-8 border-t border-current/15 pt-5">
              <div className="flex gap-6 border-b border-current/15 pb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('ritual')}
                  className={`pb-1 font-semibold transition-colors ${
                    activeTab === 'ritual'
                      ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                      : 'text-current/60'
                  }`}
                >
                  Nghi Thức Dưỡng Tại Nhà
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('scent')}
                  className={`pb-1 font-semibold transition-colors ${
                    activeTab === 'scent'
                      ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                      : 'text-current/60'
                  }`}
                >
                  Tầng Hương Thảo Mộc
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-1 font-semibold transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                      : 'text-current/60'
                  }`}
                >
                  Phản Hồi Thực Tế ({product.reviewCount})
                </button>
              </div>

              <div className="mt-4 text-xs">
                {activeTab === 'ritual' && (
                  <div className="space-y-3">
                    {product.ritualSteps.map((step) => (
                      <div key={step.step} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-bold text-[#141C17]">
                          {step.step}
                        </span>
                        <div>
                          <strong className="font-semibold text-current">{step.title}</strong>
                          <p className="mt-0.5 text-current/80">{step.instruction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'scent' && (
                  <div className="space-y-2 rounded-2xl border border-current/15 p-4">
                    <p>
                      <strong className="text-[#D4AF37]">Hương đầu (Top Notes):</strong>{' '}
                      {product.scentNotes.top}
                    </p>
                    <p>
                      <strong className="text-[#8DAA72]">Hương giữa (Heart Notes):</strong>{' '}
                      {product.scentNotes.heart}
                    </p>
                    <p>
                      <strong className="text-[#C68B59]">Hương cuối (Base Notes):</strong>{' '}
                      {product.scentNotes.base}
                    </p>
                    <p className="mt-2 text-[11px] text-current/75 italic">
                      {product.scentNotes.description}
                    </p>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-current/15 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-current">Chị Lê Hoàng Yến</span>
                        <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-medium text-[#D4AF37]">
                          ✓ Đã mua tại MK SPA
                        </span>
                      </div>
                      <p className="mt-1 text-current/80">
                        &quot;Mùi hương tự nhiên không hề nồng gắt hóa chất, xoa ấm lên thái dương
                        hít thở là thấy nhẹ nhõm ngay sau giờ làm việc.&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phần Mua Hàng & Giá */}
          <div className="mt-8 border-t border-current/20 pt-6">
            <div className="mb-4 flex items-center justify-between">
              {/* Chọn số lượng */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-current/80">Số lượng:</span>
                <div className="flex items-center rounded-xl border border-current/30">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-xs hover:bg-black/10"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-xs hover:bg-black/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="text-right">
                <span className="font-serif text-2xl font-bold text-[#D4AF37]">
                  {formatCurrencyVND(currentPrice * quantity)}
                </span>
                <span className="block text-[10px] text-current/60">
                  Miễn phí giao hàng từ 500k
                </span>
              </div>
            </div>

            {/* Nút Thêm Vào Giỏ */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 rounded-2xl py-3.5 text-xs font-semibold transition-all ${
                  isAdded
                    ? 'bg-[#405C4E] text-[#FAF7F2]'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#C68B59] text-[#141C17] shadow-lg hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isAdded ? '✓ Đã Thêm Vào Giỏ MK SPA' : 'Thêm Vào Giỏ Hàng & Tiếp Tục →'}
              </button>

              {relatedProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddBundle}
                  className="rounded-2xl border border-[#D4AF37] bg-transparent px-5 py-3.5 text-xs font-semibold text-[#D4AF37] transition-all hover:bg-[#D4AF37]/15"
                >
                  {isBundleAdded ? '✓ Đã Thêm Cả Combo' : 'Mua Combo (+ 1 Sản phẩm kèm)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sản Phẩm Cùng Bộ Sưu Tập */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 text-center">
            <span className="text-xs tracking-widest text-[#D4AF37] uppercase">
              Trọn Vẹn Trải Nghiệm
            </span>
            <h3 className="mt-1 font-serif text-2xl font-light text-[#1F2B24]">
              Sản Phẩm Cùng Nhóm Thảo Mộc
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <LivingProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
