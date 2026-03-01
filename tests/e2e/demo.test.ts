import { mkdirSync } from 'node:fs'
import path from 'node:path'
import type { ElectronApplication, Page } from '@playwright/test'
import { test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickExecuteButton,
  resetAppState,
  waitForAIResponse,
  waitForCommandActions,
  waitForTerminalReady,
} from './helpers'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

let app: ElectronApplication
let page: Page

const FRAME_DIR = path.resolve('dist', 'test-results', 'demo-frames')
const FRAME_INTERVAL_MS = 100 // 10 fps

let frameCounter = 0
let captureTimer: ReturnType<typeof setInterval> | null = null

/** Start capturing screenshots at a fixed interval. */
function startFrameCapture(target: Page) {
  frameCounter = 0
  mkdirSync(FRAME_DIR, { recursive: true })
  captureTimer = setInterval(() => {
    const idx = String(frameCounter++).padStart(5, '0')
    target.screenshot({ path: path.join(FRAME_DIR, `frame-${idx}.png`) }).catch(() => {
      // Ignore screenshot errors during capture (page may be navigating)
    })
  }, FRAME_INTERVAL_MS)
}

/** Stop capturing and flush one last frame. */
async function stopFrameCapture(target: Page) {
  if (captureTimer) {
    clearInterval(captureTimer)
    captureTimer = null
  }
  const idx = String(frameCounter++).padStart(5, '0')
  await target.screenshot({ path: path.join(FRAME_DIR, `frame-${idx}.png`) }).catch(() => {
    // Ignore screenshot errors during capture (page may be navigating)
  })
}

/**
 * Type text character by character with realistic human-like timing.
 * ~65 WPM with random jitter and word-boundary pauses.
 */
async function humanType(target: Page, locator: ReturnType<Page['locator']>, text: string) {
  for (const char of text) {
    await locator.press(char)
    const jitter = Math.floor(Math.random() * 80) - 40
    const wordPause = char === ' ' ? 60 : 0
    await target.waitForTimeout(90 + jitter + wordPause)
  }
}

/**
 * Demo test — generates screenshot frames that the shell script
 * assembles into an animated GIF.
 */
test.describe('Termaid Demo', () => {
  test.beforeAll(async () => {
    const result = await launchElectronApp({
      locale: 'en',
      mocks: {
        aiCommand: [
          {
            type: 'command',
            intent: 'show_disk_space',
            command: 'df -h',
            explanation: 'Display available disk space on all filesystems',
            confidence: 0.95,
          },
          {
            type: 'command',
            intent: 'show_system_info',
            command: 'uname -a && uptime',
            explanation: 'Show system kernel info and uptime',
            confidence: 0.93,
          },
        ],
        interpretation: [
          {
            summary: 'Command executed successfully',
            key_findings: [
              'Root filesystem at 35% capacity (297G available)',
              'Shared memory usage is minimal (38M)',
            ],
            warnings: [],
            errors: [],
            recommendations: ['Disk space is healthy, no action needed'],
            successful: true,
          },
          {
            summary: 'System information retrieved successfully',
            key_findings: ['Running Linux kernel 6.18.9', 'System uptime: 3 days, 7 hours'],
            warnings: [],
            errors: [],
            recommendations: ['System is running smoothly, no issues detected'],
            successful: true,
          },
        ],
        commandExecution: [
          {
            output:
              'Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p3  477G  156G  297G  35% /\ntmpfs           7.8G   38M  7.7G   1% /dev/shm',
            exitCode: 0,
          },
          {
            output:
              'Linux hostname 6.18.9-200.fc43.x86_64 #1 SMP x86_64 GNU/Linux\n 16:30:42 up 3 days,  7:14,  2 users,  load average: 0.52, 0.38, 0.41',
            exitCode: 0,
          },
        ],
      },
    })
    app = result.app
    page = result.page

    await waitForAppReady(page)
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test.afterAll(async () => {
    await closeElectronApp(app)
  })

  test.beforeEach(async () => {
    await resetAppState(page)
  })

  test('should demonstrate Termaid features', { timeout: 90000 }, async () => {
    await waitForTerminalReady(page)

    // Begin frame capture
    startFrameCapture(page)

    // Show the app at rest
    await page.waitForTimeout(1500)

    // Focus the chat input
    const chatInput = page.locator(SELECTORS.chatInput)
    await chatInput.focus()
    await page.waitForTimeout(600)

    // Type like a real user
    await humanType(page, chatInput, 'Show disk space')
    await page.waitForTimeout(350)

    // Submit
    await chatInput.press('Enter')

    // Wait for AI response
    await waitForAIResponse(page, TIMEOUTS.aiResponse)

    // Wait for command actions to appear (needed with LLM streaming)
    await waitForCommandActions(page, TIMEOUTS.connectionTest)

    // Let the viewer read the command proposal
    await page.waitForTimeout(3000)

    // Execute
    await clickExecuteButton(page)

    // Wait for the interpretation result to appear
    await page.waitForSelector(SELECTORS.commandInterpretation, {
      state: 'visible',
      timeout: TIMEOUTS.connectionTest,
    })

    // Let the viewer read the interpretation result
    await page.waitForTimeout(4000)

    // --- Second command ---

    // Focus the chat input again
    const chatInput2 = page.locator(SELECTORS.chatInput)
    await chatInput2.focus()
    await page.waitForTimeout(400)

    // Type second query
    await humanType(page, chatInput2, 'Show system info')
    await page.waitForTimeout(350)

    // Submit
    await chatInput2.press('Enter')

    // Wait for AI response
    await waitForAIResponse(page, TIMEOUTS.aiResponse)

    // Let the viewer read the command proposal
    await page.waitForTimeout(3000)

    // Execute second command
    await clickExecuteButton(page)

    // Wait for the second interpretation
    const interpretations = page.locator(SELECTORS.commandInterpretation)
    await interpretations.nth(1).waitFor({ state: 'visible', timeout: TIMEOUTS.connectionTest })

    // Let the viewer read the final result
    await page.waitForTimeout(5000)

    // Stop frame capture
    await stopFrameCapture(page)
  })
})
