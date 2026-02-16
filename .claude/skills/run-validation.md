---
name: run-validation
description: Run project validation (Biome QA, TypeScript build, unit tests). Use after code changes.
disable-model-invocation: false
---

# Skill: Run Validation

## Description

Execute the complete project validation workflow including quality checks, build, and tests.

## Purpose

This skill runs the `npm run validate` command which executes:
- Biome quality checks (`npm run qa`)
- TypeScript build (`npm run build`)
- Unit tests (`npm run test`)

## Usage

Invoke this skill when you need to validate the project after code changes.

## Execution Steps

1. Run the validation command:
   ```bash
   npm run validate
   ```

2. Wait for all checks to complete.

3. Analyze the output:
   - If all checks pass: Report success
   - If checks fail: Identify which checks failed and report errors

## Output Analysis

### Success Output
```
✔ All checks passed
```

### Failure Output
```
✗ Biome check failed
✗ Build failed
✗ Tests failed
```

## Error Handling

If validation fails:
1. Report which checks failed (qa, build, or test)
2. Provide error messages from the failed checks
3. Suggest running `npm run qa:fix` for linting errors if applicable

## Notes

- This command runs all three checks in parallel using `concurrently`
- All checks must pass for the validation to be considered successful
- Use this skill after any code modification before marking a task as complete