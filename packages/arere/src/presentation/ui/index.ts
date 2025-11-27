/**
 * UI module public API
 * Re-exports all UI components, hooks, and types
 */

// App
export { App, AppContext, type AppContextValue, type AppProps } from './App'

// Screens - Help
export { HelpScreen } from './screens/help/HelpScreen'

// Screens - Settings
export { SettingsScreen } from './screens/settings/SettingsScreen'
export { PluginListScreen } from './screens/settings/plugins/PluginListScreen'
export { PluginDetailScreen } from './screens/settings/plugins/PluginDetailScreen'

// Screens - Execution
export { ExecutingScreen } from './screens/execution/ExecutingScreen'
export { ErrorScreen } from './screens/execution/ErrorScreen'
export { SuccessScreen } from './screens/execution/SuccessScreen'

// Screens - Prompt
export { PromptScreen } from './screens/prompt/PromptScreen'

// Screens - Home
export { HomeScreen } from './screens/home/HomeScreen'

// Screens - Search
export { SearchScreen } from './screens/search/SearchScreen'

// Components - Shared
export { ActionList, type ActionListScrollInfo } from './components/ActionList'
export { Header } from './components/Header'
export { Footer } from './components/Footer'
export { EmptyState } from './components/EmptyState'
export { ErrorBoundary } from './components/ErrorBoundary'
export { Spinner } from './components/Spinner'
export { ProgressBar } from './components/ProgressBar'
export { MultilineInput } from './components/MultilineInput'
export { OutputRenderer } from './components/OutputRenderer'

// Components - Inputs (unified)
export {
  TextInput,
  SelectInput,
  ConfirmInput,
  MultiSelectInput,
  NumberInput,
  PasswordInput,
  WaitForKeyInput,
} from './components/inputs'
export type {
  TextInputProps,
  SelectInputProps,
  SelectOption,
  ConfirmInputProps,
  MultiSelectInputProps,
  MultiSelectOption,
  NumberInputProps,
  PasswordInputProps,
  WaitForKeyInputProps,
} from './components/inputs'

// Routing
export { ScreenRouter } from './routing/ScreenRouter'

// Hooks
export { usePageMeta } from './hooks/usePageMeta'
export { PageMetaProvider } from './hooks/PageMetaContext'
export { useTheme } from './hooks/useTheme'
export { useTerminalSize, isTerminalTooSmall } from './hooks/useTerminalSize'

// Types
export * from './types'
