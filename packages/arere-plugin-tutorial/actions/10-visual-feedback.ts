/**
 * Tutorial 09: Visual Feedback (Spinners & Progress)
 *
 * Related docs: docs/content/ja/1.guides/3.creating-actions.md#進捗表示とフィードバック
 *
 * What you'll learn:
 * - Display spinners with tui.control.spinner()
 * - Display progress bars with tui.control.progress()
 * - Dynamic message updates
 * - Completion display with succeed() / fail()
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Visual Feedback (Spinners & Progress)',
    title: 'Visual Feedback Tutorial',
    intro: 'Learn how to show spinners and progress bars for long-running tasks.',
    section_spinner: 'Spinner',
    section_progress: 'Progress Bar',
    section_update: 'Dynamic Updates',
    loading: 'Loading...',
    processing: 'Processing...',
    downloading: 'Downloading files...',
    step1: 'Step 1/3: Preparing...',
    step2: 'Step 2/3: Processing...',
    step3: 'Step 3/3: Finalizing...',
    completed: 'Visual feedback tutorial completed!',
    next_step: 'Next: Try "11-timing-control" to learn timing APIs',
    spinner_types: 'Spinner types comparison:',
    code_update_spinner: 'Update spinner text',
  },
  ja: {
    description: 'ビジュアルフィードバック（スピナー＆プログレス）',
    title: 'ビジュアルフィードバックチュートリアル',
    intro: '長時間タスクでスピナーやプログレスバーを表示する方法を学びます。',
    section_spinner: 'スピナー',
    section_progress: 'プログレスバー',
    section_update: '動的な更新',
    loading: '読み込み中...',
    processing: '処理中...',
    downloading: 'ファイルをダウンロード中...',
    step1: 'ステップ 1/3: 準備中...',
    step2: 'ステップ 2/3: 処理中...',
    step3: 'ステップ 3/3: 完了処理中...',
    completed: 'ビジュアルフィードバックチュートリアル完了！',
    next_step: '次へ: "11-timing-control" でタイミング API を学びましょう',
    spinner_types: 'スピナータイプの比較:',
    code_update_spinner: 'スピナーテキストを更新',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['spinner', 'progress'],
  translations,
  run: async ({ tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Spinner
    tui.output.step(1, t('section_spinner'))
    tui.output.code(`const spinner = tui.control.spinner({
  message: 'Loading...',
  type: 'dots'  // 'dots' | 'line' | 'arc'
})
spinner.start()
await doWork()
spinner.succeed('Done!')  // or spinner.fail('Failed')`)

    const spinner1 = tui.control.spinner({
      message: t('loading'),
      type: 'dots',
    })
    spinner1.start()
    await tui.control.delay(1500)
    spinner1.succeed('Loaded!')
    tui.output.newline()

    // 2. Progress bar
    tui.output.step(2, t('section_progress'))
    tui.output.code(`const progress = tui.control.progress({
  total: 100,
  message: 'Downloading...'
})
progress.start()
progress.update(50)    // Set to 50%
progress.increment()   // Add 1
progress.succeed('Complete!')`)

    const progress = tui.control.progress({
      total: 5,
      message: t('downloading'),
    })
    progress.start()

    for (let i = 0; i < 5; i++) {
      await tui.control.delay(400)
      progress.increment()
    }
    progress.succeed('Downloaded!')
    tui.output.newline()

    // 3. Dynamic updates
    tui.output.step(3, t('section_update'))
    tui.output.code(`spinner.update('New message...')  // ${t('code_update_spinner')}`)

    const spinner2 = tui.control.spinner({
      message: t('step1'),
    })
    spinner2.start()
    await tui.control.delay(1000)

    spinner2.update(t('step2'))
    await tui.control.delay(1000)

    spinner2.update(t('step3'))
    await tui.control.delay(1000)

    spinner2.succeed('All steps completed!')
    tui.output.newline()

    // Spinner type comparison
    tui.output.info(t('spinner_types'))
    const types: Array<'dots' | 'line' | 'arc'> = ['dots', 'line', 'arc']
    for (const type of types) {
      const s = tui.control.spinner({ message: `Type: ${type}`, type })
      s.start()
      await tui.control.delay(1200)
      s.succeed(`${type} completed`)
    }
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
