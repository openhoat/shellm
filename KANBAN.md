# Kanban Board

<!-- Format definitions: See .claude/rules/task_format.md -->

## 📝 Backlog

<!-- Monorepo Architecture -->
- [ ] **[ARCHITECTURE]** Monorepo: Setup structure - create `packages/`, configure NPM workspaces, create `tsconfig.base.json` (P2)
- [ ] **[ARCHITECTURE]** Monorepo: Extract `@termaid/core` - move LLM providers, types, prompts, utils to shared package (P2)
- [ ] **[ARCHITECTURE]** Monorepo: Migrate `@termaid/electron` - move to packages, update imports to use `@termaid/core` (P2)
- [ ] **[ARCHITECTURE]** Monorepo: Verify build - ensure all tests pass, app runs correctly, no regressions (P2)
- [ ] **[DEVOPS]** Monorepo: Configure CI/CD - separate workflows for each package, shared caching (P3)
- [ ] **[DOCS]** Monorepo: Update documentation - README, contribution guide, package-specific docs (P3)

<!-- Discord Bot (optional consumer of @termaid/core) -->
- [ ] **[FEAT]** Discord bot: Create `@termaid/discord-bot` package structure - bot class, command handling (P3)
- [ ] **[FEAT]** Discord bot: Implement commands - `!tb` (generate), `!tb explain`, `!tb interpret` (P3)

<!-- Other ideas -->
- [ ] **[ARCHITECTURE]** Create `termaidsh` meta-shell: interactive shell wrapper with AI command suggestion, pre-filled validation, and output interpretation (reusing shared LLM providers) (P3)
- [ ] **[ARCHITECTURE]** Multi-format export: Markdown, PDF, HTML with syntax highlighting (P3)
- [ ] **[UX]** Contextual AI suggestions based on current directory, project type detection, and recent commands (P3)

## 🚧 In Progress

<!-- Tasks in progress appear here -->
- [ ] **[FEAT]** Add conversation checkpoints - ability to save and restore conversation states for exploring alternative discussion paths
  - Started: 11/03/2026
- [ ] **[FEAT]** Add conversation checkpoints - ability to save and restore conversation states for exploring alternative discussion paths
  - Started: 11/03/2026