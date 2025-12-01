import { describe, expect, it } from 'vitest'
import {
  formatKeyBinding,
  formatKeyBindings,
  formatHintItem,
  formatHints,
} from '@/ui/utils/keybindingHints'

describe('formatKeyBinding', () => {
  it('should format simple character key', () => {
    expect(formatKeyBinding({ key: 'q' })).toBe('q')
    expect(formatKeyBinding({ key: 'a' })).toBe('a')
  })

  it('should format with ctrl modifier', () => {
    expect(formatKeyBinding({ key: 'c', ctrl: true })).toBe('Ctrl+C')
    expect(formatKeyBinding({ key: 'x', ctrl: true })).toBe('Ctrl+X')
  })

  it('should format with meta modifier', () => {
    expect(formatKeyBinding({ key: 'a', meta: true })).toBe('Meta+A')
  })

  it('should format with shift modifier', () => {
    expect(formatKeyBinding({ key: 'tab', shift: true })).toBe('Shift+Tab')
  })

  it('should format with multiple modifiers', () => {
    expect(formatKeyBinding({ key: 'c', ctrl: true, shift: true })).toBe('Ctrl+Shift+C')
    expect(formatKeyBinding({ key: 'a', ctrl: true, meta: true })).toBe('Ctrl+Meta+A')
  })

  it('should format escape key', () => {
    expect(formatKeyBinding({ key: 'escape' })).toBe('Esc')
  })

  it('should format return key', () => {
    expect(formatKeyBinding({ key: 'return' })).toBe('Enter')
  })

  it('should format arrow keys', () => {
    expect(formatKeyBinding({ key: 'upArrow' })).toBe('↑')
    expect(formatKeyBinding({ key: 'downArrow' })).toBe('↓')
    expect(formatKeyBinding({ key: 'leftArrow' })).toBe('←')
    expect(formatKeyBinding({ key: 'rightArrow' })).toBe('→')
  })

  it('should format space key', () => {
    expect(formatKeyBinding({ key: ' ' })).toBe('Space')
  })

  it('should format special keys', () => {
    expect(formatKeyBinding({ key: 'tab' })).toBe('Tab')
    expect(formatKeyBinding({ key: 'backspace' })).toBe('Backspace')
    expect(formatKeyBinding({ key: 'delete' })).toBe('Delete')
    expect(formatKeyBinding({ key: 'pageUp' })).toBe('PageUp')
    expect(formatKeyBinding({ key: 'pageDown' })).toBe('PageDown')
  })

  it('should format symbol keys', () => {
    expect(formatKeyBinding({ key: '/' })).toBe('/')
    expect(formatKeyBinding({ key: '?' })).toBe('?')
  })
})

describe('formatKeyBindings', () => {
  it('should format single binding', () => {
    expect(formatKeyBindings([{ key: 'q' }])).toBe('q')
  })

  it('should format multiple bindings with default maxDisplay=1', () => {
    expect(formatKeyBindings([{ key: 'c', ctrl: true }, { key: 'q' }])).toBe('Ctrl+C')
  })

  it('should format multiple bindings with maxDisplay=2', () => {
    expect(formatKeyBindings([{ key: 'c', ctrl: true }, { key: 'q' }], 2)).toBe('Ctrl+C/q')
  })

  it('should handle empty array', () => {
    expect(formatKeyBindings([])).toBe('')
  })
})

describe('formatHintItem', () => {
  it('should format hint item with brackets', () => {
    expect(formatHintItem({ bindings: [{ key: 'q' }], label: '終了' })).toBe('[q] 終了')
  })

  it('should format hint item with modifier', () => {
    expect(formatHintItem({ bindings: [{ key: 'c', ctrl: true }], label: 'exit' })).toBe(
      '[Ctrl+C] exit'
    )
  })

  it('should return empty string for empty bindings', () => {
    expect(formatHintItem({ bindings: [], label: '終了' })).toBe('')
  })
})

describe('formatHints', () => {
  it('should format multiple hints with default separator (double space)', () => {
    const hints = formatHints([
      { bindings: [{ key: 'q' }], label: '終了' },
      { bindings: [{ key: '/' }], label: '検索' },
    ])
    expect(hints).toBe('[q] 終了  [/] 検索')
  })

  it('should format multiple hints with custom separator', () => {
    const hints = formatHints(
      [
        { bindings: [{ key: 'q' }], label: '終了' },
        { bindings: [{ key: '/' }], label: '検索' },
      ],
      ' • '
    )
    expect(hints).toBe('[q] 終了 • [/] 検索')
  })

  it('should filter out empty hints', () => {
    const hints = formatHints([
      { bindings: [{ key: 'q' }], label: '終了' },
      { bindings: [], label: '空' },
      { bindings: [{ key: '/' }], label: '検索' },
    ])
    expect(hints).toBe('[q] 終了  [/] 検索')
  })

  it('should handle empty array', () => {
    expect(formatHints([])).toBe('')
  })
})
