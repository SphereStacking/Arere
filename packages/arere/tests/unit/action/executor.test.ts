/**
 * Tests for action executor
 */

import { runAction } from '@/action/executor.js'
import type { Action } from '@/action/types.js'
import { describe, expect, it, vi } from 'vitest'

describe('runAction', () => {
  it('should run an action successfully', async () => {
    const action: Action = {
      meta: {
        name: 'test-action',
        description: 'Test action',
      },
      filePath: '/test/action.ts',
      run: vi.fn().mockResolvedValue(undefined),
    }

    const result = await runAction(action)

    expect(result.success).toBe(true)
    expect(result.duration).toBeGreaterThanOrEqual(0)
    expect(result.error).toBeUndefined()
    expect(action.run).toHaveBeenCalledTimes(1)
  })

  it('should pass context to action run function', async () => {
    const runFn = vi.fn().mockResolvedValue(undefined)
    const action: Action = {
      meta: {
        name: 'test-action',
        description: 'Test action',
      },
      filePath: '/test/action.ts',
      run: runFn,
    }

    await runAction(action)

    expect(runFn).toHaveBeenCalledWith(
      expect.objectContaining({
        tui: expect.any(Object),
        $: expect.any(Function),
        cwd: expect.any(String),
        env: expect.any(Object),
      }),
    )
  })

  it('should handle action errors', async () => {
    const error = new Error('Test error')
    const action: Action = {
      meta: {
        name: 'test-action',
        description: 'Test action',
      },
      filePath: '/test/action.ts',
      run: vi.fn().mockRejectedValue(error),
    }

    const result = await runAction(action)

    expect(result.success).toBe(false)
    expect(result.duration).toBeGreaterThanOrEqual(0)
    expect(result.error).toBe(error)
  })

  it('should measure execution duration', async () => {
    const action: Action = {
      meta: {
        name: 'test-action',
        description: 'Test action',
      },
      filePath: '/test/action.ts',
      run: vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }),
    }

    const result = await runAction(action)

    expect(result.duration).toBeGreaterThanOrEqual(10)
  })

  describe('args option', () => {
    it('should pass empty args by default', async () => {
      const runFn = vi.fn().mockResolvedValue(undefined)
      const action: Action = {
        meta: {
          name: 'test-action',
          description: 'Test action',
        },
        filePath: '/test/action.ts',
        run: runFn,
      }

      await runAction(action)

      expect(runFn).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [],
        }),
      )
    })

    it('should pass args to action context', async () => {
      const runFn = vi.fn().mockResolvedValue(undefined)
      const action: Action = {
        meta: {
          name: 'test-action',
          description: 'Test action',
        },
        filePath: '/test/action.ts',
        run: runFn,
      }

      await runAction(action, { args: ['production', '--force'] })

      expect(runFn).toHaveBeenCalledWith(
        expect.objectContaining({
          args: ['production', '--force'],
        }),
      )
    })

    it('should allow action to access args', async () => {
      let capturedArgs: string[] = []
      const action: Action = {
        meta: {
          name: 'test-action',
          description: 'Test action',
        },
        filePath: '/test/action.ts',
        run: async (ctx) => {
          capturedArgs = ctx.args
        },
      }

      await runAction(action, { args: ['arg1', 'arg2', '--flag'] })

      expect(capturedArgs).toEqual(['arg1', 'arg2', '--flag'])
    })
  })
})
