'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Input,
} from '@/components/ui';
import {
  getAppointmentDetailAction,
  submitSessionLogAction,
  prescribeProductAction,
  finishSessionsAction,
} from '@/application/therapist/actions';
import { AppointmentDetailData } from '@/application/therapist/getTherapistSchedule';

interface Props {
  params: Promise<{ id: string }>;
}

export default function TherapistCustomerDetailPage({ params }: Props) {
  const router = useRouter();
  const [appointmentId, setAppointmentId] = React.useState<string | null>(null);

  const [detail, setDetail] = React.useState<AppointmentDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form SessionLog state
  const [notes, setNotes] = React.useState('');
  const [adjustments, setAdjustments] = React.useState('');
  const [nextAdvice, setNextAdvice] = React.useState('');
  const [scores, setScores] = React.useState<Record<string, number>>({
    stress: 3,
    sleep: 3,
    muscle: 3,
    skin: 3,
  });
  const [isSubmittingLog, setIsSubmittingLog] = React.useState(false);
  const [logSuccess, setLogSuccess] = React.useState(false);
  const [logError, setLogError] = React.useState<string | null>(null);

  // Form Prescription state
  const [selectedProductSlug, setSelectedProductSlug] = React.useState('');
  const [instructions, setInstructions] = React.useState('');
  const [frequency, setFrequency] = React.useState('Mỗi tối trước khi đi ngủ');
  const [isSubmittingPrescription, setIsSubmittingPrescription] = React.useState(false);
  const [presSuccess, setPresSuccess] = React.useState(false);
  const [presError, setPresError] = React.useState<string | null>(null);

  // Finish Sessions state
  const [isFinishing, setIsFinishing] = React.useState(false);

  const applyDetailData = React.useCallback((data: AppointmentDetailData) => {
    setDetail(data);
    if (data.appointment.sessionLog) {
      setNotes(data.appointment.sessionLog.notes);
      setAdjustments(data.appointment.sessionLog.adjustments || '');
      setNextAdvice(data.appointment.sessionLog.nextSessionAdvice || '');
      if (data.appointment.sessionLog.progressScores) {
        setScores(data.appointment.sessionLog.progressScores);
      }
    }
  }, []);

  // Tải dữ liệu ban đầu
  React.useEffect(() => {
    let active = true;

    async function initialize() {
      const { id } = await params;
      if (!active) return;
      setAppointmentId(id);

      const res = await getAppointmentDetailAction(id);
      if (!active) return;
      if (res.ok) {
        applyDetailData(res.value);
      } else {
        setErrorMsg(res.error);
      }
      setIsLoading(false);
    }

    initialize();

    return () => {
      active = false;
    };
  }, [params, applyDetailData]);

  const reloadData = async (id: string) => {
    const res = await getAppointmentDetailAction(id);
    if (res.ok) {
      applyDetailData(res.value);
    }
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;

    setIsSubmittingLog(true);
    setLogError(null);
    setLogSuccess(false);

    const res = await submitSessionLogAction({
      appointmentId,
      notes,
      progressScores: scores,
      adjustments: adjustments || undefined,
      nextSessionAdvice: nextAdvice || undefined,
    });

    setIsSubmittingLog(false);

    if (res.ok) {
      setLogSuccess(true);
      await reloadData(appointmentId);
    } else {
      setLogError(res.error);
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;

    setIsSubmittingPrescription(true);
    setPresError(null);
    setPresSuccess(false);

    const res = await prescribeProductAction({
      planId: detail.plan.id,
      productSlug: selectedProductSlug,
      instructions,
      frequency,
    });

    setIsSubmittingPrescription(false);

    if (res.ok) {
      setPresSuccess(true);
      setSelectedProductSlug('');
      setInstructions('');
      if (appointmentId) {
        await reloadData(appointmentId);
      }
    } else {
      setPresError(res.error);
    }
  };

  const handleFinishSessions = async () => {
    if (!detail || !appointmentId) return;
    if (
      !confirm(
        'Bạn có chắc chắn muốn kết thúc chuỗi buổi trị liệu tại spa và chuyển sang giai đoạn Chăm sóc tại nhà (HOME_CARE)?',
      )
    ) {
      return;
    }

    setIsFinishing(true);
    const res = await finishSessionsAction({
      planId: detail.plan.id,
      notes: 'Hoàn tất toàn bộ các buổi tại spa; chuyển giao toa chăm sóc duy trì tại nhà.',
    });
    setIsFinishing(false);

    if (res.ok) {
      alert('Đã chuyển phác đồ sang trạng thái Chăm sóc tại nhà (HOME_CARE) thành công!');
      await reloadData(appointmentId);
    } else {
      alert(res.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-[#E2D9CC]" />
            <div className="h-28 rounded-2xl bg-[#E2D9CC]" />
            <div className="h-64 rounded-2xl bg-[#E2D9CC]" />
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16 text-center">
          <Card className="border-[#D4B996] p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8DDD0] text-2xl">
              ⚠️
            </div>
            <CardTitle className="font-serif text-2xl text-[#2B2622]">
              Không thể tải hồ sơ
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-[#635B54]">
              {errorMsg || 'Không tìm thấy hồ sơ buổi trị liệu.'}
            </CardDescription>
            <div className="mt-6">
              <Button variant="primary" onClick={() => router.push('/ky-thuat-vien')}>
                Quay lại danh sách lịch hẹn
              </Button>
            </div>
          </Card>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const { customer, plan, appointment, availableProducts } = detail;
  const canFinishSessions =
    plan.state === 'IN_TREATMENT' && plan.completedSessions >= plan.totalSessions;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-6">
          <Link
            href="/ky-thuat-vien"
            className="text-xs font-semibold tracking-wider text-[#964F3D] uppercase hover:underline"
          >
            ← Quay lại danh sách lịch hẹn
          </Link>
          <div className="mt-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h1 className="font-serif text-3xl font-bold text-[#2B2622]">
              Hồ Sơ Trị Liệu: {customer.name}
            </h1>
            <Badge variant="primary">Trạng thái phác đồ: {plan.state}</Badge>
          </div>
          <p className="text-sm text-[#635B54]">
            Buổi hẹn:{' '}
            {new Date(appointment.startAt).toLocaleString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* 1. KHỐI CẢNH BÁO AN TOÀN & THỂ TRẠNG (SAFETY ALERT) */}
        {customer.contraindicationWarnings.length > 0 && (
          <div className="mb-8 rounded-2xl border-2 border-[#964F3D] bg-[#FBF0EE] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-[#964F3D]">
              <span className="text-lg">🚨</span>
              <span>CẢNH BÁO CHUYÊN MÔN: THỂ TRẠNG ĐẶC BIỆT / CHỐNG CHỈ ĐỊNH</span>
            </div>
            <p className="mt-1 text-xs text-[#635B54]">
              Hệ thống đã nhận diện các cờ an toàn sau đây của khách hàng. Hãy điều chỉnh thao tác
              và TUYỆT ĐỐI không chỉ định các sản phẩm bị chống chỉ định.
            </p>
            <ul className="mt-3 space-y-1.5 border-t border-[#E8D4D0] pt-3 text-xs text-[#964F3D]">
              {customer.contraindicationWarnings.map((warning, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2 font-bold">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* CỘT TRÁI (2 CỘT): FORM GHI NHẬT KÝ VÀ LỊCH SỬ BUỔI */}
          <div className="space-y-6 lg:col-span-2">
            {/* Form Ghi nhật ký buổi trị liệu (SessionLog) */}
            <Card className="border-[#405C4E] bg-white p-6 shadow-sm">
              <CardHeader className="px-0 pt-0">
                <Badge variant="terracotta" className="mb-2 self-start">
                  Phiếu ghi nhận chuyên môn
                </Badge>
                <CardTitle className="font-serif text-2xl text-[#2B2622]">
                  Nhật Ký Buổi Trị Liệu (SessionLog)
                </CardTitle>
                <CardDescription className="text-xs text-[#635B54]">
                  Đánh giá chỉ số phục hồi sau buổi và ghi nhận các điều chỉnh thao tác chuyên môn.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmitLog} className="space-y-5">
                {/* Đánh giá điểm số cải thiện (thang 1 - 5) */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2B2622]">
                    Điểm số cải thiện thể trạng sau buổi (1 = Chưa cải thiện, 5 = Cải thiện rất tốt)
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { key: 'stress', label: 'Căng thẳng' },
                      { key: 'sleep', label: 'Giấc ngủ' },
                      { key: 'muscle', label: 'Cơ vai gáy' },
                      { key: 'skin', label: 'Tình trạng da' },
                    ].map((metric) => (
                      <div
                        key={metric.key}
                        className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-3 text-center"
                      >
                        <span className="block text-xs font-semibold text-[#635B54]">
                          {metric.label}
                        </span>
                        <select
                          value={scores[metric.key] ?? 3}
                          onChange={(e) =>
                            setScores((prev) => ({
                              ...prev,
                              [metric.key]: parseInt(e.target.value, 10),
                            }))
                          }
                          className="mt-2 w-full rounded-lg border border-[#D4C8B8] bg-white py-1 text-center font-bold text-[#405C4E] focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5].map((val) => (
                            <option key={val} value={val}>
                              {val} / 5
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ghi chú quan sát */}
                <div>
                  <label
                    htmlFor="session-notes"
                    className="mb-1 block text-sm font-medium text-[#2B2622]"
                  >
                    Ghi chú quan sát trị liệu <span className="text-[#964F3D]">*</span>
                  </label>
                  <textarea
                    id="session-notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Khách phản ứng tốt với liệu pháp bấm huyệt, các điểm co thắt vùng gáy đã giãn mềm..."
                    className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] p-3 text-sm text-[#2B2622] focus:border-[#405C4E] focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-[11px] text-[#82786F]">
                    Tối thiểu 10 ký tự. Nhật ký sẽ được lưu vào hồ sơ khách hàng.
                  </p>
                </div>

                {/* Điều chỉnh thao tác hoặc lực ấn */}
                <div>
                  <label
                    htmlFor="adjustments"
                    className="mb-1 block text-sm font-medium text-[#2B2622]"
                  >
                    Điều chỉnh thao tác hoặc lực ấn (nếu có)
                  </label>
                  <input
                    id="adjustments"
                    type="text"
                    value={adjustments}
                    onChange={(e) => setAdjustments(e.target.value)}
                    placeholder="Ví dụ: Giảm lực ấn vai phải, tập trung bấm huyệt phong trì"
                    className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-sm text-[#2B2622] focus:border-[#405C4E] focus:outline-none"
                  />
                </div>

                {/* Lời khuyên buổi sau */}
                <div>
                  <label
                    htmlFor="next-advice"
                    className="mb-1 block text-sm font-medium text-[#2B2622]"
                  >
                    Lời khuyên & Dặn dò cho buổi sau
                  </label>
                  <input
                    id="next-advice"
                    type="text"
                    value={nextAdvice}
                    onChange={(e) => setNextAdvice(e.target.value)}
                    placeholder="Ví dụ: Duy trì uống trà thảo mộc 30 phút trước khi ngủ"
                    className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-sm text-[#2B2622] focus:border-[#405C4E] focus:outline-none"
                  />
                </div>

                {logError && (
                  <div className="rounded-lg bg-[#FBF0EE] p-3 text-xs text-[#964F3D]">
                    {logError}
                  </div>
                )}

                {logSuccess && (
                  <div className="rounded-lg bg-[#E5EDE8] p-3 text-xs font-semibold text-[#405C4E]">
                    ✔ Nhật ký buổi trị liệu đã được lưu thành công và cập nhật vào hồ sơ khách!
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 shadow-sm"
                  isLoading={isSubmittingLog}
                >
                  {appointment.sessionLog ? 'Cập nhật SessionLog' : 'Lưu nhật ký & Hoàn thành buổi'}
                </Button>
              </form>
            </Card>

            {/* Lịch sử các buổi trị liệu trước đó */}
            <div>
              <h3 className="mb-4 font-serif text-xl font-bold text-[#2B2622]">
                Lịch sử các buổi trước trong phác đồ
              </h3>
              {plan.pastSessionLogs.length === 0 ? (
                <Card className="border-[#E2D9CC] p-6 text-center text-xs text-[#635B54]">
                  Đây là buổi trị liệu đầu tiên của phác đồ này.
                </Card>
              ) : (
                <div className="space-y-3">
                  {plan.pastSessionLogs.map((log, idx) => (
                    <Card key={log.id} className="border-[#E2D9CC] bg-white p-4">
                      <div className="flex justify-between border-b border-[#E2D9CC] pb-2 text-xs">
                        <span className="font-semibold text-[#405C4E]">Buổi trước #{idx + 1}</span>
                        <span className="text-[#82786F]">
                          {new Date(log.date).toLocaleDateString('vi-VN')} • Chuyên viên:{' '}
                          {log.therapistName}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#2B2622]">{log.notes}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (1 CỘT): KÊ TOA CHĂM SÓC VÀ CHUYỂN TRẠNG THÁI */}
          <div className="space-y-6">
            {/* Form Kê toa chăm sóc tại nhà */}
            <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
              <CardHeader className="px-0 pt-0">
                <Badge variant="terracotta" className="mb-2 self-start">
                  Toa dưỡng tại nhà
                </Badge>
                <CardTitle className="font-serif text-xl text-[#2B2622]">
                  Chỉ Định Toa Sản Phẩm
                </CardTitle>
                <CardDescription className="text-xs text-[#635B54]">
                  Chỉ định sản phẩm dưỡng chuyên biệt tiếp theo vào tài khoản của khách.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handlePrescribe} className="space-y-4">
                <div>
                  <label
                    htmlFor="product-select"
                    className="mb-1 block text-sm font-medium text-[#2B2622]"
                  >
                    Sản phẩm dưỡng
                  </label>
                  <select
                    id="product-select"
                    value={selectedProductSlug}
                    onChange={(e) => setSelectedProductSlug(e.target.value)}
                    className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-xs text-[#2B2622] focus:border-[#405C4E] focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {availableProducts.map((p) => (
                      <option
                        key={p.slug}
                        value={p.slug}
                        disabled={p.isBlocked}
                        className={p.isBlocked ? 'text-[#964F3D]' : ''}
                      >
                        {p.name} {p.isBlocked ? `[🚫 CHỐNG CHỈ ĐỊNH: ${p.blockReason}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Tần suất sử dụng"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="Mỗi tối trước khi ngủ"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="prescription-guide"
                    className="mb-1 block text-sm font-medium text-[#2B2622]"
                  >
                    Hướng dẫn sử dụng chi tiết
                  </label>
                  <textarea
                    id="prescription-guide"
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Thoa đều 2 giọt vào hai bên thái dương và mát-xa nhẹ theo chiều kim đồng hồ..."
                    className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] p-2.5 text-xs text-[#2B2622] focus:border-[#405C4E] focus:outline-none"
                    required
                  />
                </div>

                {presError && (
                  <div className="rounded-lg bg-[#FBF0EE] p-3 text-xs text-[#964F3D]">
                    {presError}
                  </div>
                )}

                {presSuccess && (
                  <div className="rounded-lg bg-[#E5EDE8] p-3 text-xs font-semibold text-[#405C4E]">
                    ✔ Đã kê toa chăm sóc tại nhà mới vào tài khoản khách!
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 text-sm"
                  isLoading={isSubmittingPrescription}
                >
                  Thêm vào toa của khách
                </Button>
              </form>
            </Card>

            {/* Danh sách các sản phẩm đang có trong toa của khách */}
            <Card className="border-[#E2D9CC] bg-white p-6 shadow-sm">
              <h4 className="font-serif text-base font-bold text-[#2B2622]">
                Toa dưỡng hiện tại của khách
              </h4>
              <p className="mt-0.5 text-xs text-[#635B54]">
                Đang hiển thị trên tài khoản khách hàng
              </p>

              {plan.prescriptions.length === 0 ? (
                <p className="mt-4 text-xs text-[#82786F] italic">Chưa có sản phẩm nào.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {plan.prescriptions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-[#E2D9CC] bg-[#FAF7F2] p-3 text-xs"
                    >
                      <span className="font-semibold text-[#405C4E]">{item.productName}</span>
                      <p className="mt-1 text-[#635B54]">Tần suất: {item.frequency}</p>
                      <p className="mt-0.5 text-[11px] text-[#82786F]">{item.instructions}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Nút Kết thúc chuỗi buổi (Finish Sessions) */}
            {canFinishSessions && (
              <Card className="border-[#405C4E] bg-[#E5EDE8] p-6 shadow-sm">
                <Badge variant="success" className="mb-2">
                  Đã đủ điều kiện
                </Badge>
                <CardTitle className="font-serif text-lg text-[#2B2622]">
                  Kết thúc chuỗi buổi tại spa
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-[#635B54]">
                  Khách đã hoàn thành {plan.completedSessions}/{plan.totalSessions} buổi. Bạn có thể
                  chuyển phác đồ sang giai đoạn Chăm sóc tại nhà (HOME_CARE).
                </CardDescription>
                <Button
                  variant="primary"
                  className="mt-4 w-full"
                  onClick={handleFinishSessions}
                  isLoading={isFinishing}
                >
                  Chuyển sang HOME_CARE →
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
