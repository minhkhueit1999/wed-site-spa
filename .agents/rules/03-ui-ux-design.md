---
trigger: model_decision
description: Áp dụng khi tạo hoặc sửa giao diện, component, trang, style, nội dung hiển thị cho người dùng.
---

# Thiết kế UI/UX

Chi tiết ở skill `spa-ui-design`. Nếu có skill "UI UX Pro Max" được cài, nạp nó để sinh design system trước, nhưng vẫn phải tuân các ràng buộc dưới đây.

## Cảm giác thương hiệu

Yên tĩnh, ấm, đáng tin, chuyên môn nhưng không lạnh lùng. Nhiều khoảng trắng, chữ thoáng, ảnh/hình minh họa mềm. Tránh cảm giác "cửa hàng bán lẻ": không banner giảm giá, không đồng hồ đếm ngược, không nhãn "HOT/SALE".

## Bắt buộc

- Mobile-first; kiểm tra tại 375px, 768px, 1280px. Không cuộn ngang.
- Token thiết kế (màu, chữ, khoảng cách, bo góc, đổ bóng) khai báo một nơi (CSS variables + Tailwind theme). Không hard-code mã màu trong component.
- Font hỗ trợ tiếng Việt đầy đủ (nạp subset `vietnamese` qua `next/font`). Cỡ chữ nội dung ≥ 16px.
- Tương phản chữ/nền ≥ 4.5:1 (chữ lớn ≥ 3:1). Vùng chạm ≥ 44×44px. Có trạng thái `:focus-visible` rõ ràng. Tôn trọng `prefers-reduced-motion`.
- Mọi ảnh có `alt` có nghĩa (hoặc `alt=""` nếu trang trí). Thứ tự heading hợp lý (một `h1` mỗi trang). Form có `label` gắn đúng, lỗi hiển thị cạnh trường và đọc được bằng screen reader.
- Mỗi màn hình có đủ 4 trạng thái: đang tải, trống, lỗi, thành công. Không để trang trắng.
- Luồng nhiều bước (trắc nghiệm, túi liệu trình) có chỉ báo tiến độ, cho quay lại, lưu tạm đáp án.

## Nội dung (copywriting)

- Giọng ấm, rõ, ngắn. Xưng "bạn", tránh thuật ngữ y khoa.
- Không dùng lời hứa tuyệt đối ("khỏi hẳn", "100%", "chữa"). Dùng "hỗ trợ", "giúp cải thiện cảm giác", "phù hợp với".
- Mọi kết quả gợi ý phải kèm "Vì sao bạn được gợi ý điều này" (lấy từ `reasons` của rule engine) và nhắc: gợi ý không thay thế tư vấn trực tiếp.

## Kiểm tra

Sau mỗi thay đổi giao diện chạy `/ui-review` (chrome-devtools): ảnh chụp 3 kích thước, không lỗi console, không request lỗi.
