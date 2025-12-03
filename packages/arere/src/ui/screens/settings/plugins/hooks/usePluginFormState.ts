/**
 * usePluginFormState - Plugin configuration form state management
 *
 * Manages:
 * - Form field values
 * - Editing state (text/select mode)
 * - Edited fields tracking
 * - Focus state
 *
 * Uses Zustand stores for state management.
 */

import { useSettingsStore } from '@/ui/stores/settingsStore'
import { type FormField, schemaToFields } from '@/ui/utils/schema-to-fields'
import { useEffect, useState } from 'react'

export type EditingState = null | {
  field: FormField
  type: 'text' | 'select'
  currentValue: unknown
}

export interface UsePluginFormStateReturn {
  // Field configuration
  fields: FormField[]
  hasConfig: boolean

  // Form values
  values: Record<string, unknown>
  setValues: React.Dispatch<React.SetStateAction<Record<string, unknown>>>

  // Focus management
  focusedFieldIndex: number
  setFocusedFieldIndex: React.Dispatch<React.SetStateAction<number>>

  // Editing state
  editingState: EditingState
  setEditingState: React.Dispatch<React.SetStateAction<EditingState>>

  // Edited fields tracking
  editedFields: Set<string>
  setEditedFields: React.Dispatch<React.SetStateAction<Set<string>>>

  // Helper functions
  getLayerPluginConfig: () => Record<string, unknown> | undefined
}

/**
 * Plugin form state management hook
 *
 * Uses Zustand stores directly for state:
 * - selectedPlugin from settingsStore
 * - currentLayer from settingsStore
 * - userLayerConfig from settingsStore
 * - workspaceLayerConfig from settingsStore
 *
 * @example
 * ```tsx
 * const {
 *   fields,
 *   values,
 *   editingState,
 *   setEditingState,
 * } = usePluginFormState()
 * ```
 */
export function usePluginFormState(): UsePluginFormStateReturn {
  // Get state from stores
  const plugin = useSettingsStore((s) => s.selectedPlugin)
  const currentLayer = useSettingsStore((s) => s.currentLayer)
  const userLayerConfig = useSettingsStore((s) => s.userLayerConfig)
  const workspaceLayerConfig = useSettingsStore((s) => s.workspaceLayerConfig)

  // Get plugin config from the current layer
  const getLayerPluginConfig = (): Record<string, unknown> | undefined => {
    if (!plugin) return undefined
    const layerConfig = currentLayer === 'user' ? userLayerConfig : workspaceLayerConfig
    const pluginConfig = layerConfig?.plugins?.[plugin.meta.name]

    // Handle both boolean and object plugin config
    if (typeof pluginConfig === 'boolean') {
      return undefined
    }
    return pluginConfig?.config
  }

  const [fields] = useState<FormField[]>(() => {
    if (!plugin?.configSchema) return []
    return schemaToFields(plugin.configSchema)
  })

  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initialValues: Record<string, unknown> = {}
    const layerConfig = getLayerPluginConfig()

    for (const field of fields) {
      if (layerConfig && field.name in layerConfig) {
        initialValues[field.name] = layerConfig[field.name]
      }
    }

    return initialValues
  })

  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0)
  const [editingState, setEditingState] = useState<EditingState>(null)
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set())

  const hasConfig = fields.length > 0

  // Reset values when layer changes
  useEffect(() => {
    const layerConfig = getLayerPluginConfig()
    const newValues: Record<string, unknown> = {}

    for (const field of fields) {
      if (layerConfig && field.name in layerConfig) {
        newValues[field.name] = layerConfig[field.name]
      }
    }

    setValues(newValues)
    setEditedFields(new Set())
  }, [currentLayer])

  return {
    fields,
    hasConfig,
    values,
    setValues,
    focusedFieldIndex,
    setFocusedFieldIndex,
    editingState,
    setEditingState,
    editedFields,
    setEditedFields,
    getLayerPluginConfig,
  }
}
