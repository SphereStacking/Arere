/**
 * Tests for plain text renderer
 */

import { PlainTextRenderer } from '@/infrastructure/output/plain-renderer.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('PlainTextRenderer', () => {
  let renderer: PlainTextRenderer
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    renderer = new PlainTextRenderer()
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {}) as any
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}) as any
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {}) as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('log', () => {
    it('should output plain text', () => {
      renderer.log('test message')
      expect(consoleLogSpy).toHaveBeenCalledWith('test message')
    })

    it('should handle multiple arguments', () => {
      renderer.log('test', 123, true)
      expect(consoleLogSpy).toHaveBeenCalledWith('test', 123, true)
    })
  })

  describe('success', () => {
    it('should output success message with checkmark', () => {
      renderer.success('Operation completed')
      expect(consoleLogSpy).toHaveBeenCalledWith('✔ Operation completed')
    })
  })

  describe('error', () => {
    it('should output error message with cross', () => {
      renderer.error('Operation failed')
      expect(consoleErrorSpy).toHaveBeenCalledWith('✖ Operation failed')
    })
  })

  describe('warn', () => {
    it('should output warning message with warning symbol', () => {
      renderer.warn('Warning message')
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠ Warning message')
    })
  })

  describe('info', () => {
    it('should output info message with info symbol', () => {
      renderer.info('Info message')
      expect(consoleLogSpy).toHaveBeenCalledWith('ℹ Info message')
    })
  })

  describe('newline', () => {
    it('should output empty line', () => {
      renderer.newline()
      expect(consoleLogSpy).toHaveBeenCalledWith()
    })
  })

  describe('code', () => {
    it('should output code with backticks', () => {
      renderer.code('const x = 42')
      expect(consoleLogSpy).toHaveBeenCalledWith('`const x = 42`')
    })
  })

  describe('section', () => {
    it('should output section header with separators', () => {
      renderer.section('Section Title')
      expect(consoleLogSpy).toHaveBeenCalledWith('\n=== Section Title ===\n')
    })
  })

  describe('list', () => {
    it('should output bullet list', () => {
      renderer.list(['Item 1', 'Item 2', 'Item 3'])
      expect(consoleLogSpy).toHaveBeenCalledTimes(3)
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '  • Item 1')
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, '  • Item 2')
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, '  • Item 3')
    })

    it('should handle empty list', () => {
      renderer.list([])
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('keyValue', () => {
    it('should output key-value pairs', () => {
      renderer.keyValue({ name: 'test', value: 42, active: true })
      expect(consoleLogSpy).toHaveBeenCalledWith() // Empty line before
      expect(consoleLogSpy).toHaveBeenCalledWith('  name: test')
      expect(consoleLogSpy).toHaveBeenCalledWith('  value: 42')
      expect(consoleLogSpy).toHaveBeenCalledWith('  active: true')
      expect(consoleLogSpy).toHaveBeenCalledWith() // Empty line after
    })
  })

  describe('table', () => {
    it('should output formatted table', () => {
      const data = [
        { name: 'Alice', age: 30, city: 'Tokyo' },
        { name: 'Bob', age: 25, city: 'Osaka' },
      ]
      renderer.table(data)

      // Check header
      expect(consoleLogSpy).toHaveBeenCalledWith('  name | age | city')
      expect(consoleLogSpy).toHaveBeenCalledWith('  --- | --- | ---')

      // Check rows
      expect(consoleLogSpy).toHaveBeenCalledWith('  Alice | 30 | Tokyo')
      expect(consoleLogSpy).toHaveBeenCalledWith('  Bob | 25 | Osaka')
    })

    it('should handle empty table', () => {
      renderer.table([])
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should handle missing values', () => {
      const data = [{ name: 'Alice', age: 30 }, { name: 'Bob' }]
      renderer.table(data)

      expect(consoleLogSpy).toHaveBeenCalledWith('  Alice | 30')
      expect(consoleLogSpy).toHaveBeenCalledWith('  Bob | ')
    })
  })

  describe('json', () => {
    it('should output formatted JSON', () => {
      const data = { name: 'test', value: 42 }
      renderer.json(data)
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2))
    })

    it('should respect custom indent', () => {
      const data = { name: 'test' }
      renderer.json(data, 4)
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 4))
    })
  })

  describe('separator', () => {
    it('should output separator line with default character', () => {
      renderer.separator()
      expect(consoleLogSpy).toHaveBeenCalledWith('-'.repeat(40))
    })

    it('should use custom character', () => {
      renderer.separator('=')
      expect(consoleLogSpy).toHaveBeenCalledWith('='.repeat(40))
    })

    it('should use custom length', () => {
      renderer.separator('-', 20)
      expect(consoleLogSpy).toHaveBeenCalledWith('-'.repeat(20))
    })
  })

  describe('step', () => {
    it('should output numbered step', () => {
      renderer.step(1, 'First step')
      expect(consoleLogSpy).toHaveBeenCalledWith('\n[1] First step')
    })

    it('should handle different step numbers', () => {
      renderer.step(42, 'Step description')
      expect(consoleLogSpy).toHaveBeenCalledWith('\n[42] Step description')
    })
  })
})
