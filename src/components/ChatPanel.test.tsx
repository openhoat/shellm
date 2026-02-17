import type { AICommandShell } from '@shared/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { useChat as UseChatType } from '@/hooks/useChat'

// Mock modules before imports
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: vi.fn() },
  }),
}))
vi.mock('@/hooks/useChat')
vi.mock('@/store/useStore')
vi.mock('@/utils/logger', () => {
  class MockLogger {
    debug = vi.fn()
    info = vi.fn()
    error = vi.fn()
  }
  return { default: MockLogger }
})
vi.mock('./chat', () => ({
  ChatMessage: ({ message }: { message: { content: string } }) => (
    <div data-testid="chat-message">{message.content}</div>
  ),
}))

import { useChat } from '@/hooks/useChat'
import { useStore } from '@/store/useStore'
import { ChatPanel } from './ChatPanel'

// Restore window event listener methods lost when setup.ts replaces window
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true,
  configurable: true,
})
Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true,
  configurable: true,
})

type UseChatReturn = ReturnType<typeof UseChatType>

const mockSetAiCommand = vi.fn()
const mockClearAllConversations = vi.fn()

const defaultChatState: UseChatReturn = {
  userInput: '',
  conversation: [],
  currentCommandIndex: null,
  isInterpreting: false,
  isExecuting: false,
  executionProgress: 0,
  aiCommand: null,
  isLoading: false,
  error: null,
  terminalPid: null,
  setUserInput: vi.fn(),
  handleInputChange: vi.fn(),
  generateAICommand: vi.fn(),
  executeCommand: vi.fn(),
  modifyCommand: vi.fn(),
}

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState })
    vi.mocked(useStore).mockReturnValue({
      setAiCommand: mockSetAiCommand,
      clearAllConversations: mockClearAllConversations,
    } as ReturnType<typeof useStore>)
  })

  test('should render the AI Assistant heading', () => {
    render(<ChatPanel />)

    expect(screen.getByRole('heading', { name: 'AI Assistant' })).toBeInTheDocument()
  })

  test('should show welcome message when conversation is empty', () => {
    render(<ChatPanel />)

    expect(screen.getByText('chat.welcome.title')).toBeInTheDocument()
  })

  test('should render the input field with placeholder', () => {
    render(<ChatPanel />)

    const input = screen.getByPlaceholderText('chat.placeholder')
    expect(input).toBeInTheDocument()
  })

  test('should render the send button', () => {
    render(<ChatPanel />)

    const button = screen.getByRole('button', { name: /chat\.send/ })
    expect(button).toBeInTheDocument()
  })

  test('should disable send button when input is empty', () => {
    render(<ChatPanel />)

    const button = screen.getByRole('button', { name: /chat\.send/ })
    expect(button).toBeDisabled()
  })

  test('should disable send button when loading', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: 'some text',
      isLoading: true,
    })
    render(<ChatPanel />)

    const button = screen.getByRole('button', { name: /chat\.send/ })
    expect(button).toBeDisabled()
  })

  test('should disable input when loading', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isLoading: true,
    })
    render(<ChatPanel />)

    const input = screen.getByPlaceholderText('chat.placeholder')
    expect(input).toBeDisabled()
  })

  test('should display chat messages when conversation has items', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      conversation: [
        { id: 'msg-1', type: 'user', content: 'Hello' },
        { id: 'msg-2', type: 'ai', content: 'World' },
      ],
    })
    render(<ChatPanel />)

    const messages = screen.getAllByTestId('chat-message')
    expect(messages).toHaveLength(2)
  })

  test('should not show welcome message when conversation has items', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      conversation: [{ id: 'msg-1', type: 'user', content: 'Hello' }],
    })
    render(<ChatPanel />)

    expect(screen.queryByText('chat.welcome.title')).not.toBeInTheDocument()
  })

  test('should show loading spinner when isLoading', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isLoading: true,
    })
    render(<ChatPanel />)

    const spinner = document.querySelector('.loading-spinner')
    expect(spinner).toBeInTheDocument()
  })

  test('should show error message when error exists', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      error: 'Connection error',
    })
    render(<ChatPanel />)

    expect(screen.getByText('Connection error')).toBeInTheDocument()
  })

  test('should show command action buttons when aiCommand is a command type', () => {
    const aiCommand: AICommandShell = {
      type: 'command',
      intent: 'list files',
      command: 'ls -la',
      explanation: 'List files',
      confidence: 0.9,
    }
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      aiCommand,
      terminalPid: 12345,
    })
    render(<ChatPanel />)

    expect(screen.getByRole('button', { name: /chat\.actions\.execute/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /chat\.actions\.modify/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /chat\.actions\.cancel/ })).toBeInTheDocument()
  })

  test('should disable execute button when terminal is not ready', () => {
    const aiCommand: AICommandShell = {
      type: 'command',
      intent: 'list files',
      command: 'ls -la',
      explanation: 'List files',
      confidence: 0.9,
    }
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      aiCommand,
      terminalPid: null,
    })
    render(<ChatPanel />)

    const executeButton = screen.getByRole('button', { name: /chat\.actions\.preparing/ })
    expect(executeButton).toBeDisabled()
  })

  test('should call setAiCommand with null when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const aiCommand: AICommandShell = {
      type: 'command',
      intent: 'list files',
      command: 'ls -la',
      explanation: 'List files',
      confidence: 0.9,
    }
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      aiCommand,
      terminalPid: 12345,
    })
    render(<ChatPanel />)

    await user.click(screen.getByRole('button', { name: /chat\.actions\.cancel/ }))

    expect(mockSetAiCommand).toHaveBeenCalledWith(null)
  })

  test('should apply custom style prop', () => {
    render(<ChatPanel style={{ width: '500px' }} />)

    const chatPanel = document.querySelector('.chat-panel')
    expect(chatPanel).toHaveStyle({ width: '500px' })
  })
})
