export type ScentFamily = 'thao-moc' | 'go-am' | 'hoa-co' | 'cam-chanh';

export type ProductConcern = 'mat-ngu' | 'cang-thang' | 'moi-vai-gay' | 'thanh-loc-da';

export interface VolumeOption {
  size: string;
  price: number;
}

export interface ScentNotes {
  top: string;
  heart: string;
  base: string;
  description: string;
}

export interface RitualStep {
  step: number;
  title: string;
  instruction: string;
  duration?: string;
}

export interface SaSpaProduct {
  id: string;
  slug: string;
  name: string;
  category: 'tinh-dau' | 'cham-soc-co-the' | 'nen-thom' | 'tra-thao-moc';
  categoryName: string;
  subtitle: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  description: string;
  scentFamily: ScentFamily;
  scentFamilyLabel: string;
  concerns: ProductConcern[];
  concernLabels: string[];
  scentNotes: ScentNotes;
  ritualSteps: RitualStep[];
  volumes: VolumeOption[];
  spaBundleName?: string;
  spaBundleSlug?: string;
  spaBundleDiscount?: string;
  themeColor: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  botanicalElements: string[]; // Tên các phần tử thảo mộc bay quanh: 'lá sả', 'cánh nhài', 'lát cam', 'búp sen'
}

