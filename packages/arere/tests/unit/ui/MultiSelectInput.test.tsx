/**
 * Tests for MultiSelectInput component
 */

import { MultiSelectInput } from '@/ui/components/inputs/MultiSelectInput.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock useInput to capture the handler
let capturedHandler: ((input: string, key: any) => void) | null = null
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink')
  return {
    ...actual,
    useInput: (handler: (input: string, key: any) => void, options?: { isActive?: boolean }) => {
      if (options?.isActive !== false) {
        capturedHandler = handler
      } else {
        capturedHandler = null
      }
    },
  }
})

describe('MultiSelectInput', () => {
  const options = [
    { label: 'Feature A', value: 'a' },
    { label: 'Feature B', value: 'b' },
    { label: 'Feature C', value: 'c' },
  ]

  beforeEach(() => {
    capturedHandler = null
    vi.clearAllMocks()
  })

  it('should render with label', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    const { lastFrame } = render(
      <MultiSelectInput
        mode="standalone"
        label="Select features:"
        options={options}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('Select features')
  })

  it('should render all options', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    const { lastFrame } = render(
      <MultiSelectInput
        mode="standalone"
        label="Choose:"
        options={options}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('Feature A')
    expect(output).toContain('Feature B')
    expect(output).toContain('Feature C')
  })

  it('should show checkboxes for selection', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    const { lastFrame } = render(
      <MultiSelectInput
        mode="standalone"
        label="Select:"
        options={options}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    // Should show checkbox indicators
    expect(output).toMatch(/[\[\]◯●✓✗☐☑]/)
  })

  it('should show instructions', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    const { lastFrame } = render(
      <MultiSelectInput
        mode="standalone"
        label="Select:"
        options={options}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    // Should show instructions for multi-select (Space to toggle, Enter to submit, etc.)
    expect(output).toMatch(/Space|Enter|Esc/)
  })

  describe('Keyboard interactions', () => {
    it('should navigate right with right arrow', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <MultiSelectInput
          mode="standalone"
          label="Select:"
          options={options}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Navigate right
      capturedHandler?.('', { rightArrow: true })

      // Should not crash
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should navigate left with left arrow', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <MultiSelectInput
          mode="standalone"
          label="Select:"
          options={options}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Navigate left (should wrap to last)
      capturedHandler?.('', { leftArrow: true })

      // Should not crash
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should toggle selection with Space', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <MultiSelectInput
          mode="standalone"
          label="Select:"
          options={options}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Toggle selection with Space
      capturedHandler?.(' ', {})

      // Should not crash
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should submit with Enter', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <MultiSelectInput
          mode="standalone"
          label="Select:"
          options={options}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Press Enter to submit
      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith([])
    })

    it('should call onCancel when Escape is pressed', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <MultiSelectInput
          mode="standalone"
          label="Select:"
          options={options}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Press Escape
      capturedHandler?.('', { escape: true })

      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should toggle and submit selected items', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <MultiSelectInput
          mode="standalone"
          label="Select:"
          options={options}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Select first item
      capturedHandler?.(' ', {})

      // Navigate right
      capturedHandler?.('', { rightArrow: true })

      // Select second item
      capturedHandler?.(' ', {})

      // Submit
      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith(['a', 'b'])
    })
  })
})
