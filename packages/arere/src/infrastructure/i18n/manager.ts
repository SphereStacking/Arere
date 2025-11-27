/**
 * Translation manager - lightweight alternative to i18next
 */

import { getByPath, interpolate } from './utils'

/**
 * Translation storage structure
 * translations[locale][namespace] = resources
 */
type TranslationStore = Record<string, Record<string, Record<string, unknown>>>

/**
 * Translation manager class
 * Manages translations across multiple locales and namespaces
 */
export class TranslationManager {
  private translations: TranslationStore = {}
  private currentLocale: string
  private fallbackLocale = 'en'
  private namespaces: Set<string> = new Set()

  constructor(locale = 'en') {
    this.currentLocale = locale
  }

  /**
   * Initialize translation manager with resources
   */
  init(resources: TranslationStore): void {
    this.translations = resources

    // Collect all namespaces
    for (const localeResources of Object.values(resources)) {
      for (const ns of Object.keys(localeResources)) {
        this.namespaces.add(ns)
      }
    }
  }

  /**
   * Translate a key with optional variable interpolation
   *
   * @param key - Translation key (dot notation)
   * @param options - Options object with ns (namespace) and variables
   * @returns Translated string, or the key itself if not found
   *
   * @example
   * ```typescript
   * t('greeting.hello')                          // Uses default namespace
   * t('common:name')                  // Specify namespace
   * t('welcome', { name: 'World' })              // With interpolation
   * t('errors:error.message', { code: 404 }) // Both
   * t('missing.key')                             // Returns 'missing.key' if not found
   * ```
   */
  t(key: string, options?: Record<string, unknown>): string {
    const ns = (options?.ns as string) || 'common'
    const locale = this.currentLocale

    // Try current locale first
    let value = this.getValue(locale, ns, key)

    // Fallback to fallback locale if not found
    if (value === undefined && locale !== this.fallbackLocale) {
      value = this.getValue(this.fallbackLocale, ns, key)
    }

    // If still not found, return the key itself
    if (value === undefined) {
      return key
    }

    // Convert to string
    const str = String(value)

    // Interpolate variables (if any)
    return interpolate(str, options)
  }

  /**
   * Get nested value from translations
   */
  private getValue(locale: string, namespace: string, key: string): unknown | undefined {
    const namespaceData = this.translations[locale]?.[namespace]
    if (!namespaceData) {
      return undefined
    }

    return getByPath(namespaceData, key)
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): string {
    return this.currentLocale
  }

  /**
   * Change current locale
   */
  changeLocale(locale: string): void {
    this.currentLocale = locale
  }

  /**
   * Register translations from code
   * Useful for actions and plugins that embed translations
   *
   * @param namespace - Translation namespace
   * @param translations - Translations by locale
   *
   * @example
   * ```typescript
   * manager.registerTranslations('my-action', {
   *   en: { greeting: 'Hello!' },
   *   ja: { greeting: 'こんにちは!' }
   * })
   * ```
   */
  registerTranslations(
    namespace: string,
    translations: Record<string, Record<string, unknown>>,
  ): void {
    this.namespaces.add(namespace)

    for (const [locale, resources] of Object.entries(translations)) {
      this.addResourceBundle(locale, namespace, resources)
    }
  }

  /**
   * Add resource bundle for a specific locale and namespace
   */
  addResourceBundle(locale: string, namespace: string, resources: Record<string, unknown>): void {
    // Ensure locale exists
    if (!this.translations[locale]) {
      this.translations[locale] = {}
    }

    // Merge with existing resources (deep merge)
    const existing = this.translations[locale][namespace] || {}
    this.translations[locale][namespace] = {
      ...existing,
      ...resources,
    }
  }

  /**
   * Get all registered namespaces
   */
  getNamespaces(): string[] {
    return Array.from(this.namespaces)
  }
}

/**
 * Global translation manager instance
 */
export const translationManager = new TranslationManager()
