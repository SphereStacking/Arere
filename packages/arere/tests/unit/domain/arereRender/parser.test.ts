import { describe, expect, it } from 'vitest'
import { getVariableNames, hasModifier, parseFormat } from '@/domain/arereRender/parser'

describe('parseFormat', () => {
  it('parses simple variable', () => {
    const tokens = parseFormat('${name}')
    expect(tokens).toEqual([{ type: 'variable', value: 'name', modifiers: [] }])
  })

  it('parses variable with single modifier', () => {
    const tokens = parseFormat('${name:max}')
    expect(tokens).toEqual([{ type: 'variable', value: 'name', modifiers: ['max'] }])
  })

  it('parses variable with multiple modifiers', () => {
    const tokens = parseFormat('${tags:right:dim}')
    expect(tokens).toEqual([{ type: 'variable', value: 'tags', modifiers: ['right', 'dim'] }])
  })

  it('parses literal text', () => {
    const tokens = parseFormat('hello')
    expect(tokens).toEqual([{ type: 'literal', value: 'hello', modifiers: [] }])
  })

  it('parses mixed format', () => {
    const tokens = parseFormat('${prefix}[${category}]')
    expect(tokens).toEqual([
      { type: 'variable', value: 'prefix', modifiers: [] },
      { type: 'literal', value: '[', modifiers: [] },
      { type: 'variable', value: 'category', modifiers: [] },
      { type: 'literal', value: ']', modifiers: [] },
    ])
  })

  it('parses complex format with modifiers', () => {
    const tokens = parseFormat('${prefix}[${category:max}]  ${name:max} ${description:grow}')
    expect(tokens).toEqual([
      { type: 'variable', value: 'prefix', modifiers: [] },
      { type: 'literal', value: '[', modifiers: [] },
      { type: 'variable', value: 'category', modifiers: ['max'] },
      { type: 'literal', value: ']  ', modifiers: [] },
      { type: 'variable', value: 'name', modifiers: ['max'] },
      { type: 'literal', value: ' ', modifiers: [] },
      { type: 'variable', value: 'description', modifiers: ['grow'] },
    ])
  })

  it('parses default format correctly', () => {
    const tokens = parseFormat(
      '${prefix}[${category:max}]  ${name:max} ${description:grow} ${tags:right:dim} ${bookmark:right}',
    )
    expect(tokens).toHaveLength(11)
    expect(tokens[0]).toEqual({ type: 'variable', value: 'prefix', modifiers: [] })
    expect(tokens[2]).toEqual({ type: 'variable', value: 'category', modifiers: ['max'] })
    expect(tokens[4]).toEqual({ type: 'variable', value: 'name', modifiers: ['max'] })
    expect(tokens[6]).toEqual({ type: 'variable', value: 'description', modifiers: ['grow'] })
    expect(tokens[8]).toEqual({ type: 'variable', value: 'tags', modifiers: ['right', 'dim'] })
    expect(tokens[10]).toEqual({ type: 'variable', value: 'bookmark', modifiers: ['right'] })
  })

  it('ignores invalid modifiers', () => {
    const tokens = parseFormat('${name:invalid:max}')
    expect(tokens).toEqual([{ type: 'variable', value: 'name', modifiers: ['max'] }])
  })

  it('handles unclosed brace as literal', () => {
    const tokens = parseFormat('${name')
    expect(tokens).toEqual([{ type: 'literal', value: '${name', modifiers: [] }])
  })

  it('handles empty format', () => {
    const tokens = parseFormat('')
    expect(tokens).toEqual([])
  })

  it('handles format with only literals', () => {
    const tokens = parseFormat('hello world')
    expect(tokens).toEqual([{ type: 'literal', value: 'hello world', modifiers: [] }])
  })

  it('handles consecutive variables', () => {
    const tokens = parseFormat('${a}${b}${c}')
    expect(tokens).toEqual([
      { type: 'variable', value: 'a', modifiers: [] },
      { type: 'variable', value: 'b', modifiers: [] },
      { type: 'variable', value: 'c', modifiers: [] },
    ])
  })

  it('treats bare brace without $ as literal', () => {
    const tokens = parseFormat('{name}')
    expect(tokens).toEqual([{ type: 'literal', value: '{name}', modifiers: [] }])
  })

  it('treats $ without brace as literal', () => {
    const tokens = parseFormat('$name')
    expect(tokens).toEqual([{ type: 'literal', value: '$name', modifiers: [] }])
  })

  describe(':width(N) modifier', () => {
    it('parses width modifier', () => {
      const tokens = parseFormat('${bookmark:width(3)}')
      expect(tokens).toEqual([
        { type: 'variable', value: 'bookmark', modifiers: [], fixedWidth: 3 },
      ])
    })

    it('parses width modifier with other modifiers', () => {
      const tokens = parseFormat('${bookmark:right:width(3)}')
      expect(tokens).toEqual([
        { type: 'variable', value: 'bookmark', modifiers: ['right'], fixedWidth: 3 },
      ])
    })

    it('parses width modifier before other modifiers', () => {
      const tokens = parseFormat('${name:width(20):primary}')
      expect(tokens).toEqual([
        { type: 'variable', value: 'name', modifiers: ['primary'], fixedWidth: 20 },
      ])
    })

    it('ignores invalid width format (non-numeric)', () => {
      const tokens = parseFormat('${name:width(abc)}')
      expect(tokens).toEqual([
        { type: 'variable', value: 'name', modifiers: [] },
      ])
    })

    it('ignores invalid width format (negative)', () => {
      const tokens = parseFormat('${name:width(-5)}')
      expect(tokens).toEqual([
        { type: 'variable', value: 'name', modifiers: [] },
      ])
    })

    it('ignores invalid width format (zero)', () => {
      const tokens = parseFormat('${name:width(0)}')
      expect(tokens).toEqual([
        { type: 'variable', value: 'name', modifiers: [] },
      ])
    })

    it('ignores malformed width modifier', () => {
      const tokens = parseFormat('${name:width}')
      expect(tokens).toEqual([
        { type: 'variable', value: 'name', modifiers: [] },
      ])
    })

    it('uses last width if multiple specified', () => {
      const tokens = parseFormat('${name:width(5):width(10)}')
      expect(tokens).toEqual([
        { type: 'variable', value: 'name', modifiers: [], fixedWidth: 10 },
      ])
    })
  })
})

describe('hasModifier', () => {
  it('returns true when token has modifier', () => {
    const token = { type: 'variable' as const, value: 'name', modifiers: ['max' as const] }
    expect(hasModifier(token, 'max')).toBe(true)
  })

  it('returns false when token does not have modifier', () => {
    const token = { type: 'variable' as const, value: 'name', modifiers: ['max' as const] }
    expect(hasModifier(token, 'grow')).toBe(false)
  })

  it('returns false for literal tokens', () => {
    const token = { type: 'literal' as const, value: 'text', modifiers: [] }
    expect(hasModifier(token, 'max')).toBe(false)
  })
})

describe('getVariableNames', () => {
  it('returns variable names from tokens', () => {
    const tokens = parseFormat('${prefix}[${category}] ${name}')
    expect(getVariableNames(tokens)).toEqual(['prefix', 'category', 'name'])
  })

  it('returns empty array for only literals', () => {
    const tokens = parseFormat('hello world')
    expect(getVariableNames(tokens)).toEqual([])
  })

  it('returns empty array for empty format', () => {
    const tokens = parseFormat('')
    expect(getVariableNames(tokens)).toEqual([])
  })
})
