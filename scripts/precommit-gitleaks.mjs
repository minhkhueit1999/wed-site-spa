import { execSync } from 'child_process';

try {
  // Kiểm tra gitleaks có trong PATH không
  execSync('gitleaks version', { stdio: 'ignore' });
  console.log('Chạy quét bí mật với Gitleaks...');
  execSync('gitleaks protect --staged --verbose', { stdio: 'inherit' });
} catch (error) {
  // Nếu lệnh gitleaks version thất bại do chưa cài
  if (error.code === 'ENOENT') {
    console.warn('CẢNH BÁO: Chưa phát hiện Gitleaks trong hệ thống. Bỏ qua quét secret tự động.');
    process.exit(0);
  }
  // Nếu gitleaks phát hiện secret leak
  console.error('LỖI: Gitleaks phát hiện rò rỉ khóa bí mật/mật khẩu trong các file đã stage!');
  process.exit(1);
}
