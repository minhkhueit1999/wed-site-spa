---
trigger: model_decision
description: Áp dụng khi viết test, cấu hình Vitest/Playwright, hoặc khi thay đổi logic nghiệp vụ cần được kiểm chứng.
---

# Kiểm thử

## Công cụ

Vitest (unit + integration), Testing Library (component), Playwright (E2E, giai đoạn cuối). Cấu hình Vitest tách "projects": `unit` (môi trường node, cho `domain`/`application`), `component` (jsdom).

## Quy tắc

- `domain/` làm theo TDD: viết test đỏ trước, rồi mới viết mã. Ngưỡng coverage `domain` ≥ 90% dòng/nhánh; toàn dự án ≥ 70%.
- Test theo hành vi, không theo chi tiết cài đặt. Một test kiểm một ý; tên test mô tả kết quả mong đợi (tiếng Việt hoặc Anh, nhất quán trong một file).
- Rule engine và state machine dùng test dạng bảng (`it.each`) phủ: trường hợp thường, biên, bị chống chỉ định, không có rule khớp, mọi chuyển trạng thái hợp lệ và không hợp lệ.
- Không mock domain. Chỉ mock ranh giới ngoài (LLM, embedding API, thời gian, email). Dùng provider giả tất định: `HashEmbeddingProvider`, `MockLlmProvider`.
- Dữ liệu test dựng bằng builder/factory (`buildCustomerProfile({ pregnant: true })`), không sao chép JSON dài.
- Test integration dùng SQLite file tạm/in-memory, tự dọn sau mỗi test, không phụ thuộc thứ tự chạy.
- Không bao giờ sửa test cho qua khi mã sai. Test fail → tìm nguyên nhân gốc.

## Component

Dùng truy vấn theo vai trò/nhãn (`getByRole`, `getByLabelText`). Kiểm tra: hiển thị đúng, tương tác bàn phím, trạng thái lỗi/trống/đang tải.

## E2E (Playwright) — hành trình vàng

1. Làm trắc nghiệm → thấy kết quả + lý do gợi ý.
2. Xác nhận túi liệu trình (đặt lịch + sản phẩm một luồng) → thấy trạng thái `BUNDLE_CONFIRMED`.
3. Kỹ thuật viên ghi nhật ký buổi và chỉ định sản phẩm tiếp theo.
4. Khách thấy toa chăm sóc tại nhà và tiến triển trên tài khoản.
5. Câu hỏi trợ lý AI có trích nguồn; câu hỏi ngoài phạm vi được từ chối lịch sự.
