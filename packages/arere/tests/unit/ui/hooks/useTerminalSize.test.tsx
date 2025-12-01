/**
 * Tests for useTerminalSize hook
 */

import { isTerminalTooSmall, useTerminalSize } from '@/ui/hooks/useTerminalSize.js'
import { Text } from 'ink'
import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it } from 'vitest'

// Test component that uses the hook
const TestComponent: React.FC = () => {
  const size = useTerminalSize()
  const tooSmall = isTerminalTooSmall(size)
  return (
    <Text>
      {size.columns}x{size.rows} {tooSmall ? 'too small' : 'ok'}
    </Text>
  )
}

describe('useTerminalSize', () => {
  it('should return terminal size', () => {
    const { lastFrame } = render(<TestComponent />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
    // Should contain dimensions
    expect(frame).toMatch(/\d+x\d+/)
  })

  it('should detect if terminal is too small', () => {
    const { lastFrame } = render(<TestComponent />)

    const frame = lastFrame()
    expect(frame).toContain('ok') // or 'too small' depending on terminal
  })
})

describe('isTerminalTooSmall', () => {
  it('should return false for large terminal', () => {
    expect(isTerminalTooSmall({ columns: 100, rows: 40 })).toBe(false)
  })

  it('should return true for narrow terminal', () => {
    expect(isTerminalTooSmall({ columns: 40, rows: 30 })).toBe(true)
  })

  it('should return true for short terminal', () => {
    expect(isTerminalTooSmall({ columns: 80, rows: 15 })).toBe(true)
  })

  it('should return false for minimum acceptable size', () => {
    expect(isTerminalTooSmall({ columns: 50, rows: 20 })).toBe(false)
  })

  it('should return true for below minimum size', () => {
    expect(isTerminalTooSmall({ columns: 49, rows: 19 })).toBe(true)
  })
})
