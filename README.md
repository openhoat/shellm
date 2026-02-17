# SheLLM - AI-Powered Terminal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/openhoat/shellm/actions/workflows/ci.yml/badge.svg)](https://github.com/openhoat/shellm/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/openhoat/shellm/branch/main/graph/badge.svg)](https://codecov.io/gh/openhoat/shellm)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-22-339933.svg?logo=node.js&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-40-47848F.svg?logo=electron&logoColor=white)
![Tested with Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18.svg?logo=vitest&logoColor=white)
[![GitHub Stars](https://img.shields.io/github/stars/openhoat/shellm?style=social)](https://github.com/openhoat/shellm/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/openhoat/shellm?style=social)](https://github.com/openhoat/shellm/network/members)
[![GitHub issues](https://img.shields.io/github/issues/openhoat/shellm)](https://github.com/openhoat/shellm/issues)

A modern terminal powered by artificial intelligence, inspired by [Warp](https://www.warp.dev).

SheLLM allows you to describe what you want to do in natural language and the AI generates the appropriate shell commands.

> 🤖 **This project was entirely built with AI** — from architecture to code, tests, and documentation, using [Claude Code](https://claude.ai/claude-code) (Anthropic).

## 💡 Why SheLLM?

[Warp](https://www.warp.dev) is a great AI-powered terminal, but its AI features only work with proprietary cloud providers — there is no support for [Ollama](https://ollama.ai), which means no free, local, or self-hosted option.

SheLLM was born out of that frustration: a fully open alternative that works with Ollama out of the box, keeping your data local and your wallet intact.

## 🚀 Features

- **Terminal Base**: Full terminal interface with xterm.js
- **Integrated AI**: Generate shell commands from natural language descriptions
- **Multi-Provider LLM**: Supports [Ollama](https://ollama.ai) (local/remote), [Claude](https://www.anthropic.com) (Anthropic API), and [OpenAI](https://openai.com) (GPT-4o, GPT-4)
- **Modern Interface**: Dark theme by default with optional light theme
- **Flexible Configuration**: Provider, model, temperature, and more — configurable via UI or environment variables
- **History**: Track conversations and executed commands

## 📥 Quick Install

Download the latest release for your platform:

| Platform | Format | Download |
|----------|--------|----------|
| **Linux** | AppImage | [SheLLM-1.0.0.AppImage](https://github.com/openhoat/shellm/releases/latest/download/SheLLM-1.0.0.AppImage) |
| **Linux** | Debian/Ubuntu | [shellm_1.0.0_amd64.deb](https://github.com/openhoat/shellm/releases/latest/download/shellm_1.0.0_amd64.deb) |
| **macOS** | DMG (ARM) | [SheLLM-1.0.0-arm64.dmg](https://github.com/openhoat/shellm/releases/latest/download/SheLLM-1.0.0-arm64.dmg) |
| **Windows** | Installer | [SheLLM.Setup.1.0.0.exe](https://github.com/openhoat/shellm/releases/latest/download/SheLLM.Setup.1.0.0.exe) |

> See all versions on the [Releases page](https://github.com/openhoat/shellm/releases).

## 🔧 Development Setup

### 📋 Prerequisites

- Node.js 18+ and npm
- Ollama installed and running (for local use)
- Python 3 and make (for node-pty compilation on Linux)

### 1. Clone the project

```bash
git clone https://github.com/openhoat/shellm.git
cd shellm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure an LLM provider

SheLLM supports two providers. Choose one (or both):

#### Option A — Ollama (local or remote)

Visit [ollama.ai](https://ollama.ai) and follow the installation instructions for your operating system.

```bash
ollama serve
ollama pull llama2   # or any model of your choice
```

If you're using Ollama on a remote machine, configure the URL in the SheLLM configuration panel.

#### Option B — Claude (Anthropic API)

Get an API key from [console.anthropic.com](https://console.anthropic.com) and set it as an environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Then select **Claude** as the provider in the configuration panel.

#### Option C — OpenAI

Get an API key from [platform.openai.com](https://platform.openai.com) and set it as an environment variable:

```bash
export SHELLM_OPENAI_API_KEY=sk-...
```

Then select **OpenAI** as the provider in the configuration panel.

### 4. Run the application

```bash
npm run dev
```

---

## 🎮 Usage

### Development Mode

```bash
npm run dev
```

This will start:
- The Vite development server (http://localhost:5173)
- The Electron application

#### Environment Variables for Linux

On Linux with Wayland, you may encounter warnings related to Wayland/Vulkan compatibility. To force X11 usage:

```bash
ELECTRON_OZONE_PLATFORM_HINT=x11 npm run dev
```

This environment variable is recommended to avoid warnings:
- `--ozone-platform=wayland is not compatible with Vulkan`
- Errors related to systemd

## 📖 User Guide

### First Use

1. Launch the application with `npm run dev`
2. Click the gear icon in the top right to open configuration
3. Select your LLM provider: **Ollama** or **Claude**
4. Fill in the provider settings (Ollama URL or Claude API key)
5. Click "Test connection" to verify the connection
6. Select the model you want to use
7. Click "Save"

### Using the AI

1. In the right panel (AI Assistant), type your request in natural language
   - Example: "List all files larger than 10MB in the current directory"
2. The AI will analyze your request and propose a shell command
3. You can:
   - **Execute**: Run the command directly in the terminal
   - **Edit**: Adjust the command before execution
   - **Cancel**: Ignore the proposal

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Execute the current AI-generated command |
| `Ctrl+K` | Clear the conversation history |
| `Esc` | Cancel the current AI command or dismiss errors |

### Using the Terminal

The terminal on the left works like a classic terminal. You can:
- Type commands directly
- Navigate through directories
- Run any shell command

## ⚙️ Configuration

### LLM Provider

Select your provider in the configuration panel. The selection is also configurable via the `SHELLM_LLM_PROVIDER` environment variable (`ollama` or `claude`).

### Ollama

- **URL**: Address of your Ollama instance (local or remote)
- **API Key**: Optional, if your Ollama instance requires authentication
- **Model**: Ollama model to use (llama2, mistral, etc.)
- **Temperature**: Controls AI creativity (0 = more precise, 1 = more creative)
- **Max Tokens**: Maximum number of tokens in the response

### Claude

- **API Key**: Your Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))
- **Model**: Claude model to use (claude-haiku-4-5-20251001, claude-sonnet-4-5-20250929, etc.)
- **Temperature**: Controls AI creativity (0 = more precise, 1 = more creative)
- **Max Tokens**: Maximum number of tokens in the response

### OpenAI

- **API Key**: Your OpenAI API key (from [platform.openai.com](https://platform.openai.com))
- **Model**: OpenAI model to use (gpt-4o, gpt-4, gpt-3.5-turbo, etc.)
- **Temperature**: Controls AI creativity (0 = more precise, 1 = more creative)
- **Max Tokens**: Maximum number of tokens in the response

### Interface

- **Theme**: Dark (default) or Light
- **Font Size**: Adjust text size (10-20px)

### Environment Variables

Environment variables take **priority** over the UI configuration. Copy `.env.example` to `.env` to get started.

| Variable | Description | Default |
|----------|-------------|---------|
| `SHELLM_LLM_PROVIDER` | LLM provider to use (`ollama` or `claude`) | `ollama` |
| `SHELLM_OLLAMA_URL` | Ollama instance URL | `http://localhost:11434` |
| `SHELLM_OLLAMA_API_KEY` | API key for Ollama authentication | *(none)* |
| `SHELLM_OLLAMA_MODEL` | Ollama model to use | `gemini-3-flash-preview:cloud` |
| `SHELLM_OLLAMA_TEMPERATURE` | Ollama temperature (0–1) | `0.7` |
| `SHELLM_OLLAMA_MAX_TOKENS` | Maximum tokens for Ollama response | `1000` |
| `SHELLM_CLAUDE_API_KEY` | Anthropic API key for Claude | *(none)* |
| `ANTHROPIC_API_KEY` | Standard Anthropic API key (fallback for `SHELLM_CLAUDE_API_KEY`) | *(none)* |
| `SHELLM_CLAUDE_MODEL` | Claude model to use | `claude-haiku-4-5-20251001` |
| `SHELLM_OPENAI_API_KEY` | OpenAI API key | *(none)* |
| `SHELLM_OPENAI_MODEL` | OpenAI model to use | `gpt-4o` |
| `SHELLM_SHELL` | Shell to use (`auto` for system default, or explicit path) | `auto` |
| `SHELLM_DEVTOOLS` | Open DevTools on application launch (`true`/`false`) | `false` |
| `ELECTRON_OZONE_PLATFORM_HINT` | Force X11 on Linux Wayland (`x11`) | *(unset)* |

## 📦 Build Executables

SheLLM uses [electron-builder](https://www.electron.build/) to package the application into platform-specific distributables.

### Prerequisites

Before building, make sure the following tools are installed on your system:

| Platform | Required tools |
|----------|---------------|
| Linux    | `build-essential`, `python3`, `make` |
| macOS    | Xcode Command Line Tools (`xcode-select --install`) |
| Windows  | [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |

### Linux

```bash
npm run dist:linux
```

Generates `.AppImage` and `.deb` packages in the `release/` folder.

### macOS

```bash
npm run dist:mac
```

Generates a `.dmg` installer in the `release/` folder.

### Windows

```bash
npm run dist:win
```

Generates an `.exe` installer (NSIS) in the `release/` folder.

> **Note**: Cross-compilation is generally not supported. Build each target on its native platform.

## 🔒 Security

- Commands proposed by AI are not executed automatically
- You always have control: validation before execution
- Ability to modify commands before execution
- Configuration stored locally with electron-store

## 🐛 Troubleshooting

### Developer Tools (DevTools)

You can open Chrome DevTools to inspect and debug the application:

- **Keyboard shortcut**: Press `Ctrl+Shift+I` (Linux/Windows) or `Cmd+Option+I` (macOS) to toggle DevTools at any time
- **Auto-open on launch**: Set the `SHELLM_DEVTOOLS=true` environment variable to automatically open DevTools when the app starts (development mode only)

```bash
SHELLM_DEVTOOLS=true npm run dev
```

### Ollama Connection Error

1. Check that Ollama is running: `ollama serve`
2. Verify the URL in configuration
3. Test the connection from your browser: `http://localhost:11434/api/tags`

### Build Issues

- Linux: Make sure you have Python 3 and make installed
- macOS: Make sure you have Xcode Command Line Tools installed
- Windows: Make sure you have Visual Studio build tools installed

### node-pty won't compile

On Linux:
```bash
sudo apt-get install build-essential python3
npm rebuild node-pty
```

## 📝 Query Examples

- "List all Python files in the current directory"
- "Find files larger than 100MB in /home"
- "Show disk usage"
- "Count the number of lines in all .txt files"
- "Create a folder with today's date"

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

Copyright © 2026 Olivier Penhoat

## 👨‍💻 Author

Olivier Penhoat <openhoat@gmail.com>

## 🙏 Acknowledgments

- [Warp](https://www.warp.dev) for the inspiration
- The Ollama team for their excellent tool
- Anthropic for the Claude API
- [Claude Code](https://claude.ai/claude-code) — the AI assistant that built this project
- The open-source community