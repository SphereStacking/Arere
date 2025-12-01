/**
 * Action execution context creation
 */

import { createPromptAPIWithArgs } from '@/action/args'
import type { ArereConfig } from '@/config/schema'
import { createScopedT } from '@/i18n/index'
import { createShellExecutor } from '@/shell/executor'
import {
  createProgressControl,
  createSpinnerControl,
  delay,
  getTerminalSize,
  isInteractive,
} from '@/ui/control/index'
import type {
  ProgressControl,
  ProgressOptions,
  SpinnerControl,
  SpinnerOptions,
  VisualFeedback,
  WaitForKeyOptions,
} from '@/ui/control/types'
import { type OutputCallback, type OutputCollector, createOutputAPI } from '@/ui/output/collector'
import { renderPrompt } from '@/ui/prompts/renderer'
import type { ActionContext } from './types'

// Re-export OutputCollector for use by executor
export type { OutputCollector }

/**
 * Options for creating an action context
 */
export interface CreateActionContextOptions {
  /** Action name (used as namespace for translations) */
  actionName: string
  /** Application configuration (merged result) */
  config: ArereConfig
  /** Optional plugin namespace for plugin actions */
  pluginNamespace?: string
  /** Optional plugin configuration to pass to the action */
  pluginConfig?: Record<string, unknown>
  /** Optional visual feedback state setter for spinner/progress */
  setVisualFeedback?: (
    feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback),
  ) => void
  /** Optional callback for real-time output streaming */
  onOutput?: OutputCallback
  /** Command line arguments passed to the action (defaults to []) */
  args?: string[]
}

/**
 * Create an action execution context
 *
 * @template TKeys - Translation keys (for type-safe translations)
 * @param options - Context creation options
 * @returns Object with ActionContext and OutputCollector
 *
 * @example
 * ```typescript
 * const manager = new FileConfigManager()
 * const config = await manager.loadMerged()
 * const { context, outputCollector } = createActionContext({
 *   actionName: 'my-action',
 *   config,
 * })
 * await action.run(context)
 * const messages = outputCollector.getMessages()
 * ```
 *
 * @example With real-time output streaming
 * ```typescript
 * const { context, outputCollector } = createActionContext({
 *   actionName: 'my-action',
 *   config,
 *   onOutput: (message) => console.log(message),
 * })
 * ```
 */
export function createActionContext<TKeys extends string = string>(
  options: CreateActionContextOptions,
): {
  context: ActionContext<TKeys>
  outputCollector: OutputCollector
} {
  const {
    actionName,
    config,
    pluginNamespace,
    pluginConfig,
    setVisualFeedback,
    onOutput,
    args = [],
  } = options

  // Create scoped t function
  // For plugin actions, allow access to both action namespace and plugin namespace
  const allowedNamespaces = pluginNamespace ? [pluginNamespace] : []
  const scopedT = createScopedT(actionName, allowedNamespaces)

  // Create output API and collector with optional real-time callback
  const { api: outputAPI, collector: outputCollector } = createOutputAPI(onOutput)

  // Create callable prompt API with argument resolution support
  const promptAPI = createPromptAPIWithArgs(args, isInteractive)

  const context: ActionContext<TKeys> = {
    tui: {
      prompt: promptAPI,
      output: outputAPI,
      control: {
        // Timing controls
        delay,
        waitForEnter: async (message?: string): Promise<void> => {
          await renderPrompt({
            type: 'waitForEnter',
            message,
          })
        },
        waitForKey: async (options?: WaitForKeyOptions): Promise<string> => {
          return renderPrompt({
            type: 'waitForKey',
            message: options?.message,
            keys: options?.keys,
            caseInsensitive: options?.caseInsensitive,
          }) as Promise<string>
        },

        // Visual feedback
        spinner: (options?: SpinnerOptions): SpinnerControl => {
          if (!setVisualFeedback) {
            // Headless mode: return no-op spinner that does nothing
            // This allows actions to use spinner() without checking if TUI is available
            return {
              start: () => {},
              stop: () => {},
              succeed: () => {},
              fail: () => {},
              update: () => {},
            }
          }
          return createSpinnerControl(options ?? {}, setVisualFeedback)
        },
        progress: (options?: ProgressOptions): ProgressControl => {
          if (!setVisualFeedback) {
            // Headless mode: return no-op progress that does nothing
            // This allows actions to use progress() without checking if TUI is available
            return {
              start: () => {},
              stop: () => {},
              succeed: () => {},
              fail: () => {},
              update: () => {},
              increment: () => {},
            }
          }
          return createProgressControl(options ?? {}, setVisualFeedback)
        },

        // Terminal utilities
        isInteractive,
        getTerminalSize,
      },
    },
    $: createShellExecutor(),
    t: scopedT as (key: TKeys, options?: { [key: string]: unknown }) => string,
    cwd: process.cwd(),
    env: process.env as Record<string, string | undefined>,
    pluginConfig,
    config,
    args,
  }

  return { context, outputCollector }
}
