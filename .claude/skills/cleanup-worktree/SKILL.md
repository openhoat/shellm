---
name: cleanup-worktree
description: Remove a worktree and its branch after PR merge. Run from main worktree after completing work.
disable-model-invocation: false
---

# Skill: Cleanup Worktree

Remove a git worktree and its associated branch after the PR has been merged.

## Purpose

This skill cleans up the workspace after a PR is merged by:
- Verifying we're in the main worktree
- Pulling latest changes from origin
- Removing the feature worktree
- Deleting the local branch

## Prerequisites

- Must be in the main worktree (branch: main)
- PR must be merged (verified by user or checked via gh)
- No uncommitted changes in main

## Usage

```
/cleanup-worktree <name>
/cleanup-worktree <branch-name>
```

## Arguments

- `name`: The worktree name (without `termaid-` prefix) or the full branch name

## Examples

```
/cleanup-worktree keyboard-shortcuts
/cleanup-worktree feat/keyboard-shortcuts
/cleanup-worktree login-bug
/cleanup-worktree fix/login-bug
```

## Execution Steps

### 1. Verify worktree context

Check that we are in the main worktree:
```bash
git branch --show-current
```

Should show `main` or `master`.

If not in main worktree, display error:
```
❌ Error: Must be in main worktree to cleanup
   Current branch: <feature-branch>
   Please switch to main: cd /path/to/termaid
```

### 2. Pull latest changes

```bash
git pull origin main
```

If pull fails:
- Check network connection
- Check if remote is configured
- Offer to continue without pull (user can handle later)

### 3. Resolve worktree name

Parse the argument to find the worktree:
- If `<name>` doesn't have `termaid-` prefix, add it
- If `<name>` is a branch name like `feat/feature`, convert to worktree name

Name resolution:
```
Input: "keyboard-shortcuts"
Worktree: "../termaid-keyboard-shortcuts"

Input: "feat/keyboard-shortcuts"
Worktree: "../termaid-keyboard-shortcuts"
Branch: "feat/keyboard-shortcuts"

Input: "fix/login-bug"
Worktree: "../termaid-login-bug"
Branch: "fix/login-bug"
```

### 4. Verify worktree exists

```bash
git worktree list
```

Check if the worktree exists in the list.

If not found:
```
❌ Error: Worktree not found
   Available worktrees:
   - /path/to/termaid (main)
   - /path/to/termaid-<other> (<branch>)

   Did you mean one of these?
```

### 5. Check PR status (optional)

If `gh` CLI is available and PR exists:
```bash
gh pr view <branch-name> --json state,mergedAt
```

If PR is not merged:
```
⚠️ Warning: PR may not be merged yet
   Branch: <branch-name>
   Status: <PR state>

   Continue cleanup? (y/n)
```

Use AskUserQuestion to confirm.

### 6. Remove worktree

```bash
git worktree remove ../termaid-<name>
```

If removal fails (e.g., uncommitted changes):
```
❌ Error: Cannot remove worktree
   Reason: <error message>

   Options:
   - Force removal: git worktree remove --force ../termaid-<name>
   - Manual cleanup: cd ../termaid-<name> && git status
```

### 7. Delete branch

```bash
git branch -d <branch-name>
```

If branch deletion fails (not fully merged):
```
⚠️ Warning: Branch may not be fully merged
   Force delete? (y/n)
```

If confirmed:
```bash
git branch -D <branch-name>
```

### 8. Prune worktree references

```bash
git worktree prune
```

### 9. Display success message

```
✅ Cleanup Complete

📁 Worktree Removed: termaid-<name>
🌿 Branch Deleted: <branch-name>
🧹 Pruned stale references

📋 Next Steps:
   - Select a new task: /start-task
   - Check kanban status: /read-kanban
```

## Error Handling

- **Not in main**: Abort and suggest switching to main
- **Worktree not found**: List available worktrees and suggest correct name
- **PR not merged**: Warn user and ask for confirmation
- **Uncommitted changes in worktree**: Fail and suggest manual inspection
- **Branch not merged**: Warn and offer force delete

## Integration with Other Skills

- **After**: Start a new task with `/start-task`
- **Before**: PR must be created with `/push-and-pr` and merged

## Flow Diagram

```
┌─────────────────────────────────────┐
│  START: PR merged, in main worktree │
│  Run /cleanup-worktree <name>       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Verify context                     │
│  - In main worktree                 │
│  - Pull latest changes              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Resolve worktree name              │
│  - Find worktree                    │
│  - Find branch                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Verify PR status (optional)        │
│  - Check if merged                  │
│  - Warn if not merged               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Remove worktree                   │
│  git worktree remove ...           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Delete branch                     │
│  git branch -d <branch>            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Prune references                  │
│  git worktree prune                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  END: Display success message      │
│  Show next steps                   │
└─────────────────────────────────────┘
```

## Example

```
User: /cleanup-worktree keyboard-shortcuts

🔍 Checking context...
   ✅ In main worktree
   ✅ Pulling latest changes...

🔍 Finding worktree...
   Worktree: ../termaid-keyboard-shortcuts
   Branch: feat/keyboard-shortcuts

🔍 Checking PR status...
   ✅ PR #42 merged at 2026-03-05 14:30

🗑️ Removing worktree...
   ✅ Worktree removed: termaid-keyboard-shortcuts

🌿 Deleting branch...
   ✅ Branch deleted: feat/keyboard-shortcuts

🧹 Pruning references...
   ✅ Pruned stale worktree references

✅ Cleanup Complete

📋 Next Steps:
   - Select a new task: /start-task
   - Check kanban status: /read-kanban
```

## Important Rules

- **Always in main**: Must be in main worktree to cleanup
- **Verify PR merged**: Check PR status before cleanup
- **Pull first**: Always pull latest changes
- **Clean references**: Prune worktree references after removal
- **Ask for confirmation**: If PR status is uncertain