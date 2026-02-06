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
}

/**
 * Exécute une commande dans le terminal avec un mécanisme de retry
 */
export async function executeCommand({
  command,
  terminalPid,
  maxRetries = 20,
  retryDelay = 500,
}: ExecuteCommandOptions): Promise<ExecuteCommandResult> {
  // Wait for terminal to be ready with retry mechanism
  let retries = 0

  while (!terminalPid && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, retryDelay))
    retries++
  }

  if (!terminalPid) {
    return {
      success: false,
      error: "Le terminal n'est pas prêt. Veuillez réinitialiser l'application.",
    }
  }

  try {
    await window.electronAPI.terminalWrite(terminalPid, `${command}\r`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Erreur lors de l'exécution: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    }
  }
}

/**
 * Vérifie si une commande peut être exécutée
 */
export function canExecuteCommand(terminalPid: number | null): boolean {
  return terminalPid !== null
}

/**
 * Retourne le texte du bouton d'exécution
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
}
