import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Electron tests should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Electron tests must run in a single worker
  reporter: [['html'], ['list']],
  timeout: 120000,
  use: {
    trace: 'on-first-retry',
    // Disable visual captures in CI mode for headless execution
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    video: process.env.CI ? 'off' : 'retain-on-failure',
  },
  expect: {
    timeout: 10000,
  },
})
