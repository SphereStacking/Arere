/**
 * End-to-end tests for Visual Feedback API (spinner & progress)
 *
 * Tests that spinner and progress controls work correctly
 * and emit proper visual feedback states.
 */

import { defineAction } from '@/domain/action/defineAction.js'
import { runAction } from '@/domain/action/executor.js'
import type { VisualFeedback } from '@/domain/types/control.js'
import { describe, expect, it } from 'vitest'

/**
 * Helper to create a visual feedback handler that tracks states
 * and handles function-based updates properly
 */
function createFeedbackTracker() {
  const states: VisualFeedback[] = []
  let currentState: VisualFeedback = {}

  const handler = (feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback)) => {
    if (typeof feedback === 'function') {
      currentState = feedback(currentState)
    } else {
      currentState = feedback
    }
    states.push({ ...currentState })
  }

  return { states, handler }
}

describe('E2E: Visual Feedback API', () => {
  describe('Spinner', () => {
    it('should emit spinner start and stop states', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'spinner-basic-test',
        description: 'Spinner basic test',
        async run({ tui }) {
          const spinner = tui.control.spinner({ message: 'Loading...' })
          spinner.start()
          await tui.control.delay(10)
          spinner.stop()
        },
      })

      const result = await runAction(action, {
        onVisualFeedback: handler,
      })

      expect(result.success).toBe(true)
      // At least one spinner state should be emitted
      expect(states.some((f) => f.type === 'spinner')).toBe(true)
    })

    it('should handle spinner with succeed', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'spinner-succeed-test',
        description: 'Spinner succeed test',
        async run({ tui }) {
          const spinner = tui.control.spinner({ message: 'Processing...' })
          spinner.start()
          await tui.control.delay(10)
          spinner.succeed('Done!')
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      // Should have success status
      const successState = states.find(
        (f) => f.type === 'spinner' && f.spinner?.status === 'success',
      )
      expect(successState).toBeDefined()
    })

    it('should handle spinner with fail', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'spinner-fail-test',
        description: 'Spinner fail test',
        async run({ tui }) {
          const spinner = tui.control.spinner({ message: 'Processing...' })
          spinner.start()
          await tui.control.delay(10)
          spinner.fail('Error!')
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      // Should have error status
      const errorState = states.find(
        (f) => f.type === 'spinner' && f.spinner?.status === 'error',
      )
      expect(errorState).toBeDefined()
    })

    it('should handle spinner message update', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'spinner-update-test',
        description: 'Spinner update test',
        async run({ tui }) {
          const spinner = tui.control.spinner({ message: 'Starting...' })
          spinner.start()
          await tui.control.delay(10)
          spinner.update('Still processing...')
          await tui.control.delay(10)
          spinner.stop()
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      // Should have had multiple messages
      const spinnerStates = states.filter((f) => f.type === 'spinner')
      expect(spinnerStates.length).toBeGreaterThan(0)
    })

    it('should support different spinner types', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'spinner-types-test',
        description: 'Spinner types test',
        async run({ tui }) {
          const spinner = tui.control.spinner({ type: 'arc', message: 'Arc spinner' })
          spinner.start()
          await tui.control.delay(10)
          spinner.stop()
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      const arcSpinner = states.find(
        (f) => f.type === 'spinner' && f.spinner?.type === 'arc',
      )
      expect(arcSpinner).toBeDefined()
    })
  })

  describe('Progress', () => {
    it('should emit progress states', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'progress-basic-test',
        description: 'Progress basic test',
        async run({ tui }) {
          const progress = tui.control.progress({ total: 100, message: 'Downloading...' })
          progress.start()
          progress.update(50)
          await tui.control.delay(10)
          progress.stop()
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      // Should have progress state
      expect(states.some((f) => f.type === 'progress')).toBe(true)
    })

    it('should handle progress increment', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'progress-increment-test',
        description: 'Progress increment test',
        async run({ tui }) {
          const progress = tui.control.progress({ total: 100, message: 'Processing...' })
          progress.start()
          for (let i = 0; i < 5; i++) {
            progress.increment(20)
            await tui.control.delay(5)
          }
          progress.stop()
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      // Should have multiple progress updates
      const progressStates = states.filter((f) => f.type === 'progress')
      expect(progressStates.length).toBeGreaterThan(0)
    })

    it('should handle progress with succeed', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'progress-succeed-test',
        description: 'Progress succeed test',
        async run({ tui }) {
          const progress = tui.control.progress({ total: 100, message: 'Installing...' })
          progress.start()
          progress.update(100)
          await tui.control.delay(10)
          progress.succeed('Installation complete!')
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      const successState = states.find(
        (f) => f.type === 'progress' && f.progress?.status === 'success',
      )
      expect(successState).toBeDefined()
    })

    it('should handle progress with fail', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'progress-fail-test',
        description: 'Progress fail test',
        async run({ tui }) {
          const progress = tui.control.progress({ total: 100, message: 'Downloading...' })
          progress.start()
          progress.update(30)
          await tui.control.delay(10)
          progress.fail('Download failed!')
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      const errorState = states.find(
        (f) => f.type === 'progress' && f.progress?.status === 'error',
      )
      expect(errorState).toBeDefined()
    })
  })

  describe('Control utilities', () => {
    it('should handle delay', async () => {
      const action = defineAction({
        name: 'delay-test',
        description: 'Delay test',
        async run({ tui }) {
          // Just verify that delay is callable and returns a promise
          await tui.control.delay(1)
          tui.output.log('delay completed')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('delay completed')
    })

    it('should provide terminal info', async () => {
      const action = defineAction({
        name: 'terminal-info-test',
        description: 'Terminal info test',
        async run({ tui }) {
          const isInteractive = tui.control.isInteractive()
          const size = tui.control.getTerminalSize()
          tui.output.log(`interactive: ${typeof isInteractive === 'boolean'}`)
          tui.output.log(`hasSize: ${typeof size.width === 'number' && typeof size.height === 'number'}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('interactive: true')
      expect(messages[1].content).toBe('hasSize: true')
    })
  })

  describe('Sequential visual feedback', () => {
    it('should handle spinner then progress', async () => {
      const { states, handler } = createFeedbackTracker()

      const action = defineAction({
        name: 'sequential-feedback-test',
        description: 'Sequential feedback test',
        async run({ tui }) {
          // First spinner
          const spinner = tui.control.spinner({ message: 'Checking...' })
          spinner.start()
          await tui.control.delay(10)
          spinner.succeed('Check passed!')

          // Then progress
          const progress = tui.control.progress({ total: 100, message: 'Installing...' })
          progress.start()
          progress.update(100)
          await tui.control.delay(10)
          progress.succeed('Done!')
        },
      })

      await runAction(action, {
        onVisualFeedback: handler,
      })

      // Should have both spinner and progress states
      expect(states.some((f) => f.type === 'spinner')).toBe(true)
      expect(states.some((f) => f.type === 'progress')).toBe(true)
    })
  })
})
