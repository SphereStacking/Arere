/**
 * Plugin translation key types
 * Type-safe keys derived directly from JSON (no build script needed!)
 */

import type * as translationEn from '../locales/en/translation.json'

/**
 * Convert nested object to dot notation keys
 * Example: { a: { b: string } } => 'a.b'
 */
type DotNotation<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DotNotation<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`
}[keyof T]

/**
 * Plugin translation keys (union type for t() function)
 */
export type PluginTranslationKey = DotNotation<typeof translationEn>

/**
 * Translation keys interface (mirrors JSON structure)
 */
export type PluginTranslationKeys = typeof translationEn

/**
 * Extract translation object type from defineAction's translations property
 */
export type TranslationKeys<T> = T extends Record<string, infer Locale>
  ? Locale extends Record<string, unknown>
    ? Locale
    : never
  : never
