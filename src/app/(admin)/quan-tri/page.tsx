'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button, Card, CardTitle, CardDescription, Badge, Input } from '@/components/ui';
import {
  getAdminStatsAction,
  getAllAdminDataAction,
  createServiceAction,
  deleteServiceAction,
  createProductAction,
  deleteProductAction,
  simulateRulesAction,
  type AdminAllData,
} from '@/application/admin/actions';
import { AdminStatsData } from '@/application/admin/getAdminStats';
import { Recommendation, Severity } from '@/domain/recommendation/types';
import { formatCurrencyVND } from '@/lib/utils';
import { AdminCalendarDispatch } from '@/components/features/admin/AdminCalendarDispatch';
import { AdminHRPayroll } from '@/components/features/admin/AdminHRPayroll';
import { AdminCRM } from '@/components/features/admin/AdminCRM';
import { AdminInventoryServices } from '@/components/features/admin/AdminInventoryServices';
import { AdminBillingInvoicing } from '@/components/features/admin/AdminBillingInvoicing';
import { AdminAnalyticsView } from '@/components/features/admin/AdminAnalyticsView';

type TabId =
  | 'overview'
  | 'calendar'
  | 'hr'
  | 'crm'
  | 'inventory'
  | 'billing'
  | 'analytics'
  | 'rules'
  | 'services'
  | 'products'
  | 'contraindications';

