# Task Format Rules

## Objective

Defines common format rules for all task files in the project (KANBAN.md, CHANGELOG.md, etc.).

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

### Task Identifiers (Hash)

Each task in the KANBAN must have a unique identifier based on a content hash:
- **Format**: `#<category>-<subject>` (e.g., `#arch-ansi`, `#test-cov`, `#dep-update`)
- **Category prefix**: Use a short abbreviation of the category (arch, test, dep, doc, perf, devops, ux, i18n, config, sec)
- **Subject**: A short mnemonic describing the task (ansi, cov, update, model, wait, release, logs, hook)
- **Uniqueness**: Each identifier must be unique within the KANBAN
- **Placement**: Placed at the beginning of the task, before the timestamp

**Examples:**
- `#arch-ansi` - Architecture task about ANSI functions
- `#test-cov` - Test task about coverage
- `#dep-update` - Dependencies update task
- `#devops-hook` - DevOps task about hooks

### Priority Levels

For KANBAN Backlog and In Progress sections, each idea/task must include a priority level:
- **🔴 P1** = High Priority (critical, security, blocking issues)
- **🟡 P2** = Medium Priority (important improvements)
- **🟢 P3** = Low Priority (nice to have, enhancements)

Priority must be placed after the identifier and timestamp, before the category emoji:
`**#hash [DD/MM/YYYY HH:mm:ss] Priority CategoryEmoji [CATEGORY]** Description`

### Category Icons (for Backlog Ideas)

Each idea in the backlog must use a category with its associated icon:
- **🔒 [SECURITY]**: Security improvements (validation, sanitization, etc.)
- **✅ [TEST]**: Testing improvements (unit tests, integration tests, coverage)
- **🚀 [PERFORMANCE]**: Performance optimizations (caching, memoization, etc.)
- **🏗️ [ARCHITECTURE]**: Code architecture improvements (refactoring, patterns)
- **🎨 [UX]**: User experience improvements (shortcuts, tooltips, feedback)
- **🔧 [DEVOPS]**: DevOps improvements (CI/CD, scripts, workflows)
- **🌍 [I18N]**: Internationalization improvements (translations, locales)
- **📦 [DEPENDENCIES]**: Dependency updates (package updates, upgrades)
- **⚙️ [CONFIG]**: Configuration improvements (build tools, setup)

### Categorization tags and Emojis (for Tasks)

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

### KANBAN.md

Contains the Kanban board with three sections: Backlog, In Progress, Done

#### Backlog section (## 📝 Backlog)

- Contains **feature ideas** to convert to tasks (`- [ ]`)
- Checked ideas (`- [x]`) are considered already converted (to ignore)
- Format: `- [ ] **[DD/MM/YYYY HH:mm:ss] Priority CategoryEmoji [CATEGORY]** Idea description`
  - `Priority` is one of: `🔴 P1`, `🟡 P2`, `🟢 P3`
  - `CategoryEmoji [CATEGORY]` is one of the category icons listed below
- Date and time indicate the moment of idea creation in backlog
- Comments are optional and serve only to document context
- Ideas should be sorted by priority (P1 first, then P2, then P3)

**Priority Legend:**
- 🔴 **P1** = High Priority (critical, security, blocking issues)
- 🟡 **P2** = Medium Priority (important improvements)
- 🟢 **P3** = Low Priority (nice to have, enhancements)

**Category Icons (for Ideas):**
- 🔒 **[SECURITY]**: Security improvements (validation, sanitization, etc.)
- ✅ **[TEST]**: Testing improvements (unit tests, integration tests, coverage)
- 🚀 **[PERFORMANCE]**: Performance optimizations (caching, memoization, etc.)
- 🏗️ **[ARCHITECTURE]**: Code architecture improvements (refactoring, patterns)
- 🎨 **[UX]**: User experience improvements (shortcuts, tooltips, feedback)
- 🔧 **[DEVOPS]**: DevOps improvements (CI/CD, scripts, workflows)
- 🌍 **[I18N]**: Internationalization improvements (translations, locales)
- 📦 **[DEPENDENCIES]**: Dependency updates (package updates, upgrades)
- ⚙️ **[CONFIG]**: Configuration improvements (build tools, setup)

#### In Progress section (## 🚧 In Progress)

- Contains **ideas being worked on** with associated tasks OR **isolated tasks**
- Idea sections: start with `### [DD/MM/YYYY HH:mm:ss] 💡 [IDEA] Description`
- Under each idea: tasks with standard emoji/tag format
- Isolated tasks: lines with `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`
- Task format: `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`
- Emojis and tags are the same as for CHANGELOG.md:
  - `✨ [FEAT]`: New feature or evolution
  - `🐛 [FIX]`: Bug fix or problem correction
  - `♻️ [REFACTOR]`: Refactoring
  - `⚡ [PERF]`: Performance
  - `📝 [DOCS]`: Documentation
  - `🎨 [STYLE]`: Style/Cosmetic
  - `✅ [TEST]`: Tests
  - `🔧 [CHORE]`: Configuration/Maintenance
- Date and time indicate the moment of task creation
- Comments are optional and serve only to document context

#### Done section (## ✅ Done)

- Contains **completed tasks** (`- [x]`)
- Format: `- [x] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`
- Uses the same emojis and tags as In Progress

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
- `.clauderules/log_changes.md` (to write in CHANGELOG.md)
- `.clauderules/quality_check.md` (to validate formats)

Any format rule modifications must be made **here only**.