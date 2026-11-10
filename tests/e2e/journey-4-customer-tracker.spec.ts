import { test, expect } from '@playwright/test';

test.describe('Hành trình 4: Tài khoản khách & Treatment Tracker', () => {
  test('Khách hàng đăng nhập, theo dõi tiến trình phác đồ và quản lý quyền riêng tư dữ liệu', async ({
    page,
  }) => {
    // 1. Đăng nhập tài khoản khách hàng demo qua nút nhanh
    await page.goto('/dang-nhap');
    await expect(page.locator('text=Đăng nhập tài khoản')).toBeVisible();

    await page.click('button:has-text("Khách")');
    await page.click('button:has-text("Đăng nhập")');

    // 2. Chuyển hướng đến trang tài khoản
    await page.waitForURL(/\/tai-khoan/, { timeout: 15000 });
    await expect(page.locator('h1:has-text("Chào")')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button:has-text("Lộ trình & Treatment Tracker")')).toBeVisible();

    // 3. Chuyển sang Tab "Quyền riêng tư & Dữ liệu"
    const privacyTab = page.locator('button:has-text("Quyền riêng tư & Dữ liệu")');
    await privacyTab.click();

    // 4. Kiểm tra quyền kiểm soát dữ liệu của khách hàng (GDPR-like)
    await expect(page.locator('text=Xuất dữ liệu cá nhân')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Quyền được xóa bỏ (Right to Erasure)' }),
    ).toBeVisible();

    // 5. Mở thử hộp thoại xác nhận xóa tài khoản an toàn
    const deleteBtn = page.locator('button:has-text("Xóa toàn bộ tài khoản & Dữ liệu sức khỏe")');
    if ((await deleteBtn.count()) > 0) {
      await deleteBtn.click();
      await expect(page.locator('text=Xác nhận xóa tài khoản vĩnh viễn?')).toBeVisible();
      // Bấm hủy để bảo vệ dữ liệu demo
      await page.click('button:has-text("Hủy bỏ")');
      await expect(page.locator('text=Xác nhận xóa tài khoản vĩnh viễn?')).not.toBeVisible();
    }
  });
});
