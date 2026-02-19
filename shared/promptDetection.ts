/**
 * Shell prompt detection utilities
 * Used to detect when a command has finished executing by identifying the shell prompt
 */

import { stripAnsiCodes, stripOscSequences } from './ansi'

/**
 * Common shell prompt patterns
 * These patterns match various shell prompts to detect command completion
 */
const PROMPT_PATTERNS = [
  // Bash/sh default prompt: ends with $ or #
  /\$ $/,
  /# $/,
  // Zsh default prompt: ends with % or special characters
  /% $/,
  // Zsh with Powerline/Oh My Zsh: ends with special arrow characters
  /\u276F /, // ❯
  /\u276E /, // ❮
  // Fish shell
  /> $/,
  // Generic patterns: user@host:directory$ or user@host:directory#
  /[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+:[^$#]*[$#] $/,
  // Prompt with directory: ~/directory$ or /path/directory$
  /~\/[^$#]*[$#] $/,
  /\/[^$#]*[$#] $/,
  // Simple prompts with just $ or # at end of line
  /[$#] $/,
]

/**
 * Configuration options for prompt detection
 */
export interface PromptDetectionConfig {
  /** Maximum time to wait for prompt detection (ms) */
  maxWaitTimeMs: number
  /** Interval between prompt checks (ms) */
  checkIntervalMs: number
  /** Minimum time to wait before checking for prompt (ms) */
  minWaitTimeMs: number
  /** Additional custom prompt patterns (regex strings) */
  customPatterns?: string[]
}

/**
 * Default configuration for prompt detection
 */
export const DEFAULT_PROMPT_DETECTION_CONFIG: PromptDetectionConfig = {
  maxWaitTimeMs: 30000, // 30 seconds maximum (for long-running commands)
  checkIntervalMs: 100, // Check every 100ms
  minWaitTimeMs: 200, // Minimum 200ms before checking (allow command to start)
}

/**
 * Clean terminal output by removing ANSI codes and OSC sequences
 * @param output - Raw terminal output
 * @returns Cleaned output ready for prompt detection
 */
export function cleanTerminalOutput(output: string): string {
  let cleaned = stripAnsiCodes(output)
  cleaned = stripOscSequences(cleaned)
  // Remove carriage returns and normalize line endings
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  // Remove control characters except newline (0x0A)
  // Using character codes to avoid regex control character warning
  const controlCharsRegex = new RegExp(
    `[${String.fromCodePoint(0)}-${String.fromCodePoint(9)}${String.fromCodePoint(11)}-${String.fromCodePoint(31)}${String.fromCodePoint(127)}]`,
    'g'
  )
  cleaned = cleaned.replace(controlCharsRegex, '')
  return cleaned
}

/**
 * Check if output contains a shell prompt at the end
 * @param output - The terminal output to check
 * @param customPatterns - Optional custom prompt patterns to use
 * @returns True if a prompt is detected at the end of the output
 */
export function detectPrompt(output: string, customPatterns?: string[]): boolean {
  const cleanedOutput = cleanTerminalOutput(output)

  // Get the last few lines for prompt detection
  const lines = cleanedOutput.split('\n')
  const lastLines = lines.slice(-3).join('\n')

  // Check all prompt patterns
  const patterns = [...PROMPT_PATTERNS]

  // Add custom patterns if provided
  if (customPatterns) {
    for (const pattern of customPatterns) {
      try {
        patterns.push(new RegExp(pattern))
      } catch {
        // Ignore invalid regex patterns
      }
    }
  }

  for (const pattern of patterns) {
    if (pattern.test(lastLines) || pattern.test(cleanedOutput)) {
      return true
    }
  }

  return false
}

/**
 * Extract the prompt from terminal output
 * This can be used to learn the user's prompt pattern for better detection
 * @param output - The terminal output to extract prompt from
 * @returns The detected prompt string or null if not found
 */
export function extractPrompt(output: string): string | null {
  const cleanedOutput = cleanTerminalOutput(output)
  const lines = cleanedOutput.split('\n')

  // Look at the last line for a prompt
  const lastLine = lines[lines.length - 1]?.trim() || ''

  // Common prompt endings
  const promptEndings = ['$', '#', '%', '>']
  const specialPromptChars = ['\u276F', '\u276E'] // ❯, ❮

  // Check if last line looks like a prompt
  for (const ending of promptEndings) {
    if (lastLine.endsWith(ending)) {
      return lastLine
    }
  }

  for (const char of specialPromptChars) {
    if (lastLine.includes(char)) {
      return lastLine
    }
  }

  return null
}

/**
 * Create a regex pattern from a detected prompt
 * @param prompt - The prompt string to create a pattern from
 * @returns A regex pattern string for matching the prompt
 */
export function createPromptPattern(prompt: string): string {
  // Escape special regex characters except the ending $ or #
  let escaped = prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Ensure it matches at end of line
  if (!escaped.endsWith('\\$') && !escaped.endsWith('\\#')) {
    escaped += '$'
  }
  return escaped
}

/**
 * Wait for a shell prompt to appear in the output
 * This function polls the output buffer until a prompt is detected or timeout
 * @param getOutput - Function to get the current output buffer
 * @param config - Configuration options
 * @returns Promise that resolves when prompt is detected or timeout occurs
 */
export async function waitForPrompt(
  getOutput: () => string,
  config: Partial<PromptDetectionConfig> = {}
): Promise<{ detected: boolean; output: string; timedOut: boolean }> {
  const finalConfig = { ...DEFAULT_PROMPT_DETECTION_CONFIG, ...config }
  const startTime = Date.now()
  let lastOutputLength = 0
  let stableCount = 0

  // Wait minimum time before checking
  await new Promise(resolve => setTimeout(resolve, finalConfig.minWaitTimeMs))

  while (Date.now() - startTime < finalConfig.maxWaitTimeMs) {
    const output = getOutput()
    const cleanedOutput = cleanTerminalOutput(output)

    // Check if prompt is detected
    if (detectPrompt(output, finalConfig.customPatterns)) {
      return { detected: true, output, timedOut: false }
    }

    // Check if output has stabilized (no new output for a while)
    if (cleanedOutput.length === lastOutputLength) {
      stableCount++
      // If output has been stable for 500ms (5 checks at 100ms), consider it done
      if (stableCount >= 5 && cleanedOutput.length > 0) {
        return { detected: true, output, timedOut: false }
      }
    } else {
      stableCount = 0
    }
    lastOutputLength = cleanedOutput.length

    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, finalConfig.checkIntervalMs))
  }

  // Timeout occurred, return current output
  return { detected: false, output: getOutput(), timedOut: true }
}
