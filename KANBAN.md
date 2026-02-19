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

(No ideas in backlog)

## 🚧 In Progress

### [19/02/2026 19:00:00] 💡 [IDEA] #test-cov Improve test coverage (69.71% → 80%)

- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** ConfigPanel: Add tests for handleSave and handleReset
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** ConfigPanel: Add tests for testConnection (success/failure)
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** ConfigPanel: Add tests for input changes (URL, model, temperature, maxTokens)
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** ConfigPanel: Add tests for env badge display (envSources)
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** ChatPanel: Add tests for keyboard shortcuts (Ctrl+Enter, Ctrl+K, Escape)
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** ChatPanel: Add tests for handleSubmit and navigateHistory
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** ChatPanel: Add tests for isInterpreting and isExecuting states
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** ChatPanel: Add tests for auto-scroll and scroll-to-bottom button
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** Terminal: Add tests for handleTerminalData and ANSI filtering
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** Terminal: Add tests for handleTerminalExit
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** Terminal: Add tests for resize handling
- [ ] **[19/02/2026 19:00:00] ✅ [TEST]** Run npm run validate to verify all changes

## ✅ Done

### [19/02/2026 15:00:00] 💡 [IDEA] #test-cov-shared - Add tests for shared utilities

- [x] **[19/02/2026 15:00:00] ✅ [TEST]** Create tests for shared/ansi.ts (stripAnsiCodes, stripOscSequences)
- [x] **[19/02/2026 15:00:00] ✅ [TEST]** Create tests for shared/promptDetection.ts (detectPrompt, extractPrompt, waitForPrompt)
- [x] **[19/02/2026 15:00:00] ✅ [TEST]** Run npm run validate to verify changes

### [19/02/2026 17:30:00] 💡 [IDEA] #perf-wait - Implement smart wait for command interpretation

- [x] **[19/02/2026 17:30:00] 🚀 [PERFORMANCE]** Add detectPrompt import to useChat.ts
- [x] **[19/02/2026 17:30:00] 🚀 [PERFORMANCE]** Replace fixed COMMAND_OUTPUT_WAIT_TIME_MS with smart wait using prompt detection
- [x] **[19/02/2026 17:30:00] 🚀 [PERFORMANCE]** Fix build error in base-provider.ts (unused _escapedOutput variable)
- [x] **[19/02/2026 17:30:00] 🚀 [PERFORMANCE]** Run npm run validate to verify changes

### [19/02/2026 17:00:00] 💡 [IDEA] #devops-logs - Improve debugging logs

- [x] **[19/02/2026 17:00:00] 🔧 [DEVOPS]** Add Logger import and logger.warn to useStore.ts catch block
- [x] **[19/02/2026 17:00:00] 🔧 [DEVOPS]** Review other silent catch blocks in src/ and electron/
- [x] **[19/02/2026 17:00:00] 🔧 [DEVOPS]** Run npm run validate and fix any issues

### [19/02/2026 16:00:00] 💡 [IDEA] #devops-hook - Add Husky pre-push hook for npm run validate

- [x] **[19/02/2026 16:00:00] 🔧 [DEVOPS]** Create .husky/pre-push file with npm run validate
- [x] **[19/02/2026 16:00:00] 🔧 [DEVOPS]** Make hook executable
- [x] **[19/02/2026 16:00:00] 🔧 [DEVOPS]** Verify hook works

### [19/02/2026 15:30:00] 💡 [IDEA] #config-rules - Add TypeScript quality rules

- [x] **[19/02/2026 15:30:00] ⚙️ [CONFIG]** Add useArrowFunction: warn to biome.json style rules
- [x] **[19/02/2026 15:30:00] ⚙️ [CONFIG]** Add noFloatingPromises: error to biome.json suspicious rules
- [x] **[19/02/2026 15:30:00] ⚙️ [CONFIG]** Add noUnusedLocals: true to tsconfig.json
- [x] **[19/02/2026 15:30:00] ⚙️ [CONFIG]** Add noUnusedParameters: true to tsconfig.json
- [x] **[19/02/2026 15:30:00] ⚙️ [CONFIG]** Add same TypeScript options to electron/tsconfig.json

### [19/02/2026 15:00:00] 💡 [IDEA] #config-dist - Centralize generated files in dist/

- [x] **[19/02/2026 15:00:00] ⚙️ [CONFIG]** Update vitest.config.ts to output coverage to dist/coverage
- [x] **[19/02/2026 15:00:00] ⚙️ [CONFIG]** Update generate-demo-video.sh to output to dist/demo
- [x] **[19/02/2026 15:00:00] ⚙️ [CONFIG]** Update package.json test:coverage output to dist/coverage
- [x] **[19/02/2026 15:00:00] ⚙️ [CONFIG]** Remove coverage/ and demo-output/ from .gitignore

### [19/02/2026 14:30:00] 💡 [IDEA] #arch-services - Study merging llmService and ollamaService

- [x] **[19/02/2026 14:30:00] 🏗️ [ARCHITECTURE]** Analyze llmService.ts and ollamaService.ts implementations
- [x] **[19/02/2026 14:30:00] 🏗️ [ARCHITECTURE]** Identify common patterns and differences
- [x] **[19/02/2026 14:30:00] 🏗️ [ARCHITECTURE]** Document findings (services are quasi-identical, recommend merge)
- [x] **[19/02/2026 14:30:00] 🏗️ [ARCHITECTURE]** Note: Both services are actually dead code (not used) - can be removed

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