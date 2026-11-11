'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button, Card, CardTitle, Badge } from '@/components/ui';
import {
  getInventoryStatusAction,
  stockInProductAction,
  stockOutProductAction,
  getInventoryTransactionsAction,
  createServiceAction,
  deleteServiceAction,
  type InventoryItemDTO,
  type InventoryTransactionItem,
  type AdminAllData,
} from '@/application/admin/actions';
import { formatCurrencyVND } from '@/lib/utils';

interface Props {
  adminData: AdminAllData | null;
  onRefreshData: () => Promise<void>;
}

export function AdminInventoryServices({ adminData, onRefreshData }: Props) {
  const [subTab, setSubTab] = React.useState<'inventory' | 'services' | 'history'>('inventory');
  const [inventory, setInventory] = React.useState<InventoryItemDTO[]>([]);
  const [transactions, setTransactions] = React.useState<InventoryTransactionItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  // Form tạo Dịch vụ mới
  const [newServiceName, setNewServiceName] = React.useState('');
  const [newServiceSlug, setNewServiceSlug] = React.useState('');
  const [newServiceDesc, setNewServiceDesc] = React.useState('');
  const [newServicePrice, setNewServicePrice] = React.useState(750000);
  const [newServiceDuration, setNewServiceDuration] = React.useState(60);
  const [newServiceSessions, setNewServiceSessions] = React.useState(6);
  const [isCreatingService, setIsCreatingService] = React.useState(false);

  // Modal Nhập/Xuất kho
  const [activeItem, setActiveItem] = React.useState<InventoryItemDTO | null>(null);
  const [modalMode, setModalMode] = React.useState<'IN' | 'OUT'>('IN');
  const [stockAmount, setStockAmount] = React.useState<number>(10);
  const [costPrice, setCostPrice] = React.useState<number>(150000);
  const [stockReason, setStockReason] = React.useState('Nhập kho định kỳ từ xưởng thảo mộc');
  const [isSubmittingStock, setIsSubmittingStock] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [invRes, txRes] = await Promise.all([
      getInventoryStatusAction(),
      getInventoryTransactionsAction(),
    ]);

    if (invRes.ok) setInventory(invRes.value);
    if (txRes.ok) setTransactions(txRes.value);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Tạo dịch vụ mới
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingService(true);
    setFeedback(null);

    const res = await createServiceAction({
      slug: newServiceSlug || newServiceName.toLowerCase().replace(/\s+/g, '-'),
      name: newServiceName,
      description: newServiceDesc,
      durationMin: newServiceDuration,
      sessionsRecommended: newServiceSessions,
      priceVnd: newServicePrice,
    });

    if (res.ok) {
      setFeedback({ type: 'success', msg: `Đã tạo dịch vụ ${newServiceName}!` });
      setNewServiceName('');
      setNewServiceSlug('');
      setNewServiceDesc('');
      await onRefreshData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsCreatingService(false);
  };

  // Xóa dịch vụ
  const handleDeleteService = async (slug: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${name}"?`)) return;

    const res = await deleteServiceAction(slug);
    if (res.ok) {
      setFeedback({ type: 'success', msg: res.value.message });
      await onRefreshData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
  };

  // Thao tác Nhập / Xuất kho
  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || stockAmount <= 0) return;

    setIsSubmittingStock(true);
    setFeedback(null);

    let res;
    if (modalMode === 'IN') {
      res = await stockInProductAction({
        productSlug: activeItem.slug,
        quantity: stockAmount,
        costPriceVnd: costPrice,
        reason: stockReason,
      });
    } else {
      res = await stockOutProductAction({
        productSlug: activeItem.slug,
        quantity: stockAmount,
        reason: stockReason,
      });
    }

    if (res.ok) {
      setFeedback({
        type: 'success',
        msg: `Đã ${modalMode === 'IN' ? 'nhập' : 'xuất'} kho thành công! Tồn kho mới: ${res.value.newStock}`,
      });
      setActiveItem(null);
      await loadData();
    } else {
      setFeedback({ type: 'error', msg: res.error });
    }
    setIsSubmittingStock(false);
  };

  const lowStockCount = inventory.filter((i) => i.isLowStock).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2D9CC] bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2B24]">
            Dịch Vụ Trị Liệu & Quản Lý Kho Mỹ Phẩm
          </h2>
          <p className="text-sm text-[#635B54]">
            Theo dõi tồn kho mỹ phẩm thảo mộc, cảnh báo tự động dưới ngưỡng an toàn và quản lý danh
            mục dịch vụ.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-1">
          <button
            onClick={() => setSubTab('inventory')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              subTab === 'inventory'
                ? 'bg-[#1F2B24] text-white shadow-xs'
                : 'text-[#635B54] hover:text-[#1F2B24]'
            }`}
          >
            📦 Tồn Kho Mỹ Phẩm {lowStockCount > 0 && `(⚠️ ${lowStockCount} báo động)`}
          </button>
          <button
            onClick={() => setSubTab('services')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              subTab === 'services'
                ? 'bg-[#1F2B24] text-white shadow-xs'
                : 'text-[#635B54] hover:text-[#1F2B24]'
            }`}
          >
            🌿 Dịch Vụ & Bảng Giá ({adminData?.services.length || 0})
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              subTab === 'history'
                ? 'bg-[#1F2B24] text-white shadow-xs'
                : 'text-[#635B54] hover:text-[#1F2B24]'
            }`}
          >
            📑 Lịch Sử Xuất Nhập ({transactions.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-[#4E6B56]/30 bg-[#E8EFE9] text-[#1F2B24]'
              : 'border-[#B85D38]/30 bg-[#FDECEC] text-[#B85D38]'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* 2. SUB-TAB 1: TỒN KHO MỸ PHẨM */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800">
              <span className="text-base">🚨</span>
              <span>
                CẢNH BÁO TỒN KHO TỐI THIỂU: Có <strong>{lowStockCount}</strong> sản phẩm chạm ngưỡng
                an toàn. Cần tiến hành nhập kho ngay để không gián đoạn toa chăm sóc tại nhà!
              </span>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#2B2622]">
                <thead className="bg-[#FAF7F2] text-xs text-[#8C827A] uppercase">
                  <tr>
                    <th className="p-3.5">Ảnh</th>
                    <th className="p-3.5">Sản Phẩm</th>
                    <th className="p-3.5">Đơn Vị</th>
                    <th className="p-3.5">Giá Vốn</th>
                    <th className="p-3.5">Giá Bán Niêm Yết</th>
                    <th className="p-3.5">Số Lượng Tồn Kho</th>
                    <th className="p-3.5">Ngưỡng Tối Thiểu</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D9CC]/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-xs text-[#8C827A]">
                        Đang kiểm kê số liệu tồn kho...
                      </td>
                    </tr>
                  ) : inventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-xs text-[#8C827A]">
                        Chưa có sản phẩm nào trong kho.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr
                        key={item.slug}
                        className={`hover:bg-[#FAF7F2]/40 ${item.isLowStock ? 'bg-red-50/40' : ''}`}
                      >
                        <td className="p-3.5">
                          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-[#D4AF37]/40 bg-[#FAF7F2] shadow-2xs">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-[#8C827A]">
                                🌿
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-[#1F2B24]">{item.name}</div>
                          <div className="font-mono text-xs text-[#8C827A]">{item.slug}</div>
                        </td>
                        <td className="p-3.5 text-xs text-[#635B54]">{item.unit}</td>
                        <td className="p-3.5 font-mono text-xs">
                          {formatCurrencyVND(item.costPriceVnd)}
                        </td>
                        <td className="p-3.5 font-mono text-xs font-bold text-[#4E6B56]">
                          {formatCurrencyVND(item.priceVnd)}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span
                            className={`text-sm font-bold ${item.isLowStock ? 'rounded-md border border-red-300 bg-red-100 px-2 py-0.5 text-red-600' : 'text-[#1F2B24]'}`}
                          >
                            {item.stockQuantity}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-xs text-[#8C827A]">
                          {item.minStockAlert}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setActiveItem(item);
                                setModalMode('IN');
                                setCostPrice(item.costPriceVnd);
                                setStockReason('Nhập kho định kỳ');
                              }}
                            >
                              + Nhập Kho
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActiveItem(item);
                                setModalMode('OUT');
                                setStockReason('Xuất buồng trị liệu');
                              }}
                            >
                              - Xuất Kho
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB 2: DỊCH VỤ & BẢNG GIÁ */}
      {subTab === 'services' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Danh sách dịch vụ */}
          <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm lg:col-span-8">
            <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
              Danh Mục Gói Liệu Trình Trị Liệu Tại Spa
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#2B2622]">
                <thead className="bg-[#FAF7F2] text-xs text-[#8C827A] uppercase">
                  <tr>
                    <th className="p-3.5">Tên Dịch Vụ</th>
                    <th className="p-3.5">Thời Lượng</th>
                    <th className="p-3.5">Số Buổi Gói</th>
                    <th className="p-3.5">Giá Niêm Yết</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D9CC]/60">
                  {adminData?.services.map((s) => (
                    <tr key={s.slug} className="hover:bg-[#FAF7F2]/40">
                      <td className="p-3.5">
                        <div className="font-bold text-[#1F2B24]">{s.name}</div>
                        <div className="line-clamp-1 text-xs text-[#635B54]">{s.description}</div>
                      </td>
                      <td className="p-3.5 text-xs font-semibold">{s.durationMin} phút</td>
                      <td className="p-3.5 text-xs font-semibold text-[#4E6B56]">
                        {s.sessionsRecommended} buổi
                      </td>
                      <td className="p-3.5 font-mono text-xs font-bold text-[#1F2B24]">
                        {formatCurrencyVND(s.priceVnd)}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteService(s.slug, s.name)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form thêm dịch vụ */}
          <div className="lg:col-span-4">
            <Card className="border-[#D4B996] bg-[#FAF7F2] p-5 shadow-xs">
              <CardTitle className="font-serif text-lg text-[#1F2B24]">
                Thêm Gói Dịch Vụ Mới
              </CardTitle>
              <form onSubmit={handleCreateService} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">Tên dịch vụ:</label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => {
                      setNewServiceName(e.target.value);
                      if (!newServiceSlug) {
                        setNewServiceSlug(
                          e.target.value
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, ''),
                        );
                      }
                    }}
                    placeholder="Massage Thảo Mộc Cổ Truyền"
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Slug định danh:
                  </label>
                  <input
                    type="text"
                    required
                    value={newServiceSlug}
                    onChange={(e) => setNewServiceSlug(e.target.value)}
                    placeholder="massage-thao-moc-co-truyen"
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 font-mono text-xs text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Mô tả phác đồ:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Liệu trình kết hợp ngâm chân và bấm huyệt..."
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#635B54]">
                      Thời lượng (phút):
                    </label>
                    <input
                      type="number"
                      required
                      min={30}
                      max={180}
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(parseInt(e.target.value, 10) || 60)}
                      className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#635B54]">
                      Số buổi khuyến nghị:
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={20}
                      value={newServiceSessions}
                      onChange={(e) => setNewServiceSessions(parseInt(e.target.value, 10) || 6)}
                      className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 text-sm text-[#2B2622]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Giá tiền mỗi buổi (VND):
                  </label>
                  <input
                    type="number"
                    required
                    min={100000}
                    step={10000}
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(parseInt(e.target.value, 10) || 0)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2 font-mono text-sm font-bold text-[#1F2B24]"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="mt-2 w-full"
                  disabled={isCreatingService}
                >
                  {isCreatingService ? 'Đang tạo...' : '+ Tạo Gói Dịch Vụ'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 3: LỊCH SỬ XUẤT NHẬP TỒN */}
      {subTab === 'history' && (
        <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
          <div className="border-b border-[#E2D9CC] bg-[#FAF7F2] p-4 font-semibold text-[#1F2B24]">
            Nhật Ký Xuất / Nhập / Hao Hụt Mỹ Phẩm
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2B2622]">
              <thead className="bg-[#FAF7F2] text-xs text-[#8C827A] uppercase">
                <tr>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Sản Phẩm</th>
                  <th className="p-3.5">Loại Giao Dịch</th>
                  <th className="p-3.5">Biến Động Số Lượng</th>
                  <th className="p-3.5">Tồn Sau Giao Dịch</th>
                  <th className="p-3.5">Lý Do / Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9CC]/60">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAF7F2]/40">
                    <td className="p-3.5 font-mono text-xs text-[#8C827A]">
                      {new Date(t.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3.5 font-bold text-[#1F2B24]">{t.productName}</td>
                    <td className="p-3.5">
                      <Badge variant={t.type === 'IMPORT' ? 'success' : 'terracotta'}>
                        {t.type}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      <span className={t.quantity > 0 ? 'text-[#4E6B56]' : 'text-red-600'}>
                        {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-xs font-semibold">{t.balanceAfter}</td>
                    <td className="p-3.5 text-xs text-[#635B54]">{t.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Modal Nhập / Xuất Kho */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-[#D4B996] bg-[#FAF7F2] p-6 shadow-2xl">
            <CardTitle className="font-serif text-xl text-[#1F2B24]">
              {modalMode === 'IN' ? 'Nhập Kho Mỹ Phẩm' : 'Xuất Kho Mỹ Phẩm'}
            </CardTitle>
            <div className="mt-1 text-xs text-[#8C827A]">
              Sản phẩm: <strong>{activeItem.name}</strong> • Hiện tồn:{' '}
              <strong className="font-mono text-[#1F2B24]">{activeItem.stockQuantity}</strong>{' '}
              {activeItem.unit}
            </div>

            <form onSubmit={handleStockSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Số lượng {modalMode === 'IN' ? 'nhập' : 'xuất'} ({activeItem.unit}):
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={stockAmount}
                  onChange={(e) => setStockAmount(parseInt(e.target.value, 10) || 1)}
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 font-mono text-sm font-bold text-[#1F2B24] outline-hidden focus:border-[#4E6B56]"
                />
              </div>

              {modalMode === 'IN' && (
                <div>
                  <label className="block text-xs font-semibold text-[#635B54]">
                    Giá vốn nhập (VND):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseInt(e.target.value, 10) || 0)}
                    className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 font-mono text-sm font-bold text-[#1F2B24] outline-hidden focus:border-[#4E6B56]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#635B54]">
                  Lý do thực hiện:
                </label>
                <input
                  type="text"
                  required
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D4B996] bg-white p-2.5 text-sm text-[#2B2622] outline-hidden focus:border-[#4E6B56]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveItem(null)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingStock}>
                  {isSubmittingStock ? 'Đang lưu...' : 'Xác Nhận'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
