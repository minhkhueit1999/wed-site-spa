'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { useCartStore } from '@/infrastructure/store/useCartStore';
import { useOrderStore, SaSpaOrder } from '@/infrastructure/store/useOrderStore';
import { formatCurrencyVND } from '@/lib/utils';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const addOrder = useOrderStore((state) => state.addOrder);

  const totals = getCartTotal();

  // Form states
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 là màn hình Order Confirmation Ritual
  const [name, setName] = useState('Nguyễn Thị Minh An');
  const [phone, setPhone] = useState('0912345678');
  const [email, setEmail] = useState('khachhang@spawellness.vn');
  const [address, setAddress] = useState('12 Đặng Dung, Phường Tân Định, Quận 1, TP.HCM');

  // Gói quà hộp tre & Thiệp tay
  const [isGift, setIsGift] = useState(true);
  const [recipientName, setRecipientName] = useState('Minh An');
  const [greetingMessage, setGreetingMessage] = useState(
    'Thương tặng bạn món quà thảo mộc Sả Spa. Chúc bạn luôn an yên và ngủ ngon!',
  );

  // Giao hàng & Thanh toán
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'card' | 'cod'>('vietqr');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');

  // Tính lại tổng tiền theo phương thức vận chuyển
  const expressFee = shippingMethod === 'express' ? 30000 : 0;
  const finalTotal = totals.total + expressFee;

  // Xử lý hoàn tất đơn hàng
  const handlePlaceOrder = () => {
    const newOrderId = `SASPA-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: SaSpaOrder = {
      orderId: newOrderId,
      createdAt: new Date().toISOString(),
      items: [...items],
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      shippingFee: totals.shippingFee + expressFee,
      total: finalTotal,
      customer: { name, phone, email, address },
      giftOption: { isGift, recipientName, greetingMessage },
      shippingMethod,
      paymentMethod,
      status: 'PREPARING_HERBS',
    };

    addOrder(newOrder);
    setConfirmedOrderId(newOrderId);
    clearCart();
    setStep(4); // Order Confirmation Ritual
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-[#FAF7F2] pb-24 text-[#2B2622]">
        <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
          {/* Header luồng thanh toán */}
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              ✦ Nghi Thức Đặt Hàng ✦
            </span>
            <h1 className="mt-1 font-serif text-3xl font-light text-[#1F2B24]">
              Thanh Toán & Đóng Gói Hộp Tre Sả Spa
            </h1>
          </div>

          {/* Stepper Chỉ Số Tiến Trình 3 Bước */}
          {step < 4 && (
            <div className="mb-10 flex items-center justify-center gap-4 text-xs">
              {[
                { s: 1, label: '1. Người Nhận & Quà Tặng' },
                { s: 2, label: '2. Phương Thức Giao' },
                { s: 3, label: '3. Thanh Toán & Hoàn Tất' },
              ].map((item) => (
                <div key={item.s} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step >= item.s ? 'bg-[#1F2B24] text-[#D4AF37]' : 'bg-[#E2D9CC] text-[#8C827A]'
                    }`}
                  >
                    {item.s}
                  </span>
                  <span
                    className={`font-medium ${
                      step >= item.s ? 'text-[#1F2B24]' : 'text-[#8C827A]'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.s < 3 && <span className="hidden text-[#E2D9CC] sm:inline">———</span>}
                </div>
              ))}
            </div>
          )}

          {/* MÀN HÌNH 4: ORDER CONFIRMATION RITUAL (MƯA CÁNH HOA & CHÚC MỪNG) */}
          {step === 4 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#1F2B24] to-[#141C17] p-8 text-center text-[#FAF7F2] shadow-2xl md:p-14"
            >
              {/* Hiệu ứng cánh hoa thảo mộc rơi */}
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.5), transparent 70%)',
                }}
              />

              <div className="relative z-10 mx-auto max-w-lg">
                <span className="animate-bounce text-6xl">🌿</span>
                <span className="mt-4 block text-xs tracking-widest text-[#D4AF37] uppercase">
                  Đơn Hàng Đã Được Tiếp Nhận
                </span>
                <h2 className="mt-2 font-serif text-3xl font-light text-[#FAF7F2] md:text-4xl">
                  Cảm Ơn Bạn Đã Chọn Sả Spa
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#FAF7F2]/80">
                  Mã đơn hàng:{' '}
                  <strong className="font-mono text-base text-[#D4AF37]">{confirmedOrderId}</strong>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#FAF7F2]/70">
                  Các nghệ nhân Sả Spa đang tuyển chọn những nhánh thảo mộc tươi nhất, cẩn thận xếp
                  vào hộp mây tre đan thủ công và thắt nơ lụa trao tận tay bạn.
                </p>

                {/* Thiệp tay đã được đính kèm */}
                {isGift && (
                  <div className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-[#FAF7F2]/10 p-4 text-left backdrop-blur-md">
                    <span className="text-[10px] tracking-wider text-[#D4AF37] uppercase">
                      💌 Thiệp chúc mừng đính kèm gói quà:
                    </span>
                    <p className="mt-1 font-serif text-sm text-[#FAF7F2] italic">
                      &quot;{greetingMessage}&quot;
                    </p>
                    <span className="mt-1 block text-right text-xs text-[#D4AF37]">
                      — Người nhận: {recipientName}
                    </span>
                  </div>
                )}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/orders"
                    className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C68B59] px-6 py-3 text-xs font-semibold text-[#141C17] shadow-lg transition-transform hover:scale-105"
                  >
                    Xem Lịch Trình & Theo Dõi Đơn Hàng →
                  </Link>
                  <Link
                    href="/shop"
                    className="rounded-full border border-[#D4AF37]/40 bg-transparent px-6 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-[#D4AF37]/10"
                  >
                    Tiếp Tục Mua Sắm
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cột Trái: Các bước điền form */}
              <div className="space-y-6 lg:col-span-2">
                {/* BƯỚC 1: THÔNG TIN NGƯỜI NHẬN & QUÀ TẶNG HỘP TRE */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-3xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-sm"
                  >
                    <h2 className="mb-4 font-serif text-lg font-semibold text-[#1F2B24]">
                      1. Thông Tin Nhận Hàng
                    </h2>

                    <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-medium text-[#635B54]">Họ và tên</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-[#E2D9CC] bg-white p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-medium text-[#635B54]">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-[#E2D9CC] bg-white p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block font-medium text-[#635B54]">
                          Email nhận thông báo
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-[#E2D9CC] bg-white p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block font-medium text-[#635B54]">
                          Địa chỉ giao hàng
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Số nhà, tên đường, phường, quận..."
                          className="w-full rounded-xl border border-[#E2D9CC] bg-white p-2.5 text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Tùy chọn Gói quà hộp mây tre & Thiệp tay thư pháp */}
                    <div className="mt-6 border-t border-[#E2D9CC] pt-5">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isGift}
                          onChange={(e) => setIsGift(e.target.checked)}
                          className="h-4 w-4 rounded border-[#D4AF37] text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span className="text-xs font-semibold text-[#1F2B24]">
                          🎁 Đóng gói thủ công bằng hộp mây tre đan & Viết thiệp tay miễn phí
                        </span>
                      </label>

                      {isGift && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 space-y-3 rounded-2xl border border-[#D4AF37]/30 bg-[#F4EFEA] p-4 text-xs"
                        >
                          <div>
                            <label className="mb-1 block font-medium text-[#755428]">
                              Tên người nhận quà
                            </label>
                            <input
                              type="text"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              placeholder="Ví dụ: Minh An, Mẹ Yêu, Bạn Thân..."
                              className="w-full rounded-xl border border-[#E2D9CC] bg-white p-2 text-xs focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block font-medium text-[#755428]">
                              Lời chúc trên thiệp tay (xem trước trực tiếp)
                            </label>
                            <textarea
                              rows={2}
                              value={greetingMessage}
                              onChange={(e) => setGreetingMessage(e.target.value)}
                              className="w-full rounded-xl border border-[#E2D9CC] bg-white p-2 text-xs focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>

                          {/* KHUNG XEM TRƯỚC TẤM THIỆP THƯ PHÁP (LIVE CALLIGRAPHY PREVIEW) */}
                          <div className="mt-3 rounded-xl border border-[#D4AF37]/40 bg-[#FAF7F2] p-4 text-center shadow-xs">
                            <span className="mb-1 block text-[10px] tracking-widest text-[#D4AF37] uppercase">
                              ✦ Tấm Thiệp Giấy Dó Sả Spa ✦
                            </span>
                            <p className="font-serif text-sm text-[#4A3B32] italic">
                              &quot;{greetingMessage}&quot;
                            </p>
                            <span className="mt-2 block text-right text-xs font-medium text-[#755428]">
                              Gửi: {recipientName}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C68B59] py-3 text-xs font-semibold text-[#141C17] shadow-md hover:scale-[1.01]"
                    >
                      Tiếp Tục Chọn Phương Thức Giao Hàng →
                    </button>
                  </motion.div>
                )}

                {/* BƯỚC 2: PHƯƠNG THỨC GIAO HÀNG */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-3xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-sm"
                  >
                    <h2 className="mb-4 font-serif text-lg font-semibold text-[#1F2B24]">
                      2. Phương Thức Vận Chuyển
                    </h2>

                    <div className="space-y-3">
                      <label
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                          shippingMethod === 'standard'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-[#E2D9CC] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}
                            className="text-[#D4AF37] focus:ring-[#D4AF37]"
                          />
                          <div>
                            <span className="block text-xs font-semibold text-[#1F2B24]">
                              Giao hàng tiêu chuẩn (1–2 ngày)
                            </span>
                            <span className="text-[11px] text-[#8C827A]">
                              Đóng gói hộp tre bảo quản tinh chất kỹ lưỡng
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#405C4E]">
                          {totals.shippingFee === 0 ? 'Miễn phí' : '35.000₫'}
                        </span>
                      </label>

                      <label
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                          shippingMethod === 'express'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-[#E2D9CC] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                            className="text-[#D4AF37] focus:ring-[#D4AF37]"
                          />
                          <div>
                            <span className="block text-xs font-semibold text-[#1F2B24]">
                              ⚡ Giao hỏa tốc 2H nội thành (Ưu tiên Sả Spa)
                            </span>
                            <span className="text-[11px] text-[#8C827A]">
                              Chuyên viên giao hoa tươi và thảo mộc trong 120 phút
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#405C4E]">
                          {formatCurrencyVND(totals.shippingFee + 30000)}
                        </span>
                      </label>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-2xl border border-[#E2D9CC] px-4 py-3 text-xs font-medium text-[#635B54] hover:bg-[#EAE1D3]"
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C68B59] py-3 text-xs font-semibold text-[#141C17] shadow-md hover:scale-[1.01]"
                      >
                        Tiếp Tục Chọn Thanh Toán →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* BƯỚC 3: PHƯƠNG THỨC THANH TOÁN & QUÉT MÃ QR */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-3xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-sm"
                  >
                    <h2 className="mb-4 font-serif text-lg font-semibold text-[#1F2B24]">
                      3. Phương Thức Thanh Toán
                    </h2>

                    <div className="space-y-3">
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                          paymentMethod === 'vietqr'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-[#E2D9CC] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'vietqr'}
                          onChange={() => setPaymentMethod('vietqr')}
                          className="mt-1 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <div className="flex-1">
                          <span className="block text-xs font-semibold text-[#1F2B24]">
                            Chuyển khoản VietQR Nhanh (Khuyên dùng)
                          </span>
                          <span className="block text-[11px] text-[#8C827A]">
                            Tự sinh mã QR chuẩn xác theo tổng đơn {formatCurrencyVND(finalTotal)}
                          </span>

                          {/* KHỐI HIỂN THỊ MÃ VIETQR MÔ PHỎNG */}
                          {paymentMethod === 'vietqr' && (
                            <div className="mt-4 flex flex-col items-center gap-4 rounded-xl border border-[#D4AF37]/40 bg-white p-4 sm:flex-row">
                              {/* SVG Mô phỏng mã QR */}
                              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg border-2 border-[#1F2B24] bg-[#FAF7F2] p-2">
                                <svg viewBox="0 0 100 100" className="h-full w-full">
                                  <rect width="100" height="100" fill="#FAF7F2" />
                                  <rect x="10" y="10" width="30" height="30" fill="#1F2B24" />
                                  <rect x="15" y="15" width="20" height="20" fill="#FAF7F2" />
                                  <rect x="20" y="20" width="10" height="10" fill="#1F2B24" />
                                  <rect x="60" y="10" width="30" height="30" fill="#1F2B24" />
                                  <rect x="65" y="15" width="20" height="20" fill="#FAF7F2" />
                                  <rect x="70" y="20" width="10" height="10" fill="#1F2B24" />
                                  <rect x="10" y="60" width="30" height="30" fill="#1F2B24" />
                                  <rect x="15" y="65" width="20" height="20" fill="#FAF7F2" />
                                  <rect x="20" y="70" width="10" height="10" fill="#1F2B24" />
                                  <rect x="45" y="45" width="15" height="15" fill="#D4AF37" />
                                  <circle cx="52.5" cy="52.5" r="4" fill="#1F2B24" />
                                </svg>
                              </div>

                              <div className="space-y-1 text-xs text-[#635B54]">
                                <p>
                                  Ngân hàng: <strong>Vietcombank (VCB)</strong>
                                </p>
                                <p>
                                  Số tài khoản: <strong>9999 8888 6868</strong>
                                </p>
                                <p>
                                  Chủ TK: <strong>SA SPA BOTANICAL SANCTUARY</strong>
                                </p>
                                <p>
                                  Số tiền:{' '}
                                  <strong className="text-[#405C4E]">
                                    {formatCurrencyVND(finalTotal)}
                                  </strong>
                                </p>
                                <p className="text-[10px] text-[#8C827A]">
                                  (Hệ thống tự động kích hoạt xác nhận sau khi quét)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-[#E2D9CC] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="mt-1 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <div>
                          <span className="block text-xs font-semibold text-[#1F2B24]">
                            Thanh toán tiền mặt khi nhận hàng (COD)
                          </span>
                          <span className="text-[11px] text-[#8C827A]">
                            Kiểm tra hộp mây tre và mùi hương thảo mộc trước khi thanh toán
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-2xl border border-[#E2D9CC] px-4 py-3 text-xs font-medium text-[#635B54] hover:bg-[#EAE1D3]"
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C68B59] py-3 text-xs font-bold text-[#141C17] shadow-xl hover:scale-[1.01]"
                      >
                        Xác Nhận Đặt Hàng ({formatCurrencyVND(finalTotal)}) ✦
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Cột Phải: Tóm tắt Giỏ Hàng & Quà Tặng */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-[#E2D9CC] bg-[#FAF7F2] p-5 text-xs shadow-sm">
                  <h3 className="mb-3 font-serif text-base font-semibold text-[#1F2B24]">
                    Tóm Tắt Đơn Hàng ({totals.totalItems})
                  </h3>

                  <div className="max-h-60 space-y-2.5 overflow-y-auto border-b border-[#E2D9CC] pb-3">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedVolume}`}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="line-clamp-1 font-semibold text-[#1F2B24]">
                            {item.product.name}
                          </p>
                          <span className="text-[10px] text-[#8C827A]">
                            {item.selectedVolume} × {item.quantity}
                          </span>
                        </div>
                        <span className="font-medium text-[#405C4E]">
                          {formatCurrencyVND(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1.5 text-[#635B54]">
                    <div className="flex justify-between">
                      <span>Tổng phụ:</span>
                      <span>{formatCurrencyVND(totals.subtotal)}</span>
                    </div>
                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-[#B85D38]">
                        <span>Giảm giá:</span>
                        <span>-{formatCurrencyVND(totals.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>
                        Vận chuyển ({shippingMethod === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn'}):
                      </span>
                      <span>
                        {totals.shippingFee + expressFee === 0
                          ? 'Miễn phí'
                          : formatCurrencyVND(totals.shippingFee + expressFee)}
                      </span>
                    </div>
                    {isGift && (
                      <div className="flex justify-between text-[#755428]">
                        <span>Hộp mây tre & Thiệp tay:</span>
                        <span className="font-medium">Tặng miễn phí 🎁</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[#E2D9CC] pt-2 text-sm font-bold text-[#1F2B24]">
                      <span>Tổng cộng:</span>
                      <span className="text-base text-[#405C4E]">
                        {formatCurrencyVND(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#F4EFEA] p-4 text-[11px] leading-relaxed text-[#755428]">
                  <p>
                    🌿 <strong>Cam kết Sả Spa:</strong> 100% nguyên liệu bản địa organic, chưng cất
                    thủ công không hóa chất bảo quản. Đổi trả miễn phí trong 7 ngày nếu không hài
                    lòng về độ tinh khiết của mùi hương.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
