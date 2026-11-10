'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { SaSpaProduct } from '@/data/saSpaProducts';
import { useCartStore } from '@/infrastructure/store/useCartStore';
import { formatCurrencyVND } from '@/lib/utils';
import { useQualityTier } from '@/infrastructure/motion/QualityTierContext';

interface LivingProductCardProps {
  product: SaSpaProduct;
  onQuickView?: (product: SaSpaProduct) => void;
}

export function LivingProductCard({ product, onQuickView }: LivingProductCardProps) {
  const { tier, mode } = useQualityTier();
  const isReducedMotion = mode === 'reduced';
  const cardRef = useRef<HTMLDivElement | null>(null);

  // States
  const [isHovered, setIsHovered] = useState(false);
  const [showScentOrbit, setShowScentOrbit] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState(product.volumes[0]?.size || '30ml');
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Zustand
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const isInWishlist = useCartStore((state) => state.isInWishlist(product.id));

  // 3D Parallax Tilt calculations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tier === 1 || isReducedMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowScentOrbit(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const currentPrice =
    product.volumes.find((v) => v.size === selectedVolume)?.price || product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product, selectedVolume, 1);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1200);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1200,
        rotateX: tier === 1 || isReducedMotion ? 0 : rotateX,
        rotateY: tier === 1 || isReducedMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative flex flex-col rounded-3xl border border-[#E2D9CC]/80 bg-[#FAF7F2] p-5 shadow-sm transition-shadow duration-500 hover:border-[#D4AF37]/50 hover:shadow-xl"
    >
      {/* 1. Huy hiệu Badge & Nút Wishlist */}
      <div className="z-20 flex items-center justify-between">
        {product.badge ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/40 bg-[#FAF7F2]/90 px-3 py-1 text-[11px] font-medium tracking-wide text-[#755428] shadow-xs backdrop-blur-xs">
            <span>✦</span> {product.badge}
          </span>
        ) : (
          <span className="text-[11px] font-medium tracking-wider text-[#635B54] uppercase">
            {product.categoryName}
          </span>
        )}

        {/* Nút Wishlist Thả tim bung cánh hoa */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isInWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
            isInWishlist
              ? 'scale-110 border-[#B85D38] bg-[#FDECEC] text-[#B85D38] shadow-sm'
              : 'border-[#E2D9CC] bg-[#FAF7F2]/80 text-[#8C827A] hover:border-[#B85D38]/50 hover:text-[#B85D38]'
          }`}
        >
          <span className="text-sm">{isInWishlist ? '♥' : '♡'}</span>
          {isInWishlist && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B85D38] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#B85D38]" />
            </span>
          )}
        </button>
      </div>

      {/* 2. KHU VỰC MULTI-LAYER LIVING VISUAL (Không gian 3D của sản phẩm) */}
      <div className="relative mt-3 flex h-64 w-full items-center justify-center overflow-visible rounded-2xl bg-gradient-to-b from-[#FAF7F2] via-[#F4EFEA] to-[#EAE1D3]/50">
        {/* Nền quầng sáng ấm (Botanical Aura) */}
        <div
          className="absolute inset-4 rounded-full opacity-60 blur-2xl filter transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: product.themeColor.glow }}
        />

        {/* Bóng đổ động dưới đáy (thu nhỏ/nở rộng khi sản phẩm thở nâng hạ) */}
        <motion.div
          animate={
            isReducedMotion
              ? {}
              : {
                  scale: [1, 0.85, 1],
                  opacity: [0.35, 0.2, 0.35],
                }
          }
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 h-4 w-28 rounded-full bg-[#1F2B24]/20 blur-sm filter"
        />

        {/* Thảo mộc bay xung quanh (Tách lớp Z-depth khi hover) */}
        <motion.div
          animate={
            isReducedMotion
              ? {}
              : {
                  y: [-4, 4, -4],
                  rotate: [-3, 3, -3],
                }
          }
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            transform: isHovered && tier !== 1 ? 'translateZ(25px) scale(1.15)' : 'translateZ(0px)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-3"
        >
          {/* Nhánh thảo mộc trái */}
          <span className="text-xl opacity-80 drop-shadow-sm filter transition-opacity select-none group-hover:opacity-100">
            {product.category === 'tinh-dau'
              ? '🌿'
              : product.category === 'cham-soc-co-the'
                ? '🌾'
                : product.category === 'nen-thom'
                  ? '✨'
                  : '🪷'}
          </span>
          {/* Nhánh thảo mộc phải */}
          <span className="text-xl opacity-80 drop-shadow-sm filter transition-opacity select-none group-hover:opacity-100">
            {product.category === 'tinh-dau'
              ? '🍋'
              : product.category === 'cham-soc-co-the'
                ? '🥥'
                : product.category === 'nen-thom'
                  ? '🕯️'
                  : '🫖'}
          </span>
        </motion.div>

        {/* THÂN VẬT THỂ SẢN PHẨM CHÍNH (3D Levitation + translateZ(45px) + Liquid Specular Sheen) */}
        <motion.div
          animate={
            isReducedMotion
              ? {}
              : {
                  y: isHovered ? -10 : [-6, 6, -6],
                  rotate: isHovered ? 0 : [-1, 1, -1],
                }
          }
          transition={{
            duration: isHovered ? 0.4 : 4,
            repeat: isHovered ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          style={{
            transform: isHovered && tier !== 1 ? 'translateZ(45px)' : 'translateZ(0px)',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative z-10 flex cursor-pointer flex-col items-center justify-center"
          onClick={() => onQuickView && onQuickView(product)}
        >
          {/* Chai / Hũ / Hộp thảo mộc minh họa cao cấp */}
          <div className="relative flex items-center justify-center">
            {/* SVG Chai Thủy Tinh Đông Dương / Hũ Gốm Mộc / Nến Thơm */}
            <svg
              width="110"
              height="150"
              viewBox="0 0 110 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg filter"
            >
              <defs>
                {/* Gradient thân chai theo màu sắc sản phẩm */}
                <linearGradient id={`bottle-${product.id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={product.themeColor.primary} />
                  <stop offset="60%" stopColor={product.themeColor.secondary} />
                  <stop offset="100%" stopColor={product.themeColor.accent} />
                </linearGradient>
                {/* Lớp bóng kính thủy tinh */}
                <linearGradient id={`sheen-${product.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="30%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="70%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* Nắp chai gỗ sồi / đồng vàng */}
              <rect
                x="40"
                y="10"
                width="30"
                height="18"
                rx="4"
                fill="#C68B59"
                stroke="#D4AF37"
                strokeWidth="1.5"
              />
              <rect x="48" y="2" width="14" height="8" rx="2" fill="#FAF7F2" opacity="0.8" />

              {/* Thân chai / Hũ */}
              <rect
                x="20"
                y="28"
                width="70"
                height="110"
                rx="14"
                fill={`url(#bottle-${product.id})`}
                stroke="#D4AF37"
                strokeWidth="1.5"
              />

              {/* Nhãn nhung Sả Spa ép kim */}
              <rect
                x="28"
                y="48"
                width="54"
                height="70"
                rx="6"
                fill="#FAF7F2"
                stroke="#D4AF37"
                strokeWidth="0.8"
              />
              <text
                x="55"
                y="66"
                textAnchor="middle"
                fill="#1F2B24"
                fontSize="9"
                fontWeight="bold"
                letterSpacing="1"
              >
                SẢ SPA
              </text>
              <line
                x1="35"
                y1="72"
                x2="75"
                y2="72"
                stroke="#D4AF37"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
              <text x="55" y="86" textAnchor="middle" fill="#6B4226" fontSize="7" fontWeight="500">
                {product.categoryName.toUpperCase()}
              </text>
              <text x="55" y="102" textAnchor="middle" fill="#D4AF37" fontSize="11">
                ✦
              </text>

              {/* Liquid Specular Sheen (Vệt sáng vàng nắng quét qua bề mặt chai) */}
              <motion.rect
                animate={
                  isHovered && !isReducedMotion
                    ? {
                        x: [-70, 110],
                        opacity: [0, 0.7, 0],
                      }
                    : { x: -70, opacity: 0 }
                }
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
                x="-70"
                y="28"
                width="40"
                height="110"
                fill={`url(#sheen-${product.id})`}
                transform="skewX(-20)"
                clipPath="url(#bottle-clip)"
              />
            </svg>
          </div>
        </motion.div>

        {/* 4. VÒNG TRÒN NỐT HƯƠNG BUNG NỞ (Interactive Scent Notes Orbit) */}
        <AnimatePresence>
          {showScentOrbit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-[#1F2B24]/90 p-4 text-center text-[#FAF7F2] backdrop-blur-md"
            >
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest text-[#D4AF37] uppercase">
                  Tầng Hương Sả Spa
                </span>
                <div className="space-y-1.5 text-left text-xs">
                  <div className="rounded-lg bg-[#FAF7F2]/10 p-1.5">
                    <span className="font-semibold text-[#D4AF37]">Hương đầu:</span>{' '}
                    <span className="text-[11px] text-[#FAF7F2]/90">{product.scentNotes.top}</span>
                  </div>
                  <div className="rounded-lg bg-[#FAF7F2]/10 p-1.5">
                    <span className="font-semibold text-[#8DAA72]">Hương giữa:</span>{' '}
                    <span className="text-[11px] text-[#FAF7F2]/90">
                      {product.scentNotes.heart}
                    </span>
                  </div>
                  <div className="rounded-lg bg-[#FAF7F2]/10 p-1.5">
                    <span className="font-semibold text-[#C68B59]">Hương cuối:</span>{' '}
                    <span className="text-[11px] text-[#FAF7F2]/90">{product.scentNotes.base}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScentOrbit(false)}
                  className="mt-2 text-[11px] text-[#D4AF37] underline hover:text-[#FAF7F2]"
                >
                  Đóng nốt hương ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nút bấm nhanh "Cảm nhận mùi hương" & "Xem nhanh" */}
        <div className="absolute right-2 bottom-2 left-2 z-20 flex justify-between gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowScentOrbit(!showScentOrbit);
            }}
            className="flex-1 rounded-full border border-[#D4AF37]/50 bg-[#FAF7F2]/90 py-1 text-[11px] font-medium text-[#4A3B32] shadow-xs backdrop-blur-xs hover:bg-[#FAF7F2] hover:text-[#1F2B24]"
          >
            🌸 Nốt hương
          </button>
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 rounded-full border border-[#D4AF37]/50 bg-[#1F2B24]/90 py-1 text-[11px] font-medium text-[#FAF7F2] shadow-xs backdrop-blur-xs hover:bg-[#1F2B24]"
            >
              👁 Xem nhanh
            </button>
          )}
        </div>
      </div>

      {/* 3. THÔNG TIN SẢN PHẨM & DUNG TÍCH */}
      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          {/* Đánh giá sao & Nhu cầu */}
          <div className="flex items-center gap-1.5 text-xs text-[#755428]">
            <span className="text-[#D4AF37]">★</span>
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-[#8C827A]">({product.reviewCount})</span>
            <span className="text-[#E2D9CC]">•</span>
            <span className="truncate text-[11px] text-[#635B54]">{product.scentFamilyLabel}</span>
          </div>

          {/* Tên sản phẩm */}
          <Link href={`/shop/${product.slug}`} className="group-hover:text-[#405C4E]">
            <h3 className="mt-1 line-clamp-1 font-serif text-base font-semibold text-[#2B2622] transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#635B54]">
            {product.subtitle}
          </p>

          {/* Chọn dung tích */}
          {product.volumes.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.volumes.map((vol) => (
                <button
                  key={vol.size}
                  type="button"
                  onClick={() => setSelectedVolume(vol.size)}
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition-all ${
                    selectedVolume === vol.size
                      ? 'border border-[#D4AF37] bg-[#D4AF37]/15 text-[#1F2B24]'
                      : 'border border-[#E2D9CC] text-[#635B54] hover:border-[#D4AF37]/40'
                  }`}
                >
                  {vol.size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. GIÁ TIỀN & NÚT THÊM VÀO GIỎ (Vật lý Parabolic Fly-to-Cart) */}
        <div className="mt-4 flex items-center justify-between border-t border-[#E2D9CC]/60 pt-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-[#405C4E]">
                {formatCurrencyVND(currentPrice)}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] text-[#8C827A] line-through">
                  {formatCurrencyVND(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="block text-[10px] text-[#8C827A]">Đã gồm thuế & toa dưỡng</span>
          </div>

          {/* Nút Thêm vào giỏ hàng */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
              isAddedFeedback
                ? 'scale-105 bg-[#405C4E] text-[#FAF7F2]'
                : 'bg-gradient-to-r from-[#D4AF37] to-[#C68B59] text-[#141C17] shadow-sm hover:scale-[1.03] active:scale-[0.97]'
            }`}
          >
            <span>{isAddedFeedback ? '✓ Đã Thêm' : 'Thêm Vào Giỏ'}</span>
            {!isAddedFeedback && <span className="text-sm">→</span>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
