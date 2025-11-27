/**
 * Tutorial 05: Internationalization (Inline Pattern)
 *
 * Related docs: docs/content/ja/1.guides/3.creating-actions.md#国際化-i18n
 *
 * What you'll learn:
 * - Define inline translations with translations property
 * - Get translation keys with t() function
 * - Variable interpolation
 * - Using translations in description
 */

import { defineAction } from 'arere'

// Define translations inline
const translations = {
  en: {
    description: 'i18n Inline Pattern',
    title: 'Internationalization Tutorial (Inline)',
    intro: 'Learn how to add multi-language support using inline translations.',
    section_basics: 'Basic Translation',
    section_interpolation: 'Variable Interpolation',
    section_description: 'Dynamic Description',
    hello: 'Hello!',
    greeting: 'Hello, {{name}}!',
    items_count: 'You have {{count}} item(s)',
    current_locale: 'Current locale: {{locale}}',
    explanation: 'The translations object is defined directly in the action file.',
    benefit1: 'Single file - easy to manage',
    benefit2: 'Type-safe with "as const"',
    benefit3: 'No external files needed',
    completed: 'i18n inline tutorial completed!',
    next_step: 'Next: Try "07-i18n-locales" for the locales directory pattern',
    benefits_title: 'Benefits of inline pattern:',
    code_define_translations: 'Define translations object',
    code_get_translation: 'Get translation with t()',
    code_interpolation: 'Use {{variable}} for interpolation',
    code_dynamic_desc: 'description can also use translations',
  },
  ja: {
    description: 'i18n インラインパターン',
    title: '国際化チュートリアル（インライン）',
    intro: 'インライン翻訳を使った多言語対応の方法を学びます。',
    section_basics: '基本的な翻訳',
    section_interpolation: '変数の埋め込み',
    section_description: '動的な説明',
    hello: 'こんにちは！',
    greeting: 'こんにちは、{{name}}さん！',
    items_count: '{{count}}個のアイテムがあります',
    current_locale: '現在のロケール: {{locale}}',
    explanation: 'translations オブジェクトはアクションファイル内に直接定義します。',
    benefit1: '単一ファイル - 管理が簡単',
    benefit2: '"as const" で型安全',
    benefit3: '外部ファイル不要',
    completed: 'i18n インラインチュートリアル完了！',
    next_step: '次へ: "07-i18n-locales" で locales ディレクトリパターンを学びましょう',
    benefits_title: 'インラインパターンの利点:',
    code_define_translations: 'translations オブジェクトを定義',
    code_get_translation: 't() で翻訳を取得',
    code_interpolation: '{{variable}} で変数を埋め込み',
    code_dynamic_desc: 'description も翻訳を使用可能',
  },
} as const // Important for type inference!

export default defineAction({
  // description can also be translated
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['i18n', 'inline'],
  translations,
  run: async ({ tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Basic translation
    tui.output.step(1, t('section_basics'))
    tui.output.code(`// ${t('code_define_translations')}
const translations = {
  en: { hello: 'Hello!' },
  ja: { hello: 'こんにちは！' }
}

// ${t('code_get_translation')}
tui.output.log(t('hello'))`)
    tui.output.success(t('hello'))
    tui.output.newline()

    // 2. Variable interpolation
    tui.output.step(2, t('section_interpolation'))
    tui.output.code(`// ${t('code_interpolation')}
t('greeting', { name: 'Alice' })
t('items_count', { count: 5 })`)

    tui.output.log(t('greeting', { name: 'Alice' }))
    tui.output.log(t('items_count', { count: 5 }))
    tui.output.newline()

    // 3. Dynamic description
    tui.output.step(3, t('section_description'))
    tui.output.code(`// ${t('code_dynamic_desc')}
defineAction({
  description: ({ t }) => t('description'),
  translations,
  // ...
})`)
    tui.output.info(t('explanation'))
    tui.output.newline()

    // Benefits
    tui.output.info(t('benefits_title'))
    tui.output.list([t('benefit1'), t('benefit2'), t('benefit3')])
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
