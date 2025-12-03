/**
 * UI Mode - Interactive terminal UI with Ink
 */

import { loadActions } from '@/action/loader'
import { ActionRegistry } from '@/action/registry'
import { findActionsWithPriority } from '@/action/resolver'
import type { Action } from '@/action/types'
import type { ArereConfig } from '@/config/schema'
import { registerTranslations, t } from '@/i18n/index'
import { logger } from '@/lib/logger'
import { getActionDirectories } from '@/lib/path'
import { createPluginManager } from '@/plugin/index'
import { App } from '@/ui/App'
import { ErrorBoundary } from '@/ui/components/ErrorBoundary'
import { loadMergedKeybindings } from '@/ui/keybindings'
import { render } from 'ink'
import React from 'react'
import type { ExecutionMode } from './types'

/**
 * UI Mode implementation
 *
 * Renders the interactive TUI using Ink and React components
 */
export class UIMode implements ExecutionMode {
  constructor(private config: ArereConfig) {}

  async run(_actionName?: string): Promise<void> {
    logger.info(t('cli:loading.actions'))

    // Load keybindings from keybindings.json
    const keyBindings = loadMergedKeybindings()

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
        logger.debug(t('cli:info.loaded_global_actions', { count: actions.length }))
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
        logger.debug(t('cli:info.loaded_project_actions', { count: actions.length }))
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

    logger.info(t('cli:info.registered_actions', { count: registry.count }))

    // Create plugin reload function
    const handlePluginReload = async (updatedConfig: ArereConfig): Promise<Action[]> => {
      // Reload plugin actions based on new config
      const reloadedPluginActions = await pluginManager.reloadActions(updatedConfig)

      // Combine all actions: plugin + global + project
      return [...reloadedPluginActions, ...globalActions, ...projectActions]
    }

    // Render UI with ErrorBoundary
    const { waitUntilExit } = render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(App, {
          actions: registry.getAll(),
          config: this.config,
          keyBindings,
          plugins: pluginManager.getPlugins(),
          onPluginReload: handlePluginReload,
          onExit: () => {
            process.exit(0)
          },
        }),
      ),
    )

    await waitUntilExit()
  }
}
