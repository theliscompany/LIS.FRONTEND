import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../../src'),
      '@features': path.resolve(__dirname, '../../../src/features'),
      '@utils': path.resolve(__dirname, '../../../src/utils'),
      '@components': path.resolve(__dirname, '../../../src/components'),
    },
  },
});
