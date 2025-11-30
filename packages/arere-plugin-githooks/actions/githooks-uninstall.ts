/**
 * githooks:uninstall - Uninstall git hooks
 *
 * Usage:
 *   arere run githooks:uninstall              # Uninstall all plugin-generated hooks
 *   arere run githooks:uninstall pre-commit   # Uninstall specific hook
 */

import { unlinkSync } from 'node:fs'
import { defineAction } from 'arere'
import type { PluginConfig } from '../src/index.js'
import {
  type HookType,
  SUPPORTED_HOOKS,
  findGitDir,
  getHookPath,
  hookExists,
  isPluginGeneratedHook,
  isValidHookName,
} from '../src/utils.js'

const translations = {
  en: {
    description: 'Uninstall git hooks',
    no_git_dir: 'Not a git repository (or any of the parent directories)',
    invalid_hook_name: 'Invalid hook name: {{name}}. Supported hooks: {{supported}}',
    uninstalling_hooks: 'Uninstalling git hooks...',
    hook_not_found: 'Hook "{{name}}" not found',
    hook_not_ours: 'Hook "{{name}}" was not created by this plugin. Use --force to remove anyway.',
    hook_uninstalled: 'Uninstalled {{name}}',
    all_hooks_uninstalled: 'All hooks uninstalled successfully!',
    hooks_uninstalled_count: 'Uninstalled {{count}} hook(s)',
    no_hooks_to_uninstall: 'No plugin-generated hooks found to uninstall',
  },
  ja: {
    description: 'Git hooksをアンインストール',
    no_git_dir: 'Gitリポジトリではありません（または親ディレクトリにもありません）',
    invalid_hook_name: '無効なhook名: {{name}}。サポートされているhooks: {{supported}}',
    uninstalling_hooks: 'Git hooksをアンインストール中...',
    hook_not_found: 'Hook "{{name}}" が見つかりません',
    hook_not_ours:
      'Hook "{{name}}" はこのプラグインで作成されたものではありません。--forceで強制削除できます。',
    hook_uninstalled: '{{name}} をアンインストールしました',
    all_hooks_uninstalled: 'すべてのhooksをアンインストールしました！',
    hooks_uninstalled_count: '{{count}}個のhookをアンインストールしました',
    no_hooks_to_uninstall: 'アンインストールするプラグイン生成のhooksが見つかりません',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'githooks',
  tags: ['git', 'hooks', 'uninstall'],
  translations,
  run: async ({ args, tui, t, pluginConfig }) => {
    const config = pluginConfig as PluginConfig | undefined
    const force = args.includes('--force')
    const hookNameArg = args.find((arg) => !arg.startsWith('-'))

    // Find git directory
    const gitDir = findGitDir()
    if (!gitDir) {
      tui.output.error(t('no_git_dir'))
      process.exit(1)
    }

    tui.output.section(t('uninstalling_hooks'))

    let hooksToCheck: HookType[]

    if (hookNameArg) {
      // Uninstall specific hook
      if (!isValidHookName(hookNameArg)) {
        tui.output.error(
          t('invalid_hook_name', {
            name: hookNameArg,
            supported: SUPPORTED_HOOKS.join(', '),
          }),
        )
        process.exit(1)
      }
      hooksToCheck = [hookNameArg]
    } else {
      // Check all configured hooks + all supported hooks for plugin-generated ones
      const configuredHooks = Object.keys(config?.hooks ?? {}) as HookType[]
      hooksToCheck = [...new Set([...configuredHooks, ...SUPPORTED_HOOKS])]
    }

    let uninstalledCount = 0

    for (const hookName of hooksToCheck) {
      const hookPath = getHookPath(gitDir, hookName)

      // Check if hook exists
      if (!hookExists(hookPath)) {
        if (hookNameArg) {
          // Only show message if specific hook was requested
          tui.output.info(t('hook_not_found', { name: hookName }))
        }
        continue
      }

      // Check if it's our hook
      if (!isPluginGeneratedHook(hookPath) && !force) {
        if (hookNameArg) {
          // Only show warning if specific hook was requested
          tui.output.warn(t('hook_not_ours', { name: hookName }))
        }
        continue
      }

      // Remove the hook
      unlinkSync(hookPath)
      tui.output.success(t('hook_uninstalled', { name: hookName }))
      uninstalledCount++
    }

    tui.output.newline()
    if (uninstalledCount === 0) {
      tui.output.info(t('no_hooks_to_uninstall'))
    } else if (hookNameArg && uninstalledCount === 1) {
      tui.output.success(t('all_hooks_uninstalled'))
    } else {
      tui.output.info(t('hooks_uninstalled_count', { count: uninstalledCount.toString() }))
    }
  },
})
