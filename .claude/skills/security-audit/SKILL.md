# Security Audit Skill

Invoke the `security-auditor` agent to perform a security audit.

## Usage

```
/security-audit
```

## Description

This skill invokes the `security-auditor` agent to:

1. **Dependency Audit**: Check for known vulnerabilities in dependencies
2. **Code Security Review**: Identify security issues in codebase
3. **Input Validation**: Check for proper input sanitization
4. **Authentication Review**: Verify authentication and authorization patterns

## Agent Details

| Property | Value |
|----------|-------|
| Agent | `security-auditor` |
| Tools | `Bash(npm audit*)`, `Read`, `Glob`, `Grep` |

## Workflow

1. Run `npm audit` to check for dependency vulnerabilities
2. Search for common security anti-patterns
3. Review authentication and authorization implementations
4. Check for proper input validation and sanitization
5. Provide a comprehensive security report

## Output

- Dependency vulnerability report
- Code security findings
- Input validation issues
- Authentication/authorization recommendations
- Remediation suggestions

## When to Use

- Before releasing a new version
- After adding new dependencies
- When implementing authentication features
- During security review process
- After making changes to input handling