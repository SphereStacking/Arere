/**
 * Tutorial 04: Form API
 *
 * Related docs: docs/content/ja/2.api/2.prompt.md
 *
 * What you'll learn:
 * - tui.prompt([...]) - Step form (wizard) with multiple steps
 * - Field types: text, number, password, select, confirm, multiSelect
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Form API (Step Form)',
    title: 'Form API Tutorial',
    intro: 'Learn how to create step forms with all field types.',
    completed: 'Form API tutorial completed!',
    next_step: 'Next: Try "05-shell-executor" to learn shell commands',
    // Step 1
    step1_title: 'Step 1: Personal Info',
    step1_desc: 'Enter your personal information',
    form_name: 'Name',
    form_age: 'Age',
    form_password: 'Password',
    form_gender: 'Gender',
    form_employed: 'Currently employed?',
    form_languages: 'Languages you speak',
    // Step 2
    step2_title: 'Step 2: Preferences',
    step2_desc: 'Choose your preferences',
    form_email: 'Email',
    form_experience: 'Years of experience',
    form_pin: 'PIN code',
    form_country: 'Country',
    form_newsletter: 'Subscribe to newsletter?',
    form_interests: 'Interests',
  },
  ja: {
    description: 'Form API（ステップフォーム）',
    title: 'Form API チュートリアル',
    intro: '全フィールドタイプを使ったステップフォームの作成方法を学びます。',
    completed: 'Form API チュートリアル完了！',
    next_step: '次へ: "05-shell-executor" でシェルコマンドを学びましょう',
    // Step 1
    step1_title: 'ステップ 1: 個人情報',
    step1_desc: '個人情報を入力してください',
    form_name: '名前',
    form_age: '年齢',
    form_password: 'パスワード',
    form_gender: '性別',
    form_employed: '現在就業中ですか？',
    form_languages: '話せる言語',
    // Step 2
    step2_title: 'ステップ 2: 設定',
    step2_desc: '好みを選択してください',
    form_email: 'メールアドレス',
    form_experience: '経験年数',
    form_pin: 'PINコード',
    form_country: '国',
    form_newsletter: 'ニュースレターを購読しますか？',
    form_interests: '興味のある分野',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['form', 'wizard'],
  translations,
  run: async ({ tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    tui.output.info('tui.prompt([{ fields: {...} }, { fields: {...} }])')
    tui.output.newline()

    // Step Form with all field types in both steps
    const result = await tui.prompt([
      {
        // Step 1: all 6 field types
        title: t('step1_title'),
        description: t('step1_desc'),
        fields: {
          name: { type: 'text', message: t('form_name'), placeholder: 'John Doe' },
          age: { type: 'number', message: t('form_age'), min: 0, max: 150, defaultValue: 25 },
          password: { type: 'password', message: t('form_password') },
          gender: {
            type: 'select',
            message: t('form_gender'),
            choices: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ],
          },
          employed: { type: 'confirm', message: t('form_employed'), defaultValue: true },
          languages: {
            type: 'multiSelect',
            message: t('form_languages'),
            choices: ['English', 'Japanese', 'Spanish', 'Chinese'],
          },
        },
      },
      {
        // Step 2: all 6 field types
        title: t('step2_title'),
        description: t('step2_desc'),
        fields: {
          email: { type: 'text', message: t('form_email'), placeholder: 'user@example.com' },
          experience: { type: 'number', message: t('form_experience'), min: 0, max: 50, defaultValue: 3 },
          pin: { type: 'password', message: t('form_pin') },
          country: {
            type: 'select',
            message: t('form_country'),
            choices: [
              { label: 'USA', value: 'us' },
              { label: 'Japan', value: 'jp' },
              { label: 'UK', value: 'uk' },
            ],
          },
          newsletter: { type: 'confirm', message: t('form_newsletter'), defaultValue: true },
          interests: {
            type: 'multiSelect',
            message: t('form_interests'),
            choices: ['Technology', 'Music', 'Sports', 'Art'],
          },
        },
      },
    ])

    tui.output.newline()
    tui.output.success('Result:')
    tui.output.json(result)
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
