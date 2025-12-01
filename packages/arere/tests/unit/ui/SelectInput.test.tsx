/**
 * Tests for SelectInput component
 */

import type { ArereConfig } from '@/config/schema.js'
import { defaultKeyBindings } from '@/ui/keybindings/index.js'
import { SelectInput } from '@/ui/components/inputs/SelectInput.js'
import { AppContext } from '@/ui/AppContext.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Test wrapper with AppContext
function TestWrapper({ children }: { children: React.ReactNode }) {
  const config = { theme: { primaryColor: 'cyan' } } as ArereConfig
  return (
    <AppContext.Provider value={{ config, keyBindings: defaultKeyBindings }}>
      {children}
    </AppContext.Provider>
  )
}

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

describe('SelectInput', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ]

  beforeEach(() => {
    capturedHandler = null
    vi.clearAllMocks()
  })

  it('should render with label', () => {
    const onSelect = vi.fn()

    const { lastFrame } = render(
      <TestWrapper>
        <SelectInput mode="standalone" label="Choose an option:" options={options} onSelect={onSelect} />
      </TestWrapper>,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('Choose an option')
  })

  it('should render all options', () => {
    const onSelect = vi.fn()

    const { lastFrame } = render(
      <TestWrapper>
        <SelectInput mode="standalone" label="Select:" options={options} onSelect={onSelect} />
      </TestWrapper>,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('Option 1')
    expect(output).toContain('Option 2')
    expect(output).toContain('Option 3')
  })

  it('should highlight selected option', () => {
    const onSelect = vi.fn()

    const { lastFrame } = render(
      <TestWrapper>
        <SelectInput mode="standalone" label="Select:" options={options} onSelect={onSelect} />
      </TestWrapper>,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    // Should show selection indicator (● for selected, ○ for unselected)
    expect(output).toMatch(/[●○]/)
  })

  describe('Keyboard interactions', () => {
    it('should call onSelect when Enter is pressed', () => {
      const onSelect = vi.fn()

      render(
        <TestWrapper>
          <SelectInput mode="standalone" label="Select:" options={options} onSelect={onSelect} />
        </TestWrapper>,
      )

      // Press Enter (should select first option)
      capturedHandler?.('', { return: true })

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith('1')
    })

    it('should navigate right with right arrow', () => {
      const onSelect = vi.fn()

      render(
        <TestWrapper>
          <SelectInput mode="standalone" label="Select:" options={options} onSelect={onSelect} />
        </TestWrapper>,
      )

      // Navigate right to second option
      capturedHandler?.('', { rightArrow: true })

      // Select it
      capturedHandler?.('', { return: true })

      expect(onSelect).toHaveBeenCalledWith('2')
    })

    it('should navigate left with left arrow', () => {
      const onSelect = vi.fn()

      render(
        <TestWrapper>
          <SelectInput mode="standalone" label="Select:" options={options} onSelect={onSelect} />
        </TestWrapper>,
      )

      // Navigate right then left (back to first)
      capturedHandler?.('', { rightArrow: true })
      capturedHandler?.('', { leftArrow: true })

      // Select it
      capturedHandler?.('', { return: true })

      expect(onSelect).toHaveBeenCalledWith('1')
    })

    it('should wrap around when navigating right from last option', () => {
      const onSelect = vi.fn()

      render(
        <TestWrapper>
          <SelectInput mode="standalone" label="Select:" options={options} onSelect={onSelect} />
        </TestWrapper>,
      )

      // Navigate to last option and beyond (should wrap to first)
      capturedHandler?.('', { rightArrow: true }) // index 1
      capturedHandler?.('', { rightArrow: true }) // index 2
      capturedHandler?.('', { rightArrow: true }) // wrap to index 0

      // Select it
      capturedHandler?.('', { return: true })

      expect(onSelect).toHaveBeenCalledWith('1')
    })

    it('should wrap around when navigating left from first option', () => {
      const onSelect = vi.fn()

      render(
        <TestWrapper>
          <SelectInput mode="standalone" label="Select:" options={options} onSelect={onSelect} />
        </TestWrapper>,
      )

      // Navigate left from first (should wrap to last)
      capturedHandler?.('', { leftArrow: true })

      // Select it
      capturedHandler?.('', { return: true })

      expect(onSelect).toHaveBeenCalledWith('3')
    })

    it('should start at initialIndex when provided', () => {
      const onSelect = vi.fn()

      render(
        <TestWrapper>
          <SelectInput mode="standalone" label="Select:" options={options} onSelect={onSelect} initialIndex={1} />
        </TestWrapper>,
      )

      // Press Enter immediately (should select second option)
      capturedHandler?.('', { return: true })

      expect(onSelect).toHaveBeenCalledWith('2')
    })

    it('should handle empty options array', () => {
      const onSelect = vi.fn()

      render(
        <TestWrapper>
          <SelectInput mode="standalone" label="Select:" options={[]} onSelect={onSelect} />
        </TestWrapper>,
      )

      // Try to select (should not crash)
      capturedHandler?.('', { return: true })

      expect(onSelect).not.toHaveBeenCalled()
    })
  })
})
