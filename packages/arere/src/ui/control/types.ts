/**
 * TUI Control API type definitions
 *
 * Provides types for controlling terminal output timing,
 * user interaction pauses, and visual feedback.
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

/**
 * Terminal size
 */
export interface TerminalSize {
  /** Terminal width in columns */
  width: number
  /** Terminal height in rows */
  height: number
}

/**
 * Control API interface
 */
export interface ControlAPI {
  /**
   * Pause execution for specified milliseconds
   * @param ms - Delay in milliseconds
   */
  delay(ms: number): Promise<void>

  /**
   * Wait for user to press Enter
   * @param message - Optional message to display
   */
  waitForEnter(message?: string): Promise<void>

  /**
   * Wait for user to press a specific key or any key
   * @param options - Wait options
   * @returns The key that was pressed
   */
  waitForKey(options?: WaitForKeyOptions): Promise<string>

  /**
   * Create and control a spinner
   * @param options - Spinner options
   * @returns Spinner control object
   */
  spinner(options?: SpinnerOptions): SpinnerControl

  /**
   * Create and control a progress bar
   * @param options - Progress options
   * @returns Progress control object
   */
  progress(options?: ProgressOptions): ProgressControl

  /**
   * Check if terminal is interactive (TTY)
   * @returns True if interactive environment
   */
  isInteractive(): boolean

  /**
   * Get current terminal size
   * @returns Terminal dimensions
   */
  getTerminalSize(): TerminalSize
}
