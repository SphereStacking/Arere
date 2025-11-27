/**
 * Tutorial 07: Plugin Configuration
 *
 * Related docs: docs/content/ja/1.guides/6.plugin-config-guide.md
 *
 * What you'll learn:
 * - Access plugin config with pluginConfig
 * - Zod schema validation
 * - Defining default values
 * - Config usage patterns
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Plugin Configuration',
    title: 'Plugin Configuration Tutorial',
    intro: 'Learn how to use plugin configuration in your actions.',
    section_access: 'Accessing Configuration',
    section_schema: 'Configuration Schema',
    section_usage: 'Using Configuration',
    current_config: 'Current plugin configuration:',
    schema_example: 'Schema definition in plugin index.ts:',
    usage_example: 'Using config values:',
    no_config: 'No plugin configuration available',
    completed: 'Plugin configuration tutorial completed!',
    next_step: 'Next: Try "09-error-handling" to learn error handling',
    code_get_config: 'Get pluginConfig from ActionContext',
    debug_enabled: 'Debug mode is enabled!',
  },
  ja: {
    description: 'プラグイン設定',
    title: 'プラグイン設定チュートリアル',
    intro: 'アクション内でプラグイン設定を使用する方法を学びます。',
    section_access: '設定へのアクセス',
    section_schema: '設定スキーマ',
    section_usage: '設定の活用',
    current_config: '現在のプラグイン設定:',
    schema_example: 'プラグイン index.ts でのスキーマ定義:',
    usage_example: '設定値の使用:',
    no_config: 'プラグイン設定がありません',
    completed: 'プラグイン設定チュートリアル完了！',
    next_step: '次へ: "09-error-handling" でエラーハンドリングを学びましょう',
    code_get_config: 'ActionContext から pluginConfig を取得',
    debug_enabled: 'デバッグモードが有効です！',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['config', 'zod'],
  translations,
  run: async ({ tui, t, pluginConfig }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Accessing configuration
    tui.output.step(1, t('section_access'))
    tui.output.code(`// ${t('code_get_config')}
async run({ pluginConfig }) {
  const greeting = pluginConfig?.greeting || 'Hello'
  const debug = pluginConfig?.enableDebug ?? false
}`)
    tui.output.newline()

    tui.output.info(t('current_config'))
    if (pluginConfig) {
      tui.output.json(pluginConfig)
    } else {
      tui.output.warn(t('no_config'))
    }
    tui.output.newline()

    // 2. Configuration schema
    tui.output.step(2, t('section_schema'))
    tui.output.info(t('schema_example'))
    tui.output.code(`// src/index.ts
import { definePlugin } from 'arere'
import { z } from 'zod'

export default definePlugin({
  meta: { name: 'arere-plugin-example', ... },
  configSchema: z.object({
    greeting: z.string().default('Hello'),
    enableDebug: z.boolean().default(false),
    theme: z.enum(['light', 'dark']).default('light'),
    maxRetries: z.number().min(1).max(10).default(3),
  }),
})`)
    tui.output.newline()

    // 3. Using configuration
    tui.output.step(3, t('section_usage'))
    tui.output.info(t('usage_example'))

    const greeting = pluginConfig?.greeting || 'Hello'
    const debug = pluginConfig?.enableDebug ?? false
    const theme = pluginConfig?.theme || 'auto'

    tui.output.code(`const greeting = pluginConfig?.greeting || 'Hello'
const debug = pluginConfig?.enableDebug ?? false
const theme = pluginConfig?.theme || 'auto'

if (debug) {
  tui.output.info('Debug mode enabled')
}`)

    tui.output.keyValue({
      greeting,
      debug: String(debug),
      theme,
    })

    if (debug) {
      tui.output.info(t('debug_enabled'))
    }
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
