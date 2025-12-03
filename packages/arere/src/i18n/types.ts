/**
 * i18n translation key types
 *
 * Types are derived directly from JSON files using TypeScript's type inference.
 * No code generation script needed!
 */

// Import JSON files directly (resolveJsonModule: true in tsconfig)
import type cli from '../../locales/en/cli.json'
import type common from '../../locales/en/common.json'
import type errors from '../../locales/en/errors.json'
import type ui from '../../locales/en/ui.json'

import type { NestedKeyOf } from './utils'

// ============================================================================
// Structure types (inferred from JSON)
// ============================================================================

/**
 * Translation structure for cli namespace
 */
export type CliKeys = typeof cli

/**
 * Translation structure for common namespace
 */
export type CommonKeys = typeof common

/**
 * Translation structure for errors namespace
 */
export type ErrorsKeys = typeof errors

/**
 * Translation structure for ui namespace
 */
export type UiKeys = typeof ui

// ============================================================================
// Key union types (dot-notation paths)
// ============================================================================

/**
 * All possible translation keys for cli namespace
 * e.g., 'help.usage' | 'help.commands.default' | ...
 */
export type CliKey = NestedKeyOf<typeof cli>

/**
 * All possible translation keys for common namespace
 * e.g., 'app_name' | 'actions.quit' | ...
 */
export type CommonKey = NestedKeyOf<typeof common>

/**
 * All possible translation keys for errors namespace
 * e.g., 'action_not_found' | 'plugin_load_error' | ...
 */
export type ErrorsKey = NestedKeyOf<typeof errors>

/**
 * All possible translation keys for ui namespace
 * e.g., 'launcher.title' | 'settings.options.locale' | ...
 */
export type UiKey = NestedKeyOf<typeof ui>

// ============================================================================
// Utility types
// ============================================================================

/**
 * Namespace to key mapping
 */
export interface TranslationNamespaceMap {
  cli: CliKey
  common: CommonKey
  errors: ErrorsKey
  ui: UiKey
}

/**
 * Get translation keys for a namespace
 */
export type TranslationKey<Namespace extends keyof TranslationNamespaceMap> =
  TranslationNamespaceMap[Namespace]

/**
 * All possible translation keys (any namespace)
 */
export type AnyTranslationKey = CliKey | CommonKey | ErrorsKey | UiKey

/**
 * Global translation key with namespace prefix (e.g., 'common:app_name', 'ui:launcher.title')
 * Supports colon notation for accessing any core namespace
 */
export type GlobalTranslationKey = {
  [Namespace in keyof TranslationNamespaceMap]: `${Namespace & string}:${TranslationNamespaceMap[Namespace]}`
}[keyof TranslationNamespaceMap]
