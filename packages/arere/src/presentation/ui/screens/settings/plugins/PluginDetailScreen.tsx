/**
 * Plugin detail screen component
 *
 * Refactored to use smaller components:
 * - PluginDetailHeader: Plugin info header
 * - PluginConfigForm: Config form list
 * - PluginFieldEditor: Field editing screen
 * - PluginNoConfig: No config message
 * - usePluginFormState: Form state management
 *
 * Uses Zustand stores and hooks for state management.
 */

import { t } from '@/infrastructure/i18n/index'
import { HEADER_HEIGHT } from '@/presentation/ui/components/Header'
import { ScrollArea } from '@/presentation/ui/components/ScrollArea'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { usePageMeta } from '@/presentation/ui/hooks/usePageMeta'
import { usePluginManagement } from '@/presentation/ui/hooks/usePluginManagement'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { useScreenStore } from '@/presentation/ui/stores/screenStore'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'
import { Box, useInput } from 'ink'
import React from 'react'
import { LayerSelector } from '../components/LayerSelector'
import { PluginConfigForm } from './components/PluginConfigForm'
import { PluginDetailHeader } from './components/PluginDetailHeader'
import { PluginFieldEditor } from './components/PluginFieldEditor'
import { PluginNoConfig } from './components/PluginNoConfig'
import { usePluginFormState } from './hooks/usePluginFormState'

/**
 * Plugin detail screen component
 */
export const PluginDetailScreen: React.FC = () => {
  // Get state from stores
  const plugin = useSettingsStore((s) => s.selectedPlugin)
  const currentLayer = useSettingsStore((s) => s.currentLayer)
  const setCurrentLayer = useSettingsStore((s) => s.setCurrentLayer)
  const setScreen = useScreenStore((s) => s.setScreen)
  const { savePluginConfig } = usePluginManagement()
  const { rows } = useTerminalSize()

  // Calculate visible height
  const visibleHeight = rows - HEADER_HEIGHT

  // Form state management
  const {
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
  } = usePluginFormState()

  // Get keybinding hints
  const kbHints = useKeyBindingHints()

  // Handle case when no plugin is selected
  if (!plugin) {
    setScreen('settings')
    return null
  }

  // Set page meta based on editing state
  usePageMeta({
    breadcrumb: editingState
      ? ['home', 'plugins', plugin.meta.name, editingState.field.name]
      : ['home', 'plugins', plugin.meta.name],
    hint: hasConfig
      ? editingState
        ? editingState.type === 'text'
          ? kbHints.editingText()
          : kbHints.editingSelect()
        : kbHints.pluginDetail()
      : kbHints.pluginDetailNoConfig(),
  })

  // Navigation in list mode
  useInput(
    (_input, key) => {
      if (editingState !== null) return

      if (key.escape) {
        setScreen('settings')
        return
      }

      if (!hasConfig) return

      // Layer switching
      if (key.leftArrow) {
        setCurrentLayer(currentLayer === 'workspace' ? 'user' : 'workspace')
        return
      }

      if (key.rightArrow) {
        setCurrentLayer(currentLayer === 'user' ? 'workspace' : 'user')
        return
      }

      // Navigation
      if (key.upArrow) {
        setFocusedFieldIndex((prev) => (prev - 1 + (fields.length + 1)) % (fields.length + 1))
        return
      }

      if (key.downArrow) {
        setFocusedFieldIndex((prev) => (prev + 1) % (fields.length + 1))
        return
      }

      // Enter key
      if (key.return) {
        if (focusedFieldIndex === fields.length) {
          // Save button
          const changedValues: Record<string, unknown> = {}

          for (const key of editedFields) {
            changedValues[key] = values[key]
          }

          if (Object.keys(changedValues).length > 0) {
            savePluginConfig(changedValues, currentLayer)
          } else {
            setScreen('settings')
          }
        } else {
          // Edit field
          const field = fields[focusedFieldIndex]
          if (field.type === 'string' || field.type === 'number') {
            setEditingState({
              field,
              type: 'text',
              currentValue: values[field.name],
            })
          } else if (field.type === 'enum' || field.type === 'boolean') {
            setEditingState({
              field,
              type: 'select',
              currentValue: values[field.name],
            })
          }
        }
        return
      }
    },
    { isActive: editingState === null },
  )

  // Handle text input submission
  const handleTextSubmit = (value: string) => {
    if (!editingState) return

    const field = editingState.field
    let finalValue: unknown = value

    if (field.type === 'number') {
      finalValue = Number(value)
    }

    setValues((prev) => ({
      ...prev,
      [field.name]: finalValue,
    }))

    setEditedFields((prev) => new Set(prev).add(field.name))
    setEditingState(null)
  }

  const handleTextCancel = () => {
    setEditingState(null)
  }

  const handleSelectSubmit = (value: unknown) => {
    if (!editingState) return

    setValues((prev) => ({
      ...prev,
      [editingState.field.name]: value,
    }))

    setEditedFields((prev) => new Set(prev).add(editingState.field.name))
    setEditingState(null)
  }

  const handleSelectCancel = () => {
    setEditingState(null)
  }

  // Render editing screen
  if (editingState) {
    return (
      <ScrollArea height={visibleHeight} showScrollbar>
        <PluginFieldEditor
          plugin={plugin}
          field={editingState.field}
          type={editingState.type}
          currentValue={editingState.currentValue}
          onTextSubmit={handleTextSubmit}
          onTextCancel={handleTextCancel}
          onSelectSubmit={handleSelectSubmit}
          onSelectCancel={handleSelectCancel}
        />
      </ScrollArea>
    )
  }

  // Calculate followIndex for list mode
  // Layout: LayerSelector(1) + margin(1) + Header(~3 lines) + form fields(1 each)
  const FIELD_ITEM_HEIGHT = 1
  const headerOffset = 5 // LayerSelector + margin + header lines
  const followIndex = headerOffset + focusedFieldIndex * FIELD_ITEM_HEIGHT

  // Render list mode
  return (
    <ScrollArea
      height={visibleHeight}
      followIndex={followIndex}
      itemHeight={FIELD_ITEM_HEIGHT}
      showScrollbar
    >
      <Box flexDirection="column" flexGrow={1} padding={1}>
        {/* Layer Selector */}
        <Box marginBottom={1}>
          <LayerSelector currentLayer={currentLayer} />
        </Box>

        {/* Header */}
        <PluginDetailHeader plugin={plugin} />

        {/* Configuration form */}
        {hasConfig ? (
          <PluginConfigForm
            plugin={plugin}
            fields={fields}
            values={values}
            focusedFieldIndex={focusedFieldIndex}
          />
        ) : (
          <PluginNoConfig />
        )}
      </Box>
    </ScrollArea>
  )
}
