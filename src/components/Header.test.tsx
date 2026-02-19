import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
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

// Mock confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
})

// Mock useStore with default values
vi.mock('../store/useStore', () => ({
  useStore: vi.fn(() => ({
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
  })),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  test('should toggle config panel on config button click', async () => {
    const user = userEvent.setup()
    render(<Header />)

    // Find config button by title
    const configButton = screen.getByTitle('Configuration')
    await user.click(configButton)

    expect(mockToggleConfigPanel).toHaveBeenCalled()
  })

  test('should toggle conversation dropdown', async () => {
    const user = userEvent.setup()
    render(<Header />)

    // Initially dropdown should not be visible - check for conversation items instead of header text
    expect(screen.queryByText('First conversation')).not.toBeInTheDocument()

    // Click conversations button - find by aria-expanded attribute
    const buttons = screen.getAllByRole('button')
    const conversationsButton = buttons.find(btn => btn.getAttribute('aria-haspopup') === 'listbox')
    expect(conversationsButton).toBeDefined()
    await user.click(conversationsButton!)

    // Now dropdown should be visible - check for conversation items
    expect(screen.getByText('First conversation')).toBeInTheDocument()
  })

  test('should show conversation list when dropdown is open', async () => {
    const user = userEvent.setup()
    render(<Header />)

    // Open dropdown
    const buttons = screen.getAllByRole('button')
    const conversationsButton = buttons.find(btn => btn.getAttribute('aria-haspopup') === 'listbox')
    await user.click(conversationsButton!)

    expect(screen.getByText('First conversation')).toBeInTheDocument()
    expect(screen.getByText('Second conversation')).toBeInTheDocument()
  })

  test('should close conversation dropdown when clicking close button', async () => {
    const user = userEvent.setup()
    render(<Header />)

    // Open dropdown
    const buttons = screen.getAllByRole('button')
    const conversationsButton = buttons.find(btn => btn.getAttribute('aria-haspopup') === 'listbox')
    await user.click(conversationsButton!)
    // Verify dropdown is open by checking for conversation items
    expect(screen.getByText('First conversation')).toBeInTheDocument()

    // Click close button in dropdown header
    const closeButtons = screen.getAllByText('✕')
    await user.click(closeButtons[0])

    // Verify dropdown is closed
    expect(screen.queryByText('First conversation')).not.toBeInTheDocument()
  })

  test('should load conversation when clicking on it', async () => {
    const user = userEvent.setup()
    render(<Header />)

    // Open dropdown
    const buttons = screen.getAllByRole('button')
    const conversationsButton = buttons.find(btn => btn.getAttribute('aria-haspopup') === 'listbox')
    await user.click(conversationsButton!)

    // Click on a conversation
    const conversationItem = screen.getByText('First conversation')
    await user.click(conversationItem)

    expect(mockLoadConversation).toHaveBeenCalledWith('1')
    expect(mockReload).toHaveBeenCalled()
  })

  test('should export current conversation', async () => {
    mockConversationExport.mockResolvedValueOnce({
      success: true,
      filePath: '/path/to/export.json',
    })

    const user = userEvent.setup()
    render(<Header />)

    // Open dropdown
    const buttons = screen.getAllByRole('button')
    const conversationsButton = buttons.find(btn => btn.getAttribute('aria-haspopup') === 'listbox')
    await user.click(conversationsButton!)

    // Click export current - find by title
    const exportCurrentButton = screen.getByTitle('Export current conversation')
    await user.click(exportCurrentButton)

    expect(mockConversationExport).toHaveBeenCalledWith('1')
  })

  test('should export all conversations', async () => {
    mockConversationExportAll.mockResolvedValueOnce({
      success: true,
      filePath: '/path/to/exports.json',
    })

    const user = userEvent.setup()
    render(<Header />)

    // Click export all button
    const exportAllButton = screen.getByTitle('Export all conversations')
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

    // Click export all button
    const exportAllButton = screen.getByTitle('Export all conversations')
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

    // Click export all button
    const exportAllButton = screen.getByTitle('Export all conversations')
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

    // Click export all button
    const exportAllButton = screen.getByTitle('Export all conversations')
    await user.click(exportAllButton)

    // No status message should be shown for cancellation
    expect(screen.queryByText(/Exported/)).not.toBeInTheDocument()
  })
})