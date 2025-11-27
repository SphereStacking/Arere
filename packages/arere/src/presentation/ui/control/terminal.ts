/**
 * Terminal utility functions for environment detection
 */

import type { TerminalSize } from './types'

/**
 * Check if the current environment is interactive
 *
 * Detects:
 * - TTY availability (process.stdout.isTTY)
 * - CI environment (process.env.CI)
 * - NO_COLOR environment variable
 *
 * @returns True if terminal is interactive
 */
export function isInteractive(): boolean {
  // Not a TTY - pipes, redirects, etc.
  if (!process.stdout.isTTY) {
    return false
  }

  // CI environment - GitHub Actions, Travis, CircleCI, etc.
  if (process.env.CI === 'true' || process.env.CI === '1') {
    return false
  }

  // NO_COLOR convention - https://no-color.org/
  if (process.env.NO_COLOR !== undefined) {
    return false
  }

  // TERM=dumb - minimal terminal capability
  if (process.env.TERM === 'dumb') {
    return false
  }

  return true
}

/**
 * Get current terminal size
 *
 * @returns Terminal dimensions (width and height in characters)
 */
export function getTerminalSize(): TerminalSize {
  // Default fallback size
  const defaultSize: TerminalSize = {
    width: 80,
    height: 24,
  }

  // No stdout (shouldn't happen in normal Node.js environment)
  if (!process.stdout) {
    return defaultSize
  }

  // Get columns and rows from stdout
  const width = process.stdout.columns
  const height = process.stdout.rows

  // Validate dimensions
  if (
    typeof width !== 'number' ||
    typeof height !== 'number' ||
    width <= 0 ||
    height <= 0 ||
    Number.isNaN(width) ||
    Number.isNaN(height)
  ) {
    return defaultSize
  }

  return { width, height }
}

