'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button, CardTitle } from '@/components/ui';
import {
  getInRoomUpsellCatalogAction,
  addInRoomUpsellToAppointmentAction,
  type UpsellProductItem,
  type TechnicianMobileAppointment,
} from '@/application/therapist/actions';
import { formatCurrencyVND } from '@/lib/utils';

interface Props {
  appointment: TechnicianMobileAppointment;
  onClose: () => void;
  onSuccess: (addedName: string, earnedVnd: number) => void;
}

export function TechnicianUpsellSheet({ appointment, onClose, onSuccess }: Props) {
  const [products, setProducts] = React.useState<UpsellProductItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    void getInRoomUpsellCatalogAction().then((res) => {
      if (res.ok) setProducts(res.value);
      else setErrorMsg(res.error);
      setIsLoading(false);
    });
  }, []);

  const handleAddUpsell = async (product: UpsellProductItem) => {
    setIsSubmitting(product.slug);
    setErrorMsg(null);

    const res = await addInRoomUpsellToAppointmentAction({
      appointmentId: appointment.id,
      productSlug: product.slug,
      quantity: 1,
    });

    if (res.ok) {
      onSuccess(res.value.addedItemName, res.value.commissionEarnedVnd);
      onClose();
    } else {
      setErrorMsg(res.error);
    }
    setIsSubmitting(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="animate-in slide-in-from-bottom max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#D4B996] bg-[#FAF7F2] p-5 shadow-2xl duration-300 sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
          <div>
            <CardTitle className="font-serif text-lg text-[#1F2B24]">
              Gợi Ý Mỹ Phẩm Toa Tại Nhà (Bán Chéo)
            </CardTitle>
            <div className="text-xs text-[#8C827A]">
              Khách hàng: <strong>{appointment.customerName}</strong> • Hoa hồng KTV:{' '}
              <strong className="text-[#B85D38]">15% giá trị</strong>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-lg text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#8C827A]">Đang tải danh mục...</div>
          ) : (
            products.map((p) => (
              <div
                key={p.slug}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2D9CC] bg-white p-3 shadow-2xs hover:border-[#D4AF37]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-[#FAF7F2]">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-base">
                        🌿
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="line-clamp-1 text-sm font-bold text-[#1F2B24]">{p.name}</div>
                    <div className="font-mono text-xs font-bold text-[#4E6B56]">
                      {formatCurrencyVND(p.priceVnd)}
                    </div>
                    <div className="mt-0.5 inline-block rounded-md border border-[#FCD34D] bg-[#FFFBEB] px-1.5 py-0.5 text-[10px] font-bold text-[#B85D38]">
                      +{formatCurrencyVND(p.commissionRewardVnd)} hoa hồng
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting === p.slug}
                  onClick={() => handleAddUpsell(p)}
                  className="shrink-0 text-xs shadow-xs"
                >
                  {isSubmitting === p.slug ? 'Đang thêm...' : '+ Thêm'}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-2">
          <Button variant="outline" onClick={onClose} className="w-full">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
