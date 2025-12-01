/**
 * Tests for OverrideIndicator component
 */

import { OverrideIndicator } from '@/ui/screens/settings/components/OverrideIndicator.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it } from 'vitest'

describe('OverrideIndicator', () => {
  it('should render warning when isOverridden is true', () => {
    const { lastFrame } = render(<OverrideIndicator isOverridden={true} />)
    const output = lastFrame() || ''

    // Should contain warning symbol
    expect(output).toContain('⚠')
    // Should have some content (language-agnostic)
    expect(output.trim().length).toBeGreaterThan(0)
  })

  it('should render nothing when isOverridden is false', () => {
    const { lastFrame } = render(<OverrideIndicator isOverridden={false} />)
    const output = lastFrame() || ''

    expect(output).toBe('')
  })
})
