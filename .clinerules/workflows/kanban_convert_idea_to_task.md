# Cline Workflow for Converting Backlog Ideas to Tasks

## Objective

This workflow allows converting feature ideas from the "Backlog" section of the `/KANBAN.md` file into "In Progress" sections with associated tasks.

## Format rules

See `.clinerules/task_format.md` for detailed format rules.

Summary:
- `- [ ]` → idea/task to do
- `- [x]` → checked idea/task
- Idea format: `- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** Description`
- Task format: `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`

## Execution instructions

### 1. Read KANBAN.md

Use the `read_file` tool to read the content of the `/KANBAN.md` file at the project root.

### 2. Analyze and filter ideas

Identify all lines corresponding to **ideas to convert** in the "## 📝 Backlog" section:
- Search for lines with format `- [ ] **[...]] 💡 [IDEA]**`
- **Ignore** already checked lines (`- [x]`)
- **Ignore** comments and header lines

### 3. Present ideas to user

Display the list of found ideas with a number for each. Use the `ask_followup_question` tool to ask the user:
- Which idea(s) they want to convert to task(s)
- If applicable, if they want to break down an idea into multiple tasks
- If multiple ideas need to be converted, request all selections at once

### 4. Create In Progress section for each idea

For each selected idea, create a new section in "## 🚧 In Progress":

**Section format:**
```markdown
### [DD/MM/YYYY HH:mm:ss] 💡 [IDEA] Idea description
- [ ] **[DD/MM/YYYY HH:mm:ss] ✨ [FEAT]** Task 1
- [ ] **[DD/MM/YYYY HH:mm:ss] 🔧 [CHORE]** Task 2
```

**Rules:**
- Use the same date and time as the original idea
- Create as many tasks as necessary
- Use the appropriate emoji and tag according to the nature of each task:
  - `✨ [FEAT]`: New feature
  - `🐛 [FIX]`: Bug fix
  - `♻️ [REFACTOR]`: Refactoring
  - `⚡ [PERF]`: Performance
  - `📝 [DOCS]`: Documentation
  - `🎨 [STYLE]`: Style/Cosmetic
  - `✅ [TEST]`: Tests
  - `🔧 [CHORE]`: Configuration/Maintenance

### 5. Delete idea from Backlog

Once tasks are successfully created, delete the corresponding idea from the "## 📝 Backlog" section:
- Use `replace_in_file` to delete the idea line
- The SEARCH block must match exactly the line containing the idea
- **Important**: DO NOT leave a checked trace in Backlog, delete the line completely

### 6. Update KANBAN.md

Use `replace_in_file` to add the new section in "## 🚧 In Progress" and delete the idea from "## 📝 Backlog".

### 7. Execution report

Inform the user:
- Of tasks created for each idea
- Of deletion of ideas from Backlog
- In case of error during task creation, do not modify KANBAN.md

## Important rules

- Never modify **already in progress** ideas or existing sections
- Delete an idea only after confirming that corresponding tasks have been created
- If task creation fails, inform the user without modifying KANBAN.md
- A converted idea **completely disappears** from Backlog (no trace left)

## Example flow

```
1. Read KANBAN.md → find 2 ideas in Backlog
2. Present ideas to user with ask_followup_question
3. User chooses idea #1 and asks to break it into 3 tasks
4. Create section in In Progress → success
5. Delete idea #1 from Backlog
6. Report: 3 tasks created from idea #1, idea deleted from Backlog
```

## Example conversion

**Before - Backlog:**
```markdown
## 📝 Backlog
- [ ] **[05/02/2026 17:00:00] 💡 [IDEA]** Add a dark/light theme system
```

**After - In Progress:**
```markdown
## 🚧 In Progress
### [05/02/2026 17:00:00] 💡 [IDEA] Add a dark/light theme system
- [ ] **[05/02/2026 17:30:15] 🔧 [CHORE]** Install necessary dependencies for theme system
- [ ] **[05/02/2026 17:30:20] ✨ [FEAT]** Create ThemeSwitcher component to switch between themes
- [ ] **[05/02/2026 17:30:25] 🎨 [STYLE]** Create styles for dark theme
```

**After - Backlog:**
```markdown
## 📝 Backlog

(No ideas for the moment)
```

## Special case: Isolated tasks

To add an isolated task (not linked to an idea), the user can directly edit KANBAN.md and add:
- In "## 🚧 In Progress": a task without idea section
- In "## ✅ Done": a completed task

Example:
```markdown
## 🚧 In Progress
- [ ] **[05/02/2026 18:00:00] 🐛 [FIX]** Fix critical bug in login