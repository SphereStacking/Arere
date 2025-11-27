/**
 * Tutorial 08: Error Handling
 *
 * Related docs: docs/content/ja/1.guides/3.creating-actions.md#ベストプラクティス
 *
 * What you'll learn:
 * - try-catch error handling
 * - Shell command error handling
 * - User-friendly error messages
 * - Error recovery patterns
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Error Handling',
    title: 'Error Handling Tutorial',
    intro: 'Learn how to handle errors gracefully in your actions.',
    section_basic: 'Basic Error Handling',
    section_shell: 'Shell Command Errors',
    section_recovery: 'Error Recovery',
    section_user: 'User-Friendly Messages',
    error_occurred: 'An error occurred (expected for demo)',
    recovered: 'Recovered from error',
    completed: 'Error handling tutorial completed!',
    next_step: 'Next: Try "10-visual-feedback" to learn spinners and progress bars',
    // Code block comments
    code_dangerous_op: 'Dangerous operation',
    code_method1: 'Method 1: try-catch',
    code_method2: 'Method 2: exitCode check',
    code_retry_pattern: 'Retry pattern',
    code_bad_example: 'Bad example',
    code_good_example: 'Good example',
    // Runtime messages
    caught_error: 'Caught error: {{message}}',
    shell_failed: 'Shell command failed (expected)',
    attempt: 'Attempt {{current}}/{{max}}...',
    failed_retrying: 'Failed, retrying...',
    file_not_found: 'File not found: config.json',
    hint_check_path: 'Hint: Make sure the file exists in the current directory',
  },
  ja: {
    description: 'エラーハンドリング',
    title: 'エラーハンドリングチュートリアル',
    intro: 'アクション内でエラーを適切に処理する方法を学びます。',
    section_basic: '基本的なエラーハンドリング',
    section_shell: 'シェルコマンドのエラー',
    section_recovery: 'エラーからの復旧',
    section_user: 'ユーザーフレンドリーなメッセージ',
    error_occurred: 'エラーが発生しました（デモ用）',
    recovered: 'エラーから復旧しました',
    completed: 'エラーハンドリングチュートリアル完了！',
    next_step: '次へ: "10-visual-feedback" でスピナーとプログレスバーを学びましょう',
    // Code block comments
    code_dangerous_op: '危険な操作',
    code_method1: '方法1: try-catch',
    code_method2: '方法2: exitCode チェック',
    code_retry_pattern: 'リトライパターン',
    code_bad_example: '悪い例',
    code_good_example: '良い例',
    // Runtime messages
    caught_error: 'エラーをキャッチ: {{message}}',
    shell_failed: 'シェルコマンドが失敗しました（期待通り）',
    attempt: '試行 {{current}}/{{max}}...',
    failed_retrying: '失敗、リトライ中...',
    file_not_found: 'ファイルが見つかりません: config.json',
    hint_check_path: 'ヒント: ファイルがカレントディレクトリに存在することを確認してください',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['error', 'exception'],
  translations,
  run: async ({ $, tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Basic error handling
    tui.output.step(1, t('section_basic'))
    tui.output.code(`try {
  // ${t('code_dangerous_op')}
  throw new Error('Something went wrong')
} catch (error) {
  tui.output.error(\`Error: \${error.message}\`)
}`)

    try {
      throw new Error('Something went wrong')
    } catch (error) {
      tui.output.warn(t('caught_error', { message: (error as Error).message }))
    }
    tui.output.newline()

    // 2. Shell command errors
    tui.output.step(2, t('section_shell'))
    tui.output.code(`// ${t('code_method1')}
try {
  await $\`nonexistent-command\`
} catch (error) {
  tui.output.error('Command failed')
}

// ${t('code_method2')}
const result = await $\`ls /nonexistent\`.catch(e => e)
if (result.exitCode !== 0) {
  tui.output.error('Command returned non-zero')
}`)

    try {
      await $`false` // always fails
    } catch {
      tui.output.warn(t('shell_failed'))
    }
    tui.output.newline()

    // 3. Error recovery
    tui.output.step(3, t('section_recovery'))
    tui.output.code(`// ${t('code_retry_pattern')}
async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      tui.output.warn(\`Retry \${i + 1}/\${retries}...\`)
    }
  }
}`)

    // Simple retry demo
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      attempts++
      tui.output.info(t('attempt', { current: attempts, max: maxAttempts }))

      if (attempts < maxAttempts) {
        tui.output.warn(t('failed_retrying'))
      } else {
        tui.output.success(t('recovered'))
      }
    }
    tui.output.newline()

    // 4. User-friendly messages
    tui.output.step(4, t('section_user'))
    tui.output.code(`// ${t('code_bad_example')}
tui.output.error(error.stack)

// ${t('code_good_example')}
tui.output.error('File not found')
tui.output.info('Hint: Check the file path')`)

    tui.output.error(t('file_not_found'))
    tui.output.info(t('hint_check_path'))
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
