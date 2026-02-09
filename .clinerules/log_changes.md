# Log Changes

## Objective

This rule ensures that every change made by Cline is automatically logged in the `/CHANGELOG.md` file.

## When to execute this rule

After **every successful modification** of the project (creation, editing, or deletion of files), **before** using `attempt_completion`.

## Format rules

See `.clinerules/task_format.md` for detailed format rules.

Summary for CHANGELOG.md:
- Format: `**[HH:MM:SS] Emoji [TAG]** Description`
- Tags and emojis:
  - `✨ [FEAT]` - New feature
  - `🐛 [FIX]` - Bug fix
  - `♻️ [REFACTOR]` - Refactoring
  - `⚡ [PERF]` - Performance
  - `📝 [DOCS]` - Documentation
  - `🎨 [STYLE]` - Style/Cosmetic
  - `✅ [TEST]` - Tests
  - `🔧 [CHORE]` - Configuration/Maintenance
- Sorted in reverse chronological order (most recent at top)
- Organized by year/month/day (full date in sections)

## Logging process

### 1. Identify the modification

Determine the type of modification made:
- **New feature**: Use `✨ [FEAT]`
- **Bug fix**: Use `🐛 [FIX]`
- **Refactoring**: Use `♻️ [REFACTOR]`
- **Performance improvement**: Use `⚡ [PERF]`
- **Documentation**: Use `📝 [DOCS]`
- **Style**: Use `🎨 [STYLE]`
- **Tests**: Use `✅ [TEST]`
- **Configuration/Maintenance**: Use `🔧 [CHORE]`

### 2. Create the CHANGELOG entry

Add a new entry in the appropriate section of `/CHANGELOG.md`:

**Format:**
```markdown
**[HH:MM:SS] ✨ [FEAT]** Concise description of the modification
```

Or:
```markdown
**[HH:MM:SS] 🐛 [FIX]** Concise description of the fixed bug
```

**Writing rules:**
- Start with a verb in infinitive or imperative (ex: "Add", "Fix", "Implement")
- Be concise but informative
- Mention modified files if relevant
- Replace HH:MM:SS with current time

### 3. Placement in the file

Use `replace_in_file` to add the entry:

**If today's date already exists:**
- Find the corresponding date header `### DD/MM`
- Insert the new entry immediately after this header (after the two line breaks)
- Entries must be sorted in reverse chronological order (most recent at top)

**If today's date doesn't exist:**
- Create the date header under the year header `## YYYY`
- Format: `### DD/MM\n\n**[HH:MM:SS] Emoji [TAG]** Description`

**If the year doesn't exist:**
- Create the year header at the top of the file
- Format: `## YYYY\n\n### DD/MM\n\n**[HH:MM:SS] Emoji [TAG]** Description`

### 4. Concrete examples

#### Example 1: Adding a new feature

You just created the `UserDashboard.tsx` component:

```markdown
## 2026

### 03/02

**[17:30:15] ✨ [FEAT]** Add UserDashboard component for the user interface
```

#### Example 2: Fixing a bug

You just fixed a connection error:

```markdown
## 2026

### 03/02

**[17:45:22] 🐛 [FIX]** Fix API connection error in ipc-handlers/ollama.ts
```

#### Example 3: Configuration modification

You just updated the Biome configuration:

```markdown
## 2026

### 03/02

**[18:00:10] 🔧 [CHORE]** Configure Biome with strict linting rules
```

### 5. Implementation method with replace_in_file

Use `replace_in_file` with a SEARCH/REPLACE to add the entry:

```markdown
------- SEARCH
## 2026

### 03/02

**[17:30:15] ✨ [FEAT]** Last existing task...
=======
## 2026

### 03/02

**[17:35:15] ✨ [FEAT]** New task added...
**[17:30:15] ✨ [FEAT]** Last existing task...
+++++++ REPLACE
```

## Important rules

- **Always log** successful modifications in CHANGELOG.md
- Use the appropriate tag and emoji
- Always include time in format `HH:MM:SS` (full date is in sections)
- Do not log cancelled or failed modifications
- Do not log file reads or simple analyses

## Exceptions

Do NOT log in CHANGELOG.md:
- Simple file reads for analysis
- Validation/linting command executions
- Unit tests
- Temporary or experimental modifications
- Automatic formatting changes (e.g., Biome auto-fix)
- Trivial modifications (minor adjustments of less than 3 lines)
- Updates to existing comments or documentation