/**
 * Tests for nested value utilities
 */

import { deleteNestedValue, getNestedValue, setNestedValue } from '@/infrastructure/config/utils.js'
import { describe, expect, it } from 'vitest'

describe('setNestedValue', () => {
  it('should set simple key', () => {
    const obj = {}
    const result = setNestedValue(obj, 'locale', 'ja')
    expect(result).toEqual({ locale: 'ja' })
  })

  it('should set nested key (2 levels)', () => {
    const obj = {}
    const result = setNestedValue(obj, 'theme.primaryColor', 'blue')
    expect(result).toEqual({ theme: { primaryColor: 'blue' } })
  })

  it('should set deeply nested key (3 levels)', () => {
    const obj = {}
    const result = setNestedValue(obj, 'a.b.c', 'value')
    expect(result).toEqual({ a: { b: { c: 'value' } } })
  })

  it('should preserve existing properties at same level', () => {
    const obj = { locale: 'en', logLevel: 'info' }
    const result = setNestedValue(obj, 'theme.primaryColor', 'blue')
    expect(result).toEqual({
      locale: 'en',
      logLevel: 'info',
      theme: { primaryColor: 'blue' },
    })
  })

  it('should preserve existing nested properties', () => {
    const obj = { theme: { fontSize: 14 } }
    const result = setNestedValue(obj, 'theme.primaryColor', 'cyan')
    expect(result).toEqual({
      theme: { fontSize: 14, primaryColor: 'cyan' },
    })
  })

  it('should override existing value', () => {
    const obj = { theme: { primaryColor: 'red' } }
    const result = setNestedValue(obj, 'theme.primaryColor', 'blue')
    expect(result).toEqual({
      theme: { primaryColor: 'blue' },
    })
  })

  it('should not mutate original object', () => {
    const obj = { theme: { primaryColor: 'red' } }
    const result = setNestedValue(obj, 'theme.primaryColor', 'blue')
    expect(obj).toEqual({ theme: { primaryColor: 'red' } }) // Original unchanged
    expect(result).toEqual({ theme: { primaryColor: 'blue' } })
  })

  it('should create intermediate objects if they do not exist', () => {
    const obj = { other: 'value' }
    const result = setNestedValue(obj, 'theme.primaryColor', 'blue')
    expect(result).toEqual({
      other: 'value',
      theme: { primaryColor: 'blue' },
    })
  })

  it('should replace non-object values with object when nesting', () => {
    const obj = { theme: 'string-value' }
    const result = setNestedValue(obj, 'theme.primaryColor', 'blue')
    expect(result).toEqual({
      theme: { primaryColor: 'blue' },
    })
  })
})

describe('deleteNestedValue', () => {
  it('should delete simple key', () => {
    const obj = { locale: 'ja', logLevel: 'info' }
    const result = deleteNestedValue(obj, 'locale')
    expect(result).toEqual({ logLevel: 'info' })
  })

  it('should delete nested key', () => {
    const obj = { theme: { primaryColor: 'blue', fontSize: 14 } }
    const result = deleteNestedValue(obj, 'theme.primaryColor')
    expect(result).toEqual({ theme: { fontSize: 14 } })
  })

  it('should delete deeply nested key', () => {
    const obj = { a: { b: { c: 'value', d: 'other' } } }
    const result = deleteNestedValue(obj, 'a.b.c')
    expect(result).toEqual({ a: { b: { d: 'other' } } })
  })

  it('should return unchanged object if key does not exist', () => {
    const obj = { locale: 'ja' }
    const result = deleteNestedValue(obj, 'nonexistent')
    expect(result).toEqual({ locale: 'ja' })
  })

  it('should return unchanged object if nested path does not exist', () => {
    const obj = { locale: 'ja' }
    const result = deleteNestedValue(obj, 'theme.primaryColor')
    expect(result).toEqual({ locale: 'ja' })
  })

  it('should not mutate original object', () => {
    const obj = { theme: { primaryColor: 'blue' } }
    const result = deleteNestedValue(obj, 'theme.primaryColor')
    expect(obj).toEqual({ theme: { primaryColor: 'blue' } }) // Original unchanged
    expect(result).toEqual({ theme: {} })
  })
})

describe('getNestedValue', () => {
  it('should get simple value', () => {
    const obj = { locale: 'ja' }
    expect(getNestedValue(obj, 'locale')).toBe('ja')
  })

  it('should get nested value', () => {
    const obj = { theme: { primaryColor: 'blue' } }
    expect(getNestedValue(obj, 'theme.primaryColor')).toBe('blue')
  })

  it('should get deeply nested value', () => {
    const obj = { a: { b: { c: 'value' } } }
    expect(getNestedValue(obj, 'a.b.c')).toBe('value')
  })

  it('should return undefined for non-existent key', () => {
    const obj = { locale: 'ja' }
    expect(getNestedValue(obj, 'nonexistent')).toBeUndefined()
  })

  it('should return undefined for non-existent nested path', () => {
    const obj = { locale: 'ja' }
    expect(getNestedValue(obj, 'theme.primaryColor')).toBeUndefined()
  })

  it('should return undefined if intermediate value is null', () => {
    const obj = { theme: null }
    expect(getNestedValue(obj, 'theme.primaryColor')).toBeUndefined()
  })

  it('should return undefined if intermediate value is not an object', () => {
    const obj = { theme: 'string' }
    expect(getNestedValue(obj, 'theme.primaryColor')).toBeUndefined()
  })
})
