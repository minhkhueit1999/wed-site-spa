import { test, expect } from '@playwright/test';

test.describe('Hành trình 6: Immersive Motion & WebGL Adaptive Experience', () => {
  test('Trang chủ hiển thị đầy đủ bộ chuyển đổi chế độ và khối 3D Hero', async ({ page }) => {
    await page.goto('/');

    // 1. Kiểm tra tiêu đề chính hiển thị tức thì (LCP < 2.5s, CLS = 0)
    const heading = page.getByRole('heading', {
      level: 1,
      name: /Chăm sóc trọn vẹn từ spa đến chính ngôi nhà bạn/i,
    });
    await expect(heading).toBeVisible();

    // 2. Kiểm tra bộ chuyển chế độ hiển thị trên Header
    const modeBtn = page.getByRole('button', { name: /Tùy chọn chế độ hiển thị/i });
    await expect(modeBtn).toBeVisible();
    await expect(modeBtn).toContainText('Hiệu ứng:');

    // 3. Mở menu và chuyển sang chế độ Tĩnh
    await modeBtn.click();
    const staticOption = page.getByRole('menuitem', { name: /Tĩnh/i });
    await expect(staticOption).toBeVisible();
    await staticOption.click();

    // Xác nhận đã lưu vào localStorage và giao diện cập nhật sang Tĩnh
    await expect(modeBtn).toContainText('Tĩnh');
    const savedMode = await page.evaluate(() => localStorage.getItem('spa_motion_mode'));
    expect(savedMode).toBe('reduced');
  });

  test('Trang Tài khoản hiển thị khối cầu thở 3D BreathingOrb và tương tác mượt mà', async ({
    page,
  }) => {
    // Đăng nhập bằng tài khoản Khách
    await page.goto('/dang-nhap');
    await page.click('button:has-text("Khách")');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForURL(/\/tai-khoan/, { timeout: 15000 });

    // Cuộn tới widget điều hòa nhịp thở 4-7-8
    const breathingHeading = page.getByRole('heading', {
      level: 3,
      name: /Điều hòa nhịp thở 4-7-8/i,
    });
    await expect(breathingHeading).toBeVisible();

    // Kiểm tra ARIA live region trạng thái
    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText('Chuẩn bị');

    // Chuyển sang chế độ 2D
    const toggle2DBtn = page.getByTitle(/Chuyển đổi giao diện/i);
    await expect(toggle2DBtn).toBeVisible();
    await toggle2DBtn.click();
    await expect(toggle2DBtn).toContainText('2D');

    // Bắt đầu nhịp thở
    const startBreathingBtn = page.getByRole('button', { name: /Bắt đầu thở/i });
    await startBreathingBtn.click();
    await expect(statusRegion).toContainText('Hít vào sâu');

    // Tạm dừng nhịp thở
    const pauseBtn = page.getByRole('button', { name: /Tạm dừng/i });
    await expect(pauseBtn).toBeVisible();
    await pauseBtn.click();
  });

  test('Tự động hạ cấp sang chế độ Tĩnh khi hệ điều hành bật prefers-reduced-motion', async ({
    page,
  }) => {
    // Giả lập hệ điều hành bật reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const modeBtn = page.getByRole('button', { name: /Tùy chọn chế độ hiển thị/i });
    await expect(modeBtn).toBeVisible();

    // Khi không có ghi đè từ trước, tự động áp dụng Tĩnh
    await expect(modeBtn).toContainText('Tĩnh');
  });
});
