import { describe, expect, it } from 'vitest'
import { matchKey, matchAny, createKeyMatcher } from '@/ui/keybindings/matcher'
import { defaultKeyBindings } from '@/ui/keybindings/defaults'
import type { KeyBinding } from '@/ui/keybindings/types'
import type { InkKey } from '@/ui/keybindings/matcher'

describe('matchKey', () => {
  it('should match simple character key', () => {
    const binding: KeyBinding = { key: 'a' }
    expect(matchKey('a', {}, binding)).toBe(true)
    expect(matchKey('b', {}, binding)).toBe(false)
  })

  it('should match return key', () => {
    const binding: KeyBinding = { key: 'return' }
    expect(matchKey('', { return: true }, binding)).toBe(true)
    expect(matchKey('', { return: false }, binding)).toBe(false)
    expect(matchKey('', {}, binding)).toBe(false)
  })

  it('should match escape key', () => {
    const binding: KeyBinding = { key: 'escape' }
    expect(matchKey('', { escape: true }, binding)).toBe(true)
    expect(matchKey('', { escape: false }, binding)).toBe(false)
  })

  it('should match space key', () => {
    const binding: KeyBinding = { key: ' ' }
    expect(matchKey(' ', {}, binding)).toBe(true)
    expect(matchKey('a', {}, binding)).toBe(false)
  })

  it('should match arrow keys', () => {
    expect(matchKey('', { upArrow: true }, { key: 'upArrow' })).toBe(true)
    expect(matchKey('', { downArrow: true }, { key: 'downArrow' })).toBe(true)
    expect(matchKey('', { leftArrow: true }, { key: 'leftArrow' })).toBe(true)
    expect(matchKey('', { rightArrow: true }, { key: 'rightArrow' })).toBe(true)
  })

  it('should match tab key', () => {
    const binding: KeyBinding = { key: 'tab' }
    expect(matchKey('', { tab: true }, binding)).toBe(true)
    expect(matchKey('', { tab: false }, binding)).toBe(false)
  })

  it('should match backspace and delete', () => {
    expect(matchKey('', { backspace: true }, { key: 'backspace' })).toBe(true)
    expect(matchKey('', { delete: true }, { key: 'delete' })).toBe(true)
  })

  it('should match with ctrl modifier', () => {
    const binding: KeyBinding = { key: 'c', ctrl: true }
    expect(matchKey('c', { ctrl: true }, binding)).toBe(true)
    expect(matchKey('c', { ctrl: false }, binding)).toBe(false)
    expect(matchKey('c', {}, binding)).toBe(false)
  })

  it('should match with shift modifier', () => {
    const binding: KeyBinding = { key: 'tab', shift: true }
    expect(matchKey('', { tab: true, shift: true }, binding)).toBe(true)
    expect(matchKey('', { tab: true, shift: false }, binding)).toBe(false)
  })

  it('should match with meta modifier', () => {
    const binding: KeyBinding = { key: 'a', meta: true }
    expect(matchKey('a', { meta: true }, binding)).toBe(true)
    expect(matchKey('a', { meta: false }, binding)).toBe(false)
  })

  it('should NOT match when ctrl is pressed but not required', () => {
    const binding: KeyBinding = { key: 'c' }
    expect(matchKey('c', { ctrl: true }, binding)).toBe(false)
    expect(matchKey('c', {}, binding)).toBe(true)
  })

  it('should NOT match when meta is pressed but not required', () => {
    const binding: KeyBinding = { key: 'a' }
    expect(matchKey('a', { meta: true }, binding)).toBe(false)
    expect(matchKey('a', {}, binding)).toBe(true)
  })

  it('should match Ctrl+/ with special char code (ASCII 31) even when key.ctrl is false', () => {
    const binding: KeyBinding = { key: '/', ctrl: true }
    // Terminal sends ASCII 31 (Unit Separator) for Ctrl+/
    // Important: Many terminals send ctrl=false with the control character
    const unitSeparator = String.fromCharCode(31)
    expect(matchKey(unitSeparator, { ctrl: false }, binding)).toBe(true)
    expect(matchKey(unitSeparator, { ctrl: true }, binding)).toBe(true)
    // Direct '/' with ctrl flag should also work
    expect(matchKey('/', { ctrl: true }, binding)).toBe(true)
    // Should not match '/' without ctrl (not a control character)
    expect(matchKey('/', {}, binding)).toBe(false)
  })

  it('should match other Ctrl+symbol combinations with special char codes (ctrl flag ignored)', () => {
    // Ctrl+[ → ASCII 27 (Escape) - with ctrl=false (as terminals send)
    expect(matchKey(String.fromCharCode(27), { ctrl: false }, { key: '[', ctrl: true })).toBe(true)
    // Ctrl+] → ASCII 29 (Group Separator)
    expect(matchKey(String.fromCharCode(29), { ctrl: false }, { key: ']', ctrl: true })).toBe(true)
    // Ctrl+\ → ASCII 28 (File Separator)
    expect(matchKey(String.fromCharCode(28), { ctrl: false }, { key: '\\', ctrl: true })).toBe(true)
  })
})

