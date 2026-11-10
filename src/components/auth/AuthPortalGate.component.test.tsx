import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthPortalGate } from './AuthPortalGate';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock actions
vi.mock('@/application/auth/actions', () => ({
  loginAction: vi.fn().mockResolvedValue({ success: true }),
  registerAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe('AuthPortalGate (Cổng Xác Thực Bắt Buộc MK SPA Dành Riêng Cho Khách Hàng)', () => {
  it('hiển thị Cổng chào MK SPA khi chưa đăng nhập (isAuthenticated = false) và ẩn các tài khoản có sẵn', () => {
    render(
      <AuthPortalGate isAuthenticated={false}>
        <div data-testid="protected-content">Nội dung bên trong Spa</div>
      </AuthPortalGate>,
    );

    // Không hiển thị nội dung bên trong
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

    // Hiển thị tiêu đề và nút đăng nhập/đăng ký khách hàng
    expect(screen.getByText('MK SPA Botanical')).toBeInTheDocument();
    expect(screen.getByText('Đăng Nhập')).toBeInTheDocument();
    expect(screen.getByText('Đăng Ký Thành Viên')).toBeInTheDocument();
    expect(screen.getByText('Đăng Nhập Khách Hàng →')).toBeInTheDocument();

    // Các tài khoản có sẵn (KTV, Quản Trị Viên, Khách VIP) đều đã được ẩn theo yêu cầu
    expect(screen.queryByText('Kỹ Thuật Viên')).not.toBeInTheDocument();
    expect(screen.queryByText('Quản Trị Viên')).not.toBeInTheDocument();
    expect(screen.queryByText('Khách Hàng VIP')).not.toBeInTheDocument();
  });

  it('chuyển đổi tab sang Đăng ký thành viên và hiển thị lựa chọn nốt hương', async () => {
    render(
      <AuthPortalGate isAuthenticated={false}>
        <div data-testid="protected-content">Nội dung bên trong Spa</div>
      </AuthPortalGate>,
    );

    const regTabBtn = screen.getByText('Đăng Ký Thành Viên');
    fireEvent.click(regTabBtn);

    // Chờ AnimatePresence chuyển giao diện tab
    expect(await screen.findByText(/Chọn nốt hương bạn yêu thích nhất/i)).toBeInTheDocument();
    expect(screen.getByText('Sả Chanh Thanh Lọc')).toBeInTheDocument();
    expect(screen.getByText('Hoa Nhài Ngủ Sâu')).toBeInTheDocument();
    expect(screen.getByText('Gỗ Trầm Tĩnh Tâm')).toBeInTheDocument();
  });

  it('cho phép xem nội dung bên trong ngay lập tức khi isAuthenticated = true', () => {
    render(
      <AuthPortalGate isAuthenticated={true}>
        <div data-testid="protected-content">Nội dung bên trong Spa</div>
      </AuthPortalGate>,
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText('Đăng Nhập Khách Hàng →')).not.toBeInTheDocument();
  });
});
