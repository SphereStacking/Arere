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
  description: 'plugin:actions.git-hooks-setup.description',
  run: async ({ $, tui, t }) => {
    const { prompt, output } = tui

    // Check if we're in a git repository
    const gitCheck = await $`git rev-parse --is-inside-work-tree`
    if (gitCheck.exitCode !== 0) {
      output.error(t('plugin:notGitRepository'))
      return
    }

    // Get git root directory
    const rootResult = await $`git rev-parse --show-toplevel`
    const gitRoot = rootResult.stdout.trim()

    // Get current hooks path
    const currentConfig = await $`git config --get core.hooksPath`
    const currentPath = currentConfig.stdout.trim()

    if (currentPath) {
      output.info(t('plugin:hooksSetup.currentPath', { path: currentPath }))
    } else {
      output.info(t('plugin:hooksSetup.currentPathDefault'))
    }
    output.newline()

    // Select action
    const action = await prompt.select(t('plugin:hooksSetup.selectAction'), [
      { label: t('plugin:hooksSetup.options.setup'), value: 'setup' },
      { label: t('plugin:hooksSetup.options.change'), value: 'change' },
      { label: t('plugin:hooksSetup.options.reset'), value: 'reset' },
    ])

    if (action === 'reset') {
      const result = await $`git config --unset core.hooksPath`
      if (result.exitCode !== 0 && result.exitCode !== 5) {
        output.error(t('plugin:hooksSetup.resetFailed'))
        return
      }
      output.success(t('plugin:hooksSetup.resetSuccess'))
      return
    }

    // Select hooks directory
    const selected = await prompt.select(t('plugin:hooksSetup.selectDirectory'), [
      { label: './githooks', value: './githooks' },
      { label: './.githooks', value: './.githooks' },
      { label: './.husky', value: './.husky' },
      { label: t('plugin:hooksSetup.options.custom'), value: '__custom__' },
    ])

    const hooksPath: string =
      selected === '__custom__'
        ? await prompt.text(t('plugin:hooksSetup.enterCustomPath'))
        : selected

    if (action === 'change') {
      // Just change the path
      const result = await $`git config core.hooksPath ${hooksPath}`
      if (result.exitCode !== 0) {
        output.error(t('plugin:hooksSetup.setPathFailed'))
        return
      }
      output.success(t('plugin:hooksSetup.setPathSuccess', { path: hooksPath }))
      return
    }

    // Setup: create directory and hooks
    const fullHooksPath = join(gitRoot, hooksPath)

    // Create directory if it doesn't exist
    if (!existsSync(fullHooksPath)) {
      mkdirSync(fullHooksPath, { recursive: true })
      output.success(t('plugin:hooksSetup.createdDirectory', { path: hooksPath }))
    } else {
      output.info(t('plugin:hooksSetup.directoryExists', { path: hooksPath }))
    }

    // Ask which hooks to create
    const selectedHooks = await prompt.multiSelect(
      t('plugin:hooksSetup.selectHooks'),
      HOOK_TYPES.map((hook) => ({
        label: hook,
        value: hook,
      })),
    )

    if (selectedHooks.length > 0) {
      // Create selected hooks
      for (const hookName of selectedHooks) {
        const hookPath = join(fullHooksPath, hookName)

        if (existsSync(hookPath)) {
          output.warn(t('plugin:hooksSetup.skippedExists', { name: hookName }))
          continue
        }

        const template = generateHookTemplate(hookName)
        writeFileSync(hookPath, template)
        chmodSync(hookPath, 0o755)
        output.success(t('plugin:hooksSetup.created', { name: hookName }))
      }
    }

    // Set core.hooksPath
    await $`git config core.hooksPath ${hooksPath}`
    output.newline()
    output.success(t('plugin:hooksSetup.setPathSuccess', { path: hooksPath }))
    output.info(t('plugin:hooksSetup.editHooksIn', { path: hooksPath }))
  },
})
