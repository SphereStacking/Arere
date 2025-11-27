/**
 * Password input prompt
 */

import type { PasswordOptions } from '@/domain/action/types'
import { renderPrompt } from './renderer'

/**
 * Prompt user for password input (masked)
 *
 * @param message - Prompt message
 * @param options - Password input options
 * @returns Entered password
 *
 * @example
 * ```typescript
 * // Plain password
 * const password = await password('Enter password:')
 *
 * // With minimum length validation
 * const password = await password('Create password:', {
 *   minLength: 8,
 *   validate: (value) => {
 *     if (value.length < 8) {
 *       return 'Password must be at least 8 characters'
 *     }
 *     if (!/[A-Z]/.test(value)) {
 *       return 'Password must contain uppercase letter'
 *     }
 *     return true
 *   }
 * })
 * ```
 */
export async function password(message: string, options?: PasswordOptions): Promise<string> {
  const result = await renderPrompt({
    type: 'password',
    message,
    options,
  })

  return result as string
}
