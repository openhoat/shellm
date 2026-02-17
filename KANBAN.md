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

### 🟡 P2 - Medium Priority

- [ ] **[16/02/2026 20:31:00] 🟡 P2 🌍 [I18N]** Create GitHub Pages documentation site for users and restructure README for contributors

### 🟢 P3 - Low Priority

- [ ] **[17/02/2026 08:59:00] 🟢 P3 ⚙️ [CONFIG]** Add DevTools documentation in README.md - document how to open DevTools in the Electron app (keyboard shortcut Ctrl+Shift+I / Cmd+Option+I, and SHELLM_DEVTOOLS=true environment variable)
- [ ] **[17/02/2026 10:15:00] 🟢 P3 ⚙️ [CONFIG]** Enable sourcemaps for better debugging - configure sourcemaps in Vite (frontend) and TypeScript (Electron backend) only for dev mode, production builds should not include sourcemaps

## 🚧 In Progress

## ✅ Done

- [x] **[17/02/2026 09:41:05] ✨ [FEAT]** Create /release skill and Cline workflow for automated versioning
- [x] **[17/02/2026 09:37:53] 🐛 [FIX]** Fix startup error "LLM service not initialized" - add automatic LLM initialization after config loads, improve error logging
- [x] **[17/02/2026 09:15:01] 🔧 [CHORE]** Filter CHANGELOG to show only changes since last release tag
- [x] **[17/02/2026 09:09:54] 🐛 [FIX]** Fix invalid Ollama URL error - handle empty/invalid URL gracefully with proper error handling and unit tests