# Git Worktree Workflow - Quick Reference

## Workflow Complet

### Phase 1: Start (main worktree)

```bash
/start-task [number]
# → Updates KANBAN.md (move idea to In Progress)
# → Commits KANBAN.md on main
# → Creates branch and worktree at /home/openhoat/work/termaid-<name>
# → User manually navigates: cd ../termaid-<name>
```

### Phase 2: Implementation (feature worktree)

```bash
# Work on the feature
# ...

/complete-task [--draft]
# → Validates code (npm run validate)
# → Commits changes
# → Pushes branch to origin
# → Creates Pull Request
```

### Phase 3: Cleanup (main worktree, after PR merge)

```bash
/cleanup-worktree <name>
# → Pulls latest changes from origin
# → Updates KANBAN.md (move task from In Progress, cleanup)
# → Generates CHANGELOG.md (npm run changelog)
# → Commits and pushes maintenance to main
# → Removes worktree and branch
```

## Commands

| Command | Location | Purpose |
|---------|----------|---------|
| `/start-task [number]` | Main worktree | Start task from backlog |
| `/complete-task [--draft]` | Feature worktree | Validate, commit, push, PR |
| `/push-and-pr` | Feature worktree | Push and create PR only |
| `/cleanup-worktree <name>` | Main worktree | Post-merge cleanup |
| `/list-worktrees` | Any | List all worktrees |

## Emplacements

- **Main worktree**: `/home/openhoat/work/termaid`
- **Feature worktrees**: `/home/openhoat/work/termaid-<feature-name>`
- **KANBAN.md**: Edit only on main branch
- **CHANGELOG.md**: Auto-generated (read-only, never edit manually)

## Format KANBAN.md

### Backlog

```markdown
- [ ] **[CATEGORY]** Description (Priority)
```

Examples:
- `- [ ] **[ARCHITECTURE]** Create termaidsh meta-shell (P2)`
- `- [ ] **[UX]** Add contextual AI suggestions (P3)`

### In Progress

```markdown
- [ ] **[TAG]** Description
```

Examples:
- `- [ ] **[FEAT]** Implement conversation import`
- `- [ ] **[FIX]** Resolve connection error`

## Règles Clés

1. **1 worktree = 1 branch = 1 PR**: One feature per worktree
2. **Never commit directly to main**: Always use PR workflow
3. **KANBAN updated on main only**: Never modify KANBAN.md in feature worktree
4. **CHANGELOG auto-generated**: Use `npm run changelog`, never edit manually
5. **Manual navigation**: After `/start-task`, user must run `cd ../termaid-<name>`

## Git Native Worktree Commands

```bash
# List worktrees
git worktree list

# Create worktree manually (if needed)
git worktree add ../termaid-<name> <branch>

# Remove worktree
git worktree remove ../termaid-<name>

# Clean stale references
git worktree prune
```

## Troubleshooting

### Task already in progress

Check KANBAN.md and decide whether to complete the existing task first or move it back to backlog.

### Worktree already exists

Use `/cleanup-worktree <name>` to remove the old worktree, or check if you're already working on that task.

### Validation fails during complete-task

```bash
npm run qa:fix      # Auto-fix linting issues
npm run validate    # Re-run validation
```

### PR not merged yet

Don't run `/cleanup-worktree` until the PR is merged on GitHub.

## Categories

### Backlog Ideas

- `[ARCHITECTURE]`, `[UX]`, `[TEST]`, `[PERFORMANCE]`, `[SECURITY]`
- `[DEVOPS]`, `[I18N]`, `[DEPENDENCIES]`, `[CONFIG]`

### Tasks (In Progress)

- `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[PERF]`
- `[DOCS]`, `[STYLE]`, `[TEST]`, `[CHORE]`

## Priority Levels

- `(P1)`: High Priority (critical, security, blocking)
- `(P2)`: Medium Priority (important improvements)
- `(P3)`: Low Priority (nice to have, enhancements)
