# arere

> **あれれ？何だっけ (Arere?)** - A persistent terminal launcher for those who can't remember commands

[![CI](https://github.com/SphereStacking/Arere/workflows/CI/badge.svg)](https://github.com/SphereStacking/Arere/actions)
[![npm version](https://img.shields.io/npm/v/arere.svg)](https://www.npmjs.com/package/arere)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/SphereStacking/Arere/blob/main/LICENSE)

A TypeScript-based persistent terminal launcher. No need to remember commands—just launch `arere` and run your favorite actions with fuzzy search.

## ✨ Key Features

- 🏃 **Persistent** - Once launched, run actions continuously
- 🔍 **Fuzzy Search** - Find actions by typing partial names
- 📝 **TypeScript-powered** - Write actions in TypeScript
- 🎨 **Interactive UI** - Rich prompts, selections, and confirmations
- 🔌 **Plugin System** - Share actions as npm packages
- 🌍 **Global/Local Actions** - Support both global and project-specific actions
- 🌏 **Multilingual** - English and Japanese (i18n ready)
- 🔄 **Hot Reload** - Auto-reload actions on file changes

## 📦 Installation

```bash
npm install -g arere
```

**Requirements**: Node.js >= 18.0.0

## 🚀 Quick Start

### 1. Launch Arere

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

### 3. Run Your Action

```bash
arere
```

Use arrow keys to select, press Enter to run, or type `/` to search.

## 📖 Writing Actions

### Basic Structure

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

### Interactive Input

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

### Selection Menu

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

## 🔌 Plugin System

Install plugins to extend functionality:

```bash
npm install -g arere-plugin-git
```

Enable in config:

```json
// ~/.arere/settings.json
{
  "plugins": {
    "arere-plugin-git": true
  }
}
```

### Creating a Plugin

```bash
mkdir arere-plugin-example
cd arere-plugin-example
npm init -y
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

See [Plugin Development Guide](https://github.com/SphereStacking/Arere/blob/main/docs/guides/developing-plugins.md) for details.

## ⚙️ Configuration

Configuration files:
- **Workspace**: `.arere/settings.json` (project-specific)
- **User**: `~/.arere/settings.json` (global)

```json
{
  "locale": "en",
  "actionsDir": "./.arere",
  "logLevel": "info"
}
```

### Configuration Options

- `locale`: UI language (`"en"` | `"ja"`)
- `actionsDir`: Project-specific action directory
- `logLevel`: Logging level (`"trace"` | `"debug"` | `"info"` | `"warn"` | `"error"` | `"fatal"`)

## 🎯 GitHub Actions Integration

Write CI/CD scripts in TypeScript! Replace bash scripts with type-safe, testable actions.

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

## 📚 Documentation

- [Full Documentation](https://github.com/SphereStacking/Arere#readme)
- [Action Creation Tutorial](https://github.com/SphereStacking/Arere/blob/main/docs/guides/creating-actions.md)
- [Plugin Development Guide](https://github.com/SphereStacking/Arere/blob/main/docs/guides/developing-plugins.md)
- [API Reference](https://github.com/SphereStacking/Arere/tree/main/docs/api)

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
```

See [CONTRIBUTING.md](https://github.com/SphereStacking/Arere/blob/main/CONTRIBUTING.md) if you want to contribute.

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

## 📝 License

MIT © SphereStacking

## 🙏 Acknowledgments

Powered by these open-source projects:

- [Ink](https://github.com/vadimdemedes/ink) - React for CLIs
- [fuzzysort](https://github.com/farzher/fuzzysort) - Fast fuzzy search
- [jiti](https://github.com/unjs/jiti) - Runtime TypeScript loader
- [zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation

---

**あれれ？何だっけ (Arere?)** - Even if you forget commands, `arere` is here for you.
