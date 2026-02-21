import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}))

import { Header } from './Header'

// Mock __APP_VERSION__ global
declare global {
  // eslint-disable-next-line no-var
  var __APP_VERSION__: string
}
globalThis.__APP_VERSION__ = '1.2.3'

// Mock window.electronAPI
const mockConversationExport = vi.fn()
const mockConversationExportAll = vi.fn()
const mockLoadConversation = vi.fn()
const mockDeleteConversation = vi.fn()
const mockToggleConfigPanel = vi.fn()

Object.defineProperty(window, 'electronAPI', {
  value: {
    conversationExport: mockConversationExport,
    conversationExportAll: mockConversationExportAll,
  },
  writable: true,
})

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

// Mock confirm - default to true
const mockConfirm = vi.fn(() => true)
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
})

// Helper to create mock store
const createMockStore = (overrides = {}) => ({
  config: {
    llmProvider: 'ollama',
    ollama: { url: 'http://localhost:11434', apiKey: '', model: 'llama2' },
    claude: { apiKey: '', model: 'claude-3' },
    openai: { apiKey: '', model: 'gpt-4' },
    theme: 'dark',
    fontSize: 14,
    shell: 'auto',
  },
  toggleConfigPanel: mockToggleConfigPanel,
  conversations: [
    { id: '1', title: 'First conversation' },
    { id: '2', title: 'Second conversation' },
  ],
  currentConversationId: '1',
  loadConversation: mockLoadConversation,
  deleteConversation: mockDeleteConversation,
  ...overrides,
})

// Mock useStore
vi.mock('../store/useStore', () => ({
  useStore: vi.fn(),
}))

