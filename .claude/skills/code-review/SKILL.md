# Code Review Skill

Invoke the `code-reviewer` agent to perform a comprehensive code review.

## Usage

```
/code-review
```

## Description

This skill invokes the `code-reviewer` agent to:

1. **Quality Analysis**: Review code for quality, best practices, and maintainability
2. **Security Check**: Identify potential security vulnerabilities
3. **Pattern Validation**: Ensure code follows established patterns
4. **Documentation Review**: Check for adequate documentation and comments

## Agent Details

| Property | Value |
|----------|-------|
| Agent | `code-reviewer` |
| Tools | `Bash(npm run validate*)`, `read-kanban`, `run-validation`, `analyze-quality-report`, `Read`, `Glob`, `Grep` |

## Workflow

1. The agent reads the KANBAN to understand the current task context
2. Runs validation to check for linting and type errors
3. Analyzes the quality report for issues
4. Reviews changed files for best practices
5. Provides recommendations for improvements

## Output

- Code quality assessment
- Security vulnerability report (if any)
- Best practice recommendations
- Suggested improvements

## When to Use

- Before committing changes
- After implementing a new feature
- When refactoring existing code
- During code review process