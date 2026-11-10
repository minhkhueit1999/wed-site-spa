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

## Immersive Motion & 3D WebGL (Chuẩn Awwwards / FWA)

Cho phép áp dụng công nghệ 3D, WebGL Shaders và Scrollytelling hữu cơ với các ràng buộc nghiêm ngặt:

- **3-Tier Adaptive Quality**:
  - _Tier 3 (High)_: Full 3D scenes, custom GLSL shaders, 3D depth particles, dpr [1, 2].
  - _Tier 2 (Medium)_: Giảm 50% particles, khóa dpr = 1, shaders nhẹ hơn, tắt phản chiếu đa lượt.
  - _Tier 1 (Low / Fallback)_: Tự động tắt WebGL Canvas khi người dùng bật `prefers-reduced-motion: reduce`, GPU yếu hoặc chọn chế độ 'Tĩnh'; hiển thị nền tĩnh CSS/SVG mượt mà.
- **Tải lười (Lazy Hydration)**: Mọi canvas WebGL/Three.js phải được bọc trong `next/dynamic` với `ssr: false` để bảo toàn chỉ số FCP và LCP (< 2.5s).
- **GPU Resource Management**: Bắt buộc dọn dẹp bộ nhớ GPU (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`) khi unmount; tự dừng render loop khi tab ẩn (`visibilitychange`) hoặc canvas ra khỏi viewport.
- **Bộ chuyển chế độ hiển thị**: Cung cấp công tắc trực quan cho phép khách chọn giữa "Sống động (3D)", "Tiêu chuẩn", "Tĩnh".

## Nội dung (copywriting)

- Giọng ấm, rõ, ngắn. Xưng "bạn", tránh thuật ngữ y khoa.
- Không dùng lời hứa tuyệt đối ("khỏi hẳn", "100%", "chữa"). Dùng "hỗ trợ", "giúp cải thiện cảm giác", "phù hợp với".
- Mọi kết quả gợi ý phải kèm "Vì sao bạn được gợi ý điều này" (lấy từ `reasons` của rule engine) và nhắc: gợi ý không thay thế tư vấn trực tiếp.

## Kiểm tra

Sau mỗi thay đổi giao diện chạy `/ui-review` (chrome-devtools): ảnh chụp 3 kích thước, không lỗi console, không request lỗi.
