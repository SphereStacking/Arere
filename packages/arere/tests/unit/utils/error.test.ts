/**
 * Tests for error utilities
 */

import {
  ActionExecutionError,
  ActionLoadError,
  ActionNotFoundError,
  ArereError,
  formatError,
} from '@/shared/utils/error.js'
import { describe, expect, it } from 'vitest'

describe('Error utilities', () => {
  describe('ArereError', () => {
    it('should create error with message', () => {
      const error = new ArereError('Test error')
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('ArereError')
    })

    it('should create error with code', () => {
      const error = new ArereError('Test error', 'TEST_CODE')
      expect(error.code).toBe('TEST_CODE')
    })
  })

  describe('ActionNotFoundError', () => {
    it('should create error with action name', () => {
      const error = new ActionNotFoundError('my-action')
      expect(error.message).toBe('アクションが見つかりません: my-action')
      expect(error.code).toBe('ACTION_NOT_FOUND')
      expect(error.name).toBe('ActionNotFoundError')
    })
  })

  describe('ActionLoadError', () => {
    it('should create error with file path', () => {
      const error = new ActionLoadError('/path/to/action.ts')
      expect(error.message).toBe('アクションの読み込みに失敗しました: /path/to/action.ts')
      expect(error.code).toBe('ACTION_LOAD_ERROR')
      expect(error.name).toBe('ActionLoadError')
    })

    it('should include cause error', () => {
      const cause = new Error('Original error')
      const error = new ActionLoadError('/path/to/action.ts', cause)
      expect(error.cause).toBe(cause)
    })
  })

  describe('ActionExecutionError', () => {
    it('should create error with action name', () => {
      const error = new ActionExecutionError('my-action')
      expect(error.message).toBe('アクションの実行に失敗しました: my-action')
      expect(error.code).toBe('ACTION_EXECUTION_ERROR')
      expect(error.name).toBe('ActionExecutionError')
    })

    it('should include cause error', () => {
      const cause = new Error('Execution failed')
      const error = new ActionExecutionError('my-action', cause)
      expect(error.cause).toBe(cause)
    })
  })

  describe('formatError', () => {
    it('should format ArereError with code', () => {
      const error = new ArereError('Test error', 'TEST_CODE')
      expect(formatError(error)).toBe('[TEST_CODE] Test error')
    })

    it('should format ArereError without code', () => {
      const error = new ArereError('Test error')
      expect(formatError(error)).toBe('Test error')
    })

    it('should format ArereError with cause', () => {
      const cause = new Error('Original error')
      const error = new ArereError('Test error', 'TEST_CODE')
      error.cause = cause
      expect(formatError(error)).toBe('[TEST_CODE] Test error\n原因: Original error')
    })

    it('should format regular Error', () => {
      const error = new Error('Regular error')
      expect(formatError(error)).toBe('Regular error')
    })

    it('should format non-Error values', () => {
      expect(formatError('string error')).toBe('string error')
      expect(formatError(123)).toBe('123')
      expect(formatError(null)).toBe('null')
    })
  })
})
