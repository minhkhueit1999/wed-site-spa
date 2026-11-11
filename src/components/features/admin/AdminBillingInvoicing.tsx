'use client';

import * as React from 'react';
import { Button, Card, CardTitle, Badge } from '@/components/ui';
import {
  getInvoicesListAction,
  createAndSettleInvoiceAction,
  refundOrVoidInvoiceAction,
  calculateBillPreviewAction,
  getCustomerListAction,
  getStaffListAction,
  type InvoiceListItem,
  type CustomerCRMItem,
  type StaffListItem,
  type AdminAllData,
  type BillCalculationResult,
} from '@/application/admin/actions';
import { formatCurrencyVND } from '@/lib/utils';

interface Props {
  adminData: AdminAllData | null;
}

export function AdminBillingInvoicing({ adminData }: Props) {
  const [invoices, setInvoices] = React.useState<InvoiceListItem[]>([]);
  const [customers, setCustomers] = React.useState<CustomerCRMItem[]>([]);
  const [therapists, setTherapists] = React.useState<StaffListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  // Modal Tạo Hóa Đơn
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState('');
  const [selectedServiceSlug, setSelectedServiceSlug] = React.useState('');
  const [selectedProductSlug, setSelectedProductSlug] = React.useState('');
  const [productQuantity, setProductQuantity] = React.useState(1);
  const [selectedUpsellTherapistId, setSelectedUpsellTherapistId] = React.useState('');
  const [voucherCode, setVoucherCode] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<
    'CASH' | 'TRANSFER' | 'CARD' | 'PREPAID_PACKAGE'
  >('TRANSFER');
  const [paidAmount, setPaidAmount] = React.useState(0);
  const [invoiceNotes, setInvoiceNotes] = React.useState('');

  // Bill calculation preview
  const [billPreview, setBillPreview] = React.useState<BillCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Modal Hoàn Tiền / Hủy Hóa Đơn (Audit Trail)
  const [refundModalInvoice, setRefundModalInvoice] = React.useState<InvoiceListItem | null>(null);
  const [refundReason, setRefundReason] = React.useState('');
  const [isRefunding, setIsRefunding] = React.useState(false);

  const handleRefundOrVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalInvoice) return;
    if (!refundReason.trim()) {
      setFeedback({ type: 'error', msg: 'Vui lòng nhập lý do hoàn tiền / hủy hóa đơn.' });
      return;
    }

    setIsRefunding(true);
    const res = await refundOrVoidInvoiceAction(refundModalInvoice.id, refundReason);
    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `Đã hoàn tiền & hủy hóa đơn ${res.value.code} thành công! Đã hoàn kho mỹ phẩm và lưu vết kiểm toán AuditLog.`,
      });
      setRefundModalInvoice(null);
      setRefundReason('');
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsRefunding(false);
  };

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [invRes, custRes, staffRes] = await Promise.all([
      getInvoicesListAction(),
      getCustomerListAction(),
      getStaffListAction(),
    ]);

    if (invRes.ok) setInvoices(invRes.value);
    if (custRes.ok) setCustomers(custRes.value);
    if (staffRes.ok) setTherapists(staffRes.value.filter((s) => s.role === 'THERAPIST'));
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Tự động tính toán khi form thay đổi
  React.useEffect(() => {
    if (!selectedCustomerId) {
      setBillPreview(null);
      return;
    }

    let active = true;
    setIsCalculating(true);

    const productItems = selectedProductSlug
      ? [{ slug: selectedProductSlug, quantity: productQuantity }]
      : [];

    void calculateBillPreviewAction({
      customerId: selectedCustomerId,
      serviceSlug: selectedServiceSlug || undefined,
      productItems,
      voucherCode: voucherCode.trim() || undefined,
      usePrepaidSession: paymentMethod === 'PREPAID_PACKAGE',
    }).then((res) => {
      if (!active) return;
      if (res.ok) {
        setBillPreview(res.value);
        setPaidAmount(res.value.finalVnd);
      }
      setIsCalculating(false);
    });

    return () => {
      active = false;
    };
  }, [
    selectedCustomerId,
    selectedServiceSlug,
    selectedProductSlug,
    productQuantity,
    voucherCode,
    paymentMethod,
  ]);

  // Tạo và quyết toán hóa đơn
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setFeedback({ type: 'error', msg: 'Vui lòng chọn khách hàng.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const productItems = selectedProductSlug
      ? [{ slug: selectedProductSlug, quantity: productQuantity }]
      : [];

    const res = await createAndSettleInvoiceAction({
      customerId: selectedCustomerId,
      serviceSlug: selectedServiceSlug || undefined,
      productItems,
      voucherCode: voucherCode.trim() || undefined,
      paymentMethod,
      paidVnd: paidAmount,
      upsellTherapistId: selectedUpsellTherapistId || undefined,
      notes: invoiceNotes,
    });

    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `Đã tạo hóa đơn ${res.value.code} thành công!${res.value.debtVnd > 0 ? ` Ghi nhận công nợ: ${formatCurrencyVND(res.value.debtVnd)}` : ''}`,
      });
      setIsCreateModalOpen(false);
      setSelectedCustomerId('');
      setSelectedServiceSlug('');
      setSelectedProductSlug('');
      setVoucherCode('');
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2D9CC] bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2B24]">
            Thanh Toán, Doanh Thu & Hóa Đơn Kế Toán
          </h2>
          <p className="text-sm text-[#635B54]">
            Thuật toán tính bill tự động, trừ lùi buổi gói trả trước, chiết khấu voucher và phân bổ
            hoa hồng KTV.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setIsCreateModalOpen(true);
              setFeedback(null);
            }}
          >
            + Lập Hóa Đơn Mới
          </Button>
          <Button size="sm" variant="outline" onClick={loadData}>
            🔄 Làm Mới
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-[#4E6B56]/30 bg-[#E8EFE9] text-[#1F2B24]'
              : 'border-[#B85D38]/30 bg-[#FDECEC] text-[#B85D38]'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* 2. Bảng Lịch Sử Hóa Đơn */}
      <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
        <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
          Danh Sách Hóa Đơn Giao Dịch Đã Chốt ({invoices.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2B2622]">
            <thead className="bg-[#FAF7F2] text-xs text-[#8C827A] uppercase">
              <tr>
                <th className="p-3.5">Mã HĐ</th>
                <th className="p-3.5">Khách Hàng</th>
                <th className="p-3.5">Chi Tiết Hạng Mục</th>
                <th className="p-3.5">Tổng Tiền</th>
                <th className="p-3.5">Chiết Khấu</th>
                <th className="p-3.5 font-bold text-[#1F2B24]">Thực Thu</th>
                <th className="p-3.5">Ghi Nợ</th>
                <th className="p-3.5">Hình Thức</th>
                <th className="p-3.5">KTV Bán Chéo</th>
                <th className="p-3.5 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9CC]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-xs text-[#8C827A]">
                    Đang tải danh sách hóa đơn...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-xs text-[#8C827A]">
                    Chưa có hóa đơn nào được tạo.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAF7F2]/40">
                    <td className="p-3.5 font-mono text-xs font-bold text-[#1F2B24]">{inv.code}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#1F2B24]">{inv.customerName}</div>
                      <Badge variant="outline">{inv.loyaltyTier}</Badge>
                    </td>
                    <td className="max-w-xs p-3.5 text-xs text-[#635B54]">
                      {inv.items.map((it, idx) => (
                        <div key={idx} className="line-clamp-1">
                          • {it.itemName} (x{it.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 font-mono text-xs">
                      {formatCurrencyVND(inv.subtotalVnd)}
                    </td>
                    <td className="p-3.5 font-mono text-xs text-[#B85D38]">
                      {inv.discountVnd > 0 ? `-${formatCurrencyVND(inv.discountVnd)}` : '0 đ'}
                    </td>
                    <td className="p-3.5 font-mono text-sm font-bold text-[#1F2B24]">
                      {formatCurrencyVND(inv.paidVnd)}
                    </td>
                    <td className="p-3.5 font-mono text-xs">
                      {inv.debtVnd > 0 ? (
                        <span className="font-bold text-red-600">
                          {formatCurrencyVND(inv.debtVnd)}
                        </span>
                      ) : (
                        '0 đ'
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={inv.paymentMethod === 'PREPAID_PACKAGE' ? 'success' : 'outline'}
                      >
                        {inv.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-xs">
                      {inv.upsellTherapistName ? (
                        <div>
                          <div className="font-semibold text-[#4E6B56]">
                            {inv.upsellTherapistName}
                          </div>
                          <div className="text-[10px] font-bold text-[#B85D38]">
                            +{formatCurrencyVND(inv.upsellCommissionVnd)} hoa hồng
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#8C827A]">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Badge
                          variant={
                            inv.status === 'PAID'
                              ? 'success'
                              : inv.status === 'REFUNDED'
                                ? 'warning'
                                : 'terracotta'
                          }
                        >
                          {inv.status}
                        </Badge>
                        {inv.status === 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRefundModalInvoice(inv);
                              setRefundReason('');
                            }}
                            className="text-[11px] text-[#B85D38] hover:bg-[#FDECEC]"
                          >
                            ↩️ Hủy/Hoàn
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Modal Lập Hóa Đơn & Thu Phí Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="max-h-[90vh] w-full max-w-xl overflow-y-auto border-[#D4B996] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <CardTitle className="font-serif text-xl text-[#1F2B24]">
                Lập Hóa Đơn Thanh Toán & Quyết Toán
              </CardTitle>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#635B54]">Khách hàng:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || c.email}) - {c.loyaltyTier} (Gói còn:{' '}
                      {c.prepaidSessions}b)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Gói dịch vụ đã thực hiện (tùy chọn):
                </label>
                <select
                  value={selectedServiceSlug}
                  onChange={(e) => setSelectedServiceSlug(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                >
                  <option value="">-- Không có dịch vụ lẻ --</option>
                  {adminData?.services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} ({formatCurrencyVND(s.priceVnd)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Sản phẩm mua thêm (Bán chéo/Toa tại nhà):
                  </label>
                  <select
                    value={selectedProductSlug}
                    onChange={(e) => setSelectedProductSlug(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  >
                    <option value="">-- Không có sản phẩm --</option>
                    {adminData?.products.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({formatCurrencyVND(p.priceVnd)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Số lượng:</label>
                  <input
                    type="number"
                    min={1}
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Kỹ thuật viên tư vấn bán chéo (Nhận hoa hồng 15%):
                </label>
                <select
                  value={selectedUpsellTherapistId}
                  onChange={(e) => setSelectedUpsellTherapistId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                >
                  <option value="">-- Không tính hoa hồng KTV --</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (KTV)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Mã Voucher giảm giá:
                  </label>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="MKSPA50, VIPGOLD10..."
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 font-mono text-sm font-bold text-[#1F2B24] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Hình thức thanh toán:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as 'CASH' | 'TRANSFER' | 'CARD' | 'PREPAID_PACKAGE',
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm font-semibold text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  >
                    <option value="TRANSFER">Chuyển Khoản (VietQR)</option>
                    <option value="CASH">Tiền Mặt</option>
                    <option value="CARD">Quẹt Thẻ POS</option>
                    <option value="PREPAID_PACKAGE">Trừ Buổi Gói Trả Trước</option>
                  </select>
                </div>
              </div>

              {/* Bảng tính chiết khấu trực tiếp */}
              {billPreview && (
                <div className="space-y-1.5 rounded-xl border border-[#4E6B56]/40 bg-[#E8EFE9]/60 p-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#635B54]">Tổng tiền dịch vụ & sản phẩm:</span>
                    <span className="font-mono font-bold">
                      {formatCurrencyVND(billPreview.subtotalVnd)}
                    </span>
                  </div>
                  {billPreview.tierDiscountVnd > 0 && (
                    <div className="flex justify-between text-[#4E6B56]">
                      <span>Ưu đãi hạng thẻ ({billPreview.loyaltyTier}):</span>
                      <span className="font-mono font-bold">
                        -{formatCurrencyVND(billPreview.tierDiscountVnd)}
                      </span>
                    </div>
                  )}
                  {billPreview.voucherDiscountVnd > 0 && (
                    <div className="flex justify-between text-[#B85D38]">
                      <span>Giảm giá Voucher ({billPreview.appliedVoucherCode}):</span>
                      <span className="font-mono font-bold">
                        -{formatCurrencyVND(billPreview.voucherDiscountVnd)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#4E6B56]/30 pt-1.5 text-sm font-bold text-[#1F2B24]">
                    <span>CẦN THANH TOÁN:</span>
                    <span className="font-mono text-base text-[#1F2B24]">
                      {formatCurrencyVND(billPreview.finalVnd)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Số tiền khách thực nộp lúc này (VND):
                </label>
                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 font-mono text-base font-bold text-[#1F2B24] outline-hidden focus:border-[#4E6B56]"
                />
                {billPreview && paidAmount < billPreview.finalVnd && (
                  <div className="mt-1 text-xs font-medium text-red-600">
                    ⚠️ Trả thiếu{' '}
                    <strong>{formatCurrencyVND(billPreview.finalVnd - paidAmount)}</strong>. Số tiền
                    này sẽ được tự động ghi nhận vào công nợ của khách hàng!
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Ghi chú hóa đơn:
                </label>
                <textarea
                  rows={2}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder="Ghi chú nội bộ hoặc yêu cầu xuất hóa đơn..."
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-xs text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting || isCalculating}>
                  {isSubmitting ? 'Đang quyết toán...' : 'Chốt & Xuất Hóa Đơn'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 4. Modal Hoàn Tiền / Hủy Hóa Đơn (Audit Trail) */}
      {refundModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-lg border-red-300 bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <CardTitle className="font-serif text-lg font-bold text-red-700">
                ↩️ Hoàn Tiền / Hủy Hóa Đơn ({refundModalInvoice.code})
              </CardTitle>
              <button
                onClick={() => setRefundModalInvoice(null)}
                className="text-lg text-[#8C827A] hover:text-[#1F2B24]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRefundOrVoid} className="mt-4 space-y-4">
              <div className="space-y-1 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-800">
                <p className="font-bold">⚠️ QUY TẮC TOÀN VẸN DỮ LIỆU & KIỂM TOÁN:</p>
                <p>
                  • Hóa đơn đã thu tiền tuyệt đối không thể xóa cứng (hard delete) khỏi cơ sở dữ
                  liệu.
                </p>
                <p>
                  • Hệ thống sẽ tự động hoàn trả số lượng mỹ phẩm vào tồn kho (nếu có), hoàn lại 1
                  buổi cho gói trả trước, và cập nhật trạng thái hóa đơn sang{' '}
                  <strong>REFUNDED</strong>.
                </p>
                <p>
                  • Toàn bộ thao tác hoàn tiền sẽ được ghi nhận vào <strong>AuditLog</strong> kèm
                  danh tính người thực hiện.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-[#E2D9CC] bg-white p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#635B54]">Khách hàng:</span>
                  <span className="font-bold">{refundModalInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#635B54]">Số tiền thực tế hoàn lại:</span>
                  <span className="font-mono font-bold text-red-700">
                    {formatCurrencyVND(refundModalInvoice.paidVnd)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B24]">
                  Lý do hoàn tiền / hủy bỏ (Bắt buộc):
                </label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Ví dụ: Khách bị dị ứng tinh dầu bất ngờ / Khách chuyển công tác đột xuất cần hủy liệu trình..."
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-xs text-[#2B2622] outline-hidden focus:border-red-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setRefundModalInvoice(null)}>
                  Đóng
                </Button>
                <Button
                  type="submit"
                  variant="terracotta"
                  disabled={isRefunding || !refundReason.trim()}
                >
                  {isRefunding ? 'Đang xử lý...' : 'Xác Nhận Hoàn Tiền & Hủy HĐ'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
