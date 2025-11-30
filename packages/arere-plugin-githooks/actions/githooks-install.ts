/**
 * githooks:install - Install git hooks
 *
 * Usage:
 *   arere run githooks:install              # Install all configured hooks
 *   arere run githooks:install pre-commit   # Install specific hook
 */

import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { defineAction } from 'arere'
import type { HookConfig, PluginConfig } from '../src/index.js'
import {
  type HookType,
  SUPPORTED_HOOKS,
  findGitDir,
  generateHookScript,
  getHookPath,
  getHooksDir,
  hookExists,
  isPluginGeneratedHook,
  isValidHookName,
} from '../src/utils.js'

const translations = {
  en: {
    description: 'Install git hooks',
    no_git_dir: 'Not a git repository (or any of the parent directories)',
    no_hooks_configured: 'No hooks configured in plugin settings',
    invalid_hook_name: 'Invalid hook name: {{name}}. Supported hooks: {{supported}}',
    hook_not_configured: 'Hook "{{name}}" is not configured in plugin settings',
    hook_disabled: 'Hook "{{name}}" is disabled in configuration',
    installing_hooks: 'Installing git hooks...',
    installing_hook: 'Installing {{name}}...',
    hook_exists_warning:
      'Hook "{{name}}" already exists and was not created by this plugin. Use --force to overwrite.',
    hook_installed: 'Installed {{name}}',
    hook_skipped: 'Skipped {{name}} (disabled)',
    all_hooks_installed: 'All hooks installed successfully!',
    hooks_installed_count: 'Installed {{count}} hook(s)',
  },
  ja: {
    description: 'Git hooksをインストール',
    no_git_dir: 'Gitリポジトリではありません（または親ディレクトリにもありません）',
    no_hooks_configured: 'プラグイン設定にhooksが設定されていません',
    invalid_hook_name: '無効なhook名: {{name}}。サポートされているhooks: {{supported}}',
    hook_not_configured: 'Hook "{{name}}" はプラグイン設定に設定されていません',
    hook_disabled: 'Hook "{{name}}" は設定で無効になっています',
    installing_hooks: 'Git hooksをインストール中...',
    installing_hook: '{{name}} をインストール中...',
    hook_exists_warning:
      'Hook "{{name}}" は既に存在し、このプラグインで作成されたものではありません。--forceで上書きできます。',
    hook_installed: '{{name}} をインストールしました',
    hook_skipped: '{{name}} をスキップしました（無効）',
    all_hooks_installed: 'すべてのhooksをインストールしました！',
    hooks_installed_count: '{{count}}個のhookをインストールしました',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'githooks',
  tags: ['git', 'hooks', 'install'],
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

    // Get hooks configuration
    const hooksConfig = config?.hooks ?? {}
    const configuredHooks = Object.keys(hooksConfig) as HookType[]

    if (configuredHooks.length === 0) {
      tui.output.warn(t('no_hooks_configured'))
      return
    }

    // Determine which hooks to install
    let hooksToInstall: HookType[]

    if (hookNameArg) {
      // Install specific hook
      if (!isValidHookName(hookNameArg)) {
        tui.output.error(
          t('invalid_hook_name', {
            name: hookNameArg,
            supported: SUPPORTED_HOOKS.join(', '),
          }),
        )
        process.exit(1)
      }

      if (!configuredHooks.includes(hookNameArg)) {
        tui.output.error(t('hook_not_configured', { name: hookNameArg }))
        process.exit(1)
      }

      hooksToInstall = [hookNameArg]
    } else {
      // Install all configured hooks
      hooksToInstall = configuredHooks
    }

    tui.output.section(t('installing_hooks'))

    // Ensure hooks directory exists
    const hooksDir = getHooksDir(gitDir)
    if (!existsSync(hooksDir)) {
      mkdirSync(hooksDir, { recursive: true })
    }

    let installedCount = 0

    for (const hookName of hooksToInstall) {
      const hookConfig = hooksConfig[hookName] as HookConfig

      // Skip disabled hooks
      if (!hookConfig.enabled) {
        tui.output.info(t('hook_skipped', { name: hookName }))
        continue
      }

      const hookPath = getHookPath(gitDir, hookName)

      // Check if hook already exists
      if (hookExists(hookPath) && !isPluginGeneratedHook(hookPath) && !force) {
        tui.output.warn(t('hook_exists_warning', { name: hookName }))
        continue
      }

      // Generate and write hook script
      const script = generateHookScript(hookName)
      writeFileSync(hookPath, script, 'utf-8')
      chmodSync(hookPath, 0o755) // Make executable

      tui.output.success(t('hook_installed', { name: hookName }))
      installedCount++
    }

    tui.output.newline()
    if (installedCount === hooksToInstall.length) {
      tui.output.success(t('all_hooks_installed'))
    } else {
      tui.output.info(t('hooks_installed_count', { count: installedCount.toString() }))
    }
  },
})
