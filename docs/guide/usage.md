# Usage

## First Use

1. Launch the application
2. Click the gear icon in the top right to open configuration
3. Select your LLM provider: **Ollama**, **Claude**, or **OpenAI**
4. Fill in the provider settings (Ollama URL, Claude API key, or OpenAI API key)
5. Click "Test connection" to verify the connection
6. Select the model you want to use
7. Click "Save"

## Using the AI

1. In the right panel (AI Assistant), type your request in natural language
   - Example: *"List all files larger than 10MB in the current directory"*
2. The AI will analyze your request and propose a shell command
3. You can:
   - **Execute**: Run the command directly in the terminal
   - **Edit**: Adjust the command before execution
   - **Cancel**: Ignore the proposal

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Execute the current AI-generated command |
| `Ctrl+K` | Clear the conversation history |
| `Esc` | Cancel the current AI command or dismiss errors |

## Using the Terminal

The terminal on the left works like a classic terminal. You can:
- Type commands directly
- Navigate through directories
- Run any shell command

## Query Examples

- *"List all Python files in the current directory"*
- *"Find files larger than 100MB in /home"*
- *"Show disk usage"*
- *"Count the number of lines in all .txt files"*
- *"Create a folder with today's date"*

## Security

- Commands proposed by AI are **not executed automatically**
- You always have control: validation before execution
- Ability to modify commands before execution
- Configuration stored locally with electron-store
