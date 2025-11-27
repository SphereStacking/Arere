/**
 * Type-safe translation key definitions
 * Provides compile-time checking for translation keys with `:` prefix notation
 */

import type { CliKey, CommonKey, ErrorsKey, UiKey } from './types'
import type { NestedKeyOf } from './utils'

/**
 * Core translation keys (arere built-in namespaces)
 */
export type CoreTranslationKey = CommonKey | CliKey | UiKey | ErrorsKey

/**
 * Create scoped translation key type with `:` prefix support
 *
 * @template TAction - Action's own translation keys
 * @template TPlugin - Plugin's translation keys (optional)
 *
 * @example Without plugin
 * ```typescript
 * type MyKeys = ScopedTranslationKey<{
 *   greeting: string
 *   messages: { success: string }
 * }>
 * // 'greeting' | 'messages.success' | 'common:app_name' | 'common:actions.quit' | ...
 * ```
 *
 * @example With plugin
 * ```typescript
 * type MyKeys = ScopedTranslationKey<
 *   { title: string },
 *   { error: { invalid: string } }
 * >
 * // 'title' | 'plugin:error.invalid' | 'common:app_name' | ...
 * ```
 */
export type ScopedTranslationKey<
  TAction extends Record<string, unknown>,
  TPlugin extends Record<string, unknown> | undefined = undefined,
> = TPlugin extends Record<string, unknown>
  ? // With plugin namespace
    NestedKeyOf<TAction> | `common:${CommonKey}` | `plugin:${NestedKeyOf<TPlugin>}`
  : // Without plugin namespace
    NestedKeyOf<TAction> | `common:${CommonKey}`

/**
 * Extract translation object type from defineAction's translations property
 *
 * @example
 * ```typescript
 * const translations = {
 *   en: { greeting: 'Hello', messages: { success: 'Done!' } },
 *   ja: { greeting: 'こんにちは', messages: { success: '完了！' } }
 * } as const
 *
 * type Keys = TranslationKeys<typeof translations>
 * // { greeting: string, messages: { success: string } }
 * ```
 */
export type TranslationKeys<T> = T extends Record<string, infer Locale>
  ? Locale extends Record<string, unknown>
    ? Locale
    : never
  : never

/**
 * Type-safe translation function signature
 *
 * Translate a key with optional variable interpolation
 *
 * @template TKeys - Allowed translation keys (string literal union)
 * @param key - Translation key (type-checked)
 * @param options - Variables for interpolation
 * @returns Translated string
 */
export type TypeSafeTranslationFunction<TKeys extends string> = (
  key: TKeys,
  options?: Record<string, unknown>,
) => string

/**
 * Helper type: Check if a type has plugin namespace
 */
export type HasPluginNamespace<T> = T extends { pluginNamespace: string } ? true : false
