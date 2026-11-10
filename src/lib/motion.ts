/**
 * Hệ thống Token & Tiện ích Chuyển động (Motion & WebGL Tokens)
 * Đồng bộ với bảng màu thiết kế trong docs/design-system.md
 */

export const SPRING_PRESETS = {
  /** Phản hồi mềm mại, thanh lịch cho hover, modal, dropdown */
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  /** Phản hồi đàn hồi tự nhiên cho huy hiệu, hạt tương tác */
  bouncy: { stiffness: 260, damping: 20, mass: 1 },
  /** Nhịp thiền định đầm chắc cho nhịp thở, chuyển đổi trang lớn */
  zen: { stiffness: 60, damping: 18, mass: 1.2 },
  /** Xúc giác cơ học nhẹ cho nút bấm từ tính */
  tactile: { stiffness: 350, damping: 25, mass: 0.8 },
} as const;

export const BEZIER_EASINGS = {
  /** Đường cong điện ảnh mượt mà cấp độ Awwwards */
  cinematic: [0.16, 1, 0.3, 1] as const,
  /** Đường cong chuẩn cho các tương tác micro */
  smooth: [0.25, 1, 0.5, 1] as const,
  /** Đường cong mềm cho fade & zoom */
  soft: [0.4, 0, 0.2, 1] as const,
} as const;

export const DURATION_TOKENS = {
  instant: 0.15,
  standard: 0.3,
  deliberate: 0.6,
  ceremony: 1.2,
} as const;

/**
 * Bảng màu chuẩn hóa cho WebGL Shaders (RGB 0..1)
 * Đồng bộ tuyệt đối với CSS Variables trong globals.css
 */
export const SHADER_PALETTES = {
  sageGreen: {
    hex: '#405C4E',
    rgb: [0.251, 0.361, 0.306] as const,
  },
  sageLight: {
    hex: '#5B7B6A',
    rgb: [0.357, 0.482, 0.416] as const,
  },
  warmIvory: {
    hex: '#FAF7F2',
    rgb: [0.98, 0.969, 0.949] as const,
  },
  warmCream: {
    hex: '#F3EDE3',
    rgb: [0.953, 0.929, 0.89] as const,
  },
  terracotta: {
    hex: '#B8714F',
    rgb: [0.722, 0.443, 0.31] as const,
  },
  deepCharcoal: {
    hex: '#2B2622',
    rgb: [0.169, 0.149, 0.133] as const,
  },
  softStone: {
    hex: '#E2D9CC',
    rgb: [0.886, 0.851, 0.8] as const,
  },
  amberGlow: {
    hex: '#D99B4B',
    rgb: [0.851, 0.608, 0.294] as const,
  },
} as const;

/**
 * Kiểm tra xem thiết bị của người dùng có yêu cầu giảm chuyển động không
 */
export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Trình theo dõi tọa độ và vận tốc con trỏ toàn cục mượt mà
 */
export interface PointerVelocityState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

export function createPointerTracker(onUpdate?: (state: PointerVelocityState) => void): {
  getState: () => PointerVelocityState;
  cleanup: () => void;
} {
  const state: PointerVelocityState = {
    x: 0.5,
    y: 0.5,
    vx: 0,
    vy: 0,
    speed: 0,
  };

  let lastX = 0.5;
  let lastY = 0.5;
  let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    const clientX =
      'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY =
      'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;

    const nx = Math.max(0, Math.min(1, clientX / width));
    const ny = Math.max(0, Math.min(1, clientY / height));

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const dt = Math.max(1, now - lastTime);

    const vx = ((nx - lastX) / dt) * 1000;
    const vy = ((ny - lastY) / dt) * 1000;
    const speed = Math.sqrt(vx * vx + vy * vy);

    state.x = nx;
    state.y = ny;
    state.vx = vx;
    state.vy = vy;
    state.speed = speed;

    lastX = nx;
    lastY = ny;
    lastTime = now;

    onUpdate?.(state);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
  }

  return {
    getState: () => ({ ...state }),
    cleanup: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('touchmove', handlePointerMove);
      }
    },
  };
}
