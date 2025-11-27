/**
 * Main application component
 *
 * Uses Zustand stores for state management.
 * All business logic is delegated to screens and hooks.
 */

import type { Action } from '@/domain/action/types'
import type { KeyBindingsConfig } from '@/domain/keybindings'
import type { LoadedPlugin } from '@/domain/plugin/types'
import type { ArereConfig } from '@/infrastructure/config/schema'
import { defaultKeyBindings } from '@/infrastructure/keybindings'
import { clearPromptHandler, setPromptHandler } from '@/infrastructure/prompt/renderer'
import type { PromptRequest } from '@/infrastructure/prompt/renderer'
import { Header, HEADER_HEIGHT } from '@/presentation/ui/components/Header'
import { PageMetaContext, PageMetaProvider } from '@/presentation/ui/hooks/PageMetaContext'
import { useKeyboardInput } from '@/presentation/ui/hooks/app/useKeyboardInput'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { usePageMeta } from '@/presentation/ui/hooks/usePageMeta'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { ScreenRouter } from '@/presentation/ui/routing/ScreenRouter'
import { useExecutionStore } from '@/presentation/ui/stores/executionStore'
import { usePromptStore } from '@/presentation/ui/stores/promptStore'
import { useScreenStore } from '@/presentation/ui/stores/screenStore'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'
import type { ScreenState } from '@/presentation/ui/types'
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
 */
function getPageMeta(
  screen: ScreenState,
  actionsCount: number,
  hints: ReturnType<typeof useKeyBindingHints>,
  selectedActionName?: string
) {
  switch (screen) {
    case 'list':
      return {
        breadcrumb: ['home'],
        hint: actionsCount > 0 ? hints.list() : hints.listNoActions(),
      }
    case 'search':
      return {
        breadcrumb: ['home', 'search'],
        hint: hints.search(),
      }
    case 'executing':
      return {
        breadcrumb: selectedActionName ? ['home', selectedActionName] : ['home'],
        hint: hints.executing(),
      }
    case 'success':
    case 'error':
      return {
        breadcrumb: selectedActionName ? ['home', selectedActionName] : ['home'],
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

  // Initialize stores on mount
  useEffect(() => {
    initializeSettings(config, plugins, actions, onPluginReload)
    reloadLayerConfigs()
  }, [])

  // Create AppContext value that updates with currentConfig and keyBindings
  const appContextValue = useMemo(
    () => ({ config: currentConfig, keyBindings }),
    [currentConfig, keyBindings]
  )

  // Get keybinding hints
  const hints = useKeyBindingHints()

  // Calculate page meta with memoization
  const pageMeta = useMemo(
    () => getPageMeta(screen, currentActions.length, hints, selectedAction?.meta.name),
    [screen, currentActions.length, hints, selectedAction?.meta.name]
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

  // Set up prompt handler on mount
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
