// This file configures Vitest to run tests with reduced memory usage
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup-enhanced.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/setup-enhanced.ts']
    },
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    // Optimize for memory usage
    pool: 'forks', // Use process isolation
    poolOptions: {
      forks: {
        singleFork: true, // Run in a single process
      },
    },
    // Reduce memory usage
    maxConcurrency: 1,
    minThreads: 1,
    maxThreads: 1,
    isolate: false,
    // Timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,
    // Disable watch mode
    watch: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
