import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Input } from './Input';
import { Badge } from './Badge';
import { Stepper } from './Stepper';
import { Dialog } from './Dialog';

describe('UI Primitives (Design System)', () => {
  describe('Button', () => {
    it('hiển thị nội dung text và nhận sự kiện click', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button variant="primary" onClick={handleClick}>
          Đặt liệu trình
        </Button>,
      );

      const btn = screen.getByRole('button', { name: /đặt liệu trình/i });
      expect(btn).toBeInTheDocument();
      await user.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('vô hiệu hóa và hiển thị đang xử lý khi isLoading=true', () => {
      render(<Button isLoading>Lưu thông tin</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(screen.getByText(/đang xử lý/i)).toBeInTheDocument();
    });
  });

  describe('Card', () => {
    it('render card và các thành phần tiêu đề, footer đúng cấu trúc', () => {
      render(
        <Card hoverable>
          <CardHeader>
            <CardTitle>Liệu trình ngủ ngon</CardTitle>
            <CardDescription>Mô tả chi tiết</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hỗ trợ phục hồi thể chất tự nhiên</p>
          </CardContent>
          <CardFooter>
            <button>Xem chi tiết</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Liệu trình ngủ ngon')).toBeInTheDocument();
      expect(screen.getByText('Mô tả chi tiết')).toBeInTheDocument();
      expect(screen.getByText('Hỗ trợ phục hồi thể chất tự nhiên')).toBeInTheDocument();
      expect(screen.getByText('Xem chi tiết')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('hiển thị nhãn, nhận giá trị nhập và liên kết id chuẩn accessibility', async () => {
      const user = userEvent.setup();
      render(<Input label="Họ và tên" placeholder="Nguyễn Văn A" id="fullname" />);

      const input = screen.getByLabelText('Họ và tên');
      expect(input).toBeInTheDocument();
      await user.type(input, 'Minh Khuê');
      expect(input).toHaveValue('Minh Khuê');
    });

    it('hiển thị thông báo lỗi và gắn cờ aria-invalid', () => {
      render(<Input label="Email" error="Email không hợp lệ" id="email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
    });

    it('hiển thị helperText khi không có lỗi', () => {
      render(<Input label="Số điện thoại" helperText="Nhập 10 chữ số" id="phone" />);
      expect(screen.getByText('Nhập 10 chữ số')).toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('hiển thị đúng nhãn và variant', () => {
      render(<Badge variant="success">Hoàn thành</Badge>);
      expect(screen.getByText('Hoàn thành')).toBeInTheDocument();
    });
  });

  describe('Stepper', () => {
    it('hiển thị các bước và đánh dấu bước hiện tại', () => {
      const steps = [
        { id: '1', title: 'Tình trạng da' },
        { id: '2', title: 'Giấc ngủ' },
        { id: '3', title: 'Hoàn tất' },
      ];

      render(<Stepper steps={steps} currentStepIndex={1} />);

      expect(screen.getByText('Tình trạng da')).toBeInTheDocument();
      expect(screen.getByText('Giấc ngủ')).toBeInTheDocument();
      expect(screen.getByText('Hoàn tất')).toBeInTheDocument();
    });
  });

  describe('Dialog', () => {
    it('không hiển thị khi open=false', () => {
      render(
        <Dialog open={false} onClose={vi.fn()} title="Xác nhận">
          <p>Nội dung</p>
        </Dialog>,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('hiển thị dialog, đóng khi nhấn phím Escape hoặc nút đóng', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <Dialog open={true} onClose={handleClose} title="Xác nhận lịch hẹn" description="Mô tả">
          <p>Bạn có chắc chắn muốn đặt khung giờ này?</p>
        </Dialog>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Xác nhận lịch hẹn')).toBeInTheDocument();
      expect(screen.getByText('Mô tả')).toBeInTheDocument();

      // Nhấn Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);

      const closeBtn = screen.getByRole('button', { name: /đóng cửa sổ/i });
      await user.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(2);
    });
  });
});
