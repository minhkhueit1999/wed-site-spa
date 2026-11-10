import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';
import { SA_SPA_PRODUCTS } from '@/data/saSpaProducts';

describe('Zustand useCartStore (MK SPA E-commerce)', () => {
  const p0 = SA_SPA_PRODUCTS[0]!;
  const p1 = SA_SPA_PRODUCTS[1]!;
  const p2 = SA_SPA_PRODUCTS[2]!;

  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.setState({ wishlist: [], discountCode: null, discountPercent: 0 });
  });

  it('thêm sản phẩm vào giỏ hàng và tính tổng phụ chuẩn xác', () => {
    useCartStore.getState().addItem(p0, '30ml', 2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.quantity).toBe(2);
    expect(state.items[0]?.price).toBe(360000);

    const totals = state.getCartTotal();
    expect(totals.subtotal).toBe(720000);
    expect(totals.totalItems).toBe(2);
    expect(totals.hasFreeShipping).toBe(true); // >= 500k
  });

  it('cộng dồn số lượng khi thêm cùng sản phẩm và cùng dung tích', () => {
    useCartStore.getState().addItem(p0, '30ml', 1);
    useCartStore.getState().addItem(p0, '30ml', 2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.quantity).toBe(3);
    expect(state.getCartTotal().subtotal).toBe(1080000);
  });

  it('tách thành 2 dòng riêng biệt nếu cùng sản phẩm nhưng khác dung tích', () => {
    useCartStore.getState().addItem(p0, '15ml', 1);
    useCartStore.getState().addItem(p0, '30ml', 1);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.items[0]?.selectedVolume).toBe('15ml');
    expect(state.items[1]?.selectedVolume).toBe('30ml');
  });

  it('áp dụng mã giảm giá SASPA15 giảm 15% và tính đúng số tiền thanh toán', () => {
    useCartStore.getState().addItem(p1, '30ml', 1); // 450,000đ

    const res = useCartStore.getState().applyDiscount('saspa15');
    expect(res.success).toBe(true);

    const totals = useCartStore.getState().getCartTotal();
    expect(totals.subtotal).toBe(450000);
    expect(totals.discountAmount).toBe(67500); // 15% của 450,000
    // afterDiscount = 382,500 < 500k nên cộng 35k tiền ship
    expect(totals.shippingFee).toBe(35000);
    expect(totals.total).toBe(382500 + 35000);
  });

  it('từ chối mã giảm giá sai và hiển thị hướng dẫn', () => {
    const res = useCartStore.getState().applyDiscount('SAI_MA_123');
    expect(res.success).toBe(false);
    expect(useCartStore.getState().discountPercent).toBe(0);
  });

  it('thêm và xóa sản phẩm khỏi Wishlist', () => {
    const id = p0.id;
    useCartStore.getState().toggleWishlist(id);
    expect(useCartStore.getState().isInWishlist(id)).toBe(true);

    useCartStore.getState().toggleWishlist(id);
    expect(useCartStore.getState().isInWishlist(id)).toBe(false);
  });

  it('tính mốc quà tặng túi thơm khi đơn đạt từ 800,000đ trở lên', () => {
    useCartStore.getState().addItem(p2, '20ml', 1); // 680,000đ

    let totals = useCartStore.getState().getCartTotal();
    expect(totals.hasGift).toBe(false);
    expect(totals.missingForGift).toBe(120000);

    useCartStore.getState().addItem(p2, '20ml', 1); // 1,360,000đ
    totals = useCartStore.getState().getCartTotal();
    expect(totals.hasGift).toBe(true);
    expect(totals.missingForGift).toBe(0);
  });
});
