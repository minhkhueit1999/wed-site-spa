// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SPRING_PRESETS,
  BEZIER_EASINGS,
  SHADER_PALETTES,
  getPrefersReducedMotion,
  createPointerTracker,
} from './motion';

describe('Motion & WebGL Tokens', () => {
  it('định nghĩa các cấu hình spring hợp lệ và có tính vật lý cân bằng', () => {
    expect(SPRING_PRESETS.gentle.stiffness).toBeGreaterThan(0);
    expect(SPRING_PRESETS.bouncy.damping).toBeGreaterThan(0);
    expect(SPRING_PRESETS.zen.mass).toBeGreaterThan(1);
  });

  it('định nghĩa bezier easings chuẩn điện ảnh', () => {
    expect(BEZIER_EASINGS.cinematic).toHaveLength(4);
    expect(BEZIER_EASINGS.smooth).toHaveLength(4);
  });

  it('định nghĩa bảng màu shaders chuẩn hóa trong dải [0, 1]', () => {
    Object.values(SHADER_PALETTES).forEach((color) => {
      expect(color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(color.rgb).toHaveLength(3);
      color.rgb.forEach((channel) => {
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('getPrefersReducedMotion', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('trả về false khi không có prefers-reduced-motion', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getPrefersReducedMotion()).toBe(false);
    });

    it('trả về true khi hệ thống bật prefers-reduced-motion', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getPrefersReducedMotion()).toBe(true);
    });
  });

  describe('createPointerTracker', () => {
    it('khởi tạo với tọa độ trung tâm và cho phép dọn dẹp event listener', () => {
      const tracker = createPointerTracker();
      const state = tracker.getState();
      expect(state.x).toBe(0.5);
      expect(state.y).toBe(0.5);

      expect(() => tracker.cleanup()).not.toThrow();
    });
  });
});
