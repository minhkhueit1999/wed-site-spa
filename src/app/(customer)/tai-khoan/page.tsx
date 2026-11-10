'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Dialog,
} from '@/components/ui';
import {
  getCustomerDashboardAction,
  exportCustomerDataAction,
  deleteCustomerAccountAction,
} from '@/application/customer/actions';
import { CustomerDashboardData } from '@/application/customer/getCustomerDashboard';

export default function TaiKhoanPage() {
  const router = useRouter();
  const [data, setData] = React.useState<CustomerDashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'tracker' | 'appointments' | 'privacy'>(
    'tracker',
  );

  // Privacy export & delete states
  const [isExporting, setIsExporting] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await getCustomerDashboardAction();
      if (res.ok) {
        setData(res.value);
      } else {
        setErrorMsg(res.error);
      }
      setIsLoading(false);
    }

    loadDashboard();
  }, []);

  const handleExportData = async () => {
    setIsExporting(true);
    const res = await exportCustomerDataAction();
    setIsExporting(false);

    if (res.ok) {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(res.value, null, 2),
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `spa-du-lieu-ca-nhan-${new Date().toISOString().split('T')[0]}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      alert(res.error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteCustomerAccountAction();
    setIsDeleting(false);

    if (res.ok) {
      setShowDeleteModal(false);
      alert('Tài khoản và toàn bộ dữ liệu sức khỏe đã được xóa thành công.');
      router.push('/');
    } else {
      setDeleteError(res.error);
    }
  };

  // 1. Trạng thái Đang tải (Loading Skeleton)
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-xl bg-[#E2D9CC]" />
            <div className="h-14 w-full rounded-2xl bg-[#E2D9CC]" />
            <div className="h-80 w-full rounded-2xl bg-[#E2D9CC]" />
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // 2. Trạng thái Lỗi / Chưa đăng nhập (Error Fallback)
  if (errorMsg || !data) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16 text-center">
          <Card className="border-[#D4B996] p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8DDD0] text-2xl">
              🔒
            </div>
            <CardTitle className="font-serif text-2xl text-[#2B2622]">Truy cập tài khoản</CardTitle>
            <CardDescription className="mt-2 text-sm text-[#635B54]">
              {errorMsg || 'Vui lòng đăng nhập bằng tài khoản khách hàng để xem lộ trình điều trị.'}
            </CardDescription>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => router.push('/dang-nhap?callbackUrl=/tai-khoan')}
              >
                Đăng nhập ngay
              </Button>
              <Button variant="outline" onClick={() => router.push('/tu-van')}>
                Làm trắc nghiệm mới
              </Button>
            </div>
          </Card>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const { user, activePlan } = data;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {/* Header thông tin khách hàng */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#E2D9CC] pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="terracotta">Hồ sơ khách hàng</Badge>
              <span className="text-xs text-[#82786F]">
                Đồng ý dữ liệu:{' '}
                {user.consentAt
                  ? new Date(user.consentAt).toLocaleDateString('vi-VN')
                  : 'Đã xác nhận'}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold text-[#2B2622] sm:text-4xl">
              Chào {user.name}
            </h1>
            <p className="text-sm text-[#635B54]">{user.email}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/trieu-chung')}>
              Gói giải pháp
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push('/tu-van')}>
              Khảo sát mới
            </Button>
          </div>
        </div>

        {/* Thanh chuyển Tabs */}
        <div className="mb-8 flex border-b border-[#E2D9CC] text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`border-b-2 px-5 py-3 transition-colors ${
              activeTab === 'tracker'
                ? 'border-[#405C4E] font-semibold text-[#405C4E]'
                : 'border-transparent text-[#635B54] hover:text-[#2B2622]'
            }`}
          >
            🌿 Lộ trình & Treatment Tracker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`border-b-2 px-5 py-3 transition-colors ${
              activeTab === 'appointments'
                ? 'border-[#405C4E] font-semibold text-[#405C4E]'
                : 'border-transparent text-[#635B54] hover:text-[#2B2622]'
            }`}
          >
            📅 Lịch hẹn của tôi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`border-b-2 px-5 py-3 transition-colors ${
              activeTab === 'privacy'
                ? 'border-[#405C4E] font-semibold text-[#405C4E]'
                : 'border-transparent text-[#635B54] hover:text-[#2B2622]'
            }`}
          >
            🛡️ Quyền riêng tư & Dữ liệu
          </button>
        </div>

        {/* ================= TAB 1: TREATMENT TRACKER ================= */}
        {activeTab === 'tracker' && (
          <div className="space-y-8">
            {!activePlan ? (
              <Card className="border-[#E2D9CC] p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E5EDE8] text-2xl">
                  📋
                </div>
                <CardTitle className="font-serif text-xl text-[#2B2622]">
                  Chưa có phác đồ điều trị đang kích hoạt
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-[#635B54]">
                  Bạn chưa có phác đồ nào. Hãy làm bài khảo sát trắc nghiệm để nhận gợi ý phác đồ
                  chăm sóc cá nhân hóa.
                </CardDescription>
                <div className="mt-6">
                  <Button variant="primary" onClick={() => router.push('/tu-van')}>
                    Làm bài trắc nghiệm ngay
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* 1. Thẻ tổng quan phác đồ & Thanh tiến trình */}
                <Card className="border-[#405C4E] bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={activePlan.statePresentation.badgeVariant}>
                          {activePlan.statePresentation.label}
                        </Badge>
                        <span className="font-mono text-xs text-[#82786F]">
                          ID: {activePlan.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <h2 className="mt-2 font-serif text-2xl font-bold text-[#2B2622] sm:text-3xl">
                        {activePlan.serviceName}
                      </h2>
                      <p className="mt-1 text-sm text-[#635B54]">{activePlan.serviceDescription}</p>
                    </div>

                    <div className="rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] p-4 text-center sm:min-w-[180px]">
                      <span className="text-xs tracking-wider text-[#635B54] uppercase">
                        Tiến trình buổi
                      </span>
                      <div className="mt-1 font-serif text-2xl font-bold text-[#405C4E]">
                        {activePlan.completedSessions} / {activePlan.totalSessions}
                      </div>
                      <span className="text-xs text-[#82786F]">
                        {activePlan.progressPercent}% hoàn thành
                      </span>
                    </div>
                  </div>

                  {/* Thanh tiến trình đồ họa */}
                  <div className="mt-6">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#EAE1D3]">
                      <div
                        className="h-full rounded-full bg-[#405C4E] transition-all duration-500"
                        style={{ width: `${activePlan.progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-[#82786F]">
                      <span>Bắt đầu</span>
                      <span>Buổi {Math.ceil(activePlan.totalSessions / 2)}</span>
                      <span>Hoàn tất ({activePlan.totalSessions} buổi)</span>
                    </div>
                  </div>

                  {/* Thẻ hành động kế tiếp (Next Action) */}
                  <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#D4B996] bg-[#F7F3EE] p-4 sm:flex-row sm:items-center">
                    <div>
                      <span className="text-xs font-semibold tracking-wider text-[#964F3D] uppercase">
                        👉 Bước tiếp theo dành cho bạn:
                      </span>
                      <p className="mt-0.5 text-sm font-medium text-[#2B2622]">
                        {activePlan.nextAction}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/tui-lieu-trinh?serviceSlug=thu-gian-sau`)}
                    >
                      Đặt lịch buổi tiếp theo
                    </Button>
                  </div>
                </Card>

                {/* 2. Toa chăm sóc tại nhà hiện tại (Home Care Prescription) */}
                <div>
                  <h3 className="mb-4 font-serif text-xl font-bold text-[#2B2622]">
                    Toa chăm sóc tại nhà hiện tại
                  </h3>
                  {activePlan.prescriptions.length === 0 ? (
                    <Card className="border-[#E2D9CC] p-6 text-center text-sm text-[#635B54]">
                      Chưa có toa chăm sóc tại nhà nào được kê cho phác đồ này.
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {activePlan.prescriptions.map((item) => (
                        <Card key={item.id} className="border-[#E2D9CC] bg-white p-5">
                          <div className="flex items-center justify-between">
                            <Badge variant="terracotta">Toa chỉ định</Badge>
                            <span className="text-xs text-[#82786F]">
                              Bắt đầu: {new Date(item.startDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <h4 className="mt-2 font-serif text-lg font-bold text-[#2B2622]">
                            {item.productName}
                          </h4>
                          <div className="mt-3 space-y-1.5 text-xs text-[#635B54]">
                            <p>
                              <strong className="text-[#2B2622]">Hướng dẫn:</strong>{' '}
                              {item.instructions}
                            </p>
                            <p>
                              <strong className="text-[#2B2622]">Tần suất:</strong> {item.frequency}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Treatment Tracker: Nhật ký trị liệu & Chỉ số phục hồi */}
                <div>
                  <h3 className="mb-4 font-serif text-xl font-bold text-[#2B2622]">
                    Nhật ký điều trị & Chỉ số tiến triển (Treatment Tracker)
                  </h3>

                  {activePlan.progressMetrics.length === 0 ? (
                    <Card className="border-[#E2D9CC] p-6 text-center text-sm text-[#635B54]">
                      Chưa có buổi điều trị nào được ghi nhận. Kỹ thuật viên sẽ cập nhật nhật ký sau
                      mỗi buổi trị liệu tại spa.
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {activePlan.progressMetrics.map((metric) => (
                        <Card key={metric.sessionNumber} className="border-[#E2D9CC] bg-white p-5">
                          <div className="flex flex-col justify-between gap-2 border-b border-[#E2D9CC] pb-3 sm:flex-row sm:items-center">
                            <div>
                              <span className="font-serif text-base font-bold text-[#405C4E]">
                                Buổi {metric.sessionNumber}
                              </span>
                              <span className="ml-3 text-xs text-[#82786F]">
                                {new Date(metric.date).toLocaleDateString('vi-VN', {
                                  weekday: 'long',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>

                            {/* Điểm số các chỉ số (Score badges) */}
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(metric.scores).map(([key, score]) => (
                                <span
                                  key={key}
                                  className="rounded-full bg-[#E5EDE8] px-3 py-1 text-xs font-semibold text-[#405C4E]"
                                >
                                  {key === 'stress'
                                    ? 'Căng thẳng'
                                    : key === 'sleep'
                                      ? 'Giấc ngủ'
                                      : key === 'skin'
                                        ? 'Da'
                                        : key === 'muscle'
                                          ? 'Cơ vai gáy'
                                          : key}
                                  : {score}/5
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-[#635B54]">
                            <p>
                              <strong className="text-[#2B2622]">Ghi nhận chuyên viên:</strong>{' '}
                              {metric.notes}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Timeline vòng đời phác đồ (Lifecycle History) */}
                <div>
                  <h3 className="mb-4 font-serif text-xl font-bold text-[#2B2622]">
                    Lịch sử trạng thái vòng đời phác đồ
                  </h3>
                  <div className="relative ml-3 space-y-6 border-l-2 border-[#D4C8B8] pl-6">
                    {activePlan.stateHistory.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute top-1 -left-[31px] h-3.5 w-3.5 rounded-full border-2 border-white bg-[#405C4E]" />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm font-semibold text-[#2B2622]">
                            {item.event} → {item.to}
                          </span>
                          <span className="text-xs text-[#82786F]">
                            {new Date(item.at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {item.reason && (
                          <p className="mt-1 text-xs text-[#635B54]">{item.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= TAB 2: LỊCH HẸN CỦA TÔI ================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#2B2622]">Lịch hẹn đã đặt</h3>
            {!activePlan || activePlan.appointments.length === 0 ? (
              <Card className="border-[#E2D9CC] p-8 text-center text-sm text-[#635B54]">
                Bạn chưa có lịch hẹn nào.
              </Card>
            ) : (
              activePlan.appointments.map((apt) => (
                <Card key={apt.id} className="border-[#E2D9CC] bg-white p-5">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <span className="font-serif text-base font-semibold text-[#2B2622]">
                        {new Date(apt.startAt).toLocaleString('vi-VN', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <p className="text-xs text-[#635B54]">
                        Chuyên viên: <strong className="text-[#2B2622]">{apt.therapistName}</strong>
                      </p>
                    </div>

                    <Badge
                      variant={
                        apt.status === 'COMPLETED'
                          ? 'success'
                          : apt.status === 'SCHEDULED'
                            ? 'primary'
                            : 'secondary'
                      }
                    >
                      {apt.status === 'COMPLETED'
                        ? 'Đã hoàn tất'
                        : apt.status === 'SCHEDULED'
                          ? 'Đã xếp lịch'
                          : apt.status}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 3: QUYỀN RIÊNG TƯ & DỮ LIỆU ================= */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <Card className="border-[#E2D9CC] bg-white p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="font-serif text-xl text-[#2B2622]">
                  Chính sách bảo mật & Quyền riêng tư
                </CardTitle>
                <CardDescription className="text-sm text-[#635B54]">
                  Chúng tôi tuân thủ nguyên tắc bảo mật tối đa cho dữ liệu sức khỏe của bạn. Dữ liệu
                  của bạn được cô lập tuyệt đối và không bao giờ chia sẻ cho bên thứ ba.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 px-0">
                <div className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-xs text-[#635B54]">
                  <p>
                    <strong className="text-[#2B2622]">Trạng thái đồng ý:</strong> Đã cấp quyền xử
                    lý dữ liệu sức khỏe cá nhân vào{' '}
                    {user.consentAt ? new Date(user.consentAt).toLocaleString('vi-VN') : 'Hôm nay'}.
                  </p>
                  <p className="mt-1">
                    <strong className="text-[#2B2622]">Mục đích lưu trữ:</strong> Quy chuẩn hóa
                    triệu chứng, ghép quy tắc trị liệu và ghi nhật ký theo dõi phục hồi.
                  </p>
                </div>

                <div className="border-t border-[#E2D9CC] pt-4">
                  <h4 className="font-serif text-base font-semibold text-[#2B2622]">
                    Xuất dữ liệu cá nhân (Data Portability)
                  </h4>
                  <p className="mt-1 text-xs text-[#635B54]">
                    Tải về toàn bộ hồ sơ, bài trắc nghiệm, phác đồ, toa thuốc và lịch sử điều trị ở
                    định dạng JSON tiêu chuẩn.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={handleExportData}
                    isLoading={isExporting}
                  >
                    📥 Tải xuống dữ liệu của tôi (.json)
                  </Button>
                </div>

                <div className="border-t border-[#E2D9CC] pt-4">
                  <h4 className="font-serif text-base font-semibold text-[#964F3D]">
                    Quyền được xóa bỏ (Right to Erasure)
                  </h4>
                  <p className="mt-1 text-xs text-[#635B54]">
                    Yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu khảo sát, lịch hẹn, nhật ký
                    trị liệu liên quan khỏi hệ thống.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 border-[#964F3D] text-[#964F3D] hover:bg-[#FBF0EE]"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    🗑️ Xóa toàn bộ tài khoản & Dữ liệu sức khỏe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Modal xác nhận xóa tài khoản */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa tài khoản vĩnh viễn?"
        description="Hành động này không thể khôi phục. Toàn bộ hồ sơ trắc nghiệm, các buổi trị liệu đã đặt, toa chăm sóc tại nhà và nhật ký tiến triển của bạn sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu."
      >
        {deleteError && (
          <div className="mb-4 rounded-lg bg-[#FBF0EE] p-3 text-xs text-[#964F3D]">
            {deleteError}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            className="bg-[#964F3D] hover:bg-[#7D3E2E]"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
          >
            Xác nhận xóa vĩnh viễn
          </Button>
        </div>
      </Dialog>

      <PublicFooter />
    </div>
  );
}
