# Claude Code Rules

This directory contains project rules adapted for Claude Code.

## Rules

| File | Description |
|------|-------------|
| `commit_messages.md` | Git commit messages in Conventional Commits (English) |
| `language.md` | All content in English + respond in French to user |
| `log_changes.md` | Log modifications in CHANGELOG.md |
| `markdown_formatting.md` | Standard markdown formatting (no consecutive blank lines) |
| `mcp_intellij.md` | MCP IntelliJ integration for code analysis and navigation |
| `quality_check.md` | Run `npm run validate` after code modifications |
| `subagents.md` | When and how to use Claude Code subagents |
| `task_format.md` | Task format for KANBAN.md and CHANGELOG.md |
| `testing.md` | Testing standards (use `test` instead of `it`) |
| `worktree.md` | Native git worktrees workflow for multi-branch development |
| `error_recovery.md` | Error recovery workflows for task failures |

## Agents

Agents are specialized subagents with specific roles and tool access.

| Agent | Description | Tools |
|-------|-------------|-------|
| `quality-validator` | Validates code quality (Biome, TypeScript, tests) | `Bash(npm run validate*)`, `Bash(npm run qa:fix*)`, `run-validation`, `run-build`, `analyze-quality-report` |
| `test-runner` | Executes unit tests and generates coverage reports | `Bash(npm run test*)`, `run-tests`, `analyze-test-report`, `generate-coverage-report` |
| `code-reviewer` | Code review for quality, security and best practices | `Bash(npm run validate*)`, `read-kanban`, `run-validation`, `analyze-quality-report`, `Read`, `Glob`, `Grep` |
| `documentation-generator` | Generates and maintains project documentation | `Bash(npm run validate*)`, `read-kanban`, `run-validation`, `Read`, `Write`, `Edit`, `Glob`, `Grep` |
| `kanban-task-executor` | Executes KANBAN tasks and manages git commits | `Bash(npm run validate*)`, `Bash(npm run qa:fix*)`, `kanban`, `run-validation`, `workflow-commit`, `generate-changelog` |
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
| `/kanban` | Manage KANBAN.md (read/update tasks and ideas) |
| `/kanban-add-idea` | Add idea to backlog interactively |
| `/kanban-execute` | Select and execute backlog ideas |
| `/start-task` | Start Kanban task: update KANBAN.md, create worktree |
| `/complete-task` | Complete work in worktree: validate, commit, push, PR |

### Git & Release

| Command | Description |
|---------|-------------|
| `/create-worktree` | Create a new git worktree for a feature branch |
| `/list-worktrees` | List all git worktrees and branches |
| `/push-and-pr` | Push branch and create Pull Request |
| `/cleanup-worktree` | Remove worktree and branch after PR merge |
| `/generate-changelog` | Regenerate CHANGELOG.md from Git history |
| `/release` | Automate versioning (bump, changelog, commit, tag, push) |
| `/workflow-commit` | Complete workflow: validate, commit, changelog, kanban |