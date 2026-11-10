'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button, Card, CardTitle, CardDescription, Badge } from '@/components/ui';
import {
  getTherapistScheduleAction,
  TherapistAppointmentItem,
} from '@/application/therapist/actions';

export default function KyThuatVienPage() {
  const router = useRouter();
  const [appointments, setAppointments] = React.useState<TherapistAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'pending_log' | 'completed'>('all');

  React.useEffect(() => {
    async function loadSchedule() {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await getTherapistScheduleAction();
      if (res.ok) {
        setAppointments(res.value);
      } else {
        setErrorMsg(res.error);
      }
      setIsLoading(false);
    }

    loadSchedule();
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'pending_log') return !apt.hasSessionLog;
    if (filter === 'completed') return apt.hasSessionLog || apt.status === 'COMPLETED';
    return true;
  });

  const pendingCount = appointments.filter((a) => !a.hasSessionLog).length;
  const completedCount = appointments.filter(
    (a) => a.hasSessionLog || a.status === 'COMPLETED',
  ).length;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-xl bg-[#E2D9CC]" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="h-24 rounded-2xl bg-[#E2D9CC]" />
              <div className="h-24 rounded-2xl bg-[#E2D9CC]" />
              <div className="h-24 rounded-2xl bg-[#E2D9CC]" />
            </div>
            <div className="h-64 rounded-2xl bg-[#E2D9CC]" />
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {/* Tiêu đề & Tổng quan thống kê */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#E2D9CC] pb-6 sm:flex-row sm:items-center">
          <div>
            <Badge variant="terracotta">Bảng điều khiển chuyên môn</Badge>
            <h1 className="mt-2 font-serif text-3xl font-bold text-[#2B2622] sm:text-4xl">
              Lịch Trị Liệu & Hồ Sơ Khách Hàng
            </h1>
            <p className="text-sm text-[#635B54]">
              Theo dõi lịch hẹn, ghi nhận SessionLog và chỉ định toa chăm sóc tại nhà.
            </p>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-[#E2D9CC] bg-white p-5">
            <span className="text-xs font-semibold tracking-wider text-[#635B54] uppercase">
              Tổng số buổi phân công
            </span>
            <div className="mt-1 font-serif text-3xl font-bold text-[#2B2622]">
              {appointments.length}
            </div>
          </Card>
          <Card className="border-[#E2D9CC] bg-white p-5">
            <span className="text-xs font-semibold tracking-wider text-[#964F3D] uppercase">
              Cần cập nhật nhật ký
            </span>
            <div className="mt-1 font-serif text-3xl font-bold text-[#964F3D]">{pendingCount}</div>
          </Card>
          <Card className="border-[#E2D9CC] bg-white p-5">
            <span className="text-xs font-semibold tracking-wider text-[#405C4E] uppercase">
              Đã hoàn tất nhật ký
            </span>
            <div className="mt-1 font-serif text-3xl font-bold text-[#405C4E]">
              {completedCount}
            </div>
          </Card>
        </div>

        {/* Bộ lọc */}
        <div className="mb-6 flex gap-2 border-b border-[#E2D9CC] pb-3 text-sm">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              filter === 'all' ? 'bg-[#405C4E] text-[#FAF7F2]' : 'text-[#635B54] hover:bg-[#F3EDE3]'
            }`}
          >
            Tất cả ({appointments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending_log')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
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
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
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
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <Card
                key={apt.id}
                className="border-[#E2D9CC] bg-white p-5 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-lg font-bold text-[#2B2622]">
                        {new Date(apt.startAt).toLocaleString('vi-VN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {apt.safetyFlagsCount > 0 && (
                        <span className="rounded-full bg-[#FBF0EE] px-2.5 py-0.5 text-xs font-semibold text-[#964F3D]">
                          ⚠️ {apt.safetyFlagsCount} cờ an toàn
                        </span>
                      )}
                      <Badge variant={apt.hasSessionLog ? 'success' : 'warning'}>
                        {apt.hasSessionLog ? 'Đã có nhật ký' : 'Chờ ghi nhật ký'}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm font-medium text-[#2B2622]">
                      Khách hàng: <strong className="text-[#405C4E]">{apt.customerName}</strong> (
                      {apt.customerEmail})
                    </p>
                    <p className="text-xs text-[#635B54]">
                      Dịch vụ: <strong>{apt.serviceName}</strong> • Trạng thái phác đồ:{' '}
                      {apt.planState}
                    </p>
                  </div>

                  <div>
                    <Button
                      variant={apt.hasSessionLog ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => router.push(`/ky-thuat-vien/khach/${apt.id}`)}
                    >
                      {apt.hasSessionLog ? 'Xem / Sửa nhật ký' : 'Mở hồ sơ & Ghi nhật ký →'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
