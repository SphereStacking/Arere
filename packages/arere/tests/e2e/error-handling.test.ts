/**
 * End-to-end tests for Error Handling
 *
 * Tests that errors are properly caught, reported,
 * and handled in various scenarios.
 */

import { defineAction } from '@/action/define.js'
import { runAction } from '@/action/executor.js'
import { describe, expect, it } from 'vitest'

describe('E2E: Error Handling', () => {
  describe('action errors', () => {
    it('should catch thrown Error', async () => {
      const action = defineAction({
        name: 'error-throw-test',
        description: 'Error throw test',
        async run() {
          throw new Error('Test error message')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Test error message')
    })

    it('should catch thrown string', async () => {
      const action = defineAction({
        name: 'error-string-test',
        description: 'Error string test',
        async run() {
          throw 'String error'
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should catch custom error types', async () => {
      class CustomError extends Error {
        constructor(
          message: string,
          public code: string,
        ) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const action = defineAction({
        name: 'error-custom-test',
        description: 'Custom error test',
        async run() {
          throw new CustomError('Custom error', 'ERR_CUSTOM')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Custom error')
    })
  })

  describe('async error handling', () => {
    it('should catch async/await errors', async () => {
      const action = defineAction({
        name: 'error-async-test',
        description: 'Async error test',
        async run() {
          await Promise.resolve()
          throw new Error('Async error')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Async error')
    })

    it('should catch rejected promises', async () => {
      const action = defineAction({
        name: 'error-promise-test',
        description: 'Promise rejection test',
        async run() {
          await Promise.reject(new Error('Promise rejected'))
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Promise rejected')
    })

    it('should catch errors in chained promises', async () => {
      const action = defineAction({
        name: 'error-chain-test',
        description: 'Promise chain error test',
        async run() {
          await Promise.resolve()
            .then(() => Promise.resolve())
            .then(() => {
              throw new Error('Chain error')
            })
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Chain error')
    })
  })

  describe('try-catch in actions', () => {
    it('should allow actions to handle errors internally', async () => {
      const action = defineAction({
        name: 'error-internal-test',
        description: 'Internal error handling test',
        async run({ tui }) {
          try {
            throw new Error('Internal error')
          } catch (error) {
            if (error instanceof Error) {
              tui.output.warn(`Caught: ${error.message}`)
            }
          }
          tui.output.success('Recovered!')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].type).toBe('warn')
      expect(messages[0].content).toBe('Caught: Internal error')
      expect(messages[1].type).toBe('success')
      expect(messages[1].content).toBe('Recovered!')
    })

    it('should allow partial error recovery', async () => {
      const action = defineAction({
        name: 'error-recovery-test',
        description: 'Partial recovery test',
        async run({ tui }) {
          const results: string[] = []

          // Step 1: succeeds
          results.push('step1')

          // Step 2: fails but caught
          try {
            throw new Error('Step 2 failed')
          } catch {
            tui.output.warn('Step 2 failed, skipping...')
          }

          // Step 3: succeeds
          results.push('step3')

          tui.output.log(`Completed: ${results.join(', ')}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[1].content).toBe('Completed: step1, step3')
    })
  })

  describe('error with output', () => {
    it('should capture error message', async () => {
      const action = defineAction({
        name: 'error-output-test',
        description: 'Error output test',
        async run({ tui }) {
          tui.output.log('Step 1 completed')
          throw new Error('Step 3 failed')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Step 3 failed')
      // Error is captured
      expect(result.error).toBeDefined()
    })
  })

  describe('error timing', () => {
    it('should record duration even on error', async () => {
      const action = defineAction({
        name: 'error-duration-test',
        description: 'Error duration test',
        async run() {
          throw new Error('Immediate error')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      // Duration should be recorded as a number
      expect(typeof result.duration).toBe('number')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('error types', () => {
    it('should handle TypeError', async () => {
      const action = defineAction({
        name: 'error-type-test',
        description: 'TypeError test',
        async run() {
          const obj: any = null
          obj.nonexistent()
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle RangeError', async () => {
      const action = defineAction({
        name: 'error-range-test',
        description: 'RangeError test',
        async run() {
          // biome-ignore lint/suspicious/noEvolvingTypes: testing error handling
          const arr = new Array(-1)
          // Use arr to avoid unused variable warning
          if (arr.length > 0) {
            // This won't be reached
          }
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle SyntaxError from JSON.parse', async () => {
      const action = defineAction({
        name: 'error-syntax-test',
        description: 'SyntaxError test',
        async run() {
          JSON.parse('invalid json')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('shell command errors', () => {
    it('should handle failed shell commands gracefully', async () => {
      const action = defineAction({
        name: 'error-shell-test',
        description: 'Shell error test',
        async run({ $ }) {
          const result = await $`nonexistent-command-12345`
          if (result.exitCode !== 0) {
            throw new Error(`Shell command failed with exit code: ${result.exitCode}`)
          }
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('Shell command failed')
    })
  })

  describe('cleanup on error', () => {
    it('should run finally block on error', async () => {
      let cleanupRan = false

      const action = defineAction({
        name: 'error-cleanup-test',
        description: 'Cleanup test',
        async run() {
          try {
            throw new Error('Process failed')
          } finally {
            cleanupRan = true
          }
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Process failed')
      // Finally block should have run
      expect(cleanupRan).toBe(true)
    })
  })
})
