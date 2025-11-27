/**
 * Tutorial 11: Headless Mode (CI/CD Compatibility)
 *
 * Related docs: docs/content/ja/1.guides/7.github-actions-integration.md
 *
 * What you'll learn:
 * - What is Headless mode
 * - Environment detection with isInteractive()
 * - Using environment variables
 * - Writing CI/CD compatible actions
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Headless Mode (CI/CD)',
    title: 'Headless Mode Tutorial',
    intro: 'Learn how to make your actions work in CI/CD environments.',
    section_what: 'What is Headless Mode?',
    section_detect: 'Detecting Environment',
    section_env: 'Using Environment Variables',
    section_pattern: 'CI-Compatible Pattern',
    headless_explanation:
      'Headless mode runs without interactive UI. Used in CI/CD pipelines like GitHub Actions.',
    current_mode: 'Current mode:',
    interactive: 'Interactive (TUI)',
    headless: 'Headless (CI/CD)',
    completed: 'Headless mode tutorial completed!',
    next_step: 'Next: Try "13-external-sdk" to learn using external libraries',
    // Code block comments
    code_tui_mode: 'TUI mode (interactive)',
    code_show_launcher: 'Show launcher UI',
    code_headless_mode: 'Headless mode (for CI/CD)',
    code_run_directly: 'Run directly without UI',
    code_tui_use_spinner: 'TUI: Use spinners and prompts',
    code_ci_from_env: 'CI: Get from environment variables',
    code_get_env: 'Get env from ActionContext',
    code_ci_pattern: 'Complete CI/CD compatible pattern',
    code_check_required: '1. Check required environment variables',
    code_output_by_mode: '2. Output according to mode',
    sample_env_vars: 'Sample environment variables:',
    github_actions_example: 'GitHub Actions example:',
  },
  ja: {
    description: 'Headless モード（CI/CD）',
    title: 'Headless モードチュートリアル',
    intro: 'CI/CD 環境でアクションを動作させる方法を学びます。',
    section_what: 'Headless モードとは？',
    section_detect: '環境の検出',
    section_env: '環境変数の使用',
    section_pattern: 'CI 対応パターン',
    headless_explanation:
      'Headless モードはインタラクティブ UI なしで実行されます。GitHub Actions などの CI/CD パイプラインで使用されます。',
    current_mode: '現在のモード:',
    interactive: 'インタラクティブ（TUI）',
    headless: 'ヘッドレス（CI/CD）',
    completed: 'Headless モードチュートリアル完了！',
    next_step: '次へ: "13-external-sdk" で外部ライブラリの使用を学びましょう',
    // Code block comments
    code_tui_mode: 'TUI モード（インタラクティブ）',
    code_show_launcher: 'ランチャーUI を表示',
    code_headless_mode: 'Headless モード（CI/CD 用）',
    code_run_directly: 'UI なしで直接実行',
    code_tui_use_spinner: 'TUI: スピナーやプロンプトを使用',
    code_ci_from_env: 'CI: 環境変数から取得',
    code_get_env: 'ActionContext から env を取得',
    code_ci_pattern: 'CI/CD 対応の完全なパターン',
    code_check_required: '1. 必須の環境変数をチェック',
    code_output_by_mode: '2. モードに応じた出力',
    sample_env_vars: '環境変数のサンプル:',
    github_actions_example: 'GitHub Actions の例:',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['headless', 'ci-cd'],
  translations,
  run: async ({ tui, t, env }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. What is Headless mode
    tui.output.step(1, t('section_what'))
    tui.output.info(t('headless_explanation'))
    tui.output.code(`# ${t('code_tui_mode')}
arere              # ${t('code_show_launcher')}

# ${t('code_headless_mode')}
arere run deploy   # ${t('code_run_directly')}`)
    tui.output.newline()

    // 2. Environment detection
    tui.output.step(2, t('section_detect'))
    const isInteractive = tui.control.isInteractive()

    tui.output.code(`const isInteractive = tui.control.isInteractive()

if (isInteractive) {
  // ${t('code_tui_use_spinner')}
  const name = await tui.prompt.text('Name?')
} else {
  // ${t('code_ci_from_env')}
  const name = env.NAME || 'default'
}`)

    tui.output.info(t('current_mode'))
    if (isInteractive) {
      tui.output.success(t('interactive'))
    } else {
      tui.output.warn(t('headless'))
    }
    tui.output.newline()

    // 3. Using environment variables
    tui.output.step(3, t('section_env'))
    tui.output.code(`// ${t('code_get_env')}
async run({ env }) {
  const apiKey = env.API_KEY
  const target = env.DEPLOY_TARGET || 'staging'

  if (!apiKey) {
    throw new Error('API_KEY is required')
  }
}`)

    // Display some current environment variables
    tui.output.info(t('sample_env_vars'))
    tui.output.keyValue({
      NODE_ENV: env.NODE_ENV || '(not set)',
      CI: env.CI || '(not set)',
      USER: env.USER || env.USERNAME || '(not set)',
    })
    tui.output.newline()

    // 4. CI-compatible pattern
    tui.output.step(4, t('section_pattern'))
    tui.output.code(`// ${t('code_ci_pattern')}
export default defineAction({
  name: 'deploy',
  async run({ tui, env, $ }) {
    // ${t('code_check_required')}
    if (!env.DEPLOY_TOKEN) {
      throw new Error('DEPLOY_TOKEN is required')
    }

    // ${t('code_output_by_mode')}
    if (tui.control.isInteractive()) {
      const spinner = tui.control.spinner({ message: 'Deploying...' })
      spinner.start()
      await $\`deploy.sh\`
      spinner.succeed('Deployed!')
    } else {
      tui.output.log('Deploying...')
      await $\`deploy.sh\`
      tui.output.success('Deployed!')
    }
  }
})`)
    tui.output.newline()

    // GitHub Actions usage example
    tui.output.info(t('github_actions_example'))
    tui.output.code(`# .github/workflows/deploy.yml
- uses: ./actions/arere-action
  with:
    action: deploy
  env:
    DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}`)
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
