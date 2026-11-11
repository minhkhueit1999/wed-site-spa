'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button, Card, CardTitle, CardDescription, Badge } from '@/components/ui';
import {
  getTherapistScheduleAction,
  getTechnicianMobileScheduleAction,
  type TherapistAppointmentItem,
  type TechnicianScheduleMobileData,
  type TechnicianMobileAppointment,
} from '@/application/therapist/actions';
import { TechnicianActiveSessionBar } from '@/components/features/technician/TechnicianActiveSessionBar';
import { TechnicianClinicalNotesSheet } from '@/components/features/technician/TechnicianClinicalNotesSheet';
import { TechnicianUpsellSheet } from '@/components/features/technician/TechnicianUpsellSheet';
import { TechnicianEarningsWalletView } from '@/components/features/technician/TechnicianEarningsWalletView';
import { TechnicianShiftRequestSheet } from '@/components/features/technician/TechnicianShiftRequestSheet';
import { formatCurrencyVND } from '@/lib/utils';

type MobileTab = 'schedule' | 'wallet' | 'requests';

export default function KyThuatVienPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<MobileTab>('schedule');
  const [appointments, setAppointments] = React.useState<TherapistAppointmentItem[]>([]);
  const [mobileData, setMobileData] = React.useState<TechnicianScheduleMobileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'pending_log' | 'completed'>('all');

  // Real-time notification banner
  const [liveAlert, setLiveAlert] = React.useState<string | null>(null);

  // Modal sheets
  const [activeNotesApt, setActiveNotesApt] = React.useState<TechnicianMobileAppointment | null>(
    null,
  );
  const [activeUpsellApt, setActiveUpsellApt] = React.useState<TechnicianMobileAppointment | null>(
    null,
  );
  const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string | null>(null);

  const loadAllData = React.useCallback(async () => {
    try {
      const schedPromise =
        typeof getTherapistScheduleAction === 'function'
          ? getTherapistScheduleAction()
          : Promise.resolve({ ok: true as const, value: [] as TherapistAppointmentItem[] });

      const mobPromise =
        typeof getTechnicianMobileScheduleAction === 'function'
          ? getTechnicianMobileScheduleAction()
          : Promise.resolve({ ok: false as const, error: 'Mobile schedule not mocked' });

      const [schedRes, mobRes] = await Promise.all([schedPromise, mobPromise]);

      if (schedRes.ok) {
        setAppointments(schedRes.value);
      } else {
        setErrorMsg(schedRes.error);
      }

      if (mobRes.ok) {
        setMobileData(mobRes.value);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải lịch';
      setErrorMsg(msg);
    }

    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Real-time Polling mechanism cho KTV (10s)
  React.useEffect(() => {
    let lastPoll = new Date(Date.now() - 30 * 1000).toISOString();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/technician/notifications?since=${encodeURIComponent(lastPoll)}`,
        );
        if (res.ok) {
          const data = await res.json();
          lastPoll = data.serverTime || new Date().toISOString();

          if (data.notifications && data.notifications.length > 0) {
            const latest = data.notifications[0];
            setLiveAlert(latest.message);

            // Rung phản hồi xúc giác trên thiết bị di động nếu hỗ trợ
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([100, 50, 100]);
            }

            // Tự động làm mới dữ liệu lịch
            await loadAllData();
          }
        }
      } catch {
        // im lặng bỏ qua khi mất mạng
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loadAllData]);

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'pending_log') return !apt.hasSessionLog;
    if (filter === 'completed') return apt.hasSessionLog || apt.status === 'COMPLETED';
    return true;
  });

  const pendingCount = appointments.filter((a) => !a.hasSessionLog).length;
  const completedCount = appointments.filter(
    (a) => a.hasSessionLog || a.status === 'COMPLETED',
  ).length;

  // Lấy lịch hẹn đang diễn ra hoặc đã nhận khách để đưa lên đầu
  const activeSessionApt = mobileData?.appointments.find(
    (a) => a.status === 'IN_PROGRESS' || a.status === 'CHECKED_IN',
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-xl bg-[#E2D9CC]" />
            <div className="h-28 rounded-2xl bg-[#E2D9CC]" />
            <div className="h-44 rounded-2xl bg-[#E2D9CC]" />
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16 text-center">
          <Card className="border-[#D4B996] p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8DDD0] text-2xl">
              🔒
            </div>
            <CardTitle className="font-serif text-2xl text-[#2B2622]">
              Khu vực Kỹ thuật viên
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-[#635B54]">{errorMsg}</CardDescription>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => router.push('/dang-nhap?callbackUrl=/ky-thuat-vien')}
              >
                Đăng nhập tài khoản Kỹ thuật viên
              </Button>
            </div>
          </Card>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {/* Banner Thông Báo Real-time Đẩy Về Điện Thoại */}
        {liveAlert && (
          <div className="animate-in slide-in-from-top mb-4 flex items-center justify-between rounded-2xl border border-[#D4AF37] bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] p-3.5 text-xs text-[#92400E] shadow-md duration-300">
            <div className="flex items-center gap-2 font-bold">
              <span className="animate-bounce text-base">🔔</span>
              <span>{liveAlert}</span>
            </div>
            <button
              onClick={() => setLiveAlert(null)}
              className="p-1 font-bold text-[#92400E]/70 hover:text-[#92400E]"
            >
              ✕
            </button>
          </div>
        )}

        {actionSuccessMsg && (
          <div className="mb-4 rounded-xl border border-[#10B981]/40 bg-[#ECFDF5] p-3 text-xs font-bold text-[#065F46]">
            {actionSuccessMsg}
          </div>
        )}

        {/* Header di động & Chào hỏi KTV */}
        <div className="mb-6 flex flex-col justify-between gap-3 border-b border-[#E2D9CC] pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="terracotta">Kỹ thuật viên trị liệu</Badge>
              {mobileData?.todayShift && (
                <span className="text-xs font-semibold text-[#405C4E]">
                  • Ca: {mobileData.todayShift.shiftType} ({mobileData.todayShift.startTime} -{' '}
                  {mobileData.todayShift.endTime})
                </span>
              )}
            </div>
            <h1 className="mt-1.5 font-serif text-2xl font-bold text-[#2B2622] sm:text-3xl">
              Lịch Trị Liệu & Hồ Sơ Khách Hàng
            </h1>
            <p className="text-xs text-[#635B54]">
              Theo dõi lịch hẹn, ghi nhận SessionLog và chỉ định toa chăm sóc tại nhà.
            </p>
          </div>

          {/* Thanh chuyển tab mobile (Bottom / Top App Bar) */}
          <div className="flex rounded-xl border border-[#E2D9CC] bg-white p-1 shadow-2xs">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-[#1F2B24] text-white shadow-xs'
                  : 'text-[#635B54] hover:text-[#1F2B24]'
              }`}
            >
              📅 Lịch Hôm Nay
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'wallet'
                  ? 'bg-[#1F2B24] text-white shadow-xs'
                  : 'text-[#635B54] hover:text-[#1F2B24]'
              }`}
            >
              💰 Ví Thu Nhập
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'requests'
                  ? 'bg-[#1F2B24] text-white shadow-xs'
                  : 'text-[#635B54] hover:text-[#1F2B24]'
              }`}
            >
              📝 Đơn Ca
            </button>
          </div>
        </div>

        {/* ================= TAB 1: LỊCH HÔM NAY ================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* 1. Phiên Trị Liệu Trọng Tâm (Active Session Card) */}
            {activeSessionApt && (
              <div className="mb-4">
                <TechnicianActiveSessionBar
                  appointment={activeSessionApt}
                  onStatusChanged={loadAllData}
                  onOpenClinicalNotes={(apt) => setActiveNotesApt(apt)}
                  onOpenUpsell={(apt) => setActiveUpsellApt(apt)}
                />
              </div>
            )}

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <Card className="border-[#E2D9CC] bg-white p-3 text-center sm:p-5">
                <span className="text-[10px] font-semibold tracking-wider text-[#635B54] uppercase sm:text-xs">
                  Tổng số buổi
                </span>
                <div className="mt-1 font-serif text-xl font-bold text-[#2B2622] sm:text-3xl">
                  {appointments.length}
                </div>
              </Card>
              <Card className="border-[#E2D9CC] bg-white p-3 text-center sm:p-5">
                <span className="text-[10px] font-semibold tracking-wider text-[#964F3D] uppercase sm:text-xs">
                  Cần ghi nhật ký
                </span>
                <div className="mt-1 font-serif text-xl font-bold text-[#964F3D] sm:text-3xl">
                  {pendingCount}
                </div>
              </Card>
              <Card className="border-[#E2D9CC] bg-white p-3 text-center sm:p-5">
                <span className="text-[10px] font-semibold tracking-wider text-[#405C4E] uppercase sm:text-xs">
                  Đã hoàn tất
                </span>
                <div className="mt-1 font-serif text-xl font-bold text-[#405C4E] sm:text-3xl">
                  {completedCount}
                </div>
              </Card>
            </div>

            {/* Bộ lọc */}
            <div className="flex gap-1.5 border-b border-[#E2D9CC] pb-3 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#405C4E] text-[#FAF7F2]'
                    : 'text-[#635B54] hover:bg-[#F3EDE3]'
                }`}
              >
                Tất cả ({appointments.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending_log')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filter === 'pending_log'
                    ? 'bg-[#405C4E] text-[#FAF7F2]'
                    : 'text-[#635B54] hover:bg-[#F3EDE3]'
                }`}
              >
                Chưa ghi nhật ký ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-[#405C4E] text-[#FAF7F2]'
                    : 'text-[#635B54] hover:bg-[#F3EDE3]'
                }`}
              >
                Đã hoàn tất ({completedCount})
              </button>
            </div>

            {/* Danh sách lịch hẹn */}
            {filteredAppointments.length === 0 ? (
              <Card className="border-[#E2D9CC] p-8 text-center text-sm text-[#635B54]">
                Không có buổi hẹn nào trong danh sách này.
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((apt) => (
                  <Card
                    key={apt.id}
                    className="border-[#E2D9CC] bg-white p-4 transition-shadow hover:shadow-xs"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif text-base font-bold text-[#2B2622]">
                            {new Date(apt.startAt).toLocaleString('vi-VN', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {apt.safetyFlagsCount > 0 && (
                            <span className="rounded-full bg-[#FBF0EE] px-2 py-0.5 text-xs font-semibold text-[#964F3D]">
                              ⚠️ {apt.safetyFlagsCount} cờ an toàn
                            </span>
                          )}
                          <Badge
                            variant={
                              apt.status === 'COMPLETED'
                                ? 'success'
                                : apt.status === 'IN_PROGRESS'
                                  ? 'terracotta'
                                  : 'outline'
                            }
                          >
                            {apt.status}
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm font-medium text-[#2B2622]">
                          Khách hàng: <strong className="text-[#405C4E]">{apt.customerName}</strong>{' '}
                          ({apt.customerEmail})
                        </p>
                        <p className="text-xs text-[#635B54]">
                          Dịch vụ: <strong>{apt.serviceName}</strong> • Trạng thái phác đồ:{' '}
                          {apt.planState}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={apt.hasSessionLog ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => router.push(`/ky-thuat-vien/khach/${apt.id}`)}
                          className="text-xs"
                        >
                          {apt.hasSessionLog ? 'Xem / Sửa nhật ký' : 'Mở hồ sơ & Ghi nhật ký →'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: VÍ THU NHẬP ================= */}
        {activeTab === 'wallet' && <TechnicianEarningsWalletView />}

        {/* ================= TAB 3: ĐƠN CA ================= */}
        {activeTab === 'requests' && <TechnicianShiftRequestSheet />}

        {/* MODAL SHEET GHI CHÚ LÂM SÀNG */}
        {activeNotesApt && (
          <TechnicianClinicalNotesSheet
            appointment={activeNotesApt}
            onClose={() => setActiveNotesApt(null)}
            onSuccess={async () => {
              setActionSuccessMsg('Đã hoàn thành buổi trị liệu và ghi chép lâm sàng thành công!');
              setTimeout(() => setActionSuccessMsg(null), 4000);
              await loadAllData();
            }}
          />
        )}

        {/* MODAL SHEET BÁN CHÉO SẢN PHẨM */}
        {activeUpsellApt && (
          <TechnicianUpsellSheet
            appointment={activeUpsellApt}
            onClose={() => setActiveUpsellApt(null)}
            onSuccess={(name, earned) => {
              setActionSuccessMsg(
                `Đã thêm ${name} vào hóa đơn! Bạn nhận được +${formatCurrencyVND(earned)} hoa hồng.`,
              );
              setTimeout(() => setActionSuccessMsg(null), 5000);
              loadAllData();
            }}
          />
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
