/**
 * Select prompt
 */

import { renderPrompt } from './renderer'
import type { SelectChoice, SelectOptions } from './types'

/**
 * Normalize choices to SelectChoice format
 */
function normalizeChoices<T>(choices: T[] | SelectChoice<T>[]): SelectChoice<T>[] {
  if (choices.length === 0) {
    return []
  }

  // Check if first item is a SelectChoice object
  const firstItem = choices[0]
  if (
    typeof firstItem === 'object' &&
    firstItem !== null &&
    'label' in firstItem &&
    'value' in firstItem
  ) {
    return choices as SelectChoice<T>[]
  }

  // Convert simple values to SelectChoice format
  return (choices as T[]).map((choice) => ({
    label: String(choice),
    value: choice,
  }))
}

/**
 * Prompt user to select a single item from a list
 *
 * @param message - Prompt message
 * @param choices - List of choices (strings or SelectChoice objects)
 * @param options - Select options (e.g., defaultValue)
 * @returns Selected value
 *
 * @example
 * ```typescript
 * // Simple string choices
 * const color = await select('Choose a color:', ['red', 'blue', 'green'])
 *
 * // With default value
 * const color = await select('Choose a color:', ['red', 'blue', 'green'], {
 *   defaultValue: 'blue'
 * })
 *
 * // With i18n
 * const color = await select(t('ui:prompt.choose_color'), ['red', 'blue', 'green'])
 *
 * // SelectChoice objects
 * const option = await select('Choose an option:', [
 *   { label: 'Option A', value: 'a', description: 'First option' },
 *   { label: 'Option B', value: 'b', description: 'Second option' }
 * ])
 * ```
 */
export async function select<T>(
  message: string,
  choices: T[] | SelectChoice<T>[],
  options?: SelectOptions<T>,
): Promise<T> {
  if (choices.length === 0) {
    throw new Error('Select choices cannot be empty')
  }

  const normalizedChoices = normalizeChoices(choices)

  const result = await renderPrompt({
    type: 'select',
    message,
    choices: normalizedChoices as SelectChoice<unknown>[],
    options,
  })

  return result as T
}
