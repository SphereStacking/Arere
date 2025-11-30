/**
 * githooks:status - Show current hook status
 *
 * Usage:
 *   arere run githooks:status   # Show status of all configured hooks
 *
 * Displays:
 * - Configured hooks and their actions
 * - Whether each hook is installed
 * - Whether each hook is enabled/disabled
 */

import { defineAction } from 'arere'
import type { HookConfig, PluginConfig } from '../src/index.js'
import {
  type HookType,
  findGitDir,
  getHookPath,
  hookExists,
  isPluginGeneratedHook,
} from '../src/utils.js'

const translations = {
  en: {
    description: 'Show current hook status',
    no_git_dir: 'Not a git repository (or any of the parent directories)',
    status_title: 'Git Hooks Status',
    no_hooks_configured: 'No hooks configured in plugin settings',
    hook_name: 'Hook',
    status: 'Status',
    actions: 'Actions',
    installed_ours: 'Installed (by plugin)',
    installed_other: 'Installed (by other)',
    not_installed: 'Not installed',
    enabled: 'Enabled',
    disabled: 'Disabled',
    summary: 'Summary',
    total_configured: 'Configured: {{count}}',
    total_installed: 'Installed: {{count}}',
    total_enabled: 'Enabled: {{count}}',
  },
  ja: {
    description: '現在のhook状態を表示',
    no_git_dir: 'Gitリポジトリではありません（または親ディレクトリにもありません）',
    status_title: 'Git Hooks ステータス',
    no_hooks_configured: 'プラグイン設定にhooksが設定されていません',
    hook_name: 'Hook',
    status: 'ステータス',
    actions: 'アクション',
    installed_ours: 'インストール済み（プラグイン製）',
    installed_other: 'インストール済み（他製）',
    not_installed: '未インストール',
    enabled: '有効',
    disabled: '無効',
    summary: 'サマリー',
    total_configured: '設定済み: {{count}}',
    total_installed: 'インストール済み: {{count}}',
    total_enabled: '有効: {{count}}',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'githooks',
  tags: ['git', 'hooks', 'status'],
  translations,
  run: async ({ tui, t, pluginConfig }) => {
    const config = pluginConfig as PluginConfig | undefined

    // Find git directory
    const gitDir = findGitDir()
    if (!gitDir) {
      tui.output.error(t('no_git_dir'))
      process.exit(1)
    }

    // Get hooks configuration
    const hooksConfig = config?.hooks ?? {}
    const configuredHooks = Object.keys(hooksConfig) as HookType[]

    tui.output.section(t('status_title'))
    tui.output.newline()

    if (configuredHooks.length === 0) {
      tui.output.warn(t('no_hooks_configured'))
      return
    }

    let installedCount = 0
    let enabledCount = 0

    for (const hookName of configuredHooks) {
      const hookConfig = hooksConfig[hookName] as HookConfig
      const hookPath = getHookPath(gitDir, hookName)
      const exists = hookExists(hookPath)
      const isOurs = exists && isPluginGeneratedHook(hookPath)

      // Determine status
      let installStatus: string
      if (isOurs) {
        installStatus = t('installed_ours')
        installedCount++
      } else if (exists) {
        installStatus = t('installed_other')
      } else {
        installStatus = t('not_installed')
      }

      const enabledStatus = hookConfig.enabled ? t('enabled') : t('disabled')
      if (hookConfig.enabled) {
        enabledCount++
      }

      // Display hook info
      tui.output.info(`${t('hook_name')}: ${hookName}`)
      tui.output.info(`  ${t('status')}: ${installStatus} | ${enabledStatus}`)
      tui.output.info(`  ${t('actions')}: ${hookConfig.actions.join(', ')}`)
      tui.output.newline()
    }

    // Summary
    tui.output.separator()
    tui.output.info(t('summary'))
    tui.output.list([
      t('total_configured', { count: configuredHooks.length.toString() }),
      t('total_installed', { count: installedCount.toString() }),
      t('total_enabled', { count: enabledCount.toString() }),
    ])
  },
})
