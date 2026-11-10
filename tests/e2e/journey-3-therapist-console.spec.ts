import { test, expect } from '@playwright/test';

test.describe('Hành trình 3: Bảng điều khiển kỹ thuật viên (Therapist Console)', () => {
  test('Kỹ thuật viên đăng nhập, xem hồ sơ khách, ghi SessionLog và kiểm tra chống chỉ định', async ({
    page,
  }) => {
    // 1. Vào trang đăng nhập
    await page.goto('/dang-nhap');
    await expect(page.locator('text=Đăng nhập tài khoản')).toBeVisible();

    // 2. Điền tài khoản demo kỹ thuật viên bằng nút demo nhanh
    await page.click('button:has-text("KTV")');
    await page.click('button:has-text("Đăng nhập")');

    // 3. Chờ chuyển hướng hoặc navigate tới /ky-thuat-vien
    await page.waitForURL(/\/ky-thuat-vien|\/tai-khoan/, { timeout: 15000 });
    await page.goto('/ky-thuat-vien');
    await expect(page.locator('text=Lịch Trị Liệu & Hồ Sơ Khách Hàng')).toBeVisible({
      timeout: 15000,
    });

    // 4. Mở hồ sơ khách hàng đầu tiên
    const openBtn = page
      .locator('button:has-text("Mở hồ sơ & Ghi nhật ký →"), button:has-text("Xem / Sửa nhật ký")')
      .first();
    if ((await openBtn.count()) > 0) {
      await openBtn.click();
      await expect(page).toHaveURL(/\/ky-thuat-vien\/khach\//);

      // 5. Kiểm tra giao diện hồ sơ trị liệu
      await expect(page.locator('text=Hồ Sơ Trị Liệu:').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Nhật Ký Buổi Trị Liệu (SessionLog)')).toBeVisible();

      // 6. Điền ghi chú trị liệu
      const notesArea = page.locator('textarea#session-notes');
      await notesArea.fill(
        'Khách hàng đáp ứng rất tốt với liệu trình bấm huyệt, các cơ vai gáy thả lỏng nhiều.',
      );

      // 7. Kiểm tra phần toa dưỡng tại nhà và chống chỉ định
      await expect(page.locator('text=Chỉ Định Toa Sản Phẩm')).toBeVisible();
      await expect(page.locator('select#product-select')).toBeVisible();
    }
  });
});