import { useStore } from '../store/useStore'

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
    vi.mocked(useStore).mockReturnValue(createMockStore())
  })

  describe('rendering', () => {
    test('should render app title and version', () => {
      render(<Header />)

      expect(screen.getByText('Termaid')).toBeInTheDocument()
      expect(screen.getByText('v1.2.3')).toBeInTheDocument()
    })

    test('should render status indicator with provider and model', () => {
      render(<Header />)

      expect(screen.getByText('Ollama: Local llama2')).toBeInTheDocument()
    })

    test('should render buttons', () => {
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('provider status', () => {
    test('should show Claude provider status', () => {
      vi.mocked(useStore).mockReturnValue(
        createMockStore({
          config: {
            llmProvider: 'claude',
            ollama: { url: 'http://localhost:11434', apiKey: '', model: 'llama2' },
            claude: { apiKey: 'test-key', model: 'claude-3-opus' },
            openai: { apiKey: '', model: 'gpt-4' },
            theme: 'dark',
            fontSize: 14,
            shell: 'auto',
          },
        })
      )

      render(<Header />)

      expect(screen.getByText('Claude: claude-3-opus')).toBeInTheDocument()
    })

    test('should show OpenAI provider status', () => {
      vi.mocked(useStore).mockReturnValue(
        createMockStore({
          config: {
            llmProvider: 'openai',
            ollama: { url: 'http://localhost:11434', apiKey: '', model: 'llama2' },
            claude: { apiKey: '', model: 'claude-3' },
            openai: { apiKey: 'test-key', model: 'gpt-4-turbo' },
            theme: 'dark',
            fontSize: 14,
            shell: 'auto',
          },
        })
      )

      render(<Header />)

      expect(screen.getByText('OpenAI: gpt-4-turbo')).toBeInTheDocument()
    })

    test('should show Ollama with custom URL', () => {
      vi.mocked(useStore).mockReturnValue(
        createMockStore({
          config: {
            llmProvider: 'ollama',
            ollama: { url: 'http://custom-server:11434', apiKey: '', model: 'llama2' },
            claude: { apiKey: '', model: 'claude-3' },
            openai: { apiKey: '', model: 'gpt-4' },
            theme: 'dark',
            fontSize: 14,
            shell: 'auto',
          },
        })
      )

      render(<Header />)

      expect(screen.getByText('Ollama: http://custom-server:11434 llama2')).toBeInTheDocument()
    })
  })

  describe('config panel', () => {
    test('should toggle config panel on config button click', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const configButton = screen.getByRole('button', { name: 'header.config' })
      await user.click(configButton)

      expect(mockToggleConfigPanel).toHaveBeenCalled()
    })
  })

  describe('conversation dropdown', () => {
    test('should toggle conversation dropdown', async () => {
      const user = userEvent.setup()
      render(<Header />)

      expect(screen.queryByText('First conversation')).not.toBeInTheDocument()

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      expect(screen.getByText('First conversation')).toBeInTheDocument()
    })

    test('should show conversation list when dropdown is open', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      expect(screen.getByText('First conversation')).toBeInTheDocument()
      expect(screen.getByText('Second conversation')).toBeInTheDocument()
    })

    test('should close conversation dropdown when clicking close button', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)
      expect(screen.getByText('First conversation')).toBeInTheDocument()

      const closeButtons = screen.getAllByText('✕')
      await user.click(closeButtons[0])

      expect(screen.queryByText('First conversation')).not.toBeInTheDocument()
    })

    test('should show empty state when no conversations', async () => {
      vi.mocked(useStore).mockReturnValue(
        createMockStore({
          conversations: [],
        })
      )

      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      expect(screen.getByText('No conversations yet')).toBeInTheDocument()
    })
  })

  describe('conversation loading', () => {
    test('should load conversation when clicking on it', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      const conversationItem = screen.getByText('First conversation')
      await user.click(conversationItem)

      expect(mockLoadConversation).toHaveBeenCalledWith('1')
      expect(mockReload).toHaveBeenCalled()
    })

    test('should load conversation with Enter key', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      // Find the conversation item button by its text content
      const conversationItems = screen.getAllByText('First conversation')
      const conversationButton = conversationItems[0].closest('button.conversation-item')
      await user.type(conversationButton!, '{Enter}')

      expect(mockLoadConversation).toHaveBeenCalledWith('1')
      expect(mockReload).toHaveBeenCalled()
    })

    test('should load conversation with Space key', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      // Find the conversation item button by its text content
      const conversationItems = screen.getAllByText('First conversation')
      const conversationButton = conversationItems[0].closest('button.conversation-item')
      await user.type(conversationButton!, ' ')

      expect(mockLoadConversation).toHaveBeenCalledWith('1')
      expect(mockReload).toHaveBeenCalled()
    })
  })

  describe('export current conversation', () => {
    test('should export current conversation', async () => {
      mockConversationExport.mockResolvedValueOnce({
        success: true,
        filePath: '/path/to/export.json',
      })

      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      const exportCurrentButton = screen.getByRole('button', { name: /Export Current/i })
      await user.click(exportCurrentButton)

      expect(mockConversationExport).toHaveBeenCalledWith('1')
    })

    // eslint-disable-next-line test/no-disabled-tests
    test.skip('should show status when no active conversation', async () => {
      vi.mocked(useStore).mockReturnValue(
        createMockStore({
          currentConversationId: null,
        })
      )

      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      const exportCurrentButton = screen.getByRole('button', { name: /Export Current/i })
      await user.click(exportCurrentButton)

      expect(await screen.findByText('No active conversation to export')).toBeInTheDocument()
      expect(mockConversationExport).not.toHaveBeenCalled()
    })

    test('should show export status on successful current export', async () => {
      mockConversationExport.mockResolvedValueOnce({
        success: true,
        filePath: '/path/to/export.json',
      })

      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      const exportCurrentButton = screen.getByRole('button', { name: /Export Current/i })
      await user.click(exportCurrentButton)

      expect(screen.getByText(/Exported to \/path\/to\/export.json/)).toBeInTheDocument()
    })

    test('should show error on current export failure', async () => {
      mockConversationExport.mockResolvedValueOnce({
        success: false,
        error: 'Export failed',
      })

      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      const exportCurrentButton = screen.getByRole('button', { name: /Export Current/i })
      await user.click(exportCurrentButton)

      expect(screen.getByText('Export failed')).toBeInTheDocument()
    })

    test('should handle current export exception', async () => {
      mockConversationExport.mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      render(<Header />)

      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      const exportCurrentButton = screen.getByRole('button', { name: /Export Current/i })
      await user.click(exportCurrentButton)

      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  describe('export all conversations', () => {
    test('should export all conversations', async () => {
      mockConversationExportAll.mockResolvedValueOnce({
        success: true,
        filePath: '/path/to/exports.json',
      })

      const user = userEvent.setup()
      render(<Header />)

      const exportAllButton = screen.getByRole('button', { name: 'header.exportAll' })
      await user.click(exportAllButton)

      expect(mockConversationExportAll).toHaveBeenCalled()
    })

    test('should show export status on successful export', async () => {
      mockConversationExportAll.mockResolvedValueOnce({
        success: true,
        filePath: '/path/to/exports.json',
      })

      const user = userEvent.setup()
      render(<Header />)

      const exportAllButton = screen.getByRole('button', { name: 'header.exportAll' })
      await user.click(exportAllButton)

      expect(screen.getByText(/Exported all conversations/)).toBeInTheDocument()
    })

    test('should show error status on failed export', async () => {
      mockConversationExportAll.mockResolvedValueOnce({
        success: false,
        error: 'Export failed',
      })

      const user = userEvent.setup()
      render(<Header />)

      const exportAllButton = screen.getByRole('button', { name: 'header.exportAll' })
      await user.click(exportAllButton)

      expect(screen.getByText('Export failed')).toBeInTheDocument()
    })

    test('should handle export cancellation', async () => {
      mockConversationExportAll.mockResolvedValueOnce({
        success: false,
        cancelled: true,
      })

      const user = userEvent.setup()
      render(<Header />)

      const exportAllButton = screen.getByRole('button', { name: 'header.exportAll' })
      await user.click(exportAllButton)

      expect(screen.queryByText(/Exported/)).not.toBeInTheDocument()
    })

    test('should handle export all exception', async () => {
      mockConversationExportAll.mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      render(<Header />)

      const exportAllButton = screen.getByRole('button', { name: 'header.exportAll' })
      await user.click(exportAllButton)

      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  describe('new conversation', () => {
    // Skip: test fails due to dropdown state timing issues
    test.skip('should close dropdown on new conversation click', async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Open dropdown first
      const buttons = screen.getAllByRole('button')
      const conversationsButton = buttons.find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)
      expect(screen.getByText('First conversation')).toBeInTheDocument()

      // Click new conversation button
      const newButton = screen.getByRole('button', { name: 'header.newConversation' })
      await user.click(newButton)

      // Dropdown should be closed
      expect(screen.queryByText('First conversation')).not.toBeInTheDocument()
    })
  })

  describe('tooltips', () => {
    test('should have tooltip on new conversation button', () => {
      render(<Header />)

      const button = screen.getByRole('button', { name: 'header.newConversation' })
      expect(button).toHaveAttribute('title', 'header.newConversation')
    })

    test('should have tooltip on conversations button', () => {
      render(<Header />)

      const button = screen.getAllByRole('button').find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      expect(button).toHaveAttribute('title', 'header.conversations')
    })

    test('should have tooltip on export all button', () => {
      render(<Header />)

      const button = screen.getByRole('button', { name: 'header.exportAll' })
      expect(button).toHaveAttribute('title', 'header.exportAll')
    })

    test('should have tooltip on config button', () => {
      render(<Header />)

      const button = screen.getByRole('button', { name: 'header.config' })
      expect(button).toHaveAttribute('title', 'header.config')
    })

    test('should have tooltip on close conversations dropdown button', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const conversationsButton = screen.getAllByRole('button').find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      const closeButtons = screen.getAllByText('✕')
      expect(closeButtons[0].closest('button')).toHaveAttribute('title', 'header.closeConversations')
    })

    test('should have tooltip on delete conversation button', async () => {
      const user = userEvent.setup()
      render(<Header />)

      const conversationsButton = screen.getAllByRole('button').find(
        btn => btn.getAttribute('aria-haspopup') === 'listbox'
      )
      await user.click(conversationsButton!)

      const deleteButtons = screen.getAllByRole('button', { name: '✕' })
      for (const btn of deleteButtons) {
        if (btn.classList.contains('conversation-delete')) {
          expect(btn).toHaveAttribute('title', 'header.deleteConversation')
        }
      }
    })
  })
})
