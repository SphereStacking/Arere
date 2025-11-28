import { defineAction } from 'arere'

export default defineAction({
  name: 'ci-api-test',
  description: ({ t }) => t('description'),
  category: 'integration',
  translations: {
    en: {
      description: 'Comprehensive CI API verification test',
      title: 'Arere CI API Test',
      envSection: 'Environment Information',
      outputSection: 'Output API Test',
      shellSection: 'Shell Execution Test',
      controlSection: 'Control API Test',
      promptSection: 'Prompt API Test (CI Skip)',
      configSection: 'Configuration',
      summarySection: 'Test Summary',
      interactive: 'Interactive Mode',
      nonInteractive: 'Non-Interactive Mode (CI)',
      terminalSize: 'Terminal Size',
      allTestsPassed: 'All API tests passed!',
      skippedInCI: 'Skipped in CI (non-interactive)',
      spinnerTest: 'Testing spinner...',
      progressTest: 'Testing progress...',
      delayTest: 'Testing delay (100ms)...',
    },
    ja: {
      description: 'CI環境での包括的なAPI検証テスト',
      title: 'Arere CI APIテスト',
      envSection: '環境情報',
      outputSection: 'Output API テスト',
      shellSection: 'シェル実行テスト',
      controlSection: 'Control API テスト',
      promptSection: 'Prompt API テスト (CI スキップ)',
      configSection: '設定情報',
      summarySection: 'テストサマリー',
      interactive: '対話モード',
      nonInteractive: '非対話モード (CI)',
      terminalSize: '端末サイズ',
      allTestsPassed: '全てのAPIテストが成功しました！',
      skippedInCI: 'CI環境のためスキップ',
      spinnerTest: 'スピナーテスト中...',
      progressTest: 'プログレステスト中...',
      delayTest: '遅延テスト (100ms)...',
    },
  },
  async run({ $, tui, env, cwd, config, t }) {
    const isCI = !tui.control.isInteractive()

    // ========================================
    // 1. Environment Information
    // ========================================
    tui.output.section(t('envSection'))
    tui.output.keyValue({
      'Node.js': process.version,
      Platform: process.platform,
      CWD: cwd,
      CI: env.CI || 'false',
      GITHUB_ACTIONS: env.GITHUB_ACTIONS || 'false',
      Mode: isCI ? t('nonInteractive') : t('interactive'),
    })

    const termSize = tui.control.getTerminalSize()
    tui.output.log(`${t('terminalSize')}: ${termSize.width}x${termSize.height}`)
    tui.output.newline()

    // ========================================
    // 2. Output API Test
    // ========================================
    tui.output.section(t('outputSection'))

    // Basic messages
    tui.output.log('log() - Basic log message')
    tui.output.success('success() - Success message')
    tui.output.info('info() - Info message')
    tui.output.warn('warn() - Warning message')
    // Skip error() to avoid confusion in CI logs
    // tui.output.error('error() - Error message')

    tui.output.newline()

    // Structured output
    tui.output.step(1, 'step() - Step indicator')
    tui.output.step(2, 'Testing list()')

    tui.output.list(['Item A', 'Item B', 'Item C'])

    tui.output.step(3, 'Testing code()')
    tui.output.code('const greeting = "Hello from arere!"')

    tui.output.step(4, 'Testing json()')
    tui.output.json({ test: true, items: [1, 2, 3] }, 2)

    tui.output.step(5, 'Testing table()')
    tui.output.table([
      { name: 'Test A', status: 'pass' },
      { name: 'Test B', status: 'pass' },
    ])

    tui.output.separator('-', 40)
    tui.output.newline()

    // ========================================
    // 3. Shell Execution Test
    // ========================================
    tui.output.section(t('shellSection'))

    const { stdout: echoResult, exitCode } = await $`echo "Hello from shell"`
    tui.output.keyValue({
      Command: 'echo "Hello from shell"',
      Output: echoResult.trim(),
      'Exit Code': exitCode,
    })

    const { stdout: dateResult } = await $`date -u +%Y-%m-%dT%H:%M:%SZ`
    tui.output.log(`Current UTC: ${dateResult.trim()}`)
    tui.output.newline()

    // ========================================
    // 4. Control API Test
    // ========================================
    tui.output.section(t('controlSection'))

    // delay test
    tui.output.log(t('delayTest'))
    const startTime = Date.now()
    await tui.control.delay(100)
    const elapsed = Date.now() - startTime
    tui.output.success(`delay() completed in ${elapsed}ms`)

    // spinner test (non-blocking in CI)
    if (!isCI) {
      tui.output.log(t('spinnerTest'))
      const spinner = tui.control.spinner({ message: 'Loading...' })
      spinner.start()
      await tui.control.delay(500)
      spinner.succeed('Spinner test complete')
    } else {
      tui.output.info(`spinner() - ${t('skippedInCI')}`)
    }

    // progress test (non-blocking in CI)
    if (!isCI) {
      tui.output.log(t('progressTest'))
      const progress = tui.control.progress({ total: 100, message: 'Processing...' })
      progress.start()
      for (let i = 0; i <= 100; i += 20) {
        progress.update(i)
        await tui.control.delay(100)
      }
      progress.succeed('Progress test complete')
    } else {
      tui.output.info(`progress() - ${t('skippedInCI')}`)
    }

    tui.output.newline()

    // ========================================
    // 5. Prompt API Test (CI Skip)
    // ========================================
    tui.output.section(t('promptSection'))

    if (!isCI) {
      // Interactive mode - actually run prompts
      const name = await tui.prompt.text('Enter your name:', { defaultValue: 'Tester' })
      tui.output.log(`Received: ${name}`)

      const confirmed = await tui.prompt.confirm('Continue?', { defaultValue: true })
      tui.output.log(`Confirmed: ${confirmed}`)
    } else {
      // CI mode - skip all prompts
      tui.output.info(`prompt.text() - ${t('skippedInCI')}`)
      tui.output.info(`prompt.number() - ${t('skippedInCI')}`)
      tui.output.info(`prompt.password() - ${t('skippedInCI')}`)
      tui.output.info(`prompt.select() - ${t('skippedInCI')}`)
      tui.output.info(`prompt.confirm() - ${t('skippedInCI')}`)
      tui.output.info(`prompt.multiSelect() - ${t('skippedInCI')}`)
      tui.output.info(`prompt() [form] - ${t('skippedInCI')}`)
      tui.output.info(`prompt() [stepForm] - ${t('skippedInCI')}`)
    }

    tui.output.newline()

    // ========================================
    // 6. Configuration
    // ========================================
    tui.output.section(t('configSection'))
    tui.output.keyValue({
      Locale: config.locale,
      Theme: config.theme?.primaryColor || 'default',
      LogLevel: config.logLevel,
    })
    tui.output.newline()

    // ========================================
    // 7. Summary
    // ========================================
    tui.output.section(t('summarySection'))
    tui.output.success(t('allTestsPassed'))
  },
})
