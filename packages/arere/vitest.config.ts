import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        'tests/',
        '*.config.ts',
        '.are/**',
        'examples/**',
        'src/cli.ts', // CLI entry point tested via E2E
        'src/index.ts', // Library entry point
        '**/index.ts', // Re-export files
        'src/ui/App.tsx', // Main app tested via E2E
        'src/modes/ui-mode.ts', // UI mode entry point tested via E2E
        'src/ui/hooks/useActionExecution.ts', // React hook tested via component tests
        'src/ui/hooks/useConfigManagement.ts', // React hook tested via component tests
      ],
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/examples/**', '**/.are/**'],
    benchmark: {
      include: ['tests/**/*.bench.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
})
