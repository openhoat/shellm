# Skill: Create Worktree

## Description

Create a new git worktree for a new feature branch and switch to it.

## Usage

```
/create-worktree <branch-name>
```

## Arguments

- `branch-name`: Name of the feature branch (will be prefixed with `feat/` if not already present)

## Example

```
/create-worktree add-dark-mode
/create-worktree fix-login-bug
/create-worktree performance优化
```

## What It Does

1. Creates a new branch from main (prefixed with `feat/` if not present)
2. Creates a new worktree at `../termaid-<kebab-case-name>`
3. Displays instructions for working in the new worktree

## Notes

- The worktree is created in the parent directory as `../termaid-<name>`
- The branch is created from the main branch
- After creation, you need to start a new Claude Code session in the worktree directory
