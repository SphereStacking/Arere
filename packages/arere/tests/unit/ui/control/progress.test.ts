/**
 * Progress control tests
 */

import { createProgressControl } from '@/presentation/ui/control/progress.js'
import type { VisualFeedback } from '@/presentation/ui/control/types.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('createProgressControl()', () => {
  let mockSetVisualFeedback: (
    feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback),
  ) => void
  let capturedFeedback: VisualFeedback | null = null

  // Helper to safely access progress properties
  const getProgress = () => {
    if (capturedFeedback && 'type' in capturedFeedback && capturedFeedback.type === 'progress') {
      return capturedFeedback.progress
    }
    return null
  }

  beforeEach(() => {
    vi.useFakeTimers()
    capturedFeedback = null
    mockSetVisualFeedback = vi.fn(
      (feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback)) => {
        if (typeof feedback === 'function') {
          // Handle updater function
          capturedFeedback = feedback(capturedFeedback || {})
        } else {
          capturedFeedback = feedback
        }
      },
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates progress control with default options', () => {
    const progress = createProgressControl({}, mockSetVisualFeedback)

    expect(progress).toHaveProperty('start')
    expect(progress).toHaveProperty('update')
    expect(progress).toHaveProperty('increment')
    expect(progress).toHaveProperty('stop')
    expect(progress).toHaveProperty('succeed')
    expect(progress).toHaveProperty('fail')
  })

  it('starts progress with default values', () => {
    const progress = createProgressControl({}, mockSetVisualFeedback)
    progress.start()

    expect(capturedFeedback).toEqual({
      type: 'progress',
      progress: {
        value: 0,
        total: 100,
        message: 'Processing...',
        status: 'running',
      },
    })
  })

  it('starts progress with custom options', () => {
    const progress = createProgressControl(
      { total: 50, value: 10, message: 'Downloading...' },
      mockSetVisualFeedback,
    )
    progress.start()

    expect(capturedFeedback).toEqual({
      type: 'progress',
      progress: {
        value: 10,
        total: 50,
        message: 'Downloading...',
        status: 'running',
      },
    })
  })

  it('updates progress value', () => {
    const progress = createProgressControl({ total: 100 }, mockSetVisualFeedback)
    progress.start()
    progress.update(50)

    expect(getProgress()?.value).toBe(50)
    expect(getProgress()?.total).toBe(100)
  })

  it('clamps progress value to total', () => {
    const progress = createProgressControl({ total: 100 }, mockSetVisualFeedback)
    progress.start()
    progress.update(150) // Over total

    expect(getProgress()?.value).toBe(100)
  })

  it('increments progress by 1 by default', () => {
    const progress = createProgressControl({ total: 100, value: 0 }, mockSetVisualFeedback)
    progress.start()

    progress.increment()
    expect(getProgress()?.value).toBe(1)

    progress.increment()
    expect(getProgress()?.value).toBe(2)
  })

  it('increments progress by custom delta', () => {
    const progress = createProgressControl({ total: 100, value: 0 }, mockSetVisualFeedback)
    progress.start()

    progress.increment(10)
    expect(getProgress()?.value).toBe(10)

    progress.increment(5)
    expect(getProgress()?.value).toBe(15)
  })

  it('clamps incremented value to total', () => {
    const progress = createProgressControl({ total: 10, value: 8 }, mockSetVisualFeedback)
    progress.start()

    progress.increment(5) // Would go to 13, but clamped to 10

    expect(getProgress()?.value).toBe(10)
  })

  it('stops progress', () => {
    const progress = createProgressControl({}, mockSetVisualFeedback)
    progress.start()
    progress.stop()

    expect(capturedFeedback).toEqual({})
  })

  it('marks progress as success', async () => {
    const progress = createProgressControl({ total: 100 }, mockSetVisualFeedback)
    progress.start()
    progress.succeed('Complete!')

    expect(getProgress()?.status).toBe('success')
    expect(getProgress()?.message).toBe('Complete!')
    expect(getProgress()?.value).toBe(100) // Automatically set to total

    // Should auto-clear after 1 second
    await vi.advanceTimersByTimeAsync(1000)
    expect(capturedFeedback).toEqual({})
  })

  it('marks progress as failed', async () => {
    const progress = createProgressControl({ total: 100 }, mockSetVisualFeedback)
    progress.start()
    progress.update(50)
    progress.fail('Failed!')

    expect(getProgress()?.status).toBe('error')
    expect(getProgress()?.message).toBe('Failed!')
    expect(getProgress()?.value).toBe(50) // Keeps current value

    // Should auto-clear after 1 second
    await vi.advanceTimersByTimeAsync(1000)
    expect(capturedFeedback).toEqual({})
  })

  it('uses previous message when succeed() without message', () => {
    const progress = createProgressControl({ message: 'Initial' }, mockSetVisualFeedback)
    progress.start()

    const initialMessage = getProgress()?.message

    progress.succeed()

    expect(getProgress()?.status).toBe('success')
    expect(getProgress()?.message).toBe(initialMessage)
  })

  it('uses previous message when fail() without message', () => {
    const progress = createProgressControl({ message: 'Initial' }, mockSetVisualFeedback)
    progress.start()

    const initialMessage = getProgress()?.message

    progress.fail()

    expect(getProgress()?.status).toBe('error')
    expect(getProgress()?.message).toBe(initialMessage)
  })

  it('handles sequential updates correctly', () => {
    const progress = createProgressControl({ total: 10 }, mockSetVisualFeedback)
    progress.start()

    for (let i = 1; i <= 10; i++) {
      progress.update(i)
      expect(getProgress()?.value).toBe(i)
    }
  })

  it('preserves message during updates', () => {
    const progress = createProgressControl({ message: 'Loading...' }, mockSetVisualFeedback)
    progress.start()
    progress.update(50)

    expect(getProgress()?.message).toBe('Loading...')
  })
})
