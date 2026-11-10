---
trigger: model_decision
description: Áp dụng khi viết hoặc sửa bất kỳ mã TypeScript/TSX, cấu hình ESLint/Prettier/tsconfig.
---

# Chất lượng mã nguồn

## TypeScript

- `strict: true`, bật thêm `noUncheckedIndexedAccess`, `noImplicitOverride`. Cấm `any` (dùng `unknown` rồi thu hẹp), cấm `@ts-ignore` (nếu bắt buộc dùng `@ts-expect-error` kèm lý do).
- Dùng `type` cho dữ liệu, `interface` cho hợp đồng cần hiện thực. Dùng union rời rạc (`kind`) cho trạng thái thay vì cờ boolean rời rạc.
- Chỉ export có tên (named export), trừ file đặc biệt của Next (`page.tsx`, `layout.tsx`...).

## Kích thước & độ rõ ràng

- File ≤ 300 dòng, hàm ≤ 40 dòng, component ≤ 150 dòng. Vượt thì tách.
- Tên nói rõ ý định (`calculateRecommendation`, không phải `process`). Không viết tắt khó hiểu.
- Không để `console.log` trong mã commit. Dùng `lib/logger.ts` (không log dữ liệu sức khỏe/PII).
- Không để mã chết, import thừa, TODO không kèm lý do.

## ESLint + Prettier (cấu hình mục tiêu)

- ESLint: cấu hình của Next (`core-web-vitals`) + `typescript-eslint` (strict) + `eslint-config-prettier`; bật quy tắc a11y của JSX; thêm `no-restricted-imports` để chặn `domain` import từ `app`/`infrastructure`/`next`/`react`/`@prisma/client`.
- Prettier: `semi: true`, `singleQuote: true`, `trailingComma: "all"`, `printWidth: 100`, `tabWidth: 2`; plugin Tailwind để sắp xếp class.
- Script bắt buộc trong `package.json`: `typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`, `build`.
- Husky `pre-commit`: `lint-staged` (eslint --fix + prettier --write trên file đã stage) + quét Gitleaks trên phần staged. `pre-push`: `typecheck` + `test`.

## Phụ thuộc

- Thêm thư viện mới chỉ khi cần, nêu lý do ngắn trong `docs/DECISIONS.md`. Ưu tiên thư viện được bảo trì tích cực; kiểm tra bằng context7 và `npm audit` trước khi chốt.
- Không dùng thư viện UI lớn (MUI, Ant) — dùng Tailwind + component tự xây (có thể dùng primitive headless khi cần a11y phức tạp như dialog/combobox).
