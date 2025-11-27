/**
 * Tests for scoped translation functionality
 */

import { createScopedT, initI18n, registerTranslations } from '@/infrastructure/i18n/index.js'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Scoped Translation', () => {
  beforeEach(async () => {
    // Initialize i18n before each test
    await initI18n('en')

    // Register test translations
    registerTranslations('action-a', {
      en: {
        greeting: 'Hello from Action A',
        message: 'This is Action A',
      },
      ja: {
        greeting: 'アクションAからこんにちは',
        message: 'これはアクションAです',
      },
    })

    registerTranslations('action-b', {
      en: {
        greeting: 'Hello from Action B',
        message: 'This is Action B',
      },
      ja: {
        greeting: 'アクションBからこんにちは',
        message: 'これはアクションBです',
      },
    })

    registerTranslations('plugin-x', {
      en: {
        pluginGreeting: 'Hello from Plugin X',
        sharedData: 'Shared plugin data',
      },
      ja: {
        pluginGreeting: 'プラグインXからこんにちは',
        sharedData: '共有プラグインデータ',
      },
    })
  })

  it('should scope translations to specific namespace', () => {
    const tA = createScopedT('action-a')
    const tB = createScopedT('action-b')

    expect(tA('greeting')).toBe('Hello from Action A')
    expect(tB('greeting')).toBe('Hello from Action B')
  })

  it('should allow access to common namespace', () => {
    const t = createScopedT('action-a')

    // Common namespace should always be accessible with : prefix
    expect(t('common:app_name')).toBe('arere')
  })

  it('should allow plugin actions to access plugin namespace', () => {
    // Plugin action can access both its own namespace and plugin namespace
    const t = createScopedT('action-from-plugin', ['plugin-x'])

    // Use plugin: prefix to access plugin namespace
    expect(t('plugin:pluginGreeting')).toBe('Hello from Plugin X')
    expect(t('plugin:sharedData')).toBe('Shared plugin data')
  })

  it('should block access to unauthorized namespaces', () => {
    const t = createScopedT('action-a')

    // Trying to access action-b's namespace should return the key
    expect(t('action-b:greeting')).toBe('action-b:greeting')
  })

  it('should default to scoped namespace when no ns specified', () => {
    const t = createScopedT('action-a')

    expect(t('message')).toBe('This is Action A')
    expect(t('greeting')).toBe('Hello from Action A')
  })

  it('should handle interpolation in scoped translations', () => {
    registerTranslations('action-interpolation', {
      en: {
        welcome: 'Welcome, {{name}}!',
      },
    })

    const t = createScopedT('action-interpolation')
    expect(t('welcome', { name: 'Alice' })).toBe('Welcome, Alice!')
  })

  it('should allow multiple allowed namespaces', () => {
    const t = createScopedT('action-main', ['plugin-x', 'action-a'])

    // Should access all allowed namespaces with : prefix
    expect(t('plugin:pluginGreeting')).toBe('Hello from Plugin X')
    expect(t('action-a:greeting')).toBe('Hello from Action A')
  })

  it('should block access even with interpolation parameters', () => {
    const t = createScopedT('action-a')

    // Should block even if other parameters are present
    expect(t('action-b:greeting', { count: 5 })).toBe('action-b:greeting')
  })
})
