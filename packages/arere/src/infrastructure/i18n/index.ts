/**
 * i18n internationalization setup
 * Custom translation system (no external dependencies)
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { translationManager } from './manager'
import { createScopedT as createScopedTImpl } from './scoped'
import type { GlobalTranslationKey } from './types'

export type * from './types'
export type { TranslationFunction } from './scoped'

/**
 * Pending translations to be registered after i18n initialization
 * This allows actions to call registerTranslations() at module level
 * @internal
 */
export const _pendingTranslations: Array<{
  namespace: string
  translations: Record<string, Record<string, unknown>>
}> = []

/**
 * Flag to track if i18n has been initialized
 * @internal
 */
export let _isInitialized = false

/**
 * Get package root directory reliably
 * Works in both development and production environments
 */
function getPackageRoot(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  // Try common locations where locales directory might be
  const candidates = [
    join(__dirname, '../../..'), // From src/infrastructure/i18n/ in development
    join(__dirname, '..'), // From dist/ in production
  ]

  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'locales'))) {
      return candidate
    }
  }

  // Fallback: return most likely location (will error on actual load if wrong)
  return join(__dirname, '../../..')
}

const packageRoot = getPackageRoot()

/**
 * Detect locale from config or system environment
 * Priority: config.locale > system locale > default (en)
 */
export function detectLocale(configLocale?: string): string {
  // 1. Check config file locale setting
  if (configLocale) {
    return configLocale
  }

  // 2. Check system locale (LANG, LC_ALL)
  const lang = process.env.LANG || process.env.LC_ALL || ''

  // Japanese locale detection (ja_JP.UTF-8, ja_JP, ja, etc.)
  if (lang.startsWith('ja')) {
    return 'ja'
  }

  // 3. Default to English
  return 'en'
}

/**
 * Load translation file
 */
function loadTranslation(locale: string, namespace: string): object {
  try {
    // Resolve from package root - works in both development and production
    const translationPath = join(packageRoot, 'locales', locale, `${namespace}.json`)
    const content = readFileSync(translationPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    // If translation file not found, return empty object (will fallback to default language)
    console.error(`Failed to load translation: ${locale}/${namespace}`, error)
    return {}
  }
}

/**
 * Initialize i18n
 */
export async function initI18n(configLocale?: string): Promise<void> {
  const locale = detectLocale(configLocale)

  // Initialize translation manager with core translations
  translationManager.init({
    en: {
      common: loadTranslation('en', 'common') as Record<string, unknown>,
      cli: loadTranslation('en', 'cli') as Record<string, unknown>,
      ui: loadTranslation('en', 'ui') as Record<string, unknown>,
      errors: loadTranslation('en', 'errors') as Record<string, unknown>,
    },
    ja: {
      common: loadTranslation('ja', 'common') as Record<string, unknown>,
      cli: loadTranslation('ja', 'cli') as Record<string, unknown>,
      ui: loadTranslation('ja', 'ui') as Record<string, unknown>,
      errors: loadTranslation('ja', 'errors') as Record<string, unknown>,
    },
  })

  // Set current locale
  translationManager.changeLocale(locale)

  // Mark as initialized
  _isInitialized = true

  // Register all pending translations
  for (const pending of _pendingTranslations) {
    translationManager.registerTranslations(pending.namespace, pending.translations)
  }

  // Clear pending translations
  _pendingTranslations.length = 0
}

/**
 * Get translation function with type-safe keys
 *
 * @param key - Translation key with namespace prefix (e.g., 'common:app_name', 'ui:launcher.title')
 * @param options - Optional variables for interpolation
 * @returns Translated string
 *
 * @example
 * ```typescript
 * t('common:app_name')              // ✓ Type-safe
 * t('ui:launcher.title')            // ✓ Type-safe
 * t('common:typo')                  // ✗ Type error!
 * t('greeting')                     // ✗ Missing namespace prefix
 * ```
 */
export function t(key: GlobalTranslationKey, options?: Record<string, unknown>): string {
  // Parse namespace prefix (e.g., 'common:app_name' -> namespace='common', key='app_name')
  if (key.includes(':')) {
    const colonIndex = key.indexOf(':')
    const namespace = key.slice(0, colonIndex)
    const actualKey = key.slice(colonIndex + 1)
    return translationManager.t(actualKey, { ...options, ns: namespace })
  }

  // Fallback: no prefix (shouldn't happen with GlobalTranslationKey type)
  return translationManager.t(key, options)
}

/**
 * Create a scoped translation function for a specific namespace
 * This ensures actions can only access their own translations
 *
 * @param namespace - Namespace to scope translations to
 * @param allowedNamespaces - Additional namespaces that can be accessed (for plugins)
 * @returns Scoped translation function
 *
 * @example
 * ```typescript
 * const scopedT = createScopedT('my-action')
 * scopedT('greeting') // Translates 'greeting' from 'my-action' namespace
 * ```
 */
export function createScopedT(
  namespace: string,
  allowedNamespaces: string[] = [],
): (key: string, options?: Record<string, unknown>) => string {
  return createScopedTImpl(translationManager, namespace, allowedNamespaces)
}

/**
 * Get current locale
 */
export function getCurrentLocale(): string {
  return translationManager.getCurrentLocale()
}

/**
 * Change locale
 */
export async function changeLocale(locale: string): Promise<void> {
  translationManager.changeLocale(locale)
}

/**
 * Register translations from code (instead of files)
 * Useful for user actions that want to embed translations directly
 *
 * @internal - This function is called internally by the action loader.
 * Actions should use the `translations` property in defineAction() instead.
 *
 * @param namespace - Translation namespace
 * @param translations - Translation object by locale
 *
 * @example
 * ```typescript
 * registerTranslations('my-action', {
 *   en: {
 *     greeting: 'Hello!',
 *     messages: { success: 'Done!' }
 *   },
 *   ja: {
 *     greeting: 'こんにちは!',
 *     messages: { success: '完了!' }
 *   }
 * })
 * ```
 */
export function registerTranslations(
  namespace: string,
  translations: Record<string, Record<string, unknown>>,
): void {
  // If i18n is not yet initialized, queue the translations
  if (!_isInitialized) {
    _pendingTranslations.push({ namespace, translations })
    return
  }

  // i18n is initialized, register immediately
  translationManager.registerTranslations(namespace, translations)
}

/**
 * Register plugin translations
 * Dynamically loads translation files from a plugin's locales directory
 *
 * @param namespace - Plugin namespace (e.g., 'arere-plugin-example')
 * @param localesPath - Absolute path to plugin's locales directory
 *
 * @example
 * ```typescript
 * await registerPluginTranslations('my-plugin', '/path/to/plugin/locales')
 * ```
 */
export async function registerPluginTranslations(
  namespace: string,
  localesPath: string,
): Promise<void> {
  const supportedLocales = ['en', 'ja']

  for (const locale of supportedLocales) {
    try {
      const translationPath = join(localesPath, locale, 'translation.json')
      const content = readFileSync(translationPath, 'utf-8')
      const translations = JSON.parse(content) as Record<string, unknown>

      // Add resource bundle for this locale and namespace
      translationManager.addResourceBundle(locale, namespace, translations)
    } catch (error) {
      // Translation file not found or invalid - this is okay for plugins
      // They may only support certain locales
    }
  }
}
