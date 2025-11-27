/**
 * Multi-select prompt
 */

import { renderPrompt } from './renderer'
import type { MultiSelectOptions, SelectChoice } from './types'

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
 * Prompt user to select multiple items from a list
 *
 * @param message - Prompt message
 * @param choices - List of choices (strings or SelectChoice objects)
 * @param options - MultiSelect options (e.g., defaultValue, min, max)
 * @returns Array of selected values
 *
 * @example
 * ```typescript
 * // Simple string choices
 * const colors = await multiSelect('Choose colors:', ['red', 'blue', 'green'])
 *
 * // With min/max selection
 * const colors = await multiSelect('Choose 2-3 colors:', ['red', 'blue', 'green', 'yellow'], {
 *   min: 2,
 *   max: 3,
 *   defaultValue: ['red', 'blue']
 * })
 *
 * // With i18n
 * const colors = await multiSelect(t('ui:prompt.choose_colors'), ['red', 'blue', 'green'])
 *
 * // SelectChoice objects
 * const options = await multiSelect('Choose options:', [
 *   { label: 'Option A', value: 'a', description: 'First option' },
 *   { label: 'Option B', value: 'b', description: 'Second option' },
 *   { label: 'Option C', value: 'c', description: 'Third option' }
 * ])
 * ```
 */
export async function multiSelect<T>(
  message: string,
  choices: T[] | SelectChoice<T>[],
  options?: MultiSelectOptions<T>,
): Promise<T[]> {
  if (choices.length === 0) {
    throw new Error('MultiSelect choices cannot be empty')
  }

  const normalizedChoices = normalizeChoices(choices)

  const result = await renderPrompt({
    type: 'multiSelect',
    message,
    choices: normalizedChoices as SelectChoice<unknown>[],
    options,
  })

  return result as T[]
}
