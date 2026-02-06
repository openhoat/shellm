import type { AICommand, ConversationHistory } from '@shared/types'

/**
 * Service pur pour la logique de chat
 * Testable sans dépendance à React ou Electron
 */
export const chatService = {
  /**
   * Formate le niveau de confiance pour l'affichage
   */
  formatConfidence(confidence: number): string {
    return `${(confidence * 100).toFixed(0)}%`
  },

  /**
   * Vérifie si une commande peut être exécutée
   */
  canExecuteCommand(terminalPid: number | null): boolean {
    return terminalPid !== null
  },

  /**
   * Extrait les commandes récentes du contexte
   */
  extractRecentCommands(conversation: ConversationHistory[], limit = 5): string[] {
    return conversation
      .filter(entry => entry.aiResponse.type === 'command')
      .map(entry => (entry.aiResponse as { type: 'command'; command: string }).command)
      .slice(-limit)
  },

  /**
   * Crée une entrée d'historique
   */
  createHistoryEntry(
    userMessage: string,
    aiResponse: AICommand,
    executed: boolean = false
  ): ConversationHistory {
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      userMessage,
      aiResponse,
      executed,
    }
  },

  /**
   * Valide qu'un message n'est pas vide
   */
  isValidMessage(message: string): boolean {
    return message.trim().length > 0
  },

  /**
   * Nettoie le message utilisateur
   */
  sanitizeMessage(message: string): string {
    return message.trim()
  },

  /**
   * Formate le message d'erreur pour l'affichage
   */
  formatErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    return 'Unknown error'
  },

  /**
   * Détermine si une réponse IA contient une commande
   */
  isCommandResponse(response: AICommand): boolean {
    return response.type === 'command'
  },

  /**
   * Extrait le contenu à afficher depuis une réponse IA
   */
  extractResponseContent(response: AICommand): string {
    if (response.type === 'text') {
      return response.content
    }
    return response.explanation
  },
}
