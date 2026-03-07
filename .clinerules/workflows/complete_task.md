# Workflow: Complete Task

Complete task workflow in worktree - validate, commit, push, and create PR.

## Purpose

- Validate code quality (Biome, TypeScript, tests)
- Commit changes with Conventional Commits format
- Push branch to origin
- Create Pull Request on GitHub

## Prerequisites

- Must be in a feature worktree (not main)
- Code changes ready for review
- All tests should pass

## Execution Steps

### 1. Verify worktree context

Check NOT in main worktree:
```bash
git branch --show-current
```

If in main, error and suggest `/start-task`.

### 2. Run validation

```bash
npm run validate
```

If fails, show errors and suggest `npm run qa:fix`.

### 3. Check git status

```bash
git status
```

Verify there are changes to commit.

### 4. Commit changes

Generate commit message from branch name:
```bash
git add <files>
git commit -m "<type>(<scope>): <subject>"
```

Branch prefix → Commit type:
- `feat/` → `feat:`
- `fix/` → `fix:`
- `refactor/` → `refactor:`
- `perf/` → `perf:`
- `test/` → `test:`
- `chore/` → `chore:`
- `docs/` → `docs:`

### 5. Push to origin

```bash
git push -u origin <branch-name>
```

### 6. Create Pull Request

```bash
gh pr create --title "<title>" --body "<body>"
```

Add --draft flag if needed.

### 7. Display completion summary

Show:
- PR URL
- Next steps (merge PR, then cleanup)

## Important Rules

- **Never run from main**: Must be in feature worktree
- **Validate first**: Always run validation
- **Conventional Commits**: Use proper commit format
- **One PR per task**: Each worktree = one branch = one PR
- **DO NOT update CHANGELOG.md**: Only updated on main after merge
