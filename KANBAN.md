# Kanban Board

<!-- Format definitions: See .claude/rules/task_format.md -->

## 📝 Backlog

- [ ] **#config-kanban-slim [05/03/2026 11:30:00] 🟡 P2 ⚙️ [CONFIG]** Remove legend sections from KANBAN.md (Priority Legend, Category Icons) - definitions already exist in task_format.md, keeps Kanban focused on tasks
- [ ] **#arch-import [04/03/2026 17:55:00] 🟡 P2 🏗️ [ARCHITECTURE]** Implement conversation import feature: parse exported JSON, validate schema, restore conversations with messages, handle version compatibility
- [ ] **#ux-conversations [04/03/2026 10:20:00] 🟡 P2 🎨 [UX]** Improve conversations panel UI - ensure delete button ('x') remains visible when conversation titles are long
- [ ] **#arch-shell [25/02/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Create `termaidsh` meta-shell: interactive shell wrapper with AI command suggestion, pre-filled validation, and output interpretation (reusing shared LLM providers)
- [ ] **#perf-stats [26/02/2026 14:00:00] 🟢 P3 🚀 [PERFORMANCE]** Add usage statistics dashboard: commands executed, success/failure rate, response time per provider
- [ ] **#arch-export [26/02/2026 14:00:00] 🟢 P3 🏗️ [ARCHITECTURE]** Multi-format export: Markdown, PDF, HTML with syntax highlighting
- [ ] **#ux-context [26/02/2026 14:00:00] 🟢 P3 🎨 [UX]** Contextual AI suggestions based on current directory, project type detection, and recent commands
- [ ] **#devops-autoupdate [26/02/2026 14:00:00] 🟢 P3 🔧 [DEVOPS]** Implement auto-update: version check at startup, background download, changelog notification, rollback support
- [ ] **#config-lang-merge [05/03/2026 10:04:00] 🟡 P2 ⚙️ [CONFIG]** Merge `language.md` and `language_preference.md` into a single rule file in both `.claude/rules/` and `.clinerules/`
- [ ] **#config-format-dedup [05/03/2026 10:04:00] 🟡 P2 ⚙️ [CONFIG]** Deduplicate tags/emojis/format definitions: make `task_format.md` the single source of truth, remove duplicates from `log_changes.md`, `commit_messages.md`, and agent files
- [ ] **#config-rules-condense [05/03/2026 10:04:00] 🟡 P2 ⚙️ [CONFIG]** Condense verbose rules: reduce `subagents.md` (-40%), `mcp_intellij.md` (-50%), `worktree.md` (-35%), `log_changes.md` (-40%) to minimize context window usage
- [ ] **#config-readme-slim [05/03/2026 10:04:00] 🟢 P3 ⚙️ [CONFIG]** Slim down `.claude/rules/README.md`: remove quick reference section (redundant with individual rules), keep only the file index
- [ ] **#config-skill-commit [05/03/2026 10:04:00] 🟡 P2 ⚙️ [CONFIG]** Remove `create-git-commit` skill (subset of `workflow-commit`) and update all references
- [ ] **#config-skill-kanban [05/03/2026 10:04:00] 🟢 P3 ⚙️ [CONFIG]** Merge `read-kanban` and `update-kanban` skills into a single `/kanban` skill with action parameter
- [ ] **#config-sync-clinerules [05/03/2026 10:04:00] 🟡 P2 ⚙️ [CONFIG]** Synchronize `.clinerules/` with `.claude/rules/` changes: port E2E Playwright section to `.claude/rules/testing.md`, align diverged content, keep tool-name adaptations (Edit vs replace_in_file)
- [ ] **#config-skill-agents [05/03/2026 10:04:00] 🟢 P3 ⚙️ [CONFIG]** Add missing entry-point skills for agents: `/code-review`, `/security-audit`, `/deps-update` to invoke corresponding agents
- [ ] **#config-error-recovery [05/03/2026 10:04:00] 🟢 P3 ⚙️ [CONFIG]** Document error recovery workflows: what to do when `/complete-task` fails mid-way, how to resume abandoned worktrees, how to resolve Kanban conflicts
- [ ] **#config-clinerules-wf [05/03/2026 10:04:00] 🟢 P3 ⚙️ [CONFIG]** Align `.clinerules/workflows/` with `.claude/skills/` additions: add missing Cline equivalents for new skills (worktree management, complete-task, start-task)

## 🚧 In Progress

## ✅ Done