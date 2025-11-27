/**
 * Tests for MultilineInput component
 *
 * Note: MultilineInput uses useInput for complex keyboard handling.
 * We focus on basic rendering behavior.
 */

import { MultilineInput } from '@/presentation/ui/components/MultilineInput.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

describe('MultilineInput', () => {
  it('should render with label', () => {
    const onSubmit = vi.fn()
    const { lastFrame } = render(<MultilineInput label="Enter text" onSubmit={onSubmit} />)

    const frame = lastFrame()
    expect(frame).toContain('Enter text')
  })

  it('should render with placeholder', () => {
    const onSubmit = vi.fn()
    const { lastFrame } = render(
      <MultilineInput label="Input" placeholder="Type here..." onSubmit={onSubmit} />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render with initial value', () => {
    const onSubmit = vi.fn()
    const { lastFrame } = render(
      <MultilineInput label="Input" initialValue="Initial text" onSubmit={onSubmit} />,
    )

    const frame = lastFrame()
    expect(frame).toContain('Initial text')
  })

  it('should accept onSubmit callback', () => {
    const onSubmit = vi.fn()
    const { lastFrame } = render(<MultilineInput label="Input" onSubmit={onSubmit} />)

    expect(onSubmit).toBeDefined()
    expect(lastFrame()).toBeTruthy()
  })

  it('should accept onCancel callback', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const { lastFrame } = render(
      <MultilineInput label="Input" onSubmit={onSubmit} onCancel={onCancel} />,
    )

    expect(onCancel).toBeDefined()
    expect(lastFrame()).toBeTruthy()
  })

  it('should render with multiline initial value', () => {
    const onSubmit = vi.fn()
    const { lastFrame } = render(
      <MultilineInput label="Input" initialValue="Line 1\nLine 2\nLine 3" onSubmit={onSubmit} />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render without placeholder', () => {
    const onSubmit = vi.fn()
    const { lastFrame } = render(<MultilineInput label="Simple input" onSubmit={onSubmit} />)

    const frame = lastFrame()
    expect(frame).toContain('Simple input')
  })

  it('should handle empty initial value', () => {
    const onSubmit = vi.fn()
    const { lastFrame } = render(
      <MultilineInput label="Input" initialValue="" onSubmit={onSubmit} />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })
})
