# Cline Workflow for Adding Ideas to Backlog

## Objective

This workflow allows interactive addition of feature ideas to the "Backlog" section of the `/KANBAN.md` file.

## Format rules

See `.clinerules/task_format.md` for detailed format rules.

Summary:
- `- [ ]` → idea to do
- Idea format: `- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** Description`
- Date format: `DD/MM/YYYY HH:mm:ss`

## Execution instructions

### 1. Read KANBAN.md

Use the `read_file` tool to read the content of the `/KANBAN.md` file at the project root.

### 2. Ask user for idea description

Use the `ask_followup_question` tool to request the description of the idea to add.

**Question format:**
```
What idea would you like to add to the backlog?
```

Allow the user to provide a clear description of the feature idea.

### 3. Generate current timestamp

Generate the current date and time in the format `DD/MM/YYYY HH:mm:ss`.

Example: `12/02/2026 10:30:15`

### 4. Create the idea entry

Create the idea entry with the following format:

```markdown
- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** User-provided description
```

**Rules:**
- Use the current date and time in the specified format
- Use the emoji `💡` and tag `[IDEA]` as specified in the format rules
- Use the exact description provided by the user
- Do not modify or summarize the user's description

### 5. Add idea to Backlog

Use `replace_in_file` to add the idea to the "## 📝 Backlog" section.

#### 5a. If Backlog contains "(No ideas for the moment)"

Replace the line:

```markdown
(No ideas for the moment)
```

With:

```markdown
- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** User-provided description
```

#### 5b. If Backlog already has ideas

Add the new idea at the top of the list, immediately after the header:

```markdown
## 📝 Backlog

- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** New idea
- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** Existing idea 1
- [ ] **[DD/MM/YYYY HH:mm:ss] 💡 [IDEA]** Existing idea 2
```

### 6. Confirm addition

Inform the user that the idea has been successfully added to the backlog with:
- The generated timestamp
- The exact description added

## Important rules

- Always ask the user for the description using `ask_followup_question`
- Generate the timestamp automatically; do not ask the user for it
- Use the exact description provided by the user without modification
- Always use the emoji `💡` and tag `[IDEA]`
- New ideas should be added at the top of the backlog list

## Example flow

```
1. Read KANBAN.md → found "No ideas for the moment" in Backlog

2. Ask user: "What idea would you like to add to the backlog?"

3. User responds: "Add support for keyboard shortcuts"

4. Generate timestamp: 12/02/2026 10:30:15

5. Create entry: - [ ] **[12/02/2026 10:30:15] 💡 [IDEA]** Add support for keyboard shortcuts

6. Update KANBAN.md → replace "(No ideas for the moment)" with the new entry

7. Confirm: "Idea added to backlog: 'Add support for keyboard shortcuts' at 12/02/2026 10:30:15"
```

## Example KANBAN.md before/after

**Before - Backlog:**
```markdown
## 📝 Backlog

(No ideas for the moment)
```

**After - Backlog:**
```markdown
## 📝 Backlog

- [ ] **[12/02/2026 10:30:15] 💡 [IDEA]** Add support for keyboard shortcuts
```

**Example with multiple ideas - Before:**
```markdown
## 📝 Backlog

- [ ] **[10/02/2026 15:00:00] 💡 [IDEA]** Add dark mode
```

**Example with multiple ideas - After:**
```markdown
## 📝 Backlog

- [ ] **[12/02/2026 10:30:15] 💡 [IDEA]** Add support for keyboard shortcuts
- [ ] **[10/02/2026 15:00:00] 💡 [IDEA]** Add dark mode
```

## Timestamp generation

The timestamp must use the current date and time when the workflow is executed:
- Day: 2 digits (01-31)
- Month: 2 digits (01-12)
- Year: 4 digits (e.g., 2026)
- Hours: 2 digits in 24h format (00-23)
- Minutes: 2 digits (00-59)
- Seconds: 2 digits (00-59)

Format: `DD/MM/YYYY HH:mm:ss`

## Usage

This workflow can be executed whenever the user wants to add a new idea to the backlog without manually editing the KANBAN.md file. It ensures proper formatting and automatic timestamp generation.