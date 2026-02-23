/**
 * Dangerous command blacklist patterns
 * These patterns match commands that could be destructive or harmful
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
 * Checks if a command is dangerous based on the blacklist patterns
 * @param command - The command string to check
 * @returns An object indicating if the command is dangerous and the reason
 */
export function isCommandDangerous(command: string): { dangerous: boolean; reason?: string } {
  const trimmedCommand = command.trim()

  for (const pattern of DANGEROUS_COMMAND_PATTERNS) {
    if (pattern.test(trimmedCommand)) {
      return {
        dangerous: true,
        reason: 'Command matches dangerous pattern',
      }
    }
  }

  // Check for sudo with destructive commands
  if (/^sudo\s+/i.test(trimmedCommand)) {
    const sudoCommand = trimmedCommand.substring(5).trim()
    for (const pattern of DANGEROUS_COMMAND_PATTERNS) {
      if (pattern.test(sudoCommand)) {
        return {
          dangerous: true,
          reason: 'Sudo command with destructive pattern',
        }
      }
    }
  }

  return { dangerous: false }
}