export const SA_SPA_PRODUCTS: SaSpaProduct[] = [
  // --- NHÓM 1: TINH DẦU & KHUẾCH TÁN ---
  {
    id: 'sp-01',
    imageUrl:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    slug: 'tinh-dau-sa-chanh-nguyen-chat',
    name: 'Tinh Dầu Sả Chanh Nguyên Chất',
    category: 'tinh-dau',
    categoryName: 'Tinh Dầu & Khuếch Tán',
    subtitle: 'Chưng cất thủ công từ những tép sả tươi Tây Nam Bộ mọng sương',
    price: 360000,
    originalPrice: 420000,
    rating: 5.0,
    reviewCount: 148,
    badge: 'Signature MK SPA',
    description:
      'Linh hồn của MK SPA — hương thơm tươi mát, giòn ngọt tự nhiên của những nhánh sả tươi kết hợp tinh dầu vỏ chanh rừng. Thanh lọc không khí, khử khuẩn và xua tan mọi mỏi mệt trong tích tắc.',
    scentFamily: 'cam-chanh',
    scentFamilyLabel: 'Cam Chanh & Thảo Mộc',
    concerns: ['cang-thang', 'thanh-loc-da'],
    concernLabels: ['Căng thẳng', 'Thanh lọc không gian'],
    scentNotes: {
      top: 'Vỏ chanh rừng, Tinh chất sả chanh',
      heart: 'Lá chanh Thái, Hoa sả non',
      base: 'Gỗ tuyết tùng, Rễ sả ấm',
      description:
        'Khởi đầu bừng sáng năng lượng, lắng lại êm dịu thanh mát như cơn mưa rào mùa hạ.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Nhỏ tinh dầu',
        instruction: 'Nhỏ 3–5 giọt vào đĩa nước ấm của máy khuếch tán hoặc đá nung mộc.',
      },
      {
        step: 2,
        title: 'Hít thở sâu 4-7-8',
        instruction: 'Nhắm mắt, hít vào 4 giây cảm nhận hương sả chanh lan tỏa trong khoang mũi.',
      },
      {
        step: 3,
        title: 'Thả lỏng toàn thân',
        instruction: 'Để làn hương thanh lọc không gian phòng ngủ hoặc góc thiền trong 45 phút.',
      },
    ],
    volumes: [
      { size: '15ml', price: 220000 },
      { size: '30ml', price: 360000 },
      { size: 'Hộp Quà Tre', price: 490000 },
    ],
    spaBundleName: 'Liệu trình Thanh lọc & Cấp ẩm MK SPA',
    spaBundleSlug: 'cap-am-sang-da',
    spaBundleDiscount: 'Tiết kiệm 15% khi đặt kèm liệu trình',
    themeColor: {
      primary: '#4E6B56',
      secondary: '#E8EFE9',
      accent: '#8DAA72',
      glow: 'rgba(141, 170, 114, 0.35)',
    },
    botanicalElements: ['nhánh sả non', 'vỏ chanh xanh', 'giọt tinh chất'],
  },
  {
    id: 'sp-02',
    imageUrl:
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80',
    slug: 'tinh-dau-hoa-nhai-dem-trang-an',
    name: 'Tinh Dầu Hoa Nhài Đêm Tràng An',
    category: 'tinh-dau',
    categoryName: 'Tinh Dầu & Khuếch Tán',
    subtitle: 'Thu hoạch lúc nửa đêm khi những búp hoa nhài nở rộ thơm ngát nhất',
    price: 450000,
    originalPrice: 520000,
    rating: 4.9,
    reviewCount: 96,
    badge: 'Bán Chạy Nhất',
    description:
      'Hương thơm thanh tao, quý phái của hoa nhài trắng đêm sương. Tác động êm dịu lên hệ thần kinh trung ương, giúp xoa dịu lo âu và đưa tâm trí vào giấc ngủ sâu không mộng mị.',
    scentFamily: 'hoa-co',
    scentFamilyLabel: 'Hương Hoa Thanh Khiết',
    concerns: ['mat-ngu', 'cang-thang'],
    concernLabels: ['Khó ngủ', 'Căng thẳng'],
    scentNotes: {
      top: 'Sương sớm, Cánh hoa nhài trắng',
      heart: 'Hoa nhài hoàng gia, Ngọc lan tây',
      base: 'Xạ hương thực vật, Trà trắng',
      description: 'Dịu dàng như làn gió đêm len qua rèm lụa, vỗ về từng giác quan mệt mỏi.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Xoa ấm lòng bàn tay',
        instruction: 'Nhỏ 2 giọt tinh dầu nhài vào lòng bàn tay rồi xoa nhẹ cho ấm lên.',
      },
      {
        step: 2,
        title: 'Áp lên thái dương',
        instruction: 'Nhẹ nhàng massage hai bên thái dương và sau gáy theo chiều kim đồng hồ.',
      },
      {
        step: 3,
        title: 'Chìm vào giấc ngủ',
        instruction: 'Để hương nhài vỗ về giấc ngủ sâu và thức giấc với làn da tươi tắn.',
      },
    ],
    volumes: [
      { size: '15ml', price: 280000 },
      { size: '30ml', price: 450000 },
      { size: 'Hộp Quà Tre', price: 580000 },
    ],
    spaBundleName: 'Liệu trình Thư Giãn Sâu & Ngủ Ngon',
    spaBundleSlug: 'thu-gian-sau',
    spaBundleDiscount: 'Tiết kiệm 20% khi mua cùng gói trị liệu',
    themeColor: {
      primary: '#3F524A',
      secondary: '#F5F2EB',
      accent: '#D4AF37',
      glow: 'rgba(212, 175, 55, 0.3)',
    },
    botanicalElements: ['cánh nhài trắng', 'búp hoa sương', 'giọt ngọc'],
  },
  {
    id: 'sp-03',
    imageUrl:
      'https://images.unsplash.com/photo-1547793548-710ec861bb6e?auto=format&fit=crop&w=600&q=80',
    slug: 'tinh-dau-go-tram-huong-tinh-tam',
    name: 'Tinh Dầu Gỗ Trầm Hương Tĩnh Tâm',
    category: 'tinh-dau',
    categoryName: 'Tinh Dầu & Khuếch Tán',
    subtitle: 'Nốt trầm linh thiêng từ gỗ kỳ nam quý hiếm Khánh Hòa',
    price: 680000,
    originalPrice: 780000,
    rating: 5.0,
    reviewCount: 64,
    badge: 'Đặc Quyền Thượng Hạng',
    description:
      'Chiều sâu cổ kính của gỗ trầm già hòa quyện nhựa thông ấm áp. Giúp định tâm, kết nối hơi thở và thiết lập không gian thiền định hoặc thư giãn đỉnh cao sau ngày dài áp lực.',
    scentFamily: 'go-am',
    scentFamilyLabel: 'Gỗ Quý & Nhựa Thơm',
    concerns: ['cang-thang', 'mat-ngu'],
    concernLabels: ['Căng thẳng', 'Mất ngủ'],
    scentNotes: {
      top: 'Vỏ quýt khô, Tiêu hồng nhẹ',
      heart: 'Trầm hương Khánh Hòa, Đàn hương Mysore',
      base: 'Nhựa thơm Benzoin, Hổ phách cổ',
      description:
        'Mùi hương của sự tĩnh tại vĩnh cửu, sâu thẳm như vách chùa cổ sau cơn mưa ngâu.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Xông trầm',
        instruction:
          'Nhỏ 2 giọt lên đá nham thạch khuếch tán đặt trên bàn làm việc hoặc góc thiền.',
      },
      {
        step: 2,
        title: 'Điều khí',
        instruction: 'Hít sâu cảm nhận nốt gỗ ấm chạy dọc lồng ngực, giải phóng căng cứng.',
      },
      {
        step: 3,
        title: 'Tĩnh tâm',
        instruction: 'Duy trì trạng thái tập trung cao độ hoặc thư giãn sâu trong 1 giờ.',
      },
    ],
    volumes: [
      { size: '10ml', price: 420000 },
      { size: '20ml', price: 680000 },
      { size: 'Hộp Quà Tre', price: 820000 },
    ],
    spaBundleName: 'Liệu trình Phục Hồi Thần Thể',
    spaBundleSlug: 'thu-gian-sau',
    spaBundleDiscount: 'Tặng kèm 1 đá khuếch tán thủ công',
    themeColor: {
      primary: '#4A3B32',
      secondary: '#EFECE6',
      accent: '#C68B59',
      glow: 'rgba(198, 139, 89, 0.4)',
    },
    botanicalElements: ['vụn gỗ trầm', 'khói hương mờ', 'hạt hổ phách'],
  },
  {
    id: 'sp-04',
    imageUrl:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    slug: 'da-khuech-tan-nham-thach-tram-nui',
    name: 'Đá Khuếch Tán Nham Thạch & Hộp Gỗ Sồi',
    category: 'tinh-dau',
    categoryName: 'Tinh Dầu & Khuếch Tán',
    subtitle: 'Nham thạch bazan tự nhiên vùng cao nguyên Đắk Nông',
    price: 320000,
    originalPrice: 380000,
    rating: 4.8,
    reviewCount: 42,
    badge: 'Mộc Mạc Tự Nhiên',
    description:
      'Các viên đá nham thạch xốp tự nhiên lưu giữ và giải phóng hương tinh dầu từ từ trong 48 giờ mà không cần dùng điện hay nến nhiệt. Bọc trong hộp gỗ tiện mộc sang trọng.',
    scentFamily: 'go-am',
    scentFamilyLabel: 'Đá Núi & Gỗ Mộc',
    concerns: ['cang-thang'],
    concernLabels: ['Thanh lọc', 'Căng thẳng'],
    scentNotes: {
      top: 'Khoáng chất vùng cao',
      heart: 'Đá nham thạch bazan hút tinh dầu',
      base: 'Gỗ sồi sáp ong thủ công',
      description: 'Lưu hương bền bỉ, mộc mạc và an toàn tuyệt đối cho bàn làm việc.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Mở nắp gỗ',
        instruction: 'Mở nắp hộp gỗ để lộ các viên nham thạch đen tuyền nguyên khối.',
      },
      {
        step: 2,
        title: 'Nhỏ tinh dầu',
        instruction: 'Nhỏ 4–6 giọt tinh dầu MK SPA yêu thích trực tiếp lên bề mặt đá nham thạch.',
      },
      {
        step: 3,
        title: 'Tận hưởng',
        instruction: 'Hương thơm tự nhiên sẽ tỏa đều khắp không gian bán kính 15m².',
      },
    ],
    volumes: [
      { size: 'Hộp Gỗ Cơ Bản', price: 320000 },
      { size: 'Combo Kèm Tinh Dầu', price: 590000 },
    ],
    themeColor: {
      primary: '#2B2B2B',
      secondary: '#F2EFEB',
      accent: '#A89F91',
      glow: 'rgba(168, 159, 145, 0.3)',
    },
    botanicalElements: ['đá nham thạch', 'vân gỗ sồi', 'giọt tinh dầu'],
  },

  // --- NHÓM 2: CHĂM SÓC CƠ THỂ & TẮM TRỊ LIỆU ---
  {
    id: 'sp-05',
    imageUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    slug: 'muoi-tam-thao-duoc-tay-bac',
    name: 'Muối Tắm Thảo Dược Cổ Truyền Tây Bắc',
    category: 'cham-soc-co-the',
    categoryName: 'Chăm Sóc Cơ Thể',
    subtitle: 'Muối khoáng biển hầm thảo mộc: Quế chi, Hồi, Gừng gió, Sả cây',
    price: 290000,
    originalPrice: 340000,
    rating: 4.9,
    reviewCount: 182,
    badge: 'Bán Chạy Nhất',
    description:
      'Công thức ngâm tắm cổ truyền của đồng bào vùng cao. Giúp tăng tuần hoàn máu, làm ấm kinh lạc, đẩy lùi hàn khí và xua tan triệt để cảm giác nhức mỏi cơ khớp, vai gáy.',
    scentFamily: 'thao-moc',
    scentFamilyLabel: 'Thảo Mộc Cổ Truyền',
    concerns: ['moi-vai-gay', 'cang-thang'],
    concernLabels: ['Đau mỏi vai gáy', 'Hàn khí'],
    scentNotes: {
      top: 'Gừng gió cay nhẹ, Sả nương',
      heart: 'Quế chi nồng ấm, Hoa hồi Tây Bắc',
      base: 'Muối khoáng mặn mòi, Ngải cứu hoang',
      description: 'Làn hơi nóng thảo mộc bốc lên mở bung từng lỗ chân lông, nhẹ bẫng toàn thân.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Hòa muối',
        instruction: 'Hòa 2 thìa muối vào chậu nước ấm 42°C để ngâm chân hoặc bồn tắm.',
      },
      {
        step: 2,
        title: 'Ngâm thư giãn',
        instruction: 'Ngâm cơ thể hoặc bàn chân trong 15–20 phút cho tới khi toát mồ hôi nhẹ.',
      },
      {
        step: 3,
        title: 'Lau khô và giữ ấm',
        instruction: 'Dùng khăn bông lau khô, uống một tách trà ấm trước khi đi ngủ.',
      },
    ],
    volumes: [
      { size: '350g', price: 290000 },
      { size: '700g Tiết Kiệm', price: 490000 },
      { size: 'Hộp Quà Tre', price: 590000 },
    ],
    spaBundleName: 'Liệu trình Giải Tỏa Cổ Vai Gáy',
    spaBundleSlug: 'giai-toa-vai-gay',
    spaBundleDiscount: 'Được kỹ thuật viên chỉ định sau buổi trị liệu',
    themeColor: {
      primary: '#6B4226',
      secondary: '#F8F4EE',
      accent: '#B85D38',
      glow: 'rgba(184, 93, 56, 0.35)',
    },
    botanicalElements: ['hạt muối khoáng', 'vỏ quế chi', 'nhánh ngải cứu'],
  },
  {
    id: 'sp-06',
    imageUrl:
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    slug: 'dau-massage-gung-nghe-am-toan-than',
    name: 'Dầu Massage Gừng Nghệ Ấm Toàn Thân',
    category: 'cham-soc-co-the',
    categoryName: 'Chăm Sóc Cơ Thể',
    subtitle: 'Nền dầu cám gạo ép lạnh ngâm ủ gừng già và củ nghệ nương',
    price: 390000,
    originalPrice: 460000,
    rating: 5.0,
    reviewCount: 88,
    badge: 'Chuyên Nghiệp Spa',
    description:
      'Dầu massage chuyên dụng tại MK SPA. Độ trượt hoàn hảo không bết dính, thẩm thấu sâu làm ấm các nhóm cơ vai gáy, bắp chân và hỗ trợ phục hồi sau vận động nặng hoặc ngồi lâu.',
    scentFamily: 'thao-moc',
    scentFamilyLabel: 'Gừng Nghệ & Thảo Dược',
    concerns: ['moi-vai-gay'],
    concernLabels: ['Căng cơ vai gáy', 'Tuần hoàn máu'],
    scentNotes: {
      top: 'Vỏ bưởi đào, Tinh dầu tiêu đen',
      heart: 'Gừng già nướng ấm, Nghệ vàng nương',
      base: 'Dầu cám gạo, Dầu hạnh nhân ngọt',
      description: 'Cảm giác ấm ran dịu dàng chạy dọc sống lưng, xua tan mọi điểm nút căng cơ.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Làm ấm dầu',
        instruction: 'Lấy một lượng vừa đủ ra lòng bàn tay xoa mạnh tạo độ ấm tự nhiên.',
      },
      {
        step: 2,
        title: 'Massage miết cơ',
        instruction: 'Miết nhẹ dọc cơ dựng sống và vùng bả vai từ dưới lên trên trong 10 phút.',
      },
      {
        step: 3,
        title: 'Ủ ấm',
        instruction: 'Dùng khăn ấm chườm nhẹ để dưỡng chất thẩm thấu tối đa vào da.',
      },
    ],
    volumes: [
      { size: '100ml', price: 390000 },
      { size: '250ml Spa Size', price: 690000 },
    ],
    spaBundleName: 'Liệu trình Giải Tỏa Cổ Vai Gáy',
    spaBundleSlug: 'giai-toa-vai-gay',
    spaBundleDiscount: 'Tặng kèm 1 buổi hướng dẫn tự massage tại nhà',
    themeColor: {
      primary: '#8A5D2E',
      secondary: '#FDF8F0',
      accent: '#D4AF37',
      glow: 'rgba(212, 175, 55, 0.35)',
    },
    botanicalElements: ['lát gừng vàng', 'hoa nghệ tươi', 'giọt dầu vàng óng'],
  },
  {
    id: 'sp-07',
    imageUrl:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    slug: 'tay-da-chet-ca-phe-dak-lak-dua-ben-tre',
    name: 'Tẩy Da Chết Cà Phê Đắk Lắk & Dừa Bến Tre',
    category: 'cham-soc-co-the',
    categoryName: 'Chăm Sóc Cơ Thể',
    subtitle: 'Hạt cà phê Robusta xay mịn ngâm trong bơ hạt mỡ và dầu dừa nguyên chất',
    price: 260000,
    originalPrice: 310000,
    rating: 4.9,
    reviewCount: 215,
    badge: 'Mềm Mịn Tức Thì',
    description:
      'Lấy đi lớp sừng thô ráp một cách êm ái, trả lại làn da cơ thể mướt mịn như lụa. Mùi thơm ngọt đậm đà của cà phê rang xay cùng vị béo ngậy của dừa nướng.',
    scentFamily: 'go-am',
    scentFamilyLabel: 'Cà Phê & Cơm Dừa',
    concerns: ['thanh-loc-da'],
    concernLabels: ['Tẩy da chết', 'Mềm mịn da'],
    scentNotes: {
      top: 'Cà phê Robusta mộc xay mới',
      heart: 'Cơm dừa sấy béo ngậy, Đường nâu',
      base: 'Bơ hạt mỡ Phi, Dầu dừa ép lạnh',
      description: 'Hương thơm ngọt ngào đánh thức mọi giác quan trong lúc tắm.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Làm ướt da',
        instruction: 'Tắm sơ với nước ấm để làm mềm biểu bì da toàn thân.',
      },
      {
        step: 2,
        title: 'Massage xoay tròn',
        instruction: 'Thoa đều hỗn hợp lên vùng da sần sùi (khuỷu tay, đầu gối, gót chân).',
      },
      {
        step: 3,
        title: 'Xả sạch',
        instruction: 'Xả sạch với nước ấm, lớp dầu dừa mỏng sẽ giữ ẩm suốt cả ngày.',
      },
    ],
    volumes: [
      { size: '200g Hũ Nhôm', price: 260000 },
      { size: '400g Hũ Thủy Tinh', price: 420000 },
    ],
    themeColor: {
      primary: '#3D2817',
      secondary: '#F5ECE3',
      accent: '#8B5A2B',
      glow: 'rgba(139, 90, 43, 0.35)',
    },
    botanicalElements: ['hạt cà phê', 'vụn dừa khô', 'bơ hạt mỡ'],
  },
  {
    id: 'sp-08',
    imageUrl:
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    slug: 'xa-bong-thao-moc-sa-chanh-mat-ong',
    name: 'Xà Bông Thảo Mộc Sả Chanh & Mật Ong Rừng',
    category: 'cham-soc-co-the',
    categoryName: 'Chăm Sóc Cơ Thể',
    subtitle: 'Bánh xà bông thủ công làm nguội (Cold-Process) ủ 6 tuần',
    price: 150000,
    originalPrice: 180000,
    rating: 4.8,
    reviewCount: 112,
    badge: 'Thủ Công Thuần Chay',
    description:
      'Tạo bọt mịn như kem từ dầu dừa và mật ong rừng nguyên chất. Chứa vụn lá sả chanh phơi khô giúp tẩy nhẹ da chết hàng ngày và lưu hương sả tự nhiên sảng khoái.',
    scentFamily: 'cam-chanh',
    scentFamilyLabel: 'Sả Chanh & Mật Ong',
    concerns: ['thanh-loc-da'],
    concernLabels: ['Làm sạch', 'Kháng khuẩn'],
    scentNotes: {
      top: 'Tinh dầu sả chanh tươi',
      heart: 'Mật ong hoa rừng, Sữa gạo',
      base: 'Dầu cọ bền vững, Dầu dừa',
      description: 'Làm sạch sâu mà không hề khô rít, nâng niu hàng rào độ ẩm tự nhiên.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Tạo bọt bông',
        instruction: 'Xoa bánh xà bông cùng túi lưới tạo bọt với một ít nước ấm.',
      },
      {
        step: 2,
        title: 'Tắm thư giãn',
        instruction: 'Xoa bọt mịn đều khắp người, hít hà mùi hương sả tươi sảng khoái.',
      },
      {
        step: 3,
        title: 'Đặt ráo nước',
        instruction: 'Đặt bánh xà bông lên khay gỗ tre để ráo nước giúp dùng được lâu hơn.',
      },
    ],
    volumes: [
      { size: '1 bánh 120g', price: 150000 },
      { size: 'Hộp 3 bánh', price: 390000 },
    ],
    themeColor: {
      primary: '#5C6E38',
      secondary: '#F8F9F2',
      accent: '#C79C3E',
      glow: 'rgba(199, 156, 62, 0.3)',
    },
    botanicalElements: ['bánh xà bông mộc', 'nhánh sả khô', 'giọt mật ong'],
  },

  // --- NHÓM 3: NẾN THƠM & KHÔNG GIAN ---
  {
    id: 'sp-09',
    imageUrl:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
    slug: 'nen-thom-khoi-tra-xanh-hoa-buoi',
    name: 'Nến Thơm Khói Trà Xanh & Hoa Bưởi',
    category: 'nen-thom',
    categoryName: 'Nến Thơm & Không Gian',
    subtitle: 'Sáp đậu nành tự nhiên phối bấc gỗ nổ lách tách như củi mùa đông',
    price: 480000,
    originalPrice: 560000,
    rating: 4.9,
    reviewCount: 79,
    badge: 'Mới Ra Mắt',
    description:
      'Tái hiện không gian buổi sớm tại MK SPA: khói trà xanh Thái Nguyên bảng lảng hòa cùng mùi hoa bưởi tháng Ba trắng muốt. Bấc gỗ kêu lách tách êm tai đưa tâm trí về trạng thái cân bằng tuyệt đối.',
    scentFamily: 'hoa-co',
    scentFamilyLabel: 'Trà Xanh & Hoa Trắng',
    concerns: ['cang-thang', 'mat-ngu'],
    concernLabels: ['Thư giãn', 'Giảm stress'],
    scentNotes: {
      top: 'Búp trà xanh non, Cánh hoa bưởi',
      heart: 'Hoa sen trắng, Lá tre mướt',
      base: 'Gỗ tuyết tùng, Xạ hương mờ',
      description: 'Thanh sạch, an yên như ngồi thưởng trà dưới mái hiên chùa cổ rợp bóng tre.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Cắt bấc',
        instruction: 'Cắt bấc gỗ còn 5mm trước khi thắp để ngọn lửa cháy đều và sạch.',
      },
      {
        step: 2,
        title: 'Thắp nến',
        instruction: 'Thắp nến liên tục từ 1.5 – 2 giờ để mặt sáp tan chảy hoàn toàn tới mép hũ.',
      },
      {
        step: 3,
        title: 'Thưởng hương',
        instruction: 'Lắng nghe tiếng bấc nổ lách tách êm dịu và nhâm nhi tách trà thảo mộc.',
      },
    ],
    volumes: [
      { size: '200g (45h đốt)', price: 480000 },
      { size: 'Hộp Quà Tre & Bật Lửa Gỗ', price: 620000 },
    ],
    themeColor: {
      primary: '#3F5943',
      secondary: '#F2F6F3',
      accent: '#9BB898',
      glow: 'rgba(155, 184, 152, 0.35)',
    },
    botanicalElements: ['búp trà xanh', 'hoa bưởi trắng', 'ngọn lửa ấm'],
  },
  {
    id: 'sp-10',
    imageUrl:
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=600&q=80',
    slug: 'nen-thom-bac-go-tuyet-tung-nhua-thong',
    name: 'Nến Thơm Bấc Gỗ Tuyết Tùng & Nhựa Thông',
    category: 'nen-thom',
    categoryName: 'Nến Thơm & Không Gian',
    subtitle: 'Ấm cúng, trầm lắng như căn nhà gỗ giữa rừng thông Đà Lạt',
    price: 490000,
    originalPrice: 580000,
    rating: 5.0,
    reviewCount: 63,
    badge: 'Được Yêu Thích',
    description:
      'Hương gỗ tuyết tùng già kết hợp nhựa thông ấm áp và một chút gia vị nhục đậu khấu. Phù hợp thắp vào những buổi tối se lạnh để sưởi ấm tâm hồn và tạo cảm giác che chở bình yên.',
    scentFamily: 'go-am',
    scentFamilyLabel: 'Gỗ Tuyết Tùng & Rừng Già',
    concerns: ['cang-thang', 'mat-ngu'],
    concernLabels: ['Giấc ngủ ngon', 'Sưởi ấm'],
    scentNotes: {
      top: 'Nhục đậu khấu, Vỏ thông tươi',
      heart: 'Tuyết tùng Atlas, Hoắc hương',
      base: 'Nhựa hổ phách, Rêu sồi ẩm',
      description: 'Vòng ôm ấm áp của rừng già chở che cho giấc ngủ an lành.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Đặt nơi an toàn',
        instruction: 'Đặt hũ nến trên bề mặt chịu nhiệt, tránh luồng gió mạnh.',
      },
      {
        step: 2,
        title: 'Thắp trước ngủ',
        instruction: 'Thắp trước khi ngủ 1 giờ để hương gỗ ấm lan tỏa khắp căn phòng.',
      },
      {
        step: 3,
        title: 'Tắt nến',
        instruction: 'Đậy nắp gỗ lại để dập tắt ngọn lửa mà không tạo khói đen.',
      },
    ],
    volumes: [
      { size: '200g (45h đốt)', price: 490000 },
      { size: 'Hộp Quà Tre Kèm Chuông Tắt Nến', price: 650000 },
    ],
    themeColor: {
      primary: '#523A28',
      secondary: '#FBF6F0',
      accent: '#C68B59',
      glow: 'rgba(198, 139, 89, 0.35)',
    },
    botanicalElements: ['nhánh lá thông', 'quả thông khô', 'vệt sáng ấm'],
  },
  {
    id: 'sp-11',
    imageUrl:
      'https://images.unsplash.com/photo-1572726729437-373264639912?auto=format&fit=crop&w=600&q=80',
    slug: 'nen-thom-sa-diu-cam-ngot-hoang-cung',
    name: 'Nến Thơm Sả Dịu & Cam Ngọt Hoàng Cung',
    category: 'nen-thom',
    categoryName: 'Nến Thơm & Không Gian',
    subtitle: 'Năng lượng tươi vui, xua tan uể oải và ẩm mốc trong không gian',
    price: 460000,
    originalPrice: 530000,
    rating: 4.8,
    reviewCount: 54,
    badge: 'Năng Lượng Sảng Khoái',
    description:
      'Sự hòa quyện rực rỡ giữa sả chanh thanh khiết và cam ngọt xứ Huế. Thắp sáng góc làm việc hoặc phòng khách để khơi nguồn cảm hứng sáng tạo và xua tan căng thẳng mệt nhọc.',
    scentFamily: 'cam-chanh',
    scentFamilyLabel: 'Cam Ngọt & Sả Tươi',
    concerns: ['cang-thang', 'thanh-loc-da'],
    concernLabels: ['Năng lượng', 'Thanh lọc'],
    scentNotes: {
      top: 'Cam vàng xứ Huế, Tép bưởi hồng',
      heart: 'Lá sả chanh, Gừng non cay dịu',
      base: 'Xạ hương trắng, Vani Madagascar',
      description: 'Tràn đầy nhựa sống như một buổi sớm mai chan hòa ánh nắng.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Thắp sáng ban mai',
        instruction: 'Thắp nến vào buổi sáng khi bắt đầu làm việc để đánh thức năng lượng.',
      },
      {
        step: 2,
        title: 'Tập trung sáng tạo',
        instruction: 'Mùi hương cam chanh giúp kích thích các nơ-ron tập trung cao độ.',
      },
      {
        step: 3,
        title: 'Đậy nắp bảo quản',
        instruction: 'Dùng nắp gỗ đậy kín sau khi sử dụng để giữ trọn vẹn tinh dầu.',
      },
    ],
    volumes: [
      { size: '200g (45h đốt)', price: 460000 },
      { size: 'Hộp Quà Tre', price: 590000 },
    ],
    themeColor: {
      primary: '#945828',
      secondary: '#FEF8F0',
      accent: '#E59B3C',
      glow: 'rgba(229, 155, 60, 0.35)',
    },
    botanicalElements: ['lát cam sấy', 'lá sả mảnh', 'ánh nắng vàng'],
  },
  {
    id: 'sp-12',
    imageUrl:
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=600&q=80',
    slug: 'binh-xit-goi-ngu-thao-moc-an-mien',
    name: 'Bình Xịt Gối Ngủ Thảo Mộc An Miên',
    category: 'nen-thom',
    categoryName: 'Nến Thơm & Không Gian',
    subtitle: 'Nước cất oải hương, cúc La Mã và tinh dầu nhài đêm dịu nhẹ',
    price: 320000,
    originalPrice: 380000,
    rating: 4.9,
    reviewCount: 167,
    badge: 'Liệu Pháp Giấc Ngủ',
    description:
      'Xịt nhẹ lên vỏ gối và chăn ga 10 phút trước khi nằm. Các phân tử hương hoa tự nhiên bao bọc vùng đầu cổ, giúp nhịp tim chậm lại, giảm trằn trọc và đưa bạn vào giấc ngủ êm đềm.',
    scentFamily: 'hoa-co',
    scentFamilyLabel: 'Oải Hương & Cúc La Mã',
    concerns: ['mat-ngu', 'cang-thang'],
    concernLabels: ['Mất ngủ', 'Dễ vào giấc'],
    scentNotes: {
      top: 'Sương hoa oải hương',
      heart: 'Cúc La Mã Tây Ban Nha, Hoa nhài',
      base: 'Gỗ đàn hương êm dịu',
      description: 'Lớp màng bảo vệ êm ái cho giấc ngủ không gián đoạn suốt đêm dài.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Lắc đều chai',
        instruction: 'Lắc nhẹ để tinh dầu hòa tan đều trong nước cất thảo mộc.',
      },
      {
        step: 2,
        title: 'Xịt gối chăn',
        instruction: 'Xịt 2–3 nhát cách bề mặt gối chăn khoảng 20cm trước khi ngủ 15 phút.',
      },
      {
        step: 3,
        title: 'Thả lỏng',
        instruction: 'Đặt đầu lên gối, hít sâu 3 nhịp và cảm nhận sự êm dịu vỗ về.',
      },
    ],
    volumes: [
      { size: '100ml', price: 320000 },
      { size: 'Combo 2 chai', price: 580000 },
    ],
    themeColor: {
      primary: '#473B54',
      secondary: '#F6F3F9',
      accent: '#9A82B0',
      glow: 'rgba(154, 130, 176, 0.35)',
    },
    botanicalElements: ['bông oải hương', 'cánh cúc la mã', 'sương đêm'],
  },

  // --- NHÓM 4: TRÀ THẢO MỘC DƯỠNG TÂM ---
  {
    id: 'sp-13',
    imageUrl:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    slug: 'tra-tam-sen-ky-tu-hoang-gia',
    name: 'Trà Tâm Sen Kỷ Tử Hoàng Gia',
    category: 'tra-thao-moc',
    categoryName: 'Trà Thảo Mộc Dưỡng Tâm',
    subtitle: 'Tâm sen hồ Tây chọn lọc sao vàng khử hàn phối kỷ tử đỏ Ninh Hạ',
    price: 240000,
    originalPrice: 280000,
    rating: 4.9,
    reviewCount: 94,
    badge: 'An Thần Ngủ Sâu',
    description:
      'Thức uống dưỡng tâm trứ danh của hoàng cung xưa. Vị đắng nhẹ thanh tao của tâm sen chuyển dần sang ngọt hậu ấm áp của kỷ tử và táo đỏ, giúp hạ hỏa, tĩnh thần và dễ ngủ.',
    scentFamily: 'thao-moc',
    scentFamilyLabel: 'Tâm Sen & Trái Ngọt',
    concerns: ['mat-ngu', 'cang-thang'],
    concernLabels: ['Khó ngủ', 'Hồi hộp'],
    scentNotes: {
      top: 'Hương sen thanh khiết',
      heart: 'Tâm sen sao vàng, Kỷ tử ngọt dịu',
      base: 'Táo đỏ Tân Cương, Long nhãn',
      description: 'Hớp một ngụm trà ấm thấy tâm tư nhẹ bẫng như mây trời.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Tráng ấm chén',
        instruction: 'Dùng nước sôi 95°C tráng qua ấm chén để giữ nhiệt tối ưu.',
      },
      {
        step: 2,
        title: 'Hãm trà',
        instruction: 'Cho 1 túi lọc vào ấm cùng 250ml nước sôi, đậy nắp hãm trong 7 phút.',
      },
      {
        step: 3,
        title: 'Thưởng trà',
        instruction: 'Uống từng ngụm nhỏ lúc còn ấm nóng trước giờ đi ngủ 45 phút.',
      },
    ],
    volumes: [
      { size: 'Hộp 20 túi lọc', price: 240000 },
      { size: 'Hộp Tre Sơn Mài Sang Trọng', price: 380000 },
    ],
    themeColor: {
      primary: '#613E2E',
      secondary: '#FDF7F2',
      accent: '#C75D38',
      glow: 'rgba(199, 93, 56, 0.35)',
    },
    botanicalElements: ['tâm sen xanh', 'hạt kỷ tử đỏ', 'lát táo đỏ'],
  },
  {
    id: 'sp-14',
    imageUrl:
      'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80',
    slug: 'tra-sa-gung-mat-ong-rung-phuc-hoi',
    name: 'Trà Sả Gừng Mật Ong Rừng Phục Hồi',
    category: 'tra-thao-moc',
    categoryName: 'Trà Thảo Mộc Dưỡng Tâm',
    subtitle: 'Sả chanh sấy lạnh giữ nguyên tinh chất cùng gừng sẻ cay nồng',
    price: 220000,
    originalPrice: 260000,
    rating: 5.0,
    reviewCount: 138,
    badge: 'Ấm Bụng Trợ Khí',
    description:
      'Ly trà chào đón thân quen khi bạn bước chân vào MK SPA. Hương sả thơm ngào ngạt quyện gừng già cay tê làm ấm tỳ vị, đánh tan mỏi mệt và tăng cường sức đề kháng tức thì.',
    scentFamily: 'cam-chanh',
    scentFamilyLabel: 'Sả Gừng & Mật Rừng',
    concerns: ['cang-thang', 'moi-vai-gay'],
    concernLabels: ['Giữ ấm', 'Phục hồi năng lượng'],
    scentNotes: {
      top: 'Sả nương thơm nồng, Vỏ quýt',
      heart: 'Gừng sẻ cay ấm, Hoa hồi nhẹ',
      base: 'Mật ong rừng tự nhiên',
      description: 'Ấm áp từ cổ họng lan tỏa xuống dạ dày, hồi phục sinh lực tức thì.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Cho túi trà',
        instruction: 'Đặt 1 túi trà vào cốc thủy tinh hoặc ấm trà yêu thích.',
      },
      {
        step: 2,
        title: 'Châm nước sôi',
        instruction: 'Rót 200ml nước sôi 90°C và chờ 5 phút cho tinh chất sả gừng thôi ra.',
      },
      {
        step: 3,
        title: 'Khuấy mật ong',
        instruction: 'Thêm nửa thìa mật ong rừng đi kèm, khuấy đều và thưởng thức.',
      },
    ],
    volumes: [
      { size: 'Hộp 20 túi lọc', price: 220000 },
      { size: 'Combo Hộp Tre Kèm Mật Ong', price: 350000 },
    ],
    themeColor: {
      primary: '#755428',
      secondary: '#FAF5EE',
      accent: '#D4AF37',
      glow: 'rgba(212, 175, 55, 0.35)',
    },
    botanicalElements: ['lát gừng sẻ', 'ống sả khô', 'giọt mật vàng'],
  },
  {
    id: 'sp-15',
    imageUrl:
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
    slug: 'tra-hoa-cuc-tien-vua-tao-do',
    name: 'Trà Hoa Cúc Tiến Vua & Táo Đỏ',
    category: 'tra-thao-moc',
    categoryName: 'Trà Thảo Mộc Dưỡng Tâm',
    subtitle: 'Bông cúc chi Hưng Yên sấy thăng hoa nguyên vẹn sắc vàng óng',
    price: 250000,
    originalPrice: 290000,
    rating: 4.8,
    reviewCount: 76,
    badge: 'Mát Gan Sáng Mắt',
    description:
      'Hương hoa cúc chi ngọt thanh tao khi nở trong nước ấm. Chứa nhiều chất chống oxy hóa giúp hạ nhiệt, làm dịu đôi mắt mệt mỏi vì màn hình máy tính và hỗ trợ da dẻ hồng hào.',
    scentFamily: 'hoa-co',
    scentFamilyLabel: 'Hoa Cúc Chi & Thảo Dược',
    concerns: ['cang-thang', 'thanh-loc-da'],
    concernLabels: ['Sáng mắt', 'Mát gan thanh nhiệt'],
    scentNotes: {
      top: 'Cánh hoa cúc vàng rực rỡ',
      heart: 'Táo đỏ bùi ngọt, Cam thảo Bắc',
      base: 'Hương cỏ cây sấy mộc',
      description: 'Nhẹ nhàng và thanh mát như làn gió thu rải vàng trên cánh đồng.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Thả hoa vào bình',
        instruction: 'Thả 5–7 bông cúc chi cùng 2 lát táo đỏ vào bình thủy tinh.',
      },
      {
        step: 2,
        title: 'Ngắm hoa nở',
        instruction: 'Rót nước sôi 85°C và chiêm ngưỡng những cánh cúc bung xòe vàng rực.',
      },
      {
        step: 3,
        title: 'Thưởng thức',
        instruction: 'Uống vào buổi chiều để giải tỏa mệt mỏi cho đôi mắt và trí não.',
      },
    ],
    volumes: [
      { size: 'Hũ Thủy Tinh 80g', price: 250000 },
      { size: 'Hộp Quà Tre', price: 390000 },
    ],
    themeColor: {
      primary: '#5E5429',
      secondary: '#FCF9EE',
      accent: '#E0B538',
      glow: 'rgba(224, 181, 56, 0.35)',
    },
    botanicalElements: ['bông cúc chi', 'lát táo đỏ', 'nụ hoa vàng'],
  },
  {
    id: 'sp-16',
    imageUrl:
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
    slug: 'tra-bac-ha-xa-huong-thanh-loc',
    name: 'Trà Bạc Hà Xạ Hương Thanh Lọc Khí Huyết',
    category: 'tra-thao-moc',
    categoryName: 'Trà Thảo Mộc Dưỡng Tâm',
    subtitle: 'Lá bạc hà Âu cay the kết hợp cỏ xạ hương hữu cơ cao nguyên',
    price: 210000,
    originalPrice: 250000,
    rating: 4.9,
    reviewCount: 52,
    badge: 'Tươi Mới Sảng Khoái',
    description:
      'Cảm giác the mát sảng khoái kích hoạt luồng sinh khí mới trong cơ thể. Hỗ trợ tiêu hóa nhẹ bụng, thông thoáng đường thở và xua tan cơn buồn ngủ uể oải giờ trưa.',
    scentFamily: 'thao-moc',
    scentFamilyLabel: 'Bạc Hà The Mát',
    concerns: ['cang-thang', 'thanh-loc-da'],
    concernLabels: ['The mát', 'Tiêu hóa nhẹ nhàng'],
    scentNotes: {
      top: 'Lá bạc hà the buốt',
      heart: 'Cỏ xạ hương ấm nồng, Chanh sấy',
      base: 'Trà ô long thanh',
      description: 'Cơn lốc mát rượi khai thông đường thở và tỉnh táo trí tuệ.',
    },
    ritualSteps: [
      {
        step: 1,
        title: 'Cho túi trà',
        instruction: 'Thả túi trà vào ly cùng vài lát chanh tươi nếu thích.',
      },
      {
        step: 2,
        title: 'Hãm trà lạnh hoặc nóng',
        instruction: 'Có thể hãm nước sôi 5 phút hoặc ủ lạnh (Cold Brew) trong tủ mát 4 giờ.',
      },
      {
        step: 3,
        title: 'Uống sảng khoái',
        instruction: 'Uống sau bữa ăn hoặc giữa giờ làm việc để nạp lại năng lượng.',
      },
    ],
    volumes: [
      { size: 'Hộp 20 túi lọc', price: 210000 },
      { size: 'Hộp Tre Quà Tặng', price: 340000 },
    ],
    themeColor: {
      primary: '#2B5E49',
      secondary: '#F0F8F4',
      accent: '#59B890',
      glow: 'rgba(89, 184, 144, 0.35)',
    },
    botanicalElements: ['lá bạc hà xanh', 'nhánh cỏ xạ hương', 'giọt nước mát'],
  },
];

export type MkSpaProduct = SaSpaProduct;
export const MK_SPA_PRODUCTS = SA_SPA_PRODUCTS;
