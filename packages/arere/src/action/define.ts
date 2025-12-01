/**
 * Action definition function
 */

import type { ScopedTranslationKey, TranslationKeys } from '@/i18n/types-safe'
import type { Action, ActionDefinition } from './types'

/**
 * Define an action
 *
 * @template TTranslations - Action translations object (inferred from config.translations)
 * @param config - Action configuration
 * @returns Action object
 *
 * @example Basic action
 * ```typescript
 * export default defineAction({
 *   name: 'hello',
 *   description: 'Say hello',
 *   async run({ tui, $ }) {
 *     const name = await tui.prompt.text('What is your name?')
 *     await $`echo Hello, ${name}!`
 *   }
 * })
 * ```
 *
 * @example With type-safe translations
 * ```typescript
 * export default defineAction({
 *   name: 'greet',
 *   description: 'Greet user',
 *   translations: {
 *     en: { greeting: 'Hello!', messages: { success: 'Done!' } },
 *     ja: { greeting: 'こんにちは！', messages: { success: '完了！' } }
 *   } as const,  // as const is important for type inference
 *   async run(ctx) {
 *     console.log(ctx.t('greeting'))              // ✅ Type-safe
 *     console.log(ctx.t('messages.success'))      // ✅ Type-safe
 *     console.log(ctx.t('common:actions.quit'))   // ✅ Type-safe
 *     console.log(ctx.t('invalid'))               // ❌ Type error
 *   }
 * })
 * ```
 */
export function defineAction<
  const TTranslations extends Record<string, Record<string, unknown>> | undefined = undefined,
>(
  config: TTranslations extends Record<string, Record<string, unknown>>
    ? ActionDefinition<ScopedTranslationKey<TranslationKeys<TTranslations>>> & {
        translations: TTranslations
      }
    : ActionDefinition,
): Action {
  // Validate required fields
  if (!config.description) {
    throw new Error('Action description is required')
  }

  // Validate description (can be string or function)
  if (typeof config.description !== 'string' && typeof config.description !== 'function') {
    throw new Error('Action description must be a string or function')
  }

  if (typeof config.run !== 'function') {
    throw new Error('Action run function is required')
  }

  // Validate name format if provided (alphanumeric, dash, underscore only)
  if (config.name && !/^[a-zA-Z0-9_-]+$/.test(config.name)) {
    throw new Error(
      'Action name must contain only alphanumeric characters, dashes, and underscores',
    )
  }

  return {
    meta: {
      name: config.name || '', // Empty string if not provided, will be derived from filename by loader
      description: config.description,
      category: config.category,
      tags: config.tags,
    },
    filePath: '', // Will be set by the loader
    run: config.run,
    translations: config.translations,
  }
}
