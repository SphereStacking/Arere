/**
 * Tutorial 06: Internationalization (Locales Directory Pattern)
 *
 * Related docs: docs/content/ja/1.guides/4.developing-plugins.md#国際化対応i18n
 *
 * What you'll learn:
 * - Plugin locales directory structure
 * - Access plugin translations with plugin: prefix
 * - Managing large-scale translations
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'i18n Locales Directory Pattern',
    title: 'Internationalization Tutorial (Locales Directory)',
    intro: 'Learn how plugins manage translations with external files.',
    section_structure: 'Directory Structure',
    section_usage: 'Using Plugin Translations',
    section_when: 'When to Use',
    plugin_greeting: 'This message comes from the plugin locales directory!',
    inline_greeting: 'This message is inline in this action file.',
    use_locales_when: 'Use the locales directory pattern when:',
    reason1: 'You have many translation keys',
    reason2: 'Multiple actions share translations',
    reason3: 'You want translators to edit JSON files',
    use_inline_when: 'Use inline pattern when:',
    inline1: 'Few translation keys',
    inline2: 'Action-specific translations',
    inline3: 'Quick prototyping',
    completed: 'i18n locales directory tutorial completed!',
    next_step: 'Next: Try "08-config-usage" to learn plugin configuration',
  },
  ja: {
    description: 'i18n locales ディレクトリパターン',
    title: '国際化チュートリアル（locales ディレクトリ）',
    intro: 'プラグインが外部ファイルで翻訳を管理する方法を学びます。',
    section_structure: 'ディレクトリ構造',
    section_usage: 'プラグイン翻訳の使用',
    section_when: '使い分け',
    plugin_greeting: 'このメッセージはプラグインの locales ディレクトリから来ています！',
    inline_greeting: 'このメッセージはこのアクションファイル内でインライン定義されています。',
    use_locales_when: 'locales ディレクトリパターンを使う場合:',
    reason1: '翻訳キーが多い',
    reason2: '複数のアクションで翻訳を共有',
    reason3: '翻訳者にJSONファイルを編集してもらいたい',
    use_inline_when: 'インラインパターンを使う場合:',
    inline1: '翻訳キーが少ない',
    inline2: 'アクション固有の翻訳',
    inline3: '素早いプロトタイピング',
    completed: 'i18n locales ディレクトリチュートリアル完了！',
    next_step: '次へ: "08-config-usage" でプラグイン設定を学びましょう',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['i18n', 'locales'],
  translations,
  run: async ({ tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Directory structure
    tui.output.step(1, t('section_structure'))
    tui.output.code(`arere-plugin-example/
├── src/
│   └── index.ts          # definePlugin({ locales: 'locales' })
├── actions/
│   └── hello.ts
└── locales/
    ├── en/
    │   └── translation.json   # { "greeting": "Hello!" }
    └── ja/
        └── translation.json   # { "greeting": "こんにちは！" }`)
    tui.output.newline()

    // 2. Using plugin translations
    tui.output.step(2, t('section_usage'))
    tui.output.code(`// Translation from plugin locales
// Use "plugin:" prefix
t('plugin:greeting')

// Inline translation (in this file)
t('inline_greeting')`)

    // Try plugin translation
    try {
      const pluginMessage = t('plugin:greeting')
      tui.output.success(`plugin: ${pluginMessage}`)
    } catch {
      tui.output.warn('Plugin translation not available (using inline)')
    }
    tui.output.info(`inline: ${t('inline_greeting')}`)
    tui.output.newline()

    // 3. When to use each
    tui.output.step(3, t('section_when'))

    tui.output.info(t('use_locales_when'))
    tui.output.list([t('reason1'), t('reason2'), t('reason3')])
    tui.output.newline()

    tui.output.info(t('use_inline_when'))
    tui.output.list([t('inline1'), t('inline2'), t('inline3')])
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
