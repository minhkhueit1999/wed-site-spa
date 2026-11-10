'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/infrastructure/store/useCartStore';
import { formatCurrencyVND } from '@/lib/utils';

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isCartOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const discountCode = useCartStore((state) => state.discountCode);
  const discountPercent = useCartStore((state) => state.discountPercent);
  const applyDiscount = useCartStore((state) => state.applyDiscount);
  const removeDiscount = useCartStore((state) => state.removeDiscount);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  const [inputCode, setInputCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const totals = getCartTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyDiscount(inputCode);
    setCouponFeedback(res);
  };

  // Tính phần trăm thanh tiến trình Free Shipping & Quà tặng
  const progressPercent = Math.min(100, Math.round((totals.total / totals.giftThreshold) * 100));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCartOpen(false)}
          className="fixed inset-0 bg-[#141C17]/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="flex w-screen max-w-md flex-col justify-between border-l border-[#D4AF37]/30 bg-[#FAF7F2] text-[#2B2622] shadow-2xl"
          >
            {/* Header Giỏ Hàng */}
            <div className="border-b border-[#E2D9CC] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧺</span>
                  <h2 className="font-serif text-lg font-semibold text-[#1F2B24]">
                    Túi Sản Phẩm Sả Spa
                  </h2>
                  <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-xs font-bold text-[#755428]">
                    {totals.totalItems}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="rounded-full p-2 text-[#635B54] hover:bg-[#EAE1D3] hover:text-[#1F2B24]"
                >
                  ✕
                </button>
              </div>

              {/* Thanh Tiến Trình Quà Tặng & Free Shipping Dạng Chất Lỏng */}
              <div className="mt-4 rounded-2xl border border-[#D4AF37]/30 bg-[#F4EFEA] p-3 text-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#755428]">
                  <span>
                    {totals.hasGift
                      ? '🎉 Chúc mừng! Bạn nhận Miễn Phí Vận Chuyển & Túi Thơm Sả Chanh'
                      : totals.hasFreeShipping
                        ? `🎁 Thêm ${formatCurrencyVND(totals.missingForGift)} để nhận Túi Thơm Sả Chanh`
                        : `🚚 Thêm ${formatCurrencyVND(totals.missingForFreeShipping)} để được Miễn Phí Vận Chuyển`}
                  </span>
                  <span className="font-bold">{progressPercent}%</span>
                </div>

                {/* Progress bar dạng dòng chảy */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E2D9CC]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#8DAA72] to-[#405C4E]"
                  />
                </div>
              </div>
            </div>

            {/* Danh Sách Mục Sản Phẩm */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="text-5xl">🌿</span>
                  <p className="mt-3 font-serif text-base text-[#1F2B24]">Giỏ hàng đang trống</p>
                  <p className="mt-1 text-xs text-[#8C827A]">
                    Hãy khám phá các tuyệt tác hương thảo mộc của Sả Spa
                  </p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="mt-5 rounded-full border border-[#D4AF37] bg-transparent px-5 py-2 text-xs font-medium text-[#755428] hover:bg-[#D4AF37]/10"
                  >
                    Tiếp tục ngắm nhìn sản phẩm →
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedVolume}`}
                    className="flex gap-3.5 rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-3.5 shadow-xs transition-shadow hover:shadow-md"
                  >
                    {/* Ảnh thu nhỏ */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#E2D9CC] bg-[#F4EFEA] text-2xl">
                      {item.product.category === 'tinh-dau'
                        ? '🏺'
                        : item.product.category === 'cham-soc-co-the'
                          ? '🌿'
                          : item.product.category === 'nen-thom'
                            ? '🕯️'
                            : '🫖'}
                    </div>

                    {/* Chi tiết */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="line-clamp-1 font-serif text-sm font-semibold text-[#1F2B24]">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id, item.selectedVolume)}
                            className="text-xs text-[#8C827A] hover:text-[#B85D38]"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="text-[11px] text-[#635B54]">
                          Quy cách: {item.selectedVolume}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Bộ đếm số lượng với hiệu ứng Rolling number */}
                        <div className="flex items-center rounded-lg border border-[#E2D9CC]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedVolume,
                                item.quantity - 1,
                              )
                            }
                            className="px-2 py-0.5 text-xs text-[#635B54] hover:bg-[#EAE1D3]"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-semibold text-[#1F2B24]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedVolume,
                                item.quantity + 1,
                              )
                            }
                            className="px-2 py-0.5 text-xs text-[#635B54] hover:bg-[#EAE1D3]"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#405C4E]">
                          {formatCurrencyVND(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Tính Tiền & Mã Ưu Đãi */}
            {items.length > 0 && (
              <div className="border-t border-[#E2D9CC] bg-[#F4EFEA] p-5">
                {/* Form Nhập Mã Ưu Đãi */}
                <form onSubmit={handleApplyCoupon} className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Mã ưu đãi (SASPA15, WELCOME10)"
                    className="flex-1 rounded-xl border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs text-[#2B2622] placeholder-[#8C827A] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1F2B24] px-3.5 py-1.5 text-xs font-medium text-[#D4AF37] hover:bg-[#141C17]"
                  >
                    Áp dụng
                  </button>
                </form>

                {/* Feedback mã ưu đãi */}
                {couponFeedback && (
                  <p
                    className={`mb-3 text-[11px] ${
                      couponFeedback.success ? 'font-medium text-[#405C4E]' : 'text-[#B85D38]'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}

                {discountCode && (
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-[#D4AF37]/15 p-2 text-xs text-[#755428]">
                    <span>
                      Mã {discountCode} (-{discountPercent}%)
                    </span>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="text-[11px] text-[#B85D38] underline"
                    >
                      Xóa mã
                    </button>
                  </div>
                )}

                {/* Bảng tổng kết chi phí */}
                <div className="space-y-1.5 border-b border-[#E2D9CC] pb-3 text-xs text-[#635B54]">
                  <div className="flex justify-between">
                    <span>Tổng phụ:</span>
                    <span>{formatCurrencyVND(totals.subtotal)}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-[#B85D38]">
                      <span>Giảm giá ({discountPercent}%):</span>
                      <span>-{formatCurrencyVND(totals.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>
                      {totals.shippingFee === 0 ? (
                        <strong className="text-[#405C4E]">Miễn phí</strong>
                      ) : (
                        formatCurrencyVND(totals.shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-bold text-[#1F2B24]">
                    <span>Tổng thanh toán:</span>
                    <span className="text-base text-[#405C4E]">
                      {formatCurrencyVND(totals.total)}
                    </span>
                  </div>
                </div>

                {/* Nút Thanh Toán */}
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C68B59] py-3 text-xs font-semibold text-[#141C17] shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Tiến Hành Đặt Hàng & Gói Quà Tre</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
