/**
 * Form prompt implementation
 */

import { renderPrompt } from '../renderer'
import type { FormFields, FormPage, FormResult, StepFormOptions } from './types'

/**
 * Display a form with multiple fields
 *
 * @param formOrSteps - Form definition or array of forms (step form)
 * @param options - Step form options (only used when formOrSteps is an array)
 * @returns Promise resolving to form result
 *
 * @example Single form
 * ```typescript
 * const result = await form({
 *   title: 'User Registration',
 *   fields: {
 *     name: { type: 'text', message: 'Name' },
 *     age: { type: 'number', message: 'Age' },
 *   },
 * })
 * ```
 *
 * @example Step form
 * ```typescript
 * const result = await form([
 *   { title: 'Step 1', fields: { name: { type: 'text', message: 'Name' } } },
 *   { title: 'Step 2', fields: { email: { type: 'text', message: 'Email' } } },
 * ])
 * // result: { name: string, email: string }
 * ```
 */
export async function form<T extends FormFields>(
  formOrSteps: FormPage<T> | FormPage<FormFields>[],
  options?: StepFormOptions<FormFields[]>,
): Promise<FormResult<T> | Record<string, unknown>> {
  // Step form: array of FormPages
  if (Array.isArray(formOrSteps)) {
    if (formOrSteps.length === 0) {
      throw new Error('Step form must have at least one step.')
    }

    // Render the step form prompt
    const result = await renderPrompt({
      type: 'stepForm',
      steps: formOrSteps,
      options,
    })

    return result as Record<string, unknown>
  }

  // Single form: FormPage object
  const result = await renderPrompt({
    type: 'form',
    form: formOrSteps as FormPage<FormFields>,
  })

  return result as FormResult<T>
}
