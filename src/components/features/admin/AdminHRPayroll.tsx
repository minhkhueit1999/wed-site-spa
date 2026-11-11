'use client';

import * as React from 'react';
import { Button, Card, CardTitle, Badge } from '@/components/ui';
import {
  getStaffListAction,
  createStaffAccountAction,
  updateStaffRoleAction,
  getStaffShiftsAction,
  assignStaffShiftAction,
  getLeaveRequestsAction,
  reviewLeaveRequestAction,
  getStaffPayrollsAction,
  recalculateStaffPayrollAction,
  resetStaffPasswordAction,
  type StaffListItem,
  type ShiftRosterItem,
  type LeaveRequestItem,
  type PayrollItem,
} from '@/application/admin/actions';
import { formatCurrencyVND } from '@/lib/utils';

export function AdminHRPayroll() {
  const [subTab, setSubTab] = React.useState<'roster' | 'shifts' | 'leave' | 'payroll'>('roster');
  const [staffList, setStaffList] = React.useState<StaffListItem[]>([]);
  const [shifts, setShifts] = React.useState<ShiftRosterItem[]>([]);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequestItem[]>([]);
  const [payrolls, setPayrolls] = React.useState<PayrollItem[]>([]);
  const [selectedMonth, setSelectedMonth] = React.useState('2026-11');
  const [isLoading, setIsLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  // Form thêm nhân sự mới
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<'THERAPIST' | 'ADMIN'>('THERAPIST');
  const [newPassword, setNewPassword] = React.useState('SpaDemo2026!');
  const [isCreatingStaff, setIsCreatingStaff] = React.useState(false);

  // Form gán ca làm việc
  const [assignStaffId, setAssignStaffId] = React.useState('');
  const [assignDate, setAssignDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [assignShiftType, setAssignShiftType] = React.useState('MORNING');
  const [assignStartTime, setAssignStartTime] = React.useState('08:30');
  const [assignEndTime, setAssignEndTime] = React.useState('14:30');
  const [assignNotes, setAssignNotes] = React.useState('Phòng VIP Thảo Mộc');
  const [isAssigning, setIsAssigning] = React.useState(false);

  // Modal cấp lại mật khẩu ngẫu nhiên
  const [resetModalData, setResetModalData] = React.useState<{
    staffName: string;
    tempPassword: string;
  } | null>(null);

  const handleResetPassword = async (staffId: string, staffName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn cấp lại mật khẩu tạm thời cho ${staffName}?`)) return;
    const res = await resetStaffPasswordAction(staffId);
    if (res.ok) {
      setResetModalData({
        staffName: res.value.staffName,
        tempPassword: res.value.tempPassword,
      });
      setFeedback({
        type: 'success',
        msg: `Đã cấp mật khẩu ngẫu nhiên mới cho ${res.value.staffName}.`,
      });
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 3);
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const [staffRes, shiftRes, leaveRes, payrollRes] = await Promise.all([
      getStaffListAction(),
      getStaffShiftsAction(startOfWeek.toISOString(), endOfWeek.toISOString()),
      getLeaveRequestsAction(),
      getStaffPayrollsAction(selectedMonth),
    ]);

    if (staffRes.ok) setStaffList(staffRes.value);
    if (shiftRes.ok) setShifts(shiftRes.value);
    if (leaveRes.ok) setLeaveRequests(leaveRes.value);
    if (payrollRes.ok) setPayrolls(payrollRes.value);
    setIsLoading(false);
  }, [selectedMonth]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Thêm nhân sự mới
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingStaff(true);
    setFeedback(null);

    const res = await createStaffAccountAction({
      name: newName,
      email: newEmail,
      role: newRole,
      password: newPassword,
    });

    if (res.ok) {
      setFeedback({ type: 'success', msg: `Đã tạo tài khoản cho ${res.value.name}!` });
      setNewName('');
      setNewEmail('');
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsCreatingStaff(false);
  };

  // Gán ca làm
  const handleAssignShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStaffId) {
      setFeedback({ type: 'error', msg: 'Vui lòng chọn nhân viên.' });
      return;
    }
    setIsAssigning(true);
    setFeedback(null);

    const res = await assignStaffShiftAction({
      staffId: assignStaffId,
      dateStr: assignDate,
      shiftType: assignShiftType,
      startTime: assignStartTime,
      endTime: assignEndTime,
      notes: assignNotes,
    });

    if (res.ok) {
      setFeedback({ type: 'success', msg: 'Đã phân công ca làm việc thành công!' });
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsAssigning(false);
  };

  // Duyệt đơn nghỉ phép
  const handleReviewLeave = async (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    defaultNote: string,
  ) => {
    const note = window.prompt(`Nhập phản hồi duyệt đơn (${status}):`, defaultNote);
    if (note === null) return;

    const res = await reviewLeaveRequestAction(requestId, status, note);
    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} đơn!`,
      });
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  // Tính lại lương tháng
  const handleRecalculatePayroll = async (staffId: string) => {
    const res = await recalculateStaffPayrollAction(staffId, selectedMonth);
    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `Đã cập nhật lương cho ${res.value.staffName}: ${formatCurrencyVND(res.value.totalEarningsVnd)}`,
      });
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2D9CC] bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2B24]">
            Nhân Sự, Phân Ca & Tính Lương Tự Động
          </h2>
          <p className="text-sm text-[#635B54]">
            Quản trị hồ sơ KTV, lịch trực, duyệt nghỉ phép và engine tính hoa hồng bán chéo theo cấp
            bậc.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-1">
          <button
            onClick={() => setSubTab('roster')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              subTab === 'roster'
                ? 'bg-[#1F2B24] text-white shadow-xs'
                : 'text-[#635B54] hover:text-[#1F2B24]'
            }`}
          >
            👥 Nhân Sự ({staffList.length})
          </button>
          <button
            onClick={() => setSubTab('shifts')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              subTab === 'shifts'
                ? 'bg-[#1F2B24] text-white shadow-xs'
                : 'text-[#635B54] hover:text-[#1F2B24]'
            }`}
          >
            📅 Phân Ca ({shifts.length})
          </button>
          <button
            onClick={() => setSubTab('leave')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              subTab === 'leave'
                ? 'bg-[#1F2B24] text-white shadow-xs'
                : 'text-[#635B54] hover:text-[#1F2B24]'
            }`}
          >
            📬 Duyệt Phép ({leaveRequests.filter((r) => r.status === 'PENDING').length} chờ)
          </button>
          <button
            onClick={() => setSubTab('payroll')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              subTab === 'payroll'
                ? 'bg-[#1F2B24] text-white shadow-xs'
                : 'text-[#635B54] hover:text-[#1F2B24]'
            }`}
          >
            💰 Bảng Lương ({selectedMonth})
          </button>
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

      {/* 2. SUB-TAB 1: DANH SÁCH NHÂN SỰ */}
      {subTab === 'roster' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Cột trái: Danh sách nhân viên */}
          <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm lg:col-span-8">
            <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
              Đội Ngũ Nhân Sự Cơ Sở MK SPA
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#2B2622]">
                <thead className="bg-[#FAF7F2]/60 text-xs text-[#8C827A] uppercase">
                  <tr>
                    <th className="p-3.5">Họ và Tên</th>
                    <th className="p-3.5">Email / Đăng nhập</th>
                    <th className="p-3.5">Vai Trò</th>
                    <th className="p-3.5">Ca Trực Sắp Tới</th>
                    <th className="p-3.5">Buổi Đã Làm</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D9CC]/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-[#8C827A]">
                        Đang tải danh sách nhân sự...
                      </td>
                    </tr>
                  ) : staffList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-[#8C827A]">
                        Chưa có nhân sự nào trong hệ thống.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAF7F2]/40">
                        <td className="p-3.5 font-bold text-[#1F2B24]">{s.name}</td>
                        <td className="p-3.5 font-mono text-xs text-[#635B54]">{s.email}</td>
                        <td className="p-3.5">
                          <Badge variant={s.role === 'ADMIN' ? 'terracotta' : 'primary'}>
                            {s.role}
                          </Badge>
                        </td>
                        <td className="p-3.5 font-semibold text-[#4E6B56]">
                          {s.activeShiftsCount} ca
                        </td>
                        <td className="p-3.5 font-semibold">{s.completedAppointmentsCount} buổi</td>
                        <td className="p-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetPassword(s.id, s.name)}
                            >
                              🔑 Reset MK
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newRole = s.role === 'THERAPIST' ? 'ADMIN' : 'THERAPIST';
                                if (confirm(`Đổi vai trò của ${s.name} sang ${newRole}?`)) {
                                  updateStaffRoleAction(s.id, newRole).then(loadData);
                                }
                              }}
                            >
                              Đổi Vai Trò
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cột phải: Form tạo nhân viên mới */}
          <div className="lg:col-span-4">
            <Card className="border-[#D4B996] bg-[#FAF7F2] p-5 shadow-xs">
              <CardTitle className="font-serif text-lg text-[#1F2B24]">Thêm Nhân Sự Mới</CardTitle>
              <form onSubmit={handleCreateStaff} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Họ và tên:</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="VD: Đặng Thu Trang"
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Email:</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="thutrang@spawellness.vn"
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Vai trò:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'THERAPIST' | 'ADMIN')}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  >
                    <option value="THERAPIST">THERAPIST (Kỹ thuật viên trị liệu)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên spa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Mật khẩu ban đầu:
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 font-mono text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="mt-2 w-full"
                  disabled={isCreatingStaff}
                >
                  {isCreatingStaff ? 'Đang tạo...' : '+ Tạo Tài Khoản'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB 2: PHÂN CA LÀM VIỆC */}
      {subTab === 'shifts' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Lịch phân ca */}
          <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm lg:col-span-8">
            <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
              Lịch Phân Ca Tuần Này
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#2B2622]">
                <thead className="bg-[#FAF7F2]/60 text-xs text-[#8C827A] uppercase">
                  <tr>
                    <th className="p-3.5">Ngày</th>
                    <th className="p-3.5">Kỹ Thuật Viên</th>
                    <th className="p-3.5">Loại Ca</th>
                    <th className="p-3.5">Giờ Trực</th>
                    <th className="p-3.5">Ghi Chú Buồng</th>
                    <th className="p-3.5">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D9CC]/60">
                  {shifts.map((shift) => (
                    <tr key={shift.id} className="hover:bg-[#FAF7F2]/40">
                      <td className="p-3.5 font-semibold">
                        {new Date(shift.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3.5 font-bold text-[#1F2B24]">{shift.staffName}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            shift.shiftType === 'FULL_DAY'
                              ? 'terracotta'
                              : shift.shiftType === 'MORNING'
                                ? 'primary'
                                : 'outline'
                          }
                        >
                          {shift.shiftType}
                        </Badge>
                      </td>
                      <td className="p-3.5 font-mono text-xs">
                        {shift.startTime} - {shift.endTime}
                      </td>
                      <td className="p-3.5 text-xs text-[#635B54]">{shift.notes || '—'}</td>
                      <td className="p-3.5">
                        <Badge variant="success">{shift.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form gán ca */}
          <div className="lg:col-span-4">
            <Card className="border-[#D4B996] bg-[#FAF7F2] p-5 shadow-xs">
              <CardTitle className="font-serif text-lg text-[#1F2B24]">Phân Công Ca Trực</CardTitle>
              <form onSubmit={handleAssignShift} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Nhân viên:</label>
                  <select
                    value={assignStaffId}
                    onChange={(e) => setAssignStaffId(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
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
                  <label className="block text-xs font-semibold text-[#635B54]">Ngày trực:</label>
                  <input
                    type="date"
                    required
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Loại ca:</label>
                  <select
                    value={assignShiftType}
                    onChange={(e) => setAssignShiftType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  >
                    <option value="MORNING">Ca Sáng (08:30 - 14:30)</option>
                    <option value="AFTERNOON">Ca Chiều (14:00 - 20:30)</option>
                    <option value="FULL_DAY">Cả Ngày (08:30 - 20:30)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#635B54]">Bắt đầu:</label>
                    <input
                      type="time"
                      value={assignStartTime}
                      onChange={(e) => setAssignStartTime(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#635B54]">Kết thúc:</label>
                    <input
                      type="time"
                      value={assignEndTime}
                      onChange={(e) => setAssignEndTime(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Buồng phân công:
                  </label>
                  <input
                    type="text"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="Phòng VIP 1"
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622]"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="mt-2 w-full"
                  disabled={isAssigning}
                >
                  {isAssigning ? 'Đang lưu...' : '+ Gán Ca Trực'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 3: DUYỆT ĐƠN NGHỈ PHÉP */}
      {subTab === 'leave' && (
        <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
          <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
            Hộp Thư Xét Duyệt Đơn Nghỉ Phép & Đổi Ca Trực
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2B2622]">
              <thead className="bg-[#FAF7F2]/60 text-xs text-[#8C827A] uppercase">
                <tr>
                  <th className="p-3.5">Kỹ Thuật Viên</th>
                  <th className="p-3.5">Loại Đơn</th>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Lý Do Đơn</th>
                  <th className="p-3.5">Đổi Ca Với</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Phê Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9CC]/60">
                {leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF7F2]/40">
                    <td className="p-3.5">
                      <div className="font-bold text-[#1F2B24]">{req.staffName}</div>
                      <div className="text-xs text-[#8C827A]">{req.staffEmail}</div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline">{req.type}</Badge>
                    </td>
                    <td className="p-3.5 text-xs">
                      {new Date(req.startDate).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(req.endDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="max-w-xs p-3.5 text-xs text-[#635B54]">{req.reason}</td>
                    <td className="p-3.5 text-xs font-medium text-[#4E6B56]">
                      {req.swapWithStaffName || '—'}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          req.status === 'APPROVED'
                            ? 'success'
                            : req.status === 'REJECTED'
                              ? 'terracotta'
                              : 'warning'
                        }
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              handleReviewLeave(req.id, 'APPROVED', 'Đã đồng ý cho nghỉ.')
                            }
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleReviewLeave(req.id, 'REJECTED', 'Thiếu người trực ca.')
                            }
                          >
                            Từ Chối
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#8C827A]">
                          {req.reviewNote || 'Đã xử lý'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 4: BẢNG LƯƠNG & HOA HỒNG */}
      {subTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#635B54]">Kỳ lương tháng:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-[#D4B996] bg-white px-3 py-1.5 text-sm font-bold text-[#1F2B24] outline-hidden focus:border-[#4E6B56]"
              />
            </div>
            <Button size="sm" variant="outline" onClick={loadData}>
              🔄 Làm Mới Bảng Lương
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#2B2622]">
                <thead className="bg-[#FAF7F2] text-xs text-[#8C827A] uppercase">
                  <tr>
                    <th className="p-3.5">Kỹ Thuật Viên</th>
                    <th className="p-3.5">Cấp Bậc</th>
                    <th className="p-3.5">Lương Cứng</th>
                    <th className="p-3.5">Số Buổi Làm</th>
                    <th className="p-3.5">Thù Lao Buổi (50k/b)</th>
                    <th className="p-3.5">Hoa Hồng Bán Chéo</th>
                    <th className="p-3.5">Tiền Tip</th>
                    <th className="p-3.5 font-bold text-[#1F2B24]">Tổng Thu Nhập</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D9CC]/60">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/40">
                      <td className="p-3.5 font-bold text-[#1F2B24]">{p.staffName}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            p.tierLevel === 'MASTER'
                              ? 'warning'
                              : p.tierLevel === 'SENIOR'
                                ? 'primary'
                                : 'outline'
                          }
                        >
                          {p.tierLevel}
                        </Badge>
                      </td>
                      <td className="p-3.5 font-mono text-xs">
                        {formatCurrencyVND(p.baseSalaryVnd)}
                      </td>
                      <td className="p-3.5 font-bold text-[#4E6B56]">{p.completedSessions} ca</td>
                      <td className="p-3.5 font-mono text-xs">
                        {formatCurrencyVND(p.sessionAllowanceVnd)}
                      </td>
                      <td className="p-3.5 font-mono text-xs font-bold text-[#B85D38]">
                        {formatCurrencyVND(p.upsellCommissionVnd)}
                      </td>
                      <td className="p-3.5 font-mono text-xs">
                        {formatCurrencyVND(p.tipAmountVnd)}
                      </td>
                      <td className="p-3.5 font-mono text-base font-bold text-[#1F2B24]">
                        {formatCurrencyVND(p.totalEarningsVnd)}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRecalculatePayroll(p.staffId)}
                        >
                          ⚡ Tính Lại
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hiển thị Mật Khẩu Tạm Thời Sau Khi Reset */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-[#D4B996] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <CardTitle className="font-serif text-lg text-[#1F2B24]">
                🔑 Cấp Mật Khẩu Tạm Thành Công
              </CardTitle>
              <button
                onClick={() => setResetModalData(null)}
                className="text-lg text-[#8C827A] hover:text-[#1F2B24]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#2B2622]">
              <p>
                Đã đặt lại mật khẩu ngẫu nhiên cho nhân sự:{' '}
                <strong>{resetModalData.staffName}</strong>.
              </p>
              <p className="text-xs text-[#635B54]">
                Vì lý do an ninh, mật khẩu gốc đã được băm an toàn và không hiển thị. Bạn hãy sao
                chép mật khẩu tạm dưới đây để gửi cho nhân viên đăng nhập lần đầu:
              </p>

              <div className="flex items-center justify-between rounded-xl border border-[#4E6B56]/40 bg-[#E8EFE9] p-3 font-mono text-base font-bold text-[#1F2B24]">
                <span>{resetModalData.tempPassword}</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(resetModalData.tempPassword);
                    alert('Đã sao chép mật khẩu tạm vào clipboard!');
                  }}
                >
                  Sao Chép
                </Button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setResetModalData(null)}>
                Đóng
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
