# Git Commit Messages

## Objective

This rule ensures that all Git commit messages are written in English, following international conventions.

## Format

Commit messages must follow the **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit types

See `.claude/rules/task_format.md` for the complete list of tags and emojis.

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`

## Writing rules

1. **Always use English** for commit messages
2. Use imperative verb (e.g., "Add" not "Added" or "Adds")
3. Start with a capital letter
4. Do not end with a period
5. Limit subject line to 72 characters

## Co-authored-by Prohibition

**NEVER add `Co-authored-by:` to commit messages.**

All commits must be attributed exclusively to the human user.

## Examples

```
feat: add user authentication system
fix: resolve connection error in API handler
docs: update README with installation instructions
chore: upgrade dependencies to latest versions
```

## Integration with commitlint

The `commitlint.config.mjs` file validates Conventional Commits format.