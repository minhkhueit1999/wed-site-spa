import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.d.ts',
        'src/app/**',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/components/ui/index.ts',
        'src/infrastructure/db/prisma.ts',
        'tests/**',
      ],
      thresholds: {
        'src/domain/**': {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
        lines: 70,
        statements: 70,
        branches: 70,
        functions: 70,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'src/**/*.unit.test.ts', 'tests/unit/**/*.test.ts'],
          exclude: ['src/**/*.component.test.{ts,tsx}', 'tests/component/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          environment: 'jsdom',
          setupFiles: ['./tests/setup-component.ts'],
          include: [
            'src/**/*.component.test.{ts,tsx}',
            'tests/component/**/*.{test,spec}.{ts,tsx}',
          ],
        },
      },
    ],
  },
});
