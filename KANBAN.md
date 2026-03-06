# Kanban Board

<!-- Format definitions: See .claude/rules/task_format.md -->

## 📝 Backlog

- [ ] **#bug-terminal-resize [06/03/2026 10:45:00] 🔴 P1 🐛 [BUG]** Fix terminal resize refresh - use ResizeObserver to detect container size changes instead of only window resize events
- [ ] **#arch-shell [25/02/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Create `termaidsh` meta-shell: interactive shell wrapper with AI command suggestion, pre-filled validation, and output interpretation (reusing shared LLM providers)
- [ ] **#perf-stats [26/02/2026 14:00:00] 🟢 P3 🚀 [PERFORMANCE]** Add usage statistics dashboard: commands executed, success/failure rate, response time per provider
- [ ] **#arch-export [26/02/2026 14:00:00] 🟢 P3 🏗️ [ARCHITECTURE]** Multi-format export: Markdown, PDF, HTML with syntax highlighting
- [ ] **#ux-context [26/02/2026 14:00:00] 🟢 P3 🎨 [UX]** Contextual AI suggestions based on current directory, project type detection, and recent commands
- [ ] **#devops-autoupdate [26/02/2026 14:00:00] 🟢 P3 🔧 [DEVOPS]** Implement auto-update: version check at startup, background download, changelog notification, rollback support

## 🚧 In Progress

### [04/03/2026 17:55:00] 💡 [IDEA] #arch-import Implement conversation import feature
- [ ] **[06/03/2026 17:55:00] ✨ [FEAT]** Implement conversation import feature: parse exported JSON, validate schema, restore conversations with messages, handle version compatibility

## ✅ Done