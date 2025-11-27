/**
 * End-to-end tests for Output API
 *
 * Tests that output messages are:
 * 1. Collected in the outputCollector
 * 2. Streamed in real-time via onOutput callback
 * 3. All output types work correctly
 */

import { defineAction } from '@/domain/action/defineAction.js'
import { runAction } from '@/domain/action/executor.js'
import type { OutputMessage } from '@/infrastructure/output/types.js'
import { describe, expect, it } from 'vitest'

describe('E2E: Output API', () => {
  describe('Output Collection', () => {
    it('should collect output messages in outputCollector', async () => {
      const action = defineAction({
        name: 'output-collection-test',
        description: 'Output collection test',
        async run({ tui }) {
          tui.output.log('Hello, World!')
          tui.output.success('Success message')
          tui.output.error('Error message')
          tui.output.warn('Warning message')
          tui.output.info('Info message')
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages.length).toBe(5)

      expect(messages[0].type).toBe('log')
      expect(messages[0].content).toBe('Hello, World!')

      expect(messages[1].type).toBe('success')
      expect(messages[1].content).toBe('Success message')

      expect(messages[2].type).toBe('error')
      expect(messages[2].content).toBe('Error message')

      expect(messages[3].type).toBe('warn')
      expect(messages[3].content).toBe('Warning message')

      expect(messages[4].type).toBe('info')
      expect(messages[4].content).toBe('Info message')
    })

    it('should include timestamp in messages', async () => {
      const beforeTime = Date.now()

      const action = defineAction({
        name: 'timestamp-test',
        description: 'Timestamp test',
        async run({ tui }) {
          tui.output.log('test')
        },
      })

      const result = await runAction(action)
      const afterTime = Date.now()

      const messages = result.outputCollector.getMessages()
      expect(messages.length).toBe(1)
      expect(messages[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(messages[0].timestamp).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('Real-time Output Streaming', () => {
    it('should call onOutput callback for each message', async () => {
      const receivedMessages: OutputMessage[] = []

      const action = defineAction({
        name: 'streaming-test',
        description: 'Streaming test',
        async run({ tui }) {
          tui.output.log('First')
          tui.output.log('Second')
          tui.output.log('Third')
        },
      })

      const result = await runAction(action, {
        onOutput: (message) => receivedMessages.push(message),
      })

      expect(result.success).toBe(true)
      expect(receivedMessages.length).toBe(3)
      expect(receivedMessages[0].content).toBe('First')
      expect(receivedMessages[1].content).toBe('Second')
      expect(receivedMessages[2].content).toBe('Third')
    })

    it('should receive messages in order', async () => {
      const receivedOrder: string[] = []

      const action = defineAction({
        name: 'order-test',
        description: 'Order test',
        async run({ tui }) {
          tui.output.log('1')
          tui.output.success('2')
          tui.output.info('3')
          tui.output.warn('4')
          tui.output.error('5')
        },
      })

      await runAction(action, {
        onOutput: (message) => receivedOrder.push(String(message.content)),
      })

      expect(receivedOrder).toEqual(['1', '2', '3', '4', '5'])
    })

    it('should stream messages even when action fails', async () => {
      const receivedMessages: OutputMessage[] = []

      const action = defineAction({
        name: 'fail-stream-test',
        description: 'Fail stream test',
        async run({ tui }) {
          tui.output.log('Before error')
          throw new Error('Test error')
        },
      })

      const result = await runAction(action, {
        onOutput: (message) => receivedMessages.push(message),
      })

      expect(result.success).toBe(false)
      expect(receivedMessages.length).toBe(1)
      expect(receivedMessages[0].content).toBe('Before error')
    })
  })

  describe('Structured Output Types', () => {
    it('should handle list output', async () => {
      const action = defineAction({
        name: 'list-test',
        description: 'List test',
        async run({ tui }) {
          tui.output.list(['Apple', 'Banana', 'Cherry'])
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(1)
      expect(messages[0].type).toBe('list')
      expect(messages[0].content).toEqual(['Apple', 'Banana', 'Cherry'])
    })

    it('should handle keyValue output', async () => {
      const action = defineAction({
        name: 'keyvalue-test',
        description: 'KeyValue test',
        async run({ tui }) {
          tui.output.keyValue({
            name: 'arere',
            version: '0.1.0',
          })
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(1)
      expect(messages[0].type).toBe('keyValue')
      expect(messages[0].content).toEqual({ name: 'arere', version: '0.1.0' })
    })

    it('should handle table output', async () => {
      const action = defineAction({
        name: 'table-test',
        description: 'Table test',
        async run({ tui }) {
          tui.output.table([
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
          ])
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(1)
      expect(messages[0].type).toBe('table')
      expect(messages[0].content).toEqual([
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ])
    })

    it('should handle json output', async () => {
      const action = defineAction({
        name: 'json-test',
        description: 'JSON test',
        async run({ tui }) {
          tui.output.json({ nested: { data: 'value' }, array: [1, 2, 3] })
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(1)
      expect(messages[0].type).toBe('json')
      expect(messages[0].content).toEqual({ nested: { data: 'value' }, array: [1, 2, 3] })
    })

    it('should handle section output', async () => {
      const action = defineAction({
        name: 'section-test',
        description: 'Section test',
        async run({ tui }) {
          tui.output.section('My Section')
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(1)
      expect(messages[0].type).toBe('section')
      expect(messages[0].content).toBe('My Section')
    })

    it('should handle step output', async () => {
      const action = defineAction({
        name: 'step-test',
        description: 'Step test',
        async run({ tui }) {
          tui.output.step(1, 'First step')
          tui.output.step(2, 'Second step')
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(2)
      expect(messages[0].type).toBe('step')
      expect(messages[0].content).toBe('First step')
      expect(messages[0].meta?.number).toBe(1)
      expect(messages[1].meta?.number).toBe(2)
    })

    it('should handle separator output', async () => {
      const action = defineAction({
        name: 'separator-test',
        description: 'Separator test',
        async run({ tui }) {
          tui.output.separator()
          tui.output.separator('=', 30)
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(2)
      expect(messages[0].type).toBe('separator')
      expect(messages[0].meta?.char).toBe('─')
      expect(messages[0].meta?.length).toBe(50)
      expect(messages[1].meta?.char).toBe('=')
      expect(messages[1].meta?.length).toBe(30)
    })

    it('should handle code output', async () => {
      const action = defineAction({
        name: 'code-test',
        description: 'Code test',
        async run({ tui }) {
          tui.output.code('const x = 1')
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(1)
      expect(messages[0].type).toBe('code')
      expect(messages[0].content).toBe('const x = 1')
    })

    it('should handle newline output', async () => {
      const action = defineAction({
        name: 'newline-test',
        description: 'Newline test',
        async run({ tui }) {
          tui.output.log('before')
          tui.output.newline()
          tui.output.log('after')
        },
      })

      const result = await runAction(action)
      const messages = result.outputCollector.getMessages()

      expect(messages.length).toBe(3)
      expect(messages[1].type).toBe('newline')
    })
  })

  describe('Output with onOutput and outputCollector consistency', () => {
    it('should have same messages in onOutput and outputCollector', async () => {
      const streamedMessages: OutputMessage[] = []

      const action = defineAction({
        name: 'consistency-test',
        description: 'Consistency test',
        async run({ tui }) {
          tui.output.section('Title')
          tui.output.step(1, 'Step 1')
          tui.output.list(['a', 'b', 'c'])
          tui.output.success('Done!')
        },
      })

      const result = await runAction(action, {
        onOutput: (message) => streamedMessages.push(message),
      })

      const collectedMessages = result.outputCollector.getMessages()

      // Both should have same number of messages
      expect(streamedMessages.length).toBe(collectedMessages.length)

      // Both should have same content
      for (let i = 0; i < streamedMessages.length; i++) {
        expect(streamedMessages[i].type).toBe(collectedMessages[i].type)
        expect(streamedMessages[i].content).toEqual(collectedMessages[i].content)
        expect(streamedMessages[i].timestamp).toBe(collectedMessages[i].timestamp)
      }
    })
  })
})
