# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arere** (あれれ？何だっけ) is a TypeScript-based persistent terminal launcher framework organized as a **monorepo**. It provides an interactive TUI for discovering and executing actions, with support for i18n, fuzzy search, and plugins.

**Repository Structure**:
```
laziness/
├── packages/
│   ├── arere/                    # Main core package
│   ├── arere-plugin-demo/        # Example plugin
│   └── arere-plugin-tutorial/    # Tutorial plugin
├── spec/                         # Specifications
├── docs/                         # Docus documentation
├── examples/                     # Example configurations
└── actions/                      # Build/maintenance scripts
```

## Development Commands

### Monorepo Commands (from root)
```bash
npm run build              # Build all packages
npm run dev                # Watch mode for all packages
npm test                   # Run tests in all packages
npm run typecheck          # Type check all packages
npm run lint               # Lint with Biome
npm run lint:fix           # Auto-fix lint issues
npm run format             # Format code with Biome
```

### Package-Specific Commands
```bash
cd packages/arere
npm run build              # Build arere package
npm run dev                # Watch mode
npm test                   # Run tests
npm test -- --run <file>   # Run specific test file
npm run test:coverage      # Run with coverage report (target: 90%+)
npm run bench              # Run benchmarks
```

### Documentation
```bash
npm run docs               # Start Docus dev server
npm run docs:build         # Build documentation
```

## Monorepo Architecture

### Package Dependencies
- **arere** (core): Main terminal launcher framework - no internal dependencies
- **arere-plugin-demo**: Example plugin - depends on `arere` (peerDependency)
- **arere-plugin-tutorial**: Tutorial plugin - depends on `arere` (peerDependency)

### Workspace Management
- Uses npm workspaces (`"workspaces": ["packages/*"]`)
- Shared devDependencies at root: Biome, TypeScript
- Each package has its own dependencies and build configuration

## Core Package Architecture (`packages/arere`)

> **📝 Architecture Documentation**
>
> For details on Clean Architecture / Layered Architecture, see the following documents:
> - **[Architecture Guide](docs/content/en/4.development/1.architecture-guide.md)** - Layer structure, responsibilities, data flow
> - **[Testing Guide](docs/content/en/4.development/2.testing-guide.md)** - TDD principles, test patterns
> - `packages/arere/CLAUDE.md` - Package-specific details
>
> **⚠️ Update Policy**:
> - When architecture changes, **always update** the above documents
> - This CLAUDE.md contains only an overview; details are consolidated in the above documents

Key highlights:

### Clean Architecture Layers

```
src/
├── core/                # Core Layer - Action loading system
├── domain/              # Domain Layer - Business logic & types
├── infrastructure/      # Infrastructure Layer - External systems (config, plugin, i18n, shell, prompt)
├── application/         # Application Layer - Use cases (ConfigService, PluginService)
├── presentation/        # Presentation Layer - UI (React/Ink components, modes)
└── shared/              # Shared Layer - Common utilities (logger, error, path)
```

**Path Alias**: `@/*` → `./src/*` (used throughout the codebase)

**Test Results**: ✅ 776/776 tests passed, 83.52% coverage

### Action System
**✅ Completed**: The codebase has been fully migrated from "Script" → "Action" terminology:
- Types: `Action`, `ActionContext`, etc.
- Functions: `defineAction()`, etc.
- Directories: `src/domain/action/`, `actions/`, etc.

### Traditional Description (Reference)
1. **CLI Entry** (`packages/arere/src/cli.ts`)
2. **Action System** - Dynamic loading with jiti, priority-based registry
3. **Plugin System** - NPM-based with automatic detection (`arere-plugin-*`)
4. **UI Layer** - React components via Ink (terminal UI framework)
5. **Execution Context** - Provides actions with prompt API, shell executor, i18n

## Important Development Policies

### 🚨 No Backward Compatibility Required (Pre-Release)

**CRITICAL**: This project is in **pre-release** (v0.x.x) and has NOT been officially released yet.

