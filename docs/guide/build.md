# Build Executables

Termaid uses [electron-builder](https://www.electron.build/) to package the application into platform-specific distributables.

## Prerequisites

Before building, make sure the following tools are installed on your system:

| Platform | Required tools |
|----------|---------------|
| Linux    | `build-essential`, `python3`, `make` |
| macOS    | Xcode Command Line Tools (`xcode-select --install`) |
| Windows  | [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |

## Linux

```bash
npm run dist:linux
```

Generates `.AppImage` and `.deb` packages in the `release/` folder.

## macOS

```bash
npm run dist:mac
```

Generates a `.dmg` installer in the `release/` folder.

## Windows

```bash
npm run dist:win
```

Generates an `.exe` installer (NSIS) in the `release/` folder.

::: warning
Cross-compilation is generally not supported. Build each target on its native platform.
:::
