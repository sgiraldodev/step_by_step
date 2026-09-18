import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3103',
    trace: 'retain-on-failure',
  },
});
