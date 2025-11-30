# arere-plugin-githooks

Git hooks plugin for [arere](https://github.com/SphereStacking/Arere) - run the same TypeScript actions locally, in git hooks, and in CI/CD.

## Why arere-plugin-githooks?

### Same Code, Three Places

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Local          │     │  Local          │     │  GitHub Actions │
│  UI Mode        │     │  git commit     │     │  CI/CD          │
│                 │     │                 │     │                 │
│  arere          │     │  pre-commit     │     │  workflow       │
│  → lint select  │     │  → arere run    │     │  → arere run    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────┐
                    │  .arere/lint.ts     │
                    │  (TypeScript)       │
                    │                     │
                    │  Same code!         │
                    └─────────────────────┘
```

### vs husky

| | husky | arere-plugin-githooks |
|--|-------|----------------------|
| pre-commit | Shell script | TypeScript (actions) |
| GitHub Actions | Define separately in YAML | Same action with `arere run` |
| UI Mode | N/A | Same action selectable |
| Code duplication | Yes | **None** |
| Language | Shell | TypeScript |

## Installation

```bash
npm install arere-plugin-githooks
```

## Setup

### 1. Configure hooks

Add to your `.arere/settings.json`:

```json
{
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

### 2. Create actions

```typescript
// .arere/lint.ts
import { defineAction } from 'arere'

export default defineAction({
  name: 'lint',
  description: 'Run linter',
  async run({ $ }) {
    const result = await $`npm run lint`
    if (result.exitCode !== 0) {
      process.exit(1)
    }
  },
})
```

### 3. Install hooks

```bash
# Install all configured hooks
arere run githooks:install

# Or install a specific hook
arere run githooks:install pre-commit
```

### 4. Automate for team

Add to `package.json`:

```json
{
  "scripts": {
    "prepare": "arere run githooks:install"
  }
}
```

Now hooks are automatically installed when running `npm install`.

## Available Actions

| Action | Description | Example |
|--------|-------------|---------|
| `githooks:install` | Install git hooks | `arere run githooks:install` |
| `githooks:uninstall` | Uninstall git hooks | `arere run githooks:uninstall` |
| `githooks:run` | Run hook actions (called by git) | `arere run githooks:run pre-commit` |
| `githooks:status` | Show hook status | `arere run githooks:status` |

## Usage in GitHub Actions

Use the same actions in CI:

```yaml
# .github/workflows/ci.yml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx arere run lint      # Same action!
      - run: npx arere run typecheck # Same action!
```

## Supported Hooks

- `pre-commit`
- `prepare-commit-msg`
- `commit-msg`
- `post-commit`
- `pre-push`
- `pre-rebase`
- `post-checkout`
- `post-merge`

## Options

### Force overwrite

If a hook already exists and was not created by this plugin:

```bash
arere run githooks:install --force
```

### Force uninstall

Remove hooks even if not created by this plugin:

```bash
arere run githooks:uninstall --force
```

## How it works

1. `githooks:install` creates shell scripts in `.git/hooks/`
2. Each script calls `npx arere run githooks:run <hook-name>`
3. `githooks:run` reads the plugin config and executes each action in sequence
4. If any action fails (exit code !== 0), the git operation is aborted

## License

MIT
