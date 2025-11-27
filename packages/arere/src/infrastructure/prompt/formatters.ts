/**
 * Text format transformers
 */

/**
 * Format preset type
 */
export type FormatPreset = 'lowercase' | 'uppercase' | 'trim' | 'kebab-case'

/**
 * Format function type
 */
export type FormatFunction = (value: string) => string

/**
 * Apply format transformation to value
 */
export function applyFormat(value: string, format: FormatPreset | FormatFunction): string {
  if (typeof format === 'function') {
    return format(value)
  }

  switch (format) {
    case 'lowercase':
      return value.toLowerCase()

    case 'uppercase':
      return value.toUpperCase()

    case 'trim':
      return value.trim()

    case 'kebab-case':
      return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

    default:
      return value
  }
}
