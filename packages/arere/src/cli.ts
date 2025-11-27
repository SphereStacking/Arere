#!/usr/bin/env node

/**
 * CLI entry point for the 'arere' launcher
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileConfigManager } from './infrastructure/config/manager'
import { initI18n, t } from './infrastructure/i18n/index'
import { HeadlessMode } from './presentation/modes/headless-mode'
import { UIMode } from './presentation/modes/ui-mode'
import { formatError } from './shared/utils/error'
import { logger } from './shared/utils/logger'

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
  const cmdVersion = t('cli:help.commands.version')
  const cmdHelp = t('cli:help.commands.help')
  const versionLabel = t('cli:help.version_label')

  console.log(`
${appName} - ${tagline}

${usage}:
  arere                    ${cmdDefault}
  arere run <action>       Run action in headless mode (for CI/CD)
  arere --version          ${cmdVersion}
  arere --help             ${cmdHelp}

${versionLabel}: ${version}
  `)
}

/**
 * Show help message for 'arere run' command
 */
function showRunHelp(): void {
  console.log(`
arere run - Run an action in headless mode (for CI/CD)

Usage:
  arere run <action>       Run the specified action

Arguments:
  <action>                 Name of the action to run (e.g., 'deploy', 'test')

Options:
  --help, -h               Show this help message

Examples:
  arere run deploy         Run the 'deploy' action
  arere run test           Run the 'test' action
  arere run build          Run the 'build' action

Environment Variables:
  Actions can read environment variables via 'env' in the run context:

    async run({ env }) {
      const target = env.DEPLOY_TARGET || 'staging'
    }

  Pass environment variables in your shell:
    DEPLOY_TARGET=production arere run deploy

GitHub Actions:
  - uses: ./actions/arere-action
    with:
      action: deploy
    env:
      API_KEY: \${{ secrets.API_KEY }}

Note:
  Interactive prompts (prompt.text, prompt.select, etc.) are NOT available
  in headless mode. Use environment variables for input instead.
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
      // Handle arere run --help
      const runArgs = args.slice(1)
      if (runArgs.includes('--help') || runArgs.includes('-h')) {
        showRunHelp()
        return
      }

      // Headless mode: arere run <action>
      const actionName = args[1]

      if (!actionName) {
        console.error('Error: Action name is required')
        console.error('Usage: arere run <action-name>')
        process.exit(1)
      }

      const mode = new HeadlessMode(config)
      await mode.run(actionName)
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