describe('matchAny', () => {
  it('should match if any binding matches', () => {
    const bindings: KeyBinding[] = [{ key: 'y' }, { key: 'Y' }]
    expect(matchAny('y', {}, bindings)).toBe(true)
    expect(matchAny('Y', {}, bindings)).toBe(true)
    expect(matchAny('n', {}, bindings)).toBe(false)
  })

  it('should handle multiple key bindings with modifiers', () => {
    const bindings: KeyBinding[] = [
      { key: 'c', ctrl: true },
      { key: 'q' },
    ]
    expect(matchAny('c', { ctrl: true }, bindings)).toBe(true)
    expect(matchAny('q', {}, bindings)).toBe(true)
    expect(matchAny('c', {}, bindings)).toBe(false)
    expect(matchAny('q', { ctrl: true }, bindings)).toBe(false)
  })

  it('should return false for empty bindings', () => {
    expect(matchAny('a', {}, [])).toBe(false)
  })
})

describe('createKeyMatcher', () => {
  it('should create matcher with all categories', () => {
    const kb = createKeyMatcher(defaultKeyBindings)

    expect(kb.global).toBeDefined()
    expect(kb.list).toBeDefined()
    expect(kb.input).toBeDefined()
    expect(kb.confirm).toBeDefined()
    expect(kb.form).toBeDefined()
    expect(kb.settings).toBeDefined()
  })

  it('should create working matcher functions', () => {
    const kb = createKeyMatcher(defaultKeyBindings)

    // Test exit (Ctrl+C or q)
    expect(kb.global.exit('c', { ctrl: true })).toBe(true)
    expect(kb.global.exit('q', {})).toBe(true)
    expect(kb.global.exit('a', {})).toBe(false)

    // Test list up/down
    expect(kb.list.up('', { upArrow: true })).toBe(true)
    expect(kb.list.down('', { downArrow: true })).toBe(true)

    // Test confirm yes/no
    expect(kb.confirm.yes('y', {})).toBe(true)
    expect(kb.confirm.yes('Y', {})).toBe(true)
    expect(kb.confirm.no('n', {})).toBe(true)
    expect(kb.confirm.no('N', {})).toBe(true)

    // Test form submit (Ctrl+Enter)
    expect(kb.form.submit('', { return: true, ctrl: true })).toBe(true)
    expect(kb.form.submit('', { return: true })).toBe(false)
  })

  it('should work with custom keybindings', () => {
    const customBindings = {
      ...defaultKeyBindings,
      list: {
        ...defaultKeyBindings.list,
        up: [{ key: 'k' }], // vim-style
        down: [{ key: 'j' }],
      },
    }

    const kb = createKeyMatcher(customBindings)

    // Custom vim-style bindings
    expect(kb.list.up('k', {})).toBe(true)
    expect(kb.list.down('j', {})).toBe(true)

    // Original bindings no longer work
    expect(kb.list.up('', { upArrow: true })).toBe(false)
    expect(kb.list.down('', { downArrow: true })).toBe(false)
  })
})
