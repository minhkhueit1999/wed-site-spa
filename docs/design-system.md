# Hệ thống Thiết kế (Design System) — Digital Wellness Platform

Tài liệu quy chuẩn phong cách hình ảnh, màu sắc, kiểu chữ và thành phần giao diện theo skill `spa-ui-design`.

---

## 1. Triết lý thiết kế (Brand Aesthetics)

- **Cảm giác chủ đạo**: Yên tĩnh (calm), ấm áp (warm), đáng tin cậy (trustworthy) và giàu tính chuyên môn y dược/chăm sóc tự nhiên.
- **Không gian**: Nhiều khoảng thở (generous whitespace), cấu trúc bố cục bất đối xứng tinh tế, bóng đổ mềm mại, góc bo hữu cơ (organic rounded corners).
- **Tuyệt đối tránh**: Phong cách bán lẻ thương mại điện tử giật gân, banner đếm ngược "giảm giá sốc", nhãn "HOT/SALE", cửa sổ bật lên (popup) làm gián đoạn trải nghiệm người dùng.

---

## 2. Bảng màu (Color Palette & Tokens)

Hệ thống token màu được định nghĩa trong `globals.css` (CSS Custom Properties) và tích hợp vào theme Tailwind:

| Tên Token                | Mã màu    | Tên ngữ nghĩa     | Mục đích sử dụng                                               | Tỉ lệ tương phản (Contrast) |
| ------------------------ | --------- | ----------------- | -------------------------------------------------------------- | --------------------------- |
| `--color-bg-base`        | `#FAF7F2` | Warm Off-White    | Nền chính toàn trang web, tạo cảm giác dịu mắt                 | Chuẩn WCAG AA               |
| `--color-bg-surface`     | `#F3EDE3` | Warm Cream        | Bề mặt card, container, form bao ngoài                         | Đạt chuẩn tương phản        |
| `--color-bg-subtle`      | `#EAE1D3` | Muted Sand        | Viền phân cách nhẹ, nền button thứ cấp hover                   | Phân tách mềm               |
| `--color-primary`        | `#405C4E` | Deep Sage Green   | Màu thương hiệu chính, nút CTA, tiêu đề điểm nhấn              | >= 4.5:1 trên nền sáng      |
| `--color-primary-light`  | `#5B7B6A` | Sage Green        | Huy hiệu, viền active, chỉ số thanh tiến độ                    | Dịu nhẹ, tự nhiên           |
| `--color-primary-dark`   | `#2D4137` | Forest Sage       | Trạng thái hover của nút chính, chữ quan trọng                 | >= 7:1 (chuẩn AAA)          |
| `--color-accent`         | `#B8714F` | Terracotta Clay   | Điểm nhấn đặc biệt (không lạm dụng): số bước, lưu ý quan trọng | >= 4.5:1                    |
| `--color-accent-soft`    | `#F4EAE4` | Soft Clay         | Nền thông báo nhẹ, nhãn nổi bật tinh tế                        | Dịu mắt                     |
| `--color-text-main`      | `#2B2622` | Charcoal Brown    | Màu chữ nội dung chính                                         | 11.2:1 trên nền base        |
| `--color-text-muted`     | `#635B54` | Muted Earth       | Màu chữ phụ, chú thích, gợi ý                                  | 4.8:1 trên nền base         |
| `--color-status-success` | `#2F6A4F` | Herbal Green      | Trạng thái thành công, hoàn thành buổi điều trị                | >= 4.5:1                    |
| `--color-status-warning` | `#9E6700` | Warm Ochre        | Trạng thái cảnh báo chống chỉ định cần nhân viên duyệt         | >= 4.5:1                    |
| `--color-status-error`   | `#9E3838` | Deep Rose         | Trạng thái lỗi, cờ đỏ an toàn                                  | >= 4.5:1                    |
| `--color-border`         | `#E2D9CC` | Soft Stone Border | Đường viền các card và ô nhập liệu                             | Tinh tế, rõ ràng            |

---

## 3. Kiểu chữ (Typography)

Sử dụng bộ font tối ưu tiếng Việt có đầy đủ dấu (ă, â, đ, ê, ô, ơ, ư...):

