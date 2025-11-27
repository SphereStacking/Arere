# Arere GitHub Action

Run [Arere](https://github.com/laziness-project/arere) actions in GitHub Actions with TypeScript.

## Features

- 🎯 **Type-safe CI/CD scripts** - Write workflows in TypeScript instead of bash
- 🔄 **Reusable actions** - Same code runs locally and in CI
- 🚀 **Developer-friendly** - Familiar syntax with IDE support
- 📦 **Works with all package managers** - npm, yarn, pnpm supported

## Usage

### Basic Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        uses: your-org/your-repo/actions/arere-action@main
        with:
          action: deploy
```

> **Note**: Replace `your-org/your-repo` with your actual repository path.
> If using within the same repository, use `./actions/arere-action` instead.

### With Working Directory

```yaml
- name: Run action in subdirectory
  uses: ./arere-action
  with:
    action: build
    working-directory: ./packages/app
```

### With Custom Node Version

```yaml
- name: Run with Node 20
  uses: ./arere-action
  with:
    action: test
    node-version: '20'
```

### With Environment Variables

```yaml
- name: Deploy with secrets
  uses: ./arere-action
  with:
    action: deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
    ENVIRONMENT: production
```

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `action` | Name of the Arere action to run | Yes | - |
| `working-directory` | Working directory where arere is configured | No | `.` |
| `node-version` | Node.js version to use | No | `18` |

## Example Action

Create an action in your repository:

```typescript
// .arere/deploy.ts
import { defineAction } from 'arere'

export default defineAction({
  name: 'deploy',
  description: 'Deploy to production',
  async run({ $, tui, env }) {
    tui.output.section('Building')
    await $`npm run build`

    tui.output.section('Testing')
    await $`npm test`

    tui.output.section('Deploying')
    await $`npm run deploy`

    tui.output.success('Deployed!')
  }
})
```

Then use it in GitHub Actions:

```yaml
- uses: your-org/your-repo/actions/arere-action@main
  with:
    action: deploy
```

Or run it locally:

```bash
arere run deploy
```

## Before/After Comparison

### Before (Bash)

```yaml
- name: Deploy
  run: |
    set -e

    # Check branch
    BRANCH=$(git branch --show-current)
    if [ "$BRANCH" != "main" ]; then
      echo "Error: Must be on main branch"
      exit 1
    fi

    # Build
    echo "Building..."
    npm run build
    if [ $? -ne 0 ]; then
      echo "Build failed"
      exit 1
    fi

    # Deploy
    echo "Deploying..."
    npm run deploy

    echo "Deployed successfully!"
```

### After (TypeScript with Arere)

```typescript
// .arere/deploy.ts
import { defineAction } from 'arere'

export default defineAction({
  name: 'deploy',
  description: 'Deploy to production',
  async run({ $, tui }) {
    // Check branch
    const { stdout } = await $`git branch --show-current`
    const branch = stdout.trim()

    if (branch !== 'main') {
      throw new Error('Must be on main branch')
    }

    // Build
    tui.output.section('Building')
    await $`npm run build`

    // Deploy
    tui.output.section('Deploying')
    await $`npm run deploy`

    tui.output.success('Deployed!')
  }
})
```

```yaml
- uses: your-org/your-repo/actions/arere-action@main
  with:
    action: deploy
```

## Benefits

✅ **Type safety** - TypeScript catches errors before runtime
✅ **Better error handling** - No more `set -e` or `$?` checks
✅ **Reusable** - Same code works locally: `arere run deploy`
✅ **Testable** - Unit test your CI/CD scripts
✅ **IDE support** - Autocomplete, refactoring, debugging

## Headless Mode Limitations

When running in GitHub Actions (headless mode), interactive prompts are not available:

```typescript
// ❌ This will NOT work in CI - prompts require user interaction
const name = await prompt.text('Enter name:')

// ✅ Use environment variables instead
const name = env.NAME || 'default-value'
```

**Best practices for CI-compatible actions:**

1. Use environment variables for input:
   ```typescript
   async run({ env, $ }) {
     const target = env.DEPLOY_TARGET || 'staging'
     await $`./deploy.sh ${target}`
   }
   ```

2. Pass secrets via GitHub Secrets:
   ```yaml
   - uses: your-org/your-repo/actions/arere-action@main
     with:
       action: deploy
     env:
       API_KEY: ${{ secrets.API_KEY }}
   ```

3. Use command-line arguments (if supported by your action):
   ```yaml
   - run: npx arere run deploy -- --target=production
   ```

## Troubleshooting

### Action not found

Make sure:
1. Your `.arere/` directory exists in the working directory
2. The action file (e.g., `.arere/deploy.ts`) exists
3. The action exports a default `defineAction()` object

### Dependencies not installed

The action automatically detects and installs dependencies using:
- `npm ci` if `package-lock.json` exists
- `yarn install --frozen-lockfile` if `yarn.lock` exists
- `pnpm install --frozen-lockfile` if `pnpm-lock.yaml` exists
- `npm install` as fallback

### Node.js version mismatch

Specify the Node.js version explicitly:

```yaml
- uses: your-org/your-repo/actions/arere-action@main
  with:
    action: deploy
    node-version: '20'
```

## Alternative: Direct CLI Usage

You can also use the arere CLI directly without this action:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx arere run deploy
        env:
          DEPLOY_TARGET: production
```

## License

MIT
