---
trigger: always_on
---

# Kiến trúc & cấu trúc thư mục

## Cấu trúc

```
src/
  app/                  # route Next.js: chỉ lắp ráp UI + gọi use-case
    (public)/           # trang chủ, /trieu-chung, /tu-van, /ket-qua, /dich-vu/[slug]
    (customer)/         # /tai-khoan, /tui-lieu-trinh, /dat-lich
    (staff)/            # /ky-thuat-vien/*
    (admin)/            # /quan-tri/*
    api/                # route handler (assistant, health)
  components/
    ui/                 # primitive: Button, Card, Input, Stepper, Badge...
    features/<feature>/ # component theo tính năng
  domain/               # LÕI THUẦN — không import next, react, prisma, fetch
    recommendation/  lifecycle/  contraindication/  quiz/
  application/          # use-case: điều phối domain + repository (interface)
  infrastructure/       # prisma repo, auth, rag (embedding, vector-store, llm)
  lib/                  # env.ts (Zod), utils, format ngày/tiền VND
  data/                 # quiz config, seed rule
prisma/                 # schema.prisma, seed.ts
data/knowledge/         # tài liệu nguồn cho RAG (.md có frontmatter)
data/eval/              # bộ câu hỏi chuẩn để đo RAG
tests/e2e/              # Playwright
docs/                   # PRD, DOMAIN, DECISIONS
```

## Hướng phụ thuộc (bắt buộc)

`app → application → domain`. `infrastructure` hiện thực các interface do `application`/`domain` định nghĩa. `domain` KHÔNG import gì ngoài chính nó và thư viện thuần (Zod được phép). Vi phạm hướng này là lỗi, ESLint phải chặn bằng `no-restricted-imports`.

## Quy ước

- Mặc định Server Component; chỉ thêm `"use client"` cho phần cần tương tác.
- Dữ liệu vào hệ thống (form, server action, route handler) phải qua Zod. Không tin dữ liệu từ client.
- Mọi server action/route phải gọi `requireRole()` hoặc `requireUser()` trước khi làm gì khác (kiểm tra quyền ở server, không dựa vào việc ẩn nút).
- Truy cập DB chỉ qua repository trong `infrastructure/`; component không gọi Prisma trực tiếp.
- Lỗi nghiệp vụ trong `domain` trả về `Result` (`ok`/`err`), không ném exception cho luồng thường.
- Biến môi trường chỉ đọc qua `lib/env.ts` (Zod parse khi khởi động).
- Tiền tệ lưu số nguyên VND; thời gian lưu UTC, hiển thị theo Asia/Ho_Chi_Minh.
