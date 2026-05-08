import { defineConfig, devices } from '@playwright/test';

process.env.RESET_SECRET = process.env.RESET_SECRET ?? 'e2e-reset-secret';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `APP_ENV=test RESET_SECRET=${process.env.RESET_SECRET} npm run dev`,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
