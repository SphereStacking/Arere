import { describe, expect, it } from 'vitest'
import {
  calculateLayout,
  calculateMaxWidths,
  padText,
  parseFormat,
  truncateText,
} from '@/ui/arere-render'

describe('calculateLayout', () => {
  it('calculates layout for simple format', () => {
    const tokens = parseFormat('${name}')
    const data = { name: 'hello' }
    const result = calculateLayout(tokens, data, 80)

    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0].text).toBe('hello')
    expect(result.tokens[0].width).toBe(5)
  })

  it('handles right-aligned tokens with align property', () => {
    const tokens = parseFormat('${name} ${tags:right}')
    const data = { name: 'hello', tags: '#test' }
    const result = calculateLayout(tokens, data, 80)

    expect(result.tokens).toHaveLength(3) // ${name}, " ", ${tags:right}
    expect(result.tokens[2].text).toBe('#test')
    expect(result.tokens[2].align).toBe('right')
  })

  it('calculates grow width correctly', () => {
    const tokens = parseFormat('${prefix}${description:grow}${tags}')
    const data = { prefix: '> ', description: 'Hello', tags: '#test' }
    const result = calculateLayout(tokens, data, 80)

    // Total: 80, prefix: 2, tags: 5
    // Grow width: 80 - 2 - 5 = 73
    expect(result.growWidth).toBe(73)
    expect(result.tokens[1].width).toBe(73)
  })

  it('uses maxWidths for :max modifier', () => {
    const tokens = parseFormat('${name:max}')
    const data = { name: 'hi' }
    const maxWidths = { name: 10 }
    const result = calculateLayout(tokens, data, 80, maxWidths)

    expect(result.tokens[0].width).toBe(10)
    expect(result.tokens[0].text).toBe('hi')
  })

  it('handles empty data gracefully', () => {
    const tokens = parseFormat('${name} ${missing}')
    const data = { name: 'hello' }
    const result = calculateLayout(tokens, data, 80)

    expect(result.tokens[0].text).toBe('hello')
    expect(result.tokens[2].text).toBe('')
  })

  it('handles literal tokens', () => {
    const tokens = parseFormat('[${category}]')
    const data = { category: 'git' }
    const result = calculateLayout(tokens, data, 80)

    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[0].text).toBe('[')
    expect(result.tokens[1].text).toBe('git')
    expect(result.tokens[2].text).toBe(']')
  })

  it('distributes grow width among multiple grow tokens', () => {
    const tokens = parseFormat('${a:grow}${b:grow}')
    const data = { a: 'x', b: 'y' }
    const result = calculateLayout(tokens, data, 80)

    // 80 / 2 = 40 each
    expect(result.tokens[0].width).toBe(40)
    expect(result.tokens[1].width).toBe(40)
  })

  it('handles center alignment', () => {
    const tokens = parseFormat('${name:max:center}')
    const data = { name: 'hi' }
    const maxWidths = { name: 10 }
    const result = calculateLayout(tokens, data, 80, maxWidths)

    expect(result.tokens[0].align).toBe('center')
    expect(result.tokens[0].displayText).toBe('    hi    ') // centered in 10 chars
  })

  it('handles left alignment (default)', () => {
    const tokens = parseFormat('${name:max}')
    const data = { name: 'hi' }
    const maxWidths = { name: 10 }
    const result = calculateLayout(tokens, data, 80, maxWidths)

    expect(result.tokens[0].align).toBe('left')
    expect(result.tokens[0].displayText).toBe('hi        ') // left-aligned in 10 chars
  })

  it('handles right alignment with displayText', () => {
    const tokens = parseFormat('${name:max:right}')
    const data = { name: 'hi' }
    const maxWidths = { name: 10 }
    const result = calculateLayout(tokens, data, 80, maxWidths)

    expect(result.tokens[0].align).toBe('right')
    expect(result.tokens[0].displayText).toBe('        hi') // right-aligned in 10 chars
  })
})

