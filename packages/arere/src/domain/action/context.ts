/**
 * Action execution context creation
 */

import type {
  ProgressControl,
  ProgressOptions,
  SpinnerControl,
  SpinnerOptions,
  VisualFeedback,
  WaitForKeyOptions,
} from '@/domain/types/control'
import type { ArereConfig } from '@/infrastructure/config/schema'
import { createScopedT } from '@/infrastructure/i18n/index'
import {
  type OutputCallback,
  type OutputCollector,
  createOutputAPI,
} from '@/infrastructure/output/collector'
import { confirm } from '@/infrastructure/prompt/confirm'
import { form } from '@/infrastructure/prompt/form'
import { multiSelect } from '@/infrastructure/prompt/multiSelect'
import { number } from '@/infrastructure/prompt/number'
import { password } from '@/infrastructure/prompt/password'
import { renderPrompt } from '@/infrastructure/prompt/renderer'
import { select } from '@/infrastructure/prompt/select'
import { text } from '@/infrastructure/prompt/text'
import { createShellExecutor } from '@/infrastructure/shell/executor'
import {
  createProgressControl,
  createSpinnerControl,
  delay,
  getTerminalSize,
  isInteractive,
  waitForEnter,
  waitForKey,
} from '@/presentation/ui/control/index'
import type { PromptAPI } from './types'
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
  const { actionName, config, pluginNamespace, pluginConfig, setVisualFeedback, onOutput } = options

  // Create scoped t function
  // For plugin actions, allow access to both action namespace and plugin namespace
  const allowedNamespaces = pluginNamespace ? [pluginNamespace] : []
  const scopedT = createScopedT(actionName, allowedNamespaces)

  // Create output API and collector with optional real-time callback
  const { api: outputAPI, collector: outputCollector } = createOutputAPI(onOutput)

  // Create callable prompt API with shorthand methods
  const promptAPI: PromptAPI = Object.assign(form, {
    text,
    number,
    password,
    select,
    confirm,
    multiSelect,
  })

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
            throw new Error(
              'spinner() requires visual feedback support. ' +
                'This action is running in a context without UI rendering. ' +
                'Spinner/Progress are only available when actions are run from the TUI.',
            )
          }
          return createSpinnerControl(options ?? {}, setVisualFeedback)
        },
        progress: (options?: ProgressOptions): ProgressControl => {
          if (!setVisualFeedback) {
            throw new Error(
              'progress() requires visual feedback support. ' +
                'This action is running in a context without UI rendering. ' +
                'Spinner/Progress are only available when actions are run from the TUI.',
            )
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
  }

  return { context, outputCollector }
}
