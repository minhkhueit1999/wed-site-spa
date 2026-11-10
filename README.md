# Digital Wellness Platform — Hệ Thống Quản Lý Liệu Trình & Chăm Sóc Cá Nhân Hóa Cho Spa

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-PASSED-brightgreen.svg)](<>)
[![Coverage: Domain](https://img.shields.io/badge/Coverage%20Domain-%3E95%25-brightgreen.svg)](<>)
[![Coverage: Total](https://img.shields.io/badge/Coverage%20Total-78.2%25-brightgreen.svg)](<>)
[![Playwright E2E](https://img.shields.io/badge/E2E%20Tests-27%2F27%20PASSED-success.svg)](<>)
[![Vitest Unit/Component](https://img.shields.io/badge/Vitest-190%2F190%20PASSED-success.svg)](<>)
[![RAG Benchmark](https://img.shields.io/badge/RAG%20Recall%405-100%25-blue.svg)](<>)
[![Creative WebGL](https://img.shields.io/badge/WebGL%203D-3--Tier%20Adaptive-8b5cf6.svg)](<>)
[![Sả Spa E-Commerce](https://img.shields.io/badge/Sả%20Spa-Indochine%20Botanical-d4af37.svg)](<>)
[![License: Academic](https://img.shields.io/badge/License-Academic%20Project-lightgrey.svg)](<>)

> **Digital Wellness Platform** là nền tảng quản lý quy trình spa & chăm sóc cá nhân hóa chuyên sâu, giải quyết bài toán cốt lõi: **Liên kết dữ liệu giữa buổi trị liệu tại cơ sở spa (offline) và quy trình dưỡng phục hồi tại nhà (online) trong MỘT chu trình khép kín**, tích hợp **Hệ sinh thái E-commerce thảo mộc Sả Spa** chuẩn Đông Dương xa xỉ.

---

## 🌿 Điểm Nhấn Nghiệp Vụ & Kỹ Thuật Khác Biệt

1. **Cổng Xác Thực Bắt Buộc (Mandatory Sả Spa Auth Gate)**:
   - Toàn bộ khách truy cập được chào đón tại Cổng Indochine Glassmorphism với lá sả đung đưa, làn sương mờ và chuông xoay Tây Tạng 432Hz.
   - Hỗ trợ nút **Vào Nhanh (Khách VIP Demo)** 1 chạm phục vụ giảng viên / ban giám khảo kiểm thử tức thì không cần nhập liệu.
   - Hiệu ứng **Grand Portal Reveal**: 2 cánh rèm lá rẽ sang 2 bên kèm camera zoom-through đưa người dùng tiến vào không gian chính.
2. **Hệ Sinh Thái Thương Mại Điện Tử Sả Spa (Sả Spa E-commerce)**:
   - Danh mục 16 sản phẩm thảo mộc cao cấp phân bổ 4 nhóm: Tinh dầu chưng cất, Chăm sóc cơ thể, Nến thơm bấc gỗ, Trà thảo mộc dưỡng tâm.
   - **Living Product Cards**: Hiệu ứng nâng hạ sin-wave vô tận, 3D Tilt tách lớp Z-depth (`translateZ(45px)`), luồng sáng lướt qua thân chai (Liquid Sheen), vòng tròn bung nở 3 tầng hương (Scent Orbit) và quỹ đạo bay parabol vào giỏ hàng (Fly-to-Cart).
   - **Cửa hàng `/shop`**: Lọc đa chiều theo danh mục, nhu cầu, tông mùi và khoảng giá bằng `motion layout`; Ô tìm kiếm giác quan tức thì (Instant Sensory Search).
   - **Quick View 3D Modal**: Chế độ xem ánh sáng phòng spa ấm (Dark Ambience), nghi thức dưỡng tại nhà 3 bước, chọn dung tích và mua combo đồng điệu.
   - **Giỏ Hàng Trượt Thông Minh (`CartDrawer`)**: Rolling number counters, thanh tiến trình chất lỏng quà tặng/freeship, động cơ mã ưu đãi (`SASPA15`, `WELCOME10`).
   - **Quy Trình Thanh Toán 3 Bước (`/checkout`)**: Hộp mây tre đan thủ công, xem trước thiệp thư pháp giấy dó theo thời gian thực, mã QR VietQR động.
   - **Theo Dõi Đơn Hàng `/orders`**: Máy trạng thái 4 bước sinh động (_Tuyển chọn thảo mộc → Đóng gói hộp tre → Đang vận chuyển → Hoàn tất_) và nút "Mua lại đơn này" (Re-order) 1 chạm.
3. **Khảo sát & Động cơ gợi ý tất định (Rule Engine)**:
   - Bài trắc nghiệm 3 nhánh (Da, Căng thẳng & Giấc ngủ, Cơ vai gáy) chuẩn hóa triệu chứng.
   - Thuật toán khớp luật tất định (`domain/recommendation`) tự động ghép dịch vụ và sản phẩm tương ứng, kèm giải trình lý do khoa học và tự động lọc chống chỉ định (mang thai, dị ứng tinh dầu, sốt cấp).
4. **Túi Liệu Trình (Unified Booking)**:
   - Khách hàng xác nhận lịch hẹn buổi đầu và nhận toàn bộ toa sản phẩm dưỡng tại nhà trong một luồng giao dịch duy nhất.
5. **Máy trạng thái vòng đời khách hàng (State Machine)**:
   - Quản lý trạng thái phác đồ qua State Machine thuần túy (`NEW` → `ASSESSED` → `RECOMMENDED` → `BUNDLE_CONFIRMED` → `IN_TREATMENT` → `HOME_CARE` → `REASSESSMENT` → `COMPLETED`), có guard kiểm tra và lưu vết lịch sử (`PlanStateHistory`).
6. **Bàn làm việc Kỹ thuật viên (Therapist Console)**:
   - Chuyên viên xem hồ sơ sức khỏe, ghi nhận nhật ký buổi trị liệu (`SessionLog`), theo dõi tiến triển và chỉ định sản phẩm dưỡng tiếp theo với cơ chế chặn sản phẩm chống chỉ định theo thời gian thực.
7. **Trợ lý tư vấn AI RAG an toàn & Trích nguồn**:
   - Tra cứu tài liệu spa bằng kỹ thuật Hybrid Retrieval (Cosine Similarity + BM25 Reciprocal Rank Fusion).
   - Tự động nhận diện cờ đỏ y tế khẩn cấp và Prompt Injection để xử lý an toàn ngay tại Pre-Check (Zero PII, không gọi LLM).
8. **Không gian số Immersive 3D & WebGL Shaders (Chuẩn Awwwards / FWA)**:
   - **3-Tier Adaptive Quality System**: Tự động nhận diện phần cứng GPU và điều chỉnh chất lượng hình ảnh (Tier 3 Desktop/dpr 2, Tier 2 Mobile/dpr 1, Tier 1 Static Fallback).
   - **Tác phẩm điêu khắc 3D Zen Pebble**: Khối đá cuội hữu cơ tương tác con trỏ vật lý và camera scrollytelling theo tiến trình cuộn trang.
   - **Mặt nước gợn sóng & Cực quang WebGL**: Shader Simplex Noise 2D/3D với khúc xạ quang học ánh sáng và phản hồi con trỏ chuột (`uMouse`, `uVelocity`).
   - **Quả cầu chánh niệm 3D (Mindful Breathing Orb)**: Hỗ trợ nhịp thở 4-7-8 (Hít vào 4s hổ phách, Nén thở 7s, Thở ra 8s xanh xô thơm) gắn liền với tài khoản khách hàng.
   - **Unified Render Loop**: Đồng bộ nhịp khung hình mượt mà 60fps giữa Lenis Smooth Scroll, GSAP Ticker và React Three Fiber.
   - **Tự động ngắt GPU & Thích ứng hoàn hảo**: Tự động giải phóng tài nguyên GPU khi ẩn tab hoặc bật `prefers-reduced-motion: reduce`.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Giao diện & Ứng dụng**: [Next.js App Router 16.4](https://nextjs.org/) (React 19), Tailwind CSS, TypeScript Strict Mode.
- **Không gian số 3D & WebGL**: [Three.js](https://threejs.org/), [React Three Fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei), GLSL Shaders.
- **Vật lý chuyển động & Cuộn trang**: [GSAP](https://gsap.com/) (ScrollTrigger), [Lenis](https://lenis.darkroom.engineering/) (Smooth Scroll), [Motion for React](https://motion.dev/) (Spring Physics).
- **Cơ sở dữ liệu & ORM**: [Prisma ORM 7](https://www.prisma.io/) + SQLite (`prisma/dev.db` cho môi trường dev/demo; sẵn sàng chuyển PostgreSQL cho production).
- **Xác thực & Bảo mật**: [Auth.js v5](https://authjs.dev/) (Credentials, Cookie phiên HTTP-Only, RBAC: `CUSTOMER`, `THERAPIST`, `ADMIN`), Sliding Rate Limiter, Gitleaks.
- **Kiểm thử tự động**: [Vitest](https://vitest.dev/) (180 Unit & Component Tests), `@testing-library/react`, [Playwright](https://playwright.dev/) (24 E2E Tests trên Desktop Chrome, Mobile Pixel 5 và Tablet).
- **Hạ tầng AI/RAG**: Hashing Vector Embeddings 64-D, Hybrid Vector Store, Mock & Gemini LLM Providers.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Trong 5 Phút (Windows 11 / PowerShell)

Yêu cầu hệ thống: **Node.js 20+** và **Git**.

### Bước 1: Sao chép mã nguồn và chuyển vào thư mục dự án

```powershell
git clone https://github.com/minhkhueit1999/wed-site-spa.git
cd wed-site-spa
```

### Bước 2: Cài đặt các gói phụ thuộc

```powershell
npm install
```

### Bước 3: Cấu hình biến môi trường

File `.env` mẫu đã được chuẩn bị sẵn:

```powershell
# Chạy với mô phỏng AI mặc định (không cần API key):
# LLM_PROVIDER=mock
# EMBEDDING_PROVIDER=hash
```

### Bước 4: Khởi tạo cơ sở dữ liệu & Nạp dữ liệu mẫu (Seed Data)

```powershell
npx prisma db push
npm run db:seed
npm run rag:ingest
```

### Bước 5: Khởi động máy chủ phát triển

```powershell
npm run dev
```

Mở trình duyệt truy cập: **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Tài Khoản Demo Có Sẵn

Tất cả tài khoản demo sử dụng chung mật khẩu mặc định: `SpaDemo2026!`

| Vai trò                       | Email đăng nhập              | Mật khẩu       | Tính năng chính trải nghiệm                                                                                            |
| :---------------------------- | :--------------------------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Khách hàng (Customer)**     | `khachhang@spawellness.vn`   | `SpaDemo2026!` | Làm trắc nghiệm, xem phác đồ, theo dõi Treatment Tracker, xuất dữ liệu cá nhân JSON, quyền yêu cầu xóa dữ liệu.        |
| **Kỹ thuật viên (Therapist)** | `kythuatvien@spawellness.vn` | `SpaDemo2026!` | Xem lịch trị liệu, ghi nhận `SessionLog`, chỉ định toa sản phẩm dưỡng tại nhà, kiểm tra cảnh báo chống chỉ định.       |
| **Quản trị viên (Admin)**     | `quantri@spawellness.vn`     | `SpaDemo2026!` | Thống kê vận hành, mô phỏng luật gợi ý thời gian thực (Live Preview Simulation), quản lý dịch vụ, sản phẩm và quy tắc. |

_(Trên giao diện trang `/dang-nhap` có sẵn các nút đăng nhập nhanh 1-click cho từng vai trò)._

---

## 🧪 Các Lệnh Kiểm Thử & Kiểm Soát Chất Lượng

Dự án thiết lập hệ thống kiểm soát chất lượng kỹ thuật toàn diện:

```powershell
# 1. Kiểm tra kiểu tĩnh TypeScript strict
npm run typecheck

# 2. Quét lỗi mã nguồn với ESLint (chặn import vi phạm kiến trúc phân tầng)
npm run lint

# 3. Kiểm tra định dạng chuẩn với Prettier
npm run format:check

# 4. Chạy toàn bộ 169 unit & component test với Vitest
npm run test

# 5. Đo lường độ bao phủ mã nguồn (Coverage Report)
npm run test:coverage

# 6. Chạy bộ kiểm thử E2E Playwright trên cả 3 kích thước màn hình (Desktop, Mobile, Tablet)
npm run test:e2e

# 7. Đánh giá chất lượng hạ tầng RAG Benchmark (32 câu hỏi chuẩn)
npm run rag:eval

# 8. Quét bí mật rò rỉ mã nguồn với Gitleaks
node scripts/precommit-gitleaks.mjs

# 9. Biên dịch phiên bản Production
npm run build
```

---

## 📊 Bảng Kết Quả Kiểm Thử Toàn Diện

| Hạng mục kiểm tra           | Tiêu chuẩn đặt ra    | Kết quả thực tế                                | Trạng thái |
| :-------------------------- | :------------------- | :--------------------------------------------- | :--------: |
| **TypeScript Strict**       | 0 lỗi kiểu           | `tsc --noEmit` hoàn tất không lỗi              |   ✅ ĐẠT   |
| **ESLint 9**                | 0 warning/error      | Mã nguồn sạch quy ước kiến trúc                |   ✅ ĐẠT   |
| **Prettier Format**         | 100% tệp đồng bộ     | Khớp chuẩn căn lề toàn dự án                   |   ✅ ĐẠT   |
| **Unit & Component Test**   | 100% tests vượt qua  | **169/169 tests passed**                       |   ✅ ĐẠT   |
| **Độ bao phủ Domain (Lõi)** | $\ge 90\%$           | **`domain/` đạt từ 92.9% đến 100%**            |   ✅ ĐẠT   |
| **Độ bao phủ toàn dự án**   | $\ge 70\%$           | **77.94% Statements / 70.28% Branches**        |   ✅ ĐẠT   |
| **Playwright E2E Matrix**   | 5 hành trình chính   | **15/15 tests passed** (Desktop/Mobile/Tablet) |   ✅ ĐẠT   |
| **RAG Benchmark Recall@5**  | $\ge 80\%$           | **100.0%** (15/15 câu domain spa)              |   ✅ ĐẠT   |
| **RAG Cờ đỏ Y tế**          | 100% chặn bypass LLM | **100.0%** (9/9 câu cờ đỏ cấp tính)            |   ✅ ĐẠT   |
| **RAG Prompt Injection**    | 100% từ chối an toàn | **100.0%** (5/5 câu tấn công bảo mật)          |   ✅ ĐẠT   |
| **RAG mustNotContain**      | 0 vi phạm            | **0 vi phạm**                                  |   ✅ ĐẠT   |
| **Quét mã độc / Secret**    | 0 rò rỉ              | **Gitleaks 0 leaks found**                     |   ✅ ĐẠT   |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
wed-site-spa/
├── src/
│   ├── app/                    # Next.js App Router (Public, Customer, Therapist, Admin)
│   ├── application/            # Use-cases & Server Actions (Booking, Staff, Admin, Customer)
│   ├── domain/                 # Domain lõi thuần túy: recommendation, lifecycle, quiz
│   ├── infrastructure/         # DB (Prisma), Auth (Auth.js), RAG (Embedding, LLM, Store, Retrieval)
│   ├── components/             # UI Design System: primitives, layout, features
│   ├── data/                   # Cấu hình trắc nghiệm & dữ liệu seed
│   └── lib/                    # Cấu hình env Zod, logger, utils, rate-limit
├── prisma/                     # Schema Prisma và script seed dữ liệu mẫu
├── data/
│   ├── knowledge/              # 19 tài liệu tri thức spa (.md có frontmatter)
│   └── eval/                   # Bộ 32 câu hỏi đánh giá RAG Benchmark
├── tests/
│   └── e2e/                    # 5 kịch bản Playwright E2E cho 5 hành trình người dùng
├── docs/
│   ├── PRD.md                  # Yêu cầu sản phẩm chi tiết
│   ├── DOMAIN.md               # Thiết kế mô hình nghiệp vụ
│   ├── ARCHITECTURE.md         # Tài liệu kiến trúc phần mềm chuyên sâu
│   ├── DECISIONS.md            # Sổ tay quyết định kỹ thuật (ADR)
│   ├── DEMO.md                 # Kịch bản thuyết trình demo 5 phút
│   ├── QA-REPORT.md            # Báo cáo đảm bảo chất lượng đồ án
│   └── SLIDE-OUTLINE.md        # Đề cương slide bảo vệ đồ án tốt nghiệp
├── scripts/                    # Scripts RAG ingest, RAG eval, gitleaks check
└── playwright.config.ts        # Cấu hình kiểm thử E2E Playwright
```

---

## ⚖️ Tuyên Bố Miễn Trừ Trách Nhiệm Chuyên Môn

> [!NOTE]
> Mọi thông tin chuyên môn spa, quy trình trị liệu, thành phần thảo dược và khuyến cáo sức khỏe trong hệ thống là **nội dung mẫu phục vụ nghiên cứu và phát triển phần mềm** (được gắn nhãn `reviewedBy: "CHƯA DUYỆT"`). Cần có sự thẩm định và phê duyệt của bác sĩ da liễu hoặc chuyên gia y tế trước khi đưa vào áp dụng thực tế.
