/**
 * Tutorial 12: External SDK Usage
 *
 * Related docs: docs/content/ja/1.guides/4.developing-plugins.md
 *
 * What you'll learn:
 * - Dynamic imports for external libraries
 * - Using API clients
 * - Async processing and error handling
 * - Dependency management in plugins
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'External SDK Usage',
    title: 'External SDK Tutorial',
    intro: 'Learn how to use external libraries and APIs in your actions.',
    section_import: 'Dynamic Imports',
    section_fetch: 'Using Fetch API',
    section_sdk: 'Using SDK Libraries',
    section_deps: 'Managing Dependencies',
    fetching: 'Fetching data...',
    completed: 'External SDK tutorial completed!',
    congratulations: 'Congratulations! You have completed all tutorials!',
    // Code block comments
    code_builtin_modules: 'Node.js built-in modules',
    code_dynamic_import: 'Dynamic import of external libraries',
    code_fetch_http: 'HTTP request with Fetch API',
    code_with_error_handling: 'With error handling',
    code_octokit_example: 'Octokit (GitHub API) example',
    code_package_json: 'Dependency definition in package.json',
    best_practices: 'Best practices:',
    bp_peer_deps: 'Use peerDependencies for arere',
    bp_pin_versions: 'Pin major versions in dependencies',
    bp_dynamic_imports: 'Use dynamic imports for optional deps',
    bp_handle_missing: 'Handle missing dependencies gracefully',
  },
  ja: {
    description: '外部 SDK の使用',
    title: '外部 SDK チュートリアル',
    intro: 'アクションで外部ライブラリや API を使用する方法を学びます。',
    section_import: '動的インポート',
    section_fetch: 'Fetch API の使用',
    section_sdk: 'SDK ライブラリの使用',
    section_deps: '依存関係の管理',
    fetching: 'データを取得中...',
    completed: '外部 SDK チュートリアル完了！',
    congratulations: 'おめでとうございます！全てのチュートリアルを完了しました！',
    // Code block comments
    code_builtin_modules: 'Node.js 組み込みモジュール',
    code_dynamic_import: '外部ライブラリの動的インポート',
    code_fetch_http: 'Fetch API で HTTP リクエスト',
    code_with_error_handling: 'エラーハンドリング付き',
    code_octokit_example: 'Octokit (GitHub API) の例',
    code_package_json: 'package.json での依存関係定義',
    best_practices: 'ベストプラクティス:',
    bp_peer_deps: 'arere は peerDependencies に指定',
    bp_pin_versions: 'メジャーバージョンを固定',
    bp_dynamic_imports: 'オプションの依存は動的インポート',
    bp_handle_missing: '依存関係の欠落を適切に処理',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['sdk', 'api'],
  translations,
  run: async ({ tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Dynamic imports
    tui.output.step(1, t('section_import'))
    tui.output.code(`// ${t('code_builtin_modules')}
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// ${t('code_dynamic_import')}
async run({ tui }) {
  const { format } = await import('date-fns')
  const chalk = (await import('chalk')).default

  const now = format(new Date(), 'yyyy-MM-dd')
  tui.output.log(chalk.blue(now))
}`)
    tui.output.newline()

    // 2. Using Fetch API
    tui.output.step(2, t('section_fetch'))
    tui.output.code(`// ${t('code_fetch_http')}
const response = await fetch('https://api.example.com/data')
const data = await response.json()

// ${t('code_with_error_handling')}
try {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`)
  }
  return await res.json()
} catch (error) {
  tui.output.error('API request failed')
}`)

    // Actual API call (public API)
    const spinner = tui.control.spinner({ message: t('fetching') })
    spinner.start()

    try {
      const response = await fetch('https://api.github.com/zen')
      if (response.ok) {
        const wisdom = await response.text()
        spinner.succeed('Fetched!')
        tui.output.info(`GitHub Zen: "${wisdom}"`)
      } else {
        spinner.fail('Failed to fetch')
      }
    } catch {
      spinner.fail('Network error')
    }
    tui.output.newline()

    // 3. Using SDK libraries
    tui.output.step(3, t('section_sdk'))
    tui.output.code(`// ${t('code_octokit_example')}
import { Octokit } from '@octokit/rest'

async run({ env }) {
  const octokit = new Octokit({
    auth: env.GITHUB_TOKEN
  })

  const { data } = await octokit.repos.get({
    owner: 'anthropics',
    repo: 'claude-code'
  })

  tui.output.log(\`Stars: \${data.stargazers_count}\`)
}`)
    tui.output.newline()

    // 4. Dependency management
    tui.output.step(4, t('section_deps'))
    tui.output.code(`// ${t('code_package_json')}
{
  "name": "arere-plugin-example",
  "dependencies": {
    "@octokit/rest": "^20.0.0",
    "date-fns": "^3.0.0"
  },
  "peerDependencies": {
    "arere": ">=0.1.0"
  }
}`)

    tui.output.info(t('best_practices'))
    tui.output.list([
      t('bp_peer_deps'),
      t('bp_pin_versions'),
      t('bp_dynamic_imports'),
      t('bp_handle_missing'),
    ])
    tui.output.newline()

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.newline()

    // All tutorials completed message
    tui.output.section(t('congratulations'))
    tui.output.list([
      '01: Hello World',
      '02: Output API',
      '03: Prompt Basics',
      '04: Shell Executor',
      '05: i18n Inline',
      '06: i18n Locales',
      '07: Config Usage',
      '08: Error Handling',
      '09: Visual Feedback',
      '10: Timing Control',
      '11: Headless Mode',
      '12: External SDK',
    ])
  },
})
