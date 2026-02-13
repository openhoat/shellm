# E2E Tests

This directory contains end-to-end tests for the SheLLM Electron application using Playwright.

## Prerequisites

- Node.js 22+
- The application must be built before running E2E tests

## Running Tests

### Run all E2E tests

```bash
npm run test:e2e
```

### Run tests with UI

```bash
npm run test:e2e:ui
```

### Run tests in debug mode

```bash
npm run test:e2e:debug
```

### Run tests in headless mode (CI/Linux)

For CI environments or headless Linux servers, use Xvfb:

```bash
npm run test:e2e:headless
```

This uses `xvfb-run` to create a virtual display. Install Xvfb on Ubuntu/Debian:

```bash
sudo apt-get install xvfb
```

### Run specific test file

```bash
npx playwright test smoke.test.ts
```

### Run tests in headed mode

```bash
npx playwright test --headed
```

## Test Structure

```
tests/e2e/
├── electron-app.ts    # Helper functions for Electron app testing
├── fixtures.ts        # Playwright test fixtures
├── smoke.test.ts      # Basic smoke tests
└── README.md          # This file
```

## Writing Tests

### Using Fixtures

The recommended way to write tests is using the custom fixtures:

```typescript
import { expect, test } from './fixtures'

test('should display the header', async ({ page }) => {
  await expect(page.locator('.header')).toBeVisible()
})
```

### Manual App Launch

For more control, use the helper functions directly:

```typescript
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'

test('my test', async () => {
  const { app, page } = await launchElectronApp()

  try {
    await waitForAppReady(page)
    // Test code here
  } finally {
    await closeElectronApp(app)
  }
})
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root.

Key settings:
- Tests run sequentially (workers: 1) due to Electron limitations
- Traces saved on retry
- Screenshots on failure
- Videos retained on failure

## Debugging

### View Playwright Report

```bash
npx playwright show-report
```

### Debug Mode

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector for step-by-step debugging.

## CI Integration

For CI environments, the tests will:
- Run with 2 retries
- Generate HTML reports
- Upload traces on failure

## Notes

- E2E tests require a display (X11 on Linux, or headless mode)
- The Electron app is built automatically if `dist-electron/` doesn't exist
- Each test runs in isolation with a fresh app instance