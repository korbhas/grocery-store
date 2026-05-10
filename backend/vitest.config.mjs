import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    deps: {
      interopDefault: true,
    },
    globals: true,
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
