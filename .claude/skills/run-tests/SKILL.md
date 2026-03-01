---
name: run-tests
description: Execute unit tests with Vitest and generate coverage report. Use to verify code changes.
disable-model-invocation: false
---

# Skill: Run Tests

## Description

Execute the unit test suite using Vitest and generate a coverage report.

## Purpose

This skill runs the project's unit tests and provides detailed results including test failures and coverage information.

## Usage

Invoke this skill when you need to:
- Verify code changes don't break existing tests
- Run tests after implementing new features
- Generate coverage reports for analysis

## Execution Steps

1. Run the test command:
   ```bash
   npm run test
   ```

2. Wait for all tests to complete.

3. Analyze the output:
   - Count total tests run
   - Count passed/failed tests
   - List failed tests with error messages
   - Report coverage percentage if available

## Output Analysis

### Success Output
```
✓ All tests passed (N passed)
Coverage: XX%
```

### Failure Output
```
✗ Some tests failed (N passed, M failed)
Failed tests:
  - test_file.spec.ts > test_name
    Error: expected X to equal Y
```

## Options

Run tests with coverage:
```bash
npm run test -- --coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with UI:
```bash
npm run test:ui
```

## Error Handling

If tests fail:
1. Report which tests failed
2. Provide error messages for each failure
3. Suggest reviewing the failing test files
4. Indicate if coverage is below threshold

## E2E Tests (Playwright)

The project also has end-to-end tests using Playwright.

### Running E2E Tests

**IMPORTANT**: Always use headless mode for CI/Linux environments:

```bash
npm run test:e2e:headless
```

This command runs Playwright tests in headless mode, which is required for:
- CI/CD pipelines
- Linux servers without display
- Automated testing environments

### E2E Test Structure

- E2E tests are located in `tests/e2e/`
- Test files use `.test.ts` suffix
- Tests use Playwright fixtures defined in `tests/e2e/fixtures.ts`

For more details, see `tests/e2e/README.md`.

## Notes

### Unit Tests (Vitest)
- Tests are configured in `vitest.config.ts`
- Test files use `.test.ts` or `.spec.ts` suffix
- Tests run in Happy DOM environment

### E2E Tests (Playwright)
- Tests are configured in `playwright.config.ts`
- Use `npm run test:e2e:headless` for CI/Linux
- See `tests/e2e/README.md` for detailed documentation