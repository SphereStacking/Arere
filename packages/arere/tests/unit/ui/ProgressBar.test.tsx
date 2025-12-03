/**
 * Tests for ProgressBar component
 */

import { ProgressBar } from '@/ui/components/ProgressBar.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it } from 'vitest'

describe('ProgressBar', () => {
  it('should render progress bar with percent', () => {
    const { lastFrame } = render(<ProgressBar percent={50} />)

    expect(lastFrame()).toContain('50%')
    expect(lastFrame()).toContain('[')
    expect(lastFrame()).toContain(']')
  })

  it('should render filled and empty bars', () => {
    const { lastFrame } = render(<ProgressBar percent={25} width={20} />)

    const frame = lastFrame()
    expect(frame).toContain('█') // Filled part
    expect(frame).toContain('░') // Empty part
  })

  it('should render message when provided', () => {
    const { lastFrame } = render(<ProgressBar percent={75} message="Processing..." />)

    expect(lastFrame()).toContain('Processing...')
  })

  it('should clamp percent to 0-100', () => {
    const { lastFrame: lastFrame1 } = render(<ProgressBar percent={-10} />)
    expect(lastFrame1()).toContain('0%')

    const { lastFrame: lastFrame2 } = render(<ProgressBar percent={150} />)
    expect(lastFrame2()).toContain('100%')
  })
})
