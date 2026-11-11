import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu gieo mầm dữ liệu (seed) MK SPA ---');

  const demoPassword = process.env.DEMO_PASSWORD || 'SpaDemo2026!';
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  // 1. Danh sách Người dùng (Admin, KTV, Khách hàng)
  const users = [
    {
      email: 'khachhang@spawellness.vn',
      name: 'Nguyễn Minh An',
      role: 'CUSTOMER',
      passwordHash,
    },
    {
      email: 'khach2@spawellness.vn',
      name: 'Vũ Mai Phương',
      role: 'CUSTOMER',
      passwordHash,
    },
    {
      email: 'khach3@spawellness.vn',
      name: 'Hoàng Kim Oanh',
      role: 'CUSTOMER',
      passwordHash,
    },
    {
      email: 'kythuatvien@spawellness.vn',
      name: 'Lê Hoàng Yến',
      role: 'THERAPIST',
      passwordHash,
    },
    {
      email: 'ktv2@spawellness.vn',
      name: 'Phạm Thu Hà',
      role: 'THERAPIST',
      passwordHash,
    },
    {
      email: 'ktv3@spawellness.vn',
      name: 'Đỗ Minh Tuấn',
      role: 'THERAPIST',
      passwordHash,
    },
    {
      email: 'quantri@spawellness.vn',
      name: 'Trần Quản Trị',
      role: 'ADMIN',
      passwordHash,
    },
  ];

  const createdUsers: Record<string, { id: string; email: string; name: string }> = {};

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        passwordHash: u.passwordHash,
      },
      create: u,
    });
    createdUsers[u.email] = { id: user.id, email: user.email, name: user.name };

    // Tạo hồ sơ khách hàng
    if (u.role === 'CUSTOMER') {
      const isVip = u.email === 'khach3@spawellness.vn';
      const isGold = u.email === 'khachhang@spawellness.vn';
      await prisma.customerProfile.upsert({
        where: { userId: user.id },
        update: {
          consentAt: new Date(),
          loyaltyTier: isVip ? 'DIAMOND' : isGold ? 'GOLD' : 'SILVER',
          loyaltyPoints: isVip ? 1200 : isGold ? 450 : 150,
          totalSpentVnd: isVip ? 36500000 : isGold ? 18200000 : 7500000,
          debtBalanceVnd: isGold ? 450000 : 0,
          prepaidSessions: isVip ? 4 : isGold ? 2 : 0,
          medicalNotes: isGold ? 'Tiền sử dị ứng phấn hoa & tinh dầu sả nồng độ cao' : null,
          phone: isVip ? '0912345678' : isGold ? '0987654321' : '0905123456',
        },
        create: {
          userId: user.id,
          safetyFlags: isGold ? JSON.stringify(['allergy-essential-oil']) : JSON.stringify([]),
          consentAt: new Date(),
          loyaltyTier: isVip ? 'DIAMOND' : isGold ? 'GOLD' : 'SILVER',
          loyaltyPoints: isVip ? 1200 : isGold ? 450 : 150,
          totalSpentVnd: isVip ? 36500000 : isGold ? 18200000 : 7500000,
          debtBalanceVnd: isGold ? 450000 : 0,
          prepaidSessions: isVip ? 4 : isGold ? 2 : 0,
          medicalNotes: isGold ? 'Tiền sử dị ứng phấn hoa & tinh dầu sả nồng độ cao' : null,
          phone: isVip ? '0912345678' : isGold ? '0987654321' : '0905123456',
          notes: 'Khách VIP quen thuộc tại cơ sở MK SPA.',
        },
      });
    }
  }
  console.log(`✓ Đã tạo ${users.length} tài khoản người dùng và hồ sơ CRM`);

  // 2. Triệu chứng (Concerns)
  const concerns = [
    {
      slug: 'mat-ngu',
      name: 'Khó ngủ, ngủ chập chờn',
      category: 'sleep-stress',
      description: 'Thao thức, khó đi vào giấc ngủ, ngủ không sâu giấc và dễ thức giấc giữa đêm.',
      searchKeywords: 'mất ngủ, mat ngu, kho ngu, tran troc, ngu khong ngon, dem kho ngu',
    },
    {
      slug: 'cang-thang',
      name: 'Căng thẳng kéo dài',
      category: 'sleep-stress',
      description: 'Áp lực công việc, mệt mỏi tinh thần, đau đầu nhẹ và khó tập trung.',
      searchKeywords: 'căng thẳng, cang thang, stress, met moi, ap luc, dau dau, ue oai',
    },
    {
      slug: 'moi-vai-gay',
      name: 'Mỏi vai gáy',
      category: 'muscle',
      description: 'Căng cứng cơ vùng cổ, vai và lưng trên do ngồi làm việc máy tính lâu.',
      searchKeywords: 'mỏi vai gáy, moi vai gay, dau vai gay, nhuc co, co vai, dan van phong',
    },
    {
      slug: 'da-kich-ung',
      name: 'Da dễ kích ứng, nhạy cảm',
      category: 'skin',
      description: 'Da dễ đỏ rát, châm chích khi đổi thời tiết hoặc tiếp xúc mỹ phẩm lạ.',
      searchKeywords: 'da kích ứng, da kich ung, man do, nhay cam, ngua, rat da, de do',
    },
    {
      slug: 'da-kho',
      name: 'Da khô, thiếu ẩm',
      category: 'skin',
      description: 'Bề mặt da thô ráp, thiếu sức sống, bong tróc nhẹ vào mùa hanh khô.',
      searchKeywords: 'da khô, da kho, bong troc, thieu nuoc, thieu am, nut ne',
    },
    {
      slug: 'da-xin-mau',
      name: 'Da xỉn màu, thiếu sức sống',
      category: 'skin',
      description: 'Bề mặt da kém tươi sáng do tích tụ tế bào sừng và tuần hoàn máu kém.',
      searchKeywords: 'da xỉn màu, sam da, thieu suc song, toi mau, quang tham',
    },
  ];

  for (const c of concerns) {
    await prisma.concern.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`✓ Đã tạo ${concerns.length} nhóm triệu chứng`);

  // 3. Dịch vụ Spa (Services)
  const services = [
    {
      slug: 'thu-gian-sau',
      name: 'Liệu trình thư giãn sâu & ngủ ngon',
      description:
        'Kết hợp massage ấn huyệt đầu cổ, xông tinh dầu thảo dược ấm và chuông xoay Tây Tạng giúp làm dịu hệ thần kinh.',
      durationMin: 75,
      sessionsRecommended: 6,
      priceVnd: 1200000,
      active: true,
    },
    {
      slug: 'giai-toa-vai-gay',
      name: 'Liệu trình giải tỏa vai gáy',
      description:
        'Chuyên sâu giải tỏa các điểm thắt cơ (trigger points), chườm túi thảo dược ngải cứu ấm vùng lưng trên.',
      durationMin: 60,
      sessionsRecommended: 6,
      priceVnd: 950000,
      active: true,
    },
    {
      slug: 'phuc-hoi-da-nhay-cam',
      name: 'Liệu trình phục hồi da nhạy cảm',
      description:
        'Làm dịu tức thì hiện tượng đỏ rát, bổ sung ceramide và khoáng chất tự nhiên tái thiết lập hàng rào bảo vệ da.',
      durationMin: 75,
      sessionsRecommended: 8,
      priceVnd: 1350000,
      active: true,
    },
    {
      slug: 'cap-am-sang-da',
      name: 'Liệu trình cấp ẩm & làm sáng da',
      description:
        'Điện di tinh chất HA đa phân tử kết hợp mặt nạ tế bào thực vật hữu cơ nuôi dưỡng làn da căng mọng, rạng rỡ.',
      durationMin: 60,
      sessionsRecommended: 6,
      priceVnd: 1100000,
      active: true,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`✓ Đã tạo ${services.length} dịch vụ`);

  // 4. Sản phẩm toa tại nhà & Kho hàng (Products & Inventory)
  const products = [
    {
      slug: 'tinh-dau-thu-gian',
      name: 'Tinh dầu thư giãn buổi tối',
      description: 'Chiết xuất từ hoa oải hương, ngọc lan tây và vỏ cam ngọt hữu cơ chuẩn Organic.',
      usageGuide:
        'Nhỏ 2-3 giọt vào lòng bàn tay xoa ấm và hít thở sâu, hoặc dùng với máy khuếch tán.',
      priceVnd: 320000,
      costPriceVnd: 140000,
      stockQuantity: 42,
      minStockAlert: 10,
      unit: 'chai 30ml',
      imageUrl:
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
      active: true,
    },
    {
      slug: 'tra-thao-moc-toi',
      name: 'Trà thảo mộc an thần buổi tối',
      description: 'Hỗn hợp hoa cúc la mã, tim sen và táo đỏ sao vàng hạ thổ.',
      usageGuide:
        'Hãm 1 túi lọc cùng 200ml nước sôi 90°C trong 10 phút, uống trước khi ngủ 45 phút.',
      priceVnd: 180000,
      costPriceVnd: 75000,
      stockQuantity: 65,
      minStockAlert: 15,
      unit: 'hộp 20 túi',
      imageUrl:
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      active: true,
    },
    {
      slug: 'dau-massage-vai-gay',
      name: 'Dầu massage ấm vai gáy thảo mộc',
      description: 'Dầu gừng gió ngâm hạt mùi và tinh dầu tràm gió tạo cảm giác ấm sâu.',
      usageGuide:
        'Thoa một lượng vừa đủ lên vùng cổ vai, xoa bóp nhẹ nhàng từ 5-10 phút sau khi tắm.',
      priceVnd: 290000,
      costPriceVnd: 120000,
      stockQuantity: 28,
      minStockAlert: 10,
      unit: 'chai 50ml',
      imageUrl:
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      active: true,
    },
    {
      slug: 'mieng-dan-nhiet',
      name: 'Miếng dán thảo dược ấm vai gáy',
      description:
        'Phát nhiệt tự nhiên 40°C duy trì liên tục suốt 6 giờ, chứa ngải cứu và quế chi.',
      usageGuide: 'Dán trực tiếp vào điểm cơ căng mỏi nhất, dùng 1 miếng mỗi ngày khi cần làm dịu.',
      priceVnd: 150000,
      costPriceVnd: 60000,
      stockQuantity: 8, // Thấp hơn minStockAlert (10) để kích hoạt cảnh báo tồn kho
      minStockAlert: 10,
      unit: 'hộp 5 miếng',
      imageUrl:
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      active: true,
    },
    {
      slug: 'serum-phuc-hoi',
      name: 'Serum phục hồi dịu nhẹ B5 & Rau má',
      description:
        'Panthenol 5% tinh khiết kết hợp chiết xuất rau má Centella Asiatica dịu da tức thì.',
      usageGuide: 'Dùng 3-4 giọt thoa đều khắp mặt mỗi sáng và tối sau bước toner cân bằng.',
      priceVnd: 480000,
      costPriceVnd: 210000,
      stockQuantity: 18,
      minStockAlert: 10,
      unit: 'lọ 30ml',
      imageUrl:
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      active: true,
    },
    {
      slug: 'kem-duong-am',
      name: 'Kem dưỡng ẩm dịu nhẹ không hương liệu',
      description: 'Ceramide NP kết hợp dầu jojoba nguyên chất, không chứa hương liệu và cồn xấu.',
      usageGuide: 'Lấy lượng cỡ hạt đậu thoa nhẹ nhàng để khóa ẩm ở bước dưỡng da cuối cùng.',
      priceVnd: 360000,
      costPriceVnd: 160000,
      stockQuantity: 5, // Thấp hơn minStockAlert (12) để kích hoạt cảnh báo tồn kho
      minStockAlert: 12,
      unit: 'hũ 50g',
      imageUrl:
        'https://images.unsplash.com/photo-1608248597359-57e0bfa93297?auto=format&fit=crop&w=600&q=80',
      active: true,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });

    // Tạo bản ghi giao dịch kho khởi đầu
    const existingTx = await prisma.inventoryTransaction.findFirst({
      where: { productSlug: p.slug },
    });
    if (!existingTx) {
      await prisma.inventoryTransaction.create({
        data: {
          productSlug: p.slug,
          type: 'IMPORT',
          quantity: p.stockQuantity,
          balanceAfter: p.stockQuantity,
          costPriceVnd: p.costPriceVnd,
          reason: 'Nhập kho ban đầu định kỳ tháng 11/2026',
          actorId: createdUsers['quantri@spawellness.vn']?.id || 'admin',
        },
      });
    }
  }
  console.log(`✓ Đã tạo ${products.length} sản phẩm toa tại nhà với đầy đủ ảnh và tồn kho`);

  // 5. Liên kết Dịch vụ - Sản phẩm
  const serviceProducts = [
    { serviceSlug: 'thu-gian-sau', productSlug: 'tinh-dau-thu-gian' },
    { serviceSlug: 'thu-gian-sau', productSlug: 'tra-thao-moc-toi' },
    { serviceSlug: 'giai-toa-vai-gay', productSlug: 'dau-massage-vai-gay' },
    { serviceSlug: 'giai-toa-vai-gay', productSlug: 'mieng-dan-nhiet' },
    { serviceSlug: 'phuc-hoi-da-nhay-cam', productSlug: 'serum-phuc-hoi' },
    { serviceSlug: 'phuc-hoi-da-nhay-cam', productSlug: 'kem-duong-am' },
    { serviceSlug: 'cap-am-sang-da', productSlug: 'kem-duong-am' },
  ];

  for (const sp of serviceProducts) {
    await prisma.serviceProduct.upsert({
      where: {
        serviceSlug_productSlug: {
          serviceSlug: sp.serviceSlug,
          productSlug: sp.productSlug,
        },
      },
      update: {},
      create: sp,
    });
  }

  // 6. Luật gợi ý (Rules)
  const rules = [
    {
      id: 'R-001',
      concernSlug: 'mat-ngu',
      minSeverity: 2,
      serviceSlug: 'thu-gian-sau',
      productSlugs: JSON.stringify(['tinh-dau-thu-gian', 'tra-thao-moc-toi']),
      priority: 5,
      rationale:
        'Phù hợp tình trạng khó ngủ, giúp điều hòa hệ thần kinh thực vật và duy trì giấc ngủ sâu tự nhiên.',
      active: true,
    },
    {
      id: 'R-002',
      concernSlug: 'cang-thang',
      minSeverity: 3,
      serviceSlug: 'thu-gian-sau',
      productSlugs: JSON.stringify(['tinh-dau-thu-gian']),
      priority: 4,
      rationale:
        'Giải tỏa áp lực tinh thần, giảm căng thẳng thần kinh và cải thiện chất lượng giấc ngủ.',
      active: true,
    },
    {
      id: 'R-003',
      concernSlug: 'moi-vai-gay',
      minSeverity: 2,
      serviceSlug: 'giai-toa-vai-gay',
      productSlugs: JSON.stringify(['dau-massage-vai-gay', 'mieng-dan-nhiet']),
      priority: 5,
      rationale:
        'Tập trung giải tỏa co thắt cơ cổ vai gáy do tư thế ngồi và hỗ trợ giữ ấm lưu thông khí huyết tại nhà.',
      active: true,
    },
    {
      id: 'R-004',
      concernSlug: 'da-kich-ung',
      minSeverity: 2,
      serviceSlug: 'phuc-hoi-da-nhay-cam',
      productSlugs: JSON.stringify(['serum-phuc-hoi', 'kem-duong-am']),
      priority: 6,
      rationale:
        'Làm dịu cảm giác châm chích đỏ rát và củng cố lớp màng lipid bảo vệ da khỏi kích ứng môi trường.',
      active: true,
    },
    {
      id: 'R-005',
      concernSlug: 'da-kho',
      minSeverity: 2,
      serviceSlug: 'cap-am-sang-da',
      productSlugs: JSON.stringify(['kem-duong-am']),
      priority: 4,
      rationale: 'Khôi phục độ ẩm cân bằng tự nhiên cho da, giảm hiện tượng khô căng và bong tróc.',
      active: true,
    },
  ];

  for (const r of rules) {
    await prisma.rule.upsert({
      where: { id: r.id },
      update: r,
      create: r,
    });
  }

  // 7. Chống chỉ định
  const contraindications = [
    {
      flag: 'pregnant',
      blocksServiceSlugs: JSON.stringify(['thu-gian-sau']),
      blocksProductSlugs: JSON.stringify(['tinh-dau-thu-gian', 'dau-massage-vai-gay']),
      requiresStaffReview: true,
      message:
        'Khách hàng mang thai cần được kỹ thuật viên chuyên môn tư vấn phác đồ nhẹ nhàng và tránh dùng tinh dầu mạnh.',
    },
    {
      flag: 'allergy-essential-oil',
      blocksServiceSlugs: JSON.stringify([]),
      blocksProductSlugs: JSON.stringify(['tinh-dau-thu-gian', 'dau-massage-vai-gay']),
      requiresStaffReview: true,
      message:
        'Khách hàng có tiền sử dị ứng tinh dầu: Hệ thống đã tự động lọc bỏ các sản phẩm tinh dầu đậm đặc khỏi toa.',
    },
    {
      flag: 'open-wound-skin-infection',
      blocksServiceSlugs: JSON.stringify(['phuc-hoi-da-nhay-cam', 'cap-am-sang-da']),
      blocksProductSlugs: JSON.stringify(['serum-phuc-hoi']),
      requiresStaffReview: true,
      message:
        'Vùng da có vết thương hở hoặc viêm nhiễm: Tạm hoãn can thiệp trực tiếp lên bề mặt da, khuyến nghị thăm khám y khoa.',
    },
  ];

  for (const ci of contraindications) {
    await prisma.contraindication.upsert({
      where: { flag: ci.flag },
      update: ci,
      create: ci,
    });
  }

  // 8. Khuyến mãi & Voucher (Vouchers)
  const vouchers = [
    {
      code: 'MKSPA50',
      name: 'Ưu đãi trải nghiệm đầu tiên',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000,
      minOrderVnd: 500000,
      maxDiscountVnd: 50000,
      usageLimit: 500,
      usedCount: 23,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      active: true,
    },
    {
      code: 'VIPGOLD10',
      name: 'Tri ân khách hàng hạng Vàng',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderVnd: 800000,
      maxDiscountVnd: 300000,
      usageLimit: 200,
      usedCount: 45,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      active: true,
    },
    {
      code: 'XUAN2026',
      name: 'Mùa xuân an lành - Giảm 15%',
      discountType: 'PERCENT',
      discountValue: 15,
      minOrderVnd: 1000000,
      maxDiscountVnd: 500000,
      usageLimit: 100,
      usedCount: 12,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      active: true,
    },
  ];

  for (const v of vouchers) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: v,
      create: v,
    });
  }
  console.log(`✓ Đã tạo ${vouchers.length} mã voucher ưu đãi`);

  // 9. Ca làm việc cho Kỹ thuật viên (Staff Shifts)
  const ktvYen = createdUsers['kythuatvien@spawellness.vn'];
  const ktvHa = createdUsers['ktv2@spawellness.vn'];
  const ktvTuan = createdUsers['ktv3@spawellness.vn'];

  if (ktvYen && ktvHa && ktvTuan) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Xóa ca cũ để tạo mới đồng bộ
    await prisma.staffShift.deleteMany({});

    for (let i = -2; i <= 4; i++) {
      const shiftDate = new Date(today);
      shiftDate.setDate(today.getDate() + i);

      // KTV Lê Hoàng Yến làm ca sáng/cả ngày
      await prisma.staffShift.create({
        data: {
          staffId: ktvYen.id,
          date: shiftDate,
          shiftType: i % 2 === 0 ? 'FULL_DAY' : 'MORNING',
          startTime: i % 2 === 0 ? '08:30' : '08:30',
          endTime: i % 2 === 0 ? '20:00' : '14:30',
          status: 'SCHEDULED',
          notes: 'Phòng VIP 1 & 2',
        },
      });

      // KTV Phạm Thu Hà làm ca chiều
      await prisma.staffShift.create({
        data: {
          staffId: ktvHa.id,
          date: shiftDate,
          shiftType: 'AFTERNOON',
          startTime: '14:00',
          endTime: '20:30',
          status: 'SCHEDULED',
          notes: 'Phòng Massage Thảo Mộc 3',
        },
      });

      // KTV Đỗ Minh Tuấn làm ca sáng
      await prisma.staffShift.create({
        data: {
          staffId: ktvTuan.id,
          date: shiftDate,
          shiftType: 'MORNING',
          startTime: '08:30',
          endTime: '15:00',
          status: 'SCHEDULED',
          notes: 'Trực buồng bấm huyệt chuyên sâu',
        },
      });
    }
    console.log('✓ Đã tạo lịch trực ca tuần cho 3 kỹ thuật viên');

    // 10. Đơn xin nghỉ phép & đổi ca (Leave Requests)
    await prisma.leaveRequest.deleteMany({});
    await prisma.leaveRequest.create({
      data: {
        staffId: ktvYen.id,
        type: 'PERSONAL',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        reason: 'Gia đình có việc hiếu cần xin phép nghỉ 1 ngày',
        status: 'PENDING',
      },
    });

    await prisma.leaveRequest.create({
      data: {
        staffId: ktvTuan.id,
        type: 'SWAP_SHIFT',
        startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        reason: 'Đổi ca sáng sang ca chiều cùng KTV Phạm Thu Hà để đi học chuyên đề',
        swapWithStaffId: ktvHa.id,
        status: 'APPROVED',
        reviewedById: createdUsers['quantri@spawellness.vn']?.id,
        reviewNote: 'Đã xác nhận sự đồng thuận giữa 2 nhân sự.',
      },
    });
    console.log('✓ Đã tạo 2 đơn xin nghỉ phép/đổi ca mẫu');

    // 11. Bảng lương & hoa hồng tháng 11/2026 (Staff Payroll)
    await prisma.staffPayroll.deleteMany({});
    await prisma.staffPayroll.create({
      data: {
        staffId: ktvYen.id,
        month: '2026-11',
        tierLevel: 'SENIOR',
        baseSalaryVnd: 8500000,
        completedSessions: 34,
        sessionAllowanceVnd: 1700000, // 50.000đ * 34
        tipAmountVnd: 850000,
        upsellCommissionVnd: 680000, // 10% doanh số bán chéo
        bonusVnd: 500000,
        totalEarningsVnd: 12230000,
        status: 'DRAFT',
        notes: 'Chỉ tiêu đạt 110%, thái độ phục vụ khách hàng xuất sắc',
      },
    });

    await prisma.staffPayroll.create({
      data: {
        staffId: ktvHa.id,
        month: '2026-11',
        tierLevel: 'MASTER',
        baseSalaryVnd: 11000000,
        completedSessions: 42,
        sessionAllowanceVnd: 2520000, // 60.000đ * 42
        tipAmountVnd: 1400000,
        upsellCommissionVnd: 1250000,
        bonusVnd: 1000000,
        totalEarningsVnd: 17170000,
        status: 'CONFIRMED',
        notes: 'KTV Trưởng cơ sở phụ trách đào tạo',
      },
    });
    console.log('✓ Đã khởi tạo bảng lương & hoa hồng KTV');

    // 12. Phác đồ & Lịch hẹn mẫu cho hôm nay
    const customerUser = createdUsers['khachhang@spawellness.vn'];
    const customer2 = createdUsers['khach2@spawellness.vn'];

    if (customerUser && customer2) {
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId: customerUser.id },
      });
      const profile2 = await prisma.customerProfile.findUnique({
        where: { userId: customer2.id },
      });

      if (customerProfile && profile2) {
        // Xóa appointments và treatment plans cũ của demo để tạo mới mượt mà
        await prisma.appointment.deleteMany({});
        await prisma.treatmentPlan.deleteMany({});

        const plan1 = await prisma.treatmentPlan.create({
          data: {
            customerId: customerProfile.id,
            serviceSlug: 'thu-gian-sau',
            totalSessions: 6,
            state: 'IN_TREATMENT',
          },
        });

        const plan2 = await prisma.treatmentPlan.create({
          data: {
            customerId: profile2.id,
            serviceSlug: 'giai-toa-vai-gay',
            totalSessions: 6,
            state: 'IN_TREATMENT',
          },
        });

        // Tạo lịch hẹn hôm nay cho KTV Yến
        const now = new Date();
        const slot1Start = new Date(now);
        slot1Start.setHours(9, 30, 0, 0);
        const slot1End = new Date(slot1Start.getTime() + 75 * 60 * 1000);

        const slot2Start = new Date(now);
        slot2Start.setHours(14, 0, 0, 0);
        const slot2End = new Date(slot2Start.getTime() + 60 * 60 * 1000);

        const slot3Start = new Date(now);
        slot3Start.setHours(16, 30, 0, 0);
        const slot3End = new Date(slot3Start.getTime() + 75 * 60 * 1000);

        // Lịch 1: Đã hoàn thành (COMPLETED)
        const apt1 = await prisma.appointment.create({
          data: {
            planId: plan1.id,
            therapistId: ktvYen.id,
            startAt: slot1Start,
            endAt: slot1End,
            room: 'Phòng VIP Hoa Sen 01',
            status: 'COMPLETED',
            notes: 'Khách đến đúng giờ, yêu cầu tập trung giảm đau mỏi nửa lưng trên',
          },
        });

        await prisma.sessionLog.create({
          data: {
            appointmentId: apt1.id,
            therapistId: ktvYen.id,
            notes: 'Buổi 2: Vùng cơ vai bớt căng cứng 40%, khách ngủ sâu 30 phút trong buổi làm.',
            progressScores: JSON.stringify({ stress: 4, sleep: 4, muscle: 4, skin: 3 }),
            adjustments: 'Giảm lực nhấn huyệt Phong trì, tăng thời gian xoa bóp vùng thắt lưng',
            nextSessionAdvice: 'Duy trì chườm ngải cứu ấm tại nhà mỗi tối 15 phút',
          },
        });

        // Lịch 2: Đang tiếp nhận / Đang thực hiện (IN_PROGRESS)
        await prisma.appointment.create({
          data: {
            planId: plan2.id,
            therapistId: ktvYen.id,
            startAt: slot2Start,
            endAt: slot2End,
            room: 'Phòng Trị Liệu Thảo Dược 02',
            status: 'IN_PROGRESS',
            notes: 'Khách check-in tại quầy lúc 13:50, KTV đã nhận khách vào phòng',
          },
        });

        // Lịch 3: Sắp tới trong ngày (SCHEDULED)
        await prisma.appointment.create({
          data: {
            planId: plan1.id,
            therapistId: ktvHa.id,
            startAt: slot3Start,
            endAt: slot3End,
            room: 'Phòng Chăm Sóc Da Hoàng Gia',
            status: 'SCHEDULED',
            notes: 'Liệu trình cấp ẩm chuyên sâu cuối tuần',
          },
        });

        // 13. Hóa đơn mẫu (Invoices & Billing)
        await prisma.invoice.deleteMany({});
        const invoice1 = await prisma.invoice.create({
          data: {
            code: 'HD-202611-001',
            customerId: customerProfile.id,
            appointmentId: apt1.id,
            subtotalVnd: 1520000, // 1200000 (Dịch vụ) + 320000 (Tinh dầu bán chéo)
            discountVnd: 120000, // 10% Gold tier
            voucherCode: 'MKSPA50',
            finalVnd: 1350000,
            paidVnd: 1350000,
            debtVnd: 0,
            paymentMethod: 'TRANSFER',
            status: 'PAID',
            upsellTherapistId: ktvYen.id,
            upsellCommissionVnd: 48000, // 15% hoa hồng sản phẩm 320k
            notes: 'Khách thanh toán chuyển khoản quét mã VietQR',
          },
        });

        await prisma.invoiceItem.createMany({
          data: [
            {
              invoiceId: invoice1.id,
              itemType: 'SERVICE',
              itemId: 'thu-gian-sau',
              itemName: 'Liệu trình thư giãn sâu & ngủ ngon (75 phút)',
              quantity: 1,
              unitPriceVnd: 1200000,
              totalPriceVnd: 1200000,
            },
            {
              invoiceId: invoice1.id,
              itemType: 'PRODUCT',
              itemId: 'tinh-dau-thu-gian',
              itemName: 'Tinh dầu thư giãn buổi tối (30ml)',
              quantity: 1,
              unitPriceVnd: 320000,
              totalPriceVnd: 320000,
            },
          ],
        });
        console.log('✓ Đã tạo lịch hẹn và hóa đơn thanh toán mẫu');
      }
    }
  }

  console.log('--- Hoàn tất gieo mầm dữ liệu MK SPA thành công 100%! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
