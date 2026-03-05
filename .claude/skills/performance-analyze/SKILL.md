# Performance Analyze Skill

Invoke the `performance-analyzer` agent to analyze and optimize performance.

## Usage

```
/performance-analyze
```

## Description

This skill invokes the `performance-analyzer` agent to:

1. **Bottleneck Detection**: Identify performance bottlenecks
2. **Bundle Analysis**: Analyze bundle size and composition
3. **Memory Usage**: Review memory usage patterns
4. **Render Performance**: Check for React performance issues

## Agent Details

| Property | Value |
|----------|-------|
| Agent | `performance-analyzer` |
| Tools | `Bash(npm run*)`, `Read`, `Glob`, `Grep` |

## Workflow

1. Run build analysis to check bundle size
2. Search for common performance anti-patterns
3. Review React component render patterns
4. Identify memory leak potentials
5. Provide optimization recommendations

## Output

- Bundle size analysis
- Performance bottleneck report
- Memory usage concerns
- React render optimization suggestions
- Code splitting recommendations

## When to Use

- When app feels slow or sluggish
- Before releasing a new version
- After adding new features
- When optimizing for production
- During performance review