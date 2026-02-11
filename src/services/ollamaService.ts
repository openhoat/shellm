import type { AICommand, OllamaConfig } from '@shared/types'

/**
 * Interface pour l'API Electron (injectée pour testabilité)
 */
export interface ElectronOllamaAPI {
  init(config: OllamaConfig): Promise<void>
  generateCommand(prompt: string, recentCommands?: string[]): Promise<AICommand>
  testConnection: () => Promise<boolean>
  listModels: () => Promise<string[]>
}

/**
 * Service pur pour l'API Ollama
 * L'API Electron est injectée pour permettre le mocking dans les tests
 */
export class OllamaService {
  #electronAPI: ElectronOllamaAPI

  constructor(electronAPI: ElectronOllamaAPI) {
    this.#electronAPI = electronAPI
  }

  /**
   * Génère une commande à partir d'une description en langage naturel
   */
  async generateCommand(prompt: string, recentCommands?: string[]): Promise<AICommand> {
    return this.#electronAPI.generateCommand(prompt, recentCommands)
  }

  /**
   * Initialise le service Ollama avec la configuration
   */
  async initialize(config: OllamaConfig): Promise<void> {
    return this.#electronAPI.init(config)
  }

  /**
   * Teste la connexion au service Ollama
   */
  async testConnection(): Promise<boolean> {
    return this.#electronAPI.testConnection()
  }

  /**
   * Liste les modèles disponibles
   */
  async listModels(): Promise<string[]> {
    return this.#electronAPI.listModels()
  }

  /**
   * Crée une instance avec l'API Electron réelle
   */
  static createWithRealAPI(): OllamaService {
    return new OllamaService({
      init: config => window.electronAPI.llmInit(config),
      generateCommand: (prompt, recentCommands) =>
        window.electronAPI.llmGenerateCommand(prompt, recentCommands),
      testConnection: () => window.electronAPI.llmTestConnection(),
      listModels: () => window.electronAPI.llmListModels(),
    })
  }
}

/**
 * Instance singleton avec l'API Electron réelle
 */
export const ollamaService = OllamaService.createWithRealAPI()
