# Contributing to Arere

Thank you for your interest in contributing to Arere! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/SphereStacking/Arere.git
cd Arere/packages/arere

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run in development mode
npm run dev
```

## Coding Guidelines

### Language Policy

**Source Code Comments**: English only
- All comments in `src/` and `tests/` must be written in English
- This ensures accessibility for international contributors
- JSDoc comments, inline comments, and test descriptions should all be in English

**Documentation**: Japanese first, English translation later
- Primary documentation in `docs/` is written in Japanese
- English translations are added after Japanese version is complete
- README files: English as primary (`README.md`), Japanese as `README.ja.md`

**Commit Messages**: English recommended
- Use conventional commit format: `type(scope): description`
- Examples: `feat(config): add layer selector`, `fix(plugin): resolve loading issue`

### Code Style

- **Formatter**: Biome (not Prettier or ESLint)
- **TypeScript**: Strict mode enabled
- **Modules**: ESM only (no CommonJS)
- **Target**: ES2020, Node ≥18

Run linting and formatting:
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format code
```

### Architecture

Follow Clean Architecture principles:
- **Domain Layer**: Business logic and types (no external dependencies)
- **Application Layer**: Use cases and services
- **Infrastructure Layer**: External systems (file system, npm, shell)
- **Presentation Layer**: UI components (React/Ink)
- **Shared Layer**: Common utilities

See [Architecture Guide](./docs/content/ja/3.development/1.architecture-guide.md) for details (Japanese).

### Testing

**Test-Driven Development (TDD)** is strongly encouraged:
1. 🔴 **Red**: Write a failing test first
2. 🟢 **Green**: Write minimum code to make it pass
3. 🔵 **Refactor**: Improve code structure

**Coverage Targets**:
- Overall: 90%+
- Core business logic: 95%+
- UI interaction components: 85%+

Run tests:
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

### i18n (Internationalization)

After modifying translation files:
```bash
npm run i18n:types     # Generate TypeScript types
npm run i18n:check     # Validate consistency
```

Translation files are located in `locales/{locale}/{namespace}.json`.

## Pull Request Process

1. **Fork and Clone**: Fork the repository and create a feature branch
2. **Write Tests**: Add tests for new features or bug fixes
3. **Follow Style Guide**: Ensure code follows project conventions
4. **Update Documentation**: Update relevant docs if needed
5. **Verify Build**: Ensure `npm run build` and `npm test` pass
6. **Submit PR**: Create a pull request with a clear description

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] Code follows style guidelines (run `npm run lint`)
- [ ] Comments are in English
- [ ] i18n types regenerated if translations modified
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format

## Pre-Release Policy (v0.x.x)

**Important**: Arere is currently in pre-release (v0.1.0).

- ✅ Breaking changes are acceptable
- ✅ No backward compatibility required
- ✅ Clean, simple implementations preferred over complex compatibility layers

This will change when v1.0 is released.

## Questions or Issues?

- **Bug Reports**: Use [GitHub Issues](https://github.com/SphereStacking/Arere/issues)
- **Questions**: Feel free to open a discussion issue
- **Security Issues**: Contact sphere.stacking@gmail.com privately

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Arere! 🎉
