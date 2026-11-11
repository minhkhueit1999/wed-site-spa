'use client';

import * as React from 'react';
import { Button, Card, Badge } from '@/components/ui';
import {
  getAnalyticsDashboardAction,
  type AnalyticsDashboardData,
} from '@/application/admin/actions';
import { formatCurrencyVND } from '@/lib/utils';

export function AdminAnalyticsView() {
  const [data, setData] = React.useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await getAnalyticsDashboardAction();
    if (res.ok) {
      setData(res.value);
    } else {
      setErrorMsg(res.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-[#8C827A]">
        Đang tổng hợp báo cáo kinh doanh và kết xuất KPI...
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {errorMsg || 'Không thể tải báo cáo analytics.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2D9CC] bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2B24]">
            Báo Cáo Doanh Thu, Tỷ Lệ Lấp Đầy & Hiệu Suất KPI
          </h2>
          <p className="text-sm text-[#635B54]">
            Dữ liệu tổng hợp từ các giao dịch thanh toán thực tế, lượt booking và năng suất làm việc
            của nhân sự.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={loadData}>
          🔄 Cập Nhật Số Liệu
        </Button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu tháng */}
        <Card className="border-[#D4AF37]/50 bg-gradient-to-br from-[#FAF7F2] to-[#F5ECE1] p-5 shadow-xs">
          <div className="text-xs font-semibold tracking-wider text-[#8C827A] uppercase">
            Doanh Thu Tháng Này
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#1F2B24]">
            {formatCurrencyVND(data.monthRevenueVnd)}
          </div>
          <div className="mt-1 text-xs font-semibold text-[#4E6B56]">
            ✓ Đã chốt hóa đơn thành công
          </div>
        </Card>

        {/* Tổng doanh thu */}
        <Card className="border-[#E2D9CC] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold tracking-wider text-[#8C827A] uppercase">
            Doanh Thu Lũy Kế
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#1F2B24]">
            {formatCurrencyVND(data.totalRevenueVnd)}
          </div>
          <div className="mt-1 text-xs text-[#635B54]">Tổng từ khi mở cơ sở</div>
        </Card>

        {/* Tỷ lệ lấp đầy */}
        <Card className="border-[#E2D9CC] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold tracking-wider text-[#8C827A] uppercase">
            Tỷ Lệ Lấp Đầy Buồng (Occupancy)
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#4E6B56]">
            {data.occupancyRatePercent}%
          </div>
          <div className="mt-1 text-xs text-[#635B54]">
            {data.totalAppointments} lượt booking ghi nhận
          </div>
        </Card>

        {/* Công nợ tồn đọng */}
        <Card className="border-red-200 bg-red-50/40 p-5 shadow-xs">
          <div className="text-xs font-semibold tracking-wider text-[#B85D38] uppercase">
            Công Nợ Tồn Đọng Cần Thu
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-red-600">
            {formatCurrencyVND(data.totalDebtOutstandingVnd)}
          </div>
          <div className="mt-1 text-xs text-[#8C827A]">{data.totalCustomers} hồ sơ khách hàng</div>
        </Card>
      </div>

      {/* 3. Bảng Xếp Hạng KPI Nhân Viên (Leaderboard) */}
      <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
        <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
          Bảng Xếp Hạng Năng Suất & KPI Kỹ Thuật Viên
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2B2622]">
            <thead className="bg-[#FAF7F2] text-xs text-[#8C827A] uppercase">
              <tr>
                <th className="p-3.5">Thứ Hạng</th>
                <th className="p-3.5">Kỹ Thuật Viên</th>
                <th className="p-3.5">Vai Trò</th>
                <th className="p-3.5">Số Buổi Hoàn Thành</th>
                <th className="p-3.5">Doanh Số Bán Chéo (Upsell)</th>
                <th className="p-3.5">Hoa Hồng KTV Nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9CC]/60">
              {data.staffKpis
                .sort((a, b) => b.completedSessions - a.completedSessions)
                .map((staff, idx) => (
                  <tr key={staff.staffId} className="hover:bg-[#FAF7F2]/40">
                    <td className="p-3.5 font-bold">
                      {idx === 0
                        ? '🥇 #1'
                        : idx === 1
                          ? '🥈 #2'
                          : idx === 2
                            ? '🥉 #3'
                            : `#${idx + 1}`}
                    </td>
                    <td className="p-3.5 font-bold text-[#1F2B24]">{staff.staffName}</td>
                    <td className="p-3.5">
                      <Badge variant="primary">{staff.role}</Badge>
                    </td>
                    <td className="p-3.5 font-bold text-[#4E6B56]">
                      {staff.completedSessions} ca trị liệu
                    </td>
                    <td className="p-3.5 font-mono text-xs font-semibold">
                      {formatCurrencyVND(staff.upsellRevenueVnd)}
                    </td>
                    <td className="p-3.5 font-mono text-xs font-bold text-[#B85D38]">
                      +{formatCurrencyVND(staff.upsellCommissionVnd)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Top Dịch Vụ & Top Sản Phẩm */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Dịch vụ */}
        <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
          <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
            Top 5 Gói Dịch Vụ Được Đặt Nhiều Nhất
          </div>
          <div className="space-y-3 p-4">
            {data.topServices.map((service, idx) => (
              <div
                key={service.slug}
                className="flex items-center justify-between rounded-xl border border-[#E2D9CC]/60 bg-[#FAF7F2]/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1F2B24] text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-[#1F2B24]">{service.name}</div>
                    <div className="text-xs text-[#8C827A]">
                      {service.bookingCount} lượt khách hoàn thành
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-[#4E6B56]">
                  {formatCurrencyVND(service.revenueVnd)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sản phẩm */}
        <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
          <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
            Top 5 Mỹ Phẩm Bán Chạy Nhất (Toa & Bán Chéo)
          </div>
          <div className="space-y-3 p-4">
            {data.topProducts.length > 0 ? (
              data.topProducts.map((product, idx) => (
                <div
                  key={product.slug}
                  className="flex items-center justify-between rounded-xl border border-[#E2D9CC]/60 bg-[#FAF7F2]/60 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B85D38] text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-[#1F2B24]">{product.name}</div>
                      <div className="text-xs text-[#8C827A]">
                        Đã bán: {product.salesCount} sản phẩm
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#1F2B24]">
                    {formatCurrencyVND(product.revenueVnd)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#8C827A]">
                Chưa có dữ liệu sản phẩm xuất kho qua hóa đơn.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
