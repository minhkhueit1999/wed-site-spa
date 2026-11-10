---
trigger: always_on
---

# Bảo mật & quyền riêng tư

Dữ liệu trắc nghiệm, nhật ký trị liệu, dị ứng, tình trạng sức khỏe là DỮ LIỆU NHẠY CẢM. Xử lý như vậy từ ngày đầu.

## Xác thực & phân quyền

- Ba vai trò: `CUSTOMER`, `THERAPIST`, `ADMIN`. Quyền kiểm tra ở server cho từng action/route/truy vấn.
- Khách chỉ đọc/ghi dữ liệu của chính mình (lọc theo `userId` trong repository, không chỉ ở UI). Kỹ thuật viên chỉ thấy khách có lịch hẹn/liệu trình với mình. Admin quản trị danh mục, không xem nhật ký trị liệu trừ khi có lý do và có ghi `AuditLog`.
- Băm mật khẩu bằng thuật toán chuẩn (argon2 hoặc bcrypt, tra context7 để chọn gói còn bảo trì). Cookie phiên `httpOnly`, `secure` ở production, `sameSite=lax`.
- Giới hạn tần suất (rate limit) cho đăng nhập, đăng ký và `/api/assistant`.

## Dữ liệu

- Thu thập tối thiểu. Trước khi lưu trắc nghiệm/hồ sơ sức khỏe phải có đồng ý rõ ràng (checkbox + lưu thời điểm đồng ý).
- Khách có thể xuất và xóa dữ liệu của mình (tính năng "Xóa tài khoản và dữ liệu").
- Không ghi dữ liệu sức khỏe/PII vào log. Không gửi định danh khách (tên, email, SĐT) tới LLM/embedding API; chỉ gửi cờ ẩn danh cần thiết.
- Ghi `AuditLog` cho: đăng nhập, đổi vai trò, xem/sửa nhật ký trị liệu, xóa dữ liệu.

## Mã & hạ tầng

- Không commit `.env`, khóa API, dữ liệu khách thật. Chỉ commit `.env.example`. Biến công khai duy nhất được đặt `NEXT_PUBLIC_`; bí mật không bao giờ có tiền tố này.
- Gitleaks chạy ở pre-commit và CI. Gitleaks báo lỗi → dừng, xóa secret khỏi lịch sử (hỏi người dùng nếu đã lỡ commit) và xoay khóa.
- Header bảo mật (CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors) cấu hình trong Next. Tra context7 cho cú pháp hiện hành.
- Chống XSS: không dùng `dangerouslySetInnerHTML` với nội dung do người dùng/LLM sinh. Render Markdown của trợ lý bằng bộ lọc an toàn.
- `npm audit --omit=dev` chạy trong `/quality-check`; lỗ hổng mức high/critical phải xử lý hoặc ghi chú lý do trong `docs/DECISIONS.md`.
