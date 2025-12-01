/**
 * Headless Mode - Non-interactive execution for CI/CD
 */

import { loadActions } from '@/core/loader'
import { ActionRegistry } from '@/core/registry'
import { findActionsWithPriority } from '@/core/resolver'
import { runAction } from '@/domain/action/executor'
import type { Action } from '@/domain/action/types'
import { analyzeActionArgs, formatArgsHelp } from '@/infrastructure/args/analyzer'
import type { ArereConfig } from '@/infrastructure/config/schema'
import { registerTranslations, t } from '@/infrastructure/i18n/index'
import { PlainTextRenderer } from '@/infrastructure/output/plain-renderer'
import { createPluginManager } from '@/infrastructure/plugin/index'
import { createReadLineBackend } from '@/infrastructure/prompt/backends/readline-backend'
import { clearPromptHandler, setPromptHandler } from '@/infrastructure/prompt/renderer'
import { formatError } from '@/shared/utils/error'
import { logger, setLogLevel } from '@/shared/utils/logger'
import { getActionDirectories } from '@/shared/utils/path'
import type { ExecutionMode } from './types'

/**
 * Headless Mode implementation
 *
 * Runs actions without UI, suitable for CI/CD environments
 */
export class HeadlessMode implements ExecutionMode {
  constructor(private config: ArereConfig) {}

  /**
   * Show help for an action
   */
  private showActionHelp(action: Action): void {
    const meta = analyzeActionArgs(action.filePath)

    if (meta) {
      // Override with actual action meta if available
      if (action.meta.name) {
        meta.name = action.meta.name
      }
      if (typeof action.meta.description === 'string') {
        meta.description = action.meta.description
      }

      console.log(formatArgsHelp(meta))
    } else {
      // Fallback if static analysis fails
      console.log(action.meta.name)
      if (typeof action.meta.description === 'string') {
        console.log(`  ${action.meta.description}`)
      }
      console.log()
      console.log('No CLI arguments available for this action.')
    }

    // Show additional info
    console.log()
    console.log('Usage:')
    console.log(`  arere run ${action.meta.name} [options]`)
  }

  async run(actionName?: string, args: string[] = []): Promise<void> {
    if (!actionName) {
      console.error('Error: Action name is required in headless mode')
      console.error('Usage: arere run <action-name>')
      process.exit(1)
    }

    // Check if --help is requested for the action
    const showHelp = args.includes('--help') || args.includes('-h')

    try {
      // Disable logger output in headless mode (only show errors)
      setLogLevel('error')

      // Set up ReadLine prompt backend for headless mode
      const promptBackend = createReadLineBackend()
      setPromptHandler(promptBackend)

      // Initialize registry
      const registry = new ActionRegistry()

      // Load plugins and directory actions in parallel
      const pluginManager = createPluginManager()
      const actionDirectories = getActionDirectories()

      const [pluginActions, globalActions, projectActions] = await Promise.all([
        // Load plugins (highest priority)
        (async () => {
          await pluginManager.loadAll(this.config)
          return pluginManager.getActions()
        })(),

        // Load global actions
        (async () => {
          const actionPaths = await findActionsWithPriority(actionDirectories.global)
          const actions = await loadActions(actionPaths)
          // Set location to 'global'
          for (const action of actions) {
            action.location = 'global'
            // Register translations if available
            if (action.translations) {
              registerTranslations(action.meta.name, action.translations)
            }
          }
          return actions
        })(),

        // Load project actions
        (async () => {
          const actionPaths = await findActionsWithPriority(actionDirectories.project)
          const actions = await loadActions(actionPaths)
          // Set location to 'project'
          for (const action of actions) {
            action.location = 'project'
            // Register translations if available
            if (action.translations) {
              registerTranslations(action.meta.name, action.translations)
            }
          }
          return actions
        })(),
      ])

      // Register plugin actions first (highest priority)
      for (const action of pluginActions) {
        // Register translations if available
        if (action.translations) {
          registerTranslations(action.meta.name, action.translations)
        }
        registry.register(action)
      }

      // Register global actions
      for (const action of globalActions) {
        registry.register(action)
      }

      // Register project actions
      for (const action of projectActions) {
        registry.register(action)
      }

      // Find action by name
      const action = registry.getByName(actionName)

      if (!action) {
        console.error(`Error: Action "${actionName}" not found`)
        console.error('\nAvailable actions:')
        for (const a of registry.getAll()) {
          console.error(`  - ${a.meta.name}`)
        }
        process.exit(1)
      }

      // Show help and exit if --help is requested
      if (showHelp) {
        this.showActionHelp(action)
        process.exit(0)
      }

      // Run action
      console.log(`Running action: ${action.meta.name}`)
      console.log() // Empty line for separation

      // Create renderer for real-time output
      const renderer = new PlainTextRenderer()

      // Helper to render a message
      const renderMessage = (message: {
        type: string
        content: unknown
        meta?: Record<string, unknown>
      }) => {
        switch (message.type) {
          case 'log':
            renderer.log(message.content)
            break
          case 'success':
            renderer.success(String(message.content))
            break
          case 'error':
            renderer.error(String(message.content))
            break
          case 'warn':
            renderer.warn(String(message.content))
            break
          case 'info':
            renderer.info(String(message.content))
            break
          case 'newline':
            renderer.newline()
            break
          case 'code':
            renderer.code(String(message.content))
            break
          case 'section':
            renderer.section(String(message.content))
            break
          case 'list':
            renderer.list(message.content as string[])
            break
          case 'keyValue':
            renderer.keyValue(message.content as Record<string, unknown>)
            break
          case 'table':
            renderer.table(message.content as Record<string, unknown>[])
            break
          case 'json':
            renderer.json(message.content, message.meta?.indent as number | undefined)
            break
          case 'separator':
            renderer.separator(
              message.meta?.char as string | undefined,
              message.meta?.length as number | undefined,
            )
            break
          case 'step':
            renderer.step((message.meta?.number as number) ?? 0, String(message.content))
            break
        }
      }

      // Run action with real-time output streaming
      const plugins = pluginManager.getPlugins()
      const result = await runAction(action, {
        args,
        plugins,
        onOutput: renderMessage,
      })

      // Messages are already rendered via onOutput callback
      const messages = result.outputCollector.getMessages()

      if (messages.length > 0) {
        console.log() // Empty line after output
      }

      console.log(`✓ Action "${action.meta.name}" completed successfully`)

      // Clean up prompt handler
      clearPromptHandler()
      process.exit(0)
    } catch (error) {
      // Clean up prompt handler on error
      clearPromptHandler()

      console.error(`✗ Action "${actionName}" failed:`)
      console.error(formatError(error))

      if (error instanceof Error && error.stack) {
        console.error('\nStack trace:')
        console.error(error.stack)
      }

      process.exit(1)
    }
  }
}
