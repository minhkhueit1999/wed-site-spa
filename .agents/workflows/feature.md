---
description: Quy trình chuẩn để làm một tính năng: đọc yêu cầu, kế hoạch ngắn, viết test trước, hiện thực, kiểm tra chất lượng, xem giao diện, commit.
---

# /feature <mô tả tính năng>

1. Đọc `docs/PRD.md`, `docs/DOMAIN.md`, các rule liên quan. Xác định user story và tiêu chí chấp nhận áp dụng cho tính năng này. Nếu thiếu, viết bổ sung vào `docs/PRD.md`.
2. Tạo nhánh: `git switch -c feat/<ten-ngan>`.
3. Viết kế hoạch ngắn (các file sẽ tạo/sửa, mô hình dữ liệu, rủi ro). Mơ hồ nhỏ thì tự quyết và ghi `docs/DECISIONS.md`.
4. Tra context7 cho mọi API thư viện sắp dùng.
5. Viết test TRƯỚC (đỏ) cho logic nghiệp vụ trong `domain/` và `application/`; chạy để thấy đỏ:
   // turbo
   `npm run test`
6. Hiện thực mã tối thiểu để test xanh, rồi refactor. Tuân hướng phụ thuộc trong rule `01-architecture`.
7. Làm phần UI theo skill `spa-ui-design`; viết test component cho tương tác chính.
8. Chạy workflow `/quality-check`. Sửa đến khi sạch.
9. Nếu có UI: chạy workflow `/ui-review`.
10. Cập nhật docs nếu hành vi thay đổi.
11. Commit theo Conventional Commits (có thể nhiều commit nhỏ).
12. Báo cáo: tính năng đã làm, kết quả kiểm tra, việc còn lại. Hỏi người dùng có chạy `/git-publish` ngay không.
