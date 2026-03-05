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

### 3. Resolve worktree name

Parse argument to find worktree:
- If no `termaid-` prefix, add it
- If branch name like `feat/feature`, convert to worktree name

### 4. Verify worktree exists

```bash
git worktree list
```

### 5. Check PR status (optional)

```bash
gh pr view <branch-name> --json state,mergedAt
```

### 6. Remove worktree

```bash
git worktree remove ../termaid-<name>
```

If fails with uncommitted changes, warn user.

### 7. Delete branch

```bash
git branch -d <branch-name>
```

If not fully merged, ask for force delete.

### 8. Prune references

```bash
git worktree prune
```

### 9. Display success

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
- Verify PR merged: Check PR status before cleanup
- Pull first: Always pull latest changes
- Clean references: Prune worktree references after removal
