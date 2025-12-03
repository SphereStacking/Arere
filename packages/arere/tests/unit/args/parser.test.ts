import { describe, expect, it } from 'vitest'
import {
  getArgValue,
  getFlagValue,
  hasArgMapping,
  parseArgs,
} from '@/action/args/parser'

describe('parseArgs', () => {
  it('should parse long arguments with = separator', () => {
    const result = parseArgs(['--target=production', '--port=3000'])
    expect(result.named.get('target')).toBe('production')
    expect(result.named.get('port')).toBe('3000')
  })

  it('should parse long arguments with space separator', () => {
    const result = parseArgs(['--target', 'production', '--port', '3000'])
    expect(result.named.get('target')).toBe('production')
    expect(result.named.get('port')).toBe('3000')
  })

  it('should parse short arguments with = separator', () => {
    const result = parseArgs(['-t=production', '-p=3000'])
    expect(result.named.get('t')).toBe('production')
    expect(result.named.get('p')).toBe('3000')
  })

  it('should parse short arguments with inline value', () => {
    // -tproduction format (value directly after flag)
    const result = parseArgs(['-tproduction', '-p3000'])
    expect(result.named.get('t')).toBe('production')
    expect(result.named.get('p')).toBe('3000')
  })

  it('should parse flags (long)', () => {
    const result = parseArgs(['--yes', '--verbose'])
    expect(result.flags.has('yes')).toBe(true)
    expect(result.flags.has('verbose')).toBe(true)
  })

  it('should parse flags (short)', () => {
    const result = parseArgs(['-y', '-v'])
    expect(result.flags.has('y')).toBe(true)
    expect(result.flags.has('v')).toBe(true)
  })

  it('should parse negated flags (--no-flag)', () => {
    const result = parseArgs(['--no-yes', '--no-verbose'])
    expect(result.named.get('yes')).toBe('false')
    expect(result.named.get('verbose')).toBe('false')
  })

  it('should parse positional arguments', () => {
    const result = parseArgs(['file1.txt', 'file2.txt'])
    expect(result.positional).toEqual(['file1.txt', 'file2.txt'])
  })

  it('should parse mixed arguments', () => {
    const result = parseArgs([
      '--target=production',
      '-y',
      '--port',
      '3000',
      'file.txt',
    ])
    expect(result.named.get('target')).toBe('production')
    expect(result.named.get('port')).toBe('3000')
    expect(result.flags.has('y')).toBe(true)
    expect(result.positional).toEqual(['file.txt'])
  })

  it('should handle values with = character', () => {
    const result = parseArgs(['--message=key=value'])
    expect(result.named.get('message')).toBe('key=value')
  })

  it('should handle empty args', () => {
    const result = parseArgs([])
    expect(result.named.size).toBe(0)
    expect(result.flags.size).toBe(0)
    expect(result.positional).toEqual([])
  })
})

describe('getArgValue', () => {
  it('should get value by long argument name', () => {
    const parsed = parseArgs(['--target=production'])
    const value = getArgValue(parsed, { arg: 'target' })
    expect(value).toBe('production')
  })

  it('should get value by short argument name', () => {
    const parsed = parseArgs(['-tproduction'])
    const value = getArgValue(parsed, { argShort: 't' })
    expect(value).toBe('production')
  })

  it('should prefer long argument name', () => {
    const parsed = parseArgs(['--target=long', '-t', 'short'])
    const value = getArgValue(parsed, { arg: 'target', argShort: 't' })
    expect(value).toBe('long')
  })

  it('should fall back to short argument name', () => {
    const parsed = parseArgs(['-t=short'])
    const value = getArgValue(parsed, { arg: 'target', argShort: 't' })
    expect(value).toBe('short')
  })

  it('should get value by positional index', () => {
    const parsed = parseArgs(['staging', 'file.txt'])
    const value = getArgValue(parsed, { argIndex: 0 })
    expect(value).toBe('staging')
  })

  it('should return undefined if not found', () => {
    const parsed = parseArgs(['--other=value'])
    const value = getArgValue(parsed, { arg: 'target' })
    expect(value).toBeUndefined()
  })
})

describe('getFlagValue', () => {
  it('should return true if flag is set (long)', () => {
    const parsed = parseArgs(['--yes'])
    const value = getFlagValue(parsed, { arg: 'yes' })
    expect(value).toBe(true)
  })

  it('should return true if flag is set (short)', () => {
    const parsed = parseArgs(['-y'])
    const value = getFlagValue(parsed, { argShort: 'y' })
    expect(value).toBe(true)
  })

  it('should return false if negated (--no-flag)', () => {
    const parsed = parseArgs(['--no-yes'])
    const value = getFlagValue(parsed, { arg: 'yes' })
    expect(value).toBe(false)
  })

  it('should return undefined if not present', () => {
    const parsed = parseArgs(['--other'])
    const value = getFlagValue(parsed, { arg: 'yes' })
    expect(value).toBeUndefined()
  })
})

describe('hasArgMapping', () => {
  it('should return true if arg is defined', () => {
    expect(hasArgMapping({ arg: 'target' })).toBe(true)
  })

  it('should return true if argShort is defined', () => {
    expect(hasArgMapping({ argShort: 't' })).toBe(true)
  })

  it('should return true if argIndex is defined', () => {
    expect(hasArgMapping({ argIndex: 0 })).toBe(true)
  })

  it('should return false if no mapping is defined', () => {
    expect(hasArgMapping({})).toBe(false)
    expect(hasArgMapping(undefined)).toBe(false)
  })
})
