import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: { viewport: { width: 1440, height: 900 }, baseURL: 'http://127.0.0.1:3000' },
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
