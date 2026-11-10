import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from './useCartStore';

export type OrderStatus =
  | 'PREPARING_HERBS' // Đang chuẩn bị thảo mộc tươi
  | 'BAMBOO_PACKAGING' // Đang đóng gói hộp mây tre thủ công
  | 'DELIVERING' // Đang trên đường giao đến bạn
  | 'COMPLETED'; // Đã trao tận tay

export interface SaSpaOrder {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  giftOption: {
    isGift: boolean;
    recipientName?: string;
    greetingMessage?: string;
  };
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'vietqr' | 'card' | 'cod';
  status: OrderStatus;
}

export interface OrderStore {
  orders: SaSpaOrder[];
  addOrder: (order: SaSpaOrder) => void;
  getOrderById: (orderId: string) => SaSpaOrder | undefined;
  reorder: (orderId: string) => CartItem[];
}

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

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [
        // Đơn hàng mẫu ban đầu cho tài khoản demo
        {
          orderId: 'SASPA-8921',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          items: [
            {
              product: {
                id: 'sp-01',
                slug: 'tinh-dau-sa-chanh-nguyen-chat',
                name: 'Tinh Dầu Sả Chanh Nguyên Chất',
                category: 'tinh-dau',
                categoryName: 'Tinh Dầu & Khuếch Tán',
                subtitle: 'Chưng cất thủ công',
                price: 360000,
                rating: 5.0,
                reviewCount: 148,
                description: 'Linh hồn Sả Spa',
                scentFamily: 'cam-chanh',
                scentFamilyLabel: 'Cam Chanh & Thảo Mộc',
                concerns: ['cang-thang'],
                concernLabels: ['Căng thẳng'],
                scentNotes: {
                  top: 'Sả tươi',
                  heart: 'Hoa sả',
                  base: 'Tuyết tùng',
                  description: '',
                },
                ritualSteps: [],
                volumes: [{ size: '30ml', price: 360000 }],
                themeColor: {
                  primary: '#4E6B56',
                  secondary: '#E8EFE9',
                  accent: '#8DAA72',
                  glow: '',
                },
                botanicalElements: ['nhánh sả'],
              },
              selectedVolume: '30ml',
              price: 360000,
              quantity: 1,
            },
            {
              product: {
                id: 'sp-05',
                slug: 'muoi-tam-thao-duoc-tay-bac',
                name: 'Muối Tắm Thảo Dược Cổ Truyền Tây Bắc',
                category: 'cham-soc-co-the',
                categoryName: 'Chăm Sóc Cơ Thể',
                subtitle: 'Muối khoáng ngải cứu',
                price: 290000,
                rating: 4.9,
                reviewCount: 182,
                description: 'Công thức ngâm tắm',
                scentFamily: 'thao-moc',
                scentFamilyLabel: 'Thảo Mộc',
                concerns: ['moi-vai-gay'],
                concernLabels: ['Mỏi vai gáy'],
                scentNotes: { top: 'Gừng', heart: 'Quế', base: 'Muối', description: '' },
                ritualSteps: [],
                volumes: [{ size: '350g', price: 290000 }],
                themeColor: {
                  primary: '#6B4226',
                  secondary: '#F8F4EE',
                  accent: '#B85D38',
                  glow: '',
                },
                botanicalElements: ['muối'],
              },
              selectedVolume: '350g',
              price: 290000,
              quantity: 1,
            },
          ],
          subtotal: 650000,
          discountAmount: 0,
          shippingFee: 0,
          total: 650000,
          customer: {
            name: 'Nguyễn Thị Minh An',
            phone: '0912 345 678',
            email: 'khachhang@spawellness.vn',
            address: 'Biệt thự 12, Đường Hoa Lan, Quận Phú Nhuận, TP.HCM',
          },
          giftOption: {
            isGift: true,
            recipientName: 'Minh An',
            greetingMessage: 'Chúc bạn luôn có những giây phút an yên cùng hương thảo mộc.',
          },
          shippingMethod: 'express',
          paymentMethod: 'vietqr',
          status: 'BAMBOO_PACKAGING',
        },
      ],

      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.orderId === orderId);
      },

      reorder: (orderId) => {
        const order = get().getOrderById(orderId);
        return order ? order.items : [];
      },
    }),
    {
      name: 'saspa_orders_store',
      storage: createJSONStorage(createSafeStorage),
    },
  ),
);
