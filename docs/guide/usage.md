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

Press `Ctrl+/` (or `?`) to open the shortcuts cheat sheet at any time.

### Chat Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | Insert new line |
| `Ctrl+Enter` | Execute AI-generated command |
| `Ctrl+K` | Clear conversation history |
| `Escape` | Cancel current command or dismiss errors |

### Help Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+/` or `?` | Show keyboard shortcuts cheat sheet |

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

Termaid implements multiple layers of security to protect your system while executing AI-generated commands.

### Command Validation

Every AI-generated command is validated before execution. The validation system analyzes commands for potential risks:

**Risk Levels:**
- ✅ **Safe**: Read-only commands (ls, cat, pwd, etc.)
- ⚠️ **Warning**: Commands requiring attention (sudo, chmod, etc.)
- 🚫 **Dangerous**: High-risk commands blocked by default (rm -rf /, dd, mkfs, etc.)

**Risk Categories:**
File deletion, System modification, Network operations, Privilege escalation, Disk operations, Process control, Data destruction, Configuration changes

**Injection Detection:**
Command substitution ($(), backticks), Variable expansion (${}), Command chaining (;, &&, |)

### Sandbox Modes

Termaid offers multiple sandbox modes for safe command execution:

| Mode | Description | Timeout | Use Case |
|------|-------------|---------|----------|
| `none` | Direct execution | 60s | Trusted commands |
| `restricted` | Limited environment | 30s | Most commands |
| `docker` | Container isolation | 60s | Untrusted commands |
| `system` | Linux sandbox | 60s | Maximum isolation |

### Configuring the Sandbox

You can enable and configure the sandbox in the configuration panel:

1. Click the gear icon (⚙️) in the top right
2. Scroll to the **Security Sandbox** section
3. Enable sandbox mode with the checkbox
4. Choose the sandbox mode:
   - **None**: Direct execution (no isolation)
   - **Restricted**: Limited environment with blocked commands
   - **Docker**: Container isolation (requires Docker installed)
   - **System**: OS sandbox using firejail (Linux only)
5. Adjust the command timeout (5-120 seconds)
6. For Docker mode, specify the container image (default: `alpine:latest`)

**Recommendations:**
- Use **Restricted** mode for everyday use
- Use **Docker** mode when testing untrusted commands
- Use **System** mode (Linux) for maximum isolation

**Note:** Sandbox settings are stored locally in your configuration file:
- Linux/macOS: `~/.config/termaid/config.json`
- Windows: `%APPDATA%/termaid/config.json`

### Audit Logging

All command executions are logged with detailed metadata:
- Command string, execution result, risk level
- User approval status, execution time
- Export to JSON or CSV
- Query and statistics API