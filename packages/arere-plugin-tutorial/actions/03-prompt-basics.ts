/**
 * Tutorial 03: Prompt API Basics
 *
 * Related docs: docs/content/ja/1.guides/3.creating-actions.md#プロンプトを使う
 *
 * What you'll learn:
 * - tui.prompt.text() - Text input
 * - tui.prompt.number() - Number input
 * - tui.prompt.password() - Password input
 * - tui.prompt.confirm() - Yes/No confirmation
 * - tui.prompt.select() - Single selection
 * - tui.prompt.multiSelect() - Multiple selection
 * - How to use validation
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Prompt API Basics',
    title: 'Prompt API Tutorial',
    intro: 'Learn how to get user input with various prompt types.',
    step_text: 'Text Input',
    step_number: 'Number Input',
    step_password: 'Password Input',
    step_confirm: 'Confirm Dialog',
    step_select: 'Single Selection',
    step_multi: 'Multiple Selection',
    prompt_name: 'What is your name?',
    prompt_age: 'How old are you?',
    prompt_password: 'Create a password (8+ chars)',
    prompt_continue: 'Continue with more demos?',
    prompt_color: 'Pick your favorite color',
    prompt_hobbies: 'Select your hobbies (1-3)',
    summary: 'Summary',
    completed: 'All prompt types demonstrated!',
    next_step: 'Next: Try "04-prompt-form" to learn multi-field forms',
    skipped: 'Remaining demos skipped',
  },
  ja: {
    description: 'Prompt API の基礎',
    title: 'Prompt API チュートリアル',
    intro: '様々なプロンプトタイプでユーザー入力を取得する方法を学びます。',
    step_text: 'テキスト入力',
    step_number: '数値入力',
    step_password: 'パスワード入力',
    step_confirm: '確認ダイアログ',
    step_select: '単一選択',
    step_multi: '複数選択',
    prompt_name: 'お名前は？',
    prompt_age: '年齢は？',
    prompt_password: 'パスワードを作成（8文字以上）',
    prompt_continue: '続きのデモも見ますか？',
    prompt_color: '好きな色を選んでください',
    prompt_hobbies: '趣味を選択（1〜3個）',
    summary: 'まとめ',
    completed: '全てのプロンプトタイプをデモしました！',
    next_step: '次へ: "04-prompt-form" でフォーム入力を学びましょう',
    skipped: '残りのデモをスキップしました',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['prompt', 'input'],
  translations,
  run: async ({ tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Text input
    tui.output.step(1, t('step_text'))
    const name = await tui.prompt.text(t('prompt_name'), {
      placeholder: 'John Doe',
    })
    tui.output.success(`Hello, ${name}!`)
    tui.output.newline()

    // 2. Number input
    tui.output.step(2, t('step_number'))
    const age = await tui.prompt.number(t('prompt_age'), {
      min: 0,
      max: 150,
      defaultValue: 25,
    })
    tui.output.info(`Age: ${age}`)
    tui.output.newline()

    // 3. Password input
    tui.output.step(3, t('step_password'))
    const password = await tui.prompt.password(t('prompt_password'), {
      minLength: 8,
    })
    tui.output.success(`Password length: ${password.length} characters`)
    tui.output.newline()

    // 4. Confirm dialog
    tui.output.step(4, t('step_confirm'))
    const continueDemo = await tui.prompt.confirm(t('prompt_continue'), {
      defaultValue: true,
    })

    if (!continueDemo) {
      tui.output.warn(t('skipped'))
      return
    }
    tui.output.newline()

    // 5. Single selection
    tui.output.step(5, t('step_select'))
    const color = await tui.prompt.select(t('prompt_color'), [
      { label: 'Red', value: 'red', description: 'Passionate' },
      { label: 'Blue', value: 'blue', description: 'Calm' },
      { label: 'Green', value: 'green', description: 'Natural' },
    ])
    tui.output.info(`Selected: ${color}`)
    tui.output.newline()

    // 6. Multiple selection
    tui.output.step(6, t('step_multi'))
    const hobbies = await tui.prompt.multiSelect(
      t('prompt_hobbies'),
      [
        { label: 'Reading', value: 'reading' },
        { label: 'Coding', value: 'coding' },
        { label: 'Gaming', value: 'gaming' },
        { label: 'Sports', value: 'sports' },
        { label: 'Music', value: 'music' },
      ],
      { min: 1, max: 3 },
    )
    tui.output.list(hobbies)
    tui.output.newline()

    // Summary
    tui.output.section(t('summary'))
    tui.output.json({
      name,
      age,
      passwordLength: password.length,
      favoriteColor: color,
      hobbies,
    })
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
