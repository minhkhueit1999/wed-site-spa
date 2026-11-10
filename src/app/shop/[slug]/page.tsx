import React from 'react';
import { notFound } from 'next/navigation';
import { SA_SPA_PRODUCTS } from '@/data/saSpaProducts';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return SA_SPA_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = SA_SPA_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Lấy các sản phẩm liên quan cùng danh mục
  const relatedProducts = SA_SPA_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4);

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-[#FAF7F2] pb-24 text-[#2B2622]">
        <ProductDetailClient product={product} relatedProducts={relatedProducts} />
      </main>
      <PublicFooter />
    </>
  );
}
