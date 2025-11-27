/**
 * End-to-end tests for action execution
 */

import { defineAction } from '@/domain/action/defineAction.js'
import { runAction } from '@/domain/action/executor.js'
import { clearPromptHandler, setPromptHandler } from '@/infrastructure/prompt/renderer.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('E2E: Action Execution', () => {
  beforeEach(() => {
    // Set up a basic prompt handler for testing
    setPromptHandler(async (request) => {
      switch (request.type) {
        case 'text':
          return 'test input'
        case 'select':
          return (request.choices as any)[0]?.value
        case 'confirm':
          return true
        case 'multiSelect':
          return [(request.choices as any)[0]?.value]
        default:
          return null
      }
    })
  })

  afterEach(() => {
    clearPromptHandler()
  })

  it('should run a simple action', async () => {
    const action = defineAction({
      name: 'simple-test',
      description: 'Simple test action',
      async run() {
        // Do nothing
      },
    })

    const result = await runAction(action)

    expect(result.success).toBe(true)
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('should run an action with shell commands', async () => {
    const action = defineAction({
      name: 'shell-test',
      description: 'Shell test action',
      async run({ $ }) {
        const result = await $`echo "test"`
        expect(result.stdout).toBe('test')
        expect(result.exitCode).toBe(0)
      },
    })

    const result = await runAction(action)

    expect(result.success).toBe(true)
  })

  it('should run an action with prompts', async () => {
    const action = defineAction({
      name: 'prompt-test',
      description: 'Prompt test action',
      async run({ tui }) {
        const text = await tui.prompt.text('Enter text:')
        expect(text).toBe('test input')

        const selected = await tui.prompt.select('Select:', ['a', 'b'])
        expect(selected).toBe('a')

        const confirmed = await tui.prompt.confirm('Confirm?')
        expect(confirmed).toBe(true)

        const multiSelected = await tui.prompt.multiSelect('Multi select:', ['x', 'y'])
        expect(multiSelected).toEqual(['x'])
      },
    })

    const result = await runAction(action)

    expect(result.success).toBe(true)
  })

  it('should handle action errors', async () => {
    const action = defineAction({
      name: 'error-test',
      description: 'Error test action',
      async run() {
        throw new Error('Test error')
      },
    })

    const result = await runAction(action)

    expect(result.success).toBe(false)
    expect(result.error?.message).toBe('Test error')
  })

  it('should provide correct context', async () => {
    const action = defineAction({
      name: 'context-test',
      description: 'Context test action',
      async run({ cwd, env }) {
        expect(typeof cwd).toBe('string')
        expect(cwd.length).toBeGreaterThan(0)
        expect(typeof env).toBe('object')
        expect(env).not.toBeNull()
      },
    })

    const result = await runAction(action)

    expect(result.success).toBe(true)
  })

  it('should handle shell command errors gracefully', async () => {
    const action = defineAction({
      name: 'shell-error-test',
      description: 'Shell error test action',
      async run({ $ }) {
        const result = await $`exit 1`
        expect(result.exitCode).toBe(1)
      },
    })

    const result = await runAction(action)

    expect(result.success).toBe(true)
  })
})
