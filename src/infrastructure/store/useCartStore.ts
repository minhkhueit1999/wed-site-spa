import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SaSpaProduct } from '@/data/saSpaProducts';

export interface CartItem {
  product: SaSpaProduct;
  selectedVolume: string;
  price: number;
  quantity: number;
}

export type FavoriteScent = 'sa-chanh' | 'hoa-nhai' | 'go-tram' | 'bac-ha';

export interface CartStore {
  items: CartItem[];
  wishlist: string[]; // Danh sách product id
  discountCode: string | null;
  discountPercent: number;
  isCartOpen: boolean;
  favoriteScent: FavoriteScent | null;
  isSoundPlaying: boolean;
  lastAddedItem: CartItem | null;
  flyAnimationCount: number;

  // Actions Giỏ hàng
  addItem: (product: SaSpaProduct, selectedVolume?: string, quantity?: number) => void;
  removeItem: (productId: string, selectedVolume: string) => void;
  updateQuantity: (productId: string, selectedVolume: string, quantity: number) => void;
  clearCart: () => void;

  // Actions Mã giảm giá & Trạng thái mở
  applyDiscount: (code: string) => { success: boolean; message: string };
  removeDiscount: () => void;
  setCartOpen: (open: boolean) => void;

  // Actions Wishlist & Nốt hương cá nhân
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setFavoriteScent: (scent: FavoriteScent | null) => void;

  // Thanh âm Web Audio & Hiệu ứng bay vào giỏ
  toggleSound: () => void;
  setSoundPlaying: (playing: boolean) => void;
  triggerFlyAnimation: (item: CartItem) => void;

  // Tính toán tổng tiền
  getCartTotal: () => {
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    total: number;
    totalItems: number;
    freeShippingThreshold: number;
    giftThreshold: number;
    missingForFreeShipping: number;
    missingForGift: number;
    hasFreeShipping: boolean;
    hasGift: boolean;
  };
}

const FREE_SHIPPING_THRESHOLD = 500000; // 500k VND miễn phí giao hàng
const GIFT_THRESHOLD = 800000; // 800k VND tặng túi thơm sả chanh

const createSafeStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  const memoryStore = new Map<string, string>();
  return {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStore.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      discountCode: null,
      discountPercent: 0,
      isCartOpen: false,
      favoriteScent: null,
      isSoundPlaying: false,
      lastAddedItem: null,
      flyAnimationCount: 0,

      addItem: (product, selectedVolume, quantity = 1) => {
        const volume = selectedVolume || product.volumes[0]?.size || 'Tiêu chuẩn';
        const matchedVolume = product.volumes.find((v) => v.size === volume);
        const itemPrice = matchedVolume ? matchedVolume.price : product.price;

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.product.id === product.id && item.selectedVolume === volume,
        );

        let updatedItems: CartItem[];
        const existingItem = currentItems[existingIndex];
        if (existingIndex > -1 && existingItem) {
          updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
          };
        } else {
          updatedItems = [
            ...currentItems,
            {
              product,
              selectedVolume: volume,
              price: itemPrice,
              quantity,
            },
          ];
        }

        const addedItem: CartItem = {
          product,
          selectedVolume: volume,
          price: itemPrice,
          quantity,
        };

        set((state) => ({
          items: updatedItems,
          lastAddedItem: addedItem,
          flyAnimationCount: state.flyAnimationCount + 1,
        }));
      },

      removeItem: (productId, selectedVolume) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.selectedVolume === selectedVolume),
          ),
        }));
      },

      updateQuantity: (productId, selectedVolume, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedVolume);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.selectedVolume === selectedVolume
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], discountCode: null, discountPercent: 0 });
      },

      applyDiscount: (rawCode) => {
        const code = rawCode.trim().toUpperCase();
        if (code === 'MKSPA15' || code === 'SASPA15') {
          set({ discountCode: code, discountPercent: 15 });
          return {
            success: true,
            message: `Áp dụng mã ${code} thành công: Giảm 15% toàn bộ giỏ hàng!`,
          };
        }
        if (code === 'MKSPA10' || code === 'WELCOME10') {
          set({ discountCode: code, discountPercent: 10 });
          return {
            success: true,
            message: `Áp dụng mã ${code} thành công: Giảm 10% cho khách hàng mới!`,
          };
        }
        return {
          success: false,
          message: 'Mã ưu đãi không hợp lệ hoặc đã hết hạn. Hãy thử "MKSPA15" hoặc "WELCOME10".',
        };
      },

      removeDiscount: () => {
        set({ discountCode: null, discountPercent: 0 });
      },

      setCartOpen: (open) => {
        set({ isCartOpen: open });
      },

      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlist.includes(productId);
          return {
            wishlist: exists
              ? state.wishlist.filter((id) => id !== productId)
              : [...state.wishlist, productId],
          };
        });
      },

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      setFavoriteScent: (scent) => {
        set({ favoriteScent: scent });
      },

      toggleSound: () => {
        set((state) => ({ isSoundPlaying: !state.isSoundPlaying }));
      },

      setSoundPlaying: (playing) => {
        set({ isSoundPlaying: playing });
      },

      triggerFlyAnimation: (item) => {
        set((state) => ({
          lastAddedItem: item,
          flyAnimationCount: state.flyAnimationCount + 1,
        }));
      },

      getCartTotal: () => {
        const { items, discountPercent } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const discountAmount = Math.round((subtotal * discountPercent) / 100);
        const afterDiscount = subtotal - discountAmount;

        const hasFreeShipping = afterDiscount >= FREE_SHIPPING_THRESHOLD;
        const shippingFee = subtotal === 0 || hasFreeShipping ? 0 : 35000;

        const total = afterDiscount + shippingFee;

        const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);
        const missingForGift = Math.max(0, GIFT_THRESHOLD - afterDiscount);
        const hasGift = afterDiscount >= GIFT_THRESHOLD;

        return {
          subtotal,
          discountAmount,
          shippingFee,
          total,
          totalItems,
          freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
          giftThreshold: GIFT_THRESHOLD,
          missingForFreeShipping,
          missingForGift,
          hasFreeShipping,
          hasGift,
        };
      },
    }),
    {
      name: 'saspa_cart_store',
      storage: createJSONStorage(createSafeStorage),
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        discountCode: state.discountCode,
        discountPercent: state.discountPercent,
        favoriteScent: state.favoriteScent,
      }),
    },
  ),
);
