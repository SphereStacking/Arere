/**
 * TUI Control API
 *
 * Provides fine-grained control over terminal output timing,
 * user interaction pauses, visual feedback, and screen management.
 */

// Type exports
export type {
  ControlAPI,
  WaitForKeyOptions,
  SpinnerControl,
  SpinnerOptions,
  ProgressControl,
  ProgressOptions,
  TerminalSize,
  VisualFeedback,
} from './types'

// Terminal utilities
export { isInteractive, getTerminalSize } from './terminal'

// Timing controls
export {
  delay,
  waitForEnter,
  waitForKey,
} from './timing'

// Visual feedback controls
export { createSpinnerControl } from './spinner'
export { createProgressControl } from './progress'
