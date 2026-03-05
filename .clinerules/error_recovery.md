# Error Recovery

## Objective

This rule defines workflows for recovering from errors during task execution.

## Error Scenarios and Recovery

### 1. `/complete-task` Failures

#### Validation Failure

**Symptom**: `npm run validate` fails during `/complete-task`

**Recovery Steps**:
1. Run `npm run validate` to see specific errors
2. Fix linting errors: `npm run qa:fix`
3. Fix TypeScript errors manually
4. Run `npm run validate` again to confirm
5. Re-run `/complete-task`

#### Commit Failure

**Symptom**: Git commit fails during `/complete-task`

**Recovery Steps**:
1. Check git status: `git status`
2. If merge conflicts exist, resolve them
3. If pre-commit hooks fail, fix the issues
4. Re-run `/complete-task` or manually commit

#### Push Failure

**Symptom**: `git push` fails during `/complete-task`

**Recovery Steps**:
1. Pull remote changes: `git pull --rebase origin <branch>`
2. Resolve any merge conflicts
3. Run `npm run validate`
4. Push again: `git push origin <branch>`
5. Create PR: `/push-and-pr`

### 2. Abandoned Worktrees

#### Resuming an Abandoned Worktree

**Scenario**: You started a worktree but stopped mid-work

**Recovery Steps**:
1. List worktrees: `/list-worktrees` or `git worktree list`
2. Navigate to worktree: `cd ../termaid-<name>`
3. Check status: `git status`
4. Continue work or cleanup if no longer needed

#### Cleaning Up Abandoned Worktrees

**Steps**:
1. On main worktree: `git worktree remove ../termaid-<name>`
2. If forced removal needed: `git worktree remove --force ../termaid-<name>`
3. Delete branch if unneeded: `git branch -d <branch-name>`
4. Prune stale references: `git worktree prune`

### 3. Kanban Conflicts

#### Task Already in Progress

**Symptom**: Another task in "In Progress" section

**Recovery Steps**:
1. Check if you should complete the existing task first
2. If abandoned, ask user for clarification
3. Move abandoned tasks back to backlog if needed

#### Mismatched Worktree and Kanban

**Symptom**: Worktree exists but Kanban task shows different status

**Recovery Steps**:
1. Read KANBAN.md: `/read-kanban`
2. Verify current worktree: `git worktree list`
3. Update Kanban to match actual state
4. Or cleanup orphaned worktrees

### 4. Validation Failures

#### Biome Linting Errors

**Recovery**:
```bash
# Auto-fix what's possible
npm run qa:fix

# Re-run validation
npm run validate

# Fix remaining issues manually
```

#### TypeScript Errors

**Recovery**:
1. Read error messages carefully
2. Fix type mismatches
3. Add missing type declarations
4. Run `npm run validate` again

#### Test Failures

**Recovery**:
```bash
# Run tests with details
npm run test

# Fix failing tests
# Re-run validation
npm run validate
```

### 5. Git Conflicts

#### Merge Conflicts During Rebase

**Recovery Steps**:
1. List conflicted files: `git status`
2. Edit each conflicted file
3. Stage resolved files: `git add <file>`
4. Continue rebase: `git rebase --continue`
5. Abort if needed: `git rebase --abort`

#### Merge Conflicts During Pull

**Recovery Steps**:
1. Resolve conflicts in each file
2. Stage: `git add <file>`
3. Commit: `git commit`
4. Continue with push

### 6. Branch Issues

#### Wrong Branch Created

**Recovery**:
```bash
# Delete the wrong branch
git branch -D <wrong-branch>

# Create correct branch
git branch <correct-branch> main

# Create new worktree
git worktree add ../termaid-<name> <correct-branch>
```

#### Branch Behind Remote

**Recovery**:
```bash
# In worktree
git pull --rebase origin <branch>

# Or reset to remote if needed
git fetch origin
git reset --hard origin/<branch>
```

## Quick Recovery Commands

| Scenario | Command |
|----------|---------|
| Fix linting | `npm run qa:fix` |
| Re-validate | `npm run validate` |
| List worktrees | `git worktree list` |
| Remove worktree | `git worktree remove ../termaid-<name>` |
| Force remove worktree | `git worktree remove --force ../termaid-<name>` |
| Prune worktrees | `git worktree prune` |
| Git status | `git status` |
| Abort rebase | `git rebase --abort` |
| Continue rebase | `git rebase --continue` |

## Prevention Tips

1. **Always validate before committing**: Run `npm run validate` before `/complete-task`
2. **Keep worktrees clean**: One feature per worktree
3. **Update Kanban regularly**: Keep task status in sync
4. **Commit often**: Small, focused commits are easier to recover from
5. **Pull before push**: Always pull remote changes before pushing

## When to Ask for Help

- Cannot resolve merge conflicts
- Validation errors are unclear
- Git state is corrupted
- Kanban state doesn't match reality
- Worktree is in an unrecoverable state