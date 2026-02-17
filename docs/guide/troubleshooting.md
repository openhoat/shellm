# Troubleshooting

## Developer Tools (DevTools)

You can open Chrome DevTools to inspect and debug the application:

- **Keyboard shortcut**: Press `Ctrl+Shift+I` (Linux/Windows) or `Cmd+Option+I` (macOS) to toggle DevTools at any time
- **Auto-open on launch**: Set the `SHELLM_DEVTOOLS=true` environment variable to automatically open DevTools when the app starts (development mode only)

```bash
SHELLM_DEVTOOLS=true npm run dev
```

## Ollama Connection Error

1. Check that Ollama is running: `ollama serve`
2. Verify the URL in configuration
3. Test the connection from your browser: `http://localhost:11434/api/tags`

## Build Issues

- **Linux**: Make sure you have Python 3 and make installed
- **macOS**: Make sure you have Xcode Command Line Tools installed
- **Windows**: Make sure you have Visual Studio build tools installed

## node-pty Won't Compile

On Linux:

```bash
sudo apt-get install build-essential python3
npm rebuild node-pty
```

## Linux Wayland Issues

On Linux with Wayland, you may encounter warnings related to Wayland/Vulkan compatibility. To force X11 usage:

```bash
ELECTRON_OZONE_PLATFORM_HINT=x11 npm run dev
```

This avoids warnings like:
- `--ozone-platform=wayland is not compatible with Vulkan`
- Errors related to systemd
