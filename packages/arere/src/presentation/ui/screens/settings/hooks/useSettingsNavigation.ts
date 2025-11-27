/**
 * useSettingsNavigation - Settings screen navigation logic
 *
 * Manages:
 * - Screen mode (list/edit)
 * - Selected item (general settings or plugins)
 * - Editing state
 */

import { useState } from 'react'

export type SettingKey = 'locale' | 'logLevel' | 'primaryColor'
export type ScreenMode = 'list' | 'edit'
export type FocusSection = 'general' | 'plugins'

export interface SelectedItem {
  section: FocusSection
  index: number
}

export interface UseSettingsNavigationReturn {
  // State
  mode: ScreenMode
  editingKey: SettingKey | null
  selectedItem: SelectedItem

  // Actions
  setMode: (mode: ScreenMode) => void
  setEditingKey: (key: SettingKey | null) => void
  setSelectedItem: (item: SelectedItem) => void
  startEdit: (key: SettingKey) => void
  cancelEdit: () => void
  finishEdit: () => void
}

/**
 * Settings screen navigation hook
 *
 * @example
 * ```tsx
 * const {
 *   mode,
 *   editingKey,
 *   selectedItem,
 *   setSelectedItem,
 *   startEdit,
 *   finishEdit,
 *   cancelEdit,
 * } = useSettingsNavigation()
 * ```
 */
export function useSettingsNavigation(): UseSettingsNavigationReturn {
  const [mode, setMode] = useState<ScreenMode>('list')
  const [editingKey, setEditingKey] = useState<SettingKey | null>(null)
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({
    section: 'general',
    index: 0,
  })

  const startEdit = (key: SettingKey) => {
    setEditingKey(key)
    setMode('edit')
  }

  const cancelEdit = () => {
    setMode('list')
    setEditingKey(null)
  }

  const finishEdit = () => {
    setMode('list')
    setEditingKey(null)
  }

  return {
    mode,
    editingKey,
    selectedItem,
    setMode,
    setEditingKey,
    setSelectedItem,
    startEdit,
    cancelEdit,
    finishEdit,
  }
}
