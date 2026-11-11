'use client';

import * as React from 'react';
import { Button, CardTitle } from '@/components/ui';
import {
  submitSessionLogAction,
  transitionAppointmentStatusAction,
  type TechnicianMobileAppointment,
} from '@/application/therapist/actions';

interface Props {
  appointment: TechnicianMobileAppointment;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function TechnicianClinicalNotesSheet({ appointment, onClose, onSuccess }: Props) {
  const [notes, setNotes] = React.useState('');
  const [adjustments, setAdjustments] = React.useState('');
  const [nextAdvice, setNextAdvice] = React.useState('');
  const [scores, setScores] = React.useState<Record<string, number>>({
    stress: 4,
    sleep: 4,
    muscle: 4,
    skin: 4,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMsg('Vui lòng nhập nhận xét diễn tiến buổi trị liệu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // 1. Ghi SessionLog
    const logRes = await submitSessionLogAction({
      appointmentId: appointment.id,
      notes: notes.trim(),
      progressScores: scores,
      adjustments: adjustments.trim() || undefined,
      nextSessionAdvice: nextAdvice.trim() || undefined,
    });

    if (!logRes.ok) {
      setErrorMsg(logRes.error);
      setIsSubmitting(false);
      return;
    }

    // 2. Chuyển trạng thái sang COMPLETED
    await transitionAppointmentStatusAction(appointment.id, 'COMPLETED');
    await onSuccess();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="animate-in slide-in-from-bottom max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#D4B996] bg-[#FAF7F2] p-5 shadow-2xl duration-300 sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
          <div>
            <CardTitle className="font-serif text-lg text-[#1F2B24]">
              Ghi Chú Trị Liệu & Hoàn Thành Buổi
            </CardTitle>
            <div className="text-xs text-[#8C827A]">
              Khách hàng: <strong>{appointment.customerName}</strong> • {appointment.serviceName}
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-lg text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Đánh giá điểm phục hồi 1-5 */}
          <div className="space-y-3 rounded-2xl border border-[#E2D9CC] bg-white p-3.5">
            <div className="text-xs font-bold text-[#1F2B24] uppercase">
              Đánh Giá Tiến Triển Sau Buổi (1 - 5 Sao)
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#635B54]">Mức độ thư giãn / Stress:</span>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setScores((prev) => ({ ...prev, stress: val }))}
                      className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${
                        scores.stress === val
                          ? 'bg-[#405C4E] text-white shadow-xs'
                          : 'border border-[#E2D9CC] bg-[#FAF7F2] text-[#635B54]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#635B54]">Chất lượng giấc ngủ:</span>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setScores((prev) => ({ ...prev, sleep: val }))}
                      className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${
                        scores.sleep === val
                          ? 'bg-[#405C4E] text-white shadow-xs'
                          : 'border border-[#E2D9CC] bg-[#FAF7F2] text-[#635B54]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#635B54]">Giải tỏa căng cơ cổ vai:</span>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setScores((prev) => ({ ...prev, muscle: val }))}
                      className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${
                        scores.muscle === val
                          ? 'bg-[#405C4E] text-white shadow-xs'
                          : 'border border-[#E2D9CC] bg-[#FAF7F2] text-[#635B54]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#635B54]">Tình trạng bề mặt da:</span>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setScores((prev) => ({ ...prev, skin: val }))}
                      className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${
                        scores.skin === val
                          ? 'bg-[#405C4E] text-white shadow-xs'
                          : 'border border-[#E2D9CC] bg-[#FAF7F2] text-[#635B54]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#635B54]">
              Nhận xét lâm sàng trong buổi:
            </label>
            <textarea
              required
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Khách ngủ sâu 40 phút, vùng vai bớt gút thắt, phản ứng tốt với tinh dầu ấm..."
              className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-xs text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#635B54]">
              Điều chỉnh thao tác / lực bấm:
            </label>
            <input
              type="text"
              value={adjustments}
              onChange={(e) => setAdjustments(e.target.value)}
              placeholder="Giảm 20% lực ấn huyệt Kiên tỉnh, chườm ấm lâu hơn..."
              className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-xs text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#635B54]">
              Lời dặn khách chăm sóc tại nhà:
            </label>
            <input
              type="text"
              value={nextAdvice}
              onChange={(e) => setNextAdvice(e.target.value)}
              placeholder="Uống trà tim sen trước khi ngủ, ngâm chân muối ngải cứu..."
              className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-xs text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Đóng
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-2 bg-[#10B981] hover:bg-[#059669]"
            >
              {isSubmitting ? 'Đang lưu...' : '✓ Lưu & Kết Thúc Buổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
