# Contributing

Contributions are welcome! Here's how to get started.

## How to Contribute

1. Fork the project
2. Create a branch for your feature (`git checkout -b feat/my-feature`)
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## Development Workflow

### Setup

```bash
git clone https://github.com/openhoat/termaid.git
cd termaid
npm install
```

### Running in Development

```bash
npm run dev
```

### Quality Checks

Before submitting a PR, make sure all checks pass:

```bash
npm run validate
```

This runs:
- **Biome** linting and formatting
- **TypeScript** type checking
- **Vitest** unit tests

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Examples:
- `feat(chat): add message history export`
- `fix(terminal): resolve cursor positioning issue`
- `docs(readme): update installation instructions`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
