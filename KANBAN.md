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

- [ ] **#test-e2e-ci [21/02/2026 09:45:00] 🔴 P1 ✅ [TEST]** Fix flaky E2E tests in CI (10 failures: keyboard-shortcuts, conversation-lifecycle, config-persistence, error-handling — timing/selector issues in headless Electron)
- [ ] **#sec-ipc [21/02/2026 10:00:00] 🔴 P1 🔒 [SECURITY]** Fix path traversal in `video:save-to-path` and add server-side command validation in `terminal:write` IPC handler
- [ ] **#sec-config [21/02/2026 10:00:00] 🔴 P1 🔒 [SECURITY]** Add input validation on `config:set` IPC handler and shell allowlist in terminal handler
- [ ] **#fix-configpanel [21/02/2026 10:00:00] 🔴 P1 🏗️ [ARCHITECTURE]** Fix duplicate chat-language field in ConfigPanel (invalid HTML, broken a11y)
- [ ] **#perf-zustand [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Add Zustand selectors with `useShallow` to prevent unnecessary re-renders across all components
- [ ] **#perf-bundle [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Add Vite code splitting (`manualChunks`) and lazy-load ConfigPanel with `React.lazy`
- [ ] **#perf-terminal [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Batch terminal output processing and throttle Resizer with `requestAnimationFrame`
- [ ] **#perf-convo [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Add in-memory cache for ConversationService and switch to async file I/O
- [ ] **#arch-dedup [21/02/2026 10:00:00] 🟡 P2 🏗️ [ARCHITECTURE]** Consolidate duplicated code (OllamaService/LLMService, dangerous command checks, model lists)
- [ ] **#arch-reload [21/02/2026 10:00:00] 🟡 P2 🏗️ [ARCHITECTURE]** Replace `window.location.reload()` with proper state reset for conversation switching
- [ ] **#i18n-strings [21/02/2026 10:00:00] 🟡 P2 🌍 [I18N]** Replace hardcoded French/English strings with i18n keys in services and Header component
- [ ] **#dep-xterm [21/02/2026 10:00:00] 🟡 P2 📦 [DEPENDENCIES]** Migrate deprecated `xterm` to `@xterm/xterm` and run `npm audit fix` for fixable vulnerabilities
- [ ] **#test-cov [21/02/2026 10:00:00] 🟡 P2 ✅ [TEST]** Add unit tests for `useChat.ts` (525 lines, 0%), `base-provider.ts` (402 lines), and `conversationService.ts` (233 lines)
- [ ] **#sec-mock [21/02/2026 10:00:00] 🟡 P2 🔒 [SECURITY]** Strip E2E mock code from production builds (gate behind `NODE_ENV === 'test'`)
- [ ] **#ux-a11y [21/02/2026 10:00:00] 🟢 P3 🎨 [UX]** Improve accessibility (Resizer ARIA roles, Terminal ARIA labels, dropdown keyboard nav, spinner status)
- [ ] **#sec-keys [21/02/2026 10:00:00] 🟢 P3 🔒 [SECURITY]** Use Electron `safeStorage` for API keys and disable DevTools in production builds
- [ ] **#arch-types [21/02/2026 10:00:00] 🟢 P3 🏗️ [ARCHITECTURE]** Fix unsafe type assertions, Terminal cleanup leak, store async error handling, and export consistency
- [ ] **#dep-update [21/02/2026 10:00:00] 🟢 P3 📦 [DEPENDENCIES]** Apply patch/minor dependency updates (`@langchain/*`, `biome`, `electron`, `i18next`, etc.)

## 🚧 In Progress

## ✅ Done