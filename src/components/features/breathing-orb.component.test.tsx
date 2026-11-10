import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { BreathingOrb3D } from './BreathingOrb3D';

describe('BreathingOrb3D Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('hiển thị trạng thái sẵn sàng ban đầu với hướng dẫn tiếng Việt', () => {
    render(<BreathingOrb3D />);

    expect(screen.getByText('Điều hòa nhịp thở 4-7-8')).toBeInTheDocument();
    expect(screen.getByText('Chuẩn bị')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bắt đầu thở/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('bắt đầu chu kỳ thở khi nhấn nút và hỗ trợ chuyển sang chế độ 2D', () => {
    vi.useFakeTimers();

    render(<BreathingOrb3D />);

    // Chuyển sang 2D
    const toggleModeBtn = screen.getByTitle(/chuyển đổi giao diện/i);
    fireEvent.click(toggleModeBtn);
    expect(toggleModeBtn.textContent).toContain('2D');

    // Bắt đầu thở
    const startBtn = screen.getByRole('button', { name: /bắt đầu thở/i });
    fireEvent.click(startBtn);

    // Kiểm tra phase Hít vào
    expect(screen.getByText('Hít vào sâu')).toBeInTheDocument();

    // Tiến tới 4 giây -> chuyển sang Giữ hơi
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByText('Giữ hơi tĩnh lặng')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
