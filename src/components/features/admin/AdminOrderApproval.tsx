'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardTitle, Badge } from '@/components/ui';
import { formatCurrencyVND } from '@/lib/utils';
import {
  useOrderStore,
  type SaSpaOrder,
  type OrderStatus,
} from '@/infrastructure/store/useOrderStore';

export function AdminOrderApproval() {
  const orders = useOrderStore((state) => state.orders);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  const [selectedOrder, setSelectedOrder] = React.useState<SaSpaOrder | null>(null);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus, statusLabel: string) => {
    updateOrderStatus(orderId, newStatus);
    setFeedback({
      type: 'success',
      msg: `🎯 Đã cập nhật đơn hàng ${orderId} sang trạng thái: "${statusLabel}"!`,
    });
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderId}?`)) {
      deleteOrder(orderId);
      setFeedback({
        type: 'success',
        msg: `🗑️ Đã hủy đơn hàng ${orderId} thành công.`,
      });
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PREPARING_HERBS':
        return <Badge variant="warning">🌿 Chuẩn bị thảo mộc</Badge>;
      case 'BAMBOO_PACKAGING':
        return <Badge variant="terracotta">🎋 Đóng gói hộp tre</Badge>;
      case 'DELIVERING':
        return <Badge variant="secondary">🚚 Đang giao hàng</Badge>;
      case 'COMPLETED':
        return <Badge variant="primary">✅ Hoàn thành</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchSearch =
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm) ||
      o.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2B2622]">
            Duyệt & Quản Lý Đơn Hàng Khách Hàng (E-Commerce)
          </h2>
          <p className="text-xs text-[#635B54]">
            Tiếp nhận đơn đặt hàng trực tuyến, chuyển trạng thái chế tác thủ công, đóng gói hộp mây
            tre và bàn giao giao nhận.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#E5EDE8] px-3 py-1 text-xs font-bold text-[#405C4E]">
            Tổng: {orders.length} đơn hàng
          </span>
        </div>
      </div>

      {/* Thông báo phản hồi */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs font-medium ${
            feedback.type === 'success'
              ? 'border border-[#405C4E]/30 bg-[#E5EDE8] text-[#2D4137]'
              : 'border border-[#9E3838]/30 bg-[#FBEBEB] text-[#832B2B]'
          }`}
        >
          <span>{feedback.msg}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-sm font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bộ lọc & Tìm kiếm */}
      <Card className="border-[#E2D9CC] bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <input
              type="text"
              placeholder="🔍 Tìm theo mã đơn, họ tên, số điện thoại hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-xs text-[#2B2622] placeholder-[#8C827A] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute top-2.5 right-3 text-xs text-[#8C827A] hover:text-[#2B2622]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'PREPARING_HERBS', label: '🌿 Chờ chuẩn bị' },
              { id: 'BAMBOO_PACKAGING', label: '🎋 Đóng gói' },
              { id: 'DELIVERING', label: '🚚 Đang giao' },
              { id: 'COMPLETED', label: '✅ Hoàn tất' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  statusFilter === f.id
                    ? 'bg-[#405C4E] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#635B54] hover:bg-[#EAE1D3]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Danh sách đơn hàng */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {filteredOrders.length === 0 ? (
            <Card className="border-[#E2D9CC] bg-white p-12 text-center text-xs text-[#635B54]">
              Không có đơn hàng nào trong mục này.
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrder?.orderId === order.orderId;
              return (
                <div
                  key={order.orderId}
                  className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-xs transition-all ${
                    isSelected
                      ? 'border-[#405C4E] ring-2 ring-[#405C4E]/20'
                      : 'border-[#E2D9CC] hover:border-[#D4AF37]'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2D9CC]/60 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-bold text-[#1F2B24]">
                        Mã: <span className="text-[#405C4E]">{order.orderId}</span>
                      </span>
                      <span className="text-[#8C827A]">•</span>
                      <span className="text-[#8C827A]">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="mt-3 flex flex-col justify-between gap-3 text-xs sm:flex-row sm:items-center">
                    <div>
                      <div className="font-semibold text-[#2B2622]">
                        {order.customer.name}{' '}
                        <span className="font-mono font-normal text-[#8C827A]">
                          ({order.customer.phone})
                        </span>
                      </div>
                      <div className="line-clamp-1 text-[11px] text-[#635B54]">
                        📍 {order.customer.address}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-[#8C827A]">
                        <span>{order.items.length} món</span>
                        <span>•</span>
                        <span className="capitalize">
                          {order.shippingMethod === 'express' ? '🚀 Hỏa tốc' : 'Tiêu chuẩn'}
                        </span>
                        <span>•</span>
                        <span className="uppercase">{order.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-[11px] text-[#8C827A]">Tổng thanh toán</span>
                      <div className="font-serif text-base font-bold text-[#405C4E]">
                        {formatCurrencyVND(order.total)}
                      </div>
                    </div>
                  </div>

                  {/* Thanh nút bấm duyệt nhanh */}
                  <div
                    className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[#E2D9CC]/60 pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[11px] font-medium text-[#8C827A]">Duyệt chuyển:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(
                          order.orderId,
                          'PREPARING_HERBS',
                          'Đang chuẩn bị thảo mộc',
                        )
                      }
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        order.status === 'PREPARING_HERBS'
                          ? 'bg-[#1F2B24] text-[#D4AF37]'
                          : 'border border-[#D4C8B8] bg-[#FAF7F2] text-[#2B2622] hover:bg-[#EAE1D3]'
                      }`}
                    >
                      🌿 Chuẩn bị thảo mộc
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(
                          order.orderId,
                          'BAMBOO_PACKAGING',
                          'Đang đóng gói hộp mây tre',
                        )
                      }
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        order.status === 'BAMBOO_PACKAGING'
                          ? 'bg-[#8C5E3C] text-white'
                          : 'border border-[#D4C8B8] bg-[#FAF7F2] text-[#2B2622] hover:bg-[#EAE1D3]'
                      }`}
                    >
                      🎋 Đóng gói hộp tre
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(order.orderId, 'DELIVERING', 'Đang giao hàng')
                      }
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        order.status === 'DELIVERING'
                          ? 'bg-[#405C4E] text-white'
                          : 'border border-[#D4C8B8] bg-[#FAF7F2] text-[#2B2622] hover:bg-[#EAE1D3]'
                      }`}
                    >
                      🚚 Giao hàng
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(order.orderId, 'COMPLETED', 'Đã giao thành công')
                      }
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        order.status === 'COMPLETED'
                          ? 'bg-[#2D4137] text-white'
                          : 'border border-[#D4C8B8] bg-[#FAF7F2] text-[#2B2622] hover:bg-[#EAE1D3]'
                      }`}
                    >
                      ✅ Hoàn thành
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.orderId)}
                      className="ml-auto rounded-lg border border-[#9E3838]/40 bg-white px-2 py-1 text-[11px] font-medium text-[#9E3838] hover:bg-[#FBEBEB]"
                    >
                      Hủy đơn
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cột Xem Chi Tiết Đơn Hàng Đã Chọn */}
        <div>
          {selectedOrder ? (
            <Card className="sticky top-6 border-[#405C4E]/40 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
                <CardTitle className="font-serif text-base text-[#1F2B24]">
                  Chi Tiết Đơn: {selectedOrder.orderId}
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs text-[#8C827A] hover:text-[#2B2622]"
                >
                  ✕ Đóng
                </button>
              </div>

              {/* Thông tin người nhận */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-3">
                  <span className="block text-[10px] font-semibold tracking-wider text-[#405C4E] uppercase">
                    Thông tin giao nhận
                  </span>
                  <div className="mt-1 font-bold text-[#2B2622]">{selectedOrder.customer.name}</div>
                  <div className="font-mono text-[11px] text-[#635B54]">
                    SĐT: {selectedOrder.customer.phone}
                  </div>
                  <div className="text-[11px] text-[#635B54]">
                    Email: {selectedOrder.customer.email}
                  </div>
                  <div className="mt-1 text-[11px] text-[#2B2622]">
                    📍 {selectedOrder.customer.address}
                  </div>
                </div>

                {/* Quà tặng & Thiệp */}
                {selectedOrder.giftOption.isGift && (
                  <div className="rounded-xl border border-[#D4AF37]/50 bg-[#FDF8EE] p-3">
                    <span className="block text-[10px] font-semibold tracking-wider text-[#8C5E3C] uppercase">
                      🎁 Hộp Quà Mây Tre & Thiệp Tay
                    </span>
                    <div className="mt-1 text-[11px] text-[#2B2622]">
                      Người nhận: <strong>{selectedOrder.giftOption.recipientName}</strong>
                    </div>
                    {selectedOrder.giftOption.greetingMessage && (
                      <p className="mt-1 text-[11px] text-[#635B54] italic">
                        &ldquo;{selectedOrder.giftOption.greetingMessage}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Danh sách sản phẩm */}
                <div className="pt-2">
                  <span className="mb-2 block text-[11px] font-semibold text-[#635B54]">
                    Các sản phẩm trong đơn ({selectedOrder.items.length}):
                  </span>
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 rounded-lg border border-[#E2D9CC]/60 bg-[#FAF7F2] p-2 text-xs"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#E2D9CC] bg-white">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm">
                              🧴
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-[#2B2622]">
                            {item.product.name}
                          </div>
                          <div className="text-[10px] text-[#8C827A]">
                            {item.selectedVolume} • SL: {item.quantity}
                          </div>
                        </div>
                        <div className="font-semibold text-[#405C4E]">
                          {formatCurrencyVND(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tổng thanh toán */}
                <div className="space-y-1 border-t border-[#E2D9CC] pt-3 text-xs">
                  <div className="flex justify-between text-[#8C827A]">
                    <span>Tạm tính</span>
                    <span>{formatCurrencyVND(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-[#9E3838]">
                      <span>Giảm giá</span>
                      <span>-{formatCurrencyVND(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#8C827A]">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrencyVND(selectedOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E2D9CC]/60 pt-1 text-sm font-bold text-[#1F2B24]">
                    <span>Tổng cộng</span>
                    <span className="text-[#405C4E]">{formatCurrencyVND(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-[#E2D9CC] bg-[#FAF7F2] p-8 text-center text-xs text-[#8C827A]">
              👉 Bấm vào bất kỳ đơn hàng nào bên cạnh để xem chi tiết đầy đủ và duyệt quy trình đóng
              gói / vận chuyển.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
