# Skill: Cleanup Worktree

Remove a worktree and its branch after PR merge.

## Purpose

Clean up worktrees and branches after completing a task and merging the PR.

## Prerequisites

- Must be in the main worktree (branch: main)
- The PR must be merged
- The worktree should no longer be needed

## Usage

```
/cleanup-worktree <name>
/cleanup-worktree conversation-import
```

## Arguments

- `name` (required): The worktree name (without `termaid-` prefix)

## Execution Steps

### 1. Verify worktree context

Check that we are in the main worktree:
```bash
git worktree list
```

If not in main worktree, display error:
```
❌ Error: Must be in main worktree to cleanup worktrees
   Current location: /path/to/termaid-<feature>
   Please switch to main worktree: cd /path/to/termaid
```

### 2. Pull latest changes

```bash
git pull origin main
```

### 3. Remove worktree

```bash
git worktree remove ../termaid-<name>
```

If worktree has uncommitted changes, use force:
```bash
git worktree remove --force ../termaid-<name>
```

### 4. Delete branch

```bash
git branch -d feat/<name>
```

If branch not fully merged, use:
```bash
git branch -D feat/<name>
```

### 5. Prune stale references

```bash
git worktree prune
```

### 6. Display success message

```
✅ Worktree Cleaned Up: termaid-<name>
   - Worktree removed: ../termaid-<name>
   - Branch deleted: feat/<name>
   - Stale references pruned
```

## Error Handling

- **Not in main worktree**: Abort and instruct user to switch to main
- **Worktree not found**: List available worktrees and suggest valid names
- **Uncommitted changes**: Warn user and suggest `--force` option
- **Branch not merged**: Warn user and suggest `-D` option

## Example

```
User: /cleanup-worktree conversation-import

✅ Worktree Cleaned Up: termaid-conversation-import
   - Worktree removed: ../termaid-conversation-import
   - Branch deleted: feat/conversation-import
   - Stale references pruned
```

## Important Rules

- **Always on main**: Cleanup must be performed from main worktree
- **Pull first**: Always pull latest changes before cleanup
- **Worktree location**: Worktrees are at `/home/openhoat/work/termaid-<name>`
- **Force removal**: Use `--force` only when necessary
- **Prune after cleanup**: Always run `git worktree prune`