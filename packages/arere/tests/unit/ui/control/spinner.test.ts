/**
 * Spinner control tests
 */

import { createSpinnerControl } from '@/ui/control/spinner.js'
import type { VisualFeedback } from '@/ui/control/types.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('createSpinnerControl()', () => {
  let mockSetVisualFeedback: (
    feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback),
  ) => void
  let capturedFeedback: VisualFeedback | null = null

  // Helper to safely access spinner properties
  const getSpinner = () => {
    if (capturedFeedback && 'type' in capturedFeedback && capturedFeedback.type === 'spinner') {
      return capturedFeedback.spinner
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

  it('creates spinner control with default options', () => {
    const spinner = createSpinnerControl({}, mockSetVisualFeedback)

    expect(spinner).toHaveProperty('start')
    expect(spinner).toHaveProperty('stop')
    expect(spinner).toHaveProperty('succeed')
    expect(spinner).toHaveProperty('fail')
    expect(spinner).toHaveProperty('update')
  })

  it('starts spinner with default message', () => {
    const spinner = createSpinnerControl({}, mockSetVisualFeedback)
    spinner.start()

    expect(capturedFeedback).toEqual({
      type: 'spinner',
      spinner: {
        type: 'dots',
        message: 'Loading...',
        status: 'running',
      },
    })
  })

  it('starts spinner with custom options', () => {
    const spinner = createSpinnerControl(
      { type: 'line', message: 'Processing...' },
      mockSetVisualFeedback,
    )
    spinner.start()

    expect(capturedFeedback).toEqual({
      type: 'spinner',
      spinner: {
        type: 'line',
        message: 'Processing...',
        status: 'running',
      },
    })
  })

  it('updates spinner message', () => {
    const spinner = createSpinnerControl({}, mockSetVisualFeedback)
    spinner.start()
    spinner.update('New message')

    expect(getSpinner()?.message).toBe('New message')
    expect(getSpinner()?.status).toBe('running')
  })

  it('stops spinner', () => {
    const spinner = createSpinnerControl({}, mockSetVisualFeedback)
    spinner.start()
    spinner.stop()

    expect(capturedFeedback).toEqual({})
  })

  it('marks spinner as success', async () => {
    const spinner = createSpinnerControl({}, mockSetVisualFeedback)
    spinner.start()
    spinner.succeed('Done!')

    expect(getSpinner()?.status).toBe('success')
    expect(getSpinner()?.message).toBe('Done!')

    // Should auto-clear after 1 second
    await vi.advanceTimersByTimeAsync(1000)
    expect(capturedFeedback).toEqual({})
  })

  it('marks spinner as failed', async () => {
    const spinner = createSpinnerControl({}, mockSetVisualFeedback)
    spinner.start()
    spinner.fail('Error occurred')

    expect(getSpinner()?.status).toBe('error')
    expect(getSpinner()?.message).toBe('Error occurred')

    // Should auto-clear after 1 second
    await vi.advanceTimersByTimeAsync(1000)
    expect(capturedFeedback).toEqual({})
  })

  it('uses previous message when succeed() without message', () => {
    const spinner = createSpinnerControl({ message: 'Initial' }, mockSetVisualFeedback)
    spinner.start()

    // Capture the initial state
    const initialMessage = getSpinner()?.message

    spinner.succeed()

    expect(getSpinner()?.status).toBe('success')
    expect(getSpinner()?.message).toBe(initialMessage)
  })

  it('uses previous message when fail() without message', () => {
    const spinner = createSpinnerControl({ message: 'Initial' }, mockSetVisualFeedback)
    spinner.start()

    const initialMessage = getSpinner()?.message

    spinner.fail()

    expect(getSpinner()?.status).toBe('error')
    expect(getSpinner()?.message).toBe(initialMessage)
  })

  it('handles all spinner types', () => {
    const types: Array<'dots' | 'line' | 'arc'> = ['dots', 'line', 'arc']

    for (const type of types) {
      const spinner = createSpinnerControl({ type }, mockSetVisualFeedback)
      spinner.start()

      expect(getSpinner()?.type).toBe(type)
    }
  })
})
