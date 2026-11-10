---
name: quality-gate
description: Quy trình xác minh một thay đổi đã thật sự hoàn thành gồm typecheck, lint, format, test, build, quét secret, audit phụ thuộc và kiểm tra giao diện thực tế. Dùng trước khi báo hoàn thành một tính năng, trước khi commit/push, hoặc khi người dùng hỏi mã đã ổn chưa.
---

# Cổng chất lượng

## Nguyên tắc

Không nói "xong" khi chưa chạy kiểm tra. Báo cáo dựa trên kết quả chạy thật, không dựa trên suy đoán.

## Các bước

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check` (lỗi → `npm run format` rồi kiểm tra lại)
4. `npm run test` (và `npm run test:coverage` ở cuối mỗi giai đoạn; so với ngưỡng trong rule `04-testing`)
5. `npm run build`
6. Quét secret: `gitleaks detect --source . --no-banner` (nếu chưa cài, báo người dùng cài `winget install Gitleaks.Gitleaks` rồi tiếp tục các bước còn lại và ghi rõ bước này chưa chạy)
7. `npm audit --omit=dev` (chỉ báo cáo; xử lý mức high/critical)
8. Nếu có thay đổi UI: chạy `/ui-review`

## Khi một bước thất bại

- Đọc lỗi đầu tiên (các lỗi sau thường là hệ quả).
- Sửa nguyên nhân gốc. Không tắt rule ESLint, không nới tsconfig, không xóa/bỏ qua test để cho qua.
- Chạy lại từ bước thất bại, rồi chạy lại toàn bộ chuỗi một lần cuối.

## Mẫu báo cáo (ngắn)

| Bước      | Kết quả                      |
| --------- | ---------------------------- |
| typecheck | qua                          |
| lint      | qua                          |
| format    | qua                          |
| test      | 128 qua, coverage domain 93% |
| build     | qua                          |
| gitleaks  | qua                          |
| audit     | 0 high/critical              |
| ui-review | 375/1280 sạch, 0 lỗi console |

Kèm: danh sách việc chưa làm được và lý do, nếu có.
