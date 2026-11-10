import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssistantChatWidget } from './AssistantChatWidget';

describe('AssistantChatWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('hiển thị giao diện chat nhúng và gửi câu hỏi thành công có trích nguồn', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          answer: 'Dựa trên tài liệu spa [1], liệu trình thư giãn sâu kéo dài 75 phút.',
          sources: [
            {
              title: 'Liệu Trình Thư Giãn Sâu',
              slug: 'thu-gian-sau',
              headingPath: 'Liệu Trình Thư Giãn Sâu > Tổng quan',
            },
          ],
          usedFallback: false,
        },
      }),
    } as unknown as Response);

    render(<AssistantChatWidget embedded={true} />);

    expect(screen.getByText('Trợ Lý Tư Vấn Spa')).toBeInTheDocument();
    expect(
      screen.getByText(/Xin chào! Tôi là Trợ lý Tư vấn của Digital Wellness Spa/),
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Đặt câu hỏi về liệu trình, sản phẩm...');
    fireEvent.change(input, { target: { value: 'Liệu trình thư giãn bao lâu?' } });

    const submitBtn = screen.getByRole('button', { name: 'Gửi' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Dựa trên tài liệu spa \[1\], liệu trình thư giãn sâu kéo dài 75 phút\./),
      ).toBeInTheDocument();
      expect(screen.getByText('[1] Liệu Trình Thư Giãn Sâu')).toBeInTheDocument();
    });
  });

  it('hiển thị cảnh báo y tế khẩn cấp khi gặp câu hỏi cờ đỏ', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          answer:
            'CẢNH BÁO Y TẾ: Triệu chứng bạn mô tả có dấu hiệu khẩn cấp. Vui lòng đến ngay bệnh viện gần nhất!',
          sources: [],
          usedFallback: false,
          safetyNotice: 'RED_FLAG',
        },
      }),
    } as unknown as Response);

    render(<AssistantChatWidget embedded={true} />);

    const input = screen.getByPlaceholderText('Đặt câu hỏi về liệu trình, sản phẩm...');
    fireEvent.change(input, { target: { value: 'Tôi bị đau thắt ngực dữ dội' } });

    const submitBtn = screen.getByRole('button', { name: 'Gửi' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('⚠️ CẢNH BÁO Y TẾ KHẨN CẤP')).toBeInTheDocument();
      expect(screen.getByText(/Vui lòng đến ngay bệnh viện gần nhất!/)).toBeInTheDocument();
    });
  });
});