- ✅ **Breaking changes are acceptable** - Make bold architectural changes when needed
- ✅ **No migration paths required** - Users are expected to adapt to new structures
- ✅ **Clean slate approach** - Remove old code completely rather than maintaining compatibility layers
- ✅ **Simplify ruthlessly** - Prefer simple, clean implementations over complex compatibility code

**Examples of acceptable changes:**
- Renaming directories (`.arere/*.ts` → `.arere/actions/*.ts`)
- Changing configuration file locations (`arere.config.json` → `.arere/settings.json`)
- Restructuring internal APIs
- Removing deprecated features entirely

**When v1.0 is released**, backward compatibility will become important. Until then, prioritize:
1. Clean, maintainable code
2. Good documentation for current structure
3. Clear migration guides for major changes (when releasing v1.0)

### 🧪 Test-Driven Development (TDD)

**CRITICAL**: This project follows **Test-Driven Development (TDD)** based on [@t_wada](https://twitter.com/t_wada)'s patterns.

> **📝 Test Documentation**
>
> For TDD principles, test patterns for each layer, and mock strategies, see the **[Testing Guide](docs/content/en/4.development/2.testing-guide.md)**.
>
> **⚠️ Update Policy**:
> - When test policies change, **always update** the testing guide
> - Add new test patterns and best practices as they are discovered

**TDD Cycle (Red-Green-Refactor)**:
1. 🔴 **Red**: Write a failing test first
2. 🟢 **Green**: Write the minimum code to make the test pass
3. 🔵 **Refactor**: Improve code structure with passing tests as safety net

**Quick Start**:
```bash
npm test                   # Run all tests (from root or package)
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

**Coverage Target**: 90%+ (current: 90%+, 803 tests)

## Development Workflow

### Working on Core Package
```bash
cd packages/arere
npm run dev                # Watch mode
npm test                   # Run tests
```

### Creating a New Plugin
1. Create package in `packages/arere-plugin-{name}/`
2. Set up `package.json` with `arere` as peerDependency
3. Use `definePlugin()` helper in `src/index.ts`:
   ```typescript
   import { definePlugin } from 'arere'
   import { z } from 'zod'

   export default definePlugin({
     meta: {
       name: 'arere-plugin-{name}',
       version: '1.0.0',
       description: 'Your plugin description',
     },
     actions: ['actions/hello.ts'],
     locales: 'locales',  // Optional
     configSchema: z.object({  // Optional
       apiKey: z.string(),
     }),
   })
   ```
4. Add action files in `actions/` directory
5. Optional: Add `locales/` for i18n
6. Build and link: `npm run build && npm link`

### Adding a New Action to Core
1. Create `.ts` file in `packages/arere/.arere/` (for testing)
2. Use `defineAction()` helper
3. Run `arere` from package root to test

### Updating i18n
1. Edit JSON in `packages/arere/locales/{locale}/{namespace}.json`
2. TypeScript types are auto-inferred from JSON (no script needed)
3. Run `npm run test:i18n` from root to validate all packages

## Testing Guidelines

### Coverage Targets
- Overall: **90%+** (current: 90.41%)
- UI interaction components: 85%+
- Core business logic: 95%+

### Running Tests
```bash
# From root - all packages
npm test

# From package - specific package
cd packages/arere
npm test
npm run test:coverage
npm test -- --run <file>  # Single test file
```

### Testing UI Components
Ink components use `ink-testing-library`:
```typescript
import { render } from 'ink-testing-library'

// Mock useInput for keyboard interactions
let capturedHandler: ((input: string, key: any) => void) | null = null
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink')
  return {
    ...actual,
    useInput: (handler) => { capturedHandler = handler }
  }
})

