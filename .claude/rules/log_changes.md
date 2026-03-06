# Log Changes

## Objective

Ensures every change is logged in `/CHANGELOG.md`.

## When to execute

**IMPORTANT**: In the unified workflow, the `CHANGELOG.md` is updated ONLY on the `main` branch during the post-merge cleanup phase (`/cleanup-worktree`). Do NOT update `CHANGELOG.md` in feature branches.

After **every successful modification** of the project.

## Format

See `.claude/rules/task_format.md` for complete tag/emoji definitions.

**Entry format**: `**[HH:MM:SS] Emoji [TAG]** Description`

Common tags: `✨ [FEAT]`, `🐛 [FIX]`, `♻️ [REFACTOR]`, `⚡ [PERF]`, `📝 [DOCS]`, `🎨 [STYLE]`, `✅ [TEST]`, `🔧 [CHORE]`

## Process

1. **Identify type**: feat, fix, refactor, perf, docs, style, test, chore
2. **Create entry**: `**[HH:MM:SS] ✨ [FEAT]** Add UserDashboard component`
3. **Place in file**:
   - If date exists: insert after `### DD/MM` header
   - If date missing: create `### DD/MM` under `## YYYY`
   - If year missing: create `## YYYY` at top

## Writing rules

- Start with verb (imperative): "Add", "Fix", "Implement"
- Be concise but informative
- Mention modified files if relevant
- Sort entries reverse chronologically

## Exceptions

Do NOT log:
- File reads for analysis
- Validation/linting commands
- Unit tests
- Temporary/experimental modifications
- Auto-formatting (Biome fix)
- Trivial changes (< 3 lines)