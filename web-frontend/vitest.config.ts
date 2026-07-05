// This file configures Vitest to run tests with reduced memory usage

import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
      },
    },
    setupFiles: ["__tests__/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "__tests__/setup.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/dist/**",
        "**/build/**",
      ],
    },
    include: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    // Optimize for memory usage
    pool: "forks", // Use process isolation
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
    // Disable watch mode by default
    watch: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
