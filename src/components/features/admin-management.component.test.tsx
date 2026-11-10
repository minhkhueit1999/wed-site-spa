import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import QuanTriPage from '@/app/(admin)/quan-tri/page';

// Mock admin actions
vi.mock('@/application/admin/actions', () => ({
  getAdminStatsAction: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      counts: {
        customers: 15,
        therapists: 4,
        treatmentPlans: 8,
        appointments: 22,
        services: 4,
        products: 6,
        rules: 5,
        contraindications: 5,
      },
      plansByStatus: [
        { status: 'IN_TREATMENT', count: 12 },
        { status: 'HOME_CARE', count: 8 },
      ],
      recentAuditLogs: [
        {
          id: 'log-1',
          action: 'LOGIN',
          actorName: 'Admin Minh',
          actorEmail: 'admin@spa.vn',
          targetType: 'USER',
          targetId: 'user-1',
          at: '2026-11-10T10:00:00.000Z',
        },
      ],
    },
  }),
  getAllAdminDataAction: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      services: [
        {
          slug: 'thu-gian-sau',
          name: 'Liệu Trình Thư Giãn Sâu',
          description: 'Hỗ trợ giấc ngủ sâu',
          durationMin: 75,
          sessionsRecommended: 6,
          priceVnd: 750000,
          serviceProducts: [],
        },
      ],
      products: [
        {
          slug: 'tinh-dau-thu-gian',
          name: 'Tinh Dầu Thảo Mộc Thư Giãn',
          description: 'Hỗ trợ ngủ ngon',
          usageGuide: 'Thoa 2 giọt thái dương',
          priceVnd: 280000,
        },
      ],
      rules: [
        {
          id: 'R-001',
          concernSlug: 'mat-ngu',
          minSeverity: 2,
          serviceSlug: 'thu-gian-sau',
          productSlugs: '["tinh-dau-thu-gian"]',
          priority: 5,
          rationale: 'Hỗ trợ người mất ngủ',
        },
      ],
      contraindications: [
        {
          id: 'ci-1',
          flag: 'pregnant',
          message: 'Không áp dụng bấm huyệt mạnh cho phụ nữ mang thai',
          blocksServiceSlugs: '["giai-toa-vai-gay"]',
          blocksProductSlugs: '[]',
          requiresStaffReview: true,
        },
      ],
      concerns: [],
    },
  }),
  simulateRulesAction: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      recommendations: [
        {
          serviceSlug: 'thu-gian-sau',
          productSlugs: ['tinh-dau-thu-gian'],
          score: 8,
          reasons: [{ ruleId: 'R-001', text: 'Khớp triệu chứng mất ngủ' }],
        },
      ],
      appliedRulesCount: 1,
      totalActiveRules: 5,
    },
  }),
  createServiceAction: vi.fn().mockResolvedValue({ ok: true, value: { slug: 'new-service' } }),
  deleteServiceAction: vi.fn().mockResolvedValue({ ok: true, value: { message: 'Đã xóa' } }),
  createProductAction: vi.fn().mockResolvedValue({ ok: true, value: { slug: 'new-prod' } }),
  deleteProductAction: vi.fn().mockResolvedValue({ ok: true, value: { message: 'Đã xóa' } }),
  createRuleAction: vi.fn().mockResolvedValue({ ok: true, value: { id: 'R-NEW' } }),
  deleteRuleAction: vi.fn().mockResolvedValue({ ok: true, value: { message: 'Đã xóa' } }),
  createContraindicationAction: vi.fn().mockResolvedValue({ ok: true, value: { id: 'ci-new' } }),
  deleteContraindicationAction: vi
    .fn()
    .mockResolvedValue({ ok: true, value: { message: 'Đã xóa' } }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Admin Management Component (/quan-tri)', () => {
  it('hiển thị số liệu thống kê tổng quan và bảng AuditLog', async () => {
    render(<QuanTriPage />);

    await waitFor(() => {
      expect(screen.getByText('Bảng Điều Khiển Quản Trị Spa')).toBeInTheDocument();
    });

    expect(screen.getByText('15')).toBeInTheDocument(); // Khách hàng
    expect(screen.getByText('4')).toBeInTheDocument(); // Kỹ thuật viên
    expect(screen.getByText('Nhật Ký Kiểm Toán (AuditLog)')).toBeInTheDocument();
    expect(screen.getByText(/Admin Minh \(admin@spa\.vn\)/)).toBeInTheDocument();
  });

  it('chuyển sang tab Quy tắc và chạy mô phỏng Live Preview', async () => {
    render(<QuanTriPage />);

    await waitFor(() => {
      expect(screen.getByText('Bảng Điều Khiển Quản Trị Spa')).toBeInTheDocument();
    });

    // Chuyển tab Quy tắc
    fireEvent.click(screen.getByText(/Quy tắc & Live Preview/));
    expect(screen.getByText('Quy Tắc Đề Xuất (Rule Engine)')).toBeInTheDocument();
    expect(screen.getByText('R-001')).toBeInTheDocument();

    // Bấm nút chạy mô phỏng
    const simBtn = screen.getByText('⚡ Chạy Mô Phỏng Live Preview');
    fireEvent.click(simBtn);

    await waitFor(() => {
      expect(screen.getByText('Kết quả từ Rule Engine:')).toBeInTheDocument();
      expect(screen.getAllByText(/Dịch vụ: thu-gian-sau/)[0]).toBeInTheDocument();
      expect(screen.getByText(/Khớp triệu chứng mất ngủ/)).toBeInTheDocument();
    });
  });
});
