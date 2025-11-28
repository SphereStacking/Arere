/**
 * Form Prompt API Types
 *
 * Defines types for multi-field form prompts.
 */

import type {
  ConfirmOptions,
  MultiSelectOptions,
  NumberOptions,
  PasswordOptions,
  SelectChoice,
  SelectOptions,
  TextOptions,
} from '@/domain/action/types'

// =============================================================================
// FormFieldBase - Common properties for all form fields
// =============================================================================

/**
 * Base interface for all form fields
 *
 * @template T - The type of value this field produces
 */
export interface FormFieldBase<T = unknown> {
  /** Field label */
  message: string
  /** Field description (displayed below the label) */
  description?: string
  /** Whether the field is required (default: true) */
  required?: boolean
  /**
   * Field-level validation
   * Can reference other field values via ctx.values
   *
   * @param value - Current field value
   * @param ctx - Context containing other field values
   * @returns true if valid, or error message string
   */
  validate?: (value: T, ctx: { values: Record<string, unknown> }) => boolean | string
}

// =============================================================================
// Form Field Types - Each extends FormFieldBase and relevant Options
// =============================================================================

/**
 * Text input field
 */
export interface TextFormField extends FormFieldBase<string>, Omit<TextOptions, 'validate'> {
  type: 'text'
}

/**
 * Number input field
 */
export interface NumberFormField extends FormFieldBase<number>, Omit<NumberOptions, 'validate'> {
  type: 'number'
}

/**
 * Password input field
 */
export interface PasswordFormField
  extends FormFieldBase<string>,
    Omit<PasswordOptions, 'validate'> {
  type: 'password'
}

/**
 * Single select field
 */
export interface SelectFormField<T = unknown>
  extends FormFieldBase<T>,
    Omit<SelectOptions<T>, 'validate'> {
  type: 'select'
  /** Available choices */
  choices: T[] | SelectChoice<T>[]
  /** Display layout (default: 'column') */
  layout?: 'column' | 'row'
}

/**
 * Confirm (yes/no) field
 */
export interface ConfirmFormField extends FormFieldBase<boolean>, Omit<ConfirmOptions, 'validate'> {
  type: 'confirm'
}

/**
 * Multi-select field
 */
export interface MultiSelectFormField<T = unknown>
  extends FormFieldBase<T[]>,
    Omit<MultiSelectOptions<T>, 'validate'> {
  type: 'multiSelect'
  /** Available choices */
  choices: T[] | SelectChoice<T>[]
  /** Display layout (default: 'column') */
  layout?: 'column' | 'row'
}

// =============================================================================
// FormField Union Type
// =============================================================================

/**
 * Union of all form field types
 */
export type FormField<T = unknown> =
  | TextFormField
  | NumberFormField
  | PasswordFormField
  | SelectFormField<T>
  | ConfirmFormField
  | MultiSelectFormField<T>

/**
 * Form fields definition (key-value object)
 */
export type FormFields = Record<string, FormField>

// =============================================================================
// FormPage - A page/screen of form fields
// =============================================================================

/**
 * Form page definition
 *
 * @template T - The form fields type
 */
export interface FormPage<T extends FormFields = FormFields> {
  /** Page title */
  title?: string
  /** Page description (displayed below the title) */
  description?: string
  /** Field definitions */
  fields: T
  /** Submit button label */
  submitLabel?: string
  /** Cancel button label */
  cancelLabel?: string
  /**
   * Form-level validation (for cross-field validation)
   *
   * @param values - All field values
   * @returns true if valid, or error message string
   */
  validate?: (values: FormResult<T>) => boolean | string
}

// =============================================================================
// FormResult - Type-safe result from form submission
// =============================================================================

/**
 * Extract result type from form fields
 *
 * Maps each field to its value type based on field type
 */
export type FormResult<T extends FormFields> = {
  [K in keyof T]: T[K] extends TextFormField
    ? string
    : T[K] extends NumberFormField
      ? number
      : T[K] extends PasswordFormField
        ? string
        : T[K] extends SelectFormField<infer U>
          ? U
          : T[K] extends ConfirmFormField
            ? boolean
            : T[K] extends MultiSelectFormField<infer U>
              ? U[]
              : never
}

// =============================================================================
// Step Form Types (Phase 78)
// =============================================================================

/**
 * Utility type for merging multiple FormResults
 * Used by step forms
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

/**
 * Merged result from step forms
 * Combines all field results from multiple FormPages into a single object
 */
export type MergedFormResult<T extends FormFields[]> = UnionToIntersection<FormResult<T[number]>>

/**
 * Step form options
 *
 * @template T - Array of form fields from each step
 */
export interface StepFormOptions<T extends FormFields[] = FormFields[]> {
  /**
   * Cross-step validation (runs on final submit)
   * Can access all values from all steps
   *
   * @param values - Merged values from all steps
   * @returns true if valid, or error message string
   */
  validate?: (values: MergedFormResult<T>) => boolean | string
}

/**
 * Step form definition
 * Array of FormPages with optional cross-step options
 */
export interface StepFormDefinition<T extends FormFields[] = FormFields[]> {
  /** Array of form pages (steps) */
  steps: { [K in keyof T]: FormPage<T[K]> }
  /** Step form options */
  options?: StepFormOptions<T>
}
