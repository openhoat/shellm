/**
 * Dangerous command detection - deprecated in favor of commandValidation
 * This file re-exports the new validation service for backward compatibility
 */

import { validateCommand } from './commandValidation.js'

// Re-export from commandValidation for backward compatibility
export { type RiskLevel, type ValidationResult, validateCommand } from './commandValidation.js'

/**
 * Legacy patterns - kept for reference
 * @deprecated Use validateCommand from commandValidation instead
 */
export const DANGEROUS_COMMAND_PATTERNS = [
  // File deletion
  /^rm\s+-rf?\s+\/$/i,
  /^rm\s+-rf?\s+\/\w/i,
  /^dd\s+.*\s+of=\/dev\/(sda|hda|vda|sd|hd|vd)/i,
  /^mkfs\./i,
  /^mkfs\s+/i,
  /^format\s/i,
  // System destruction
  /^:(){:|:&};:/, // Fork bomb
  /^shutdown/i,
  /^poweroff/i,
  /^reboot/i,
  // Disk operations
  /^wipefs\s+/i,
  /^shred\s+/i,
  // Kernel operations
  /^rmmod\s+/i,
  /^modprobe\s+-r\s+/i,
]

/**
 * Checks if a command is dangerous
 * @deprecated Use validateCommand from commandValidation for detailed risk assessment
 * @param command - The command string to check
 * @returns An object indicating if the command is dangerous and the reason
 */
export function isCommandDangerous(command: string): { dangerous: boolean; reason?: string } {
  const result = validateCommand(command)

  return {
    dangerous: result.blocked || result.riskLevel === 'dangerous',
    reason: result.reason,
  }
}
