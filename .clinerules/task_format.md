# Task Format Rules

## Objective

Defines common format rules for all task files in the project (BACKLOG.md, CHANGELOG.md, etc.).

## General format rules

### Checkboxes

- **Task to do**: `- [ ] Task description`
- **Checked task**: `- [x] Task description`
- **Ignored task**: Use a checked checkbox to pause or exclude temporarily

### Comments (optional)

- Comments can be used to document or explain context
- Use HTML Markdown comment format:
  ```markdown
  [//]: # This is an explanatory comment
  ```
- Regex pattern for detection: `^\[\/\/\]: # (.*)$`
- Lines matching this pattern must be ignored during processing

### Categorization tags and Emojis

Each task must use the format with emojis and tags in brackets:
- **✨ [FEAT]**: New feature or evolution
- **🐛 [BUG]**: Bug fix or problem correction
- **♻️ [REFACTOR]**: Refactoring
- **⚡ [PERF]**: Performance
- **📝 [DOCS]**: Documentation
- **🎨 [STYLE]**: Style/Cosmetic
- **✅ [TEST]**: Tests
- **🔧 [CHORE]**: Configuration/Maintenance

### Dates and times

- **Format**: `DD/MM/YYYY HH:mm:ss`
- **Example**: `03/02/2026 17:30:15`
- Used in CHANGELOG.md for modification entries

### Task descriptions

- Start with a verb in infinitive or imperative (ex: "Add", "Fix", "Implement")
- Be concise but informative
- Mention modified files if relevant

### Hierarchy and sub-tasks

Sub-tasks can be indented with 4 spaces:

```markdown
- [ ] **[DD/MM/YYYY HH:mm:ss] ✨ [FEAT]** Main task
    - [ ] Sub-task 1
    - [ ] Sub-task 2
```

Sub-tasks don't need emoji or tag: category information is carried by the parent task.

## File-specific rules

### TASKS.md

- Contains tasks **to execute** (`- [ ]`)
- Checked tasks (`- [x]`) are considered ignored/paused
- Format: `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`
- Emojis and tags are the same as for CHANGELOG.md:
  - `✨ [FEAT]`: New feature or evolution
  - `🐛 [BUG]`: Bug fix or problem correction
  - `♻️ [REFACTOR]`: Refactoring
  - `⚡ [PERF]`: Performance
  - `📝 [DOCS]`: Documentation
  - `🎨 [STYLE]`: Style/Cosmetic
  - `✅ [TEST]`: Tests
  - `🔧 [CHORE]`: Configuration/Maintenance
- Date and time indicate the moment of task creation
- Comments are optional and serve only to document context

### BACKLOG.md

- Contains **feature ideas** to convert to tasks (`- [ ]`)
- Checked ideas (`- [x]`) are considered already converted (to ignore)
- Format: `- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** Idea description`
- Uses only emoji `💡` and tag `[IDEA]`
- Date and time indicate the moment of idea creation in backlog
- Comments are optional and serve only to document context
- This file is not used by the `do_tasks.md` workflow

### CHANGELOG.md

- Contains only entries of completed modifications
- Structure:
  - Level 1 title: `# History`
  - Detailed format rules (below main title)
  - Level 2 title: `## Modification History`
  - For each year: level 3 title `### YYYY`
  - For each month/day: level 4 title `#### MM/DD`
  - Modification entries with format: `**[HH:MM:SS] Emoji [TAG]** Description`
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

## Usage

This rule is imported/used by:
- `.clinerules/workflows/do_tasks.md` (to read TASKS.md)
- `.clinerules/workflows/create_tasks.md` (to read BACKLOG.md and create tasks in TASKS.md)
- `.clinerules/log_changes.md` (to write in CHANGELOG.md)
- `.clinerules/quality_check.md` (to validate formats)

Any format rule modifications must be made **here only**.