#!/usr/bin/env node

/**
 * CLI entry point for the 'arere' launcher
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileConfigManager } from './config/manager'
import { initI18n, t } from './i18n/index'
import { formatError } from './lib/error'
import { logger } from './lib/logger'
import { HeadlessMode } from './modes/headless-mode'
import { UIMode } from './modes/ui-mode'

/**
 * Get version from package.json
 */
function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)

    // Try common locations for package.json
    const candidates = [
      join(__dirname, '../package.json'), // From dist/ in production
      join(__dirname, '../../package.json'), // From src/ in development (fallback)
    ]

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        const packageJson = JSON.parse(readFileSync(candidate, 'utf-8'))
        return packageJson.version || '0.0.0'
      }
    }

    return '0.0.0'
  } catch {
    return '0.0.0'
  }
}

/**
 * Show help message
 */
function showHelp(): void {
  const version = getVersion()
  const appName = t('common:app_name')
  const tagline = t('common:app_tagline')
  const usage = t('cli:help.usage')
  const cmdDefault = t('cli:help.commands.default')
  const cmdRun = t('cli:help.commands.run')
  const cmdVersion = t('cli:help.commands.version')
  const cmdHelp = t('cli:help.commands.help')
  const versionLabel = t('cli:help.version_label')

  console.log(`
${appName} - ${tagline}

${usage}:
  arere                         ${cmdDefault}
  arere run <action> [args...]  ${cmdRun}
  arere --version               ${cmdVersion}
  arere --help                  ${cmdHelp}

${versionLabel}: ${version}
  `)
}

/**
 * Show help message for 'arere run' command
 */
function showRunHelp(): void {
  const title = t('cli:run_help.title')
  const usage = t('cli:run_help.usage')
  const usageLine = t('cli:run_help.usage_line')
  const arguments_ = t('cli:run_help.arguments')
  const argAction = t('cli:run_help.arg_action')
  const argArgs = t('cli:run_help.arg_args')
  const options = t('cli:run_help.options')
  const optHelp = t('cli:run_help.opt_help')
  const examples = t('cli:run_help.examples')
  const exampleBasic = t('cli:run_help.example_basic')
  const exampleWithArg = t('cli:run_help.example_with_arg')
  const exampleWithFlags = t('cli:run_help.example_with_flags')
  const accessingArgs = t('cli:run_help.accessing_args')

  console.log(`
${title}

${usage}:
  ${usageLine}

${arguments_}:
  <action>                 ${argAction}
  [args...]                ${argArgs}

${options}:
  --help, -h               ${optHelp}

${examples}:
  arere run deploy                      ${exampleBasic}
  arere run deploy production           ${exampleWithArg}
  arere run deploy production --force   ${exampleWithFlags}

${accessingArgs}:
  export default defineAction({
    name: 'deploy',
    description: 'Deploy to target environment',
    async run({ args, tui }) {
      const target = args[0] || 'staging'
      const force = args.includes('--force')
      tui.output.info(\`Deploying to \${target}...\`)
    }
  })
  `)
}

/**
 * Main function
 */
async function main() {
  try {
    // Load config first
    const manager = new FileConfigManager()
    const config = await manager.loadMerged()

    // Initialize i18n with config locale
    await initI18n(config.locale)

    const args = process.argv.slice(2)

    // Handle --version
    if (args.includes('--version') || args.includes('-v')) {
      console.log(getVersion())
      return
    }

    // Parse subcommand first to handle subcommand-specific help
    const subcommand = args[0]

    if (subcommand === 'run') {
      // Headless mode: arere run <action> [args...]
      const actionName = args[1]
      const actionArgs = args.slice(2) // Everything after action name

      // Handle arere run --help (without action name)
      if (!actionName || actionName === '--help' || actionName === '-h') {
        showRunHelp()
        return
      }

      // Pass to HeadlessMode (handles action-specific --help)
      const mode = new HeadlessMode(config)
      await mode.run(actionName, actionArgs)
    } else {
      // Handle --help (only for non-subcommand usage)
      if (args.includes('--help') || args.includes('-h')) {
        showHelp()
        return
      }

      // UI mode (default): arere
      const mode = new UIMode(config)
      await mode.run()
    }
  } catch (error) {
    logger.error('Failed to start arere:', formatError(error))
    process.exit(1)
  }
}

main()
