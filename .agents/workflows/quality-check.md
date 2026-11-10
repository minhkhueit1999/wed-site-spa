---
description: Chạy toàn bộ cổng chất lượng (typecheck, lint, format, test, build, Gitleaks, audit) và báo cáo bảng kết quả.
---

# /quality-check

Làm theo skill `quality-gate`.

1.

// turbo
`npm run typecheck` 2.
// turbo
`npm run lint` 3.
// turbo
`npm run format:check` 4.
// turbo
`npm run test:coverage` 5.
// turbo
`npm run build` 6.
// turbo
`gitleaks detect --source . --no-banner` 7.
// turbo
`npm audit --omit=dev` 8. Bước nào lỗi: sửa nguyên nhân gốc (không tắt rule, không nới cấu hình, không bỏ test), rồi chạy lại từ bước đó và chạy lại cả chuỗi một lần cuối. 9. Báo cáo bảng ngắn theo mẫu trong skill `quality-gate`, kèm việc chưa làm được và lý do.