- **Tiêu đề (Display / Headings)**: Font Serif thanh lịch, giàu cảm xúc spa cao cấp (Playfair Display / Georgia / Cambria).
- **Nội dung & Giao diện (Body & UI)**: Font Sans-serif hiện đại, độ dễ đọc cao (Be Vietnam Pro / Inter / system-ui).
- **Cỡ chữ tối thiểu**: `16px` cho văn bản nội dung thông thường để đảm bảo người dùng mọi lứa tuổi đọc dễ dàng trên thiết bị di động.

| Cấp bậc         | Cỡ chữ / Line Height | Trọng số (Weight) | Kiểu chữ     | Áp dụng                                       |
| --------------- | -------------------- | ----------------- | ------------ | --------------------------------------------- |
| Display / H1    | 36px–44px / 1.2      | 600 (Semibold)    | Serif        | Tiêu đề chính trang chủ, tên phác đồ          |
| H2              | 28px–32px / 1.3      | 600 (Semibold)    | Serif        | Tiêu đề khối giải pháp, kết quả chẩn đoán     |
| H3              | 20px–24px / 1.4      | 600 (Semibold)    | Sans / Serif | Tiêu đề thẻ dịch vụ, bước trắc nghiệm         |
| Body Large      | 18px / 1.6           | 400 (Regular)     | Sans         | Lời mở đầu, đoạn giải thích lý do gợi ý       |
| Body            | 16px / 1.6           | 400 (Regular)     | Sans         | Nội dung bài viết, mô tả sản phẩm tại nhà     |
| Caption / Small | 14px / 1.5           | 500 (Medium)      | Sans         | Nhãn trạng thái, trích dẫn nguồn RAG, ghi chú |

---

## 4. Khoảng cách, Bo góc & Bóng đổ (Spacing, Radius & Elevation)

- **Bo góc (Border Radius)**:
  - `rounded-sm`: 8px (badge, tag nhỏ)
  - `rounded-md`: 12px (ô input, button, dropdown)
  - `rounded-lg`: 16px (card dịch vụ, hộp thông báo)
  - `rounded-xl`: 24px (container lớn, modal, sheet tư vấn)
  - `rounded-full`: 9999px (avatar, pill nút bấm)
- **Vùng chạm tối thiểu**: `44px x 44px` trên màn hình cảm ứng theo WCAG 2.2 AA.
- **Bóng đổ (Shadow)**:
  - `shadow-soft`: `0 2px 8px -2px rgba(43, 38, 34, 0.05), 0 4px 16px -4px rgba(43, 38, 34, 0.08)`
  - `shadow-hover`: `0 8px 24px -4px rgba(43, 38, 34, 0.12)`

---

## 5. Quy chuẩn 4 trạng thái bắt buộc (4 Essential UI States)

Mọi màn hình và thành phần dữ liệu đều phải có đủ 4 trạng thái:

1. **Đang tải (Loading State)**: Hiệu ứng Skeleton shimmer hoặc biểu tượng xoay nhẹ với tông màu ngà/xanh xô thơm, thông điệp rõ ràng bằng tiếng Việt.
2. **Trống (Empty State)**: Hình ảnh minh họa mềm hoặc biểu tượng tối giản, kèm thông điệp ấm áp và một nút hành động tiếp theo (ví dụ: "Chưa có liệu trình nào đang diễn ra. Làm bài trắc nghiệm nhanh để tìm giải pháp phù hợp nhé").
3. **Lỗi (Error State)**: Hộp thông báo màu sắc dịu, nêu rõ nguyên nhân và nút "Thử lại", không hiển thị mã lỗi kỹ thuật khó hiểu cho khách hàng.
4. **Thành công (Success State)**: Tín hiệu xác nhận xanh lá dịu, tóm tắt kết quả vừa thực hiện và hướng dẫn bước tiếp theo.

---

## 6. Bộ Primitive Components nền tảng (`src/components/ui/`)

1. **Button**:
   - `variant`: `primary` (Sage Green), `secondary` (Cream Outline), `terracotta` (Clay Accent), `ghost`, `danger`.
   - `size`: `sm` (36px), `md` (44px), `lg` (52px).
   - Đủ trạng thái `loading`, `disabled`, `focus-visible`.
