/**
 * Tests for ConfirmInput component
 */

import { ConfirmInput } from '@/presentation/ui/components/inputs/ConfirmInput.js'
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

describe('ConfirmInput', () => {
  beforeEach(() => {
    capturedHandler = null
    vi.clearAllMocks()
  })

  it('should render with message', () => {
    const onConfirm = vi.fn()

    const { lastFrame } = render(<ConfirmInput mode="standalone" message="Are you sure?" onConfirm={onConfirm} />)

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('Are you sure')
  })

  it('should render with default value true', () => {
    const onConfirm = vi.fn()

    const { lastFrame } = render(
      <ConfirmInput mode="standalone" message="Continue?" defaultValue={true} onConfirm={onConfirm} />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    // Should show "はい" (Yes) as default
    expect(output).toMatch(/はい|Y/)
  })

  it('should render with default value false', () => {
    const onConfirm = vi.fn()

    const { lastFrame } = render(
      <ConfirmInput mode="standalone" message="Delete all?" defaultValue={false} onConfirm={onConfirm} />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    // Should show "いいえ" (No) as default
    expect(output).toMatch(/いいえ|N/)
  })

  describe('Keyboard interactions - Direct input', () => {
    it('should confirm with true when "y" is pressed', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Continue?" onConfirm={onConfirm} />)

      // Press 'y'
      capturedHandler?.('y', {})

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onConfirm).toHaveBeenCalledWith(true)
    })

    it('should confirm with true when "Y" is pressed', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Continue?" onConfirm={onConfirm} />)

      // Press 'Y'
      capturedHandler?.('Y', {})

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onConfirm).toHaveBeenCalledWith(true)
    })

    it('should confirm with false when "n" is pressed', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Continue?" onConfirm={onConfirm} />)

      // Press 'n'
      capturedHandler?.('n', {})

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onConfirm).toHaveBeenCalledWith(false)
    })

    it('should confirm with false when "N" is pressed', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Continue?" onConfirm={onConfirm} />)

      // Press 'N'
      capturedHandler?.('N', {})

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onConfirm).toHaveBeenCalledWith(false)
    })
  })

  describe('Keyboard interactions - Arrow keys and Enter', () => {
    it('should select yes with right arrow and confirm with Enter', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Continue?" defaultValue={false} onConfirm={onConfirm} />)

      // Press right arrow to select yes
      capturedHandler?.('', { rightArrow: true })

      // Press Enter to confirm
      capturedHandler?.('', { return: true })

      expect(onConfirm).toHaveBeenCalledWith(true)
    })

    it('should select no with left arrow and confirm with Enter', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Continue?" defaultValue={true} onConfirm={onConfirm} />)

      // Press left arrow to select no
      capturedHandler?.('', { leftArrow: true })

      // Press Enter to confirm
      capturedHandler?.('', { return: true })

      expect(onConfirm).toHaveBeenCalledWith(false)
    })

    it('should confirm with default value when Enter is pressed without navigation', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Continue?" defaultValue={true} onConfirm={onConfirm} />)

      // Press Enter immediately (should use defaultValue)
      capturedHandler?.('', { return: true })

      expect(onConfirm).toHaveBeenCalledWith(true)
    })

    it('should confirm with false default when Enter is pressed', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Continue?" defaultValue={false} onConfirm={onConfirm} />)

      // Press Enter immediately (should use defaultValue = false)
      capturedHandler?.('', { return: true })

      expect(onConfirm).toHaveBeenCalledWith(false)
    })
  })

  describe('Keyboard interactions - Escape', () => {
    it('should cancel with false when Escape is pressed', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Delete?" defaultValue={true} onConfirm={onConfirm} />)

      // Press Escape
      capturedHandler?.('', { escape: true })

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onConfirm).toHaveBeenCalledWith(false)
    })

    it('should always cancel with false on Escape, regardless of selection', () => {
      const onConfirm = vi.fn()

      render(<ConfirmInput mode="standalone" message="Delete?" defaultValue={true} onConfirm={onConfirm} />)

      // Select yes (already default)
      capturedHandler?.('', { rightArrow: true })

      // Press Escape (should still cancel with false)
      capturedHandler?.('', { escape: true })

      expect(onConfirm).toHaveBeenCalledWith(false)
    })
  })

  describe('Danger mode', () => {
    it('should render danger warning when danger prop is true', () => {
      const onConfirm = vi.fn()

      const { lastFrame } = render(
        <ConfirmInput mode="standalone" message="Delete everything?" danger={true} onConfirm={onConfirm} />,
      )

      const output = lastFrame()
      expect(output).toContain('注意')
    })
  })
})
