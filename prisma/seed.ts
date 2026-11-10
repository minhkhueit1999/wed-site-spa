import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu gieo mầm dữ liệu (seed) ---');

  const demoPassword = process.env.DEMO_PASSWORD || 'SpaDemo2026!';
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  // 1. Tài khoản Demo
  const users = [
    {
      email: 'khachhang@spawellness.vn',
      name: 'Nguyễn Minh An',
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
      email: 'quantri@spawellness.vn',
      name: 'Trần Quản Trị',
      role: 'ADMIN',
      passwordHash,
    },
  ];

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

    if (u.role === 'CUSTOMER') {
      await prisma.customerProfile.upsert({
        where: { userId: user.id },
        update: {
          consentAt: new Date(),
        },
        create: {
          userId: user.id,
          safetyFlags: JSON.stringify(['allergy-essential-oil']),
          consentAt: new Date(),
          notes: 'Khách hàng nhạy cảm với tinh dầu hoa cúc.',
        },
      });
    }
  }
  console.log('✓ Đã tạo 3 tài khoản demo: Khách hàng, Kỹ thuật viên, Quản trị viên');

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
      description: 'Sắc diện kém tươi tắn, không đều màu do thức khuya và tiếp xúc ánh sáng xanh.',
      searchKeywords: 'da xỉn màu, da xin mau, sam da, kem sac, tham nam, thieu suc song',
    },
  ];

  for (const c of concerns) {
    await prisma.concern.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`✓ Đã tạo ${concerns.length} triệu chứng`);

  // 3. Dịch vụ (Services)
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

  // 4. Sản phẩm tại nhà (Products - Toa tại nhà)
  const products = [
    {
      slug: 'tinh-dau-thu-gian',
      name: 'Tinh dầu thư giãn buổi tối',
      description: 'Chiết xuất từ hoa oải hương, ngọc lan tây và vỏ cam ngọt hữu cơ chuẩn Organic.',
      usageGuide:
        'Nhỏ 2-3 giọt vào lòng bàn tay xoa ấm và hít thở sâu, hoặc dùng với máy khuếch tán.',
      priceVnd: 320000,
      active: true,
    },
    {
      slug: 'tra-thao-moc-toi',
      name: 'Trà thảo mộc an thần buổi tối',
      description: 'Hỗn hợp hoa cúc la mã, tim sen và táo đỏ sao vàng hạ thổ.',
      usageGuide:
        'Hãm 1 túi lọc cùng 200ml nước sôi 90°C trong 10 phút, uống trước khi ngủ 45 phút.',
      priceVnd: 180000,
      active: true,
    },
    {
      slug: 'dau-massage-vai-gay',
      name: 'Dầu massage ấm vai gáy thảo mộc',
      description: 'Dầu gừng gió ngâm hạt mùi và tinh dầu tràm gió tạo cảm giác ấm sâu.',
      usageGuide:
        'Thoa một lượng vừa đủ lên vùng cổ vai, xoa bóp nhẹ nhàng từ 5-10 phút sau khi tắm.',
      priceVnd: 290000,
      active: true,
    },
    {
      slug: 'mieng-dan-nhiet',
      name: 'Miếng dán thảo dược ấm vai gáy',
      description:
        'Phát nhiệt tự nhiên 40°C duy trì liên tục suốt 6 giờ, chứa ngải cứu và quế chi.',
      usageGuide: 'Dán trực tiếp vào điểm cơ căng mỏi nhất, dùng 1 miếng mỗi ngày khi cần làm dịu.',
      priceVnd: 150000,
      active: true,
    },
    {
      slug: 'serum-phuc-hoi',
      name: 'Serum phục hồi dịu nhẹ B5 & Rau má',
      description:
        'Panthenol 5% tinh khiết kết hợp chiết xuất rau má Centella Asiatica dịu da tức thì.',
      usageGuide: 'Dùng 3-4 giọt thoa đều khắp mặt mỗi sáng và tối sau bước toner cân bằng.',
      priceVnd: 480000,
      active: true,
    },
    {
      slug: 'kem-duong-am',
      name: 'Kem dưỡng ẩm dịu nhẹ không hương liệu',
      description: 'Ceramide NP kết hợp dầu jojoba nguyên chất, không chứa hương liệu và cồn xấu.',
      usageGuide: 'Lấy lượng cỡ hạt đậu thoa nhẹ nhàng để khóa ẩm ở bước dưỡng da cuối cùng.',
      priceVnd: 360000,
      active: true,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`✓ Đã tạo ${products.length} sản phẩm toa tại nhà`);

  // 5. Liên kết Dịch vụ - Sản phẩm (ServiceProduct)
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
  console.log(`✓ Đã tạo ${serviceProducts.length} liên kết Dịch vụ - Sản phẩm`);

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
  console.log(`✓ Đã tạo ${rules.length} luật gợi ý`);

  // 7. Chống chỉ định (Contraindications)
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
    {
      flag: 'fever-acute-illness',
      blocksServiceSlugs: JSON.stringify(['thu-gian-sau', 'giai-toa-vai-gay']),
      blocksProductSlugs: JSON.stringify([]),
      requiresStaffReview: true,
      message:
        'Đang sốt hoặc ốm cấp tính: Khuyến nghị nghỉ ngơi và dời lịch trị liệu sau khi sức khỏe hoàn toàn bình phục.',
    },
    {
      flag: 'recent-surgery',
      blocksServiceSlugs: JSON.stringify(['giai-toa-vai-gay', 'thu-gian-sau']),
      blocksProductSlugs: JSON.stringify(['dau-massage-vai-gay']),
      requiresStaffReview: true,
      message:
        'Phẫu thuật gần đây: Cần nhân viên chuyên môn xác nhận khu vực phẫu thuật trước khi thực hiện thao tác cơ học.',
    },
  ];

  for (const ci of contraindications) {
    await prisma.contraindication.upsert({
      where: { flag: ci.flag },
      update: ci,
      create: ci,
    });
  }
  console.log(`✓ Đã tạo ${contraindications.length} quy tắc chống chỉ định`);

  console.log('--- Hoàn tất gieo mầm dữ liệu thành công! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