// Simulate key presses
capturedHandler?.('', { return: true })     // Enter
capturedHandler?.('a', {})                  // Character 'a'
capturedHandler?.('', { downArrow: true })  // Down arrow
```

## Important Constraints

### Monorepo
- Always run build/test commands from appropriate directory
- Changes in `arere` core require rebuilding before testing plugins
- Link plugins locally: `npm link` in plugin dir, then `npm link arere-plugin-{name}` in arere dir

### Action Loading
- Actions loaded with **jiti** (runtime TypeScript transpiler)
- Must use absolute paths before loading
- Graceful failure with warnings, not errors

### Plugin System
- Naming convention: `arere-plugin-*` (required for auto-detection)
- Plugin entry must export `ArerePlugin` object
- Config validation with Zod schemas
- **Plugin i18n**:
  - Translations: `locales/{locale}/translation.json`
  - Namespace: `meta.i18nNamespace` (defaults to plugin name)
  - In actions: Use `plugin:` prefix to access plugin translations
    - `t('plugin:greeting')` ✓ From plugin namespace
    - `t('greeting')` ✗ From action namespace (usually empty)
  - See: [Plugin Development Guide](docs/content/en/1.guides/04.plugins/02.creating.md)

### i18n
- Translation keys are type-checked via TypeScript (auto-inferred from JSON)
- Types are automatically derived from JSON files - no script needed
- Changes to JSON files are immediately reflected in types

### Configuration

**⚠️ IMPORTANT**: The configuration file format is **`.arere/settings.json`** (JSON only).
- **NO** `arere.config.ts` or `arere.config.js` - these do NOT exist
- **NO** TypeScript/JavaScript config files for arere settings

**File Locations**:
- Workspace: `.arere/settings.json` (project-specific)
- User: `~/.arere/settings.json` (global)

**Priority**: workspace → user → defaults

**Example** (plugin configuration):
```json
{
  "locale": "ja",
  "plugins": {
    "arere-plugin-githooks": {
      "hooks": {
        "pre-commit": {
          "actions": ["lint", "typecheck"],
          "enabled": true
        }
      }
    }
  }
}
```

- Changes validated against Zod schema

## 🚫 Hardcoding Prohibition Rules

### Colors - No Hardcoding

**❌ Bad**: Specifying colors directly
```typescript
// Bad - Magic colors
<Text color="green">Success</Text>
<Text color="#00ff00">OK</Text>
<Box borderColor="blue">...</Box>
```

**✅ Good**: Use the theme system
```typescript
// Good - Get from theme
import { useTheme } from '@/infrastructure/theme'

const { colors } = useTheme()
<Text color={colors.success}>Success</Text>
<Box borderColor={colors.border.active}>...</Box>
```

**Reason**: To allow users to customize themes. Essential for dark mode/light mode support.

### Keybindings - No Hardcoding

**❌ Bad**: Specifying keybindings directly
```typescript
// Bad - Magic keys
if (key.return) { submit() }
if (input === 'q') { quit() }
if (key.escape) { cancel() }
```

**✅ Good**: Use keybinding settings
```typescript
// Good - Get from settings
import { useKeybindings } from '@/infrastructure/keybindings'