describe('calculateMaxWidths', () => {
  it('calculates max widths from data list', () => {
    const tokens = parseFormat('${name:max} ${category:max}')
    const dataList = [
      { name: 'short', category: 'git' },
      { name: 'longer-name', category: 'utility' },
      { name: 'mid', category: 'dev' },
    ]
    const maxWidths = calculateMaxWidths(tokens, dataList)

    expect(maxWidths.name).toBe(11) // 'longer-name'.length
    expect(maxWidths.category).toBe(7) // 'utility'.length
  })

  it('ignores variables without :max modifier', () => {
    const tokens = parseFormat('${name} ${category:max}')
    const dataList = [
      { name: 'very-long-name', category: 'git' },
    ]
    const maxWidths = calculateMaxWidths(tokens, dataList)

    expect(maxWidths.name).toBeUndefined()
    expect(maxWidths.category).toBe(3)
  })

  it('handles empty data list', () => {
    const tokens = parseFormat('${name:max}')
    const maxWidths = calculateMaxWidths(tokens, [])

    expect(maxWidths.name).toBe(0)
  })

  it('handles missing values in data', () => {
    const tokens = parseFormat('${name:max}')
    const dataList = [
      { name: 'hello' },
      {}, // name is undefined
      { name: 'world' },
    ]
    const maxWidths = calculateMaxWidths(tokens, dataList)

    expect(maxWidths.name).toBe(5) // max of 'hello' and 'world'
  })
})

describe('padText', () => {
  it('pads text to the right (left align)', () => {
    expect(padText('hi', 5)).toBe('hi   ')
  })

  it('pads text to the left (right align)', () => {
    expect(padText('hi', 5, 'right')).toBe('   hi')
  })

  it('pads text on both sides (center align)', () => {
    expect(padText('hi', 6, 'center')).toBe('  hi  ')
  })

  it('pads center with odd padding (extra on right)', () => {
    expect(padText('hi', 5, 'center')).toBe(' hi  ')
  })

  it('returns original text if already at width', () => {
    expect(padText('hello', 5)).toBe('hello')
  })

  it('returns original text if longer than width', () => {
    expect(padText('hello', 3)).toBe('hello')
  })
})

describe('truncateText', () => {
  it('returns original text if within width', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('truncates with ellipsis', () => {
    expect(truncateText('hello world', 8)).toBe('hello w…')
  })

  it('returns just ellipsis for very small width', () => {
    expect(truncateText('hello', 1)).toBe('…')
  })

  it('returns empty string for zero width', () => {
    expect(truncateText('hello', 0)).toBe('')
  })

  it('handles exact width', () => {
    expect(truncateText('hello', 5)).toBe('hello')
  })
})

describe(':width(N) modifier', () => {
  it('uses fixedWidth as token width', () => {
    const tokens = parseFormat('${bookmark:width(3)}')
    const data = { bookmark: 'X' }
    const result = calculateLayout(tokens, data, 80)

    expect(result.tokens[0].width).toBe(3)
  })

  it('fixedWidth takes priority over maxWidths', () => {
    const tokens = parseFormat('${name:width(5):max}')
    const data = { name: 'hi' }
    const maxWidths = { name: 20 }
    const result = calculateLayout(tokens, data, 80, maxWidths)

    expect(result.tokens[0].width).toBe(5)
  })

  it('works with right modifier (alignment)', () => {
    const tokens = parseFormat('${name}${bookmark:width(3):right}')
    const data = { name: 'hello', bookmark: 'X' }
    const result = calculateLayout(tokens, data, 80)

    expect(result.tokens[1].width).toBe(3)
    expect(result.tokens[1].align).toBe('right')
    expect(result.tokens[1].displayText).toBe('  X') // right-aligned in 3 chars
  })

  it('calculates grow width correctly with fixedWidth tokens', () => {
    const tokens = parseFormat('${prefix:width(2)}${description:grow}${bookmark:width(3)}')
    const data = { prefix: '> ', description: 'Hello', bookmark: 'X' }
    const result = calculateLayout(tokens, data, 80)

    // Total: 80, prefix: 2 (fixed), bookmark: 3 (fixed)
    // Grow width: 80 - 2 - 3 = 75
    expect(result.growWidth).toBe(75)
    expect(result.tokens[0].width).toBe(2)
  })
})
