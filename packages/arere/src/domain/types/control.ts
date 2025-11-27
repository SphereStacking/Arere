/**
 * Control API type definitions
 *
 * These types are used by both the domain layer (actions) and presentation layer (UI).
 * They are placed in the types/ directory to avoid circular dependencies.
 */

/**
 * Options for waitForKey
 */
export interface WaitForKeyOptions {
  /** Specific keys to accept (if omitted, any key is accepted) */
  keys?: string[]
  /** Message to display while waiting */
  message?: string
  /** Timeout in milliseconds */
  timeout?: number
  /** Case-insensitive key matching */
  caseInsensitive?: boolean
}

/**
 * Spinner control interface
 */
export interface SpinnerControl {
  /** Start the spinner */
  start: () => void
  /** Stop the spinner */
  stop: () => void
  /** Mark as success and stop */
  succeed: (message?: string) => void
  /** Mark as failure and stop */
  fail: (message?: string) => void
  /** Update spinner message */
  update: (message: string) => void
}

/**
 * Spinner options
 */
export interface SpinnerOptions {
  /** Spinner type (default: 'dots') */
  type?: 'dots' | 'line' | 'arc'
  /** Initial message */
  message?: string
}

/**
 * Progress control interface
 */
export interface ProgressControl {
  /** Start the progress bar */
  start: () => void
  /** Update progress value */
  update: (value: number) => void
  /** Increment progress by delta */
  increment: (delta?: number) => void
  /** Stop the progress bar */
  stop: () => void
  /** Mark as success and stop */
  succeed: (message?: string) => void
  /** Mark as failure and stop */
  fail: (message?: string) => void
}

/**
 * Progress options
 */
export interface ProgressOptions {
  /** Total value (default: 100) */
  total?: number
  /** Initial value (default: 0) */
  value?: number
  /** Initial message */
  message?: string
}

/**
 * Visual feedback state (internal use for React state)
 *
 * This type is used by actions to communicate with the UI layer
 * for displaying spinners and progress bars.
 */
export type VisualFeedback =
  | {
      /** No visual feedback */
      type?: never
    }
  | {
      /** Spinner feedback */
      type: 'spinner'
      spinner: {
        type: 'dots' | 'line' | 'arc'
        message: string
        status: 'running' | 'success' | 'error'
      }
    }
  | {
      /** Progress feedback */
      type: 'progress'
      progress: {
        value: number
        total: number
        message: string
        status?: 'running' | 'success' | 'error'
      }
    }
