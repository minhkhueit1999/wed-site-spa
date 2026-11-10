---
name: spa-ui-design
description: Hướng dẫn thiết kế giao diện cho nền tảng spa wellness (tông yên tĩnh, ấm, chuyên môn) gồm design token, chữ tiếng Việt, mẫu màn hình chính (trắc nghiệm, kết quả, túi liệu trình, theo dõi trị liệu, bảng điều khiển kỹ thuật viên) và danh sách kiểm tra. Dùng khi tạo hoặc sửa bất kỳ trang/component nào. Nếu có skill UI UX Pro Max thì nạp nó để sinh design system trước.
---

# Thiết kế giao diện spa wellness

## Quy trình

1. Nếu skill `ui-ux-pro-max` (hoặc tương tự) có sẵn: nạp nó, yêu cầu sinh design system cho "spa wellness, ấm, tối giản, tiếng Việt". Lấy kết quả làm gợi ý, rồi đối chiếu với ràng buộc dưới đây (ràng buộc thắng).
2. Ghi quyết định thiết kế vào `docs/design-system.md` (token, font, quy tắc). Chỉ làm một lần, các trang sau tuân theo.
3. Dựng token trong `src/app/globals.css` (CSS variables) + Tailwind theme. Component đọc token, không hard-code màu.
4. Dựng primitive trong `src/components/ui/` trước, rồi mới ghép trang.

## Hướng thẩm mỹ (điểm khởi đầu, được phép tinh chỉnh)

- Màu: nền ngà ấm (`~#FAF7F2`), bề mặt kem (`~#F3EDE3`), xanh xô thơm làm màu chính (`~#5B7B6A`, đậm hơn cho chữ trên nền sáng), đất nung làm điểm nhấn hiếm (`~#B8714F`), chữ nâu than (`~#2B2622`). Trạng thái: thành công/cảnh báo/lỗi có sắc độ dịu nhưng vẫn đạt tương phản. Kiểm tra tương phản bằng công cụ trước khi chốt.
- Chữ: tiêu đề serif thanh lịch có subset tiếng Việt (ví dụ Cormorant Garamond hoặc Playfair Display), nội dung sans dễ đọc có subset tiếng Việt (ví dụ Be Vietnam Pro). Nạp bằng `next/font` với `subsets: ['latin', 'vietnamese']`. Kiểm tra hiển thị dấu (ặ, ữ, ợ, ề...) không bị cắt.
- Bố cục: khoảng trắng rộng, lưới 12 cột, bo góc lớn mềm (16–24px), bóng đổ rất nhẹ. Hero bất đối xứng, không dùng mẫu "ba thẻ tính năng" nhàm chán. Hình minh họa/gradient mềm thay cho ảnh stock; nếu dùng ảnh phải có `alt` và kích thước cố định để tránh nhảy bố cục.
- Chuyển động: chậm, nhẹ (200–400ms ease-out), tắt khi `prefers-reduced-motion`.
- Không dùng: banner giảm giá, đồng hồ đếm ngược, nhãn HOT/SALE, popup chặn nội dung.

## Mẫu màn hình chính

- **Trang chủ**: thông điệp "Chăm sóc trọn vẹn từ spa đến nhà bạn"; ô tìm theo triệu chứng nổi bật; ba bước "Chia sẻ tình trạng → Nhận liệu trình → Theo dõi tiến triển".
- **Tìm theo triệu chứng** (`/trieu-chung`): ô tìm có gợi ý, chip nhóm (giấc ngủ, vai gáy, da nhạy cảm...), kết quả là "giải pháp trọn gói" (dịch vụ + toa tại nhà), không phải lưới sản phẩm.
- **Trắc nghiệm** (`/tu-van`): một câu mỗi màn hình, thanh tiến độ, nút quay lại, lưu tạm, chọn bằng thẻ lớn dễ chạm; bước đồng ý lưu dữ liệu rõ ràng trước khi lưu.
- **Kết quả** (`/ket-qua`): gợi ý chính nổi bật, khối "Vì sao bạn được gợi ý điều này", cảnh báo/chống chỉ định hiển thị rõ nhưng không gây hoảng, nút "Đặt liệu trình này", khung hỏi đáp trợ lý AI.
- **Túi liệu trình** (`/tui-lieu-trinh`): một trang gồm (1) buổi hẹn tại spa, (2) toa chăm sóc tại nhà đi kèm, (3) tổng quan chi phí mô phỏng, (4) nút xác nhận duy nhất. Không có số lượng/giỏ hàng kiểu bán lẻ.
- **Tài khoản / Theo dõi trị liệu**: dòng thời gian trạng thái, biểu đồ tiến triển theo buổi (dùng skill dựng biểu đồ nếu có), thẻ "Toa chăm sóc hiện tại", nút hành động tiếp theo.
- **Bảng điều khiển kỹ thuật viên**: danh sách khách hôm nay, mở hồ sơ → ghi nhật ký buổi (form nhanh, thao tác bàn phím tốt) → chỉ định sản phẩm tiếp theo (chỉ hiện sản phẩm hợp lệ).
- **Quản trị**: bảng có tìm kiếm/lọc, form chỉnh luật gợi ý có xem trước kết quả.

## Danh sách kiểm tra mỗi trang

- [ ] 375/768/1280px không cuộn ngang, không chồng chữ
- [ ] Đủ 4 trạng thái: tải / trống / lỗi / thành công
- [ ] Tương phản đạt, focus nhìn thấy, thao tác bàn phím hoàn chỉnh
- [ ] Heading đúng thứ tự, ảnh có alt, form có label
- [ ] Không lỗi console, không request lỗi
- [ ] Chữ tiếng Việt có dấu hiển thị đúng; không lời hứa tuyệt đối
