/**
 * Timing control functions for pausing and waiting
 */

import type { WaitForKeyOptions } from './types'

/**
 * Delay execution for specified milliseconds
 *
 * @param ms - Delay in milliseconds (must be non-negative)
 * @throws {Error} If ms is negative
 */
export async function delay(ms: number): Promise<void> {
  if (ms < 0) {
    throw new Error('Delay duration must be non-negative')
  }

  // Skip delays in test environment
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return
  }

  // Warn for very long delays (> 30 seconds)
  if (ms > 30000) {
    console.warn(`⚠️  Long delay detected: ${ms}ms (${ms / 1000}s)`)
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Wait for Enter key press
 *
 * Note: Actual implementation requires integration with Ink's useInput hook
 * This is a placeholder that will be replaced with proper implementation
 * in the action executor context.
 *
 * @param message - Optional message to display
 */
export async function waitForEnter(message?: string): Promise<void> {
  // This function will be overridden in ActionContext
  // with actual implementation that uses Ink's useInput
  throw new Error(
    'waitForEnter() must be called within an action execution context. ' +
      'This function requires Ink rendering context to handle keyboard input.',
  )
}

/**
 * Wait for specific key press or any key
 *
 * Note: Actual implementation requires integration with Ink's useInput hook
 * This is a placeholder that will be replaced with proper implementation
 * in the action executor context.
 *
 * @param options - Wait options
 * @returns The key that was pressed
 */
export async function waitForKey(options?: WaitForKeyOptions): Promise<string> {
  // This function will be overridden in ActionContext
  // with actual implementation that uses Ink's useInput
  throw new Error(
    'waitForKey() must be called within an action execution context. ' +
      'This function requires Ink rendering context to handle keyboard input.',
  )
}

