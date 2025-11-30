import { describe, expect, it } from 'vitest'
import {
  ArgValidationError,
  convertToBoolean,
  convertToMultiSelectValue,
  convertToNumber,
  convertToSelectValue,
  validateTextValue,
} from '@/infrastructure/args/validator'

describe('convertToNumber', () => {
  it('should convert valid number string', () => {
    expect(convertToNumber('42', 'port')).toBe(42)
    expect(convertToNumber('3.14', 'ratio')).toBe(3.14)
    expect(convertToNumber('-10', 'offset')).toBe(-10)
  })

  it('should throw error for invalid number', () => {
    expect(() => convertToNumber('abc', 'port')).toThrow(ArgValidationError)
    expect(() => convertToNumber('', 'port')).toThrow(ArgValidationError)
  })

  it('should validate min constraint', () => {
    expect(convertToNumber('10', 'port', { min: 5 })).toBe(10)
    expect(() => convertToNumber('3', 'port', { min: 5 })).toThrow(ArgValidationError)
  })

  it('should validate max constraint', () => {
    expect(convertToNumber('10', 'port', { max: 20 })).toBe(10)
    expect(() => convertToNumber('25', 'port', { max: 20 })).toThrow(ArgValidationError)
  })
})

describe('convertToBoolean', () => {
  it('should convert truthy values', () => {
    expect(convertToBoolean('true', 'flag')).toBe(true)
    expect(convertToBoolean('1', 'flag')).toBe(true)
    expect(convertToBoolean('yes', 'flag')).toBe(true)
    expect(convertToBoolean(undefined, 'flag')).toBe(true)
  })

  it('should convert falsy values', () => {
    expect(convertToBoolean('false', 'flag')).toBe(false)
    expect(convertToBoolean('0', 'flag')).toBe(false)
    expect(convertToBoolean('no', 'flag')).toBe(false)
  })

  it('should throw error for invalid boolean', () => {
    expect(() => convertToBoolean('maybe', 'flag')).toThrow(ArgValidationError)
  })
})

describe('convertToSelectValue', () => {
  it('should convert string choices', () => {
    const choices = ['staging', 'production']
    expect(convertToSelectValue('staging', choices, 'target')).toBe('staging')
    expect(convertToSelectValue('production', choices, 'target')).toBe('production')
  })

  it('should convert SelectChoice array', () => {
    const choices = [
      { label: 'Staging', value: 'stg' },
      { label: 'Production', value: 'prd' },
    ]
    expect(convertToSelectValue('Staging', choices, 'target')).toBe('stg')
    expect(convertToSelectValue('stg', choices, 'target')).toBe('stg')
  })

  it('should throw error for invalid choice', () => {
    const choices = ['staging', 'production']
    expect(() => convertToSelectValue('invalid', choices, 'target')).toThrow(
      ArgValidationError,
    )
  })

  it('should include valid options in error message', () => {
    const choices = ['staging', 'production']
    try {
      convertToSelectValue('invalid', choices, 'target')
    } catch (e) {
      expect(e).toBeInstanceOf(ArgValidationError)
      expect((e as ArgValidationError).validOptions).toEqual(['staging', 'production'])
    }
  })
})

describe('convertToMultiSelectValue', () => {
  it('should convert comma-separated values', () => {
    const choices = ['a', 'b', 'c']
    expect(convertToMultiSelectValue('a,b', choices, 'items')).toEqual(['a', 'b'])
    expect(convertToMultiSelectValue('a,b,c', choices, 'items')).toEqual(['a', 'b', 'c'])
  })

  it('should trim whitespace', () => {
    const choices = ['a', 'b', 'c']
    expect(convertToMultiSelectValue('a, b, c', choices, 'items')).toEqual(['a', 'b', 'c'])
  })

  it('should throw error for invalid choice', () => {
    const choices = ['a', 'b', 'c']
    expect(() => convertToMultiSelectValue('a,invalid', choices, 'items')).toThrow(
      ArgValidationError,
    )
  })
})

describe('validateTextValue', () => {
  it('should return valid text', () => {
    expect(validateTextValue('hello', 'name')).toBe('hello')
  })

  it('should validate minLength', () => {
    expect(validateTextValue('hello', 'name', { minLength: 3 })).toBe('hello')
    expect(() => validateTextValue('hi', 'name', { minLength: 3 })).toThrow(
      ArgValidationError,
    )
  })

  it('should validate maxLength', () => {
    expect(validateTextValue('hi', 'name', { maxLength: 5 })).toBe('hi')
    expect(() => validateTextValue('hello world', 'name', { maxLength: 5 })).toThrow(
      ArgValidationError,
    )
  })

  it('should validate pattern', () => {
    expect(validateTextValue('abc123', 'name', { pattern: /^[a-z0-9]+$/ })).toBe('abc123')
    expect(() =>
      validateTextValue('ABC', 'name', { pattern: /^[a-z0-9]+$/ }),
    ).toThrow(ArgValidationError)
  })
})

describe('ArgValidationError', () => {
  it('should have correct properties', () => {
    const error = new ArgValidationError('target', 'invalid', 'Bad value', [
      'a',
      'b',
    ])
    expect(error.argName).toBe('target')
    expect(error.value).toBe('invalid')
    expect(error.reason).toBe('Bad value')
    expect(error.validOptions).toEqual(['a', 'b'])
  })

  it('should format message correctly', () => {
    const error = new ArgValidationError('target', 'invalid', 'Bad value', [
      'a',
      'b',
    ])
    expect(error.message).toBe("Invalid value 'invalid' for --target. Bad value Valid: a, b")
  })

  it('should handle no valid options', () => {
    const error = new ArgValidationError('port', 'abc', 'Expected a number.')
    expect(error.message).toBe("Invalid value 'abc' for --port. Expected a number.")
  })
})
