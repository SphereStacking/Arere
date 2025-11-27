/**
 * Confirm prompt
 */

import { renderPrompt } from './renderer'
import type { ConfirmOptions } from './types'

/**
 * Prompt user for yes/no confirmation
 *
 * @param message - Prompt message
 * @param options - Confirm options (e.g., defaultValue)
 * @returns true for yes, false for no
 *
 * @example
 * ```typescript
 * // Plain string
 * const shouldContinue = await confirm('Do you want to continue?')
 *
 * // With default value
 * const shouldDelete = await confirm('Delete this file?', { defaultValue: false })
 *
 * // With i18n
 * const shouldDelete = await confirm(t('ui:prompt.confirm_delete'), { defaultValue: false })
 * ```
 */
export async function confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
  const result = await renderPrompt({
    type: 'confirm',
    message,
    options,
  })

  return result as boolean
}
