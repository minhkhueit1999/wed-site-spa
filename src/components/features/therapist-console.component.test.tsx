import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import KyThuatVienPage from '@/app/(therapist)/ky-thuat-vien/page';
import TherapistCustomerDetailPage from '@/app/(therapist)/ky-thuat-vien/khach/[id]/page';

// Mock therapist actions
vi.mock('@/application/therapist/actions', () => ({
  getTherapistScheduleAction: vi.fn().mockResolvedValue({
    ok: true,
    value: [
      {
        id: 'apt-test-1',
        startAt: '2026-11-12T09:30:00.000Z',
        endAt: '2026-11-12T10:45:00.000Z',
        status: 'SCHEDULED',
        customerName: 'Trần Thị Thu',
        customerEmail: 'thu.tran@test.vn',
        serviceName: 'Liệu Trình Thư Giãn Sâu',
        planId: 'plan-1',
        planState: 'BUNDLE_CONFIRMED',
        hasSessionLog: false,
        safetyFlagsCount: 1,
      },
    ],
  }),
  getAppointmentDetailAction: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      appointment: {
        id: 'apt-test-1',
        startAt: '2026-11-12T09:30:00.000Z',
        endAt: '2026-11-12T10:45:00.000Z',
        status: 'SCHEDULED',
      },
      customer: {
        id: 'cust-1',
        name: 'Trần Thị Thu',
        email: 'thu.tran@test.vn',
        notes: 'Khách hay đau nửa đầu',
        safetyFlags: ['allergy-essential-oil'],
        contraindicationWarnings: [
          'Chống chỉ định các loại tinh dầu nguyên chất có nồng độ cao do dị ứng.',
        ],
      },
      plan: {
        id: 'plan-1',
        serviceName: 'Liệu Trình Thư Giãn Sâu',
        serviceDescription: 'Phục hồi giấc ngủ và thần kinh.',
        totalSessions: 6,
        completedSessions: 0,
        state: 'BUNDLE_CONFIRMED',
        prescriptions: [],
        pastSessionLogs: [],
      },
      availableProducts: [
        {
          slug: 'tinh-dau-thu-gian',
          name: 'Tinh Dầu Thảo Mộc Thư Giãn',
          priceVnd: 280000,
          isBlocked: true,
          blockReason: 'Chống chỉ định do dị ứng tinh dầu',
        },
        {
          slug: 'tra-thao-moc-toi',
          name: 'Trà Thảo Mộc Buổi Tối',
          priceVnd: 180000,
          isBlocked: false,
        },
      ],
    },
  }),
  submitSessionLogAction: vi.fn().mockResolvedValue({
    ok: true,
    value: { sessionLogId: 'log-1', planState: 'IN_TREATMENT' },
  }),
  prescribeProductAction: vi.fn().mockResolvedValue({
    ok: true,
    value: { prescriptionId: 'pres-1' },
  }),
  finishSessionsAction: vi.fn().mockResolvedValue({
    ok: true,
    value: { nextState: 'HOME_CARE' },
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Therapist Console Components', () => {
  it('hiển thị danh sách lịch làm việc của kỹ thuật viên', async () => {
    render(<KyThuatVienPage />);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị Thu')).toBeInTheDocument();
    });

    expect(screen.getByText('Liệu Trình Thư Giãn Sâu')).toBeInTheDocument();
    expect(screen.getByText(/1 cờ an toàn/)).toBeInTheDocument();
    expect(screen.getByText('Mở hồ sơ & Ghi nhật ký →')).toBeInTheDocument();
  });

  it('hiển thị chi tiết hồ sơ khách hàng, cảnh báo an toàn và form SessionLog', async () => {
    render(<TherapistCustomerDetailPage params={Promise.resolve({ id: 'apt-test-1' })} />);

    await waitFor(() => {
      expect(screen.getByText('Hồ Sơ Trị Liệu: Trần Thị Thu')).toBeInTheDocument();
    });

    expect(screen.getByText(/CẢNH BÁO CHUYÊN MÔN: THỂ TRẠNG ĐẶC BIỆT/)).toBeInTheDocument();
    expect(screen.getByText(/Chống chỉ định các loại tinh dầu nguyên chất/)).toBeInTheDocument();
    expect(screen.getByText('Nhật Ký Buổi Trị Liệu (SessionLog)')).toBeInTheDocument();
    expect(screen.getByText('Lưu nhật ký & Hoàn thành buổi')).toBeInTheDocument();
  });
});
