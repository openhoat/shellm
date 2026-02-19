/**
 * ANSI and OSC sequence stripping utilities
 * Used to clean terminal output from escape sequences
 */

/**
 * Strip ANSI escape codes from a string
 * @param str - The input string containing ANSI codes
 * @returns The string with ANSI codes removed
 */
export function stripAnsiCodes(str: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI codes require control characters
  const ansiRegex = /\x1B\[[0-9;]*[mGKH]/g
  return str.replace(ansiRegex, '')
}

/**
 * Strip OSC (Operating System Command) sequences from a string
 * @param str - The input string containing OSC sequences
 * @returns The string with OSC sequences removed
 */
export function stripOscSequences(str: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: OSC codes require control characters
  const oscRegex = /\x1B\][^\x07]*(?:\x07|\x1B\\)/g
  return str.replace(oscRegex, '')
}
