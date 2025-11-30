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
  description: 'Setup git hooks directory and configure hooks path',
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

    // Get current hooks path
    const currentConfig = await $`git config --get core.hooksPath`
    const currentPath = currentConfig.stdout.trim()

    if (currentPath) {
      tui.output.info(`Current hooks path: ${currentPath}`)
    } else {
      tui.output.info('Current hooks path: .git/hooks (default)')
    }
    tui.output.newline()

    // Select action
    const action = await prompt.select('What would you like to do?', {
      options: [
        { label: 'Setup new hooks directory', value: 'setup' },
        { label: 'Change hooks path only', value: 'change' },
        { label: 'Reset to default (.git/hooks)', value: 'reset' },
      ],
    })

    if (action === 'reset') {
      const result = await $`git config --unset core.hooksPath`
      if (result.exitCode !== 0 && result.exitCode !== 5) {
        tui.output.error('Failed to reset core.hooksPath')
        return
      }
      tui.output.success('Reset hooks path to default (.git/hooks)')
      return
    }

    // Select hooks directory
    const selected = await prompt.select('Select hooks directory:', {
      options: [
        { label: './githooks', value: './githooks' },
        { label: './.githooks', value: './.githooks' },
        { label: './.husky', value: './.husky' },
        { label: 'Enter custom path...', value: '__custom__' },
      ],
    })

    const hooksPath =
      selected === '__custom__' ? await prompt.text('Enter hooks directory path:') : selected

    if (action === 'change') {
      // Just change the path
      const result = await $`git config core.hooksPath ${hooksPath}`
      if (result.exitCode !== 0) {
        tui.output.error('Failed to set core.hooksPath')
        return
      }
      tui.output.success(`Set core.hooksPath to: ${hooksPath}`)
      return
    }

    // Setup: create directory and hooks
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

    if (selectedHooks.length > 0) {
      // Create selected hooks
      for (const hookName of selectedHooks) {
        const hookPath = join(fullHooksPath, hookName)

        if (existsSync(hookPath)) {
          tui.output.warn(`Skipped (exists): ${hookName}`)
          continue
        }

        const template = generateHookTemplate(hookName)
        writeFileSync(hookPath, template)
        chmodSync(hookPath, 0o755)
        tui.output.success(`Created: ${hookName}`)
      }
    }

    // Set core.hooksPath
    await $`git config core.hooksPath ${hooksPath}`
    tui.output.newline()
    tui.output.success(`Set core.hooksPath to: ${hooksPath}`)
    tui.output.info(`Edit your hooks in: ${hooksPath}/`)
  },
})
