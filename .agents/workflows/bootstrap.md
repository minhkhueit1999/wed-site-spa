---
description: Khởi tạo dự án Next.js + toàn bộ công cụ chất lượng (TypeScript strict, Tailwind, Prisma, Vitest, ESLint, Prettier, Husky, Gitleaks) và commit đầu tiên.
---

# /bootstrap

Mục tiêu: có một dự án trống chạy được, kèm đủ công cụ kiểm tra, trước khi viết tính năng.

1. Kiểm tra công cụ và báo thiếu gì (không tự cài phần mềm hệ thống):
   // turbo
   `node --version`
   // turbo
   `git --version`
   // turbo
   `gh --version`
   // turbo
   `gitleaks version`
2. Dùng context7 tra cú pháp `create-next-app` hiện hành. Tạo dự án Next.js: TypeScript, Tailwind CSS, ESLint, App Router, thư mục `src/`, import alias `@/*`, trình quản lý gói npm. Nếu thư mục không rỗng khiến lệnh từ chối, tạo ở thư mục tạm rồi chuyển file vào gốc, TUYỆT ĐỐI không ghi đè `.agents/`, `docs/`, `prompts/`, `data/`, `AGENTS.md`, `README.md`, `.gitignore`, `.env.example`.
3. Cài phụ thuộc (tra context7 cho từng gói, hỏi lại nếu muốn thêm gói ngoài danh sách):
   - runtime: `zod`, `@prisma/client`, `next-auth` (Auth.js) và gói băm mật khẩu
   - dev: `prisma`, `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `prettier`, `prettier-plugin-tailwindcss`, `eslint-config-prettier`, `husky`, `lint-staged`, `@playwright/test` (cài trình duyệt ở giai đoạn E2E)
4. Cấu hình theo rule `02-code-quality`: `tsconfig` strict + `noUncheckedIndexedAccess`; ESLint (kèm `no-restricted-imports` bảo vệ `src/domain`); `.prettierrc`; `vitest.config.ts` với hai project `unit` và `component`; scripts trong `package.json` (`typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`, `build`, `db:migrate`, `db:seed`, `rag:ingest`, `rag:eval`).
5. Tạo khung thư mục theo rule `01-architecture` (file `.gitkeep` cho thư mục rỗng) và `src/lib/env.ts` (Zod, đọc từ `.env.example`).
6. Khởi tạo Prisma với SQLite (`prisma init`, `DATABASE_URL` trong `.env`, KHÔNG commit `.env`).
7. Thiết lập Husky: `pre-commit` chạy `lint-staged` và `node scripts/precommit-gitleaks.mjs` (script chạy `gitleaks protect --staged`; nếu chưa cài Gitleaks thì in cảnh báo và thoát 0); `pre-push` chạy `npm run typecheck` và `npm run test`.
8. Viết một test mẫu cho `src/lib` để chắc Vitest chạy, và trang chủ tạm tiếng Việt để chắc Next chạy.
9. Chạy toàn bộ kiểm tra:
   // turbo
   `npm run typecheck`
   // turbo
   `npm run lint`
   // turbo
   `npm run test`
   // turbo
   `npm run build`
10. Ghi các quyết định đáng nhớ vào `docs/DECISIONS.md`.
11. `git init` (nếu chưa), nhánh `main`, commit: `chore: khởi tạo dự án và công cụ chất lượng`.
12. Báo cáo ngắn: đã cài gì, kiểm tra nào qua, còn thiếu gì. Dừng chờ xác nhận để sang giai đoạn 1.
