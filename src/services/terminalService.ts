/**
 * Service pur pour la logique liée au terminal
 * Testable sans dépendance à React ou Electron
 */
export const terminalService = {
  /**
   * Valide que le terminal est prêt pour exécuter une commande
   */
  validateTerminal(terminalPid: number | null): {
    valid: boolean
    error: string | null
  } {
    if (!terminalPid) {
      return {
        valid: false,
        error: "Le terminal n'est pas prêt. Veuillez réessayer dans quelques secondes.",
      }
    }
    return { valid: true, error: null }
  },

  /**
   * Formate une commande pour l'écriture dans le terminal
   */
  formatCommandForTerminal(command: string): string {
    return `${command}\r`
  },

  /**
   * Nettoie une commande en retirant les espaces superflus
   */
  sanitizeCommand(command: string): string {
    return command.trim()
  },

  /**
   * Vérifie qu'une commande n'est pas vide
   */
  isValidCommand(command: string): boolean {
    return command.trim().length > 0
  },

  /**
   * Vérifie si une commande doit être exécutée (pas en cours de chargement)
   */
  canExecuteCommand(terminalPid: number | null, isLoading: boolean): boolean {
    return !!terminalPid && !isLoading
  },

  /**
   * Formate le texte du bouton d'exécution selon l'état du terminal
   */
  getExecuteButtonText(terminalPid: number | null): string {
    return terminalPid ? 'Exécuter' : 'Préparation...'
  },

  /**
   * Formate le tooltip du bouton d'exécution
   */
  getExecuteButtonTooltip(terminalPid: number | null): string {
    return terminalPid ? 'Exécuter la commande' : "Le terminal n'est pas encore prêt"
  },

  /**
   * Vérifie si une commande est sûre à exécuter
   * (peut être étendu avec des règles de sécurité)
   */
  isCommandSafe(command: string): { safe: boolean; reason?: string } {
    const dangerousCommands = ['rm -rf /', 'mkfs', 'dd if=/dev/zero']
    const lowerCommand = command.toLowerCase()

    for (const dangerous of dangerousCommands) {
      if (lowerCommand.includes(dangerous.toLowerCase())) {
        return {
          safe: false,
          reason: `Commande potentiellement dangereuse détectée: ${dangerous}`,
        }
      }
    }

    return { safe: true }
  },
}