const keybindings = useKeybindings()
if (keybindings.match('submit', input, key)) { submit() }
if (keybindings.match('quit', input, key)) { quit() }
if (keybindings.match('cancel', input, key)) { cancel() }
```

**Reason**: To allow users to customize keybindings. Essential for Vim/Emacs users.

### UI Strings - No Hardcoding

**❌ Bad**: Specifying strings directly
```typescript
// Bad - Magic strings
<Text>Settings</Text>
<Text>Press Enter to continue</Text>
const message = "Error occurred"
```

**✅ Good**: Use i18n `t()` function
```typescript
// Good - Use translation function
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
<Text>{t('ui:settings.title')}</Text>
<Text>{t('ui:common.pressEnterToContinue')}</Text>
const message = t('errors:general.occurred')
```

**Reason**: For internationalization (i18n). Essential for Japanese/English switching.

### Locales Maintenance - Remove Unused Translation Keys

**❌ Bad**: Leaving unused translation keys
```json
// Bad - Keys not used in code remain
{
  "oldFeature": "This feature was removed",  // Forgotten deletion
  "newFeature": "Current feature"
}
```

**✅ Good**: Sync with code and remove unused keys
```json
// Good - Only used keys
{
  "newFeature": "Current feature"
}
```

**Reasons**:
- Prevent translation file bloat
- Reduce translator workload
- Prevent bugs from code/translation mismatch

**When to delete**: Always check during feature removal or refactoring

### Exceptions

Hardcoding is allowed only in these cases:
- **Test code**: When used as mock values
- **Theme/keybinding definition files**: Default value definitions
- **Log output**: Debug log messages (not shown to users)
- **Technical strings**: File paths, command names, identifiers, etc.

## Code Style

- Uses **Biome** for linting and formatting (not ESLint/Prettier)
- TypeScript strict mode enabled
- ESM modules only (no CommonJS)
- Target: ES2020, Node ≥18

## Common Gotchas

1. **Using relative paths with jiti** → always resolve to absolute first
3. **Monorepo command context** → running tests from root vs package gives different results
4. **Plugin naming** → must start with `arere-plugin-` for auto-detection
5. **Not handling shell executor errors** → `$` returns result with `exitCode`, doesn't throw

## 🔍 Implementation Rules

### Type Definition Verification Required

**CRITICAL**: Before implementing new features or APIs, **always verify type definitions first**.

**❌ Bad**: Assuming API structure from memory or past code
```typescript
// Bad - Assuming prompt is directly in context
run: async ({ $, tui, prompt, t }) => {
  await prompt.select(...)  // ❌ prompt doesn't exist here!
}
```

**✅ Good**: Check type definitions before implementation
```typescript
// 1. First check: packages/arere/src/domain/action/types.ts
// 2. Verify ActionContext interface structure
// 3. Then implement correctly:
run: async ({ $, tui, t }) => {
  const { prompt, output } = tui  // ✅ prompt is inside tui
  await prompt.select(...)
}
```

**Key Type Definition Files**:
- `packages/arere/src/domain/action/types.ts` - ActionContext, PromptAPI, TuiAPI
- `packages/arere/src/domain/plugin/types.ts` - Plugin types
- `packages/arere/src/infrastructure/config/schema.ts` - Config schema

**When to Verify**:
- When writing action `run` functions
- When using prompt/output/control APIs
- When accessing config or plugin features
- When implementing new plugin actions
## Directory Conventions

### User-Facing Directories
- `.arere/` - Action files directory
- `~/.arere/` - Global actions
- `./.arere/` - Project-specific actions

### Code Directories (✅ Completed Rename)
- `src/action/` - Action types and utilities
- `src/ui/components/action/` - UI components for actions
- Plugin action directories: `actions/`
- See `plan/phase-23-script-to-action-rename.md` for full migration details

## Related Documentation

- **Core Package**: `packages/arere/CLAUDE.md` - Detailed architecture
- **Contributing**: `CONTRIBUTING.md` - Contribution guidelines
- **README**: `README.md` - User-facing documentation
- **Plans**: `plan/` - Development phase plans
- **Specs**: `spec/` - Original specifications
- **API Docs**: `docs/api/` - API references
- **Guides**: `docs/guides/` - Development guides

## Quick Reference: Key Files

### Monorepo Root
- `package.json` - Workspace configuration
- `biome.json` - Linter/formatter config
- `tsconfig.json` - TypeScript base config

### Core Package (`packages/arere/`)
- `src/cli.ts` - Entry point
- `src/action/` - Action type definitions and utilities
- `src/plugin/` - Plugin system
- `src/ui/` - Ink/React components
- `src/i18n/` - i18next setup
- `locales/` - Translation files

### Development
- `examples/` - Example configurations
- `.arere/` - Test actions for development

## Development Tips

- When working on multiple packages, use `npm run build` from root to rebuild all
- Use `npm link` for local plugin development
- i18n types are auto-inferred from JSON files - no script needed
- Current focus: 90%+ test coverage maintained (780 tests passing)
