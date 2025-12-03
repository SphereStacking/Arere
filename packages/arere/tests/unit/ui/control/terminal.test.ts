/**
 * Terminal utilities tests
 */

import { getTerminalSize, isInteractive } from '@/ui/control/terminal.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('isInteractive()', () => {
  let originalIsTTY: boolean | undefined
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalIsTTY = process.stdout.isTTY
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      writable: true,
      configurable: true,
    })
    process.env = originalEnv
  })

  it('returns true for TTY with no CI env', () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    })
    delete process.env.CI
    delete process.env.NO_COLOR
    delete process.env.TERM

    expect(isInteractive()).toBe(true)
  })

  it('returns false when not a TTY', () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: false,
      writable: true,
      configurable: true,
    })

    expect(isInteractive()).toBe(false)
  })

  it('returns false when CI=true', () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    })
    process.env.CI = 'true'

    expect(isInteractive()).toBe(false)
  })

  it('returns false when CI=1', () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    })
    process.env.CI = '1'

    expect(isInteractive()).toBe(false)
  })

  it('returns false when NO_COLOR is set', () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    })
    delete process.env.CI
    process.env.NO_COLOR = '1'

    expect(isInteractive()).toBe(false)
  })

  it('returns false when TERM=dumb', () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    })
    delete process.env.CI
    delete process.env.NO_COLOR
    process.env.TERM = 'dumb'

    expect(isInteractive()).toBe(false)
  })
})

describe('getTerminalSize()', () => {
  let originalColumns: number | undefined
  let originalRows: number | undefined

  beforeEach(() => {
    originalColumns = process.stdout.columns
    originalRows = process.stdout.rows
  })

  afterEach(() => {
    // @ts-ignore
    process.stdout.columns = originalColumns
    // @ts-ignore
    process.stdout.rows = originalRows
  })

  it('returns current terminal size', () => {
    // @ts-ignore
    process.stdout.columns = 120
    // @ts-ignore
    process.stdout.rows = 40

    const size = getTerminalSize()

    expect(size.width).toBe(120)
    expect(size.height).toBe(40)
  })

  it('returns default size when columns/rows are undefined', () => {
    // @ts-ignore
    process.stdout.columns = undefined
    // @ts-ignore
    process.stdout.rows = undefined

    const size = getTerminalSize()

    expect(size.width).toBe(80)
    expect(size.height).toBe(24)
  })

  it('returns default size when dimensions are invalid', () => {
    // @ts-ignore
    process.stdout.columns = -1
    // @ts-ignore
    process.stdout.rows = 0

    const size = getTerminalSize()

    expect(size.width).toBe(80)
    expect(size.height).toBe(24)
  })

  it('returns default size when dimensions are NaN', () => {
    // @ts-ignore
    process.stdout.columns = Number.NaN
    // @ts-ignore
    process.stdout.rows = Number.NaN

    const size = getTerminalSize()

    expect(size.width).toBe(80)
    expect(size.height).toBe(24)
  })
})

