import fs from 'node:fs';

try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
} catch {
  // Bỏ qua lỗi khóa tạm thời nếu có
}
