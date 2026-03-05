---
name: push-and-pr
description: Push current branch and create a Pull Request. Use when ready to submit completed work for review.
disable-model-invocation: false
---

# Skill: Push and Create PR

Push the current branch to origin and create a Pull Request for review.

## Purpose

This skill completes the worktree workflow by:
- Pushing the branch to origin
- Creating a Pull Request with proper title and description
- Providing instructions for post-merge cleanup

## Prerequisites

- Must be in a feature worktree (not main)
- Branch must have commits ready to push
- Code should be validated (run `/run-validation` first)
- Git remote must be configured (origin)

## Usage

```
/push-and-pr
/push-and-pr --draft
/push-and-pr --title "Custom title"
```

## Arguments

- `--draft`: Create a draft PR instead of ready for review
- `--title`: Custom PR title (overrides auto-generated)

## Execution Steps

### 1. Verify worktree context

Check that we are NOT in the main worktree:
```bash
git branch --show-current
git worktree list
```

If in main worktree, display error:
```
❌ Error: Cannot push-and-pr from main worktree
   Please run this command in a feature worktree.
   Current worktrees:
   - /path/to/termaid (main)
   - /path/to/termaid-<feature> (<branch>)
```

### 2. Check for uncommitted changes

```bash
git status
```

If there are uncommitted changes:
```
⚠️ Warning: Uncommitted changes detected
   Please commit or stash your changes first.
   Run /workflow-commit to commit changes.
```

### 3. Get branch information

Extract from branch name:
- Branch type (feat/fix/refactor/etc.)
- Feature description

```bash
git branch --show-current
```

### 4. Push to origin

```bash
git push -u origin <branch-name>
```

If push fails:
- Check if remote is configured
- Check authentication
- Offer to retry

### 5. Generate PR title

Parse branch name to create PR title:
- `feat/keyboard-shortcuts` → `feat: add keyboard shortcuts for quick actions`
- `fix/login-bug` → `fix: resolve login authentication bug`
- `refactor/conversation-import` → `refactor: improve conversation import structure`

If custom title provided via `--title`, use that instead.

### 6. Get PR body content

Read KANBAN.md to find the task details for the PR body.

Or use git log to get commits:
```bash
git log main..HEAD --oneline
```

Generate PR body:
```markdown
## Summary

- Description of changes
- Key improvements
- Breaking changes (if any)

## Test plan

- [ ] Manual testing steps
- [ ] Automated tests passed
- [ ] Code review checklist
```

### 7. Create Pull Request

Using `gh pr create`:
```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary

<generated summary from commits>

## Test plan

- [ ] Run `npm run validate` to verify code quality
- [ ] Test the feature/fix manually
- [ ] Review code changes

EOF
)"
```

If `--draft` flag:
```bash
gh pr create --draft --title "<title>" --body "<body>"
```

### 8. Display success message

```
✅ Branch Pushed: <branch-name>
🔀 Pull Request Created: https://github.com/<repo>/pull/<number>
   Title: <title>
   Status: Ready for review

📝 After Merge:
   1. Return to main worktree:
      cd ../termaid
   2. Pull latest changes:
      git pull origin main
   3. Cleanup worktree:
      /cleanup-worktree <name>
```

## Error Handling

- **In main worktree**: Abort and suggest running from feature worktree
- **Uncommitted changes**: Suggest running `/workflow-commit` first
- **Push failed**: Show error and suggest solutions
- **PR creation failed**: Show gh error and offer retry

## PR Title Format

Use Conventional Commits format for PR titles:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `perf:` for performance improvements
- `docs:` for documentation
- `test:` for tests
- `chore:` for maintenance tasks

## PR Body Template

```markdown
## Summary

- Brief description of what this PR changes
- Why this change is needed
- Any context or background

## Changes

- List of main changes
- Files modified
- Key implementations

## Test plan

- [ ] Manual testing completed
- [ ] Unit tests passing
- [ ] Code quality checks passed

## Screenshots (if applicable)

< screenshots or GIFs >
```

## Integration with Other Skills

- **Before this**: Run `/run-validation` to ensure code quality
- **Before this**: Run `/workflow-commit` to commit changes
- **After merge**: Run `/cleanup-worktree` from main worktree

## Flow Diagram

```
┌─────────────────────────────────────┐
│  START: In feature worktree         │
│  Work completed and committed       │
│  Run /push-and-pr                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Verify context                     │
│  - Not in main worktree             │
│  - No uncommitted changes            │
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
│  gh pr create --title --body        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  END: Display PR URL               │
│  Show cleanup instructions          │
└─────────────────────────────────────┘
```

## Example

```
User: /push-and-pr

🔍 Checking context...
   ✅ In feature worktree: refactor/conversation-import
   ✅ No uncommitted changes
   ✅ 3 commits ready to push

🚀 Pushing to origin...
   ✅ Branch pushed: refactor/conversation-import

🔀 Creating Pull Request...
   ✅ PR created: https://github.com/user/repo/pull/42
   Title: refactor: improve conversation import structure
   Status: Ready for review

📝 After Merge:
   1. Return to main worktree:
      cd ../termaid
   2. Pull latest changes:
      git pull origin main
   3. Cleanup worktree:
      /cleanup-worktree conversation-import
```

## Important Rules

- **Never run from main**: Must be in feature worktree
- **Commit first**: All changes must be committed
- **Validate first**: Run `/run-validation` before pushing
- **One PR per worktree**: Each worktree = one branch = one PR
- **Clean commit history**: Squash or rebase if needed before PR