---
name: complete-task
description: Complete task workflow in worktree - validate, commit, push, and create PR. Use in feature worktree to submit work for review.
disable-model-invocation: false
---

# Skill: Complete Task

Execute the complete task workflow from within a feature worktree: validate code, commit changes, push to origin, and create a Pull Request.

## Purpose

- Validate code quality (Biome, TypeScript, tests)
- Commit changes with proper Conventional Commits format
- Push branch to origin
- Create Pull Request on GitHub
- Prepare for PR review and merge

## Prerequisites

- Must be in a feature worktree (not main)
- Code changes ready for review
- All tests should pass

## Usage

```
/complete-task
/complete-task --draft
/complete-task --no-validate
```

## Arguments

- `--draft`: Create draft PR instead of ready for review
- `--no-validate`: Skip validation (not recommended)

## Steps

1. **Verify context**: Check we're NOT in main with `git branch --show-current`
2. **Run validation**: Execute `npm run validate` (unless --no-validate)
3. **Check git status**: Verify changes to commit
4. **Commit changes**: Use Conventional Commits format based on branch name
5. **Push to origin**: `git push -u origin <branch-name>`
6. **Create PR**: Use `gh pr create` with title and body
7. **Display summary**: Show PR URL and next steps

## Commit Message Generation

Branch prefix → Commit type:
- `feat/` → `feat:`
- `fix/` → `fix:`
- `refactor/` → `refactor:`
- `perf/` → `perf:`
- `test/` → `test:`
- `chore/` → `chore:`
- `docs/` → `docs:`

## Example

```
/complete-task

✅ Validation Passed
   Biome QA: ✅
   TypeScript: ✅
   Tests: 24/24 ✅

📝 Commit: abc1234
   feat: add keyboard shortcuts for quick actions

📤 Push: feat/keyboard-shortcuts → origin

🔀 PR Created: https://github.com/user/repo/pull/42
   Status: Ready for review

📋 After PR Merge:
   1. cd ../termaid
   2. git pull origin main
   3. /cleanup-worktree keyboard-shortcuts
```

## Error Handling

- **In main worktree**: Abort with error, suggest `/start-task`
- **Validation failed**: Show errors, suggest `npm run qa:fix`
- **Push failed**: Check auth/remote, offer retry
- **PR creation failed**: Show error, suggest manual creation

## Integration

- **Before**: Use `/start-task` to begin work
- **Alternative**: Individual skills (`/run-validation`, `/push-and-pr`)
- **After merge**: Use `/cleanup-worktree` from main

## Important Rules

- **Never run from main**: Must be in feature worktree
- **Validate first**: Always run validation unless --no-validate
- **Conventional Commits**: Use proper commit message format
- **One PR per task**: Each worktree = one branch = one PR
- **DO NOT update CHANGELOG.md**: Only updated on main after merge