export default function QuanTriPage() {
  const router = useRouter();
  const [stats, setStats] = React.useState<AdminStatsData | null>(null);
  const [adminData, setAdminData] = React.useState<AdminAllData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabId>('overview');

  // Live preview simulation states
  const [simSleep, setSimSleep] = React.useState<Severity>(3);
  const [simStress, setSimStress] = React.useState<Severity>(3);
  const [simMuscle, setSimMuscle] = React.useState<Severity>(3);
  const [simFlags, setSimFlags] = React.useState<string[]>([]);
  const [simResults, setSimResults] = React.useState<Recommendation[] | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);

  // Form states for creating new items
  const [newServiceName, setNewServiceName] = React.useState('');
  const [newServiceSlug, setNewServiceSlug] = React.useState('');
  const [newServiceDesc, setNewServiceDesc] = React.useState('');
  const [newServicePrice, setNewServicePrice] = React.useState(700000);
  const [serviceFeedback, setServiceFeedback] = React.useState<string | null>(null);

  const [newProductName, setNewProductName] = React.useState('');
  const [newProductSlug, setNewProductSlug] = React.useState('');
  const [newProductDesc, setNewProductDesc] = React.useState('');
  const [newProductUsage, setNewProductUsage] = React.useState('');
  const [newProductPrice, setNewProductPrice] = React.useState(250000);
  const [productFeedback, setProductFeedback] = React.useState<string | null>(null);

  const refreshData = React.useCallback(async () => {
    const [statsRes, dataRes] = await Promise.all([getAdminStatsAction(), getAllAdminDataAction()]);

    if (statsRes.ok && dataRes.ok) {
      setStats(statsRes.value);
      setAdminData(dataRes.value);
      setErrorMsg(null);
    } else {
      const err =
        (!statsRes.ok ? statsRes.error : '') ||
        (!dataRes.ok ? dataRes.error : '') ||
        'Lỗi tải dữ liệu quản trị.';
      setErrorMsg(err);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      const [statsRes, dataRes] = await Promise.all([
        getAdminStatsAction(),
        getAllAdminDataAction(),
      ]);
      if (!active) return;
      if (statsRes.ok && dataRes.ok) {
        setStats(statsRes.value);
        setAdminData(dataRes.value);
      } else {
        const err =
          (!statsRes.ok ? statsRes.error : '') ||
          (!dataRes.ok ? dataRes.error : '') ||
          'Lỗi tải dữ liệu quản trị.';
        setErrorMsg(err);
      }
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  // Handler chạy mô phỏng Live Preview
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    const res = await simulateRulesAction({
      concernScores: [
        { concernSlug: 'mat-ngu', severity: simSleep },
        { concernSlug: 'cang-thang', severity: simStress },
        { concernSlug: 'moi-vai-gay', severity: simMuscle },
      ],
      safetyFlags: simFlags,
    });
    setIsSimulating(false);

    if (res.ok) {
      setSimResults(res.value.recommendations);
    } else {
      alert(res.error);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceFeedback(null);
    const res = await createServiceAction({
      slug: newServiceSlug.trim(),
      name: newServiceName.trim(),
      description: newServiceDesc.trim(),
      durationMin: 60,
      sessionsRecommended: 6,
      priceVnd: Number(newServicePrice),
    });

    if (res.ok) {
      setServiceFeedback('Tạo dịch vụ thành công!');
      setNewServiceName('');
      setNewServiceSlug('');
      setNewServiceDesc('');
      await refreshData();
    } else {
      setServiceFeedback(`Lỗi: ${res.error}`);
    }
  };

  const handleDeleteService = async (slug: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${slug}"?`)) return;
    const res = await deleteServiceAction(slug);
    if (res.ok) {
      alert(res.value.message);
      await refreshData();
    } else {
      alert(res.error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFeedback(null);
    const res = await createProductAction({
      slug: newProductSlug.trim(),
      name: newProductName.trim(),
      description: newProductDesc.trim(),
      usageGuide: newProductUsage.trim(),
      priceVnd: Number(newProductPrice),
    });

    if (res.ok) {
      setProductFeedback('Tạo sản phẩm thành công!');
      setNewProductName('');
      setNewProductSlug('');
      setNewProductDesc('');
      setNewProductUsage('');
      await refreshData();
    } else {
      setProductFeedback(`Lỗi: ${res.error}`);
    }
  };

  const handleDeleteProduct = async (slug: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${slug}"?`)) return;
    const res = await deleteProductAction(slug);
    if (res.ok) {
      alert(res.value.message);
      await refreshData();
    } else {
      alert(res.error);
    }
  };

  const toggleSimFlag = (flag: string) => {
    setSimFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto flex flex-1 items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#405C4E] border-t-transparent" />
            <p className="font-serif text-[#635B54]">Đang tải dữ liệu trung tâm quản trị...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (errorMsg || !stats || !adminData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16 text-center">
          <Card className="border-[#D4B996] p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8DDD0] text-2xl">
              🛡️
            </div>
            <CardTitle className="font-serif text-2xl text-[#2B2622]">
              Khu vực Quản trị viên
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-[#635B54]">
              {errorMsg || 'Vui lòng đăng nhập với vai trò Quản trị viên (ADMIN) để tiếp tục.'}
            </CardDescription>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => router.push('/dang-nhap?callbackUrl=/quan-tri')}
              >
                Đăng nhập tài khoản Quản trị
              </Button>
            </div>
          </Card>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: '📊 Tổng quan & AuditLog' },
    { id: 'calendar', label: '📅 Lịch Hẹn & Điều Phối' },
    { id: 'hr', label: '👥 Nhân Sự & Bảng Lương' },
    { id: 'crm', label: '📋 Khách Hàng CRM & Công Nợ' },
    { id: 'inventory', label: '📦 Kho Mỹ Phẩm & Dịch Vụ' },
    { id: 'billing', label: '💳 Hóa Đơn & Thanh Toán' },
    { id: 'analytics', label: '📈 Báo Cáo & KPI' },
    { id: 'rules', label: '⚙️ Quy tắc & Live Preview' },
    { id: 'services', label: '💆 Dịch vụ phác đồ' },
    { id: 'products', label: '🧴 Toa sản phẩm tại nhà' },
    { id: 'contraindications', label: '🚫 Chống chỉ định' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#E2D9CC] pb-6 sm:flex-row sm:items-center">
          <div>
            <Badge variant="terracotta">Cổng quản trị hệ thống</Badge>
            <h1 className="mt-2 font-serif text-3xl font-bold text-[#2B2622] sm:text-4xl">
              Bảng Điều Khiển Quản Trị Spa
            </h1>
            <p className="text-sm text-[#635B54]">
              Quản lý danh mục phác đồ, toa dưỡng tại nhà, cấu hình Rule Engine và theo dõi
              AuditLog.
            </p>
          </div>
        </div>

        {/* Thanh chuyển tabs quản trị */}
        <div className="mb-8 flex flex-wrap border-b border-[#E2D9CC] text-sm font-medium">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#405C4E] font-semibold text-[#405C4E]'
                  : 'border-transparent text-[#635B54] hover:text-[#2B2622]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: TỔNG QUAN & AUDITLOG ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card className="border-[#E2D9CC] bg-white p-5">
                <span className="text-xs font-semibold text-[#635B54] uppercase">Khách hàng</span>
                <div className="mt-1 font-serif text-3xl font-bold text-[#2B2622]">
                  {stats.counts.customers}
                </div>
              </Card>
              <Card className="border-[#E2D9CC] bg-white p-5">
                <span className="text-xs font-semibold text-[#635B54] uppercase">
                  Kỹ thuật viên
                </span>
                <div className="mt-1 font-serif text-3xl font-bold text-[#405C4E]">
                  {stats.counts.therapists}
                </div>
              </Card>
              <Card className="border-[#E2D9CC] bg-white p-5">
                <span className="text-xs font-semibold text-[#635B54] uppercase">
                  Gói liệu trình
                </span>
                <div className="mt-1 font-serif text-3xl font-bold text-[#8C5E3C]">
                  {stats.counts.treatmentPlans}
                </div>
              </Card>
              <Card className="border-[#E2D9CC] bg-white p-5">
                <span className="text-xs font-semibold text-[#635B54] uppercase">Lịch hẹn</span>
                <div className="mt-1 font-serif text-3xl font-bold text-[#2B2622]">
                  {stats.counts.appointments}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Phân bố trạng thái phác đồ */}
              <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
                <CardTitle className="font-serif text-lg text-[#2B2622]">
                  Phân Bố Vòng Đời Phác Đồ (State Machine)
                </CardTitle>
                <div className="mt-4 space-y-2">
                  {(stats.plansByStatus || []).map((ps) => (
                    <div
                      key={ps.status}
                      className="flex items-center justify-between rounded-lg bg-[#FAF7F2] p-3 text-xs"
                    >
                      <span className="font-mono font-medium text-[#2B2622]">{ps.status}</span>
                      <span className="rounded-full bg-[#E5EDE8] px-2.5 py-0.5 font-bold text-[#405C4E]">
                        {ps.count} liệu trình
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Nhật ký hệ thống AuditLog */}
              <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <CardTitle className="font-serif text-lg text-[#2B2622]">
                    Nhật Ký Kiểm Toán (AuditLog)
                  </CardTitle>
                  <span className="text-xs text-[#82786F]">20 thao tác mới nhất</span>
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                  {stats.recentAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-[#E2D9CC] bg-[#FAF7F2] p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#405C4E]">{log.action}</span>
                        <span className="text-[10px] text-[#82786F]">
                          {new Date(log.at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-[#635B54]">
                        <span>Đối tượng: {log.targetType}</span>
                        <span>
                          • Bởi: {log.actorName} ({log.actorEmail})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ================= TAB: LỊCH HẸN & ĐIỀU PHỐI (CALENDAR) ================= */}
        {activeTab === 'calendar' && <AdminCalendarDispatch adminData={adminData} />}

        {/* ================= TAB: NHÂN SỰ & BẢNG LƯƠNG (HR & PAYROLL) ================= */}
        {activeTab === 'hr' && <AdminHRPayroll />}

        {/* ================= TAB: KHÁCH HÀNG CRM & CÔNG NỢ ================= */}
        {activeTab === 'crm' && <AdminCRM />}

        {/* ================= TAB: KHO MỸ PHẨM & DỊCH VỤ ================= */}
        {activeTab === 'inventory' && (
          <AdminInventoryServices adminData={adminData} onRefreshData={refreshData} />
        )}

        {/* ================= TAB: HÓA ĐƠN & KẾ TOÁN ================= */}
        {activeTab === 'billing' && <AdminBillingInvoicing adminData={adminData} />}

        {/* ================= TAB: BÁO CÁO & KPI ANALYTICS ================= */}
        {activeTab === 'analytics' && <AdminAnalyticsView />}

        {/* ================= TAB 2: QUY TẮC & LIVE PREVIEW ================= */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Cột trái: Danh sách Rule Engine */}
            <div>
              <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-xl text-[#2B2622]">
                      Quy Tắc Đề Xuất (Rule Engine)
                    </CardTitle>
                    <CardDescription className="text-xs text-[#635B54]">
                      Các quy tắc mapping triệu chứng thể trạng sang phác đồ dịch vụ và toa sản
                      phẩm.
                    </CardDescription>
                  </div>
                  <Badge variant="primary">{adminData.rules.length} quy tắc</Badge>
                </div>

                <div className="space-y-3">
                  {adminData.rules.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#405C4E]">{r.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#E2D9CC] px-2 py-0.5 text-[10px] text-[#2B2622]">
                            Ưu tiên: {r.priority}
                          </span>
                          <span className="rounded bg-[#F3EDE3] px-2 py-0.5 text-[10px] text-[#635B54]">
                            Mức tối thiểu: {r.minSeverity}/5
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#2B2622]">
                        Triệu chứng: {r.concernSlug} → Dịch vụ: {r.serviceSlug}
                      </p>
                      <p className="mt-1 text-xs text-[#635B54]">
                        Toa sản phẩm: <span className="font-mono">{r.productSlugs}</span>
                      </p>
                      <p className="mt-1 text-xs text-[#82786F] italic">
                        Lời giải thích (Rationale): &ldquo;{r.rationale}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Cột phải: Live Preview Simulation */}
            <div>
              <Card className="sticky top-6 border-[#405C4E] bg-white p-6 shadow-md">
                <Badge variant="terracotta" className="mb-2">
                  Trực quan hóa Live Preview
                </Badge>
                <CardTitle className="font-serif text-xl text-[#2B2622]">
                  Mô Phỏng Động Rule Engine
                </CardTitle>
                <CardDescription className="text-xs text-[#635B54]">
                  Thay đổi tham số đầu vào của khách để kiểm tra phác đồ dịch vụ và toa sản phẩm do
                  Rule Engine tính toán.
                </CardDescription>

                <div className="mt-5 space-y-4">
                  {/* Slider Mất ngủ */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-[#2B2622]">
                      <span>Mức độ mất ngủ</span>
                      <span className="font-bold text-[#405C4E]">{simSleep}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={simSleep}
                      onChange={(e) => setSimSleep(Number(e.target.value) as Severity)}
                      className="mt-1 w-full accent-[#405C4E]"
                    />
                  </div>

                  {/* Slider Căng thẳng */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-[#2B2622]">
                      <span>Mức độ căng thẳng</span>
                      <span className="font-bold text-[#405C4E]">{simStress}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={simStress}
                      onChange={(e) => setSimStress(Number(e.target.value) as Severity)}
                      className="mt-1 w-full accent-[#405C4E]"
                    />
                  </div>

                  {/* Slider Mỏi vai gáy */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-[#2B2622]">
                      <span>Mức độ mỏi vai gáy</span>
                      <span className="font-bold text-[#405C4E]">{simMuscle}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={simMuscle}
                      onChange={(e) => setSimMuscle(Number(e.target.value) as Severity)}
                      className="mt-1 w-full accent-[#405C4E]"
                    />
                  </div>

                  {/* Cờ an toàn mô phỏng */}
                  <div>
                    <span className="text-xs font-medium text-[#2B2622]">Cờ an toàn (Flags):</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { flag: 'PREGNANCY', label: 'Mang thai' },
                        { flag: 'SKIN_DAMAGE', label: 'Vết thương hở' },
                        { flag: 'HERBAL_ALLERGY', label: 'Dị ứng thảo mộc' },
                      ].map((item) => {
                        const checked = simFlags.includes(item.flag);
                        return (
                          <button
                            key={item.flag}
                            type="button"
                            onClick={() => toggleSimFlag(item.flag)}
                            className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                              checked
                                ? 'bg-[#964F3D] text-white'
                                : 'border border-[#E2D9CC] bg-[#FAF7F2] text-[#635B54]'
                            }`}
                          >
                            {checked ? '✓ ' : '+ '}
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                  >
                    {isSimulating ? 'Đang tính toán...' : '⚡ Chạy Mô Phỏng Live Preview'}
                  </Button>

                  {/* Kết quả mô phỏng */}
                  {simResults && (
                    <div className="mt-4 rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] p-4 text-xs">
                      <h4 className="font-semibold text-[#2B2622]">Kết quả từ Rule Engine:</h4>
                      {simResults.length === 0 ? (
                        <p className="mt-2 text-[#964F3D]">
                          Không có dịch vụ nào phù hợp hoặc đã bị chặn bởi các cờ chống chỉ định!
                        </p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {simResults.map((r, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-[#E2D9CC] bg-white p-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#405C4E]">
                                  Dịch vụ: {r.serviceSlug}
                                </span>
                                <Badge variant="secondary">Điểm: {r.score}</Badge>
                              </div>
                              <p className="mt-1 text-[11px] text-[#635B54]">
                                Toa sản phẩm:{' '}
                                <span className="font-mono">{r.productSlugs.join(', ')}</span>
                              </p>
                              <p className="mt-1 text-[11px] text-[#82786F] italic">
                                Rationale: {r.reasons.map((re) => re.text).join('; ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ================= TAB 3: DỊCH VỤ PHÁC ĐỒ ================= */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
                <CardTitle className="font-serif text-xl text-[#2B2622]">
                  Danh Sách Dịch Vụ Liệu Trình
                </CardTitle>
                <div className="mt-4 space-y-3">
                  {adminData.services.map((s) => (
                    <div
                      key={s.slug}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-xs sm:flex-row sm:items-center"
                    >
                      <div>
                        <span className="font-serif text-base font-bold text-[#2B2622]">
                          {s.name}
                        </span>
                        <span className="ml-2 font-mono text-[#82786F]">({s.slug})</span>
                        <p className="mt-1 text-xs text-[#635B54]">{s.description}</p>
                        <p className="mt-1 text-xs font-semibold text-[#405C4E]">
                          {s.sessionsRecommended} buổi ({s.durationMin} phút) • Giá:{' '}
                          {formatCurrencyVND(s.priceVnd)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.serviceProducts?.map((sp) => (
                            <span
                              key={sp.productSlug}
                              className="rounded bg-[#E5EDE8] px-2 py-0.5 text-[10px] text-[#405C4E]"
                            >
                              Toa: {sp.product?.name || sp.productSlug}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#964F3D] hover:bg-[#FBF0EE]"
                        onClick={() => handleDeleteService(s.slug)}
                      >
                        Xóa dịch vụ
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Form tạo dịch vụ mới */}
            <div>
              <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
                <CardTitle className="font-serif text-xl text-[#2B2622]">
                  Thêm Dịch Vụ Mới
                </CardTitle>
                <form onSubmit={handleCreateService} className="mt-4 space-y-3 text-xs">
                  <Input
                    label="Tên dịch vụ"
                    placeholder="Liệu Pháp Thảo Dược Tây Bắc"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    required
                  />
                  <Input
                    label="Mã slug"
                    placeholder="lieu-phap-thao-duoc-tay-bac"
                    value={newServiceSlug}
                    onChange={(e) => setNewServiceSlug(e.target.value)}
                    required
                  />
                  <div>
                    <label className="mb-1 block font-medium text-[#2B2622]">Mô tả</label>
                    <textarea
                      rows={2}
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] p-2 focus:outline-none"
                      required
                    />
                  </div>
                  <Input
                    label="Giá dịch vụ (VNĐ)"
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    required
                  />

                  {serviceFeedback && (
                    <div className="rounded bg-[#FAF7F2] p-2 text-xs text-[#405C4E]">
                      {serviceFeedback}
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="w-full py-2">
                    Tạo dịch vụ
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SẢN PHẨM DƯỠNG TẠI NHÀ ================= */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
                <CardTitle className="font-serif text-xl text-[#2B2622]">
                  Danh Sách Toa Sản Phẩm Dưỡng Tại Nhà
                </CardTitle>
                <div className="mt-4 space-y-3">
                  {adminData.products.map((p) => (
                    <div
                      key={p.slug}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-xs sm:flex-row sm:items-center"
                    >
                      <div>
                        <span className="font-serif text-base font-bold text-[#2B2622]">
                          {p.name}
                        </span>
                        <span className="ml-2 font-mono text-[#82786F]">({p.slug})</span>
                        <p className="mt-1 text-xs text-[#635B54]">{p.description}</p>
                        <p className="mt-1 text-xs font-semibold text-[#405C4E]">
                          Giá: {formatCurrencyVND(p.priceVnd)}
                        </p>
                        <p className="mt-1 text-[11px] text-[#405C4E]">HDSD: {p.usageGuide}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#964F3D] hover:bg-[#FBF0EE]"
                        onClick={() => handleDeleteProduct(p.slug)}
                      >
                        Xóa sản phẩm
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Form tạo sản phẩm mới */}
            <div>
              <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
                <CardTitle className="font-serif text-xl text-[#2B2622]">
                  Thêm Sản Phẩm Mới
                </CardTitle>
                <form onSubmit={handleCreateProduct} className="mt-4 space-y-3 text-xs">
                  <Input
                    label="Tên sản phẩm"
                    placeholder="Xịt Khoáng Hoa Cúc"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    required
                  />
                  <Input
                    label="Mã slug"
                    placeholder="xit-khoang-hoa-cuc"
                    value={newProductSlug}
                    onChange={(e) => setNewProductSlug(e.target.value)}
                    required
                  />
                  <div>
                    <label className="mb-1 block font-medium text-[#2B2622]">Mô tả</label>
                    <textarea
                      rows={2}
                      value={newProductDesc}
                      onChange={(e) => setNewProductDesc(e.target.value)}
                      className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] p-2 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-[#2B2622]">
                      Hướng dẫn sử dụng
                    </label>
                    <input
                      type="text"
                      value={newProductUsage}
                      onChange={(e) => setNewProductUsage(e.target.value)}
                      placeholder="Xịt đều lên mặt cách 20cm"
                      className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <Input
                    label="Giá bán kèm (VNĐ)"
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    required
                  />

                  {productFeedback && (
                    <div className="rounded bg-[#FAF7F2] p-2 text-xs text-[#964F3D]">
                      {productFeedback}
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="w-full py-2">
                    Tạo sản phẩm
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* ================= TAB 5: CHỐNG CHỈ ĐỊNH ================= */}
        {activeTab === 'contraindications' && (
          <div className="space-y-4">
            <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
              <CardTitle className="font-serif text-xl text-[#2B2622]">
                Quy Chuẩn Chống Chỉ Định & Cảnh Báo An Toàn
              </CardTitle>
              <CardDescription className="text-xs text-[#635B54]">
                Các cờ an toàn tự động lọc bỏ dịch vụ hoặc sản phẩm để bảo vệ thể trạng của khách.
              </CardDescription>

              <div className="mt-4 space-y-3">
                {adminData.contraindications.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#964F3D]">Flag: {c.flag}</span>
                      <Badge variant={c.requiresStaffReview ? 'warning' : 'secondary'}>
                        {c.requiresStaffReview ? 'Cần chuyên viên duyệt' : 'Chặn tự động'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-[#2B2622]">{c.message}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#635B54]">
                      <span>
                        Chặn dịch vụ: <strong className="font-mono">{c.blocksServiceSlugs}</strong>
                      </span>
                      <span>
                        Chặn sản phẩm: <strong className="font-mono">{c.blocksProductSlugs}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
