# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arere** (あれれ？何だっけ) is a TypeScript-based persistent terminal launcher framework with a plugin system. It provides an interactive TUI for discovering and executing actions, with support for i18n, fuzzy search, and plugins.

## Development Commands

### Building
```bash
npm run build              # Build project with tsup
npm run dev                # Watch mode for development
npm run typecheck          # Type check without emitting
```

### Testing
```bash
npm test                   # Run all tests once
npm test -- --run <file>   # Run specific test file
npm run test:watch         # Watch mode
npm run test:coverage      # Run with coverage report
npm run bench              # Run benchmarks in watch mode
npm run bench:run          # Run benchmarks once
```

### Linting & Formatting
```bash
npm run lint               # Lint with Biome
npm run lint:fix           # Auto-fix lint issues
npm run format             # Format code with Biome
npm run format:check       # Check formatting without modifying
```

### Documentation
See root package for Docus documentation commands.

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
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

**Coverage Target**: 90%+ (current: 1166 tests)

## Architecture Overview

The codebase uses a **Feature-based Architecture** where related code is grouped by feature rather than by layer:

### Directory Structure

```
src/
├── action/              # Action system (types, loading, execution, context)
├── plugin/              # Plugin system (detection, loading, management)
├── config/              # Configuration management (schema, manager, paths)
├── i18n/                # Internationalization (translations, scoped T)
├── shell/               # Shell execution ($ tagged template)
├── ui/                  # Terminal UI (React/Ink components, screens, stores)
├── modes/               # Execution modes (UI mode, headless mode)
└── lib/                 # Shared utilities (logger, error, path)
```

**Path Alias**: `@/*` → `./src/*`

### High-Level Flow

1. **CLI Entry** (`src/cli.ts`) → Config loading → i18n initialization → React/Ink app
2. **Action System** - Dynamic loading of TypeScript actions using jiti
3. **Plugin System** - NPM-based plugins with automatic detection
4. **UI Layer** - React components rendered via Ink (terminal UI framework)
5. **Execution Context** - Provides actions with prompt API, shell executor, i18n

### Action Loading Priority (Last-Wins)

1. **Plugin actions** (highest priority)
2. **Global actions** (`~/.arere/`)
3. **Project actions** (`./.arere/`)

Actions are discovered → loaded with jiti → registered to ActionRegistry → displayed in UI.

### Plugin System Architecture

Plugins are npm packages with naming convention `arere-plugin-*`:

```typescript
// Plugin definition using definePlugin() helper
import { definePlugin } from 'arere'
import { z } from 'zod'

export default definePlugin({
  meta: {
    name: 'arere-plugin-example',
    version: '1.0.0',
    description: 'Example plugin',
    author: 'Your Name',
  },
  actions: ['actions/hello.ts', 'actions/goodbye.ts'],  // Relative paths
  locales: 'locales',                // Optional i18n directory
  configSchema: z.object({           // Optional config validation
    apiKey: z.string(),
  }),
})
```

**Plugin directory structure:**
```
src/plugin/
├── types.ts           # PluginMeta, ArerePlugin, LoadedPlugin types
├── define.ts          # definePlugin() helper function
├── manager.ts         # PluginManager class
├── detector.ts        # detectPlugins (scans node_modules)
├── resolver.ts        # getGlobalNodeModules (system paths)
├── loader.ts          # loadPlugin, loadPluginActions (jiti loading)
├── service.ts         # PluginService (toggle, enable/disable)
└── index.ts           # Public exports
```

**Usage:**
```typescript
import { createPluginManager } from '@/plugin'
const pluginManager = createPluginManager()
await pluginManager.loadAll(config)
```

**Plugin lifecycle:**
- Detection: Scans `node_modules/` for `arere-plugin-*` packages
- Loading: Uses jiti to load plugin entry point (resolves paths to absolute)
- Validation: Validates user config against schema (if provided)
- Registration: Registers plugin i18n + adds actions to registry
- Hot-reload: Plugins can be enabled/disabled via Settings UI

**Plugin config** (in `.arere/settings.json`):
```json
{
  "plugins": {
    "arere-plugin-name": true,
    "arere-plugin-other": {
      "enabled": true,
      "config": { "apiKey": "xxx" }
    }
  }
}
```

### i18n System

- Uses **i18next** with namespaces: `common`, `cli`, `ui`, `errors`
- Built-in locales: `en`, `ja`
- Translation files: `locales/{locale}/{namespace}.json`
- Type generation: Types are auto-inferred from JSON files (no script needed)
- Dynamic registration: Plugins/actions can register translations at runtime

**Translation patterns:**
```typescript
t('actions.quit', { ns: 'common' })                    // Core translations
t('plugin.myFeature', { ns: 'plugin-name' })          // Plugin translations
// Actions use defineAction's translations property for i18n
```

