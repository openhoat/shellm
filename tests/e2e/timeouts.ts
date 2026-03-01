/**
 * Centralized timeout constants for E2E tests
 * This file provides a single source of truth for all timeouts used in tests
 */

/**
 * Timeout values in milliseconds
 */
export const TIMEOUTS = {
  /** Short timeout for quick operations (5 seconds) */
  short: 5000,

  /** Standard timeout for most operations (10 seconds) */
  standard: 10000,

  /** Long timeout for complex operations (30 seconds) */
  long: 30000,

  /** Timeout for AI response operations (30 seconds) */
  aiResponse: 30000,

  /** Timeout for terminal initialization (15 seconds) */
  terminalInit: 15000,

  /** Timeout for connection test operations (15 seconds) */
  connectionTest: 15000,

  /** Timeout for command execution (60 seconds) */
  commandExecution: 60000,

  /** Minimal delay for UI updates (100ms) */
  minimalDelay: 100,

  /** Brief delay for settling (200ms) */
  briefDelay: 200,

  /** Short delay for input/typing (500ms) */
  shortDelay: 500,

  /** Medium delay for state transitions (1000ms) */
  mediumDelay: 1000,
} as const

/**
 * Default timeout for Playwright operations
 */
export const DEFAULT_TIMEOUT = TIMEOUTS.standard

/**
 * Timeout for app launch and initialization
 */
export const APP_LAUNCH_TIMEOUT = TIMEOUTS.terminalInit

/**
 * Timeout for page load state
 */
export const PAGE_LOAD_TIMEOUT = TIMEOUTS.terminalInit

/**
 * Timeout for selector visibility checks
 */
export const VISIBILITY_TIMEOUT = TIMEOUTS.short
