/**
 * Number input prompt
 */

import type { NumberOptions } from '@/action/types'
import { renderPrompt } from './renderer'

/**
 * Prompt user for number input
 *
 * @param message - Prompt message
 * @param options - Number input options
 * @returns Entered number
 *
 * @example
 * ```typescript
 * // Plain number
 * const age = await number('How old are you?')
 *
 * // With min/max validation
 * const port = await number('Port number:', {
 *   defaultValue: 3000,
 *   min: 1024,
 *   max: 65535,
 *   validate: (value) => {
 *     if (value < 1024) {
 *       return 'Port must be >= 1024'
 *     }
 *     return true
 *   }
 * })
 * ```
 */
export async function number(message: string, options?: NumberOptions): Promise<number> {
  const result = await renderPrompt({
    type: 'number',
    message,
    options,
  })

  return result as number
}