### UI State Management

Custom React hooks in `src/ui/hooks/app/`:

- `useAppState()` - Central state (actions, config, screen, execution status)
- `useKeyboardInput()` - Global keyboard handling (navigation, search, quit)
- `useActionExecution()` - Action launch + prompt resolution
- `useConfigManagement()` - Config persistence
- `usePluginManagement()` - Plugin hot-reload

**Screen routing** (`ScreenRouter.tsx`):
- `list` - Action list with fuzzy search
- `search` - Full-screen fuzzy search mode
- `executing` - Action running (with cancel)
- `success` / `error` - Result screens
- `help` - Keyboard shortcuts
- `settings` - Configuration UI
- `plugin-list` - Plugin management
- `plugin-detail` - Plugin configuration form

### Two-Layer Prompt System

Actions call prompts synchronously from their perspective, but the implementation is asynchronous:

```typeaction
// Action side (appears sync)
const name = await prompt.text('Enter name:')

// UI side (actually async)
1. Action calls prompt → queues request → awaits Promise
2. UI detects request → renders PromptRenderer component
3. User interacts → input captured
4. Promise resolves → action continues
```

### Shell Execution

Actions use tagged template literals for shell commands:

```typeaction
const $ = context.$   // Provided in ActionContext

const result = await $`npm run build`
// Returns: { stdout, stderr, exitCode }

const name = 'world'
const result = await $`echo Hello, ${name}!`  // Safe escaping
```

Implementation uses Node's `spawn()` with `/bin/sh -c`, escapes arguments safely, and returns results instead of throwing (allows actions to handle errors).

### Configuration System

**Architecture**:
- **Unified Manager**: Read/Write operations integrated in FileConfigManager
- **Simple Instantiation**: No Dependency Injection required
- **Single Source of Truth**: Config merging logic centralized in Manager.loadMerged()
- **Testability**: FileConfigManager can be mocked for unit tests

**Layer System**:
- VSCode-style 2-layer system with priority: workspace → user → defaults
- **Schema**: Validated with Zod (`src/config/schema.ts`)
- **Locations**:
  - Workspace: `.arere/settings.json` (project-specific)
  - User: `~/.arere/settings.json` (global)

**Implementation**:
- **FileConfigManager** (Unified): loadMerged(), loadLayer(), loadAll(), save(), delete(), saveLayer()
- **ConfigService** (Application): Uses FileConfigManager internally with side effects

**Features**:
- **Partial Save**: Only changed keys are written to config files
- **Nested Keys**: Supports dot notation like `theme.primaryColor`
- **Layer Selector**: Settings UI allows switching between User/Workspace layers
- **Override Detection**: Settings overridden by Workspace are marked with `(⚠ overridden)`

## Key Technical Patterns

### 1. Registry Pattern
`ActionRegistry` is a Map-based registry with "last-wins" for duplicate names (plugins > global > project).

### 2. Context Pattern
`ActionContext` encapsulates all action APIs (prompt, shell, i18n, env) via dependency injection.

### 3. Dynamic Module Loading
Uses **jiti** to load TypeAction files at runtime without pre-compilation. Handles both `.ts` and `.js` files gracefully.

### 4. Validation with Zod
Plugin configs and main config use Zod schemas for runtime validation and type inference.

### 5. Hook-Based UI Architecture
Custom React hooks separate concerns: state management, keyboard handling, execution logic, config persistence.

## Testing Guidelines

### Test Structure
```
tests/
├── unit/               # Component and utility tests
│   ├── config/
│   ├── core/
│   ├── i18n/
│   ├── plugin/
│   ├── action/
│   └── ui/            # Ink component tests with ink-testing-library
├── integration/       # Multi-component integration tests
└── e2e/              # End-to-end workflow tests
```

### Testing UI Components

Use `ink-testing-library` for Ink components:

```typeaction
import { render } from 'ink-testing-library'

const { lastFrame } = render(<MyComponent />)
expect(lastFrame()).toContain('expected text')
```

**For keyboard interactions**, mock `useInput` from Ink:

```typeaction
let capturedHandler: ((input: string, key: any) => void) | null = null

vi.mock('ink', async () => {
  const actual = await vi.importActual('ink')
  return {
    ...actual,
    useInput: (handler: (input: string, key: any) => void) => {
      capturedHandler = handler
    },
  }
})

// Simulate key press
capturedHandler?.('', { return: true })  // Enter key
capturedHandler?.('a', {})               // Character 'a'
capturedHandler?.('', { downArrow: true }) // Down arrow
```

### Coverage Targets
- Overall: 90%+
- UI interaction components: 85%+
- Core business logic: 95%+

Current coverage: **90%+** (1166 tests)

## Code Style

