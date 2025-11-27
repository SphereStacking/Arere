/**
 * Tutorial 04: Shell Executor
 *
 * Related docs: docs/content/ja/1.guides/3.creating-actions.md#シェルコマンドを実行する
 *
 * What you'll learn:
 * - Run shell commands with $`command`
 * - Capture stdout, stderr, exitCode
 * - Safe variable interpolation
 * - Error handling
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Shell Executor',
    title: 'Shell Executor Tutorial',
    intro: 'Learn how to run shell commands safely.',
    step_basic: 'Basic Command Execution',
    step_output: 'Capturing Output',
    step_variables: 'Variable Interpolation',
    step_error: 'Error Handling',
    completed: 'Shell executor tutorial completed!',
    next_step: 'Next: Try "06-i18n-inline" to learn internationalization',
    vars_escaped: 'Variables are automatically escaped for safety:',
    cmd_succeeded: 'Command succeeded (unexpected)',
    cmd_failed: 'Command failed with non-zero exit code (expected)',
    practical_example: 'Practical example - Node.js version:',
    code_cmd_fails: 'Command that fails',
  },
  ja: {
    description: 'シェルコマンド実行',
    title: 'Shell Executor チュートリアル',
    intro: 'シェルコマンドを安全に実行する方法を学びます。',
    step_basic: '基本的なコマンド実行',
    step_output: '出力のキャプチャ',
    step_variables: '変数の埋め込み',
    step_error: 'エラーハンドリング',
    completed: 'Shell executor チュートリアル完了！',
    next_step: '次へ: "06-i18n-inline" で国際化を学びましょう',
    vars_escaped: '変数は安全のため自動的にエスケープされます:',
    cmd_succeeded: 'コマンドが成功しました（予期しない）',
    cmd_failed: 'コマンドが非ゼロ終了コードで失敗しました（期待通り）',
    practical_example: '実践例 - Node.js バージョン:',
    code_cmd_fails: '失敗するコマンド',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['shell', 'command'],
  translations,
  run: async ({ $, tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Basic command execution
    tui.output.step(1, t('step_basic'))
    tui.output.code('await $`echo "Hello from shell!"`')
    const result1 = await $`echo "Hello from shell!"`
    tui.output.success(result1.stdout.trim())
    tui.output.newline()

    // 2. Capturing output
    tui.output.step(2, t('step_output'))
    tui.output.code('const { stdout, stderr, exitCode } = await $`date`')

    const dateResult = await $`date`
    tui.output.keyValue({
      stdout: dateResult.stdout.trim(),
      stderr: dateResult.stderr || '(empty)',
      exitCode: String(dateResult.exitCode),
    })
    tui.output.newline()

    // 3. Variable interpolation
    tui.output.step(3, t('step_variables'))
    const message = 'Hello, World!'
    tui.output.code(`const message = "${message}"\nawait $\`echo \${message}\``)
    tui.output.info(t('vars_escaped'))

    const result3 = await $`echo ${message}`
    tui.output.success(result3.stdout.trim())
    tui.output.newline()

    // 4. Error handling
    tui.output.step(4, t('step_error'))
    tui.output.code(`try {
  await $\`false\`  // ${t('code_cmd_fails')}
} catch (error) {
  tui.output.error('Command failed')
}`)

    try {
      await $`false`
      tui.output.success(t('cmd_succeeded'))
    } catch {
      tui.output.warn(t('cmd_failed'))
    }
    tui.output.newline()

    // Practical example - Node.js version
    tui.output.info(t('practical_example'))
    const nodeVersion = await $`node --version`
    tui.output.success(`Node.js ${nodeVersion.stdout.trim()}`)
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
