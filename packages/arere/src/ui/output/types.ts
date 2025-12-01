/**
 * Output types for rendering messages in the UI
 */

/**
 * Output message type
 */
export type OutputMessage = {
  type:
    | 'log'
    | 'success'
    | 'error'
    | 'warn'
    | 'info'
    | 'newline'
    | 'code'
    | 'section'
    | 'list'
    | 'keyValue'
    | 'table'
    | 'json'
    | 'separator'
    | 'step'
  content: string | string[] | Record<string, unknown> | Record<string, unknown>[] | unknown
  timestamp: number
  meta?: {
    indent?: number // For json
    char?: string // For separator
    length?: number // For separator
    number?: number // For step
  }
}

/**
 * Output API interface
 * Provides methods for actions to output formatted messages
 */
export interface OutputAPI {
  /**
   * Basic log message
   */
  log(...args: unknown[]): void

  /**
   * Success message (green with ✔)
   */
  success(message: string): void

  /**
   * Error message (red with ✖)
   */
  error(message: string): void

  /**
   * Warning message (yellow with ⚠)
   */
  warn(message: string): void

  /**
   * Info message (cyan with ℹ)
   */
  info(message: string): void

  /**
   * Insert empty line
   */
  newline(): void

  /**
   * Code snippet display
   */
  code(snippet: string): void

  /**
   * Section header with separator
   */
  section(title: string): void

  /**
   * Bullet list
   */
  list(items: string[]): void

  /**
   * Key-value pairs
   */
  keyValue(data: Record<string, unknown>): void

  /**
   * Table display
   */
  table(data: Record<string, unknown>[]): void

  /**
   * JSON formatted output
   */
  json(data: unknown, indent?: number): void

  /**
   * Horizontal separator line
   */
  separator(char?: string, length?: number): void

  /**
   * Numbered step
   */
  step(number: number, description: string): void
}
