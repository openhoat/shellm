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

- [ ] **[12/02/2026 14:25:28] 🟡 P2 🎨 [UX]** Auto-focus chat input field after message submission for smoother conversation flow
- [ ] **[12/02/2026 14:25:28] 🟡 P2 🎨 [UX]** Increase terminal window height to fill available space
- [ ] **[12/02/2026 12:37:00] 🟡 P2 🏗️ [ARCHITECTURE]** Refactor ChatPanel.tsx - extract useChat custom hook
- [ ] **[12/02/2026 12:37:00] 🟡 P2 🏗️ [ARCHITECTURE]** Implement centralized error handling with toast notifications
- [ ] **[12/02/2026 12:37:00] 🟡 P2 🚀 [PERFORMANCE]** Implement React.memo and virtualization for ChatPanel messages
- [ ] **[12/02/2026 12:37:00] 🟡 P2 🔧 [DEVOPS]** Create CI/CD pipeline (GitHub Actions or GitLab CI) for tests, lint, and build
- [ ] **[12/02/2026 10:29:32] 🟡 P2 ⚙️ [CONFIG]** Use WireIt to optimize NPM scripts

### 🟢 P3 - Low Priority

- [ ] **[12/02/2026 14:22:39] 🟢 P3 ⚙️ [CONFIG]** Sort NPM scripts alphabetically in package.json
- [ ] **[12/02/2026 14:20:41] 🟢 P3 🏗️ [ARCHITECTURE]** Fix TypeScript UMD global variable warnings across project by importing explicit types (e.g., React.CSSProperties → CSSProperties)
- [ ] **[12/02/2026 12:37:00] 🟢 P3 ✅ [TEST]** Add Electron IPC Layer tests with mocks
- [ ] **[12/02/2026 12:37:00] 🟢 P3 ✅ [TEST]** Add test coverage script and report
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🔒 [SECURITY]** Add URL validation for Ollama connection
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🚀 [PERFORMANCE]** Add lazy loading for ConfigPanel component
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🚀 [PERFORMANCE]** Implement LLM response caching
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🚀 [PERFORMANCE]** Add debounce on user input in ChatPanel
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🏗️ [ARCHITECTURE]** Centralize logging with proper log levels across the application
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🏗️ [ARCHITECTURE]** Remove deprecated conversationHistory from useStore
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🎨 [UX]** Add tooltips to UI elements
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🎨 [UX]** Improve error messages to be more explicit
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🎨 [UX]** Add progress indicator for long-running commands
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🎨 [UX]** Implement keyboard shortcuts (Ctrl+Enter to execute, Ctrl+K to clear, Esc to cancel)
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🎨 [UX]** Implement dark/light theme toggle in components
- [ ] **[12/02/2026 12:37:00] 🟢 P3 ✨ [FEAT]** Add conversation export/import functionality
- [ ] **[12/02/2026 12:37:00] 🟢 P3 📝 [DOCS]** Add JSDoc documentation to functions
- [ ] **[12/02/2026 12:37:00] 🟢 P3 🌍 [I18N]** Replace hardcoded strings in components with i18n translations
- [ ] **[12/02/2026 12:37:00] 🟢 P3 📦 [DEPENDENCIES]** Update axios dependency from 1.13.4 to latest version
- [ ] **[12/02/2026 12:37:00] 🟢 P3 📦 [DEPENDENCIES]** Update vitest dependency from 4.0.18 to latest version

## 🚧 In Progress

### [12/02/2026 12:37:00] 🔴 P1 ✅ [TEST] Add React component tests (ChatPanel, Terminal, ConfigPanel, Header, ModelSelector, LanguageSelector)

- [ ] **[12/02/2026 14:00:00] 🎨 [STYLE]** Create ChatPanel.test.tsx
- [ ] **[12/02/2026 14:00:00] 🎨 [STYLE]** Create Terminal.test.tsx
- [ ] **[12/02/2026 14:00:00] 🎨 [STYLE]** Create ConfigPanel.test.tsx
- [ ] **[12/02/2026 14:00:00] 🎨 [STYLE]** Create Header.test.tsx
- [ ] **[12/02/2026 14:00:00] 🎨 [STYLE]** Create ModelSelector.test.tsx
- [ ] **[12/02/2026 14:00:00] 🎨 [STYLE]** Create LanguageSelector.test.tsx

## ✅ Done

- [x] **[12/02/2026 12:37:00] 🔴 P1 🔒 [SECURITY]** Implement command validation (blacklist for dangerous commands like sudo rm -rf, mkfs, etc.)
- [x] **[12/02/2026 12:37:00] 🔴 P1 🔒 [SECURITY]** Add input sanitization for user input in ChatPanel (prevent command injection)