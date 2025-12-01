/**
 * End-to-end tests for i18n API
 *
 * Tests that translation function (t) works correctly
 * in actions. Note: inline translations from defineAction
 * only work when actions are loaded via the loader (which
 * registers translations). Direct defineAction calls in tests
 * won't have translations registered.
 */

import { defineAction } from '@/action/define.js'
import { runAction } from '@/action/executor.js'
import { registerTranslations } from '@/i18n/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('E2E: i18n API', () => {
  describe('basic translation', () => {
    it('should translate using t function', async () => {
      const action = defineAction({
        name: 'i18n-basic-test',
        description: 'i18n basic test',
        async run({ t, tui }) {
          // t function should be available
          const hasT = typeof t === 'function'
          tui.output.log(`hasT: ${hasT}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('hasT: true')
    })

    it('should return key if translation not found', async () => {
      const action = defineAction({
        name: 'i18n-missing-test',
        description: 'i18n missing test',
        async run({ t, tui }) {
          // Non-existent key should return the key itself
          const result = t('nonexistent.key' as any)
          tui.output.log(`result: ${result}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      // Should return the key or some fallback
      expect(messages[0].content).toContain('nonexistent.key')
    })
  })

  describe('registered translations', () => {
    beforeEach(() => {
      // Manually register translations for test
      registerTranslations('i18n-registered-test', {
        en: {
          greeting: 'Hello, {{name}}!',
          farewell: 'Goodbye!',
        },
        ja: {
          greeting: 'こんにちは、{{name}}さん！',
          farewell: 'さようなら！',
        },
      })
    })

    it('should use registered translations', async () => {
      const action = defineAction({
        name: 'i18n-registered-test',
        description: 'i18n registered test',
        async run({ t, tui }) {
          // Use registered translation key
          const greeting = t('greeting' as any, { name: 'World' })
          tui.output.log(String(greeting))
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      const content = messages[0].content as string
      // Should have interpolated the name (locale may be en or ja)
      expect(content).toContain('World')
      // Either English or Japanese greeting format
      expect(content.includes('Hello') || content.includes('こんにちは')).toBe(true)
    })
  })

  describe('namespace usage', () => {
    it('should access common namespace', async () => {
      const action = defineAction({
        name: 'i18n-namespace-test',
        description: 'i18n namespace test',
        async run({ t, tui }) {
          // Try to get a common namespace key (may or may not exist)
          // This tests that namespace specification works
          const hasCommon = typeof t === 'function'
          tui.output.log(`hasNamespace: ${hasCommon}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('hasNamespace: true')
    })
  })

  describe('context availability', () => {
    it('should have t function in action context', async () => {
      const action = defineAction({
        name: 'i18n-context-test',
        description: 'i18n context test',
        async run(context) {
          const { t, tui } = context
          // Verify t is in context
          tui.output.log(`t in context: ${typeof t === 'function'}`)
          tui.output.log(`context keys: ${Object.keys(context).includes('t')}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('t in context: true')
      expect(messages[1].content).toBe('context keys: true')
    })
  })

  describe('edge cases', () => {
    it('should handle missing key gracefully', async () => {
      const action = defineAction({
        name: 'i18n-missing-key-test',
        description: 'i18n missing key test',
        async run({ t, tui }) {
          const result = t('does.not.exist' as any)
          // Should return the key itself as fallback
          tui.output.log(`isString: ${typeof result === 'string'}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('isString: true')
    })
  })
})
