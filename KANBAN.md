# Kanban Board

**Priority Legend:**
- 🔴 **P1** = High Priority (critical, security, blocking issues)
- 🟡 **P2** = Medium Priority (important improvements)
- 🟢 **P3** = Low Priority (nice to have, enhancements)

**Category Icons (for Ideas):**
- 🔒 **[SECURITY]**: Security improvements (validation, sanitization, etc.)
- ✅ **[TEST]**: Testing improvements (unit tests, integration tests, coverage)
- 🚀 **[PERFORMANCE]**: Performance optimizations (caching, memoization, etc.)
- 🏗️ **[ARCHITECTURE]**: Code architecture improvements (refactoring, patterns)
- 🎨 **[UX]**: User experience improvements (shortcuts, tooltips, feedback)
- 🔧 **[DEVOPS]**: DevOps improvements (CI/CD, scripts, workflows)
- 🌍 **[I18N]**: Internationalization improvements (translations, locales)
- 📦 **[DEPENDENCIES]**: Dependency updates (package updates, upgrades)
- ⚙️ **[CONFIG]**: Configuration improvements (build tools, setup)

## 📝 Backlog

### 🔴 P1 - High Priority

(No high priority tasks in backlog)


### 🟡 P2 - Medium Priority

(No P2 tasks in backlog)


### 🟢 P3 - Low Priority

(No P3 tasks in backlog)

## 🚧 In Progress

- [x] **[13/02/2026 10:00:00] ✅ [TEST]** Add test coverage script and report
- [x] **[13/02/2026 10:00:00] 🚀 [PERFORMANCE]** Implement LLM response caching
- [x] **[13/02/2026 10:00:00] 🏗️ [ARCHITECTURE]** Centralize logging with proper log levels across the application
- [x] **[13/02/2026 10:00:00] 🎨 [UX]** Improve error messages to be more explicit
- [x] **[13/02/2026 10:00:00] 🎨 [UX]** Add progress indicator for long-running commands
- [x] **[13/02/2026 10:00:00] 🎨 [UX]** Implement keyboard shortcuts (Ctrl+Enter to execute, Ctrl+K to clear, Esc to cancel)
- [x] **[13/02/2026 10:00:00] 📝 [DOCS]** Add JSDoc documentation to functions
- [x] **[13/02/2026 10:00:00] 📦 [DEPENDENCIES]** Update axios dependency from 1.13.4 to latest version
- [x] **[13/02/2026 10:00:00] 📦 [DEPENDENCIES]** Update vitest dependency from 4.0.18 to latest version

## ✅ Done

### Security

- [x] **[12/02/2026 12:37:00]** 🔒 [SECURITY] Implement command validation (blacklist for dangerous commands like sudo rm -rf, mkfs, etc.)
- [x] **[12/02/2026 12:37:00]** 🔒 [SECURITY] Add input sanitization for user input in ChatPanel (prevent command injection)
- [x] **[12/02/2026 12:37:00]** 🔒 [SECURITY] Add URL validation for Ollama connection

### Tests

- [x] **[12/02/2026 12:37:00]** ✅ [TEST] Add React component tests (ChatPanel, Terminal, ConfigPanel, Header, ModelSelector, LanguageSelector)
- [x] **[12/02/2026 16:09:18]** ✅ [TEST] Fix the test:ui NPM script by installing @vitest/ui package
- [x] **[13/02/2026 00:10:00]** ✅ [TEST] Add Electron IPC Layer tests with mocks

### Configuration

- [x] **[12/02/2026 16:43:01]** ⚙️ [CONFIG] Clean up docs directory - remove LangChain feasibility and integration files
- [x] **[12/02/2026 14:22:39]** ⚙️ [CONFIG] Sort NPM scripts alphabetically in package.json
- [x] **[12/02/2026 10:29:32]** ⚙️ [CONFIG] Use WireIt to optimize NPM scripts

### Architecture

- [x] **[12/02/2026 14:20:41]** 🏗️ [ARCHITECTURE] Fix TypeScript UMD global variable warnings across project by importing explicit types
- [x] **[12/02/2026 12:37:00]** 🏗️ [ARCHITECTURE] Remove deprecated conversationHistory from useStore
- [x] **[12/02/2026 12:37:00]** 🏗️ [ARCHITECTURE] Refactor ChatPanel.tsx - extract useChat custom hook
- [x] **[12/02/2026 12:37:00]** 🏗️ [ARCHITECTURE] Implement centralized error handling with toast notifications

### UX

- [x] **[12/02/2026 14:25:28]** 🎨 [UX] Auto-focus chat input field after message submission for smoother conversation flow
- [x] **[12/02/2026 14:25:28]** 🎨 [UX] Increase terminal window height to fill available space
- [x] **[12/02/2026 12:37:00]** 🎨 [UX] Add tooltips to UI elements
- [x] **[12/02/2026 12:37:00]** 🎨 [UX] Implement dark/light theme toggle in components

### Performance

- [x] **[12/02/2026 12:37:00]** 🚀 [PERFORMANCE] Add lazy loading for ConfigPanel component
- [x] **[12/02/2026 12:37:00]** 🚀 [PERFORMANCE] Add debounce on user input in ChatPanel
- [x] **[12/02/2026 12:37:00]** 🚀 [PERFORMANCE] Implement React.memo and virtualization for ChatPanel messages

### DevOps

- [x] **[12/02/2026 12:37:00]** 🔧 [DEVOPS] Create CI/CD pipeline (GitHub Actions or GitLab CI) for tests, lint, and build

### I18N

- [x] **[12/02/2026 12:37:00]** 🌍 [I18N] Replace hardcoded strings in components with i18n translations