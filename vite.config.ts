import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ntsb-investigator/',
  test: {
    environment: 'jsdom',
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['src/engine/**'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage',
    },
  },
});
