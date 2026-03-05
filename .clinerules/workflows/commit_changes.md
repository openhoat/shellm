# Cline Workflow for Creating Git Commits from CHANGELOG.md

## Objective

This workflow automates Git commit creation using entries from `/CHANGELOG.md` as the source for commit messages.

## Execution Instructions

### 1. Analyze Git Status

Execute `git status` to identify:
- Modified files (modified: ...)
- New files (untracked files: ...)
- Deleted files (deleted: ...)

### 2. Read CHANGELOG.md

Use `read_file` to read the content of `/CHANGELOG.md`.

### 3. Analyze and Extract Change Entries

Identify all change entries in the format:
```
**[HH:MM:SS] Emoji [TAG]** Description
```

Extract for each entry:
- The tag (e.g., [FEAT], [FIX], [REFACTOR], etc.)
- The emoji
- The main description
- Details (bullet points after the description)

### 4. Determine Files to Include for Each Entry

For each CHANGELOG entry, analyze details to identify mentioned files:
- Look for file names in descriptions (e.g., "in src/components/Header.tsx")
- Use path patterns to identify related files
- Associate modified/untracked files from `git status` with corresponding entries

**Association Rules:**
- If an entry explicitly mentions files, use them
- If multiple entries share common files, include these files in each relevant commit
- Configuration files (.clinerules/, CHANGELOG.md, etc.) should be included in the commit corresponding to the modification

### 5. Generate Commit Message

For each entry, create a commit message in conventional format:

**Format:**
```
[TAG]: Main description

Details of the modification...
```

**Examples:**
```
[FEAT]: Add UserDashboard component for user interface

Create src/components/UserDashboard.tsx with base configuration
Add styles in src/components/UserDashboard.css
```

```
[REFACTOR]: Restructure task and idea management architecture

Create KANBAN.md file with Backlog, In Progress sections
Update .clinerules/task_format.md with rules for KANBAN.md
Create .clinerules/workflows/kanban_*.md workflows
```

### 6. Execute Commits

For each identified entry:

#### 6.1. Stage Related Files
```bash
git add file1 file2 file3 ...
```

#### 6.2. Create Commit with Generated Message
```bash
git commit -m "Commit message"
```

**Important:** Always use double quotes around commit messages to handle newlines and special characters.

#### 6.3. Verify Commit
Execute `git log -1` to confirm the commit was created correctly.

### 7. Execution Report

Once all commits are created:
- Inform the user of the number of commits created
- Summarize commits with their hash and message
- Confirm there are no uncommitted changes (verify with `git status`)

## Important Rules

- **Always include CHANGELOG.md** in each commit (as it contains the corresponding entry)
- **One commit per CHANGELOG entry**, no grouped commits
- **Preserve order** of entries (from most recent to oldest)
- **Do not modify** the message automatically generated from CHANGELOG
- **Handle errors**: if a commit fails, inform the user and continue with remaining entries

## Complete Flow Example

```
1. git status → 25 modified files, 8 untracked files
2. Read CHANGELOG.md → 3 entries identified
3. Entry 1: "[18:03:15] ♻️ [REFACTOR]** Restructure architecture..."
   - Identified files: KANBAN.md, .clinerules/workflows/kanban_*.md, .clinerules/task_format.md, etc.
   - git add KANBAN.md .clinerules/workflows/kanban_*.md .clinerules/task_format.md ...
   - git commit -m "[REFACTOR]: Restructure task and idea management architecture

   - Create KANBAN.md file with Backlog, In Progress sections
   - Update .clinerules/task_format.md with rules for KANBAN.md
   - ..."
4. Entry 3: "[15:42:30] ✅ [TEST]** Standardize tests..."
   - Identified files: src/services/commandExecutionService.ts, src/services/commandExecutionService.test.ts, etc.
   - git add src/services/commandExecutionService.ts src/services/commandExecutionService.test.ts ...
   - git commit -m "[TEST]: Standardize tests with `test` instead of `it`..."
5. Final verification: git status → "nothing to commit, working tree clean"
6. Report: 3 commits created successfully
```

## Edge Cases

### Modified Files Not Documented in CHANGELOG.md

If git status shows modified files that don't correspond to any CHANGELOG entry:
1. Inform the user about these orphan files
2. Ask the user if they want to:
   - Create a CHANGELOG entry for these files
   - Include them in the most relevant existing commit
   - Leave them uncommitted

### File Conflicts

If a modified file is mentioned in multiple CHANGELOG entries:
1. Inform the user of the conflict
2. Ask which commit should include this file
3. Only include the file in one commit

### Deleted Files

For deleted files mentioned in CHANGELOG:
- Use `git add deleted_file` to stage the deletion
- The commit will automatically include the file deletion