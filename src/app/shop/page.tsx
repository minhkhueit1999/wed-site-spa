'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { SA_SPA_PRODUCTS, SaSpaProduct, ScentFamily, ProductConcern } from '@/data/saSpaProducts';
import { LivingProductCard } from '@/components/ecommerce/LivingProductCard';
import { ProductQuickViewModal } from '@/components/ecommerce/ProductQuickViewModal';
import { useCartStore } from '@/infrastructure/store/useCartStore';

export default function ShopPage() {
  const favoriteScent = useCartStore((state) => state.favoriteScent);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedConcern, setSelectedConcern] = useState<string>('all');
  const [selectedScentFamily, setSelectedScentFamily] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>(
    'featured',
  );

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<SaSpaProduct | null>(null);

  // Danh sách đã lọc và sắp xếp
  const filteredProducts = useMemo(() => {
    return SA_SPA_PRODUCTS.filter((product) => {
      // 1. Lọc theo danh mục
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // 2. Lọc theo triệu chứng
      if (
        selectedConcern !== 'all' &&
        !product.concerns.includes(selectedConcern as ProductConcern)
      ) {
        return false;
      }
      // 3. Lọc theo tông mùi
      if (
        selectedScentFamily !== 'all' &&
        product.scentFamily !== (selectedScentFamily as ScentFamily)
      ) {
        return false;
      }
      // 4. Lọc theo khoảng giá
      if (priceRange === 'under-300' && product.price >= 300000) return false;
      if (priceRange === '300-500' && (product.price < 300000 || product.price > 500000))
        return false;
      if (priceRange === 'above-500' && product.price <= 500000) return false;

      // 5. Tìm kiếm tức thì (Sensory Search)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchSubtitle = product.subtitle.toLowerCase().includes(query);
        const matchNotes =
          product.scentNotes.top.toLowerCase().includes(query) ||
          product.scentNotes.heart.toLowerCase().includes(query) ||
          product.scentNotes.base.toLowerCase().includes(query);
        const matchConcern = product.concernLabels.some((c) => c.toLowerCase().includes(query));
        if (!matchName && !matchSubtitle && !matchNotes && !matchConcern) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewCount - a.reviewCount; // Featured
    });
  }, [selectedCategory, selectedConcern, selectedScentFamily, priceRange, searchQuery, sortBy]);

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-[#FAF7F2] pb-24 text-[#2B2622]">
        {/* Hero Banner MK SPA E-commerce */}
        <section className="relative overflow-hidden border-b border-[#E2D9CC] bg-gradient-to-b from-[#1F2B24] to-[#141C17] px-6 py-16 text-center text-[#FAF7F2]">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.4), transparent 70%)',
            }}
          />
          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 py-1 text-xs font-medium tracking-widest text-[#D4AF37] uppercase">
              <span>🌿</span> Bộ Sưu Tập Thảo Mộc Đông Dương <span>🌿</span>
            </span>
            <h1 className="mt-4 font-serif text-3xl font-light tracking-wide text-[#FAF7F2] sm:text-5xl">
              Cửa Hàng MK SPA Sanctuary
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#FAF7F2]/80">
              Mỗi sản phẩm là một tuyệt tác thủ công lưu giữ sinh khí đất trời. Tinh dầu chưng cất
              sả chanh, muối tắm ngải cứu cổ truyền, nến bấc gỗ tuyết tùng và trà tâm sen dưỡng an.
            </p>

            {/* Thông báo nốt hương cá nhân nếu có */}
            {favoriteScent && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#1F2B24]/90 px-4 py-1.5 text-xs text-[#D4AF37]">
                <span>✨ Đang ưu tiên nốt hương của bạn:</span>
                <strong className="text-[#FAF7F2] capitalize">
                  {favoriteScent.replace('-', ' ')}
                </strong>
              </div>
            )}
          </div>
        </section>

        {/* Thanh Tìm Kiếm Tức Thì & Bộ Lọc Nhanh */}
        <div className="sticky top-[69px] z-30 border-b border-[#E2D9CC] bg-[#FAF7F2]/95 px-4 py-4 shadow-xs backdrop-blur-md sm:px-6">
          <div className="mx-auto max-w-6xl space-y-3">
            {/* Hàng 1: Ô tìm kiếm & Sắp xếp */}
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              {/* Instant Sensory Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm, nốt hương (sả chanh, nhài, trầm) hoặc triệu chứng..."
                  className="w-full rounded-full border border-[#D4AF37]/40 bg-white py-2.5 pr-4 pl-10 text-xs text-[#2B2622] placeholder-[#8C827A] shadow-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-[#8C827A]">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#2B2622]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sắp xếp & Đếm số lượng */}
              <div className="flex w-full items-center justify-between gap-3 text-xs text-[#635B54] sm:w-auto sm:justify-end">
                <span>
                  Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-xl border border-[#E2D9CC] bg-white px-3 py-2 text-xs text-[#2B2622] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="featured">Nổi bật nhất MK SPA</option>
                  <option value="rating">Đánh giá cao nhất (★)</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Hàng 2: Bộ lọc Danh Mục Tab */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: 'all', label: 'Tất Cả Sản Phẩm' },
                { id: 'tinh-dau', label: '🏺 Tinh Dầu & Khuếch Tán' },
                { id: 'cham-soc-co-the', label: '🌿 Chăm Sóc Cơ Thể' },
                { id: 'nen-thom', label: '🕯️ Nến Thơm & Không Gian' },
                { id: 'tra-thao-moc', label: '🫖 Trà Dưỡng Tâm' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C68B59] font-semibold text-[#141C17] shadow-xs'
                      : 'border border-[#E2D9CC] bg-white/80 text-[#635B54] hover:border-[#D4AF37]/50 hover:text-[#1F2B24]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Hàng 3: Bộ lọc đa chiều (Triệu chứng, Tông mùi, Khoảng giá) */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              {/* Theo Nhu cầu / Triệu chứng */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#8C827A]">Nhu cầu:</span>
                <select
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                  className="rounded-lg border border-[#E2D9CC] bg-white px-2 py-1 text-xs text-[#2B2622]"
                >
                  <option value="all">Tất cả nhu cầu</option>
                  <option value="mat-ngu">Mất ngủ, khó vào giấc</option>
                  <option value="cang-thang">Căng thẳng, giảm stress</option>
                  <option value="moi-vai-gay">Đau mỏi cơ vai gáy</option>
                  <option value="thanh-loc-da">Thanh lọc da & không gian</option>
                </select>
              </div>

              {/* Theo Tông Mùi */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#8C827A]">Tông mùi:</span>
                <select
                  value={selectedScentFamily}
                  onChange={(e) => setSelectedScentFamily(e.target.value)}
                  className="rounded-lg border border-[#E2D9CC] bg-white px-2 py-1 text-xs text-[#2B2622]"
                >
                  <option value="all">Tất cả tông mùi</option>
                  <option value="cam-chanh">Cam Chanh & Sả Tươi</option>
                  <option value="hoa-co">Hoa Cỏ Thanh Khiết</option>
                  <option value="go-am">Gỗ Trầm & Nhựa Thông</option>
                  <option value="thao-moc">Thảo Mộc Cổ Truyền</option>
                </select>
              </div>

              {/* Theo Khoảng Giá */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#8C827A]">Mức giá:</span>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="rounded-lg border border-[#E2D9CC] bg-white px-2 py-1 text-xs text-[#2B2622]"
                >
                  <option value="all">Tất cả mức giá</option>
                  <option value="under-300">Dưới 300.000₫</option>
                  <option value="300-500">300.000₫ – 500.000₫</option>
                  <option value="above-500">Trên 500.000₫</option>
                </select>
              </div>

              {/* Nút Đặt lại bộ lọc */}
              {(selectedCategory !== 'all' ||
                selectedConcern !== 'all' ||
                selectedScentFamily !== 'all' ||
                priceRange !== 'all' ||
                searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedConcern('all');
                    setSelectedScentFamily('all');
                    setPriceRange('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-[#B85D38] underline hover:text-[#9E3838]"
                >
                  Đặt lại lọc ↺
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LƯỚI SẢN PHẨM SỐNG ĐỘNG (LIVING PRODUCT GRID WITH MOTION LAYOUT) */}
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <span className="text-5xl">🌾</span>
              <h3 className="mt-3 font-serif text-lg font-medium text-[#1F2B24]">
                Không tìm thấy sản phẩm thảo mộc phù hợp
              </h3>
              <p className="mt-1 text-xs text-[#8C827A]">
                Hãy thử nới lỏng bộ lọc hoặc tìm kiếm với từ khóa khác như &quot;sả&quot;,
                &quot;nhài&quot;, &quot;trầm&quot;...
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <LivingProductCard
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Modal Xem Nhanh Sản Phẩm */}
        {quickViewProduct && (
          <ProductQuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </main>
      <PublicFooter />
    </>
  );
}
