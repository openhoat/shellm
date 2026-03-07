# Workflow: Cleanup Worktree

Remove a git worktree and its associated branch after PR merge.

## Purpose

Cleans up workspace after PR is merged:
- Verify we're in the main worktree
- Pull latest changes from origin
- Remove feature worktree
- Delete local branch

## Prerequisites

- Must be in main worktree (branch: main)
- PR must be merged
- No uncommitted changes in main

## Execution Steps

### 1. Verify worktree context

Check in main worktree:
```bash
git branch --show-current
```

Should show `main` or `master`.

### 2. Pull latest changes

```bash
git pull origin main
```

### 3. Update KANBAN.md

Remove task from "## 🚧 In Progress" section.

Note: There is no "Done" section - completed tasks are tracked in git history and CHANGELOG.md only.

### 4. Generate CHANGELOG.md

```bash
npm run changelog
```

### 5. Commit and Push maintenance

```bash
git add KANBAN.md CHANGELOG.md
git commit -m "chore(release): update kanban and changelog post-merge"
git push origin main
```

### 6. Resolve worktree name

Parse argument to find worktree:
- If no `termaid-` prefix, add it
- If branch name like `feat/feature`, convert to worktree name

### 7. Verify worktree exists

```bash
git worktree list
```

### 8. Remove worktree

```bash
git worktree remove ../termaid-<name>
```

### 9. Delete branch

```bash
git branch -d <branch-name>
```

### 10. Prune references

```bash
git worktree prune
```

### 11. Display success

Show cleanup summary and next steps.

## Name Resolution Examples

```
Input: "keyboard-shortcuts"
Worktree: "../termaid-keyboard-shortcuts"

Input: "feat/keyboard-shortcuts"
Worktree: "../termaid-keyboard-shortcuts"
Branch: "feat/keyboard-shortcuts"
```

## Important Rules

- Always in main: Must be in main worktree
- Verify PR merged: Check PR status before cleanup (usually done by user before calling this)
- Pull first: Always pull latest changes
- **Maintenance**: Always update Kanban and Changelog on main after merge
- Clean references: Prune worktree references after removal
