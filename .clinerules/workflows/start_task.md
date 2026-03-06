# Workflow: Start Task

Start a Kanban task by selecting an idea from the backlog, updating KANBAN.md on main branch, and creating a worktree.

## Purpose

Integrates Kanban workflow with git worktrees for:
- Systematic task selection from backlog
- KANBAN.md updates committed on main branch
- Isolated worktrees for each feature/fix

## Prerequisites

- Must be in the main worktree (branch: main)
- KANBAN.md must exist at project root
- Backlog must have at least one idea

## Execution Steps

### 1. Verify worktree context

Check that we are in the main worktree:
```bash
git worktree list
```

If not in main, error and instruct user to switch.

### 2. Read KANBAN.md

Parse ideas from "## 📝 Backlog" section.

### 3. Display backlog ideas

Show numbered list and ask user to select.

### 4. Generate branch name

Convert idea description to kebab-case:
- `[ARCHITECTURE]` → `refactor/`
- `[UX]` → `feat/`
- `[TEST]` → `test/`
- `[SECURITY]` → `fix/`
- `[CONFIG]` → `chore/`

### 5. Update KANBAN.md

Move idea from Backlog to In Progress using `replace_in_file`.

### 6. Commit KANBAN.md on main

```bash
git add KANBAN.md
git commit -m "chore(kanban): start task #<id> - <description>"
```

### 7. Create branch and worktree

```bash
git branch <branch-name> main
git worktree add ../termaid-<worktree-name> <branch-name>
```

### 8. Enter worktree automatically

Switch the session to the new worktree and continue work:
```bash
cd ../termaid-<worktree-name>
```

### 9. Display success message

Show worktree path and confirm automatic continuation.

## Important Rules

- Always on main: KANBAN.md must be committed on main branch
- One idea per worktree: Each worktree = one task/PR
- Commit before worktree: Always commit KANBAN.md first
- **No interruption**: Continue implementation immediately in the worktree
