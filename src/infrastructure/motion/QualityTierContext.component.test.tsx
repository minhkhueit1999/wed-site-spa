// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QualityTierProvider, useQualityTier } from './QualityTierContext';

function TestConsumer() {
  const { tier, mode, setMode, isWebGLSupported, reportFpsDrop } = useQualityTier();
  return (
    <div>
      <span data-testid="tier">{tier}</span>
      <span data-testid="mode">{mode}</span>
      <span data-testid="webgl">{isWebGLSupported ? 'yes' : 'no'}</span>
      <button onClick={() => setMode('reduced')}>Set Reduced</button>
      <button onClick={() => setMode('immersive')}>Set Immersive</button>
      <button onClick={() => reportFpsDrop()}>Drop FPS</button>
    </div>
  );
}

describe('QualityTierContext', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = {};
    const storageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };
    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
      writable: true,
    });
    // Mock WebGL support in jsdom
    window.WebGLRenderingContext = vi.fn() as unknown as typeof WebGLRenderingContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId: string) => {
      if (contextId === 'webgl2' || contextId === 'webgl' || contextId === 'experimental-webgl') {
        return {} as unknown as WebGLRenderingContext;
      }
      return null;
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('khởi tạo mặc định và cho phép chuyển chế độ', async () => {
    const user = userEvent.setup();

    render(
      <QualityTierProvider>
        <TestConsumer />
      </QualityTierProvider>,
    );

    expect(screen.getByTestId('mode').textContent).toBe('immersive');

    // Chuyển sang reduced (Tĩnh)
    await user.click(screen.getByText('Set Reduced'));
    expect(screen.getByTestId('mode').textContent).toBe('reduced');
    expect(screen.getByTestId('tier').textContent).toBe('1');
    expect(localStorage.getItem('spa_motion_mode')).toBe('reduced');

    // Chuyển lại immersive
    await user.click(screen.getByText('Set Immersive'));
    expect(screen.getByTestId('mode').textContent).toBe('immersive');
  });

  it('tự hạ cấp tier khi reportFpsDrop được kích hoạt', async () => {
    const user = userEvent.setup();

    render(
      <QualityTierProvider>
        <TestConsumer />
      </QualityTierProvider>,
    );

    // Kích hoạt hạ cấp khi FPS thấp
    await user.click(screen.getByText('Drop FPS'));
    // Nếu ban đầu là 3 thì xuống 2, hoặc từ 2 xuống 1
    const currentTier = parseInt(screen.getByTestId('tier').textContent || '0', 10);
    expect(currentTier).toBeLessThanOrEqual(2);
  });
});
