/**
 * Main library entry point
 * Exports public API for programmatic usage
 */

// Export version
export const version = '0.1.0'

// Action API
export { defineAction } from './domain/action/defineAction'
export type {
  Action,
  ActionMeta,
  ActionContext,
  ActionDefinition,
  ActionLocation,
} from './domain/action/types'

// Shell API
export { createShellExecutor } from './infrastructure/shell/executor'
export type { ShellResult, ShellExecutor } from './domain/action/types'

// Prompt API
export { text } from './infrastructure/prompt/text'
export { select } from './infrastructure/prompt/select'
export { confirm } from './infrastructure/prompt/confirm'
export { multiSelect } from './infrastructure/prompt/multiSelect'
export type {
  PromptAPI,
  TextOptions,
  SelectChoice,
} from './domain/action/types'

// i18n API
export { t, getCurrentLocale, changeLocale } from './infrastructure/i18n/index'

// Plugin API
export { definePlugin } from './domain/plugin/definePlugin'
export type { ArerePlugin, PluginMeta, LoadedPlugin } from './domain/plugin/types'

// Config API (Unified config management)
export { FileConfigManager } from './infrastructure/config/manager'
export type { ArereConfig } from './infrastructure/config/schema'
export type { ConfigLayer } from './infrastructure/config/types'
