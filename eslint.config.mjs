import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**', 'dist/**']),
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/app/**',
                '@/infrastructure/**',
                '@/components/**',
                'next',
                'next/**',
                'react',
                'react/**',
                '@prisma/client',
                '@prisma/**',
              ],
              message:
                'Domain layer must be pure and must not depend on app, components, infrastructure, Next.js, React, or Prisma.',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
