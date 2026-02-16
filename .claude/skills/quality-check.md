---
name: quality-check
description: Run quality validation (Biome QA, TypeScript build, unit tests). Use after code changes.
disable-model-invocation: false
---

# Skill: Quality Check

Run comprehensive quality validation on the project.

## Execution Steps

### 1. Run validation

```bash
npm run validate
```

This runs in parallel:
- Biome QA checks (`npm run qa`)
- TypeScript build (`npm run build`)
- Unit tests (`npm run test`)

### 2. Analyze results

**If all checks pass:**
```
✅ Quality Validation Passed
=============================
- Biome QA: ✓ Passed
- TypeScript Build: ✓ Passed
- Unit Tests: ✓ Passed

Code is ready for commit.
```

**If checks fail:**
```
❌ Quality Validation Failed
=============================
- Biome QA: ✗ Failed (N issues)
- TypeScript Build: ✗ Failed (N errors)
- Unit Tests: ✗ Failed (N tests)

Recommended Actions:
1. Run `npm run qa:fix` to auto-fix linting issues
2. Fix TypeScript errors manually
3. Fix failing tests
```

### 3. Apply fixes if needed

For linting issues:
```bash
npm run qa:fix
```

### 4. Re-validate

Run `npm run validate` again after fixes.

## Important Rules

- Never commit code that doesn't pass validation
- Fix all errors before marking tasks as complete
- Re-run validation after applying fixes

## Notes

- All three checks must pass for validation to succeed
- Use this skill before git commits
- Ensures code quality standards are maintained