'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { useOrderStore, OrderStatus } from '@/infrastructure/store/useOrderStore';
import { useCartStore } from '@/infrastructure/store/useCartStore';
import { formatCurrencyVND } from '@/lib/utils';

export default function OrdersPage() {
  const orders = useOrderStore((state) => state.orders);
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'PREPARING_HERBS':
        return 1;
      case 'BAMBOO_PACKAGING':
        return 2;
      case 'DELIVERING':
        return 3;
      case 'COMPLETED':
        return 4;
    }
  };

  const handleReorder = (orderId: string) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    for (const item of order.items) {
      addItem(item.product, item.selectedVolume, item.quantity);
    }
    setCartOpen(true);
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-[#FAF7F2] pb-24 text-[#2B2622]">
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              ✦ Sả Spa Sanctuary ✦
            </span>
            <h1 className="mt-1 font-serif text-3xl font-light text-[#1F2B24]">
              Lịch Sử & Hành Trình Đơn Hàng Thảo Mộc
            </h1>
            <p className="mt-2 text-xs text-[#8C827A]">
              Theo dõi chi tiết quy trình chưng cất, đóng gói hộp mây tre và hành trình vận chuyển
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-[#E2D9CC] bg-[#FAF7F2] p-12 text-center shadow-xs">
              <span className="text-5xl">📦</span>
              <h3 className="mt-4 font-serif text-lg font-medium text-[#1F2B24]">
                Chưa có đơn hàng nào
              </h3>
              <p className="mt-1 text-xs text-[#8C827A]">
                Bạn chưa đặt đơn hàng nào tại Sả Spa. Hãy ghé thăm cửa hàng để thưởng lãm các sản
                phẩm.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C68B59] px-6 py-2.5 text-xs font-semibold text-[#141C17] shadow-md hover:scale-105"
              >
                Khám Phá Cửa Hàng Sả Spa →
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => {
                const currentStep = getStatusStep(order.status);
                return (
                  <div
                    key={order.orderId}
                    className="overflow-hidden rounded-3xl border border-[#D4AF37]/40 bg-[#FAF7F2] shadow-md transition-shadow hover:shadow-lg"
                  >
                    {/* Header đơn hàng */}
                    <div className="flex flex-wrap items-center justify-between border-b border-[#E2D9CC] bg-[#F4EFEA] px-6 py-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-sm font-bold text-[#1F2B24]">
                          Mã Đơn: <span className="text-[#405C4E]">{order.orderId}</span>
                        </span>
                        <span className="text-[#8C827A]">•</span>
                        <span className="text-[#8C827A]">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#405C4E]">
                          {formatCurrencyVND(order.total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleReorder(order.orderId)}
                          className="rounded-full border border-[#D4AF37] bg-white px-3 py-1 text-[11px] font-medium text-[#755428] transition-colors hover:bg-[#D4AF37]/15"
                        >
                          Mua lại đơn này ↺
                        </button>
                      </div>
                    </div>

                    {/* Thanh Trạng Thái Động (Progress Bar 4 Bước) */}
                    <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] px-6 py-5">
                      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                        {[
                          { s: 1, label: 'Chuẩn bị thảo mộc', icon: '🌿' },
                          { s: 2, label: 'Đóng gói hộp tre', icon: '🎁' },
                          { s: 3, label: 'Đang vận chuyển', icon: '🚚' },
                          { s: 4, label: 'Đã trao tận tay', icon: '✨' },
                        ].map((st) => (
                          <div key={st.s} className="flex flex-col items-center">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-xs transition-all ${
                                currentStep >= st.s
                                  ? 'bg-[#1F2B24] text-[#D4AF37] ring-2 ring-[#D4AF37]/40'
                                  : 'bg-[#E2D9CC] text-[#8C827A]'
                              }`}
                            >
                              {st.icon}
                            </span>
                            <span
                              className={`mt-1.5 text-[11px] font-medium ${
                                currentStep >= st.s
                                  ? 'font-semibold text-[#1F2B24]'
                                  : 'text-[#8C827A]'
                              }`}
                            >
                              {st.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Danh sách mục sản phẩm */}
                    <div className="space-y-3 px-6 py-4">
                      {order.items.map((item) => (
                        <div
                          key={`${item.product.id}-${item.selectedVolume}`}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {item.product.category === 'tinh-dau'
                                ? '🏺'
                                : item.product.category === 'cham-soc-co-the'
                                  ? '🌿'
                                  : item.product.category === 'nen-thom'
                                    ? '🕯️'
                                    : '🫖'}
                            </span>
                            <div>
                              <p className="font-semibold text-[#1F2B24]">{item.product.name}</p>
                              <span className="text-[11px] text-[#8C827A]">
                                Quy cách: {item.selectedVolume} × {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-medium text-[#405C4E]">
                            {formatCurrencyVND(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}

                      {/* Thông tin thiệp tay nếu là quà tặng */}
                      {order.giftOption?.isGift && (
                        <div className="mt-4 rounded-2xl border border-[#D4AF37]/30 bg-[#F4EFEA] p-3 text-xs">
                          <span className="font-semibold text-[#755428]">
                            💌 Thiệp chúc mừng kèm hộp mây tre:
                          </span>
                          <p className="mt-1 font-serif text-xs text-[#4A3B32] italic">
                            &quot;{order.giftOption.greetingMessage}&quot;
                          </p>
                          <span className="mt-1 block text-right text-[10px] text-[#8C827A]">
                            Người nhận: {order.giftOption.recipientName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Địa chỉ giao hàng */}
                    <div className="flex justify-between border-t border-[#E2D9CC] bg-[#FAF7F2] px-6 py-3 text-[11px] text-[#635B54]">
                      <span>
                        Người nhận: <strong>{order.customer.name}</strong> ({order.customer.phone})
                      </span>
                      <span className="max-w-xs truncate">{order.customer.address}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
