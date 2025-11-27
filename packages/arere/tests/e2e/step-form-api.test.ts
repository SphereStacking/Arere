/**
 * End-to-end tests for Step Form API
 *
 * Tests that step forms (wizard-style multi-page forms) work correctly
 * by setting up a mock prompt handler that simulates user input.
 */

import { defineAction } from '@/domain/action/defineAction.js'
import { runAction } from '@/domain/action/executor.js'
import {
  clearPromptHandler,
  type PromptRequest,
  setPromptHandler,
} from '@/infrastructure/prompt/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('E2E: Step Form API', () => {
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

  describe('basic step form', () => {
    it('should capture input from multiple steps', async () => {
      // Response contains merged values from all steps
      setupPromptHandler([{ name: 'John', email: 'john@example.com' }])

      const action = defineAction({
        name: 'step-form-basic-test',
        description: 'Step form basic test',
        async run({ tui }) {
          const result = await tui.prompt([
            {
              title: 'Step 1: Basic Info',
              fields: {
                name: { type: 'text', message: 'Name' },
              },
            },
            {
              title: 'Step 2: Contact',
              fields: {
                email: { type: 'text', message: 'Email' },
              },
            },
          ])
          tui.output.log(`Name: ${result.name}, Email: ${result.email}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests.length).toBe(1)
      expect(promptRequests[0].type).toBe('stepForm')

      if (promptRequests[0].type === 'stepForm') {
        expect(promptRequests[0].steps.length).toBe(2)
        expect(promptRequests[0].steps[0].title).toBe('Step 1: Basic Info')
        expect(promptRequests[0].steps[1].title).toBe('Step 2: Contact')
      }

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Name: John, Email: john@example.com')
    })

    it('should handle three or more steps', async () => {
      setupPromptHandler([
        {
          name: 'Alice',
          age: 25,
          country: 'jp',
        },
      ])

      const action = defineAction({
        name: 'step-form-three-steps-test',
        description: 'Step form three steps test',
        async run({ tui }) {
          const result = await tui.prompt([
            { fields: { name: { type: 'text', message: 'Name' } } },
            { fields: { age: { type: 'number', message: 'Age' } } },
            {
              fields: {
                country: {
                  type: 'select',
                  message: 'Country',
                  choices: [
                    { label: 'USA', value: 'us' },
                    { label: 'Japan', value: 'jp' },
                  ],
                },
              },
            },
          ])
          tui.output.log(`${result.name}, ${result.age}, ${result.country}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      if (promptRequests[0].type === 'stepForm') {
        expect(promptRequests[0].steps.length).toBe(3)
      }

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Alice, 25, jp')
    })

    it('should handle step with multiple fields', async () => {
      setupPromptHandler([
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
      ])

      const action = defineAction({
        name: 'step-form-multi-field-test',
        description: 'Step form multi field test',
        async run({ tui }) {
          const result = await tui.prompt([
            {
              title: 'Personal Info',
              fields: {
                firstName: { type: 'text', message: 'First Name' },
                lastName: { type: 'text', message: 'Last Name' },
              },
            },
            {
              title: 'Contact Info',
              fields: {
                email: { type: 'text', message: 'Email' },
                phone: { type: 'text', message: 'Phone' },
              },
            },
          ])
          tui.output.log(`${result.firstName} ${result.lastName}`)
          tui.output.log(`${result.email}, ${result.phone}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('John Doe')
      expect(messages[1].content).toBe('john@example.com, 123-456-7890')
    })
  })

  describe('step form with descriptions', () => {
    it('should pass step descriptions', async () => {
      setupPromptHandler([{ data: 'test' }])

      const action = defineAction({
        name: 'step-form-description-test',
        description: 'Step form description test',
        async run({ tui }) {
          await tui.prompt([
            {
              title: 'Step 1',
              description: 'This is the first step',
              fields: {
                data: { type: 'text', message: 'Data' },
              },
            },
          ])
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      if (promptRequests[0].type === 'stepForm') {
        expect(promptRequests[0].steps[0].description).toBe('This is the first step')
      }
    })
  })

  describe('step form validation', () => {
    it('should include field validation in step form request', async () => {
      setupPromptHandler([{ age: 25 }])

      const action = defineAction({
        name: 'step-form-validation-test',
        description: 'Step form validation test',
        async run({ tui }) {
          await tui.prompt([
            {
              fields: {
                age: {
                  type: 'number',
                  message: 'Age',
                  validate: (value) => (value >= 18 ? true : 'Must be 18 or older'),
                },
              },
            },
          ])
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      if (promptRequests[0].type === 'stepForm') {
        const ageField = promptRequests[0].steps[0].fields.age
        expect(ageField.validate).toBeDefined()
      }
    })

    it('should include cross-step validation in options', async () => {
      setupPromptHandler([{ password: 'secret', confirmPassword: 'secret' }])

      const action = defineAction({
        name: 'step-form-cross-validation-test',
        description: 'Step form cross validation test',
        async run({ tui }) {
          await tui.prompt(
            [
              {
                title: 'Password',
                fields: {
                  password: { type: 'password', message: 'Password' },
                },
              },
              {
                title: 'Confirm',
                fields: {
                  confirmPassword: { type: 'password', message: 'Confirm Password' },
                },
              },
            ],
            {
              validate: (values) =>
                values.password === values.confirmPassword ? true : 'Passwords must match',
            },
          )
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      if (promptRequests[0].type === 'stepForm') {
        expect(promptRequests[0].options?.validate).toBeDefined()
      }
    })
  })

  describe('error handling', () => {
    it('should throw error for empty step array', async () => {
      const action = defineAction({
        name: 'step-form-empty-test',
        description: 'Step form empty test',
        async run({ tui }) {
          await tui.prompt([])
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('at least one step')
    })
  })

  describe('mixed with single form', () => {
    it('should work alongside single form prompts', async () => {
      setupPromptHandler([
        { name: 'John' }, // Single form
        { email: 'john@example.com', phone: '123' }, // Step form
      ])

      const action = defineAction({
        name: 'step-form-mixed-test',
        description: 'Step form mixed test',
        async run({ tui }) {
          // Use single form first
          const basicResult = await tui.prompt({
            fields: { name: { type: 'text', message: 'Name' } },
          })

          // Then use step form
          const contactResult = await tui.prompt([
            { fields: { email: { type: 'text', message: 'Email' } } },
            { fields: { phone: { type: 'text', message: 'Phone' } } },
          ])

          tui.output.log(`${basicResult.name}: ${contactResult.email}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(promptRequests.length).toBe(2)
      expect(promptRequests[0].type).toBe('form')
      expect(promptRequests[1].type).toBe('stepForm')

      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('John: john@example.com')
    })
  })

  describe('all field types in step form', () => {
    it('should support all field types across steps', async () => {
      setupPromptHandler([
        {
          name: 'Alice',
          age: 30,
          password: 'secret',
          country: 'us',
          newsletter: true,
          interests: ['tech', 'music'],
        },
      ])

      const action = defineAction({
        name: 'step-form-all-types-test',
        description: 'Step form all types test',
        async run({ tui }) {
          const result = await tui.prompt([
            {
              title: 'Basic',
              fields: {
                name: { type: 'text', message: 'Name' },
                age: { type: 'number', message: 'Age' },
              },
            },
            {
              title: 'Security',
              fields: {
                password: { type: 'password', message: 'Password' },
              },
            },
            {
              title: 'Preferences',
              fields: {
                country: {
                  type: 'select',
                  message: 'Country',
                  choices: ['us', 'jp', 'uk'],
                },
                newsletter: { type: 'confirm', message: 'Subscribe?' },
                interests: {
                  type: 'multiSelect',
                  message: 'Interests',
                  choices: ['tech', 'music', 'sports'],
                },
              },
            },
          ])

          tui.output.log(`Name: ${result.name}`)
          tui.output.log(`Newsletter: ${result.newsletter}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Name: Alice')
      expect(messages[1].content).toBe('Newsletter: true')
    })
  })
})
