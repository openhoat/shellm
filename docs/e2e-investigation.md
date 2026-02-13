# E2E Test Framework Investigation

## Current State

The project currently uses:
- **Vitest** for unit testing
- **@testing-library/react** for component testing
- **happy-dom** as the DOM environment

No E2E test framework is currently installed.

## E2E Test Framework Options for Electron Applications

### 1. Playwright (Recommended)

**Pros:**
- Native Electron support via `playwright-electron`
- Excellent TypeScript support
- Cross-platform testing (Windows, macOS, Linux)
- Built-in test runner and reporter
- Automatic waiting and retry mechanisms
- Good documentation and community
- Supports multiple browsers (for web testing if needed)

**Cons:**
- Larger dependency size
- Learning curve for team unfamiliar with Playwright

**Setup:**
```bash
npm install -D @playwright/test playwright-electron
```

**Example test:**
```typescript
import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright-electron'

test('launches application', async () => {
  const electronApp = await electron.launch({ args: ['.'] })
  const window = await electronApp.firstWindow()
  await expect(window).toHaveTitle('SheLLM')
  await electronApp.close()
})
```

### 2. Cypress

**Pros:**
- Very popular and widely adopted
- Excellent test runner UI
- Time travel debugging
- Good documentation and community

**Cons:**
- Electron support is less direct (requires `cypress-electron` plugin)
- Can be slower than Playwright
- More complex setup for Electron

**Setup:**
```bash
npm install -D cypress @cypress/electron
```

### 3. Vitest with Electron Launcher (Alternative)

**Pros:**
- Consistent with existing test setup (already using Vitest)
- Smaller learning curve for the team
- Can leverage existing Vitest configuration

**Cons:**
- Less mature for E2E testing
- Limited E2E-specific features compared to Playwright/Cypress
- May require more custom code for full E2E scenarios

**Setup:**
Would require custom Electron launcher for Vitest.

## Recommendation

**Playwright** is recommended for this project because:

1. **Native Electron Support**: Direct integration without plugins
2. **TypeScript-First**: Excellent TS support matches the project stack
3. **Modern API**: Clean and intuitive API
4. **Cross-Platform**: Essential for an Electron app that targets multiple OS
5. **Documentation**: Excellent documentation and examples

## Next Steps

If Playwright is chosen:

1. Install dependencies:
   ```bash
   npm install -D @playwright/test playwright-electron
   ```

2. Create Playwright configuration (`playwright.config.ts`)

3. Create E2E test directory structure:
   ```
   e2e/
     ├── basic.spec.ts
     ├── chat.spec.ts
     └── terminal.spec.ts
   ```

4. Add E2E test script to package.json:
   ```json
   "test:e2e": "playwright test",
   "test:e2e:ui": "playwright test --ui"
   ```

5. Implement basic smoke tests for:
   - Application launch
   - Chat panel interaction
   - Terminal functionality
   - Settings/configuration

## Test Scenarios to Cover

### Smoke Tests
- Application launches successfully
- Main window renders
- No console errors on startup

### Chat Functionality
- Send a message to AI
- Execute a generated command
- Clear conversation history

### Terminal Integration
- Terminal panel displays output
- Terminal resize works
- Terminal capture functionality

### Configuration
- Settings panel opens
- Configuration changes persist
- Ollama connection test

## CI/CD Considerations

- E2E tests can run in headless mode on CI
- May require display server (Xvfb on Linux)
- Parallel test execution supported by Playwright
- Video recording and screenshots on failure