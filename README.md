# arere

> **あれれ？何だっけ (Arere?)** - A persistent terminal launcher for those who can't remember commands

[日本語](./README.ja.md) | English

[![CI](https://github.com/SphereStacking/Arere/workflows/CI/badge.svg)](https://github.com/SphereStacking/Arere/actions)
[![npm version](https://img.shields.io/npm/v/arere.svg)](https://www.npmjs.com/package/arere)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A TypeScript-based **persistent terminal launcher**. No need to remember commands. Just launch `arere` and run your favorite actions with fuzzy search.

## ✨ Features

- 🏃 **Persistent** - Once launched, run actions continuously
- 🔍 **Fuzzy Search** - Find actions by typing partial names
- 📝 **TypeScript-powered** - Write actions in TypeScript
- 🎨 **Interactive UI** - Rich UI with prompts, selections, confirmations
- 🔌 **Plugin System** - Share actions as npm packages
- 🌍 **Global/Local** - Support both global and project-specific actions
- 🌏 **Multilingual** - English and Japanese (i18n)
- 🔄 **Hot Reload** - Auto-reload actions on file changes
- 💻 **tmux/Zellij Integration** - Works with terminal multiplexers
- 🚀 **CI/CD Ready** - Type-safe workflows for GitHub Actions

## 🎯 GitHub Actions Integration

Write CI/CD scripts in TypeScript! Say goodbye to bash scripts.

### Before (Bash)

```yaml
- run: |
    if [ "$BRANCH" != "main" ]; then
      echo "Error: Must be on main"
      exit 1
    fi
    npm run build
    npm run deploy
```

### After (TypeScript with Arere)

```typescript
// .arere/deploy.ts
export default {
  name: 'deploy',
  description: 'Deploy to production',
  async run({ $, tui }) {
    const { stdout } = await $`git branch --show-current`
    if (stdout.trim() !== 'main') {
      throw new Error('Must be on main branch')
    }

    await $`npm run build`
    await $`npm run deploy`

    tui.output.success('Deployed!')
  }
}
```

```yaml
# .github/workflows/deploy.yml
- uses: ./arere-action
  with:
    action: deploy
```

**Benefits:**
- ✅ Type-safe - Catch errors before execution
- ✅ Testable locally - Run `arere run deploy` to verify
- ✅ Readable - No `set -e` or `$?` needed
- ✅ Reusable - Same code works locally and in CI

Details: [GitHub Actions Integration Guide](docs/guides/github-actions-integration.md)

## 📦 Installation

```bash
npm install -g arere
```

**Requirements**:
- Node.js >= 18.0.0

## 🚀 Quick Start

### 1. Launch

```bash
arere
```

On first launch, action directories are created:
- Global: `~/.arere/`
- Project-specific: `./.arere/`

### 2. Create Your First Action

```bash
# Create a global action
mkdir -p ~/.arere
cat > ~/.arere/hello.ts << 'EOF'
export const meta = {
  name: 'hello',
  description: 'Display Hello World',
}

export default async function() {
  console.log('Hello, World!')
}
EOF
```

### 3. Run Action

```bash
arere
```

Action list will be displayed:

```
╭─ arere(・_・?) ─────────── q: quit | /: search | ?: help ─╮

❯ hello  Display Hello World  (global)

╰────────────────────────────────────────────────────────────╯
```

**Controls**:
- `↑↓`: Select action
- `Enter`: Run action
- `/`: Enter fuzzy search mode
- `q` / `Ctrl+C`: Quit

After execution, you return to the selection screen (persistent mode).

## 📖 Usage

### Basic Action Structure

Actions are written as `export default async function()`:

```typescript
// ~/.arere/git-status.ts
export const meta = {
  name: 'git-status',
  description: 'Show Git status',
  category: 'git',
  tags: ['git', 'status'],
}

export default async function() {
  const { $ } = await import('execa')
  const { stdout } = await $`git status --short`
  console.log(stdout)
}
```

**Metadata Fields**:
- `name`: Unique action name (required)
- `description`: Description (required)
- `category`: Category (optional)
- `tags`: Array of tags (optional, e.g., `['git', 'status']`)

### Interactive Input

Use `prompt` API to receive user input:

```typescript
// ~/.arere/git-commit.ts
import { prompt } from 'arere'

export const meta = {
  name: 'git-commit',
  description: 'Create a Git commit',
}

export default async function() {
  const message = await prompt.text({
    message: 'Enter commit message:',
    validate: (value) => value.length > 0 || 'Please enter a message',
  })

  const { $ } = await import('execa')
  await $`git commit -m ${message}`

  console.log('✓ Committed')
}
```

### Selection List

```typescript
// ~/.arere/git-switch.ts
import { prompt } from 'arere'

export const meta = {
  name: 'git-switch',
  description: 'Switch branch',
}

export default async function() {
  const { $ } = await import('execa')
  const { stdout } = await $`git branch --format=%(refname:short)`
  const branches = stdout.split('\n').filter(Boolean)

  const branch = await prompt.select({
    message: 'Select branch:',
    options: branches.map(b => ({ label: b, value: b })),
  })

  await $`git switch ${branch}`
  console.log(`✓ Switched to ${branch}`)
}
```

### Confirmation Dialog

```typescript
// ~/.arere/dangerous-operation.ts
import { prompt } from 'arere'

export const meta = {
  name: 'dangerous-operation',
  description: 'Dangerous operation',
}

export default async function() {
  const confirmed = await prompt.confirm({
    message: 'Are you sure you want to proceed?',
    default: false,
  })

  if (!confirmed) {
    console.log('Cancelled')
    return
  }

  console.log('Done')
}
```

### Using External Libraries

Actions can dynamically import external libraries:

```typescript
// ~/.arere/format-date.ts
export const meta = {
  name: 'format-date',
  description: 'Format current time',
}

export default async function() {
  // Dynamic import
  const { format } = await import('date-fns')
  const now = new Date()

  console.log('Current time:', format(now, 'yyyy-MM-dd HH:mm:ss'))
}
```

**Note**: External libraries must be installed globally:
```bash
npm install -g date-fns
```

## 🔌 Plugin System

Plugins allow you to distribute and share actions as npm packages.

### Installing a Plugin

```bash
npm install -g arere-plugin-git
```

### Enable Plugin in Config

```json
// ~/.arere/settings.json
{
  "plugins": {
    "arere-plugin-git": true,
    "arere-plugin-docker": true
  }
}
```

### Creating a Plugin

Plugins are npm packages following the `arere-plugin-*` naming convention:

```
arere-plugin-example/
├── package.json
├── src/
│   └── index.ts
└── actions/
    ├── action-1.ts
    └── action-2.ts
```

```json
// package.json
{
  "name": "arere-plugin-example",
  "version": "1.0.0",
  "keywords": ["arere-plugin"],
  "main": "./dist/index.js",
  "files": ["dist", "actions"]
}
```

```typescript
// src/index.ts
import { definePlugin } from 'arere'

export default definePlugin({
  name: 'example',
  actions: [
    './actions/action-1.ts',
    './actions/action-2.ts',
  ],
})
```

See [Plugin Development Guide](./docs/guides/developing-plugins.md) for details.

## ⚙️ Configuration

Configuration files:
- **Workspace**: `.arere/settings.json` (project-specific settings)
- **User**: `~/.arere/settings.json` (global settings)

```json
{
  "locale": "en",
  "actionsDir": "./.arere",
  "logLevel": "info"
}
```

### Configuration Options

#### `locale`
- **Type**: `"en" | "ja"`
- **Default**: System locale, or `en`
- **Description**: UI language

Supported languages:
- `en`: English
- `ja`: Japanese (日本語)

```json
{
  "locale": "ja"
}
```

Locale resolution priority:
1. `locale` field in configuration file
2. System locale (`LANG`, `LC_ALL` environment variables)
3. Default (English)

#### `actionsDir`
- **Type**: `string`
- **Default**: `./.arere`
- **Description**: Project-specific action directory

#### `logLevel`
- **Type**: `"trace" | "debug" | "info" | "warn" | "error" | "fatal"`
- **Default**: `info`
- **Description**: Log level

## 📚 Documentation

- [Action Creation Tutorial](./docs/ja/guides/creating-actions.md)
- [Internationalization (i18n) Guide](./docs/i18n-guide.md)
- [Plugin Development Guide](./docs/guides/developing-plugins.md)
- [API Reference](./docs/api/)
  - [defineAction API](./docs/ja/api/defineAction.md)
  - [prompt API](./docs/api/prompt.md)
  - [$ (shell) API](./docs/api/shell.md)
  - [Plugin API](./docs/api/plugin.md)

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/SphereStacking/Arere.git
cd Arere

# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Coverage
npm run test:coverage

# Benchmark
npm run bench:run

# Lint & Format
npm run lint
npm run format
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) if you want to contribute.

## 🔍 Troubleshooting

### Actions Not Found

```bash
# Check action directories
ls -la ~/.arere
ls -la ./.arere

# Clear cache
rm -rf ~/.cache/arere
```

### Plugin Not Loading

```bash
# Check if plugin is installed
npm list -g | grep arere-plugin

# Check configuration file
cat ~/.arere/settings.json
```

### TypeScript Errors

Actions are transpiled at runtime with `jiti`. Type errors won't prevent execution, but to type-check:

```bash
npx tsc --noEmit your-action.ts
```

## 📝 License

MIT © SphereStacking

## 🙏 Acknowledgments

This project is powered by these open-source projects:

- [Ink](https://github.com/vadimdemedes/ink) - React for CLIs
- [fuzzysort](https://github.com/farzher/fuzzysort) - Fast fuzzy search
- [jiti](https://github.com/unjs/jiti) - Runtime TypeScript loader
- [zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation

---

**あれれ？何だっけ (Arere?)** - Even if you forget commands, `arere` is here for you.
