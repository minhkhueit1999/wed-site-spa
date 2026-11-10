# Bộ khởi động Antigravity — Digital Wellness Platform (Spa)

Bộ file này biến Antigravity thành một "đội kỹ sư" có kỷ luật để xây website spa theo hướng **Quản lý Liệu trình & Chăm sóc Cá nhân hóa**: có Rules, Skills, Workflows, tài liệu yêu cầu, prompt theo giai đoạn, và khung CI/Git.

## Có gì trong bộ kit

```
AGENTS.md                  # điểm vào cho agent (trỏ tới rules/skills/workflows)
.agents/
  rules/      00-constitution, 01-architecture, 02-code-quality, 03-ui-ux-design,
              04-testing, 05-security-privacy, 06-rag-ai, 07-git-workflow
  skills/     recommendation-engine, treatment-lifecycle, rag-pipeline,
              spa-ui-design, quality-gate
  workflows/  /bootstrap /feature /quality-check /ui-review /git-publish
              /seed-knowledge /add-recommendation-rule
docs/         PRD.md, DOMAIN.md, DECISIONS.md
prompts/      00-master.md (dán 1 lần), phases.md (11 giai đoạn)
data/         knowledge/ (mẫu tài liệu RAG), eval/ (mẫu bộ đánh giá RAG)
.github/workflows/ci.yml
.gitignore, .env.example
```

## Cách dùng (5 bước)

1. **Cài công cụ ngoài** (PowerShell): `winget install Git.Git`, `winget install OpenJS.NodeJS.LTS`, `winget install GitHub.cli`, `winget install Gitleaks.Gitleaks`; cài Google Chrome. Mở lại terminal, rồi chạy `gh auth login`. (Nếu một mã winget không tìm thấy, dùng `winget search <tên>`.)
2. **Bật MCP** trong Antigravity: `context7` và `chrome-devtools` (xem hướng dẫn cấu hình `mcp_config.json` đã gửi trước đó).
3. **Tạo thư mục dự án**, giải nén bộ kit này vào ĐÚNG thư mục gốc đó (để `AGENTS.md` và `.agents/` nằm ngay gốc), chạy `git init`, rồi mở thư mục bằng **File → Open Folder** trong Antigravity.
4. **Kiểm tra agent đã nhận cấu hình:** mở "..." ở đầu khung agent → **Customizations**, xem mục Rules / Skills / Workflows có liệt kê các file ở trên. Nếu không thấy, đổi tên thư mục `.agents` thành `.agent` (bản cũ vẫn được hỗ trợ) rồi tải lại cửa sổ.
5. **Mở `prompts/00-master.md`**, dán nội dung master prompt vào khung chat. Agent sẽ đọc tài liệu, hỏi vài câu bắt buộc (URL repo Git, nhà cung cấp AI), rồi làm lần lượt từng giai đoạn trong `prompts/phases.md`. Sau mỗi giai đoạn nó sẽ dừng; bạn xem kết quả rồi gõ "tiếp tục giai đoạn N" (hoặc dán prompt giai đoạn đó).

## Ghi chú quan trọng

- **Nội dung chuyên môn spa là mẫu** (liệu trình, thành phần, chống chỉ định). Hãy nhờ chuyên gia spa/y tế duyệt trước khi dùng thật; danh sách việc cần duyệt nằm trong `docs/DECISIONS.md`.
- **Khóa API không bao giờ đưa vào chat hay commit.** Điền vào file `.env` trên máy bạn. Mặc định dự án chạy bằng bản giả (`mock/hash`) nên không cần khóa để phát triển và chạy test.
- **Không cài hàng loạt skill cộng đồng.** Chỉ thêm UI UX Pro Max (hoặc skill thiết kế tương tự) khi muốn; kit đã có `spa-ui-design` tự đủ dùng.
- **Đẩy lên Git:** agent sẽ dùng workflow `/git-publish` (kiểm tra chất lượng, quét secret, commit theo Conventional Commits, `git push`). Nó không force push và không tự tạo repo công khai. Nếu bị từ chối vì chưa đăng nhập, chạy `gh auth login`.
- Tên menu/thư mục của Antigravity thay đổi theo phiên bản; kit dùng `.agents/` là vị trí mặc định hiện hành.