2. **Card**: Khung nền bề mặt kem mềm, bo góc 16px, viền nhẹ, hỗ trợ `hoverable`.
3. **Input & Textarea**: Nhãn (label) liên kết `htmlFor`, thông báo lỗi `aria-invalid` và `aria-describedby`, vùng bấm >= 44px.
4. **Badge**: Phù hiệu hiển thị tình trạng (Hoàn thành, Đang diễn ra, Chờ duyệt, Chống chỉ định).
5. **Stepper**: Thanh tiến trình bước (1, 2, 3...) cho luồng Trắc nghiệm và Túi liệu trình.
6. **Dialog / Modal**: Cửa sổ tương tác xác nhận có bẫy focus (focus trap), hỗ trợ phím `Escape`, tiêu đề ngữ nghĩa và nút đóng rõ ràng.

---

## 7. Chuyển động Tương tác & 3D WebGL (Immersive Motion & 3D)

Hệ thống trải nghiệm xúc giác số (tactile digital space) lấy cảm hứng từ thiên nhiên spa: mặt nước gợn sóng, sương mai khúc xạ ánh sáng, đá cuội nhẵn bóng thiền định.

### 7.1. Cảm giác chủ đạo

- **Hữu cơ & Đầm chắc (Organic & Grounded)**: Tương tác phản hồi quán tính tự nhiên, không giật gấp; lực hút từ tính nhẹ (magnetic pull) ở các nút bấm quan trọng.
- **Chiều sâu không gian (Spatial Depth)**: Parallax đa tầng với ánh sáng ấm, bóng phản chiếu mềm mại và hạt bụi thảo mộc bay lơ lửng.

### 7.2. Motion Tokens (`src/lib/motion.ts`)

- **Spring Curves**:
  - `gentle`: `{ stiffness: 120, damping: 14, mass: 1 }` (dành cho hover, thẻ nổi, dialog).
  - `bouncy`: `{ stiffness: 260, damping: 20, mass: 1 }` (dành cho hạt tương tác, huy hiệu).
  - `zen`: `{ stiffness: 60, damping: 18, mass: 1.2 }` (dành cho nhịp thở, luồng chuyển trang).
- **Bezier Easings**:
  - `cinematic`: `cubic-bezier(0.16, 1, 0.3, 1)`
  - `smooth`: `cubic-bezier(0.25, 1, 0.5, 1)`
- **Thời lượng**:
  - `instant`: 150ms
  - `standard`: 300ms
  - `deliberate`: 600ms
  - `ceremony`: 1200ms (dành cho nghi thức mở kết quả lộ trình, nhịp thở)

### 7.3. Phân tầng chất lượng thích ứng (3-Tier Adaptive Quality)

1. **Tier 3 (High - Desktop rời / Apple Silicon)**:
   - Full 3D canvas, custom GLSL liquid noise shader, 120 hạt bụi thảo mộc 3D, dpr = [1, 2], tương tác con trỏ vật lý đầy đủ.
2. **Tier 2 (Medium - Mobile cao cấp / iGPU)**:
   - Khóa dpr = 1, giảm 50% số lượng hạt (60 hạt), tắt khúc xạ đa lượt (multi-pass FBO), dùng `MeshPhysicalMaterial` tối ưu, bỏ tương tác con trỏ theo quán tính.
3. **Tier 1 (Low / Tĩnh / `prefers-reduced-motion`)**:
   - Tắt WebGL Canvas hoàn toàn, giải phóng ngữ cảnh GPU (`loseContext()`), render lớp gradient CSS/SVG cao cấp siêu nhẹ.

### 7.4. Ba khoảnh khắc đặc trưng (Signature Spa Moments)

1. **3D Diagnostic Quiz Transition**: Hiệu ứng chuyển thẻ trắc nghiệm có chiều sâu Z-axis kết hợp elevation spring.
2. **Ritual Reveal (`/ket-qua`)**: Hiệu ứng mở phác đồ trị liệu kết hợp ánh sáng ấm lan tỏa (holographic/warm wash).
3. **BreathingOrb3D**: Khối cầu năng lượng 3D dẫn nhịp thở 4-7-8 (Hít vào 4s -> Giữ hơi 7s -> Thở ra 8s) hỗ trợ tĩnh tâm cho khách hàng trên `/tai-khoan` và `/trieu-chung`. Có kèm ARIA live region và nút chuyển sang 2D canvas.
