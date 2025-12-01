/**
 * Format transformers unit tests
 */

import { applyFormat } from '@/ui/prompts/formatters'
import { describe, expect, it } from 'vitest'

describe('applyFormat', () => {
  describe('lowercase preset', () => {
    it('should convert text to lowercase', () => {
      expect(applyFormat('HELLO', 'lowercase')).toBe('hello')
      expect(applyFormat('Hello World', 'lowercase')).toBe('hello world')
      expect(applyFormat('MiXeD CaSe', 'lowercase')).toBe('mixed case')
    })

    it('should handle empty string', () => {
      expect(applyFormat('', 'lowercase')).toBe('')
    })

    it('should handle already lowercase text', () => {
      expect(applyFormat('already lowercase', 'lowercase')).toBe('already lowercase')
    })
  })

  describe('uppercase preset', () => {
    it('should convert text to uppercase', () => {
      expect(applyFormat('hello', 'uppercase')).toBe('HELLO')
      expect(applyFormat('Hello World', 'uppercase')).toBe('HELLO WORLD')
      expect(applyFormat('MiXeD CaSe', 'uppercase')).toBe('MIXED CASE')
    })

    it('should handle empty string', () => {
      expect(applyFormat('', 'uppercase')).toBe('')
    })

    it('should handle already uppercase text', () => {
      expect(applyFormat('ALREADY UPPERCASE', 'uppercase')).toBe('ALREADY UPPERCASE')
    })
  })

  describe('trim preset', () => {
    it('should remove leading and trailing whitespace', () => {
      expect(applyFormat('  hello  ', 'trim')).toBe('hello')
      expect(applyFormat('\thello\t', 'trim')).toBe('hello')
      expect(applyFormat('\n\nhello\n\n', 'trim')).toBe('hello')
    })

    it('should preserve internal whitespace', () => {
      expect(applyFormat('  hello  world  ', 'trim')).toBe('hello  world')
    })

    it('should handle empty string', () => {
      expect(applyFormat('', 'trim')).toBe('')
    })

    it('should handle string with only whitespace', () => {
      expect(applyFormat('   ', 'trim')).toBe('')
    })
  })

  describe('kebab-case preset', () => {
    it('should convert spaces to hyphens', () => {
      expect(applyFormat('hello world', 'kebab-case')).toBe('hello-world')
      expect(applyFormat('multiple   spaces', 'kebab-case')).toBe('multiple-spaces')
    })

    it('should convert to lowercase', () => {
      expect(applyFormat('Hello World', 'kebab-case')).toBe('hello-world')
      expect(applyFormat('UPPERCASE TEXT', 'kebab-case')).toBe('uppercase-text')
    })

    it('should remove non-alphanumeric characters except hyphens', () => {
      expect(applyFormat('hello@world!', 'kebab-case')).toBe('helloworld')
      expect(applyFormat('special#chars$here', 'kebab-case')).toBe('specialcharshere')
      expect(applyFormat('hello_world', 'kebab-case')).toBe('helloworld')
    })

    it('should preserve existing hyphens', () => {
      expect(applyFormat('already-kebab', 'kebab-case')).toBe('already-kebab')
      expect(applyFormat('multiple-word-example', 'kebab-case')).toBe('multiple-word-example')
    })

    it('should trim whitespace before processing', () => {
      expect(applyFormat('  hello world  ', 'kebab-case')).toBe('hello-world')
    })

    it('should preserve numbers', () => {
      expect(applyFormat('version 2.0', 'kebab-case')).toBe('version-20')
      expect(applyFormat('test-123', 'kebab-case')).toBe('test-123')
    })

    it('should handle empty string', () => {
      expect(applyFormat('', 'kebab-case')).toBe('')
    })

    it('should handle complex plugin names', () => {
      expect(applyFormat('My Awesome Plugin', 'kebab-case')).toBe('my-awesome-plugin')
      expect(applyFormat('API Client v2', 'kebab-case')).toBe('api-client-v2')
    })
  })

  describe('custom function', () => {
    it('should apply custom transformation function', () => {
      const customFormat = (value: string) => value.split('').reverse().join('')
      expect(applyFormat('hello', customFormat)).toBe('olleh')
    })

    it('should support custom complex transformations', () => {
      const customFormat = (value: string) => {
        return value
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }
      expect(applyFormat('hello world', customFormat)).toBe('Hello World')
    })

    it('should handle custom function returning empty string', () => {
      const customFormat = () => ''
      expect(applyFormat('anything', customFormat)).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle unicode characters', () => {
      expect(applyFormat('こんにちは', 'lowercase')).toBe('こんにちは')
      expect(applyFormat('Café', 'lowercase')).toBe('café')
      expect(applyFormat('hello 世界', 'kebab-case')).toBe('hello-')
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000)
      expect(applyFormat(longString, 'uppercase')).toBe('A'.repeat(10000))
    })
  })
})
