---
name: complete-task
description: Complete task workflow in worktree - validate, commit, push, and create PR. Use in feature worktree to submit work for review.
disable-model-invocation: false
---

# Skill: Complete Task

Execute the complete task completion workflow from within a feature worktree: validate code, commit changes, push to origin, and create a Pull Request.

## Purpose

This skill provides a one-command workflow to complete work in a feature worktree:
1. Validate code quality
2. Commit changes with proper message format
3. Push branch to origin
4. Create Pull Request
5. Display next steps for cleanup

## Prerequisites

- Must be in a feature worktree (not main)
- Code changes must be ready for review
- All tests should pass locally

## Usage

```
/complete-task
/complete-task --draft
/complete-task --no-validate
```

## Arguments

- `--draft`: Create a draft PR instead of ready for review
- `--no-validate`: Skip validation step (not recommended)

## Execution Steps

### 1. Verify worktree context

Check that we are NOT in the main worktree:
```bash
git branch --show-current
git worktree list
```

If in main worktree, display error:
```
❌ Error: Cannot complete-task from main worktree
   This workflow is for feature worktrees only.

   To start a new task:
   /start-task

   Current worktrees:
   - /path/to/termaid (main)
   - /path/to/termaid-<feature> (<branch>)
```

### 2. Run validation

Run the full validation suite:
```bash
npm run validate
```

If validation fails:
```
❌ Validation Failed

Biome Issues:
- <error 1>
- <error 2>

TypeScript Errors:
- <error 1>

Test Failures:
- <test 1>

Fix these issues before proceeding:
- Run: npm run qa:fix
- Fix TypeScript errors manually
- Re-run: npm run validate
```

If `--no-validate` flag:
```
⚠️ Warning: Skipping validation
   This may result in failed CI checks.
   Continue? (y/n)
```

### 3. Check git status

```bash
git status
```

If no changes:
```
ℹ️ No changes to commit
   Ready to push and create PR

   Continue with push? (y/n)
```

If uncommitted changes:
```
📝 Uncommitted Changes:
   - file1.ts
   - file2.tsx

   Proceed with commit? (y/n)
```

### 4. Commit changes

If there are uncommitted changes, create commit using Conventional Commits format:

Generate commit message from:
- Branch name (extract type and scope)
- Task description from KANBAN.md (if available)
- Changes in git diff

```bash
git add <files>
git commit -m "<type>(<scope>): <subject>"
```

Commit message format:
```
feat: add keyboard shortcuts for quick actions

- Add keyboard event listeners
- Implement shortcut handling
- Add configuration for custom shortcuts
```

### 5. Push to origin

```bash
git push -u origin <branch-name>
```

If push fails:
- Check authentication
- Check remote configuration
- Offer to retry

### 7. Create Pull Request

Generate PR title and body:

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary

<summary from commits>

## Changes

- <change 1>
- <change 2>

## Test plan

- [ ] Run `npm run validate`
- [ ] Manual testing completed
- [ ] All tests passing

EOF
)"
```

If `--draft` flag:
```bash
gh pr create --draft --title "<title>" --body "<body>"
```

### 8. Update KANBAN.md (if applicable)

If task was started with `/start-task`, the KANBAN.md was updated on main branch.
The PR merge will be handled separately when the PR is merged.

### 9. Display completion summary

```
✅ Task Completed Successfully

🔍 Validation: Passed
📝 Commit: abc123 - feat: add keyboard shortcuts
📤 Push: feat/keyboard-shortcuts → origin
🔀 PR: https://github.com/<repo>/pull/<number>

📋 After PR Merge:
   1. Return to main worktree:
      cd ../termaid
   2. Pull latest changes:
      git pull origin main
   3. Update KANBAN (if needed):
      Mark task as done in In Progress
   4. Cleanup worktree:
      /cleanup-worktree keyboard-shortcuts
```

## Error Handling

- **In main worktree**: Abort and suggest `/start-task`
- **Validation failed**: Show errors and suggest fixes
- **Commit failed**: Show git error and retry options
- **Push failed**: Check auth and remote, offer retry
- **PR creation failed**: Show gh error and suggest manual creation

## Commit Message Generation

Use branch name and changes to generate commit message:

| Branch Prefix | Commit Type |
|---------------|-------------|
| `feat/` | `feat:` |
| `fix/` | `fix:` |
| `refactor/` | `refactor:` |
| `perf/` | `perf:` |
| `test/` | `test:` |
| `chore/` | `chore:` |
| `docs/` | `docs:` |

Extract subject from branch name and task description.

## Integration with Other Skills

- **Before this**: Use `/start-task` to begin work
- **Alternative**: Use individual skills:
  - `/run-validation` - Just validation
  - `/workflow-commit` - Just commit
  - `/push-and-pr` - Just push and PR
- **After merge**: Use `/cleanup-worktree` from main

## Flow Diagram

```
┌─────────────────────────────────────┐
│  START: In feature worktree         │
│  Run /complete-task                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Verify context                     │
│  - Not in main worktree             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Run validation                     │
│  npm run validate                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Commit changes                     │
│  - Stage files                      │
│  - Create commit                    │
│  - Generate changelog               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Push to origin                     │
│  git push -u origin <branch>        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Create Pull Request                │
│  gh pr create                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  END: Display summary               │
│  Show cleanup instructions          │
└─────────────────────────────────────┘
```

## Example

```
User: /complete-task

🔍 Checking context...
   ✅ In feature worktree: feat/keyboard-shortcuts

✅ Running validation...
   Biome QA: ✅ Passed
   TypeScript: ✅ Passed
   Tests: ✅ 24/24 passed

📝 Checking changes...
   Modified files:
   - src/components/App.tsx
   - src/hooks/useKeyboard.ts

   Proceed with commit? (y/n): y

📝 Creating commit...
   ✅ Commit: abc1234
   Message: feat: add keyboard shortcuts for quick actions

📤 Generating changelog...
   ✅ CHANGELOG.md updated

📤 Pushing to origin...
   ✅ Pushed: feat/keyboard-shortcuts

🔀 Creating Pull Request...
   ✅ PR created: https://github.com/user/repo/pull/42
   Title: feat: add keyboard shortcuts for quick actions
   Status: Ready for review

✅ Task Completed Successfully

📋 After PR Merge:
   1. Return to main worktree:
      cd ../termaid
   2. Pull latest changes:
      git pull origin main
   3. Cleanup worktree:
      /cleanup-worktree keyboard-shortcuts
```

## Important Rules

- **Never run from main**: Must be in feature worktree
- **Validate first**: Always run validation unless `--no-validate`
- **One PR per task**: Each worktree = one branch = one PR
- **Conventional Commits**: Use proper commit message format
- **Update changelog**: Always regenerate CHANGELOG.md
- **Clean history**: Squash or rebase if needed before PR