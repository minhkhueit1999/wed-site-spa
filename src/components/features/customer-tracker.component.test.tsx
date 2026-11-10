import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import TaiKhoanPage from '@/app/(customer)/tai-khoan/page';

// Mock actions
vi.mock('@/application/customer/actions', () => ({
  getCustomerDashboardAction: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      user: {
        id: 'cust-123',
        name: 'Nguyễn Thị Hoa',
        email: 'hoa.nguyen@test.vn',
        consentAt: '2026-11-10T10:00:00.000Z',
      },
      activePlan: {
        id: 'plan-xyz',
        serviceName: 'Liệu Trình Thư Giãn Sâu & Phục Hồi Giấc Ngủ',
        serviceDescription: 'Giải tỏa áp lực tinh thần và phục hồi giấc ngủ.',
        totalSessions: 6,
        completedSessions: 2,
        progressPercent: 33,
        state: 'IN_TREATMENT',
        statePresentation: {
          label: 'Đang trong liệu trình',
          badgeVariant: 'primary',
          description: 'Khách hàng đang theo học phần trị liệu tại cơ sở cùng chuyên viên.',
          nextAction: {
            CUSTOMER: 'Theo dõi nhật ký sau mỗi buổi trị liệu',
          },
        },
        nextAction: 'Theo dõi nhật ký sau mỗi buổi trị liệu',
        prescriptions: [
          {
            id: 'pres-1',
            productName: 'Tinh Dầu Thảo Mộc Thư Giãn',
            productSlug: 'tinh-dau-thu-gian',
            instructions: 'Thoa 2 giọt vào thái dương trước khi ngủ',
            frequency: 'Mỗi tối',
            startDate: '2026-11-10T00:00:00.000Z',
          },
        ],
        stateHistory: [
          {
            id: 'h-1',
            from: 'RECOMMENDED',
            to: 'BUNDLE_CONFIRMED',
            event: 'CONFIRM_BUNDLE',
            reason: 'Khách xác nhận túi liệu trình',
            at: '2026-11-10T10:00:00.000Z',
          },
        ],
        appointments: [
          {
            id: 'apt-1',
            therapistName: 'Kỹ Thuật Viên Mai',
            startAt: '2026-11-12T09:30:00.000Z',
            endAt: '2026-11-12T10:45:00.000Z',
            status: 'SCHEDULED',
          },
        ],
        progressMetrics: [
          {
            sessionNumber: 1,
            date: '2026-11-10T09:30:00.000Z',
            notes: 'Khách đáp ứng tốt liệu trình bấm huyệt nhẹ.',
            scores: { stress: 4, sleep: 3 },
          },
        ],
      },
      allPlans: [],
    },
  }),
  exportCustomerDataAction: vi.fn().mockResolvedValue({
    ok: true,
    value: { id: 'cust-123', name: 'Nguyễn Thị Hoa' },
  }),
  deleteCustomerAccountAction: vi.fn().mockResolvedValue({
    ok: true,
    value: { message: 'Đã xóa' },
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Customer Tracker Component (/tai-khoan)', () => {
  it('hiển thị thông tin khách hàng, phác đồ, thanh tiến trình và toa chăm sóc tại nhà', async () => {
    render(<TaiKhoanPage />);

    await waitFor(() => {
      expect(screen.getByText('Chào Nguyễn Thị Hoa')).toBeInTheDocument();
    });

    expect(screen.getByText('Liệu Trình Thư Giãn Sâu & Phục Hồi Giấc Ngủ')).toBeInTheDocument();
    expect(screen.getByText('2 / 6')).toBeInTheDocument();
    expect(screen.getByText('33% hoàn thành')).toBeInTheDocument();
    expect(screen.getByText('Tinh Dầu Thảo Mộc Thư Giãn')).toBeInTheDocument();
    expect(screen.getByText('Theo dõi nhật ký sau mỗi buổi trị liệu')).toBeInTheDocument();
  });

  it('chuyển tab xem Lịch hẹn và Quyền riêng tư', async () => {
    render(<TaiKhoanPage />);

    await waitFor(() => {
      expect(screen.getByText('Chào Nguyễn Thị Hoa')).toBeInTheDocument();
    });

    // Chuyển sang tab Lịch hẹn
    fireEvent.click(screen.getByText(/Lịch hẹn của tôi/));
    expect(screen.getByText('Lịch hẹn đã đặt')).toBeInTheDocument();
    expect(screen.getByText('Kỹ Thuật Viên Mai')).toBeInTheDocument();

    // Chuyển sang tab Quyền riêng tư
    fireEvent.click(screen.getByText(/Quyền riêng tư & Dữ liệu/));
    expect(screen.getByText('Chính sách bảo mật & Quyền riêng tư')).toBeInTheDocument();
    expect(screen.getByText(/Tải xuống dữ liệu của tôi/)).toBeInTheDocument();
  });
});
