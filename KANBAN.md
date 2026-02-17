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

### 🟡 P2 - Medium Priority

- [ ] **[16/02/2026 20:31:00] 🟡 P2 🌍 [I18N]** Create GitHub Pages documentation site for users and restructure README for contributors

### 🟢 P3 - Low Priority

- [ ] **[17/02/2026 09:05:00] 🟢 P3 🔧 [DEVOPS]** Filter CHANGELOG to show only changes since last release tag - modify generate-changelog.js to detect latest tag and only include commits after that tag, add "since vX.Y.Z" header mention
- [ ] **[17/02/2026 08:59:00] 🟢 P3 ⚙️ [CONFIG]** Add DevTools documentation in README.md - document how to open DevTools in the Electron app (keyboard shortcut Ctrl+Shift+I / Cmd+Option+I, and SHELLM_DEVTOOLS=true environment variable)
- [ ] **[17/02/2026 10:15:00] 🟢 P3 ⚙️ [CONFIG]** Add sourcemaps for better debugging - enable sourcemaps only in dev mode (Vite frontend and TypeScript Electron backend) to get TypeScript source references in stack traces, keep prod build without sourcemaps
- [ ] **[17/02/2026 10:15:00] 🟢 P3 ⚙️ [CONFIG]** Enable sourcemaps for better debugging - configure sourcemaps in Vite (frontend) and TypeScript (Electron backend) only for dev mode, production builds should not include sourcemaps


## 🚧 In Progress

### [17/02/2026 09:09:54] 🔴 P1 🏗️ [ARCHITECTURE] Fix invalid Ollama URL error

- [x] **[17/02/2026 09:09:54] 🐛 [FIX]** Add try-catch error handling in createProvider and llm:init IPC handler in llm-service.ts
- [x] **[17/02/2026 09:09:54] 🐛 [FIX]** Handle empty/invalid URL gracefully in OllamaProvider constructor with improved error messages
- [x] **[17/02/2026 09:09:54] ✅ [TEST]** Add unit tests for Ollama URL validation and error handling