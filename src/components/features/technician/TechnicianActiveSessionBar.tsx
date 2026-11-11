'use client';

import * as React from 'react';
import { Button, Badge } from '@/components/ui';
import {
  transitionAppointmentStatusAction,
  type TechnicianMobileAppointment,
} from '@/application/therapist/actions';

interface Props {
  appointment: TechnicianMobileAppointment;
  onStatusChanged: () => Promise<void>;
  onOpenClinicalNotes: (appointment: TechnicianMobileAppointment) => void;
  onOpenUpsell: (appointment: TechnicianMobileAppointment) => void;
}

export function TechnicianActiveSessionBar({
  appointment,
  onStatusChanged,
  onOpenClinicalNotes,
  onOpenUpsell,
}: Props) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  // Bộ đếm thời gian khi phiên đang IN_PROGRESS
  React.useEffect(() => {
    if (appointment.status !== 'IN_PROGRESS') {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [appointment.status]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleNextStep = async () => {
    setIsUpdating(true);

    if (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') {
      // Bước 1: Nhận khách
      await transitionAppointmentStatusAction(appointment.id, 'CHECKED_IN');
      await onStatusChanged();
    } else if (appointment.status === 'CHECKED_IN') {
      // Bước 2: Bắt đầu làm
      await transitionAppointmentStatusAction(appointment.id, 'IN_PROGRESS');
      await onStatusChanged();
    } else if (appointment.status === 'IN_PROGRESS') {
      // Bước 3: Hoàn thành -> Mở form ghi chép lâm sàng & chốt phiên
      onOpenClinicalNotes(appointment);
    }

    setIsUpdating(false);
  };

  const hasAllergies = appointment.safetyFlags.length > 0 || Boolean(appointment.medicalNotes);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 shadow-md transition-all ${
        appointment.status === 'IN_PROGRESS'
          ? 'border-[#10B981] bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] text-[#065F46] ring-2 ring-[#10B981]/30'
          : appointment.status === 'CHECKED_IN'
            ? 'border-[#9333EA] bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] text-[#6B21A8]'
            : 'border-[#E2D9CC] bg-white text-[#2B2622]'
      }`}
    >
      {/* Thanh trạng thái đầu card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              appointment.status === 'IN_PROGRESS'
                ? 'animate-ping bg-[#10B981]'
                : appointment.status === 'CHECKED_IN'
                  ? 'bg-[#9333EA]'
                  : 'bg-[#D4AF37]'
            }`}
          />
          <span className="text-xs font-bold tracking-wider uppercase">
            {appointment.status === 'IN_PROGRESS'
              ? '⚡ ĐANG TRỊ LIỆU TẠI BUỒNG'
              : appointment.status === 'CHECKED_IN'
                ? '🔔 ĐÃ ĐÓN KHÁCH VÀO PHÒNG'
                : 'LỊCH SẮP DIỄN RA'}
          </span>
        </div>

        <Badge
          variant={
            appointment.status === 'IN_PROGRESS'
              ? 'success'
              : appointment.status === 'CHECKED_IN'
                ? 'primary'
                : 'outline'
          }
        >
          {appointment.room}
        </Badge>
      </div>

      {/* Thông tin khách hàng & Dịch vụ */}
      <div className="mt-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-[#1F2B24]">
              {appointment.customerName}
            </h3>
            <Badge variant="warning">{appointment.customerLoyaltyTier}</Badge>
          </div>
          <div className="mt-0.5 text-xs text-[#635B54]">
            {appointment.serviceName} • <strong>{appointment.durationMin} phút</strong>
          </div>
        </div>

        {appointment.status === 'IN_PROGRESS' && (
          <div className="rounded-xl border border-[#10B981]/40 bg-white/80 px-3 py-1.5 text-right backdrop-blur-xs">
            <div className="text-[10px] font-semibold text-[#065F46] uppercase">Thời gian</div>
            <div className="font-mono text-lg font-bold text-[#065F46]">
              {formatTimer(elapsedSeconds)}
            </div>
          </div>
        )}
      </div>

      {/* Cảnh báo an toàn y khoa / Dị ứng */}
      {hasAllergies && (
        <div className="mt-3 rounded-xl border border-red-300 bg-red-50/80 p-2.5 text-xs text-red-900">
          <div className="flex items-center gap-1 font-bold">
            <span>⚠️</span> LƯU Ý DỊ ỨNG & THỂ TRẠNG:
          </div>
          <div className="mt-0.5">
            {appointment.medicalNotes || appointment.safetyFlags.join(', ')}
          </div>
        </div>
      )}

      {/* Nút thao tác một chạm (One-tap Actions) */}
      <div className="mt-4 flex items-center gap-2">
        <Button
          variant="primary"
          onClick={handleNextStep}
          disabled={isUpdating}
          className={`flex-1 py-3 text-sm font-bold shadow-md transition-all active:scale-95 ${
            appointment.status === 'IN_PROGRESS'
              ? 'bg-[#10B981] hover:bg-[#059669]'
              : appointment.status === 'CHECKED_IN'
                ? 'bg-[#9333EA] hover:bg-[#7E22CE]'
                : 'bg-[#405C4E]'
          }`}
        >
          {isUpdating
            ? 'Đang xử lý...'
            : appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
              ? '👉 Nhận Khách Vào Phòng'
              : appointment.status === 'CHECKED_IN'
                ? '▶️ Bắt Đầu Làm (Bật Đồng Hồ)'
                : '✓ Hoàn Thành Liệu Trình'}
        </Button>

        {/* Nút thêm nhanh sản phẩm bán chéo trong buồng */}
        <Button
          variant="outline"
          onClick={() => onOpenUpsell(appointment)}
          className="border-[#D4AF37] bg-white py-3 font-semibold text-[#92400E] hover:bg-[#FEF5E7] active:scale-95"
        >
          🛍️ Bán Thêm (+15%)
        </Button>
      </div>
    </div>
  );
}
