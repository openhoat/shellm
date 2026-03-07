---
name: cleanup-worktree
description: Remove a worktree and its branch after PR merge. Run from main worktree after completing work.
disable-model-invocation: false
---

# Skill: Cleanup Worktree

Remove a git worktree and its associated branch after the PR has been merged. Update KANBAN.md and regenerate CHANGELOG.md on main.

## Purpose

- Pull latest changes from origin/main
- Update KANBAN.md (move task from In Progress, cleanup)
- Regenerate CHANGELOG.md from git history
- Commit and push maintenance to main
- Remove feature worktree and branch
- Clean up git references

## Prerequisites

- Must be in the main worktree (branch: main)
- PR must be merged on GitHub
- No uncommitted changes in main

## Usage

```
/cleanup-worktree <name>
/cleanup-worktree <branch-name>
```

## Arguments

- `name`: Worktree name (without `termaid-` prefix) or full branch name

## Examples

```
/cleanup-worktree keyboard-shortcuts
/cleanup-worktree feat/keyboard-shortcuts
```

## Steps

1. **Verify context**: Check we're in main with `git branch --show-current`
2. **Pull latest**: `git pull origin main`
3. **Update KANBAN.md**: Remove task from In Progress section
4. **Generate CHANGELOG**: `npm run changelog`
5. **Commit maintenance**:
   ```bash
   git add KANBAN.md CHANGELOG.md
   git commit -m "chore(release): update kanban and changelog post-merge"
   git push origin main
   ```
6. **Resolve names**: Convert argument to worktree path and branch name
7. **Verify worktree**: Check it exists with `git worktree list`
8. **Check PR status**: Optionally verify PR is merged with `gh pr view`
9. **Remove worktree**: `git worktree remove ../termaid-<name>`
10. **Delete branch**: `git branch -d <branch-name>` (or -D if force needed)
11. **Prune references**: `git worktree prune`

## Name Resolution

```
Input: "keyboard-shortcuts"
→ Worktree: ../termaid-keyboard-shortcuts
→ Branch: feat/keyboard-shortcuts (inferred)

Input: "feat/keyboard-shortcuts"
→ Worktree: ../termaid-keyboard-shortcuts
→ Branch: feat/keyboard-shortcuts
```

## Example

```
/cleanup-worktree keyboard-shortcuts

✅ In main worktree
✅ Pulling latest changes...

📋 Updating KANBAN.md...
   - Removed task from In Progress

📝 Generating CHANGELOG.md...
   - npm run changelog

✅ Committed maintenance to main
   - Commit: def5678
   - Pushed to origin/main

🔍 Worktree: ../termaid-keyboard-shortcuts
   Branch: feat/keyboard-shortcuts

✅ PR #42 merged at 2026-03-05 14:30

🗑️ Removed worktree: termaid-keyboard-shortcuts
🌿 Deleted branch: feat/keyboard-shortcuts
🧹 Pruned stale references

✅ Cleanup Complete

📋 Next: /start-task
```

## Error Handling

- **Not in main**: Abort, suggest switching to main
- **Worktree not found**: List available worktrees
- **PR not merged**: Warn and ask for confirmation
- **Uncommitted changes**: Fail, suggest manual inspection
- **Branch not merged**: Offer force delete (-D)

## Integration

- **After**: Start new task with `/start-task`
- **Before**: PR must be created and merged

## Important Rules

- **Always in main**: Must be in main worktree
- **Pull first**: Always pull latest changes
- **Update KANBAN and CHANGELOG**: Always regenerate on main
- **Clean references**: Prune worktree references after removal
- **One commit**: Single maintenance commit for KANBAN + CHANGELOG
