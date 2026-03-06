# Workflow: Complete Task

Complete task workflow in worktree - validate, commit, push, and create PR.

## Purpose

One-command workflow to complete work in a feature worktree:
1. Validate code quality
2. Commit changes
3. Push branch to origin
4. Create Pull Request

## Prerequisites

- Must be in a feature worktree (not main)
- Code changes ready for review
- All tests should pass locally

## Execution Steps

### 1. Verify worktree context

Check NOT in main worktree:
```bash
git branch --show-current
```

### 2. Run validation

```bash
npm run validate
```

If fails, show errors and suggest fixes.

### 3. Check git status

```bash
git status
```

### 4. Commit changes

Generate commit message from branch name and changes:
```bash
git add <files>
git commit -m "<type>(<scope>): <subject>"
```

### 5. Push to origin

```bash
git push -u origin <branch-name>
```

### 6. Create Pull Request

```bash
gh pr create --title "<title>" --body "<body>"
```

### 8. Display completion summary

Show PR URL and cleanup instructions.

## Branch to Commit Type Mapping

| Branch Prefix | Commit Type |
|---------------|-------------|
| `feat/` | `feat:` |
| `fix/` | `fix:` |
| `refactor/` | `refactor:` |
| `perf/` | `perf:` |
| `test/` | `test:` |
| `chore/` | `chore:` |

## Important Rules

- Never run from main: Must be in feature worktree
- Validate first: Always run validation
- One PR per task: Each worktree = one branch = one PR
- Conventional Commits: Use proper commit message format