- Uses **Biome** for linting and formatting (not ESLint/Prettier)
- TypeAction strict mode enabled
- ESM modules only (no CommonJS)
- Target: ES2020, Node ≥18

## File Organization

```
src/
├── cli.ts                     # Entry point
├── index.ts                   # Public API exports
├── action/                    # Action system
│   ├── types.ts               # Action, ActionContext types
│   ├── define.ts              # defineAction() helper
│   ├── context.ts             # createActionContext()
│   ├── executor.ts            # runAction()
│   ├── loader.ts              # loadAction() with jiti
│   ├── registry.ts            # ActionRegistry
│   └── resolver.ts            # Action path resolution
├── plugin/                    # Plugin system
│   ├── types.ts               # Plugin types
│   ├── define.ts              # definePlugin() helper
│   ├── manager.ts             # PluginManager
│   ├── detector.ts            # Plugin detection
│   ├── loader.ts              # Plugin loading
│   └── service.ts             # PluginService
├── config/                    # Configuration
│   ├── schema.ts              # Zod schemas + defaultConfig
│   ├── manager.ts             # FileConfigManager
│   ├── paths.ts               # Config file paths
│   └── utils.ts               # Merge utilities
├── i18n/                      # Internationalization
│   ├── index.ts               # initI18n(), t()
│   ├── manager.ts             # TranslationManager
│   └── types.ts               # Translation key types
├── shell/                     # Shell execution
│   └── executor.ts            # $ tagged template
├── modes/                     # Execution modes
│   ├── ui-mode.ts             # Interactive TUI mode
│   └── headless-mode.ts       # CLI mode (arere run)
├── ui/                        # Terminal UI
│   ├── App.tsx                # Main application
│   ├── screens/               # Screen components
│   ├── components/            # Shared components
│   ├── stores/                # Zustand stores
│   ├── hooks/                 # React hooks
│   ├── prompts/               # Prompt implementations
│   └── keybindings/           # Keybinding system
└── lib/                       # Shared utilities
    ├── logger.ts              # Logger
    ├── error.ts               # Error utilities
    └── path.ts                # Path utilities
```

## Important Constraints

### Action Loading
- Actions are loaded with **jiti**, not via `import()` - this allows TypeAction files to run without pre-compilation
- All action paths must be absolute before loading
- Actions can fail to load gracefully (logged as warnings)

### Plugin System
- Plugin detection relies on npm naming: `arere-plugin-*`
- Plugin entry point must export an `ArerePlugin` object
- Plugin action paths are relative in definition, resolved to absolute at load time
- Plugin config validation happens before action registration

### UI Rendering
- All UI components must be compatible with Ink (terminal rendering, not DOM)
- No HTML/CSS - layout uses Box/Text components with flexbox
- User input captured via `useInput` hook, not DOM events
- Terminal resize must be handled gracefully (minimum: 50 cols × 20 rows)

### i18n
- Translation keys are type-checked via TypeScript (auto-inferred from JSON)
- Types are automatically derived from JSON files - no script needed
- Plugins must use unique namespaces (typically plugin package name)

### Configuration
- Config changes must be validated against Zod schema
- Config writes should handle both project and global locations
- Never mutate config directly - use config management utilities

## Common Gotchas

1. **Using relative paths with jiti** → always resolve to absolute first
3. **Mocking Ink's useInput incorrectly** → capture handler, don't try to trigger Ink's internal events
4. **Assuming plugin config exists** → always check `context.pluginConfig` before accessing
5. **Not handling shell executor errors** → `$` returns result with `exitCode`, doesn't throw
6. **Forgetting to call `beforeEach` in UI tests** → clear mocks between tests

## Development Workflow

### Adding a New Action
1. Create `.ts` file in `.arere/` directory
2. Use `defineAction()` helper
3. Launch arere - action auto-discovered

### Adding a New Plugin
1. Create npm package: `arere-plugin-{name}`
2. Export `ArerePlugin` from entry point
3. Add actions in `actions/` directory
4. Optional: Add `locales/` for i18n
5. Optional: Define `configSchema` with Zod
6. Install plugin: `npm install arere-plugin-{name}`
7. Enable in config or Settings UI

### Adding a New UI Component
1. Create component in `src/ui/components/`
2. If interactive, mock `useInput` in tests
3. Test with `ink-testing-library`
4. Ensure 85%+ coverage for interaction logic

### Modifying i18n
1. Edit JSON in `locales/{locale}/{namespace}.json`
2. TypeScript types are automatically updated (inferred from JSON files)
3. Run `npm run typecheck` to verify types

### Hot-Reload Debugging
- Plugin changes require app restart
- Config changes trigger plugin reload (if enabled state changes)
- Action file changes require app restart (no hot-reload for actions yet)
