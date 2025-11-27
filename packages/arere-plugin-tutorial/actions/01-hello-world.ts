/**
 * Tutorial 01: Hello World
 *
 * Related docs: docs/content/ja/1.guides/1.getting-started.md
 *
 * What you'll learn:
 * - How to define an action with defineAction()
 * - Basic output using tui.output
 * - Simple internationalization (i18n)
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Your First Action',
    title: 'Hello World Tutorial',
    welcome: 'Welcome to arere!',
    explanation: 'This is your first action. It demonstrates:',
    point1: 'How to define an action with defineAction()',
    point2: 'Basic output using tui.output',
    point3: 'Simple internationalization (i18n)',
    completed: 'Tutorial completed!',
    next_step: 'Next: Try "02-output-api" to learn more output methods',
  },
  ja: {
    description: '最初のアクション',
    title: 'Hello World チュートリアル',
    welcome: 'arere へようこそ！',
    explanation: 'これはあなたの最初のアクションです。以下を学びます:',
    point1: 'defineAction() でアクションを定義する方法',
    point2: 'tui.output を使った基本的な出力',
    point3: 'シンプルな国際化（i18n）',
    completed: 'チュートリアル完了！',
    next_step: '次へ: "02-output-api" でより多くの出力メソッドを学びましょう',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: [],
  translations,
  run: async ({ tui, t }) => {
    // Section header
    tui.output.section(t('title'))
    tui.output.newline()

    // Welcome message
    tui.output.success(t('welcome'))
    tui.output.newline()

    // Explanation
    tui.output.info(t('explanation'))
    tui.output.list([t('point1'), t('point2'), t('point3')])
    tui.output.newline()

    // Completion message
    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
