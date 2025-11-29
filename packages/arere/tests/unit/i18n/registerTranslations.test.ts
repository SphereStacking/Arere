/**
 * Unit tests for registerTranslations function
 */

import { changeLocale, initI18n, registerTranslations } from '@/infrastructure/i18n/index.js'
import { translationManager } from '@/infrastructure/i18n/manager.js'
import { beforeEach, describe, expect, it } from 'vitest'

// Helper for tests: use translationManager directly for namespace:key format
const t = (key: string, options?: Record<string, unknown>) => {
  return translationManager.t(key, options)
}

describe('registerTranslations', () => {
  beforeEach(async () => {
    // Initialize i18n before each test
    await initI18n('en')
  })

  it('should register translations for a namespace', () => {
    registerTranslations('test-namespace', {
      en: {
        greeting: 'Hello!',
        farewell: 'Goodbye!',
      },
      ja: {
        greeting: 'こんにちは!',
        farewell: 'さようなら!',
      },
    })

    // Verify English translations
    expect(t('test-namespace:greeting')).toBe('Hello!')
    expect(t('test-namespace:farewell')).toBe('Goodbye!')
  })

  it('should support nested translation keys', () => {
    registerTranslations('nested', {
      en: {
        messages: {
          success: 'Success!',
          error: 'Error occurred',
        },
        actions: {
          save: 'Save',
          cancel: 'Cancel',
        },
      },
      ja: {
        messages: {
          success: '成功!',
          error: 'エラーが発生しました',
        },
        actions: {
          save: '保存',
          cancel: 'キャンセル',
        },
      },
    })

    expect(t('nested:messages.success')).toBe('Success!')
    expect(t('nested:actions.save')).toBe('Save')
  })

  it('should support interpolation', () => {
    registerTranslations('interpolation', {
      en: {
        greeting: 'Hello, {{name}}!',
        age_message: 'You are {{age}} years old',
      },
      ja: {
        greeting: 'こんにちは、{{name}}さん!',
        age_message: 'あなたは{{age}}歳です',
      },
    })

    expect(t('interpolation:greeting', { name: 'Alice' })).toBe('Hello, Alice!')
    expect(t('interpolation:age_message', { age: 25 })).toBe('You are 25 years old')
  })

  it('should fallback to English when locale translation is missing', async () => {
    registerTranslations('fallback-test', {
      en: {
        greeting: 'Hello!',
        farewell: 'Goodbye!',
      },
      ja: {
        greeting: 'こんにちは!',
        // 'farewell' is missing in Japanese
      },
    })

    // Switch to Japanese
    await changeLocale('ja')

    // 'greeting' should use Japanese
    expect(t('fallback-test:greeting')).toBe('こんにちは!')

    // 'farewell' should fallback to English
    expect(t('fallback-test:farewell')).toBe('Goodbye!')

    // Switch back to English
    await changeLocale('en')
  })

  it('should work with multiple locales', async () => {
    registerTranslations('multi-locale', {
      en: {
        message: 'English message',
      },
      ja: {
        message: '日本語メッセージ',
      },
    })

    // Check English
    expect(t('multi-locale:message')).toBe('English message')

    // Switch to Japanese
    await changeLocale('ja')
    expect(t('multi-locale:message')).toBe('日本語メッセージ')

    // Switch back to English
    await changeLocale('en')
    expect(t('multi-locale:message')).toBe('English message')
  })

  it('should allow overwriting existing translations', () => {
    // Register first set of translations
    registerTranslations('overwrite-test', {
      en: {
        message: 'First message',
      },
    })

    expect(t('overwrite-test:message')).toBe('First message')

    // Overwrite with new translations
    registerTranslations('overwrite-test', {
      en: {
        message: 'Second message',
      },
    })

    expect(t('overwrite-test:message')).toBe('Second message')
  })

  it('should handle multiple namespaces independently', () => {
    registerTranslations('namespace-1', {
      en: {
        greeting: 'Hello from namespace 1!',
      },
    })

    registerTranslations('namespace-2', {
      en: {
        greeting: 'Hello from namespace 2!',
      },
    })

    // Each namespace should have its own translations
    expect(t('namespace-1:greeting')).toBe('Hello from namespace 1!')
    expect(t('namespace-2:greeting')).toBe('Hello from namespace 2!')
  })

  it('should merge with existing translations in the same namespace', () => {
    registerTranslations('merge-test', {
      en: {
        greeting: 'Hello!',
      },
    })

    // Add more translations to the same namespace
    registerTranslations('merge-test', {
      en: {
        farewell: 'Goodbye!',
      },
    })

    // Both translations should be available
    expect(t('merge-test:greeting')).toBe('Hello!')
    expect(t('merge-test:farewell')).toBe('Goodbye!')
  })

  it('should handle empty translation objects', () => {
    registerTranslations('empty-test', {
      en: {},
      ja: {},
    })

    // Should not throw, but key won't exist
    const result = t('empty-test:non-existent')
    expect(result).toBeTruthy() // returns the key if translation not found
  })

  it('should handle complex nested structures', () => {
    registerTranslations('complex', {
      en: {
        app: {
          title: 'My App',
          menu: {
            file: {
              new: 'New',
              open: 'Open',
              save: 'Save',
            },
            edit: {
              undo: 'Undo',
              redo: 'Redo',
            },
          },
        },
      },
    })

    expect(t('complex:app.title')).toBe('My App')
    expect(t('complex:app.menu.file.new')).toBe('New')
    expect(t('complex:app.menu.edit.undo')).toBe('Undo')
  })
})
