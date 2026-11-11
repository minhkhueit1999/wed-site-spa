'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import {
  getTechnicianEarningsAction,
  type TechnicianEarningsMobileData,
} from '@/application/therapist/actions';
import { formatCurrencyVND } from '@/lib/utils';

export function TechnicianEarningsWalletView() {
  const [earnings, setEarnings] = React.useState<TechnicianEarningsMobileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await getTechnicianEarningsAction();
    if (res.ok) {
      setEarnings(res.value);
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
      <div className="p-8 text-center text-xs text-[#8C827A]">
        Đang đối soát ví hoa hồng và lương tháng...
      </div>
    );
  }

  if (errorMsg || !earnings) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-700">
        {errorMsg || 'Không thể tải ví thu nhập.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Thẻ Ví Thu Nhập Tổng Thể (Gold Luxury Card) */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/60 bg-gradient-to-br from-[#1F2B24] via-[#2A3B31] to-[#1F2B24] p-6 text-white shadow-xl">
        {/* Nền hoa văn mộc */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-2xl filter" />

        <div className="flex items-center justify-between text-xs text-[#E2D9CC]">
          <span>VÍ THU NHẬP THÁNG {earnings.month}</span>
          <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/20 px-2.5 py-0.5 font-bold text-[#D4AF37]">
            Hạng: {earnings.tierLevel}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-[11px] tracking-wider text-[#A6B2A8] uppercase">
            Tạm tính thực nhận tháng này
          </div>
          <div className="mt-0.5 font-mono text-3xl font-bold tracking-tight text-white">
            {formatCurrencyVND(earnings.totalEarningsVnd)}
          </div>
        </div>

        {/* 4 Chỉ số con trong thẻ */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
          <div>
            <div className="text-[10px] text-[#A6B2A8]">Lương cơ bản:</div>
            <div className="font-mono font-bold text-[#E2D9CC]">
              {formatCurrencyVND(earnings.baseSalaryVnd)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#A6B2A8]">
              Thù lao ca ({earnings.completedSessionsMonth} buổi):
            </div>
            <div className="font-mono font-bold text-[#4ADE80]">
              +{formatCurrencyVND(earnings.sessionAllowanceVnd)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#A6B2A8]">Hoa hồng bán chéo (15%):</div>
            <div className="font-mono font-bold text-[#FBBF24]">
              +{formatCurrencyVND(earnings.upsellCommissionVnd)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#A6B2A8]">Tiền tip từ khách:</div>
            <div className="font-mono font-bold text-[#E2D9CC]">
              +{formatCurrencyVND(earnings.tipAmountVnd)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Danh sách các khoản cộng dồn gần nhất */}
      <div className="rounded-2xl border border-[#E2D9CC] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2D9CC]/60 pb-2.5">
          <h3 className="font-serif text-sm font-bold text-[#1F2B24]">
            Lịch Sử Ghi Nhận Hoa Hồng Gần Nhất
          </h3>
          <Button size="sm" variant="outline" onClick={loadData} className="h-7 text-xs">
            🔄
          </Button>
        </div>

        <div className="mt-3 divide-y divide-[#E2D9CC]/50">
          {earnings.recentCommissions.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
              <div className="max-w-[70%]">
                <div className="truncate font-medium text-[#1F2B24]">{item.description}</div>
                <div className="text-[10px] text-[#8C827A]">
                  {new Date(item.date).toLocaleString('vi-VN')}
                </div>
              </div>
              <div
                className={`font-mono text-xs font-bold ${
                  item.type === 'UPSELL'
                    ? 'text-[#B85D38]'
                    : item.type === 'SESSION'
                      ? 'text-[#4E6B56]'
                      : 'text-[#1F2B24]'
                }`}
              >
                +{formatCurrencyVND(item.amountVnd)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
