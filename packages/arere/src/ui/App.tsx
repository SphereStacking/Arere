/**
 * Main application component
 *
 * Uses Zustand stores for state management.
 * All business logic is delegated to screens and hooks.
 */

import type { Action } from '@/action/types'
import type { ArereConfig } from '@/config/schema'
import { t } from '@/i18n'
import type { LoadedPlugin } from '@/plugin/types'
import { HEADER_HEIGHT, Header } from '@/ui/components/Header'
import { PageMetaContext, PageMetaProvider } from '@/ui/hooks/PageMetaContext'
import { useKeyboardInput } from '@/ui/hooks/app/useKeyboardInput'
import { useKeyBindingHints } from '@/ui/hooks/useKeyBindingHints'
import { usePageMeta } from '@/ui/hooks/usePageMeta'
import { useTerminalSize } from '@/ui/hooks/useTerminalSize'
import type { KeyBindingsConfig } from '@/ui/keybindings'
import { defaultKeyBindings } from '@/ui/keybindings'
import { clearPromptHandler, setPromptHandler } from '@/ui/prompts/renderer'
import type { PromptRequest } from '@/ui/prompts/renderer'
import { ScreenRouter } from '@/ui/routing/ScreenRouter'
import { useExecutionStore } from '@/ui/stores/executionStore'
import { usePromptStore } from '@/ui/stores/promptStore'
import { useScreenStore } from '@/ui/stores/screenStore'
import { useSettingsStore } from '@/ui/stores/settingsStore'
import type { ScreenState } from '@/ui/types'
import { Box } from 'ink'
import React from 'react'
import { useContext, useEffect, useMemo } from 'react'
import { AppContext } from './AppContext'

export interface AppProps {
  actions: Action[]
  config: ArereConfig
  keyBindings?: KeyBindingsConfig
  plugins: LoadedPlugin[]
  onPluginReload: (config: ArereConfig) => Promise<Action[]>
  onExit: () => void
}

// Re-export for convenience
export { AppContext, type AppContextValue } from './AppContext'

/**
 * Helper function to get page meta for screens that don't have their own usePageMeta
 * Breadcrumb items are already translated here
 */
function getPageMeta(
  screen: ScreenState,
  actionsCount: number,
  hints: ReturnType<typeof useKeyBindingHints>,
  selectedActionName?: string,
) {
  const homeBreadcrumb = t('ui:breadcrumb.home')

  switch (screen) {
    case 'list':
      return {
        breadcrumb: [homeBreadcrumb],
        hint: actionsCount > 0 ? hints.list() : hints.listNoActions(),
      }
    case 'search':
      return {
        breadcrumb: [homeBreadcrumb, t('ui:breadcrumb.search')],
        hint: hints.search(),
      }
    case 'executing':
      return {
        breadcrumb: selectedActionName ? [homeBreadcrumb, selectedActionName] : [homeBreadcrumb],
        hint: hints.executing(),
      }
    case 'success':
    case 'error':
      return {
        breadcrumb: selectedActionName ? [homeBreadcrumb, selectedActionName] : [homeBreadcrumb],
        hint: hints.result(),
      }
    case 'input':
      // input screen uses PromptScreen's usePageMeta for detailed breadcrumb
      return {
        breadcrumb: undefined,
        hint: undefined,
      }
    case 'help':
    case 'settings':
    case 'plugin-list':
    case 'plugin-detail':
      // These screens use their own usePageMeta
      return {
        breadcrumb: undefined,
        hint: undefined,
      }
    default:
      return {
        breadcrumb: undefined,
        hint: undefined,
      }
  }
}

/**
 * Main app component
 */
const AppMain: React.FC<AppProps> = ({
  actions,
  config,
  keyBindings = defaultKeyBindings,
  plugins,
  onPluginReload,
  onExit,
}) => {
  const { meta } = useContext(PageMetaContext)
  const { rows } = useTerminalSize()

  // Get store actions and state
  const screen = useScreenStore((s) => s.screen)
  const setScreen = useScreenStore((s) => s.setScreen)

  const currentConfig = useSettingsStore((s) => s.currentConfig)
  const currentActions = useSettingsStore((s) => s.currentActions)
  const initializeSettings = useSettingsStore((s) => s.initialize)
  const reloadLayerConfigs = useSettingsStore((s) => s.reloadLayerConfigs)

  const selectedAction = useExecutionStore((s) => s.selectedAction)
  const setSelectedAction = useExecutionStore((s) => s.setSelectedAction)
  const setExecutionError = useExecutionStore((s) => s.setExecutionError)

  const { showPrompt } = usePromptStore()

  // Initialize stores on mount (intentionally empty deps - run once on mount)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentional - initialization should only run once
  useEffect(() => {
    initializeSettings(config, plugins, actions, onPluginReload)
    reloadLayerConfigs()
  }, [])

  // Create AppContext value that updates with currentConfig and keyBindings
  const appContextValue = useMemo(
    () => ({ config: currentConfig, keyBindings }),
    [currentConfig, keyBindings],
  )

  // Get keybinding hints
  const hints = useKeyBindingHints()

  // Calculate page meta with memoization
  const pageMeta = useMemo(
    () => getPageMeta(screen, currentActions.length, hints, selectedAction?.meta.name),
    [screen, currentActions.length, hints, selectedAction?.meta.name],
  )

  // Set page meta for screens that don't use their own usePageMeta
  usePageMeta(pageMeta)

  // Global keyboard shortcuts (using keybindings system)
  useKeyboardInput({
    screen,
    setScreen,
    setSelectedAction,
    setSelectedPlugin: () => {}, // Not used in this context
    setExecutionError,
    onExit,
  })

  // Set up prompt handler on mount (intentionally empty deps - handler setup should only run once)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentional - handler setup should only run once
  useEffect(() => {
    const handler = async (request: PromptRequest): Promise<unknown> => {
      setScreen('input')
      const result = await showPrompt(request)
      // Return to executing screen after prompt completes
      setScreen('executing')
      return result
    }
    setPromptHandler(handler)

    return () => {
      clearPromptHandler()
    }
  }, [])

  // Content area height (terminal - header)
  const contentHeight = rows - HEADER_HEIGHT

  return (
    <AppContext.Provider value={appContextValue}>
      <Box flexDirection="column" height={rows}>
        <Header breadcrumb={meta.breadcrumb} hint={meta.hint} />
        <Box height={contentHeight} overflow="hidden" flexGrow={1}>
          <ScreenRouter />
        </Box>
      </Box>
    </AppContext.Provider>
  )
}

/**
 * App component wrapper with PageMetaProvider
 */
export const App: React.FC<AppProps> = (props) => {
  return (
    <PageMetaProvider>
      <AppMain {...props} />
    </PageMetaProvider>
  )
}
