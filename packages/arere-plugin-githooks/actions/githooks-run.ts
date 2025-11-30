/**
 * githooks:run - Run hook actions (called by git hooks)
 *
 * Usage:
 *   arere run githooks:run pre-commit   # Run pre-commit hook actions
 *
 * This action is called by the generated git hook scripts.
 * It reads the hook configuration and runs each action in sequence.
 * If any action fails, the hook fails (and the git operation is aborted).
 */

import { defineAction } from 'arere'
import type { HookConfig, PluginConfig } from '../src/index.js'
import { type HookType, SUPPORTED_HOOKS, isValidHookName } from '../src/utils.js'

const translations = {
  en: {
    description: 'Run hook actions (called by git hooks)',
    no_hook_name: 'Hook name is required. Usage: arere run githooks:run <hook-name>',
    invalid_hook_name: 'Invalid hook name: {{name}}. Supported hooks: {{supported}}',
    hook_not_configured: 'Hook "{{name}}" is not configured',
    hook_disabled: 'Hook "{{name}}" is disabled, skipping',
    no_actions: 'No actions configured for hook "{{name}}"',
    running_hook: 'Running {{name}} hook...',
    running_action: 'Running action: {{action}}',
    action_success: 'Action "{{action}}" completed successfully',
    action_failed: 'Action "{{action}}" failed with exit code {{code}}',
    hook_success: 'Hook "{{name}}" completed successfully ({{count}} actions)',
    hook_failed: 'Hook "{{name}}" failed',
  },
  ja: {
    description: 'Hookアクションを実行（git hooksから呼ばれる）',
    no_hook_name: 'Hook名が必要です。使用法: arere run githooks:run <hook-name>',
    invalid_hook_name: '無効なhook名: {{name}}。サポートされているhooks: {{supported}}',
    hook_not_configured: 'Hook "{{name}}" は設定されていません',
    hook_disabled: 'Hook "{{name}}" は無効です、スキップします',
    no_actions: 'Hook "{{name}}" にアクションが設定されていません',
    running_hook: '{{name}} hookを実行中...',
    running_action: 'アクション実行中: {{action}}',
    action_success: 'アクション "{{action}}" が正常に完了しました',
    action_failed: 'アクション "{{action}}" が終了コード {{code}} で失敗しました',
    hook_success: 'Hook "{{name}}" が正常に完了しました（{{count}}個のアクション）',
    hook_failed: 'Hook "{{name}}" が失敗しました',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'githooks',
  tags: ['git', 'hooks', 'run'],
  translations,
  run: async ({ args, tui, t, pluginConfig, $ }) => {
    const config = pluginConfig as PluginConfig | undefined
    const hookName = args.find((arg) => !arg.startsWith('-'))

    // Validate hook name
    if (!hookName) {
      tui.output.error(t('no_hook_name'))
      throw new Error('No hook name provided')
    }

    if (!isValidHookName(hookName)) {
      throw new Error(`Invalid hook name: ${hookName}. Supported: ${SUPPORTED_HOOKS.join(', ')}`)
    }

    // Get hook configuration
    const hooksConfig = config?.hooks ?? {}
    const hookConfig = hooksConfig[hookName as HookType] as HookConfig | undefined

    if (!hookConfig) {
      tui.output.warn(t('hook_not_configured', { name: hookName }))
      return
    }

    if (!hookConfig.enabled) {
      tui.output.info(t('hook_disabled', { name: hookName }))
      return
    }

    const actions = hookConfig.actions
    if (!actions || actions.length === 0) {
      tui.output.warn(t('no_actions', { name: hookName }))
      return
    }

    tui.output.section(t('running_hook', { name: hookName }))

    // Run each action in sequence
    for (const action of actions) {
      tui.output.info(t('running_action', { action }))

      try {
        // Run the action using arere run
        const result = await $`npx arere run ${action}`

        if (result.exitCode !== 0) {
          tui.output.error(
            t('action_failed', {
              action,
              code: result.exitCode?.toString() ?? 'unknown',
            }),
          )
          tui.output.error(t('hook_failed', { name: hookName }))
          process.exit(result.exitCode ?? 1)
        }

        tui.output.success(t('action_success', { action }))
      } catch (error) {
        const exitCode = (error as { exitCode?: number }).exitCode ?? 1
        tui.output.error(
          t('action_failed', {
            action,
            code: exitCode.toString(),
          }),
        )
        tui.output.error(t('hook_failed', { name: hookName }))
        process.exit(exitCode)
      }
    }

    tui.output.newline()
    tui.output.success(
      t('hook_success', {
        name: hookName,
        count: actions.length.toString(),
      }),
    )
  },
})
