import type { ConversationHistory } from '@shared/types'
import { chatService } from './chatService'

export interface ExecuteCommandOptions {
  command: string
  terminalPid: number | null
  maxRetries?: number
  retryDelay?: number
}

export interface ExecuteCommandResult {
  success: boolean
  error?: string
  blocked?: boolean
}

/**
 * Dangerous command blacklist patterns
 * These patterns match commands that could be destructive or harmful
 */
const DANGEROUS_COMMAND_PATTERNS = [
  // File deletion
  /^rm\s+-rf?\s+\/$/,
  /^rm\s+-rf?\s+\/\w/,
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
 * Character patterns that could indicate command injection
 */
const INJECTION_PATTERNS = [
  /[;&|`$]/, // Shell metacharacters
  /\$\(/, // Command substitution
  /\${/, // Variable expansion
  /`[^`]*`/, // Backtick command substitution
  /\\n/i, // Newline
  /\\r/i, // Carriage return
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

/**
 * Sanitizes user input to prevent command injection
 * Removes or escapes dangerous shell metacharacters
 * @param input - The user input to sanitize
 * @returns The sanitized input string
 */
export function sanitizeUserInput(input: string): string {
  // Remove command injection characters - order matters for && to be handled first
  let sanitized = input
    .replace(/;/g, '')
    .replace(/&&/g, '')
    .replace(/\|/g, '')
    .replace(/`/g, '')
    .replace(/\$\([^)]*\)/g, '') // Remove $(...)
    .replace(/\${[^}]*}/g, '') // Remove ${...}
    .replace(/\\[nr]/gi, '')
    .trim()
  // Handle cases where parentheses remain (from partially removed patterns)
  sanitized = sanitized.replace(/[()]/g, '')
  // Handle cases where braces remain (from partially removed patterns)
  sanitized = sanitized.replace(/[{}]/g, '')
  // Handle remaining ampersands
  sanitized = sanitized.replace(/&/g, '')
  // Handle remaining dollar signs
  sanitized = sanitized.replace(/\$/g, '')
  return sanitized
}

/**
 * Checks if user input contains potential command injection patterns
 * @param input - The user input to check for injection patterns
 * @returns An object indicating if injection patterns were found and which patterns
 */
export function hasInjectionPatterns(input: string): { hasInjection: boolean; patterns: string[] } {
  const foundPatterns: string[] = []

  for (const pattern of INJECTION_PATTERNS) {
    const match = input.match(pattern)
    if (match) {
      foundPatterns.push(match[0])
    }
  }

  return {
    hasInjection: foundPatterns.length > 0,
    patterns: foundPatterns,
  }
}

/**
 * Executes a command in the terminal with a retry mechanism
 * @param options - The execution options including command, terminal PID, and retry settings
 * @returns A promise resolving to the execution result with success status and any error
 */
export async function executeCommand({
  command,
  terminalPid,
  maxRetries = 20,
  retryDelay = 500,
}: ExecuteCommandOptions): Promise<ExecuteCommandResult> {
  // Check if command is dangerous before executing
  const dangerCheck = isCommandDangerous(command)
  if (dangerCheck.dangerous) {
    return {
      success: false,
      blocked: true,
      error: `Commande bloquée pour sécurité: ${dangerCheck.reason}`,
    }
  }

  // Wait for terminal to be ready with retry mechanism
  let retries = 0

  while (!terminalPid && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, retryDelay))
    retries++
  }

  if (!terminalPid) {
    return {
      success: false,
      blocked: false,
      error: "Le terminal n'est pas prêt. Veuillez réinitialiser l'application.",
    }
  }

  try {
    await window.electronAPI.terminalWrite(terminalPid, `${command}\r`)
    return { success: true, blocked: false }
  } catch (error) {
    return {
      success: false,
      blocked: false,
      error: `Erreur lors de l'exécution: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    }
  }
}

/**
 * Checks if a command can be executed
 * @param terminalPid - The terminal process ID to check
 * @returns True if a terminal PID exists and command can be executed
 */
export function canExecuteCommand(terminalPid: number | null): boolean {
  return terminalPid !== null
}

/**
 * Returns the text for the execute button based on terminal readiness
 * @param terminalPid - The terminal process ID, or null if not ready
 * @returns The button text to display
 */
export function getExecuteButtonText(terminalPid: number | null): string {
  return !terminalPid ? 'Préparation...' : 'Exécuter'
}

/**
 * Retourne le tooltip du bouton d'exécution
 */
export function getExecuteButtonTooltip(terminalPid: number | null): string {
  return !terminalPid ? "Le terminal n'est pas encore prêt" : 'Exécuter la commande'
}

/**
 * Extrait les commandes récentes de la conversation pour le contexte
 */
export function extractRecentCommands(
  conversation: Array<{ type: 'user' | 'ai'; content: string; command?: { command: string } }>,
  limit = 5
): string[] {
  const commands = conversation
    .filter(msg => msg.type === 'ai' && msg.command?.command)
    .map(msg => msg.command?.command)
    .filter((cmd): cmd is string => cmd !== undefined)

  return commands.slice(-limit)
}

/**
 * Crée une entrée d'historique à partir de la conversation courante
 */
export function createHistoryEntryFromConversation(
  conversation: Array<{
    type: 'user' | 'ai'
    content: string
    command?: { command: string }
  }>
): Omit<ConversationHistory, 'id' | 'timestamp'> | null {
  const lastEntry = conversation[conversation.length - 1]
  const previousEntry = conversation[conversation.length - 2]

  if (!lastEntry?.command || !previousEntry) {
    return null
  }

  return {
    userMessage: previousEntry.content,
    aiResponse: {
      type: 'command',
      intent: 'unknown',
      command: lastEntry.command.command,
      explanation: '',
      confidence: 0,
    },
    executed: true,
  }
}

/**
 * Formate le score de confiance en pourcentage
 */
export function formatConfidence(confidence: number): string {
  return chatService.formatConfidence(confidence)
}

export const commandExecutionService = {
  executeCommand,
  canExecuteCommand,
  getExecuteButtonText,
  getExecuteButtonTooltip,
  extractRecentCommands,
  createHistoryEntryFromConversation,
  formatConfidence,
  isCommandDangerous,
  sanitizeUserInput,
  hasInjectionPatterns,
}
