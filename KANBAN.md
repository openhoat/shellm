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

- [ ] **#test-cov [19/02/2026 08:52:00] 🔴 P1 ✅ [TEST]** Improve test coverage (56.68% → 80%) - priority: useToast, useStore, Header, ConfigPanel

### 🟡 P2 - Medium Priority

- [ ] **#config-dist [19/02/2026 10:15:00] 🟡 P2 ⚙️ [CONFIG]** Centralize generated files in `dist/` (coverage, demo, distributables) and simplify npm clean script
- [ ] **#config-rules [19/02/2026 10:15:00] 🟡 P2 ⚙️ [CONFIG]** Add TypeScript quality rules
    - Use arrow functions instead of `function`
    - Fix "promise returned is ignored" and "unused constants"
    - Rely on IntelliJ for TS error detection
- [ ] **#arch-services [19/02/2026 10:15:00] 🟡 P2 🏗️ [ARCHITECTURE]** Study merging llmService and ollamaService into a single common service
- [ ] **#perf-wait [19/02/2026 08:52:00] 🟡 P2 🚀 [PERFORMANCE]** Implement smart wait for command interpretation (prompt detection instead of fixed COMMAND_OUTPUT_WAIT_TIME_MS)

### 🟢 P3 - Low Priority

- [ ] **#devops-logs [19/02/2026 08:52:00] 🟢 P3 🔧 [DEVOPS]** Improve debugging logs (silent catch blocks)
- [ ] **#devops-hook [19/02/2026 08:52:00] 🟢 P3 🔧 [DEVOPS]** Add Husky pre-push hook for npm run validate

## 🚧 In Progress

## ✅ Done

### [19/02/2026 11:10:10] 💡 [IDEA] #i18n-kanban - Translate KANBAN.md to English

- [x] **[19/02/2026 11:10:10] 🌍 [I18N]** Translate all idea descriptions in Backlog to English
- [x] **[19/02/2026 11:10:10] 🌍 [I18N]** Translate all task descriptions in Done section to English
- [x] **[19/02/2026 11:10:10] 🌍 [I18N]** Remove duplicate idea #doc-english after merging

### [19/02/2026 10:08:00] 💡 [IDEA] #arch-ansi - Refactor duplicate ANSI functions

- [x] **[19/02/2026 10:08:00] ♻️ [REFACTOR]** Create shared/ansi.ts with stripAnsiCodes and stripOscSequences
- [x] **[19/02/2026 10:08:00] ♻️ [REFACTOR]** Update Terminal.tsx to import from @shared/ansi
- [x] **[19/02/2026 10:08:00] ♻️ [REFACTOR]** Update base-provider.ts to import from @shared/ansi
- [x] **[19/02/2026 10:08:00] ♻️ [REFACTOR]** Remove duplicate function implementations

### [19/02/2026 09:49:00] 💡 [IDEA] #dep-update - Update dependencies

- [x] **[19/02/2026 09:49:00] 📦 [DEPENDENCIES]** Update electron to 40.5.0
- [x] **[19/02/2026 09:49:00] 📦 [DEPENDENCIES]** Update @biomejs/biome to 2.4.2
- [x] **[19/02/2026 09:49:00] 📦 [DEPENDENCIES]** Update i18next to 25.8.11
- [x] **[19/02/2026 09:49:00] 📦 [DEPENDENCIES]** Update @langchain/* packages

### [19/02/2026 10:05:00] 💡 [IDEA] #doc-model - Set llama3.2:3b as default model

- [x] **[19/02/2026 10:05:00] 📝 [DOCS]** Set llama3.2:3b as default model in shared/config.ts
- [x] **[19/02/2026 10:05:00] 📝 [DOCS]** Add recommended models section to README.md
- [x] **[19/02/2026 10:05:00] 📝 [DOCS]** Update getting-started.md with model alternatives

### [19/02/2026 10:05:00] 💡 [IDEA] #devops-release - Improve release workflow

- [x] **[19/02/2026 10:05:00] 🔧 [DEVOPS]** Create scripts/bump-version.js for centralized version management
- [x] **[19/02/2026 10:05:00] 🔧 [DEVOPS]** Add bump-version npm script to package.json
- [x] **[19/02/2026 10:05:00] 🔧 [DEVOPS]** Update release workflow documentation