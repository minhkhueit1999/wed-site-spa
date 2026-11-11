'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardTitle, Button, Input, Badge } from '@/components/ui';
import { formatCurrencyVND } from '@/lib/utils';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  type CreateProductInput,
  type UpdateProductInput,
} from '@/application/admin/actions';
import type { Product } from '@prisma/client';

interface AdminProductManagementProps {
  products: Product[];
  onRefresh: () => Promise<void>;
}

export function AdminProductManagement({ products, onRefresh }: AdminProductManagementProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  // Modal Tạo Sản Phẩm
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createSlug, setCreateSlug] = React.useState('');
  const [createName, setCreateName] = React.useState('');
  const [createDesc, setCreateDesc] = React.useState('');
  const [createUsage, setCreateUsage] = React.useState('');
  const [createPrice, setCreatePrice] = React.useState(350000);
  const [createCostPrice, setCreateCostPrice] = React.useState(150000);
  const [createStock, setCreateStock] = React.useState(50);
  const [createMinStock, setCreateMinStock] = React.useState(10);
  const [createUnit, setCreateUnit] = React.useState('chai');
  const [createImageUrl, setCreateImageUrl] = React.useState('');
  const [isSubmittingCreate, setIsSubmittingCreate] = React.useState(false);

  // Modal Sửa Sản Phẩm
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [editUsage, setEditUsage] = React.useState('');
  const [editPrice, setEditPrice] = React.useState(0);
  const [editCostPrice, setEditCostPrice] = React.useState(0);
  const [editStock, setEditStock] = React.useState(0);
  const [editMinStock, setEditMinStock] = React.useState(0);
  const [editUnit, setEditUnit] = React.useState('chai');
  const [editImageUrl, setEditImageUrl] = React.useState('');
  const [editActive, setEditActive] = React.useState(true);
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);

  // Modal Xóa
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Mở modal sửa
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditDesc(p.description);
    setEditUsage(p.usageGuide);
    setEditPrice(p.priceVnd);
    setEditCostPrice(p.costPriceVnd || 0);
    setEditStock(p.stockQuantity ?? 50);
    setEditMinStock(p.minStockAlert ?? 10);
    setEditUnit(p.unit || 'chai');
    setEditImageUrl(p.imageUrl || '');
    setEditActive(p.active ?? true);
  };

  // Handler Tạo Sản Phẩm
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    setFeedback(null);

    const input: CreateProductInput = {
      slug: createSlug.trim().toLowerCase(),
      name: createName.trim(),
      description: createDesc.trim(),
      usageGuide: createUsage.trim() || 'Sử dụng đều đặn theo phác đồ',
      priceVnd: Number(createPrice),
      costPriceVnd: Number(createCostPrice),
      stockQuantity: Number(createStock),
      minStockAlert: Number(createMinStock),
      unit: createUnit.trim() || 'chai',
      imageUrl: createImageUrl.trim(),
      active: true,
    };

    const res = await createProductAction(input);
    setIsSubmittingCreate(false);

    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `✅ Đã tạo mới sản phẩm "${input.name}" thành công!`,
      });
      setIsCreateOpen(false);
      setCreateSlug('');
      setCreateName('');
      setCreateDesc('');
      setCreateUsage('');
      setCreateImageUrl('');
      await onRefresh();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  // Handler Sửa Sản Phẩm
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmittingEdit(true);
    setFeedback(null);

    const input: UpdateProductInput = {
      slug: editingProduct.slug,
      name: editName.trim(),
      description: editDesc.trim(),
      usageGuide: editUsage.trim(),
      priceVnd: Number(editPrice),
      costPriceVnd: Number(editCostPrice),
      stockQuantity: Number(editStock),
      minStockAlert: Number(editMinStock),
      unit: editUnit.trim(),
      imageUrl: editImageUrl.trim(),
      active: editActive,
    };

    const res = await updateProductAction(input);
    setIsSubmittingEdit(false);

    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `✅ Đã lưu cập nhật cho sản phẩm "${res.value.name}"!`,
      });
      setEditingProduct(null);
      await onRefresh();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  // Handler Xóa Sản Phẩm
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    setFeedback(null);

    const res = await deleteProductAction(deletingProduct.slug);
    setIsDeleting(false);

    if (res.ok) {
      setFeedback({ type: 'success', msg: `🗑️ ${res.value.message}` });
      setDeletingProduct(null);
      await onRefresh();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header & Nút Thêm Mới */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2B2622]">
            Quản Lý Toa Sản Phẩm Dưỡng Tại Nhà & Bán Lẻ
          </h2>
          <p className="text-xs text-[#635B54]">
            Thêm mới, chỉnh sửa giá bán, giá vốn, tồn kho, hình ảnh và trạng thái sản phẩm MK SPA.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 self-start shadow-md sm:self-auto"
        >
          <span>➕</span>
          <span>Thêm Sản Phẩm Mới</span>
        </Button>
      </div>

      {/* Thông báo phản hồi */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs font-medium ${
            feedback.type === 'success'
              ? 'border border-[#405C4E]/30 bg-[#E5EDE8] text-[#2D4137]'
              : 'border border-[#9E3838]/30 bg-[#FBEBEB] text-[#832B2B]'
          }`}
        >
          <span>{feedback.msg}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-sm font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tìm kiếm */}
      <Card className="border-[#E2D9CC] bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm sản phẩm theo tên hoặc mã slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-xs text-[#2B2622] placeholder-[#8C827A] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute top-2.5 right-3 text-xs text-[#8C827A] hover:text-[#2B2622]"
            >
              ✕
            </button>
          )}
        </div>
      </Card>

      {/* Bảng danh sách sản phẩm */}
      <Card className="overflow-hidden border-[#E2D9CC] bg-white p-0 shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#635B54]">
            Chưa có sản phẩm nào phù hợp với tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2D9CC] bg-[#F4EFEA] font-serif font-bold text-[#2B2622]">
                <tr>
                  <th className="px-4 py-3.5">Sản Phẩm</th>
                  <th className="px-4 py-3.5">Giá Bán / Giá Vốn</th>
                  <th className="px-4 py-3.5">Tồn Kho</th>
                  <th className="px-4 py-3.5">Trạng Thái</th>
                  <th className="px-4 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9CC]/60">
                {filteredProducts.map((p) => {
                  const isLowStock = (p.stockQuantity ?? 50) <= (p.minStockAlert ?? 10);
                  return (
                    <tr key={p.slug} className="transition-colors hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#E2D9CC] bg-[#F4EFEA]">
                            {p.imageUrl ? (
                              <Image
                                src={p.imageUrl}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">
                                🧴
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#2B2622]">{p.name}</div>
                            <div className="font-mono text-[11px] text-[#8C827A]">{p.slug}</div>
                            <div className="mt-0.5 line-clamp-1 max-w-xs text-[11px] text-[#635B54]">
                              {p.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-[#405C4E]">
                          {formatCurrencyVND(p.priceVnd)}
                        </div>
                        {p.costPriceVnd > 0 && (
                          <div className="text-[11px] text-[#8C827A]">
                            Vốn: {formatCurrencyVND(p.costPriceVnd)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              isLowStock ? 'text-[#9E3838]' : 'text-[#2B2622]'
                            }`}
                          >
                            {p.stockQuantity ?? 50} {p.unit || 'chai'}
                          </span>
                          {isLowStock && (
                            <span className="rounded bg-[#FBEBEB] px-1.5 py-0.5 text-[10px] font-bold text-[#9E3838]">
                              Sắp hết
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8C827A]">
                          Ngưỡng tối thiểu: {p.minStockAlert ?? 10}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {p.active !== false ? (
                          <Badge variant="primary">Đang bán</Badge>
                        ) : (
                          <Badge variant="secondary">Tạm ẩn</Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="rounded-lg border border-[#D4C8B8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#2B2622] hover:bg-[#FAF7F2]"
                            title="Chỉnh sửa sản phẩm"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            className="rounded-lg border border-[#9E3838]/30 bg-white px-2.5 py-1 text-[11px] font-medium text-[#9E3838] hover:bg-[#FBEBEB]"
                            title="Xóa sản phẩm"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ================= MODAL THÊM SẢN PHẨM ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <CardTitle className="font-serif text-lg text-[#2B2622]">
                ➕ Thêm Sản Phẩm Mới
              </CardTitle>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-base text-[#8C827A] hover:text-[#2B2622]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Tên sản phẩm"
                  placeholder="Tinh Dầu Sả Chanh MK SPA"
                  value={createName}
                  onChange={(e) => {
                    setCreateName(e.target.value);
                    if (!createSlug) {
                      setCreateSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, '')
                          .replace(/\s+/g, '-'),
                      );
                    }
                  }}
                  required
                />
                <Input
                  label="Mã slug (duy nhất)"
                  placeholder="tinh-dau-sa-chanh"
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Giá bán lẻ (VNĐ)"
                  type="number"
                  value={createPrice}
                  onChange={(e) => setCreatePrice(Number(e.target.value))}
                  required
                />
                <Input
                  label="Giá vốn (VNĐ)"
                  type="number"
                  value={createCostPrice}
                  onChange={(e) => setCreateCostPrice(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Input
                  label="Số lượng tồn kho"
                  type="number"
                  value={createStock}
                  onChange={(e) => setCreateStock(Number(e.target.value))}
                  required
                />
                <Input
                  label="Báo động khi chạm"
                  type="number"
                  value={createMinStock}
                  onChange={(e) => setCreateMinStock(Number(e.target.value))}
                />
                <Input
                  label="Đơn vị tính"
                  placeholder="chai, hũ, gói"
                  value={createUnit}
                  onChange={(e) => setCreateUnit(e.target.value)}
                />
              </div>

              <Input
                label="Đường dẫn ảnh sản phẩm (URL)"
                placeholder="https://images.unsplash.com/..."
                value={createImageUrl}
                onChange={(e) => setCreateImageUrl(e.target.value)}
              />

              <div>
                <label className="mb-1 block font-medium text-[#2B2622]">Mô tả công dụng</label>
                <textarea
                  rows={2}
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Chưng cất thủ công từ sả tươi Mộc Châu, giúp làm ấm cơ thể và an thần..."
                  className="w-full rounded-xl border border-[#D4C8B8] bg-white p-2 text-xs text-[#2B2622] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-[#2B2622]">Hướng dẫn sử dụng</label>
                <input
                  type="text"
                  value={createUsage}
                  onChange={(e) => setCreateUsage(e.target.value)}
                  placeholder="Nhỏ 3-5 giọt vào máy khuếch tán hoặc bồn tắm nước ấm"
                  className="w-full rounded-xl border border-[#D4C8B8] bg-white px-3 py-2 text-xs text-[#2B2622] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmittingCreate}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingCreate}>
                  {isSubmittingCreate ? 'Đang tạo...' : 'Tạo Sản Phẩm'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL SỬA SẢN PHẨM ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <CardTitle className="font-serif text-lg text-[#2B2622]">
                ✏️ Chỉnh Sửa Sản Phẩm: {editingProduct.slug}
              </CardTitle>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-base text-[#8C827A] hover:text-[#2B2622]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <Input
                label="Tên sản phẩm"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Giá bán lẻ (VNĐ)"
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  required
                />
                <Input
                  label="Giá vốn (VNĐ)"
                  type="number"
                  value={editCostPrice}
                  onChange={(e) => setEditCostPrice(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Input
                  label="Tồn kho hiện tại"
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  required
                />
                <Input
                  label="Ngưỡng cảnh báo"
                  type="number"
                  value={editMinStock}
                  onChange={(e) => setEditMinStock(Number(e.target.value))}
                />
                <Input
                  label="Đơn vị tính"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                />
              </div>

              <Input
                label="Đường dẫn ảnh sản phẩm (URL)"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
              />

              <div>
                <label className="mb-1 block font-medium text-[#2B2622]">Mô tả sản phẩm</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-xl border border-[#D4C8B8] bg-white p-2 text-xs text-[#2B2622] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-[#2B2622]">Hướng dẫn sử dụng</label>
                <input
                  type="text"
                  value={editUsage}
                  onChange={(e) => setEditUsage(e.target.value)}
                  className="w-full rounded-xl border border-[#D4C8B8] bg-white px-3 py-2 text-xs text-[#2B2622] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editActiveCheckbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D4C8B8] text-[#405C4E]"
                />
                <label htmlFor="editActiveCheckbox" className="font-medium text-[#2B2622]">
                  Kích hoạt đang bán (Nếu tắt, sản phẩm sẽ tạm ẩn trên cửa hàng)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingProduct(null)}
                  disabled={isSubmittingEdit}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA ================= */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#9E3838]/40 bg-white p-6 text-center shadow-2xl">
            <span className="text-4xl">⚠️</span>
            <h3 className="mt-3 font-serif text-lg font-bold text-[#2B2622]">
              Xác Nhận Xóa Sản Phẩm?
            </h3>
            <p className="mt-2 text-xs text-[#635B54]">
              Bạn có chắc chắn muốn xóa sản phẩm <strong>{deletingProduct.name}</strong> (
              <span className="font-mono text-[#9E3838]">{deletingProduct.slug}</span>)?
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
