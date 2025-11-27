/**
 * Tests for EmptyState component
 */

import { EmptyState } from '@/presentation/ui/components/EmptyState.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it } from 'vitest'

describe('EmptyState', () => {
  it('should render empty state message', () => {
    const { lastFrame } = render(<EmptyState />)

    expect(lastFrame()).toContain('アクションが見つかりません')
  })

  it('should show action locations', () => {
    const { lastFrame } = render(<EmptyState />)

    const frame = lastFrame()
    expect(frame).toContain('./.arere/')
    expect(frame).toContain('~/.arere/')
  })
})
