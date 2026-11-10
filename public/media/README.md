# Thư Mục Tài Sản Đa Phương Tiện (Media & 3D Assets) — Digital Wellness Platform

Thư mục này dùng để lưu trữ các tài sản media tùy chọn cho hệ thống trải nghiệm thị giác và 3D WebGL của website.

---

## 1. Cấu Trúc Tệp Mặc Định & Tùy Chọn

| Tên tệp            | Định dạng                   | Mục đích sử dụng                                                                                          | Vị trí hiển thị          |
| :----------------- | :-------------------------- | :-------------------------------------------------------------------------------------------------------- | :----------------------- |
| `hero-poster.webp` | WebP / JPEG (1920x1080)     | Ảnh tĩnh dự phòng chất lượng cao khi WebGL ở **Tier 1 (Tĩnh)** hoặc thiết bị bật `prefers-reduced-motion` | Hero Section (Trang chủ) |
| `hero.mp4`         | MP4 (H.264 / AAC, < 5MB)    | Video nền ambient lặp lại (tùy chọn) khi muốn thay thế procedural shader bằng video thật                  | `AmbientBackground`      |
| `sculpture.glb`    | GLTF / GLB nhị phân (< 2MB) | Mô hình 3D hữu cơ tùy biến (đá phong thủy, giọt sương, lá sen...) thay thế cho procedural Zen Pebble mesh | `HeroScene`              |

---

## 2. Hướng Dẫn Thay Thế Tài Sản Riêng

1. **Thay ảnh Poster tĩnh**:
   - Xuất ảnh kích thước đề xuất `1920x1080px`, nén qua công cụ Squoosh hoặc Sharp thành định dạng `.webp` để kích thước tệp $< 150\text{KB}$.
   - Đặt tên là `hero-poster.webp` và lưu vào thư mục này (`public/media/hero-poster.webp`).

2. **Thay Video Nền Ambient**:
   - Sử dụng video có độ dài từ 10 - 20 giây, quay chậm (slow motion) với chủ đề thiên nhiên spa (mặt nước, lá sen gợn sóng, sương mai, khói trầm).
   - Tối ưu hóa: độ phân giải Full HD 1080p, bitrate $< 2\text{Mbps}$, tắt hoàn toàn kênh âm thanh (mute) để đáp ứng chính sách tự động phát (autoplay) của trình duyệt.
   - Đặt tên là `hero.mp4` và lưu vào `public/media/hero.mp4`.

3. **Thay Mô Hình 3D (GLTF/GLB)**:
   - Sử dụng phần mềm Blender xuất định dạng `.glb` với Draco Compression hoặc Meshopt.
   - Giới hạn số lượng đa giác (polygon count) $< 30,000$ triangles để đảm bảo 60fps trên thiết bị di động.
   - Lưu vào `public/media/sculpture.glb`.

---

## 3. Lớp Phủ Scrim & Bảo Vệ Độ Tương Phản (A11y WCAG AA)

Hệ thống giao diện tại [`AmbientBackground.tsx`](../../src/components/canvas/AmbientBackground.tsx) và [`HeroScene.tsx`](../../src/components/canvas/HeroScene.tsx) tự động tích hợp lớp phủ **Adaptive Scrim**:

- Lớp gradient mờ bảo vệ vùng đọc chữ (`bg-gradient-to-b from-[#FAF7F2]/80 via-transparent to-[#FAF7F2]`).
- Đảm bảo tỷ lệ tương phản văn bản chữ đen/xanh xô thơm trên nền động luôn đạt tối thiểu **$4.5:1$** (WCAG AA) bất kể cường độ ánh sáng hay màu sắc của shader/video bên dưới.
