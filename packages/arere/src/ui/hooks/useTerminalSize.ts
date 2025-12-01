/**
 * Terminal size hook
 */

import { useEffect, useState } from 'react'

export interface TerminalSize {
  columns: number
  rows: number
}

/**
 * Hook to get terminal size and listen for resize events
 */
export const useTerminalSize = (): TerminalSize => {
  const [size, setSize] = useState<TerminalSize>({
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
      })
    }

    // Listen for SIGWINCH signal (terminal resize)
    process.stdout.on('resize', handleResize)

    return () => {
      process.stdout.off('resize', handleResize)
    }
  }, [])

  return size
}

/**
 * Check if terminal size is too small
 */
export const isTerminalTooSmall = (size: TerminalSize): boolean => {
  // Reduced minimum size for better compatibility with terminal multiplexers
  // (tmux, Zellij, etc.)
  const MIN_COLUMNS = 50
  const MIN_ROWS = 20

  return size.columns < MIN_COLUMNS || size.rows < MIN_ROWS
}
