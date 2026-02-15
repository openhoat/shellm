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

A modern terminal powered by artificial intelligence with Ollama, inspired by WARP. SheLLM allows you to describe what you want to do in natural language and the AI generates the appropriate shell commands.

## 🚀 Features

- **Terminal Base**: Full terminal interface with xterm.js
- **Integrated AI**: Generate shell commands from natural language descriptions
- **Ollama Support**: Configurable connection to Ollama instances (local or remote)
- **Modern Interface**: Dark theme by default with optional light theme
- **Flexible Configuration**: Ollama URL, model, temperature, and more
- **History**: Track conversations and executed commands

## 📋 Prerequisites

- Node.js 18+ and npm
- Ollama installed and running (for local use)
- Python 3 and make (for node-pty compilation on Linux)

## 🔧 Installation

### 1. Clone the project

```bash
git clone https://github.com/openhoat/shellm.git
cd shellm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install and configure Ollama

#### Installing Ollama

Visit [ollama.ai](https://ollama.ai) and follow the installation instructions for your operating system.

#### Starting Ollama

```bash
ollama serve
```

#### Download a model

```bash
ollama pull llama2
# or any other model of your choice
```

#### Using a remote instance

If you're using Ollama on a remote machine, configure the URL in the SheLLM configuration panel.

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

### Production Build

```bash
npm run build
```

### Create Executables

#### Linux

```bash
npm run dist:linux
```

#### macOS

```bash
npm run dist:mac
```

#### Windows

```bash
npm run dist:win
```

Executable files will be created in the `release/` folder.

## 📖 User Guide

### First Use

1. Launch the application with `npm run dev`
2. Click the gear icon in the top right to open configuration
3. Configure your Ollama instance URL (default: `http://localhost:11434`)
4. Click "Test connection" to verify the connection
5. Select the model you want to use
6. Click "Save"

### Using the AI

1. In the right panel (AI Assistant), type your request in natural language
   - Example: "List all files larger than 10MB in the current directory"
2. The AI will analyze your request and propose a shell command
3. You can:
   - **Execute**: Run the command directly in the terminal
   - **Edit**: Adjust the command before execution
   - **Cancel**: Ignore the proposal

### Using the Terminal

The terminal on the left works like a classic terminal. You can:
- Type commands directly
- Navigate through directories
- Run any shell command

## ⚙️ Configuration

### Ollama

- **URL**: Address of your Ollama instance (local or remote)
- **API Key**: Optional, if your Ollama instance requires authentication
- **Model**: Ollama model to use (llama2, mistral, etc.)
- **Temperature**: Controls AI creativity (0 = more precise, 1 = more creative)
- **Max Tokens**: Maximum number of tokens in the response

### Interface

- **Theme**: Dark (default) or Light
- **Font Size**: Adjust text size (10-20px)

## 🏗️ Architecture

### Project Structure

```
shellm/
├── electron/              # Electron main process
│   ├── main.ts           # Entry point
│   ├── preload.ts        # Preload script
│   ├── ipc-handlers/     # IPC handlers
│   │   ├── terminal.ts   # Terminal management
│   │   ├── llm-service.ts # LLM service (Ollama)
│   │   ├── conversation.ts # Conversation management
│   │   └── config.ts     # Configuration management
│   ├── services/         # Electron services
│   │   └── conversationService.ts
│   ├── prompts/          # LLM prompt templates
│   └── tsconfig.json     # TypeScript configuration
├── src/                   # Renderer process (React)
│   ├── components/       # React components
│   │   ├── Terminal.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── Header.tsx
│   │   └── ConfigPanel.tsx
│   ├── store/            # State management (Zustand)
│   ├── types/            # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── App.css
├── shared/               # Shared code
│   └── types.ts          # Common TypeScript types
├── dist/                 # React build (generated)
├── dist-electron/        # Electron build (generated)
├── release/              # Executables (generated)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Technologies Used

- **Electron**: Desktop application framework
- **React**: UI library
- **TypeScript**: Static typing
- **Vite**: Build tool and dev server
- **xterm.js**: Terminal emulator
- **node-pty**: PTY terminal emulation
- **Zustand**: State management
- **LangChain**: LLM framework for structured outputs
- **Ollama**: Local LLM
- **Axios**: HTTP client
- **Vitest**: Test framework
- **Biome**: Code quality and formatting

## 🧪 Tests

SheLLM uses a test architecture with **Vitest** that separates business logic from the Electron layer, allowing approximately **80% of the code** to be tested without depending on Electron.

### What is Tested

✅ **State Logic (Zustand)**: State management, actions (setConfig, setAiCommand, addToHistory, etc.)
✅ **React Components**: Rendering logic and user interactions
✅ **Shared Types**: Data structures
✅ **Electron IPC Layer**: Config, Conversation, LLM Service, Terminal handlers
❌ **Electron Window**: `electron/main.ts`
❌ **Full Integration**: E2E tests

### Running Tests

```bash
# Run tests
npm test

# Watch mode (auto-re-run)
npm run test:watch

# UI mode (interactive interface)
npm run test:ui
```

### Adding a New Test

1. Create a `.test.ts` or `.test.tsx` file next to the source file
2. Use the `window.electronAPI` mocks defined in `src/test/setup.ts`
3. Run tests with `npm test`

## 📝 Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) enforced via commitlint and Git hooks.

Types: `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore` | `revert`

## 🔒 Security

- Commands proposed by AI are not executed automatically
- You always have control: validation before execution
- Ability to modify commands before execution
- Configuration stored locally with electron-store

## 🐛 Troubleshooting

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

- WARP for the inspiration
- The Ollama team for their excellent tool
- The open-source community