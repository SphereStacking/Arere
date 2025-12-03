/**
 * Argument value validator and type converter
 */

import type { SelectChoice } from '@/action/types'

/**
 * Validation error with details
 */
export class ArgValidationError extends Error {
  constructor(
    public readonly argName: string,
    public readonly value: string,
    public readonly reason: string,
    public readonly validOptions?: string[],
  ) {
    const optionsHint = validOptions ? ` Valid: ${validOptions.join(', ')}` : ''
    super(`Invalid value '${value}' for --${argName}. ${reason}${optionsHint}`)
    this.name = 'ArgValidationError'
  }
}

/**
 * Convert string argument to number
 *
 * @param value - String value from CLI
 * @param argName - Argument name for error messages
 * @param options - Optional min/max constraints
 * @returns Parsed number
 * @throws ArgValidationError if value is not a valid number
 */
export function convertToNumber(
  value: string,
  argName: string,
  options?: { min?: number; max?: number },
): number {
  // Empty string should be invalid
  if (value === '' || value.trim() === '') {
    throw new ArgValidationError(argName, value, 'Expected a number.')
  }

  const num = Number(value)

  if (Number.isNaN(num)) {
    throw new ArgValidationError(argName, value, 'Expected a number.')
  }

  if (options?.min !== undefined && num < options.min) {
    throw new ArgValidationError(argName, value, `Must be at least ${options.min}.`)
  }

  if (options?.max !== undefined && num > options.max) {
    throw new ArgValidationError(argName, value, `Must be at most ${options.max}.`)
  }

  return num
}

/**
 * Convert string argument to boolean
 *
 * @param value - String value from CLI (or undefined for flags)
 * @param argName - Argument name for error messages
 * @returns Parsed boolean
 */
export function convertToBoolean(value: string | undefined, argName: string): boolean {
  if (value === undefined || value === 'true' || value === '1' || value === 'yes') {
    return true
  }
  if (value === 'false' || value === '0' || value === 'no') {
    return false
  }
  throw new ArgValidationError(argName, value ?? '', 'Expected a boolean (true/false).')
}

/**
 * Validate and convert string argument to select value
 *
 * @param value - String value from CLI
 * @param choices - Available choices
 * @param argName - Argument name for error messages
 * @returns The matching choice value
 * @throws ArgValidationError if value doesn't match any choice
 */
export function convertToSelectValue<T>(
  value: string,
  choices: T[] | SelectChoice<T>[],
  argName: string,
): T {
  // Normalize choices to SelectChoice format
  const normalizedChoices: SelectChoice<T>[] = choices.map((choice) => {
    if (typeof choice === 'object' && choice !== null && 'value' in choice) {
      return choice as SelectChoice<T>
    }
    return { label: String(choice), value: choice as T }
  })

  // Find matching choice by label or value
  const match = normalizedChoices.find(
    (choice) =>
      choice.label === value ||
      String(choice.value) === value ||
      (typeof choice.value === 'string' && choice.value === value),
  )

  if (!match) {
    const validOptions = normalizedChoices.map((c) => c.label)
    throw new ArgValidationError(argName, value, 'Invalid option.', validOptions)
  }

  return match.value
}

/**
 * Convert comma-separated string to array for multiSelect
 *
 * @param value - Comma-separated string from CLI
 * @param choices - Available choices
 * @param argName - Argument name for error messages
 * @returns Array of matching choice values
 * @throws ArgValidationError if any value doesn't match choices
 */
export function convertToMultiSelectValue<T>(
  value: string,
  choices: T[] | SelectChoice<T>[],
  argName: string,
): T[] {
  const values = value.split(',').map((v) => v.trim())
  return values.map((v) => convertToSelectValue(v, choices, argName))
}

/**
 * Validate text value
 *
 * @param value - String value from CLI
 * @param argName - Argument name for error messages
 * @param options - Optional validation options
 * @returns Validated string
 */
export function validateTextValue(
  value: string,
  argName: string,
  options?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
  },
): string {
  if (options?.minLength !== undefined && value.length < options.minLength) {
    throw new ArgValidationError(
      argName,
      value,
      `Must be at least ${options.minLength} characters.`,
    )
  }

  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    throw new ArgValidationError(argName, value, `Must be at most ${options.maxLength} characters.`)
  }

  if (options?.pattern && !options.pattern.test(value)) {
    throw new ArgValidationError(argName, value, 'Does not match required pattern.')
  }

  return value
}
