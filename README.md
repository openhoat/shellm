# SheLLM - AI-Powered Terminal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/openhoat/shellm?style=social)](https://github.com/openhoat/shellm/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/openhoat/shellm?style=social)](https://github.com/openhoat/shellm/network/members)
[![GitHub issues](https://img.shields.io/github/issues/openhoat/shellm)](https://github.com/openhoat/shellm/issues)

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://github.com/openhoat/shellm)

A modern terminal powered by artificial intelligence with Ollama, inspired by WARP. SheLLM allows you to describe what you want to do in natural language and the AI generates the appropriate shell commands.

## 🚀 Features

- **Terminal Base**: Full terminal interface with xterm.js
- **Integrated AI**: Generate shell commands from natural language descriptions
- **Ollama Support**: Configurable connection to Ollama instances (local or remote)
- **Modern Interface**: Dark theme by default with optional light theme
- **Flexible Configuration**: Ollama URL, model, temperature, and more
- **History**: Track conversations and executed commands

## ⭐ Star us on GitHub!

If this project is useful to you, don't forget to [star it on GitHub](https://github.com/openhoat/shellm)! 🚀

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Ollama installed and running (for local use)
- Python 3 and make (for node-pty compilation on Linux)

## 🔧 Installation

### 1. Clone the project

```bash
git clone <repository-url>
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

## 🚀 Quick Start

```bash
git clone https://github.com/openhoat/shellm.git
cd shellm
npm install
npm run dev
```

For full functionality, make sure you have [Ollama](https://ollama.ai) installed and running.

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
│   │   ├── ollama.ts     # Ollama service
│   │   └── config.ts     # Configuration management
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
- **Ollama**: Local LLM
- **Axios**: HTTP client

## 📦 CHANGELOG Archiving

SheLLM features an automatic archiving system to maintain a concise CHANGELOG.md while preserving full history.

### Retention Policy

- **Recent changes (last 30 days)**: kept in `CHANGELOG.md`
- **Older changes (over 30 days)**: archived in `CHANGELOG_ARCHIVE.md`

### Manual Archiving Command

```bash
npm run archive-changelog
```

### Configurable Retention Period

The retention period can be customized via an environment variable:

```bash
CHANGELOG_RETENTION_DAYS=60 npm run archive-changelog
```

### Affected Files

- **CHANGELOG.md**: Contains recent changes (≤ 30 days)
- **CHANGELOG_ARCHIVE.md**: Contains archived history (> 30 days)
- **.clinerules/workflows/archive_changelog.md**: Detailed archiving workflow

## 🧪 Tests

SheLLM uses a test architecture with **Vitest** that separates business logic from the Electron layer, allowing approximately **80% of the code** to be tested without depending on Electron.

### What is Tested

✅ **State Logic (Zustand)**: State management, actions (setConfig, setAiCommand, addToHistory, etc.)
✅ **React Components**: Rendering logic and user interactions
✅ **Shared Types**: Data structures

### What is NOT Tested

❌ **Electron IPC Layer**: `electron/ipc-handlers/`
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

### Test Structure

```
src/
├── test/
│   ├── setup.ts              # Configuration + mocks window.electronAPI
│   └── README.md             # Test documentation
├── store/
│   └── useStore.test.ts      # Zustand store tests
└── components/
    └── Header.test.tsx       # React component tests
```

### Adding a New Test

1. Create a `.test.ts` or `.test.tsx` file in the corresponding folder
2. Use the `window.electronAPI` mocks defined in `src/test/setup.ts`
3. Run tests with `npm test`

## 📝 Commit Conventions

This project uses **commitlint** to standardize commit messages according to the [Conventional Commits](https://www.conventionalcommits.org/) format.

### Commit Format

```
<type>(<scope>): <subject>
```

### Allowed Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Styling/formatting (no code change)
- **refactor**: Refactoring
- **perf**: Performance
- **test**: Tests
- **chore**: Maintenance/Configuration
- **revert**: Revert a commit

### Examples

```bash
git commit -m "feat: add Ollama configuration support"
git commit -m "fix: resolve terminal connection error"
git commit -m "docs: update README"
git commit -m "style: format code with Biome"
git commit -m "refactor: simplify Zustand store logic"
git commit -m "perf: optimize rendering performance"
git commit -m "test: add tests for Terminal component"
git commit -m "chore: update dependencies"
```

### Automatic Validation

A Git hook automatically validates the format of each commit before applying it. If the format is incorrect, the commit will be rejected.

### Manual Validation

To validate a commit message manually:

```bash
npm run commit:lint
```

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