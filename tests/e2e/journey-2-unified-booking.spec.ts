import { test, expect } from '@playwright/test';

test.describe('Hành trình 2: Túi liệu trình (Unified Booking)', () => {
  test('Xác nhận lịch hẹn spa + nhận toa tại nhà trong 1 luồng giao dịch duy nhất', async ({
    page,
  }, testInfo) => {
    // 1. Vào trang túi liệu trình với dịch vụ thư giãn sâu
    await page.goto('/tui-lieu-trinh?serviceSlug=thu-gian-sau');
    await expect(page.getByRole('heading', { name: 'Túi Liệu Trình & Đặt Lịch Hẹn' })).toBeVisible({
      timeout: 15000,
    });

    // 2. Kiểm tra thông tin gói gộp trong 1 luồng duy nhất
    await expect(page.locator('text=Liệu trình thư giãn sâu & ngủ ngon')).toBeVisible();
    await expect(page.locator('text=Toa chăm sóc tại nhà đi kèm')).toBeVisible();
    await expect(page.locator('text=Tinh dầu thư giãn buổi tối')).toBeVisible();

    // 3. Điền thông tin đặt lịch hẹn buổi đầu tiên (phân bổ ngày và giờ theo project để không trùng lịch)
    const projectOffset =
      testInfo.project.name === 'chromium' ? 30 : testInfo.project.name === 'mobile' ? 50 : 70;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + projectOffset + Math.floor(Math.random() * 10));
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    await page.fill('input#booking-date', dateStr);

    // Chọn khung giờ riêng biệt
    const slot =
      testInfo.project.name === 'chromium'
        ? '10:30'
        : testInfo.project.name === 'mobile'
          ? '14:00'
          : '15:30';
    await page.click(`button:has-text("${slot}")`);

    // 4. Nhập thông tin khách hàng nếu chưa đăng nhập
    const nameInput = page.locator('input[placeholder*="Nguyễn Văn A"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Nguyễn Thị Minh An');
      await page.fill('input[placeholder*="ban@example.com"]', 'minhan@gmail.com');
      await page.fill('input[placeholder*="0912 345 678"]', '0912345678');
    }

    // 5. Đồng ý điều khoản sức khỏe
    await page.check('input[type="checkbox"][required]');

    // 6. Bấm nút Xác nhận duy nhất
    const confirmBtn = page.locator('button:has-text("Xác nhận túi liệu trình & Đặt lịch hẹn")');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 7. Kiểm tra màn hình thành công
    await expect(
      page
        .locator('text=Túi Liệu Trình Đã Được Đặt')
        .or(page.locator('text=Tiếp Nhận Túi Liệu Trình')),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Mã phác đồ:')).toBeVisible();
    await expect(page.locator('text=Toa chăm sóc tại nhà đi kèm:')).toBeVisible();
  });
});
