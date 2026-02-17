import type { AppConfig, OllamaConfig } from '@shared/types'

/**
 * Service pur pour la logique de configuration
 * Testable sans dépendance à React ou Electron
 */
export const configService = {
  /**
   * Valide une configuration Ollama
   */
  validateOllamaConfig(config: OllamaConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.url || config.url.trim().length === 0) {
      errors.push("L'URL Ollama est requise")
    }

    if (!this.isValidUrl(config.url)) {
      errors.push("L'URL Ollama n'est pas valide")
    }

    if (!config.model || config.model.trim().length === 0) {
      errors.push('Le modèle est requis')
    }

    if (config.temperature < 0 || config.temperature > 1) {
      errors.push('La température doit être entre 0 et 1')
    }

    if (config.maxTokens < 100 || config.maxTokens > 4000) {
      errors.push('Le nombre de tokens doit être entre 100 et 4000')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },

  /**
   * Valide qu'une URL est correctement formatée
   */
  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  },

  /**
   * Formate le résultat de test de connexion
   */
  formatTestResult(success: boolean): { success: boolean; message: string } {
    if (success) {
      return {
        success: true,
        message: 'Connexion réussie !',
      }
    }
    return {
      success: false,
      message: 'Échec de la connexion',
    }
  },

  /**
   * Crée une configuration par défaut
   */
  createDefaultConfig(): AppConfig {
    return {
      ollama: {
        url: 'http://localhost:11434',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 1000,
      },
      theme: 'dark',
      fontSize: 14,
      shell: 'auto',
    }
  },

  /**
   * Fusionne deux configurations (la deuxième prend le dessus)
   */
  mergeConfigs(base: AppConfig, override: Partial<AppConfig>): AppConfig {
    return {
      ...base,
      ...override,
      ollama: {
        ...base.ollama,
        ...override.ollama,
      },
    }
  },

  /**
   * Vérifie si un champ provient d'une variable d'environnement
   */
  isFromEnv(envSources: { [key: string]: boolean }, field: string): boolean {
    return !!envSources[field]
  },

  /**
   * Formate le nom de la variable d'environnement
   */
  formatEnvVarName(field: string): string {
    const envVarMap: { [key: string]: string } = {
      url: 'TERMAID_OLLAMA_URL',
      apiKey: 'TERMAID_OLLAMA_API_KEY',
      model: 'TERMAID_OLLAMA_MODEL',
      temperature: 'TERMAID_OLLAMA_TEMPERATURE',
      maxTokens: 'TERMAID_OLLAMA_MAX_TOKENS',
    }
    return envVarMap[field] || ''
  },
}
