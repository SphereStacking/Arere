/**
 * TUI Control API type definitions
 *
 * Provides types for controlling terminal output timing,
 * user interaction pauses, and visual feedback.
 */

// Import and re-export control types from types/ to avoid circular dependencies
// These types are shared between domain (actions) and presentation (UI) layers
import type {
  ProgressControl,
  ProgressOptions,
  SpinnerControl,
  SpinnerOptions,
  VisualFeedback,
  WaitForKeyOptions,
} from '@/domain/types/control'

export type {
  WaitForKeyOptions,
  SpinnerControl,
  SpinnerOptions,
  ProgressControl,
  ProgressOptions,
  VisualFeedback,
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
