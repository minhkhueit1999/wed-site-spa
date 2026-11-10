import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import TuiLieuTrinhPage from '@/app/(public)/tui-lieu-trinh/page';

// Mock server action
vi.mock('@/application/booking/actions', () => ({
  getBookingDetailsAction: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      service: {
        slug: 'thu-gian-sau',
        name: 'Liệu Trình Thư Giãn Sâu & Phục Hồi Giấc Ngủ',
        description: 'Giải tỏa căng thẳng hệ thần kinh.',
        durationMin: 75,
        sessions: 6,
        priceVnd: 750000,
      },
      homeCareProducts: [
        {
          slug: 'tinh-dau-thu-gian',
          name: 'Tinh Dầu Thảo Mộc Thư Giãn',
          description: 'Hỗ trợ giấc ngủ sâu',
          usageGuide: 'Thoa thái dương và lòng bàn tay trước khi ngủ',
          morningNight: 'Tối',
          priceVnd: 280000,
        },
      ],
      therapists: [
        { id: 'th-1', name: 'Kỹ Thuật Viên Mai' },
        { id: 'th-2', name: 'Kỹ Thuật Viên An' },
      ],
      currentUser: {
        id: 'user-1',
        name: 'Khách Demo',
        email: 'khach@demo.vn',
      },
    },
  }),
  submitCareBundleBookingAction: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      planId: 'plan-test-123',
      appointmentId: 'apt-test-123',
      careBundleId: 'bundle-test-123',
      status: 'CONFIRMED',
      planState: 'BUNDLE_CONFIRMED',
      serviceName: 'Liệu Trình Thư Giãn Sâu & Phục Hồi Giấc Ngủ',
      therapistName: 'Kỹ Thuật Viên Mai',
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 86400000 + 75 * 60000).toISOString(),
      homeCareProducts: [{ slug: 'tinh-dau-thu-gian', name: 'Tinh Dầu Thảo Mộc Thư Giãn' }],
      totalVnd: 750000,
      requiresReview: false,
      message: 'Túi liệu trình và lịch hẹn đã được xác nhận thành công!',
    },
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'serviceSlug' ? 'thu-gian-sau' : null),
  }),
}));

describe('Unified Booking Component (/tui-lieu-trinh)', () => {
  it('hiển thị thông tin phác đồ và toa sản phẩm dưỡng tại nhà đi kèm', async () => {
    render(<TuiLieuTrinhPage />);

    await waitFor(() => {
      expect(screen.getByText('Liệu Trình Thư Giãn Sâu & Phục Hồi Giấc Ngủ')).toBeInTheDocument();
    });

    expect(screen.getByText('Tinh Dầu Thảo Mộc Thư Giãn')).toBeInTheDocument();
    expect(screen.getByText('Xác nhận túi liệu trình & Đặt lịch hẹn')).toBeInTheDocument();
  });

  it('báo lỗi khi chưa chọn đồng ý xử lý dữ liệu sức khỏe', async () => {
    render(<TuiLieuTrinhPage />);

    await waitFor(() => {
      expect(screen.getByText('Liệu Trình Thư Giãn Sâu & Phục Hồi Giấc Ngủ')).toBeInTheDocument();
    });

    const submitBtn = screen.getByText('Xác nhận túi liệu trình & Đặt lịch hẹn');
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Vui lòng đồng ý cho phép xử lý dữ liệu/)).toBeInTheDocument();
    });
  });
});
