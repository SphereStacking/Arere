import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineAction } from 'arere'

const HOOK_TYPES = [
  'pre-commit',
  'pre-push',
  'commit-msg',
  'prepare-commit-msg',
  'post-commit',
  'post-checkout',
  'post-merge',
] as const

function generateHookTemplate(hookName: string): string {
  return `#!/bin/sh
# ${hookName} hook
# Add your commands below

# Example: Run linter before commit
# npm run lint

# Example: Run tests before push
# npm test

# Exit with non-zero to abort the git operation
exit 0
`
}

export default defineAction({
  description: 'Initialize git hooks directory with templates',
  run: async ({ $, tui, prompt }) => {
    // Check if we're in a git repository
    const gitCheck = await $`git rev-parse --is-inside-work-tree`
    if (gitCheck.exitCode !== 0) {
      tui.output.error('Not a git repository')
      return
    }

    // Get git root directory
    const rootResult = await $`git rev-parse --show-toplevel`
    const gitRoot = rootResult.stdout.trim()

    // Get current hooks path or ask for one
    const currentConfig = await $`git config --get core.hooksPath`
    let hooksPath = currentConfig.stdout.trim()

    if (!hooksPath) {
      // No custom path set, ask user
      const selected = await prompt.select('Select hooks directory to create:', {
        options: [
          { label: './githooks', value: './githooks' },
          { label: './.githooks', value: './.githooks' },
          { label: './.husky', value: './.husky' },
          { label: 'Enter custom path...', value: '__custom__' },
        ],
      })

      if (selected === '__custom__') {
        hooksPath = await prompt.text('Enter hooks directory path:')
      } else {
        hooksPath = selected
      }
    }

    const fullHooksPath = join(gitRoot, hooksPath)

    // Create directory if it doesn't exist
    if (!existsSync(fullHooksPath)) {
      mkdirSync(fullHooksPath, { recursive: true })
      tui.output.success(`Created directory: ${hooksPath}`)
    } else {
      tui.output.info(`Directory exists: ${hooksPath}`)
    }

    // Ask which hooks to create
    const selectedHooks = await prompt.multiSelect('Select hooks to create:', {
      options: HOOK_TYPES.map((hook) => ({
        label: hook,
        value: hook,
      })),
    })

    if (selectedHooks.length === 0) {
      tui.output.warn('No hooks selected')
      return
    }

    // Create selected hooks
    for (const hookName of selectedHooks) {
      const hookPath = join(fullHooksPath, hookName)

      if (existsSync(hookPath)) {
        tui.output.warn(`Skipped (exists): ${hookName}`)
        continue
      }

      const template = generateHookTemplate(hookName)
      writeFileSync(hookPath, template)
      chmodSync(hookPath, 0o755) // Make executable
      tui.output.success(`Created: ${hookName}`)
    }

    // Set core.hooksPath if not already set
    if (!currentConfig.stdout.trim()) {
      await $`git config core.hooksPath ${hooksPath}`
      tui.output.newline()
      tui.output.info(`Set core.hooksPath to: ${hooksPath}`)
    }

    tui.output.newline()
    tui.output.info(`Edit your hooks in: ${hooksPath}/`)
  },
})
