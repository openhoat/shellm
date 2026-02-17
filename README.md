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

📖 **[Full Documentation](https://openhoat.github.io/shellm/)**

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
| **Linux** | AppImage | [SheLLM-1.1.0.AppImage](https://github.com/openhoat/shellm/releases/latest/download/SheLLM-1.1.0.AppImage) |
| **Linux** | Debian/Ubuntu | [shellm_1.1.0_amd64.deb](https://github.com/openhoat/shellm/releases/latest/download/shellm_1.1.0_amd64.deb) |
| **macOS** | DMG (ARM) | [SheLLM-1.1.0-arm64.dmg](https://github.com/openhoat/shellm/releases/latest/download/SheLLM-1.1.0-arm64.dmg) |
| **Windows** | Installer | [SheLLM.Setup.1.1.0.exe](https://github.com/openhoat/shellm/releases/latest/download/SheLLM.Setup.1.1.0.exe) |

> See all versions on the [Releases page](https://github.com/openhoat/shellm/releases).

## 🔧 Development Setup

```bash
git clone https://github.com/openhoat/shellm.git
cd shellm
npm install
npm run dev
```

**Prerequisites**: Node.js 18+, npm, and an LLM provider (Ollama, Claude, or OpenAI).

> See the [Getting Started guide](https://openhoat.github.io/shellm/guide/getting-started) for detailed setup instructions including LLM provider configuration.

## 📖 Documentation

- [Getting Started](https://openhoat.github.io/shellm/guide/getting-started) — Installation and provider setup
- [Usage](https://openhoat.github.io/shellm/guide/usage) — How to use the AI assistant and keyboard shortcuts
- [Configuration](https://openhoat.github.io/shellm/guide/configuration) — Provider settings and environment variables
- [Build Executables](https://openhoat.github.io/shellm/guide/build) — Package the app for distribution
- [Troubleshooting](https://openhoat.github.io/shellm/guide/troubleshooting) — Common issues and solutions
- [Contributing](https://openhoat.github.io/shellm/guide/contributing) — How to contribute to the project

## 🔒 Security

- Commands proposed by AI are not executed automatically
- You always have control: validation before execution
- Ability to modify commands before execution
- Configuration stored locally with electron-store

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
