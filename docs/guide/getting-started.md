# Getting Started

## Quick Install

Download the latest release for your platform:

| Platform | Format | Download |
|----------|--------|----------|
| **Linux** | AppImage | [Termaid-1.2.3.AppImage](https://github.com/openhoat/termaid/releases/latest/download/Termaid-1.2.3.AppImage) |
| **Linux** | Debian/Ubuntu | [termaid_1.2.3_amd64.deb](https://github.com/openhoat/termaid/releases/latest/download/termaid_1.2.3_amd64.deb) |
| **macOS** | DMG (ARM) | [Termaid-1.2.3-arm64.dmg](https://github.com/openhoat/termaid/releases/latest/download/Termaid-1.2.3-arm64.dmg) |
| **Windows** | Installer | [Termaid.Setup.1.2.3.exe](https://github.com/openhoat/termaid/releases/latest/download/Termaid.Setup.1.2.3.exe) |

> See all versions on the [Releases page](https://github.com/openhoat/termaid/releases).

### Linux (AppImage)

```bash
chmod +x Termaid-1.2.3.AppImage
./Termaid-1.2.3.AppImage
```

### Linux (Debian/Ubuntu)

```bash
sudo dpkg -i termaid_1.2.3_amd64.deb
```

### macOS

Open the `.dmg` file and drag Termaid to your Applications folder.

### Windows

Run the `Termaid.Setup.1.2.3.exe` installer and follow the steps.

## Development Setup

If you want to run Termaid from source:

### Prerequisites

- Node.js 18+ and npm
- Ollama installed and running (for local use)
- Python 3 and make (for node-pty compilation on Linux)

### Clone and install

```bash
git clone https://github.com/openhoat/termaid.git
cd termaid
npm install
```

### Configure an LLM provider

Termaid supports multiple providers. Choose one (or more):

#### Option A — Ollama (local or remote)

Visit [ollama.ai](https://ollama.ai) and follow the installation instructions for your operating system.

```bash
ollama serve
ollama pull llama2   # or any model of your choice
```

If you're using Ollama on a remote machine, configure the URL in the Termaid configuration panel.

#### Option B — Claude (Anthropic API)

Get an API key from [console.anthropic.com](https://console.anthropic.com) and set it as an environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Then select **Claude** as the provider in the configuration panel.

#### Option C — OpenAI

Get an API key from [platform.openai.com](https://platform.openai.com) and set it as an environment variable:

```bash
export TERMAID_OPENAI_API_KEY=sk-...
```

Then select **OpenAI** as the provider in the configuration panel.

### Run the application

```bash
npm run dev
```

This will start:
- The Vite development server (port 5173)
- The Electron application

#### Linux with Wayland

On Linux with Wayland, you may encounter warnings related to Wayland/Vulkan compatibility. To force X11 usage:

```bash
ELECTRON_OZONE_PLATFORM_HINT=x11 npm run dev
```
