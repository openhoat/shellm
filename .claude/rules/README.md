# Claude Code Rules

This directory contains project rules adapted for Claude Code.

## Rules

| File | Description |
|------|-------------|
| `commit_messages.md` | Git commit messages in Conventional Commits (English) |
| `language.md` | All content must be in English (except src/locales/fr.json) |
| `language_preference.md` | Respond in French to user unless specified otherwise |
| `log_changes.md` | Log modifications in CHANGELOG.md |
| `markdown_formatting.md` | Standard markdown formatting (no consecutive blank lines) |
| `mcp_intellij.md` | MCP IntelliJ integration for code analysis and navigation |
| `quality_check.md` | Run `npm run validate` after code modifications |
| `subagents.md` | When and how to use Claude Code subagents |
| `task_format.md` | Task format for KANBAN.md and CHANGELOG.md |
| `testing.md` | Testing standards (use `test` instead of `it`) |

## Agents

Agents are specialized subagents with specific roles and tool access.

| Agent | Description | Tools |
|-------|-------------|-------|
| `quality-validator` | Validates code quality (Biome, TypeScript, tests) | `Bash(npm run validate*)`, `Bash(npm run qa:fix*)`, `run-validation`, `run-build`, `analyze-quality-report` |
| `test-runner` | Executes unit tests and generates coverage reports | `Bash(npm run test*)`, `run-tests`, `analyze-test-report`, `generate-coverage-report` |
| `code-reviewer` | Code review for quality, security and best practices | `Bash(npm run validate*)`, `read-kanban`, `run-validation`, `analyze-quality-report`, `Read`, `Glob`, `Grep` |
| `documentation-generator` | Generates and maintains project documentation | `Bash(npm run validate*)`, `read-kanban`, `run-validation`, `Read`, `Write`, `Edit`, `Glob`, `Grep` |
| `kanban-task-executor` | Executes KANBAN tasks and manages git commits | `Bash(npm run validate*)`, `Bash(npm run qa:fix*)`, `read-kanban`, `update-kanban`, `run-validation`, `create-git-commit`, `generate-changelog` |
| `security-auditor` | Security audit for vulnerability detection | `Bash(npm audit*)`, `Read`, `Glob`, `Grep` |
| `performance-analyzer` | Performance optimization and bottleneck detection | `Bash(npm run*)`, `Read`, `Glob`, `Grep` |
| `dependency-manager` | Manage package dependencies and updates | `Bash(npm*)`, `Read`, `Edit`, `Glob`, `Grep` |

## Skills (Slash Commands)

Skills are located in `.claude/skills/` and can be invoked with `/skill-name`.

### Validation & Build

| Command | Description |
|---------|-------------|
| `/run-validation` | Comprehensive project validation (Biome QA, build, tests) with analysis |
| `/run-build` | Build the project (Vite + Electron) |
| `/run-tests` | Execute unit tests with Vitest |
| `/parallel-test` | Run tests in parallel using subagents |
| `/generate-coverage-report` | Generate detailed code coverage report |

### Analysis

| Command | Description |
|---------|-------------|
| `/analyze-quality-report` | Analyze Biome linting issues |
| `/analyze-test-report` | Analyze test failures and coverage |

### KANBAN Workflow

| Command | Description |
|---------|-------------|
| `/read-kanban` | Read and parse KANBAN.md |
| `/update-kanban` | Update KANBAN.md task statuses |
| `/kanban-add-idea` | Add idea to backlog interactively |
| `/kanban-execute` | Select and execute backlog ideas |

### Git & Release

| Command | Description |
|---------|-------------|
| `/create-git-commit` | Create commit with Conventional Commits format |
| `/generate-changelog` | Regenerate CHANGELOG.md from Git history |
| `/release` | Automate versioning (bump, changelog, commit, tag, push) |
| `/workflow-commit` | Complete workflow: validate, commit, changelog, kanban |

## Workflow

When working on this project with Claude Code:

1. **Read and understand** the rules before starting work
2. **Use English** for all code, comments, documentation, and commit messages
3. **Follow Kanban workflow** when working on tasks:
   - Use `/kanban-execute` to select and execute backlog ideas
   - Use `/kanban-add-idea` to add new ideas to backlog
   - Use `/read-kanban` to check current state
4. **Run quality checks** (`/run-validation` or `/workflow-commit`) after each code modification
5. **Log changes** in CHANGELOG.md after successful modifications
6. **Follow Conventional Commits** for all git commits

## Quick Reference

### Commit Message Format
```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### CHANGELOG Entry Format
```
**[HH:MM:SS] ✨ [FEAT]** Description
```

Tags: `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[PERF]`, `[DOCS]`, `[STYLE]`, `[TEST]`, `[CHORE]`

### Kanban Workflow Summary
1. `/kanban-add-idea` - Add ideas to backlog
2. `/kanban-execute` - Select and execute ideas
3. Complete tasks and mark as done
4. Use `/workflow-commit` for full automation
5. Or: `/create-git-commit` + `/generate-changelog`

### Recommended Agent Usage

| Task | Agent to Use |
|------|--------------|
| Code quality validation | `quality-validator` |
| Test execution | `test-runner` |
| Code review | `code-reviewer` |
| Documentation | `documentation-generator` |
| KANBAN tasks | `kanban-task-executor` |
| Security audit | `security-auditor` |
| Performance analysis | `performance-analyzer` |
| Dependency management | `dependency-manager` |