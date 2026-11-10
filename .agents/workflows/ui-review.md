---
description: Kiểm tra giao diện chạy thật bằng chrome-devtools ở 375/768/1280px: ảnh chụp, lỗi console, request lỗi, hiệu năng, trợ năng; sau đó sửa và kiểm tra lại.
---

# /ui-review [danh sách route, mặc định: các trang vừa sửa]

1. Khởi động máy chủ dev nếu chưa chạy: `npm run dev` (chạy nền, ghi lại cổng).
2. Với MỖI route cần kiểm tra, dùng chrome-devtools:
   1. Mở trang; đợi tải xong.
   2. Chụp ảnh ở 375×812, 768×1024, 1280×800.
   3. Đọc console: mọi `error`/`warning` đều phải xử lý (trừ cảnh báo đã được ghi chú trong `docs/DECISIONS.md`).
   4. Xem request mạng: không có 4xx/5xx ngoài dự kiến.
   5. Ghi hiệu năng: LCP, CLS (mục tiêu LCP < 2,5s, CLS < 0,1 ở môi trường dev chỉ để tham khảo; đo kỹ lại ở bản build `npm run build && npm run start`).
3. Kiểm tra trợ năng nhanh: thứ tự Tab hợp lý, focus nhìn thấy, mỗi trang một `h1`, ảnh có `alt`, form có `label`, tương tác bằng bàn phím hoàn chỉnh.
4. Đối chiếu danh sách kiểm tra trong skill `spa-ui-design` (cuộn ngang, chồng chữ, dấu tiếng Việt, 4 trạng thái tải/trống/lỗi/thành công).
5. Có lỗi → sửa, rồi lặp lại bước 2–4 cho route đó đến khi sạch.
6. Báo cáo: bảng route × (375 / 768 / 1280 / console / mạng / LCP / CLS) và danh sách việc đã sửa. Đính kèm ảnh chụp chính.
