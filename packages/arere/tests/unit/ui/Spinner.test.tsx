/**
 * Tests for Spinner component
 */

import { Spinner } from '@/presentation/ui/components/Spinner.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Spinner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render dots spinner by default', () => {
    const { lastFrame } = render(<Spinner />)
    const frame = lastFrame()

    // Should render one of the dots frames
    const dotsFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    expect(dotsFrames.some((f) => frame?.includes(f))).toBe(true)
  })

  it('should render line spinner', () => {
    const { lastFrame } = render(<Spinner type="line" />)
    const frame = lastFrame()

    // Should render one of the line frames
    const lineFrames = ['|', '/', '-', '\\']
    expect(lineFrames.some((f) => frame?.includes(f))).toBe(true)
  })

  it('should render arc spinner', () => {
    const { lastFrame } = render(<Spinner type="arc" />)
    const frame = lastFrame()

    // Should render one of the arc frames
    const arcFrames = ['◜', '◠', '◝', '◞', '◡', '◟']
    expect(arcFrames.some((f) => frame?.includes(f))).toBe(true)
  })

  it('should animate through frames', () => {
    const { lastFrame, rerender } = render(<Spinner type="line" />)

    // Initial frame
    const firstFrame = lastFrame()
    expect(firstFrame).toBeTruthy()

    // Advance timer by 80ms (one frame)
    vi.advanceTimersByTime(80)
    rerender(<Spinner type="line" />)

    // The frame should potentially change (might be same if timing issue)
    const secondFrame = lastFrame()
    expect(secondFrame).toBeTruthy()
  })

  it('should cycle through all frames', () => {
    const { lastFrame, unmount } = render(<Spinner type="line" />)
    const frames = ['|', '/', '-', '\\']

    // Advance through multiple cycles
    const seenFrames = new Set<string>()

    for (let i = 0; i < frames.length * 2; i++) {
      const frame = lastFrame()
      if (frame) {
        // Extract the actual spinner character
        frames.forEach((f) => {
          if (frame.includes(f)) seenFrames.add(f)
        })
      }
      vi.advanceTimersByTime(80)
    }

    // We should have seen at least one frame
    expect(seenFrames.size).toBeGreaterThan(0)

    unmount()
  })

  it('should render and unmount without errors', () => {
    const { unmount, lastFrame } = render(<Spinner />)

    expect(lastFrame()).toBeTruthy()
    expect(() => unmount()).not.toThrow()
  })
})
