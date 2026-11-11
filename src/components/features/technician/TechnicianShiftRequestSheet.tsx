'use client';

import * as React from 'react';
import { Button, Badge } from '@/components/ui';
import {
  getMyLeaveRequestsAction,
  getColleagueTherapistsAction,
  submitLeaveOrSwapRequestAction,
  type MyLeaveRequestItem,
  type ColleagueTherapistItem,
} from '@/application/therapist/actions';

export function TechnicianShiftRequestSheet() {
  const [requests, setRequests] = React.useState<MyLeaveRequestItem[]>([]);
  const [colleagues, setColleagues] = React.useState<ColleagueTherapistItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Form
  const [type, setType] = React.useState<'SICK' | 'VACATION' | 'PERSONAL' | 'SWAP_SHIFT'>(
    'PERSONAL',
  );
  const [startDateStr, setStartDateStr] = React.useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [endDateStr, setEndDateStr] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = React.useState('');
  const [swapWithStaffId, setSwapWithStaffId] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [reqRes, colRes] = await Promise.all([
      getMyLeaveRequestsAction(),
      getColleagueTherapistsAction(),
    ]);
    if (reqRes.ok) setRequests(reqRes.value);
    if (colRes.ok) setColleagues(colRes.value);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setFeedback({ type: 'error', msg: 'Vui lòng ghi rõ lý do xin nghỉ hoặc đổi ca.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const res = await submitLeaveOrSwapRequestAction({
      type,
      startDateStr,
      endDateStr,
      reason,
      swapWithStaffId: type === 'SWAP_SHIFT' ? swapWithStaffId : undefined,
    });

    if (res.ok) {
      setFeedback({ type: 'success', msg: res.value.message });
      setReason('');
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Form gửi đơn xin nghỉ/đổi ca */}
      <div className="rounded-2xl border border-[#E2D9CC] bg-white p-4 shadow-sm">
        <h3 className="font-serif text-sm font-bold text-[#1F2B24]">
          Gửi Đơn Xin Nghỉ Phép / Đổi Ca Trực
        </h3>
        <p className="mt-0.5 text-[11px] text-[#635B54]">
          Đơn sẽ được gửi trực tiếp tới Quản trị viên để xét duyệt.
        </p>

        {feedback && (
          <div
            className={`mt-3 rounded-xl border p-2.5 text-xs font-medium ${
              feedback.type === 'success'
                ? 'border-[#4E6B56]/30 bg-[#E8EFE9] text-[#1F2B24]'
                : 'border-red-300 bg-red-50 text-red-700'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#635B54]">Loại yêu cầu:</label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'SICK' | 'VACATION' | 'PERSONAL' | 'SWAP_SHIFT')
              }
              className="mt-1 w-full rounded-xl border border-[#D4B996] bg-[#FAF7F2] p-2 text-xs text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
            >
              <option value="PERSONAL">Việc riêng đột xuất</option>
              <option value="SICK">Nghỉ ốm / Khám sức khỏe</option>
              <option value="VACATION">Nghỉ phép năm (Du lịch / Về quê)</option>
              <option value="SWAP_SHIFT">Đổi ca trực cùng đồng nghiệp</option>
            </select>
          </div>

          {type === 'SWAP_SHIFT' && (
            <div>
              <label className="block text-[11px] font-semibold text-[#635B54]">
                Chọn KTV đổi ca cùng:
              </label>
              <select
                value={swapWithStaffId}
                onChange={(e) => setSwapWithStaffId(e.target.value)}
                required={type === 'SWAP_SHIFT'}
                className="mt-1 w-full rounded-xl border border-[#D4B996] bg-[#FAF7F2] p-2 text-xs text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
              >
                <option value="">-- Chọn đồng nghiệp KTV --</option>
                {colleagues.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (KTV)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#635B54]">Từ ngày:</label>
              <input
                type="date"
                required
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#D4B996] bg-[#FAF7F2] p-1.5 text-xs text-[#2B2622]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#635B54]">Đến ngày:</label>
              <input
                type="date"
                required
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#D4B996] bg-[#FAF7F2] p-1.5 text-xs text-[#2B2622]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#635B54]">
              Lý do chi tiết:
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ghi rõ lý do để quản lý duyệt nhanh..."
              className="mt-1 w-full rounded-xl border border-[#D4B996] bg-[#FAF7F2] p-2 text-xs text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full py-2.5 text-xs"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Đơn Cho Quản Lý Duyệt'}
          </Button>
        </form>
      </div>

      {/* 2. Lịch sử các đơn đã gửi */}
      <div className="rounded-2xl border border-[#E2D9CC] bg-white p-4 shadow-sm">
        <h4 className="border-b border-[#E2D9CC]/60 pb-2 font-serif text-sm font-bold text-[#1F2B24]">
          Lịch Sử Đơn Của Bạn
        </h4>
        <div className="mt-3 space-y-2">
          {isLoading ? (
            <div className="py-3 text-center text-xs text-[#635B54]">Đang tải lịch sử đơn...</div>
          ) : requests.length === 0 ? (
            <div className="py-3 text-center text-xs text-[#635B54]">Bạn chưa gửi đơn nào.</div>
          ) : (
            requests.map((r) => (
              <div
                key={r.id}
                className="space-y-1 rounded-xl border border-[#E2D9CC]/60 bg-[#FAF7F2]/50 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F2B24]">{r.type}</span>
                  <Badge
                    variant={
                      r.status === 'APPROVED'
                        ? 'success'
                        : r.status === 'REJECTED'
                          ? 'terracotta'
                          : 'warning'
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-[#635B54]">
                  Thời gian: {new Date(r.startDate).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(r.endDate).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-[11px] text-[#635B54] italic">&ldquo;{r.reason}&rdquo;</div>
                {r.swapWithStaffName && (
                  <div className="text-[11px] text-[#4E6B56]">
                    Đổi ca với: <strong>{r.swapWithStaffName}</strong>
                  </div>
                )}
                {r.reviewNote && (
                  <div className="rounded-lg border border-[#E2D9CC] bg-white p-1.5 text-[11px] font-medium text-[#1F2B24]">
                    Phản hồi từ Admin: {r.reviewNote}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
