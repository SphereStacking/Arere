/**
 * End-to-end tests for Prompt API
 *
 * Tests that prompt methods work correctly by setting up
 * a mock prompt handler that simulates user input.
 */

import { defineAction } from '@/action/define.js'
import { runAction } from '@/action/executor.js'
import {
  clearPromptHandler,
  type PromptRequest,
  setPromptHandler,
} from '@/ui/prompts/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('E2E: Prompt API', () => {
  // Store prompt requests for verification
  let promptRequests: PromptRequest[] = []
  let promptResponses: unknown[] = []

  beforeEach(() => {
    promptRequests = []
    promptResponses = []
  })

  afterEach(() => {
    clearPromptHandler()
  })

  /**
   * Helper to set up a prompt handler with predefined responses
   */
  function setupPromptHandler(responses: unknown[]) {
    promptResponses = [...responses]
    setPromptHandler(async (request: PromptRequest) => {
      promptRequests.push(request)
      return promptResponses.shift()
    })
  }

  describe('text prompt', () => {
    it('should capture text input', async () => {
      setupPromptHandler(['Hello World'])

      const action = defineAction({
        name: 'text-prompt-test',
        description: 'Text prompt test',
        async run({ tui }) {
          const name = await tui.prompt.text('Enter your name:')
          tui.output.log(`Name: ${name}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests.length).toBe(1)
      const request = promptRequests[0]
      expect(request.type).toBe('text')
      if (request.type === 'text') {
        expect(request.message).toBe('Enter your name:')
      }

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Name: Hello World')
    })

    it('should handle text with default value', async () => {
      setupPromptHandler([''])

      const action = defineAction({
        name: 'text-default-test',
        description: 'Text default test',
        async run({ tui }) {
          const name = await tui.prompt.text('Enter your name:', { defaultValue: 'Anonymous' })
          tui.output.log(`Name: ${name}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const request = promptRequests[0]
      if (request.type === 'text') {
        expect(request.options?.defaultValue).toBe('Anonymous')
      }
    })
  })

  describe('number prompt', () => {
    it('should capture number input', async () => {
      setupPromptHandler([42])

      const action = defineAction({
        name: 'number-prompt-test',
        description: 'Number prompt test',
        async run({ tui }) {
          const age = await tui.prompt.number('Enter your age:')
          tui.output.log(`Age: ${age}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests.length).toBe(1)
      const request = promptRequests[0]
      expect(request.type).toBe('number')
      if (request.type === 'number') {
        expect(request.message).toBe('Enter your age:')
      }

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Age: 42')
    })

    it('should handle number with min/max options', async () => {
      setupPromptHandler([25])

      const action = defineAction({
        name: 'number-options-test',
        description: 'Number options test',
        async run({ tui }) {
          await tui.prompt.number('Enter your age:', { min: 18, max: 100 })
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const request = promptRequests[0]
      if (request.type === 'number') {
        expect(request.options?.min).toBe(18)
        expect(request.options?.max).toBe(100)
      }
    })
  })

  describe('password prompt', () => {
    it('should capture password input', async () => {
      setupPromptHandler(['secret123'])

      const action = defineAction({
        name: 'password-prompt-test',
        description: 'Password prompt test',
        async run({ tui }) {
          const password = await tui.prompt.password('Enter your password:')
          tui.output.log(`Password length: ${String(password).length}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests.length).toBe(1)
      expect(promptRequests[0].type).toBe('password')

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Password length: 9')
    })
  })

  describe('confirm prompt', () => {
    it('should capture confirm input (yes)', async () => {
      setupPromptHandler([true])

      const action = defineAction({
        name: 'confirm-yes-test',
        description: 'Confirm yes test',
        async run({ tui }) {
          const proceed = await tui.prompt.confirm('Do you want to continue?')
          tui.output.log(`Proceed: ${proceed}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests[0].type).toBe('confirm')

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Proceed: true')
    })

    it('should capture confirm input (no)', async () => {
      setupPromptHandler([false])

      const action = defineAction({
        name: 'confirm-no-test',
        description: 'Confirm no test',
        async run({ tui }) {
          const proceed = await tui.prompt.confirm('Do you want to continue?')
          tui.output.log(`Proceed: ${proceed}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Proceed: false')
    })
  })

  describe('select prompt', () => {
    it('should capture selection', async () => {
      setupPromptHandler(['typescript'])

      const action = defineAction({
        name: 'select-prompt-test',
        description: 'Select prompt test',
        async run({ tui }) {
          const language = await tui.prompt.select('Choose a language:', [
            { label: 'JavaScript', value: 'javascript' },
            { label: 'TypeScript', value: 'typescript' },
            { label: 'Python', value: 'python' },
          ])
          tui.output.log(`Selected: ${language}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests[0].type).toBe('select')
      expect(promptRequests[0]).toHaveProperty('choices')
      expect((promptRequests[0] as any).choices.length).toBe(3)

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Selected: typescript')
    })
  })

  describe('multiSelect prompt', () => {
    it('should capture multiple selections', async () => {
      setupPromptHandler([['typescript', 'python']])

      const action = defineAction({
        name: 'multiselect-prompt-test',
        description: 'MultiSelect prompt test',
        async run({ tui }) {
          const languages = await tui.prompt.multiSelect('Choose languages:', [
            { label: 'JavaScript', value: 'javascript' },
            { label: 'TypeScript', value: 'typescript' },
            { label: 'Python', value: 'python' },
          ])
          tui.output.log(`Selected: ${(languages as string[]).join(', ')}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests[0].type).toBe('multiSelect')

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Selected: typescript, python')
    })
  })

  describe('waitForEnter (via control API)', () => {
    it('should wait for enter key', async () => {
      setupPromptHandler([undefined])

      const action = defineAction({
        name: 'wait-enter-test',
        description: 'Wait for enter test',
        async run({ tui }) {
          tui.output.log('Press Enter to continue...')
          await tui.control.waitForEnter('Press Enter')
          tui.output.log('Continued!')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests[0].type).toBe('waitForEnter')

      const messages = result.outputCollector.getMessages()
      expect(messages.length).toBe(2)
      expect(messages[1].content).toBe('Continued!')
    })
  })

  describe('waitForKey (via control API)', () => {
    it('should wait for specific key', async () => {
      setupPromptHandler(['y'])

      const action = defineAction({
        name: 'wait-key-test',
        description: 'Wait for key test',
        async run({ tui }) {
          const key = await tui.control.waitForKey({ message: 'Press Y or N:', keys: ['y', 'n'] })
          tui.output.log(`Pressed: ${key}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests[0].type).toBe('waitForKey')
      expect((promptRequests[0] as any).keys).toEqual(['y', 'n'])

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Pressed: y')
    })
  })

  describe('multiple prompts in sequence', () => {
    it('should handle multiple prompts', async () => {
      setupPromptHandler(['John', 30, true])

      const action = defineAction({
        name: 'multi-prompt-test',
        description: 'Multiple prompts test',
        async run({ tui }) {
          const name = await tui.prompt.text('Name:')
          const age = await tui.prompt.number('Age:')
          const confirm = await tui.prompt.confirm('Confirm?')
          tui.output.log(`Name: ${name}, Age: ${age}, Confirmed: ${confirm}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests.length).toBe(3)
      expect(promptRequests[0].type).toBe('text')
      expect(promptRequests[1].type).toBe('number')
      expect(promptRequests[2].type).toBe('confirm')

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Name: John, Age: 30, Confirmed: true')
    })
  })

  describe('prompt cancellation', () => {
    it('should handle null response (cancellation)', async () => {
      setupPromptHandler([null])

      const action = defineAction({
        name: 'cancel-test',
        description: 'Cancellation test',
        async run({ tui }) {
          const name = await tui.prompt.text('Name:')
          if (name === null) {
            tui.output.log('Cancelled')
          } else {
            tui.output.log(`Name: ${name}`)
          }
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Cancelled')
    })
  })
})
