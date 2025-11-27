import { describe, expect, it } from 'vitest'
import {
  parseKeyBinding,
  formatKeyBindingString,
  parseUserKeyBinding,
  parseUserKeyBindings,
} from '@/infrastructure/keybindings/parser'

describe('parseKeyBinding', () => {
  it('should parse simple character key', () => {
    expect(parseKeyBinding('a')).toEqual({ key: 'a' })
    expect(parseKeyBinding('q')).toEqual({ key: 'q' })
    expect(parseKeyBinding('/')).toEqual({ key: '/' })
  })

  it('should parse ctrl modifier', () => {
    expect(parseKeyBinding('ctrl+c')).toEqual({ key: 'c', ctrl: true })
    expect(parseKeyBinding('ctrl+/')).toEqual({ key: '/', ctrl: true })
  })

  it('should parse shift modifier', () => {
    expect(parseKeyBinding('shift+tab')).toEqual({ key: 'tab', shift: true })
  })

  it('should parse meta modifier', () => {
    expect(parseKeyBinding('meta+a')).toEqual({ key: 'a', meta: true })
    expect(parseKeyBinding('cmd+a')).toEqual({ key: 'a', meta: true })
    expect(parseKeyBinding('command+a')).toEqual({ key: 'a', meta: true })
  })

  it('should parse multiple modifiers', () => {
    expect(parseKeyBinding('ctrl+shift+p')).toEqual({ key: 'p', ctrl: true, shift: true })
    expect(parseKeyBinding('ctrl+meta+a')).toEqual({ key: 'a', ctrl: true, meta: true })
  })

  it('should convert arrow key aliases', () => {
    expect(parseKeyBinding('up')).toEqual({ key: 'upArrow' })
    expect(parseKeyBinding('down')).toEqual({ key: 'downArrow' })
    expect(parseKeyBinding('left')).toEqual({ key: 'leftArrow' })
    expect(parseKeyBinding('right')).toEqual({ key: 'rightArrow' })
  })

  it('should convert special key aliases', () => {
    expect(parseKeyBinding('enter')).toEqual({ key: 'return' })
    expect(parseKeyBinding('esc')).toEqual({ key: 'escape' })
    expect(parseKeyBinding('space')).toEqual({ key: ' ' })
    expect(parseKeyBinding('del')).toEqual({ key: 'delete' })
    expect(parseKeyBinding('bs')).toEqual({ key: 'backspace' })
  })

  it('should convert page keys', () => {
    expect(parseKeyBinding('pageup')).toEqual({ key: 'pageUp' })
    expect(parseKeyBinding('pagedown')).toEqual({ key: 'pageDown' })
  })

  it('should handle case insensitivity', () => {
    expect(parseKeyBinding('CTRL+C')).toEqual({ key: 'c', ctrl: true })
    expect(parseKeyBinding('Ctrl+Shift+P')).toEqual({ key: 'p', ctrl: true, shift: true })
    expect(parseKeyBinding('UP')).toEqual({ key: 'upArrow' })
  })

  it('should handle combined modifier with alias', () => {
    expect(parseKeyBinding('ctrl+up')).toEqual({ key: 'upArrow', ctrl: true })
    expect(parseKeyBinding('shift+enter')).toEqual({ key: 'return', shift: true })
  })
})

describe('formatKeyBindingString', () => {
  it('should format simple character key', () => {
    expect(formatKeyBindingString({ key: 'a' })).toBe('a')
    expect(formatKeyBindingString({ key: '/' })).toBe('/')
  })

  it('should format with ctrl modifier', () => {
    expect(formatKeyBindingString({ key: 'c', ctrl: true })).toBe('ctrl+c')
  })

  it('should format with multiple modifiers', () => {
    expect(formatKeyBindingString({ key: 'p', ctrl: true, shift: true })).toBe('ctrl+shift+p')
  })

  it('should convert internal key names to aliases', () => {
    expect(formatKeyBindingString({ key: 'upArrow' })).toBe('up')
    expect(formatKeyBindingString({ key: 'return' })).toBe('enter')
    expect(formatKeyBindingString({ key: 'escape' })).toBe('esc')
    expect(formatKeyBindingString({ key: ' ' })).toBe('space')
  })

  it('should be inverse of parseKeyBinding', () => {
    const testCases = ['ctrl+c', 'shift+tab', 'up', 'ctrl+/', 'ctrl+shift+p']
    for (const input of testCases) {
      const parsed = parseKeyBinding(input)
      const formatted = formatKeyBindingString(parsed)
      expect(formatted).toBe(input)
    }
  })
})

describe('parseUserKeyBinding', () => {
  it('should parse user key binding object', () => {
    expect(parseUserKeyBinding({ key: 'ctrl+c' })).toEqual({ key: 'c', ctrl: true })
    expect(parseUserKeyBinding({ key: 'up' })).toEqual({ key: 'upArrow' })
  })
})

describe('parseUserKeyBindings', () => {
  it('should parse array of user key bindings', () => {
    const userBindings = [{ key: 'ctrl+c' }, { key: 'q' }]
    expect(parseUserKeyBindings(userBindings)).toEqual([
      { key: 'c', ctrl: true },
      { key: 'q' },
    ])
  })

  it('should handle empty array', () => {
    expect(parseUserKeyBindings([])).toEqual([])
  })
})
