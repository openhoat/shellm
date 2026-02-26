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

- [ ] **#sec-proactive [26/02/2026 14:00:00] 🔴 P1 🔒 [SECURITY]** Add proactive command validation: heuristic analysis, warning modal for destructive commands, sandbox mode, and audit logging
- [ ] **#ux-shortcuts [26/02/2026 14:00:00] 🔴 P1 🎨 [UX]** Display keyboard shortcuts in UI: shortcut badges, tooltips on buttons, cheat sheet accessible via Ctrl+/ or ?
- [ ] **#arch-shell [25/02/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Create `termaidsh` meta-shell: interactive shell wrapper with AI command suggestion, pre-filled validation, and output interpretation (reusing shared LLM providers)
- [ ] **#perf-streaming [26/02/2026 14:00:00] 🟡 P2 🚀 [PERFORMANCE]** Implement LLM response streaming: progressive display, cancellation support, progress indicator
- [ ] **#arch-plugins [26/02/2026 14:00:00] 🟡 P2 🏗️ [ARCHITECTURE]** Create LLM plugin system: standardized plugin interface, dynamic loading, JSON config, support for custom providers (LM Studio, vLLM)
- [ ] **#perf-stats [26/02/2026 14:00:00] 🟢 P3 🚀 [PERFORMANCE]** Add usage statistics dashboard: commands executed, success/failure rate, response time per provider
- [ ] **#i18n-languages [26/02/2026 14:00:00] 🟢 P3 🌍 [I18N]** Add more translations: Spanish, German, Portuguese, Chinese, Japanese with community contribution support
- [ ] **#arch-export [26/02/2026 14:00:00] 🟢 P3 🏗️ [ARCHITECTURE]** Multi-format export: Markdown, PDF, HTML with syntax highlighting
- [ ] **#ux-context [26/02/2026 14:00:00] 🟢 P3 🎨 [UX]** Contextual AI suggestions based on current directory, project type detection, and recent commands
- [ ] **#devops-autoupdate [26/02/2026 14:00:00] 🟢 P3 🔧 [DEVOPS]** Implement auto-update: version check at startup, background download, changelog notification, rollback support

## 🚧 In Progress

## ✅ Done
