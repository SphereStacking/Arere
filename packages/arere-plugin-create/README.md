# arere-plugin-create

> Create new actions and plugins interactively from stubs

[Japanese](./README.ja.md) | English

## Overview

This plugin provides interactive generators for creating Arere actions and plugins from pre-defined stubs. No more manual file creation!

## Features

### create-action
- **Interactive Prompts**: Step-by-step guidance for action creation
- **Multiple Stubs**:
  - **Basic**: Minimal action structure
  - **Advanced**: With prompts, shell execution, error handling
  - **With i18n**: Internationalization support
- **Scope Selection**: Choose workspace-specific or global actions
- **Duplicate Check**: Warns if action file already exists

### create-plugin
- **Plugin Generator**: Create complete plugin projects from stubs
- **Three Stub Types**:
  - **Minimal**: Basic plugin structure without i18n or config
  - **Standard**: Standard plugin with i18n and config support
  - **Full**: Complete plugin with multiple action examples and tests
- **Git Integration**: Automatically extracts author info from git config
- **Validation**: Plugin name and email validation
- **Directory Creation**: Automatic output directory setup

### General
- **i18n Support**: English and Japanese translations
- **Type Safety**: Full TypeScript support with type checking

## Installation

```bash
# Install from local workspace (for development)
cd packages/arere-plugin-create
npm run build
npm link

# Link to arere
cd ../arere
npm link arere-plugin-create
```

## Usage

### Creating an Action

1. Run `arere` in your terminal
2. Select **"create-action"** from the action list
3. Follow the interactive prompts:
   - Action name (kebab-case)
   - Description
   - Category
   - Tags (multiple selection)
   - Stub type
   - Scope (workspace or global)
4. Restart `arere` to load the new action

### Creating a Plugin

1. Run `arere` in your terminal
2. Select **"create-plugin"** from the action list
3. Follow the interactive prompts:
   - Plugin name (must start with `arere-plugin-`)
   - Description
   - Author name (auto-filled from git config)
   - Author email (auto-filled from git config)
   - Stub type (minimal/standard/full)
   - Output directory
4. Navigate to the created directory:
   ```bash
   cd your-plugin-name
   npm install
   npm run build
   ```

## Action Templates

### Basic

Minimal action structure for quick start:

```typescript
import { defineAction } from 'arere'

export default defineAction({
  name: 'my-action',
  description: 'My action description',
  category: 'utility',
  tags: ['demo'],
  async run({ tui }) {
    // Your action logic here
  },
})
```

### Advanced

Includes examples of:
- Prompt API (text, confirm, select)
- Shell execution (`$`)
- Error handling (try-catch)
- Output formatting (section, step, success, error)
- Control API (spinner)

### With i18n

Demonstrates internationalization for **user actions** (not plugins):
- Inline translations (en/ja) using `translations` property
- Translation key usage with `t()` (no prefix needed for action's own translations)
- Parameter interpolation

**Note for Plugin Development**:
If you're creating a **plugin** action (not a user action), use the `plugin:` prefix to access plugin translations:
```typescript
// In plugin actions
t('plugin:greeting')  // ✓ Accesses plugin's locales/
t('greeting')         // ✗ Accesses action's own namespace (empty)
```

See [Plugin Development Guide](../../docs/content/en/1.guides/04.plugins/02.creating.md) for plugin i18n details.

## Plugin Templates

### Minimal

Basic plugin structure without i18n or configuration:
- `src/index.ts` - Plugin definition
- `actions/hello.ts` - Simple hello world action
- Basic package.json and TypeScript configuration

**Use case**: Quick prototyping, simple plugins without localization needs

### Standard

Standard plugin with i18n and configuration support:
- All Minimal template files
- `locales/en/` and `locales/ja/` - Translation files
- `configSchema` - Zod-based configuration validation
- Example action demonstrating `plugin:` prefix usage

**Use case**: Most production plugins that need i18n and user configuration

### Full

Complete plugin with multiple action examples and tests:
- All Standard template files
- Three action examples: basic, prompts, config
- `tests/` directory ready for testing
- `CHANGELOG.md` for versioning
- Comprehensive README with documentation

**Use case**: Complex plugins with multiple features, teams wanting best practices

## Directory Structure

```
packages/arere-plugin-generator/
├── src/
│   ├── index.ts                      # Plugin entry point
│   ├── template-renderer.ts          # Action template rendering
│   ├── plugin-template-renderer.ts   # Plugin template rendering
│   ├── file-writer.ts                # File writing utilities
│   └── git-utils.ts                  # Git config extraction
├── actions/
│   ├── create-action.ts              # Action generator
│   └── create-plugin.ts              # Plugin generator
├── stubs/
│   ├── action/                       # Action stubs
│   │   ├── basic.ts.template
│   │   ├── advanced.ts.template
│   │   └── with-i18n.ts.template
│   └── plugin/                       # Plugin stubs
│       ├── minimal/
│       ├── standard/
│       └── full/
├── locales/
│   ├── en/translation.json
│   └── ja/translation.json
└── README.md
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Type check
npm run typecheck

# Run tests (if implemented)
npm test
```

## License

MIT
