/**
 * Text input prompt
 */

import { renderPrompt } from './renderer'
import type { TextOptions } from './types'

/**
 * Prompt user for text input
 *
 * @param message - Prompt message
 * @param options - Text input options
 * @returns Entered text
 *
 * @example
 * ```typescript
 * // Plain string
 * const name = await text('What is your name?')
 *
 * // With prefix/suffix
 * const pluginName = await text('Plugin name:', {
 *   prefix: 'arere-plugin-',
 *   placeholder: 'example',
 * })
 * // User types 'hello' → returns 'arere-plugin-hello'
 *
 * // With format
 * const slug = await text('URL slug:', {
 *   format: 'kebab-case',
 *   maxLength: 50,
 * })
 * // User types 'My Article' → returns 'my-article'
 *
 * // With pattern restriction
 * const version = await text('Version:', {
 *   pattern: /^[\d.]+$/,
 *   placeholder: '1.0.0',
 * })
 * // User can only type numbers and dots
 *
 * // With custom format function
 * const email = await text('Username:', {
 *   suffix: '@company.com',
 *   format: (value) => value.trim().toLowerCase(),
 * })
 * // User types '  John.Doe  ' → returns 'john.doe@company.com'
 * ```
 */
export async function text(message: string, options?: TextOptions): Promise<string> {
  const result = await renderPrompt({
    type: 'text',
    message,
    options,
  })

  return result as string
}
