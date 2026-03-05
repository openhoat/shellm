# Skill: Complete Task

Complete a task workflow in the feature worktree: validate, commit, push, and create PR.

## Purpose

This skill completes the work in a feature worktree by:
1. Running validation (lint, build, tests)
2. Committing all changes
3. Pushing to remote
4. Creating a Pull Request

## Prerequisites

- Must be in a feature worktree (NOT on main branch)
- All changes must be ready for commit
- Remote repository must be configured

## Usage

```
/complete-task
```

## Arguments

None. The skill automatically detects the current branch and worktree.

## Execution Steps

### 1. Verify worktree context

Check that we are NOT in the main worktree:
```bash
git branch --show-current
```

If on `main`, display error:
```
❌ Error: Cannot complete task from main worktree
   Please switch to a feature worktree first:
   cd ../termaid-<feature-name>
```

### 2. Run validation

```bash
npm run validate
```

If validation fails:
- Display errors
- Suggest fixes
- Abort completion

### 3. Commit changes

```bash
git status
git add -A
git commit -m "<conventional-commit-message>"
```

If commit fails due to hooks:
- Fix the issues
- Re-run validation
- Try commit again

### 4. Push to remote

```bash
git push -u origin <branch-name>
```

If push fails:
- Check remote configuration
- Pull and rebase if needed
- Try push again

### 5. Create Pull Request

Use `gh pr create` with appropriate title and body.

### 6. Display success message

```
✅ Task Completed: <task-id>
   📋 <description>

📝 Commit: <commit-hash>
🚀 Pushed to: origin/<branch-name>
🔗 PR: <pr-url>

Next Steps:
1. Wait for PR review
2. After merge, switch to main: cd ../termaid
3. Pull changes: git pull origin main
4. Cleanup worktree: /cleanup-worktree <name>
```

## Error Handling

- **On main branch**: Abort and instruct user to switch to feature worktree
- **Validation failure**: Display errors and abort
- **Nothing to commit**: Inform user and suggest skipping to push
- **Push failure**: Help resolve conflicts or authentication issues
- **PR creation failure**: Suggest manual PR creation via GitHub UI

## Integration with Other Skills

- **Before this**: Use `/start-task` to begin work on a task
- **After PR merge**: Use `/cleanup-worktree` from main worktree

## Flow Diagram

```
┌─────────────────────────────────────┐
│  START: In feature worktree         │
│  Run /complete-task                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Validate code                      │
│  (npm run validate)                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Commit changes                     │
│  (git add, git commit)               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Push to remote                     │
│  (git push -u origin <branch>)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Create Pull Request                │
│  (gh pr create)                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  END: PR created                     │
│  Wait for review, then cleanup      │
└─────────────────────────────────────┘
```

## Example

```
User: /complete-task

✅ Running validation...
   - Biome QA: ✓
   - TypeScript build: ✓
   - Unit tests: ✓

✅ Committing changes...
   Commit: abc123

✅ Pushing to remote...
   Branch: feat/conversation-import
   Remote: origin

✅ Creating Pull Request...
   PR URL: https://github.com/user/repo/pull/42

✅ Task Completed: #arch-import
   📋 Implement conversation import feature

Next Steps:
1. Wait for PR review
2. After merge: cd ../termaid && git pull origin main
3. Cleanup: /cleanup-worktree conversation-import
```

## Important Rules

- **Never from main**: Must be in feature worktree
- **Validate before commit**: Always run validation
- **Conventional commits**: Follow commit message format
- **Push before PR**: Ensure branch is pushed to remote
- **Update KANBAN.md**: Changes to KANBAN.md are NOT made here (done in `/start-task`)