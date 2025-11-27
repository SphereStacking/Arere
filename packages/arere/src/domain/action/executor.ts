/**
 * Action executor
 */

import type { VisualFeedback } from '@/domain/types/control'
import type { LoadedPlugin } from '@/domain/plugin/types'
import type { ArereConfig } from '@/infrastructure/config/schema'
import type { OutputCallback } from '@/infrastructure/output/collector'
import { FileConfigManager } from '@/infrastructure/config/manager'
import { formatError } from '@/shared/utils/error'
import { logger } from '@/shared/utils/logger'
import { type OutputCollector, createActionContext } from './context'
import type { Action } from './types'

/**
 * Action run result
 */
export interface RunResult {
  /** Whether the run was successful */
  success: boolean
  /** Run duration in milliseconds */
  duration: number
  /** Output collector with all messages from the action */
  outputCollector: OutputCollector
  /** Error if run failed */
  error?: Error
}

/**
 * Options for action run
 */
export interface RunActionOptions {
  /** Plugins to get plugin config from */
  plugins?: LoadedPlugin[]
  /** Application configuration */
  config?: ArereConfig
  /** Callback for real-time output streaming */
  onOutput?: OutputCallback
  /** Callback for visual feedback updates */
  onVisualFeedback?: (
    feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback),
  ) => void
}

/**
 * Run an action
 *
 * @param action - Action to run
 * @param options - Run options
 * @returns Run result
 *
 * @example
 * ```typescript
 * const result = await runAction(action)
 * if (result.success) {
 *   console.log(`Action completed in ${result.duration}ms`)
 * } else {
 *   console.error(`Action failed:`, result.error)
 * }
 * ```
 *
 * @example With real-time output streaming
 * ```typescript
 * const result = await runAction(action, {
 *   onOutput: (message) => console.log(message),
 *   onVisualFeedback: (feedback) => setState(feedback),
 * })
 * ```
 */
export async function runAction(
  action: Action,
  options: RunActionOptions = {},
): Promise<RunResult> {
  const { plugins, config: providedConfig, onOutput, onVisualFeedback } = options

  logger.info(`Running action: ${action.meta.name}`)

  const startTime = performance.now()

  try {
    // Load current config for ActionContext (use provided or load from file)
    const manager = new FileConfigManager()
    const config = providedConfig ?? (await manager.loadMerged())

    // Find plugin config for this action
    let pluginConfig: Record<string, unknown> | undefined
    if (action.pluginNamespace && plugins) {
      const plugin = plugins.find((p) => p.i18nNamespace === action.pluginNamespace)
      pluginConfig = plugin?.userConfig
    }

    // Create execution context with scoped translations
    const { context, outputCollector } = createActionContext({
      actionName: action.meta.name,
      config,
      pluginNamespace: action.pluginNamespace,
      pluginConfig,
      setVisualFeedback: onVisualFeedback,
      onOutput,
    })

    // Run the action
    await action.run(context)

    const duration = Math.round(performance.now() - startTime)

    logger.info(`Action "${action.meta.name}" completed successfully in ${duration}ms`)

    return {
      success: true,
      duration,
      outputCollector,
    }
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)

    logger.error(`Action "${action.meta.name}" failed after ${duration}ms:`, formatError(error))

    // Create a minimal output collector for error cases
    // (context might not have been created if error occurred during setup)
    const manager = new FileConfigManager()
    const config = providedConfig ?? (await manager.loadMerged())
    const { outputCollector } = createActionContext({
      actionName: action.meta.name,
      config,
      onOutput,
    })

    return {
      success: false,
      duration,
      outputCollector,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}
