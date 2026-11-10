# AGENTS.md — Digital Wellness Platform (Spa)

Hệ thống quản lý liệu trình & chăm sóc cá nhân hóa cho spa. Sản phẩm là "toa chăm sóc tại nhà" đi kèm dịch vụ, KHÔNG phải cửa hàng bán lẻ.

## Trước khi làm bất kỳ việc gì

1. Đọc `docs/PRD.md` và `docs/DOMAIN.md`.
2. Tuân theo `.agents/rules/` (đặc biệt `00-constitution.md`).
3. Dùng workflow trong `.agents/workflows/`: `/bootstrap`, `/feature`, `/quality-check`, `/ui-review`, `/git-publish`, `/seed-knowledge`, `/add-recommendation-rule`.
4. Dùng skill trong `.agents/skills/` khi đúng chủ đề: `recommendation-engine`, `treatment-lifecycle`, `rag-pipeline`, `spa-ui-design`, `quality-gate`.

## Công cụ MCP

- `context7`: tra tài liệu thư viện đúng phiên bản TRƯỚC khi viết code dùng Next.js, Prisma, Auth.js, Tailwind, Vitest.
- `chrome-devtools`: kiểm tra giao diện chạy thật (console, ảnh chụp mobile/desktop, hiệu năng).

## Lệnh thường dùng (sau khi /bootstrap xong)

`npm run dev` · `npm run typecheck` · `npm run lint` · `npm run format` · `npm run test` · `npm run build` · `npm run db:seed` · `npm run rag:ingest` · `npm run rag:eval`
