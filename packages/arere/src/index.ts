/**
 * Main library entry point
 * Exports public API for programmatic usage
 */

// Export version
export const version = '0.1.0'

// Action API
export { defineAction } from './action/define'
export type {
  Action,
  ActionMeta,
  ActionContext,
  ActionDefinition,
  ActionLocation,
} from './action/types'

// Shell API
export { createShellExecutor } from './shell/executor'
export type { ShellResult, ShellExecutor } from './action/types'

// Prompt API
export { text } from './ui/prompts/text'
export { select } from './ui/prompts/select'
export { confirm } from './ui/prompts/confirm'
export { multiSelect } from './ui/prompts/multiSelect'
export type {
  PromptAPI,
  TextOptions,
  SelectChoice,
} from './action/types'

// i18n API
export { t, getCurrentLocale, changeLocale } from './i18n/index'

// Plugin API
export { definePlugin } from './plugin/define'
export type { ArerePlugin, PluginMeta, LoadedPlugin } from './plugin/types'

// Config API (Unified config management)
export { FileConfigManager } from './config/manager'
export type { ArereConfig } from './config/schema'
export type { ConfigLayer } from './config/types'
