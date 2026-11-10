'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SaSpaProduct } from '@/data/saSpaProducts';
import { useCartStore } from '@/infrastructure/store/useCartStore';
import { formatCurrencyVND } from '@/lib/utils';

interface ProductQuickViewModalProps {
  product: SaSpaProduct | null;
  onClose: () => void;
}

export function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const [selectedVolume, setSelectedVolume] = useState<string>(product?.volumes[0]?.size || '30ml');
  const [activeTab, setActiveTab] = useState<'ritual' | 'scent' | 'ingredients'>('ritual');
  const [isDarkMode, setIsDarkMode] = useState(false); // Chế độ xem không gian tối phòng ngủ/spa
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  if (!product) return null;

  const currentPrice =
    product.volumes.find((v) => v.size === selectedVolume)?.price || product.price;

  const handleAddToCart = () => {
    addItem(product, selectedVolume, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      setCartOpen(true);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
        {/* Backdrop mờ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#141C17]/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`relative z-10 my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border shadow-2xl transition-colors duration-500 ${
            isDarkMode
              ? 'border-[#D4AF37]/30 bg-[#1F2B24] text-[#FAF7F2]'
              : 'border-[#E2D9CC] bg-[#FAF7F2] text-[#2B2622]'
          }`}
        >
          {/* Nút đóng & nút đổi chế độ ánh sáng Dark Ambience */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full border border-[#D4AF37]/40 bg-black/20 p-2 text-xs text-[#D4AF37] backdrop-blur-xs hover:bg-black/40"
              title="Chuyển chế độ ánh sáng phòng spa / phòng ngủ"
            >
              {isDarkMode ? '☀️ Ánh Sáng Tự Nhiên' : '🌙 Không Gian Spa Ấm'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#D4AF37]/40 bg-black/20 p-2 text-xs text-[#FAF7F2] backdrop-blur-xs hover:bg-black/40"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Cột trái: Visual 3D & Chế độ phòng ngủ */}
            <div
              className={`relative flex min-h-[320px] items-center justify-center p-8 transition-colors duration-500 ${
                isDarkMode ? 'bg-[#141C17]' : 'bg-[#F4EFEA]'
              }`}
            >
              {/* Quầng sáng nến / tinh dầu */}
              <div
                className="absolute inset-8 rounded-full opacity-60 blur-3xl filter"
                style={{ background: product.themeColor.glow }}
              />

              <div className="relative z-10 text-center">
                <span className="text-6xl drop-shadow-md filter">
                  {product.category === 'tinh-dau'
                    ? '🏺'
                    : product.category === 'cham-soc-co-the'
                      ? '🌿'
                      : product.category === 'nen-thom'
                        ? '🕯️'
                        : '🫖'}
                </span>
                <p className="mt-4 font-serif text-xs tracking-wider italic opacity-75">
                  {isDarkMode
                    ? 'Không gian trị liệu tĩnh lặng ban đêm'
                    : 'Ánh nắng ban mai xuyên qua tán lá Sả Spa'}
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  {product.botanicalElements.map((el) => (
                    <span
                      key={el}
                      className="rounded-full border border-[#D4AF37]/30 px-2 py-0.5 text-[10px] text-[#D4AF37]"
                    >
                      ✦ {el}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột phải: Thông tin chi tiết, Dung tích, Nghi thức */}
            <div className="flex flex-col justify-between p-6 md:p-8">
              <div>
                <span className="text-xs tracking-widest text-[#D4AF37] uppercase">
                  {product.categoryName}
                </span>
                <h2 className="mt-1 font-serif text-2xl font-light text-current">{product.name}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-current/80">
                  {product.description}
                </p>

                {/* Chọn dung tích */}
                <div className="mt-4">
                  <span className="text-xs font-semibold text-current">Dung tích / Quy cách:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.volumes.map((v) => (
                      <button
                        key={v.size}
                        type="button"
                        onClick={() => setSelectedVolume(v.size)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedVolume === v.size
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                            : 'border-current/20 text-current/70 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {v.size} — {formatCurrencyVND(v.price)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabs: Nghi thức sử dụng & Tầng hương */}
                <div className="mt-5 border-t border-current/15 pt-4">
                  <div className="flex gap-4 border-b border-current/10 pb-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ritual')}
                      className={`font-medium transition-colors ${
                        activeTab === 'ritual'
                          ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                          : 'text-current/60'
                      }`}
                    >
                      Nghi Thức Sử Dụng (3 Bước)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('scent')}
                      className={`font-medium transition-colors ${
                        activeTab === 'scent'
                          ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                          : 'text-current/60'
                      }`}
                    >
                      Tầng Hương Thảo Mộc
                    </button>
                  </div>

                  <div className="mt-3 text-xs">
                    {activeTab === 'ritual' ? (
                      <div className="space-y-2">
                        {product.ritualSteps.map((step) => (
                          <div key={step.step} className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[10px] font-bold text-[#D4AF37]">
                              {step.step}
                            </span>
                            <div>
                              <strong className="text-current">{step.title}:</strong>{' '}
                              <span className="text-current/80">{step.instruction}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p>
                          <strong className="text-[#D4AF37]">Đầu:</strong> {product.scentNotes.top}
                        </p>
                        <p>
                          <strong className="text-[#8DAA72]">Giữa:</strong>{' '}
                          {product.scentNotes.heart}
                        </p>
                        <p>
                          <strong className="text-[#C68B59]">Cuối:</strong>{' '}
                          {product.scentNotes.base}
                        </p>
                        <p className="mt-1 text-[11px] text-current/70 italic">
                          {product.scentNotes.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gợi ý Mua Kèm Liệu Trình Spa (Cross-sell Bundle) */}
                {product.spaBundleName && (
                  <div className="mt-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-3 text-xs">
                    <span className="font-semibold text-[#D4AF37]">
                      🌿 Liệu trình đi kèm đề xuất:
                    </span>
                    <p className="mt-0.5 font-medium text-current/90">{product.spaBundleName}</p>
                    <span className="text-[11px] text-current/70">{product.spaBundleDiscount}</span>
                  </div>
                )}
              </div>

              {/* Phần Giá & Nút Thêm Vào Giỏ */}
              <div className="mt-6 border-t border-current/15 pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-current/70">Số lượng:</span>
                    <div className="flex items-center rounded-lg border border-current/20">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2.5 py-1 text-xs hover:bg-black/10"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-semibold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2.5 py-1 text-xs hover:bg-black/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-[#D4AF37]">
                      {formatCurrencyVND(currentPrice * quantity)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full rounded-2xl py-3.5 text-xs font-medium transition-all ${
                    isAdded
                      ? 'bg-[#405C4E] text-[#FAF7F2]'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#C68B59] text-[#141C17] shadow-lg hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {isAdded ? '✓ Đã Thêm Vào Giỏ Sả Spa' : 'Thêm Vào Giỏ Hàng & Tiếp Tục →'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
