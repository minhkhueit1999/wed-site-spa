import { test, expect } from '@playwright/test';

test.describe('Hành trình 1: Trắc nghiệm chẩn đoán & Gợi ý phác đồ cá nhân hóa', () => {
  test('Khách hàng làm trắc nghiệm giấc ngủ, nhận gợi ý phác đồ kèm toa tại nhà không giỏ hàng', async ({
    page,
  }) => {
    // 1. Vào trang chủ spa
    await page.goto('/');
    await expect(page).toHaveTitle(/Digital Wellness/);
    await expect(
      page.locator('text=Chăm sóc trọn vẹn từ spa đến chính ngôi nhà bạn'),
    ).toBeVisible();

    // 2. Chuyển sang trang Trắc nghiệm chẩn đoán (/tu-van)
    await page.click('text=Bắt đầu bài trắc nghiệm (3 phút)');
    await expect(page).toHaveURL(/\/tu-van/);
    await expect(
      page.getByRole('heading', { name: 'Trắc nghiệm chẩn đoán thể trạng' }),
    ).toBeVisible();

    // 3. Chọn nhóm vấn đề: Căng thẳng & Giấc ngủ
    await page.click('button:has-text("Căng thẳng & Giấc ngủ")');

    // 4. Trả lời các câu hỏi khảo sát
    await page.click('text=Từ 30 đến 60 phút, trằn trọc suy nghĩ');
    await page.click('button:has-text("Tiếp theo →")');

    await page.click('text=Hay lo âu, nhức mỏi hai bên thái dương');
    await page.click('button:has-text("Tiếp theo →")');

    // 5. Câu hỏi an toàn & đồng ý thu thập dữ liệu
    await page.click('text=Không có');
    await page.check('input#quiz-consent');

    // 6. Gửi trắc nghiệm
    await page.click('button:has-text("Xem kết quả gợi ý")');

    // 7. Chuyển sang trang Kết quả (/ket-qua)
    await expect(page).toHaveURL(/\/ket-qua/);
    await expect(
      page.getByRole('heading', { name: 'Phác đồ điều trị & Toa chăm sóc đề xuất' }),
    ).toBeVisible({
      timeout: 15000,
    });

    // 8. Kiểm tra thẻ dịch vụ được gợi ý do Rule Engine quyết định
    await expect(page.locator('text=Liệu trình thư giãn sâu & ngủ ngon')).toBeVisible();
    await expect(page.locator('text=Vì sao bạn được gợi ý phác đồ này?')).toBeVisible();

    // 9. Kiểm tra toa chăm sóc tại nhà đi kèm
    await expect(page.locator('text=Toa chăm sóc tại nhà đi kèm')).toBeVisible();
    await expect(page.locator('text=Tinh dầu thư giãn buổi tối')).toBeVisible();
    await expect(page.locator('text=Trà thảo mộc an thần buổi tối')).toBeVisible();

    // 10. RÀNG BUỘC KHÔNG THƯƠNG LƯỢNG: Không có giỏ hàng, không có nút mua lẻ
    await expect(page.locator('text=Thêm vào giỏ')).toHaveCount(0);
    await expect(page.locator('button:has-text("Mua ngay")')).toHaveCount(0);

    // 11. Nút CTA chuyển sang đặt túi liệu trình duy nhất
    await expect(page.locator('text=Đặt túi liệu trình này →').first()).toBeVisible();
  });
});
