# Workflow: Agent Quality Check

## Objective

Use the Quality Validator agent to validate code changes before committing or marking tasks as complete.

## When to Use

Use this workflow when:
- Code changes have been made and need validation
- Before creating a git commit
- After implementing a new feature or bug fix
- Before marking a KANBAN task as complete
- When quality assurance is needed

## Execution Instructions

### 1. Receive Validation Request

The user may request validation with prompts like:
- "Validate this code change"
- "Run quality checks on the project"
- "Check if this code is ready for commit"
- "Verify code quality"

### 2. Invoke Quality Validator Agent

Invoke the quality-validator agent with the specific context:
- List the files or directories to validate
- Specify any particular areas of concern
- Include any constraints or requirements

Example invocation:
```
"Use the quality-validator agent to validate the changes to src/components/Terminal.tsx and electron/ipc-handlers/terminal.ts.
Focus on TypeScript errors, linting issues, and test failures."
```

### 3. Monitor Agent Execution

Wait for the quality-validator agent to complete:
- The agent will run Biome QA checks
- The agent will run TypeScript build
- The agent will run unit tests

### 4. Receive Validation Report

The agent will provide one of two outcomes:

**Validation Passed:**
```
✅ Quality Validation Passed
=============================
All checks completed successfully:
- Biome QA: ✓ Passed
- TypeScript Build: ✓ Passed
- Unit Tests: ✓ Passed

Code is ready for commit.
```

**Validation Failed:**
```
❌ Quality Validation Failed
=============================
Failed checks:
- Biome QA: ✗ Failed (N issues)
- TypeScript Build: ✗ Failed (N errors)
- Unit Tests: ✗ Failed (N tests)

Quality Issues:
[Detailed report]

Recommended Actions:
1. Run `npm run qa:fix` to auto-fix linting issues
2. Fix TypeScript errors manually
3. Fix test failures
```

### 5. Take Action Based on Results

**If validation passed:**
- Confirm code is ready for commit
- Proceed with git commit or next task
- Report success to user

**If validation failed:**
- Review the quality issues report
- Apply suggested fixes:
  - Run `npm run qa:fix` for linting issues
  - Manually fix TypeScript errors
  - Fix failing tests
- Re-run validation after fixes
- Only proceed when validation passes

## Example Flow

```
User: "I've made changes to the chat service. Can you validate them?"

You: "I'll use the quality-validator agent to validate the changes."

[Invoke quality-validator agent]

Agent Report:
✅ Quality Validation Passed
All checks completed successfully:
- Biome QA: ✓ Passed
- TypeScript Build: ✓ Passed
- Unit Tests: ✓ Passed

Code is ready for commit.

You: "All quality checks passed! The code is ready for commit."
```

## Important Rules

- Always use the quality-validator agent for validation
- Never suggest committing code that doesn't pass validation
- Wait for agent to complete before proceeding
- Apply all recommended fixes before marking as complete
- Re-run validation after applying fixes

## Error Handling

If the quality-validator agent fails:
1. Check the error message
2. Verify the files exist and are accessible
3. Ensure the agent has necessary permissions
4. Retry the validation if appropriate
5. Report the issue to the user

## Notes

- Validation includes Biome QA, TypeScript build, and unit tests
- All three checks must pass for validation to succeed
- Use this workflow as a gatekeeper before commits
- Ensures code quality standards are maintained