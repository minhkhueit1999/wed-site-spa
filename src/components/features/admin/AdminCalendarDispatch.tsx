'use client';

import * as React from 'react';
import { Button, Card, CardTitle, Badge } from '@/components/ui';
import {
  getCalendarAppointmentsAction,
  createAdminAppointmentAction,
  updateAdminAppointmentAction,
  cancelAdminAppointmentAction,
  getStaffListAction,
  getCustomerListAction,
  type CalendarAppointmentItem,
  type StaffListItem,
  type CustomerCRMItem,
  type AdminAllData,
} from '@/application/admin/actions';

interface Props {
  adminData: AdminAllData | null;
}

export function AdminCalendarDispatch({ adminData }: Props) {
  const [selectedDate, setSelectedDate] = React.useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [appointments, setAppointments] = React.useState<CalendarAppointmentItem[]>([]);
  const [staffList, setStaffList] = React.useState<StaffListItem[]>([]);
  const [customers, setCustomers] = React.useState<CustomerCRMItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  // Modal Create Appointment
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState('');
  const [selectedServiceSlug, setSelectedServiceSlug] = React.useState('');
  const [selectedTherapistId, setSelectedTherapistId] = React.useState('');
  const [appointmentTime, setAppointmentTime] = React.useState('10:00');
  const [selectedRoom, setSelectedRoom] = React.useState('Phòng VIP Hoa Sen 01');
  const [appointmentNotes, setAppointmentNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Modal Edit / Reassign
  const [editingApt, setEditingApt] = React.useState<CalendarAppointmentItem | null>(null);
  const [reassignTherapistId, setReassignTherapistId] = React.useState('');
  const [reassignStatus, setReassignStatus] = React.useState('');
  const [reassignRoom, setReassignRoom] = React.useState('');

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const start = new Date(`${selectedDate}T00:00:00`);
    const end = new Date(`${selectedDate}T23:59:59`);

    const [aptRes, staffRes, custRes] = await Promise.all([
      getCalendarAppointmentsAction(start.toISOString(), end.toISOString()),
      getStaffListAction(),
      getCustomerListAction(),
    ]);

    if (aptRes.ok) setAppointments(aptRes.value);
    if (staffRes.ok) setStaffList(staffRes.value.filter((s) => s.role === 'THERAPIST'));
    if (custRes.ok) setCustomers(custRes.value);
    setIsLoading(false);
  }, [selectedDate]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Tạo lịch mới
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedServiceSlug || !selectedTherapistId) {
      setFeedback({ type: 'error', msg: 'Vui lòng chọn đầy đủ Khách hàng, Dịch vụ và KTV.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const startAt = new Date(`${selectedDate}T${appointmentTime}:00`);

    const res = await createAdminAppointmentAction({
      customerId: selectedCustomerId,
      serviceSlug: selectedServiceSlug,
      therapistId: selectedTherapistId,
      startAt,
      room: selectedRoom,
      notes: appointmentNotes,
    });

    if (res.ok) {
      setFeedback({ type: 'success', msg: 'Đã tạo lịch hẹn thành công (Không bị xung đột giờ)!' });
      setIsCreateModalOpen(false);
      setAppointmentNotes('');
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsSubmitting(false);
  };

  // Cập nhật / Điều chuyển KTV
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await updateAdminAppointmentAction({
      id: editingApt.id,
      therapistId: reassignTherapistId || editingApt.therapistId,
      status: reassignStatus || editingApt.status,
      room: reassignRoom || editingApt.room,
    });

    if (res.ok) {
      setFeedback({ type: 'success', msg: 'Đã điều chuyển lịch hẹn thành công!' });
      setEditingApt(null);
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsSubmitting(false);
  };

  // Hủy lịch
  const handleCancelApt = async (aptId: string) => {
    const reason = window.prompt('Nhập lý do hủy lịch hẹn:');
    if (reason === null) return;

    const res = await cancelAdminAppointmentAction(aptId, reason);
    if (res.ok) {
      setFeedback({ type: 'success', msg: 'Đã hủy lịch hẹn.' });
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  // Kéo-thả phân công KTV & khung giờ (HTML5 Drag & Drop)
  const handleDragDropReassign = async (
    aptId: string,
    targetTherapistId: string,
    targetSlotTime: string,
  ) => {
    const apt = appointments.find((a) => a.id === aptId);
    if (!apt) return;

    const [slotH, slotM] = targetSlotTime.split(':').map(Number);
    const newStart = new Date(`${selectedDate}T00:00:00`);
    newStart.setHours(slotH || 9, slotM || 0, 0, 0);

    const oldStart = new Date(apt.startAt);
    const oldEnd = new Date(apt.endAt);
    const durationMs = oldEnd.getTime() - oldStart.getTime() || 60 * 60 * 1000;
    const newEnd = new Date(newStart.getTime() + durationMs);

    const targetStaff = staffList.find((s) => s.id === targetTherapistId);
    const targetStaffName = targetStaff?.name || 'KTV';

    const res = await updateAdminAppointmentAction({
      id: apt.id,
      therapistId: targetTherapistId,
      startAt: newStart,
      endAt: newEnd,
      room: apt.room,
    });

    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `🎯 Kéo-thả thành công! Đã điều phối lịch khách ${apt.customerName} sang ${targetStaffName} lúc ${targetSlotTime}.`,
      });
      await loadData();
    } else {
      setFeedback({
        type: 'error',
        msg: `⚠️ Xung đột lịch: Không thể điều phối sang ${targetStaffName} (${res.error}).`,
      });
    }
  };

  const timeSlots = [
    '08:30',
    '09:30',
    '10:30',
    '11:30',
    '13:30',
    '14:30',
    '15:30',
    '16:30',
    '17:30',
    '18:30',
    '19:30',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar Điều phối */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2D9CC] bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2B24]">
            Bảng Điều Phối Lịch Hẹn & Buồng Trị Liệu
          </h2>
          <p className="text-sm text-[#635B54]">
            Theo dõi khung giờ trống, phân công kỹ thuật viên theo thời gian thực và ngăn chặn trùng
            lịch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8C827A]">Ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-[#D4B996] bg-[#FAF7F2] px-3 py-1.5 text-sm font-medium text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
            />
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setIsCreateModalOpen(true);
              setFeedback(null);
            }}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <span>+</span> Đặt Lịch Mới
          </Button>

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

      {/* 2. Ma trận Dispatch Grid (Lịch theo từng Kỹ Thuật Viên) */}
      <div className="overflow-x-auto rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
        <div className="min-w-[900px]">
          {/* Header row: Các KTV */}
          <div className="grid grid-cols-12 border-b border-[#E2D9CC] bg-[#FAF7F2] text-xs font-semibold text-[#635B54]">
            <div className="col-span-2 border-r border-[#E2D9CC] p-3 text-center">Khung Giờ</div>
            {staffList.length > 0 ? (
              staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="col-span-3 border-r border-[#E2D9CC] p-3 text-center last:border-r-0"
                >
                  <div className="font-bold text-[#1F2B24]">{staff.name}</div>
                  <div className="text-[10px] text-[#8C827A]">Kỹ thuật viên chính</div>
                </div>
              ))
            ) : (
              <div className="col-span-10 p-3 text-center text-[#8C827A] italic">
                Chưa có KTV nào trong hệ thống.
              </div>
            )}
          </div>

          {/* Time slot rows */}
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#8C827A]">Đang tải ma trận lịch...</div>
          ) : (
            <div className="divide-y divide-[#E2D9CC]/60">
              {timeSlots.map((slotTime) => {
                const slotHour = parseInt(slotTime.split(':')[0] || '8', 10);

                return (
                  <div key={slotTime} className="grid grid-cols-12 hover:bg-[#FAF7F2]/40">
                    <div className="col-span-2 flex items-center justify-center border-r border-[#E2D9CC] p-3 font-mono text-xs text-[#8C827A]">
                      {slotTime}
                    </div>

                    {staffList.map((staff) => {
                      // Tìm lịch hẹn của KTV này tại khung giờ này
                      const matchingApt = appointments.find((apt) => {
                        const aptDate = new Date(apt.startAt);
                        return apt.therapistId === staff.id && aptDate.getHours() === slotHour;
                      });

                      return (
                        <div
                          key={staff.id}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDragEnter={(e) => {
                            e.currentTarget.classList.add(
                              'bg-[#E8EFE9]',
                              'ring-2',
                              'ring-[#4E6B56]/50',
                            );
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove(
                              'bg-[#E8EFE9]',
                              'ring-2',
                              'ring-[#4E6B56]/50',
                            );
                          }}
                          onDrop={async (e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove(
                              'bg-[#E8EFE9]',
                              'ring-2',
                              'ring-[#4E6B56]/50',
                            );
                            const aptId = e.dataTransfer.getData('text/plain');
                            if (aptId) {
                              await handleDragDropReassign(aptId, staff.id, slotTime);
                            }
                          }}
                          className="col-span-3 min-h-[72px] border-r border-[#E2D9CC] p-1.5 transition-colors last:border-r-0"
                        >
                          {matchingApt ? (
                            <div
                              draggable={
                                matchingApt.status !== 'COMPLETED' &&
                                matchingApt.status !== 'CANCELLED'
                              }
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', matchingApt.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onClick={() => {
                                setEditingApt(matchingApt);
                                setReassignTherapistId(matchingApt.therapistId);
                                setReassignStatus(matchingApt.status);
                                setReassignRoom(matchingApt.room);
                              }}
                              title="Nhấn để sửa / Kéo thả sang KTV hoặc giờ khác để phân công"
                              className={`group relative cursor-grab rounded-xl border p-2.5 shadow-2xs transition-all hover:scale-[1.02] hover:shadow-md active:cursor-grabbing ${
                                matchingApt.status === 'COMPLETED'
                                  ? 'border-[#4E6B56]/40 bg-[#E8EFE9]/70 text-[#1F2B24]'
                                  : matchingApt.status === 'IN_PROGRESS'
                                    ? 'border-[#10B981] bg-[#ECFDF5] text-[#065F46] ring-2 ring-[#10B981]/20'
                                    : matchingApt.status === 'CHECKED_IN'
                                      ? 'border-[#9333EA] bg-[#FAF5FF] text-[#6B21A8]'
                                      : 'border-[#D4AF37] bg-[#FFFBEB] text-[#92400E]'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1 truncate font-bold">
                                  <span className="text-[10px] text-[#8C827A] select-none">⋮⋮</span>
                                  <span className="truncate">{matchingApt.customerName}</span>
                                </span>
                                <span className="font-mono text-[10px] opacity-80">
                                  {new Date(matchingApt.startAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              <div className="mt-1 truncate text-[11px] font-medium">
                                {matchingApt.serviceName}
                              </div>

                              <div className="mt-1 flex items-center justify-between text-[10px] opacity-75">
                                <span>{matchingApt.room}</span>
                                <Badge
                                  className="px-1.5 py-0 text-[9px]"
                                  variant={
                                    matchingApt.status === 'COMPLETED'
                                      ? 'success'
                                      : matchingApt.status === 'IN_PROGRESS'
                                        ? 'terracotta'
                                        : 'outline'
                                  }
                                >
                                  {matchingApt.status}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setSelectedTherapistId(staff.id);
                                setAppointmentTime(slotTime);
                                setIsCreateModalOpen(true);
                              }}
                              className="flex h-full w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-transparent text-xs text-[#8C827A] opacity-0 transition-opacity hover:border-[#D4B996] hover:bg-[#FAF7F2] hover:opacity-100"
                            >
                              + Trống
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Modal Tạo Lịch Hẹn Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-lg border-[#D4B996] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <CardTitle className="font-serif text-xl text-[#1F2B24]">
                Tạo Lịch Hẹn & Phân Công KTV
              </CardTitle>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#635B54]">Khách hàng:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || c.email}) - Hạng {c.loyaltyTier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Gói dịch vụ trị liệu:
                </label>
                <select
                  value={selectedServiceSlug}
                  onChange={(e) => setSelectedServiceSlug(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {adminData?.services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} ({s.durationMin} phút - {s.priceVnd.toLocaleString('vi-VN')} đ)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Kỹ thuật viên phụ trách:
                  </label>
                  <select
                    value={selectedTherapistId}
                    onChange={(e) => setSelectedTherapistId(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  >
                    <option value="">-- Chọn KTV --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Phòng trị liệu:
                </label>
                <input
                  type="text"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Ghi chú lịch hẹn:
                </label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  rows={2}
                  placeholder="Lưu ý khách mỏi vai gáy hoặc cần tập trung..."
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang kiểm tra...' : 'Xác Nhận Đặt Lịch'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 4. Modal Điều Chuyển / Xem Chi Tiết Lịch Hẹn */}
      {editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-lg border-[#D4B996] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <div>
                <CardTitle className="font-serif text-xl text-[#1F2B24]">
                  Chi Tiết & Điều Chuyển Lịch Hẹn
                </CardTitle>
                <div className="text-xs text-[#8C827A]">
                  Khách hàng: <strong className="text-[#1F2B24]">{editingApt.customerName}</strong>{' '}
                  ({editingApt.customerPhone || 'Chưa có SĐT'})
                </div>
              </div>
              <button
                onClick={() => setEditingApt(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAppointment} className="mt-4 space-y-4">
              <div className="space-y-1 rounded-xl border border-[#E2D9CC] bg-white p-3 text-xs">
                <div>
                  <span className="text-[#8C827A]">Dịch vụ:</span>{' '}
                  <strong>{editingApt.serviceName}</strong> ({editingApt.durationMin} phút)
                </div>
                <div>
                  <span className="text-[#8C827A]">Thời gian:</span>{' '}
                  <strong>
                    {new Date(editingApt.startAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(editingApt.endAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </div>
                <div>
                  <span className="text-[#8C827A]">Ghi chú:</span>{' '}
                  <span>{editingApt.notes || 'Không có ghi chú'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Điều chuyển sang Kỹ thuật viên khác:
                </label>
                <select
                  value={reassignTherapistId}
                  onChange={(e) => setReassignTherapistId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.id === editingApt.therapistId ? '(Hiện tại)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Trạng thái:</label>
                  <select
                    value={reassignStatus}
                    onChange={(e) => setReassignStatus(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  >
                    <option value="SCHEDULED">SCHEDULED (Đã đặt)</option>
                    <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
                    {editingApt.status === 'IN_PROGRESS' && (
                      <option value="IN_PROGRESS" disabled>
                        ⚡ IN_PROGRESS (KTV đang thực hiện)
                      </option>
                    )}
                    {editingApt.status === 'COMPLETED' && (
                      <option value="COMPLETED" disabled>
                        ✓ COMPLETED (KTV đã hoàn thành)
                      </option>
                    )}
                    <option value="CANCELLED">CANCELLED (Hủy ca)</option>
                  </select>
                  <p className="mt-1 text-[10px] text-[#8C827A] italic">
                    * Thao tác Bắt đầu làm & Hoàn tất ca do KTV trực tiếp thao tác tại buồng.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Phòng:</label>
                  <input
                    type="text"
                    value={reassignRoom}
                    onChange={(e) => setReassignRoom(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCancelApt(editingApt.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Hủy Lịch Hẹn
                </Button>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingApt(null)}>
                    Đóng
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
