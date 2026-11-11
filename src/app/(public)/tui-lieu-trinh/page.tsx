'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { useAuth } from '@/components/layout/AuthContext';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
} from '@/components/ui';
import { formatCurrencyVND } from '@/lib/utils';
import {
  getBookingDetailsAction,
  submitCareBundleBookingAction,
  BookingDetails,
} from '@/application/booking/actions';
import { ConfirmCareBundleResult } from '@/application/booking/confirmCareBundle';

function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userRole, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'ADMIN') {
        router.replace('/quan-tri');
      } else if (userRole === 'THERAPIST') {
        router.replace('/ky-thuat-vien');
      }
    }
  }, [isAuthenticated, userRole, router]);

  const serviceSlugParam = searchParams.get('serviceSlug') || 'thu-gian-sau';

  const [bookingData, setBookingData] = React.useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Form states
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    // Mặc định ngày mai
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]!;
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string>('09:30');
  const [selectedTherapistId, setSelectedTherapistId] = React.useState<string>('');

  // Guest inputs
  const [guestName, setGuestName] = React.useState('');
  const [guestEmail, setGuestEmail] = React.useState('');
  const [guestPhone, setGuestPhone] = React.useState('');

  // Health & Safety flags
  const [safetyFlags, setSafetyFlags] = React.useState<string[]>([]);
  const [healthConsent, setHealthConsent] = React.useState(false);

  // Submission & Confirmation
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [confirmation, setConfirmation] = React.useState<ConfirmCareBundleResult | null>(null);

  // Lấy dữ liệu phác đồ và sản phẩm
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setLoadError(null);

      const res = await getBookingDetailsAction(serviceSlugParam);
      if (res.ok) {
        setBookingData(res.value);
        if (res.value.currentUser) {
          setGuestName(res.value.currentUser.name);
          setGuestEmail(res.value.currentUser.email);
        }
      } else {
        setLoadError(res.error);
      }
      setIsLoading(false);
    }

    loadData();
  }, [serviceSlugParam]);

  // Danh sách các khung giờ khả dụng trong ngày
  const timeSlots = ['09:00', '10:30', '14:00', '15:30', '17:00', '18:30'];

  const toggleSafetyFlag = (flag: string) => {
    setSafetyFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData) return;

    if (!healthConsent) {
      setSubmitError('Vui lòng đồng ý cho phép xử lý dữ liệu trước khi xác nhận.');
      return;
    }

    if (!bookingData.currentUser && (!guestName.trim() || !guestEmail.trim())) {
      setSubmitError('Vui lòng nhập họ tên và email nhận thông báo lịch hẹn.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const startAtIso = new Date(`${selectedDate}T${selectedTimeSlot}:00`).toISOString();

    const res = await submitCareBundleBookingAction({
      serviceSlug: bookingData.service.slug,
      startAt: startAtIso,
      therapistId: selectedTherapistId ? selectedTherapistId : undefined,
      safetyFlags,
      guestInfo: !bookingData.currentUser
        ? {
            name: guestName.trim(),
            email: guestEmail.trim(),
            phone: guestPhone.trim(),
          }
        : undefined,
    });

    setIsSubmitting(false);

    if (res.ok) {
      setConfirmation(res.value);
    } else {
      setSubmitError(res.error);
    }
  };

  if (isAuthenticated && (userRole === 'ADMIN' || userRole === 'THERAPIST')) {
    return (
      <main className="mx-auto flex min-h-[400px] w-full max-w-2xl items-center justify-center px-6 py-16 text-center">
        <div className="rounded-2xl border border-[#4E6B56]/30 bg-[#E8EFE9] p-6 shadow-sm">
          <p className="font-serif text-lg font-bold text-[#1F2B24]">
            🌿 Khu vực dành riêng cho khách hàng
          </p>
          <p className="mt-2 text-xs text-[#635B54]">
            Đang chuyển hướng tài khoản nhân sự về không gian làm việc nội bộ...
          </p>
        </div>
      </main>
    );
  }

  // 1. Trạng thái Đang tải (Loading State)
  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-[#E2D9CC]" />
          <div className="h-12 w-96 rounded bg-[#E2D9CC]" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-64 rounded-2xl bg-[#E2D9CC] md:col-span-2" />
            <div className="h-64 rounded-2xl bg-[#E2D9CC]" />
          </div>
        </div>
      </main>
    );
  }

  // 2. Trạng thái Lỗi tải dữ liệu (Error State)
  if (loadError || !bookingData) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
        <Card className="border-[#D4B996] p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8DDD0] text-xl">
            ⚠️
          </div>
          <CardTitle className="font-serif text-2xl text-[#2B2622]">
            Không tìm thấy thông tin phác đồ
          </CardTitle>
          <CardDescription className="mt-2 text-[#635B54]">
            {loadError || 'Dịch vụ này có thể đã thay đổi hoặc không còn khả dụng.'}
          </CardDescription>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.push('/trieu-chung')}>
              Tìm theo triệu chứng
            </Button>
            <Button variant="primary" onClick={() => router.push('/tu-van')}>
              Làm trắc nghiệm
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // 3. Trạng thái Thành công (Success State)
  if (confirmation) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-12">
        <Card className="border-[#405C4E] bg-white p-6 shadow-md sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5EDE8] text-3xl">
              🌿
            </div>
            <Badge variant="success" className="mb-2">
              {confirmation.status === 'CONFIRMED'
                ? 'Đã xác nhận thành công'
                : 'Chờ chuyên viên duyệt'}
            </Badge>
            <h1 className="font-serif text-2xl font-bold text-[#2B2622] sm:text-3xl">
              {confirmation.status === 'CONFIRMED'
                ? 'Túi Liệu Trình Đã Được Đặt'
                : 'Tiếp Nhận Túi Liệu Trình'}
            </h1>
            <p className="mt-2 text-sm text-[#635B54]">{confirmation.message}</p>
          </div>

          <div className="mt-8 space-y-4 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-5">
            <div className="flex justify-between border-b border-[#E2D9CC] pb-3 text-sm">
              <span className="text-[#635B54]">Mã phác đồ:</span>
              <span className="font-mono font-semibold text-[#2B2622]">
                {confirmation.planId.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E2D9CC] pb-3 text-sm">
              <span className="text-[#635B54]">Dịch vụ trị liệu:</span>
              <span className="font-medium text-[#2B2622]">{confirmation.serviceName}</span>
            </div>
            <div className="flex justify-between border-b border-[#E2D9CC] pb-3 text-sm">
              <span className="text-[#635B54]">Thời gian buổi 1:</span>
              <span className="font-medium text-[#2B2622]">
                {new Date(confirmation.startAt).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E2D9CC] pb-3 text-sm">
              <span className="text-[#635B54]">Kỹ thuật viên phụ trách:</span>
              <span className="font-medium text-[#2B2622]">{confirmation.therapistName}</span>
            </div>
            <div>
              <span className="text-sm text-[#635B54]">Toa chăm sóc tại nhà đi kèm:</span>
              <ul className="mt-2 space-y-1">
                {confirmation.homeCareProducts.map((p) => (
                  <li key={p.slug} className="flex items-center text-sm font-medium text-[#405C4E]">
                    <span className="mr-2 text-xs">✔</span> {p.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between border-t border-[#E2D9CC] pt-3 text-sm font-semibold">
              <span className="text-[#2B2622]">Chi phí trọn gói (mô phỏng):</span>
              <span className="text-[#964F3D]">{formatCurrencyVND(confirmation.totalVnd)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-[#F3EDE3] p-4 text-xs text-[#635B54]">
            💡 <strong>Hướng dẫn trước khi đến spa:</strong> Quý khách vui lòng đến trước 10 phút.
            Toa dưỡng tại nhà sẽ được chuyên viên hướng dẫn chi tiết và trao tận tay sau buổi điều
            trị đầu tiên.
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              className="w-full flex-1"
              onClick={() => router.push('/tai-khoan')}
            >
              Xem lộ trình trong Tài khoản
            </Button>
            <Button variant="outline" className="w-full flex-1" onClick={() => router.push('/')}>
              Về trang chủ
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // 4. Màn hình Nhập liệu & Đặt Túi Liệu Trình (Form)
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/trieu-chung"
          className="text-xs font-semibold tracking-wider text-[#964F3D] uppercase hover:underline"
        >
          ← Xem các gói giải pháp khác
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#2B2622] sm:text-4xl">
          Túi Liệu Trình & Đặt Lịch Hẹn
        </h1>
        <p className="mt-1 text-sm text-[#635B54]">
          Xác nhận phác đồ dịch vụ tại spa cùng toa dưỡng tại nhà đi kèm trong một luồng duy nhất.
        </p>
      </div>

      <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cột trái: Cấu hình lịch hẹn & Thông tin cá nhân (2 cột trên desktop) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card: Lựa chọn thời gian và kỹ thuật viên */}
          <Card className="border-[#E2D9CC] bg-white p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="font-serif text-xl text-[#2B2622]">
                1. Thời gian & Kỹ thuật viên
              </CardTitle>
              <CardDescription className="text-xs text-[#635B54]">
                Chọn ngày và khung giờ bắt đầu buổi trị liệu đầu tiên.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-0 pb-0">
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-1 block text-sm font-medium text-[#2B2622]"
                >
                  Ngày hẹn
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-sm text-[#2B2622] focus:border-[#405C4E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2B2622]">
                  Khung giờ ({bookingData.service.durationMin} phút)
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`rounded-lg py-2 text-center text-sm font-medium transition-colors ${
                        selectedTimeSlot === slot
                          ? 'bg-[#405C4E] text-[#FAF7F2] shadow-sm'
                          : 'border border-[#E2D9CC] bg-[#F3EDE3] text-[#2B2622] hover:bg-[#EAE1D3]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="therapist-select"
                  className="mb-1 block text-sm font-medium text-[#2B2622]"
                >
                  Kỹ thuật viên phụ trách
                </label>
                <select
                  id="therapist-select"
                  value={selectedTherapistId}
                  onChange={(e) => setSelectedTherapistId(e.target.value)}
                  className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-sm text-[#2B2622] focus:border-[#405C4E] focus:outline-none"
                >
                  <option value="">-- Spa tự động phân bổ chuyên viên phù hợp --</option>
                  {bookingData.therapists.map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Card: Thông tin khách hàng */}
          <Card className="border-[#E2D9CC] bg-white p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="font-serif text-xl text-[#2B2622]">
                2. Thông tin khách hàng
              </CardTitle>
              <CardDescription className="text-xs text-[#635B54]">
                Hồ sơ phác đồ sẽ được lưu trữ đồng bộ và bảo mật.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-0 pb-0">
              {bookingData.currentUser ? (
                <div className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-sm">
                  <p className="font-medium text-[#2B2622]">
                    Đã đăng nhập: {bookingData.currentUser.name}
                  </p>
                  <p className="text-xs text-[#635B54]">{bookingData.currentUser.email}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Họ và tên"
                      placeholder="Nguyễn Văn A"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Email nhận xác nhận"
                      type="email"
                      placeholder="ban@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Số điện thoại"
                      type="tel"
                      placeholder="0912 345 678"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Rà soát cờ an toàn & Đồng ý */}
          <Card className="border-[#E2D9CC] bg-white p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="font-serif text-xl text-[#2B2622]">
                3. Rà soát an toàn thể trạng
              </CardTitle>
              <CardDescription className="text-xs text-[#635B54]">
                Giúp spa thẩm định liệu trình và điều chỉnh lực ấn, nguyên liệu phù hợp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-0 pb-0">
              {[
                { id: 'pregnant', label: 'Đang mang thai hoặc nghi ngờ có thai' },
                { id: 'allergy-essential-oil', label: 'Có tiền sử dị ứng tinh dầu hoặc phấn hoa' },
                {
                  id: 'open-wound-skin-infection',
                  label: 'Có vết thương hở, trầy xước vùng trị liệu',
                },
              ].map((flag) => (
                <label
                  key={flag.id}
                  className="flex cursor-pointer items-center space-x-3 rounded-lg border border-[#E2D9CC] bg-[#FAF7F2] p-3 text-sm text-[#2B2622] hover:bg-[#F3EDE3]"
                >
                  <input
                    type="checkbox"
                    checked={safetyFlags.includes(flag.id)}
                    onChange={() => toggleSafetyFlag(flag.id)}
                    className="h-4 w-4 rounded border-[#D4C8B8] text-[#405C4E] focus:ring-[#405C4E]"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}

              {safetyFlags.length > 0 && (
                <div className="rounded-lg border border-[#D4B996] bg-[#F7F3EE] p-3 text-xs text-[#964F3D]">
                  ⚠️ <strong>Lưu ý:</strong> Với thể trạng đặc biệt này, chuyên viên chuyên môn sẽ
                  liên hệ trước để tư vấn và điều chỉnh thành phần phác đồ an toàn cho bạn.
                </div>
              )}

              <label className="mt-4 flex cursor-pointer items-start space-x-3 pt-2 text-xs text-[#635B54]">
                <input
                  type="checkbox"
                  checked={healthConsent}
                  onChange={(e) => setHealthConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#D4C8B8] text-[#405C4E] focus:ring-[#405C4E]"
                  required
                />
                <span>
                  Tôi đồng ý để Digital Wellness Platform lưu trữ thông tin thể trạng và lịch hẹn để
                  phục vụ việc cá nhân hóa phác đồ điều trị.
                </span>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Tóm tắt Túi Liệu Trình & Nút Xác Nhận (1 cột) */}
        <div>
          <div className="sticky top-6">
            <Card className="border-[#405C4E] bg-[#FAF7F2] p-6 shadow-sm">
              <CardHeader className="px-0 pt-0">
                <Badge variant="terracotta" className="mb-2 self-start">
                  Toa phác đồ tích hợp
                </Badge>
                <CardTitle className="font-serif text-2xl text-[#2B2622]">
                  {bookingData.service.name}
                </CardTitle>
                <CardDescription className="text-xs text-[#635B54]">
                  Lộ trình {bookingData.service.sessions} buổi ({bookingData.service.durationMin}{' '}
                  phút/buổi)
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 px-0">
                <div className="border-t border-[#E2D9CC] pt-4">
                  <h4 className="text-xs font-semibold tracking-wider text-[#635B54] uppercase">
                    Toa chăm sóc tại nhà đi kèm
                  </h4>
                  <p className="mt-0.5 text-xs text-[#82786F] italic">
                    (Kèm theo phác đồ, không bán lẻ đại trà)
                  </p>

                  <div className="mt-3 space-y-2">
                    {bookingData.homeCareProducts.map((p) => (
                      <div
                        key={p.slug}
                        className="rounded-lg border border-[#E2D9CC] bg-white p-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#2B2622]">{p.name}</span>
                          <span className="rounded bg-[#E5EDE8] px-2 py-0.5 text-[10px] text-[#405C4E]">
                            Toa dưỡng
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#635B54]">{p.usageGuide}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#E2D9CC] pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#635B54]">Phác đồ trị liệu:</span>
                    <span className="font-medium text-[#2B2622]">
                      {formatCurrencyVND(bookingData.service.priceVnd)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-[#635B54]">Toa dưỡng tại nhà:</span>
                    <span className="font-medium text-[#405C4E]">Bao gồm trọn gói</span>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-[#E2D9CC] pt-3 text-base font-bold">
                    <span className="text-[#2B2622]">Tổng cộng:</span>
                    <span className="text-[#964F3D]">
                      {formatCurrencyVND(bookingData.service.priceVnd)}
                    </span>
                  </div>
                  <p className="mt-1 text-right text-[11px] text-[#82786F]">
                    (Thanh toán mô phỏng — Trả sau tại spa)
                  </p>
                </div>

                {submitError && (
                  <div className="rounded-lg border border-[#D4B996] bg-[#FBF0EE] p-3 text-xs text-[#964F3D]">
                    {submitError}
                  </div>
                )}
              </CardContent>

              <CardFooter className="px-0 pt-2 pb-0">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-base shadow-sm"
                  isLoading={isSubmitting}
                >
                  Xác nhận túi liệu trình & Đặt lịch hẹn
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </main>
  );
}

export default function TuiLieuTrinhPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <PublicHeader />
      <React.Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center p-8 text-[#635B54]">
            Đang tải túi liệu trình...
          </div>
        }
      >
        <BookingWizard />
      </React.Suspense>
      <PublicFooter />
    </div>
  );
}
