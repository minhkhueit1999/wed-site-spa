'use client';

import * as React from 'react';
import { Button, Card, CardTitle, Badge } from '@/components/ui';
import {
  getCustomerListAction,
  getCustomerDetailAction,
  settleCustomerDebtAction,
  type CustomerCRMItem,
  type CustomerCRMDetail,
} from '@/application/admin/actions';
import { formatCurrencyVND } from '@/lib/utils';

export function AdminCRM() {
  const [customers, setCustomers] = React.useState<CustomerCRMItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [tierFilter, setTierFilter] = React.useState<string>('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  // Detail Modal
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerCRMDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  // Settle Debt Modal
  const [debtModalCustomer, setDebtModalCustomer] = React.useState<CustomerCRMItem | null>(null);
  const [debtPaymentAmount, setDebtPaymentAmount] = React.useState<number>(0);
  const [debtNotes, setDebtNotes] = React.useState('');
  const [isSubmittingDebt, setIsSubmittingDebt] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const res = await getCustomerListAction();
    if (res.ok) setCustomers(res.value);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Xem chi tiết hồ sơ
  const handleViewDetail = async (customerId: string) => {
    setIsLoadingDetail(true);
    const res = await getCustomerDetailAction(customerId);
    if (res.ok) {
      setSelectedCustomer(res.value);
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsLoadingDetail(false);
  };

  // Thu hồi công nợ
  const handleSettleDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtModalCustomer || debtPaymentAmount <= 0) return;

    setIsSubmittingDebt(true);
    setFeedback(null);

    const res = await settleCustomerDebtAction(
      debtModalCustomer.id,
      debtPaymentAmount,
      debtNotes || 'Thu hồi công nợ tại quầy lễ tân',
    );

    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `Đã thu công nợ thành công! Dư nợ còn: ${formatCurrencyVND(res.value.remainingDebtVnd)}`,
      });
      setDebtModalCustomer(null);
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsSubmittingDebt(false);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));
    const matchesTier = tierFilter === 'all' || c.loyaltyTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* 1. Toolbar CRM */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2D9CC] bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2B24]">
            Hồ Sơ Khách Hàng (CRM) & Quản Lý Công Nợ
          </h2>
          <p className="text-sm text-[#635B54]">
            Lưu vết phác đồ cá nhân hóa, lưu ý an toàn y khoa, thẻ thành viên VIP và đối soát công
            nợ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-xl border border-[#D4B996] bg-[#FAF7F2] px-3 py-1.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
          />

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="rounded-xl border border-[#D4B996] bg-[#FAF7F2] px-3 py-1.5 text-sm font-semibold text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
          >
            <option value="all">Tất cả hạng thẻ</option>
            <option value="STANDARD">Hạng Standard</option>
            <option value="SILVER">Hạng Silver</option>
            <option value="GOLD">Hạng Gold</option>
            <option value="DIAMOND">Hạng Diamond (VIP)</option>
          </select>

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

      {/* 2. Bảng Danh Sách Khách Hàng */}
      <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2B2622]">
            <thead className="bg-[#FAF7F2] text-xs text-[#8C827A] uppercase">
              <tr>
                <th className="p-3.5">Khách Hàng</th>
                <th className="p-3.5">Hạng Thẻ</th>
                <th className="p-3.5">Tổng Chi Tiêu</th>
                <th className="p-3.5">Công Nợ Hiện Tại</th>
                <th className="p-3.5">Buổi Gói Trả Trước</th>
                <th className="p-3.5">Lưu Ý Y Khoa / Dị Ứng</th>
                <th className="p-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9CC]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#8C827A]">
                    Đang tải dữ liệu hồ sơ khách hàng CRM...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#8C827A]">
                    Không tìm thấy khách hàng nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF7F2]/40">
                    <td className="p-3.5">
                      <div className="font-bold text-[#1F2B24]">{c.name}</div>
                      <div className="text-xs text-[#8C827A]">
                        {c.phone || c.email} • {c.totalAppointments} lượt ghé
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          c.loyaltyTier === 'DIAMOND'
                            ? 'warning'
                            : c.loyaltyTier === 'GOLD'
                              ? 'warning'
                              : c.loyaltyTier === 'SILVER'
                                ? 'success'
                                : 'outline'
                        }
                      >
                        {c.loyaltyTier} ({c.loyaltyPoints}đ)
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-xs font-bold">
                      {formatCurrencyVND(c.totalSpentVnd)}
                    </td>
                    <td className="p-3.5">
                      {c.debtBalanceVnd > 0 ? (
                        <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-xs font-bold text-red-600">
                          {formatCurrencyVND(c.debtBalanceVnd)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#4E6B56]">0 đ (Sạch nợ)</span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-[#4E6B56]">
                      {c.prepaidSessions > 0 ? `${c.prepaidSessions} buổi` : '0'}
                    </td>
                    <td className="max-w-xs p-3.5">
                      {c.safetyFlags.length > 0 || c.medicalNotes ? (
                        <div className="space-y-1">
                          {c.safetyFlags.map((flag) => (
                            <span
                              key={flag}
                              className="mr-1 inline-block rounded-md border border-[#B85D38]/30 bg-[#FDECEC] px-1.5 py-0.5 text-[10px] font-bold text-[#B85D38]"
                            >
                              ⚠️ {flag}
                            </span>
                          ))}
                          {c.medicalNotes && (
                            <div className="line-clamp-1 text-[11px] text-[#635B54] italic">
                              {c.medicalNotes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#8C827A]">An toàn</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoadingDetail}
                          onClick={() => handleViewDetail(c.id)}
                        >
                          Chi Tiết
                        </Button>
                        {c.debtBalanceVnd > 0 && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setDebtModalCustomer(c);
                              setDebtPaymentAmount(c.debtBalanceVnd);
                            }}
                          >
                            Thu Nợ
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

      {/* 3. Modal Xem Chi Tiết Khách Hàng (Hồ sơ CRM Đầy Đủ) */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-[#D4B996] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <div>
                <CardTitle className="font-serif text-xl text-[#1F2B24]">
                  Hồ Sơ Sức Khỏe & Trị Liệu: {selectedCustomer.name}
                </CardTitle>
                <div className="text-xs text-[#8C827A]">
                  Email: {selectedCustomer.email} • SĐT: {selectedCustomer.phone || 'Chưa có'} •
                  Hạng: <strong>{selectedCustomer.loyaltyTier}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-6">
              {/* Thẻ tài chính */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#E2D9CC] bg-white p-3 text-center">
                  <div className="text-xs text-[#8C827A]">Tổng Chi Tiêu</div>
                  <div className="text-sm font-bold text-[#1F2B24]">
                    {formatCurrencyVND(selectedCustomer.totalSpentVnd)}
                  </div>
                </div>
                <div className="rounded-xl border border-[#E2D9CC] bg-white p-3 text-center">
                  <div className="text-xs text-[#8C827A]">Công Nợ Còn Lại</div>
                  <div
                    className={`text-sm font-bold ${selectedCustomer.debtBalanceVnd > 0 ? 'text-red-600' : 'text-[#4E6B56]'}`}
                  >
                    {formatCurrencyVND(selectedCustomer.debtBalanceVnd)}
                  </div>
                </div>
                <div className="rounded-xl border border-[#E2D9CC] bg-white p-3 text-center">
                  <div className="text-xs text-[#8C827A]">Buổi Trả Trước</div>
                  <div className="text-sm font-bold text-[#4E6B56]">
                    {selectedCustomer.prepaidSessions} buổi
                  </div>
                </div>
              </div>

              {/* Cảnh báo y tế */}
              <div className="rounded-xl border border-[#B85D38]/30 bg-[#FDECEC]/60 p-3">
                <div className="text-xs font-bold text-[#B85D38] uppercase">
                  Lưu ý an toàn y khoa:
                </div>
                <div className="mt-1 text-sm text-[#2B2622]">
                  {selectedCustomer.medicalNotes ||
                    (selectedCustomer.safetyFlags.length > 0
                      ? selectedCustomer.safetyFlags.join(', ')
                      : 'Khách hàng có thể trạng bình thường, không ghi nhận dị ứng đặc biệt.')}
                </div>
              </div>

              {/* Lịch sử lịch hẹn */}
              <div>
                <h4 className="mb-2 font-serif text-sm font-bold text-[#1F2B24]">
                  Lịch Sử Các Buổi Trị Liệu
                </h4>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {selectedCustomer.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-xl border border-[#E2D9CC] bg-white p-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#1F2B24]">{apt.serviceName}</div>
                        <div className="text-[#8C827A]">
                          KTV: {apt.therapistName} • {apt.room}
                        </div>
                        {apt.notes && <div className="text-[#635B54] italic">{apt.notes}</div>}
                      </div>
                      <div className="text-right">
                        <div>{new Date(apt.startAt).toLocaleDateString('vi-VN')}</div>
                        <Badge variant="success">{apt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lịch sử hóa đơn */}
              <div>
                <h4 className="mb-2 font-serif text-sm font-bold text-[#1F2B24]">
                  Lịch Sử Hóa Đơn & Thu Phí
                </h4>
                <div className="max-h-36 space-y-1.5 overflow-y-auto">
                  {selectedCustomer.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border border-[#E2D9CC] bg-white px-3 py-2 text-xs"
                    >
                      <span className="font-mono font-bold text-[#1F2B24]">{inv.code}</span>
                      <span className="font-bold">{formatCurrencyVND(inv.finalVnd)}</span>
                      <span className="text-[#8C827A]">{inv.paymentMethod}</span>
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'terracotta'}>
                        {inv.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. Modal Thu Hồi Công Nợ */}
      {debtModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-[#D4B996] bg-[#FAF7F2] p-6 shadow-2xl">
            <CardTitle className="font-serif text-xl text-[#1F2B24]">
              Thu Hồi Công Nợ Khách Hàng
            </CardTitle>
            <div className="mt-1 text-xs text-[#8C827A]">
              Khách hàng: <strong>{debtModalCustomer.name}</strong> • Số dư nợ:{' '}
              <strong className="font-mono text-red-600">
                {formatCurrencyVND(debtModalCustomer.debtBalanceVnd)}
              </strong>
            </div>

            <form onSubmit={handleSettleDebt} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Số tiền thu (VND):
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={debtModalCustomer.debtBalanceVnd}
                  value={debtPaymentAmount}
                  onChange={(e) => setDebtPaymentAmount(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 font-mono text-sm font-bold text-[#1F2B24] outline-hidden focus:border-[#4E6B56]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Ghi chú thu nợ:
                </label>
                <input
                  type="text"
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  placeholder="Khách chuyển khoản VietQR hoặc nộp tiền mặt..."
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDebtModalCustomer(null)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingDebt}>
                  {isSubmittingDebt ? 'Đang ghi sổ...' : 'Xác Nhận Thu Nợ'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
