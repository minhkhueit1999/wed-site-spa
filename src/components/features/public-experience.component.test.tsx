import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrieuChungPage from '@/app/(public)/trieu-chung/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Public Experience Components', () => {
  describe('Trang Triệu Chứng (/trieu-chung)', () => {
    it('hiển thị danh sách gói giải pháp ban đầu', () => {
      render(<TrieuChungPage />);
      expect(screen.getByText('Khó ngủ, ngủ chập chờn')).toBeInTheDocument();
      expect(screen.getByText('Mỏi vai gáy')).toBeInTheDocument();
      expect(screen.getByText('Da dễ kích ứng, nhạy cảm')).toBeInTheDocument();
    });

    it('tìm kiếm theo từ khóa không dấu "mat ngu" vẫn ra gói "Khó ngủ"', async () => {
      const user = userEvent.setup();
      render(<TrieuChungPage />);

      const searchInput = screen.getByLabelText(/tìm kiếm theo triệu chứng/i);
      await user.type(searchInput, 'mat ngu');

      expect(screen.getByText('Khó ngủ, ngủ chập chờn')).toBeInTheDocument();
      expect(screen.queryByText('Mỏi vai gáy')).not.toBeInTheDocument();
    });

    it('lọc theo danh mục Cơ vai gáy', async () => {
      const user = userEvent.setup();
      render(<TrieuChungPage />);

      const filterBtn = screen.getByRole('button', { name: 'Cơ vai gáy' });
      await user.click(filterBtn);

      expect(screen.getByText('Mỏi vai gáy')).toBeInTheDocument();
      expect(screen.queryByText('Khó ngủ, ngủ chập chờn')).not.toBeInTheDocument();
    });

    it('tuyệt đối KHÔNG chứa nút thêm vào giỏ hàng kiểu bán lẻ', () => {
      render(<TrieuChungPage />);
      expect(screen.queryByText(/thêm vào giỏ/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/giỏ hàng/i)).not.toBeInTheDocument();
    });
  });
});
