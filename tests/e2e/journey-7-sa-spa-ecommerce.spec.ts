import { test, expect } from '@playwright/test';

test.describe('Hành trình 7: Hệ sinh thái E-commerce Sả Spa & Cổng Xác Thực Bắt Buộc', () => {
  test('Khách truy cập gặp Cổng Auth Gate Sả Spa, mở khóa VIP, khám phá cửa hàng, xem nhanh 3D, áp mã giảm giá, đặt hộp tre quà tặng VietQR và theo dõi hành trình đơn hàng', async ({
    browser,
  }) => {
    // 1. CỔNG XÁC THỰC BẮT BUỘC (MANDATORY AUTH GATE)
    // Tạo ngữ cảnh trình duyệt sạch hoàn toàn (chưa có cookie hoặc localStorage)
    const freshContext = await browser.newContext({ storageState: undefined });
    const page = await freshContext.newPage();

    await page.goto('/');

    // Kiểm tra Cổng Xác Thực Sả Spa hiển thị ngay lập tức
    await expect(page.locator('text=🌿 Cổng Vào Sả Spa 🌿')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1:has-text("Sả Spa Botanical")')).toBeVisible();
    await expect(
      page.locator('text=Không gian hương thảo mộc & Sản phẩm trị liệu Đông Dương cao cấp'),
    ).toBeVisible();

    // Chuyển đổi tab sang Đăng Ký Thành Viên với chuyển động mượt mà
    await page.click('button:has-text("Đăng Ký Thành Viên")');
    await expect(page.locator('label:has-text("Họ và tên")')).toBeVisible();
    await expect(page.locator('text=🌿 Chọn nốt hương bạn yêu thích nhất:')).toBeVisible();
    await expect(page.locator('button:has-text("Sả Chanh Thanh Lọc")')).toBeVisible();
    await expect(page.locator('button:has-text("Hoa Nhài Ngủ Sâu")')).toBeVisible();

    // Nhấp chọn nốt hương Hoa Nhài để cá nhân hóa
    await page.click('button:has-text("Hoa Nhài Ngủ Sâu")');

    // Chuyển lại tab Đăng Nhập
    await page.click('button:has-text("Đăng Nhập")');
    await expect(page.locator('label:has-text("Địa chỉ Email")')).toBeVisible();

    // Mở khóa nhanh bằng nút Khách VIP Demo dành cho ban giám khảo / giảng viên
    await page.click('button:has-text("Vào Nhanh (Khách VIP Demo)")');

    // Kiểm tra Hiệu ứng Mở Cổng Hoàng Gia (Grand Portal Reveal)
    await expect(page.locator('text=Chào mừng bạn đến với')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Sả Spa Botanical Sanctuary')).toBeVisible();

    // Chờ cổng mở hoàn tất và bước vào không gian chính của trang chủ
    await expect(page.locator('text=Chăm sóc trọn vẹn từ spa đến chính ngôi nhà bạn')).toBeVisible({
      timeout: 10000,
    });

    // 2. TRẢI NGHIỆM CỬA HÀNG THẢO MỘC SẢ SPA (/shop)
    await page.goto('/shop');
    await expect(page.getByRole('heading', { name: 'Cửa Hàng Sả Spa Sanctuary' })).toBeVisible({
      timeout: 10000,
    });

    // Kiểm tra thanh tìm kiếm đa giác quan tức thì (Instant Sensory Search)
    const searchInput = page.locator(
      'input[placeholder="Tìm theo tên sản phẩm, nốt hương (sả chanh, nhài, trầm) hoặc triệu chứng..."]',
    );
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Sả Chanh');

    // Kiểm tra sản phẩm Tinh Dầu Sả Chanh Nguyên Chất được hiển thị
    await expect(page.locator('h3:has-text("Tinh Dầu Sả Chanh Nguyên Chất")').first()).toBeVisible({
      timeout: 6000,
    });

    // Xóa tìm kiếm để hiển thị toàn bộ danh mục
    await searchInput.fill('');

    // 3. XEM NHANH 3D & NGHI THỨC DƯỠNG TẠI NHÀ (QUICK VIEW MODAL)
    // Mở Modal Xem Nhanh trên sản phẩm đầu tiên
    const quickViewBtn = page.locator('button:has-text("👁 Xem nhanh")').first();
    await quickViewBtn.click();

    // Kiểm tra tiêu đề modal và nghi thức sử dụng 3 bước
    await expect(page.locator('text=Nghi Thức Sử Dụng (3 Bước)')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('strong.text-current').first()).toBeVisible();

    // Thử nghiệm chế độ ánh sáng Dark Ambience (Không gian Spa ấm ban đêm)
    const darkToggle = page.locator('button[title*="Chuyển chế độ ánh sáng"]');
    await expect(darkToggle).toBeVisible();
    await darkToggle.dispatchEvent('click');
    await expect(page.locator('button:has-text("☀️ Ánh Sáng Tự Nhiên")')).toBeVisible();

    // Thêm sản phẩm vào giỏ hàng từ Quick View Modal
    const addToCartModalBtn = page.locator('button:has-text("Thêm Vào Giỏ Hàng & Tiếp Tục →")');
    await addToCartModalBtn.dispatchEvent('click');

    // 4. GIỎ HÀNG TRƯỢT THÔNG MINH (CART DRAWER) & MÃ ƯU ĐÃI
    // Chờ CartDrawer tự động mở ra
    await expect(page.locator('h2:has-text("Túi Sản Phẩm Sả Spa")')).toBeVisible({ timeout: 8000 });

    // Áp dụng mã ưu đãi SASPA15 (-15%)
    const couponInput = page.locator('input[placeholder*="Mã ưu đãi"]');
    await couponInput.fill('SASPA15');
    await page.click('button:has-text("Áp dụng")');

    // Xác nhận phản hồi thành công và tỷ lệ giảm giá 15%
    await expect(page.locator('text=Áp dụng mã SASPA15 thành công')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('text=Giảm giá (15%):')).toBeVisible();

    // Nhấp Tiến Hành Đặt Hàng để sang trang Checkout
    await page.click('a[href="/checkout"]');
    await expect(page).toHaveURL(/\/checkout/);

    // 5. THANH TOÁN 3 BƯỚC (/checkout) & GÓI HỘP TRE THIỆP TAY VIETQR
    await expect(
      page.getByRole('heading', { name: 'Thanh Toán & Đóng Gói Hộp Tre Sả Spa' }),
    ).toBeVisible({ timeout: 10000 });

    // Bước 1: Xác nhận thông tin nhận hàng và tùy chỉnh Hộp Mây Tre Đan Thủ Công & Viết Thiệp Tay
    await expect(page.locator('h2:has-text("1. Thông Tin Nhận Hàng")')).toBeVisible();
    const messageInput = page.locator('textarea');
    await messageInput.fill('Kính chúc bạn vạn an, thảnh thơi và có giấc ngủ an lành cùng Sả Spa.');

    // Kiểm tra xem thiệp thư pháp hiển thị văn bản theo thời gian thực
    await expect(
      page.locator('p.font-serif.italic:has-text("Kính chúc bạn vạn an")'),
    ).toBeVisible();

    await page.click('button:has-text("Tiếp Tục Chọn Phương Thức Giao Hàng →")');

    // Bước 2: Phương thức vận chuyển
    await expect(page.locator('text=2. Phương Thức Vận Chuyển')).toBeVisible();
    await page.click('button:has-text("Tiếp Tục Chọn Thanh Toán →")');

    // Bước 3: Phương thức thanh toán VietQR với mã QR động
    await expect(page.locator('text=3. Phương Thức Thanh Toán')).toBeVisible();
    await expect(page.locator('text=Chuyển khoản VietQR Nhanh (Khuyên dùng)')).toBeVisible();
    // Kiểm tra mã SVG VietQR mô phỏng hiển thị
    await expect(page.locator('svg[viewBox="0 0 100 100"]')).toBeVisible();

    // Bấm Xác Nhận Đặt Hàng
    const submitOrderBtn = page.locator('button:has-text("Xác Nhận Đặt Hàng")');
    await submitOrderBtn.click();

    // Kiểm tra Màn hình Nghi Thức Hoàn Tất Đơn Hàng (Order Confirmation Ritual)
    await expect(page.locator('text=Cảm Ơn Bạn Đã Chọn Sả Spa')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Đơn Hàng Đã Được Tiếp Nhận')).toBeVisible();
    await expect(page.locator('text=SASPA-')).toBeVisible();

    // 6. THEO DÕI HÀNH TRÌNH ĐƠN HÀNG (/orders) & MUA LẠI
    await page.click('a:has-text("Xem Lịch Trình & Theo Dõi Đơn Hàng →")');
    await expect(page).toHaveURL(/\/orders/);

    await expect(
      page.getByRole('heading', { name: 'Lịch Sử & Hành Trình Đơn Hàng Thảo Mộc' }),
    ).toBeVisible({ timeout: 10000 });

    // Kiểm tra đơn hàng vừa đặt có các bước theo dõi trạng thái
    await expect(page.locator('text=Chuẩn bị thảo mộc').first()).toBeVisible();
    await expect(page.locator('text=Đóng gói hộp tre').first()).toBeVisible();

    // Thử tính năng Mua Lại Đơn Này (Re-order)
    const reorderBtn = page.locator('button:has-text("Mua lại đơn này")').first();
    await expect(reorderBtn).toBeVisible();
    await reorderBtn.click();

    // Xác nhận CartDrawer mở lại chứa các sản phẩm được tái nạp
    await expect(page.locator('h2:has-text("Túi Sản Phẩm Sả Spa")')).toBeVisible();

    // Đóng browser context
    await freshContext.close();
  });
});
