/**
 * End-to-end tests for Form API
 *
 * Tests that form prompts work correctly by setting up
 * a mock prompt handler that simulates user input.
 */

import { defineAction } from '@/domain/action/defineAction.js'
import { runAction } from '@/domain/action/executor.js'
import {
  clearPromptHandler,
  type PromptRequest,
  setPromptHandler,
} from '@/infrastructure/prompt/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('E2E: Form API', () => {
  let promptRequests: PromptRequest[] = []
  let promptResponses: unknown[] = []

  beforeEach(() => {
    promptRequests = []
    promptResponses = []
  })

  afterEach(() => {
    clearPromptHandler()
  })

  function setupPromptHandler(responses: unknown[]) {
    promptResponses = [...responses]
    setPromptHandler(async (request: PromptRequest) => {
      promptRequests.push(request)
      return promptResponses.shift()
    })
  }

  describe('basic form', () => {
    it('should capture form input with multiple fields', async () => {
      setupPromptHandler([{ name: 'John', age: 30 }])

      const action = defineAction({
        name: 'form-basic-test',
        description: 'Form basic test',
        async run({ tui }) {
          const result = await tui.prompt({
            title: 'User Registration',
            fields: {
              name: { type: 'text', message: 'Name' },
              age: { type: 'number', message: 'Age' },
            },
          })
          tui.output.log(`Name: ${result.name}, Age: ${result.age}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests.length).toBe(1)
      expect(promptRequests[0].type).toBe('form')

      if (promptRequests[0].type === 'form') {
        expect(promptRequests[0].form.title).toBe('User Registration')
        expect(promptRequests[0].form.fields).toHaveProperty('name')
        expect(promptRequests[0].form.fields).toHaveProperty('age')
      }

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Name: John, Age: 30')
    })

    it('should handle form with all field types', async () => {
      setupPromptHandler([
        {
          username: 'johndoe',
          age: 25,
          password: 'secret123',
          country: 'us',
          newsletter: true,
          interests: ['tech', 'music'],
        },
      ])

      const action = defineAction({
        name: 'form-all-types-test',
        description: 'Form all types test',
        async run({ tui }) {
          const result = await tui.prompt({
            title: 'Complete Registration',
            fields: {
              username: { type: 'text', message: 'Username' },
              age: { type: 'number', message: 'Age', min: 18 },
              password: { type: 'password', message: 'Password' },
              country: {
                type: 'select',
                message: 'Country',
                choices: [
                  { label: 'United States', value: 'us' },
                  { label: 'Japan', value: 'jp' },
                ],
              },
              newsletter: { type: 'confirm', message: 'Subscribe to newsletter?' },
              interests: {
                type: 'multiSelect',
                message: 'Interests',
                choices: ['tech', 'music', 'sports'],
              },
            },
          })
          tui.output.log(`User: ${result.username}`)
          tui.output.log(`Newsletter: ${result.newsletter}`)
          tui.output.log(`Interests: ${(result.interests as string[]).join(', ')}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests[0].type).toBe('form')

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('User: johndoe')
      expect(messages[1].content).toBe('Newsletter: true')
      expect(messages[2].content).toBe('Interests: tech, music')
    })

    it('should handle form with description', async () => {
      setupPromptHandler([{ email: 'test@example.com' }])

      const action = defineAction({
        name: 'form-description-test',
        description: 'Form description test',
        async run({ tui }) {
          await tui.prompt({
            title: 'Contact Form',
            description: 'Please enter your contact information',
            fields: {
              email: {
                type: 'text',
                message: 'Email',
                description: 'We will never share your email',
              },
            },
          })
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      if (promptRequests[0].type === 'form') {
        expect(promptRequests[0].form.description).toBe('Please enter your contact information')
        expect(promptRequests[0].form.fields.email.description).toBe(
          'We will never share your email',
        )
      }
    })

    it('should handle form with custom labels', async () => {
      setupPromptHandler([{ data: 'test' }])

      const action = defineAction({
        name: 'form-labels-test',
        description: 'Form labels test',
        async run({ tui }) {
          await tui.prompt({
            title: 'Custom Form',
            fields: {
              data: { type: 'text', message: 'Data' },
            },
            submitLabel: 'Save',
            cancelLabel: 'Discard',
          })
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      if (promptRequests[0].type === 'form') {
        expect(promptRequests[0].form.submitLabel).toBe('Save')
        expect(promptRequests[0].form.cancelLabel).toBe('Discard')
      }
    })
  })

  describe('form validation', () => {
    it('should include field validation in form request', async () => {
      setupPromptHandler([{ age: 25 }])

      const action = defineAction({
        name: 'form-validation-test',
        description: 'Form validation test',
        async run({ tui }) {
          await tui.prompt({
            fields: {
              age: {
                type: 'number',
                message: 'Age',
                validate: (value) => (value >= 18 ? true : 'Must be 18 or older'),
              },
            },
          })
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      if (promptRequests[0].type === 'form') {
        const ageField = promptRequests[0].form.fields.age
        expect(ageField.validate).toBeDefined()
      }
    })

    it('should include form-level validation', async () => {
      setupPromptHandler([{ password: 'secret', confirmPassword: 'secret' }])

      const action = defineAction({
        name: 'form-level-validation-test',
        description: 'Form level validation test',
        async run({ tui }) {
          await tui.prompt({
            fields: {
              password: { type: 'password', message: 'Password' },
              confirmPassword: { type: 'password', message: 'Confirm Password' },
            },
            validate: (values) =>
              values.password === values.confirmPassword ? true : 'Passwords must match',
          })
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      if (promptRequests[0].type === 'form') {
        expect(promptRequests[0].form.validate).toBeDefined()
      }
    })
  })

  describe('step form', () => {
    it('should accept step form (array syntax)', async () => {
      setupPromptHandler([{ name: 'John', email: 'john@example.com' }])

      const action = defineAction({
        name: 'step-form-test',
        description: 'Step form test',
        async run({ tui }) {
          // Array of forms = step form
          const result = await tui.prompt([
            { fields: { name: { type: 'text', message: 'Name' } } },
            { fields: { email: { type: 'text', message: 'Email' } } },
          ])
          tui.output.log(`${result.name}: ${result.email}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests[0].type).toBe('stepForm')
    })
  })

  describe('shorthand methods still work', () => {
    it('should work alongside shorthand prompt methods', async () => {
      setupPromptHandler(['John', { email: 'john@example.com' }])

      const action = defineAction({
        name: 'mixed-prompt-test',
        description: 'Mixed prompt test',
        async run({ tui }) {
          // Use shorthand first
          const name = await tui.prompt.text('Name:')
          // Then use form
          const form = await tui.prompt({
            fields: {
              email: { type: 'text', message: 'Email' },
            },
          })
          tui.output.log(`${name}: ${form.email}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests.length).toBe(2)
      expect(promptRequests[0].type).toBe('text')
      expect(promptRequests[1].type).toBe('form')

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('John: john@example.com')
    })
  })
})
