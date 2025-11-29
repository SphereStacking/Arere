/**
 * Settings screen component - Unified settings and plugin management
 *
 * Uses Zustand stores and hooks for state management.
 */

import { getOverriddenKeys } from '@/infrastructure/config/override-detector'
import { getNestedValue } from '@/infrastructure/config/utils'
import { t } from '@/infrastructure/i18n/index'
import { HEADER_HEIGHT } from '@/presentation/ui/components/Header'
import { ScrollArea } from '@/presentation/ui/components/ScrollArea'
import type { SelectOption } from '@/presentation/ui/components/inputs'
import { useConfigManagement } from '@/presentation/ui/hooks/useConfigManagement'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { usePageMeta } from '@/presentation/ui/hooks/usePageMeta'
import { usePluginManagement } from '@/presentation/ui/hooks/usePluginManagement'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { useScreenStore } from '@/presentation/ui/stores/screenStore'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'
import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { GeneralSettingsSection } from './components/GeneralSettingsSection'
import { LayerSelector } from './components/LayerSelector'
import { PluginSettingsSection } from './components/PluginSettingsSection'
import { SettingEditMode } from './components/SettingEditMode'
import { type SettingKey, useSettingsNavigation } from './hooks/useSettingsNavigation'

export const SettingsScreen: React.FC = () => {
  // Get state from stores
  const config = useSettingsStore((s) => s.currentConfig)
  const plugins = useSettingsStore((s) => s.currentPlugins)
  const currentLayer = useSettingsStore((s) => s.currentLayer)
  const setCurrentLayer = useSettingsStore((s) => s.setCurrentLayer)
  const userLayerConfig = useSettingsStore((s) => s.userLayerConfig)
  const workspaceLayerConfig = useSettingsStore((s) => s.workspaceLayerConfig)

  const setScreen = useScreenStore((s) => s.setScreen)
  const { rows } = useTerminalSize()

  // Get hooks
  const { saveConfig, resetConfig } = useConfigManagement()
  const { selectPlugin, togglePlugin } = usePluginManagement()

  // Navigation state
  const { mode, editingKey, selectedItem, setSelectedItem, startEdit, finishEdit, cancelEdit } =
    useSettingsNavigation()

  // Layer management
  const [overriddenKeys, setOverriddenKeys] = useState<string[]>([])

  // Calculate overridden keys when layer configs change
  useEffect(() => {
    if (!userLayerConfig || !workspaceLayerConfig) {
      setOverriddenKeys([])
      return
    }

    const overridden = getOverriddenKeys(userLayerConfig, workspaceLayerConfig)
    setOverriddenKeys(overridden)
  }, [userLayerConfig, workspaceLayerConfig])

  // Get keybinding hints
  const kbHints = useKeyBindingHints()

  // Set page meta based on mode
  usePageMeta({
    breadcrumb:
      mode === 'edit' && editingKey
        ? [t('ui:breadcrumb.home'), t('ui:breadcrumb.settings'), editingKey]
        : [t('ui:breadcrumb.home'), t('ui:breadcrumb.settings')],
    hint: kbHints.settings(),
  })

  // Get value from the current layer
  const getLayerValue = (key: string): unknown => {
    if (!userLayerConfig && !workspaceLayerConfig) {
      return getNestedValue(config as Record<string, unknown>, key)
    }

    const layerConfig = currentLayer === 'user' ? userLayerConfig : workspaceLayerConfig
    if (!layerConfig) return undefined
    return getNestedValue(layerConfig as Record<string, unknown>, key)
  }

  // Format value for display
  const formatValue = (key: string): string => {
    const layerValue = getLayerValue(key)
    const mergedValue = getNestedValue(config as Record<string, unknown>, key)

    // Layer value is undefined/null → using default
    if (layerValue === undefined || layerValue === null) {
      const displayValue =
        mergedValue !== undefined && mergedValue !== null ? String(mergedValue) : 'undefined'
      return `${displayValue} (default)`
    }

    // Layer value is set → show value with override indicator if needed
    const displayValue = String(layerValue)

    // Check if this key is overridden (only when viewing user layer)
    if (currentLayer === 'user' && overriddenKeys.includes(key)) {
      return `${displayValue} (⚠ overridden)`
    }

    return displayValue
  }

  // Settings list items
  const settingItems: SelectOption<SettingKey>[] = [
    {
      label: t('ui:settings.options.locale'),
      value: 'locale',
      description: formatValue('locale'),
    },
    {
      label: t('ui:settings.options.logLevel'),
      value: 'logLevel',
      description: formatValue('logLevel'),
    },
    {
      label: t('ui:settings.options.primaryColor'),
      value: 'primaryColor',
      description: formatValue('theme.primaryColor'),
    },
  ]

  // Calculate followIndex for ScrollArea (line-based positioning)
  // Layout: General header (1) + margin (1) + items (3) + margin (1) + Plugins header (1) + margin (1) + plugin items (3 each)
  const PLUGIN_ITEM_HEIGHT = 3 // name + description + actions count
  const followIndex = useMemo(() => {
    if (selectedItem.section === 'general') {
      // General section: header(1) + margin(1) + item index
      return 2 + selectedItem.index
    }
    // Plugins section: general header(1) + margin(1) + items(3) + margin(1) + plugins header(1) + margin(1) + plugin items
    const generalSectionLines = 2 + settingItems.length + 1 + 1 + 1
    return generalSectionLines + selectedItem.index * PLUGIN_ITEM_HEIGHT
  }, [selectedItem, settingItems.length])

  // Calculate visible height
  const visibleHeight = rows - HEADER_HEIGHT

  const kb = useKeyBindings()

  // Keyboard input handling for list mode
  useInput(
    (input, key) => {
      if (mode !== 'list') return

      if (kb.global.back(input, key)) {
        setScreen('list')
        return
      }

      // Delete key - reset to default
      if (kb.settings.reset(input, key)) {
        if (selectedItem.section === 'general') {
          const settingKey = settingItems[selectedItem.index].value
          const configKey = settingKey === 'primaryColor' ? 'theme.primaryColor' : settingKey
          resetConfig(configKey, currentLayer)
        }
        return
      }

      // Layer switching (cycle) - using input arrows for left/right
      if (kb.input.prev(input, key)) {
        setCurrentLayer(currentLayer === 'workspace' ? 'user' : 'workspace')
        return
      }

      if (kb.input.next(input, key)) {
        setCurrentLayer(currentLayer === 'user' ? 'workspace' : 'user')
        return
      }

      // Navigation
      if (kb.list.up(input, key)) {
        if (selectedItem.section === 'general') {
          const newIndex = selectedItem.index - 1
          if (newIndex < 0) {
            if (plugins.length > 0) {
              setSelectedItem({
                section: 'plugins',
                index: plugins.length - 1,
              })
            }
          } else {
            setSelectedItem({ section: 'general', index: newIndex })
          }
        } else {
          const newIndex = selectedItem.index - 1
          if (newIndex < 0) {
            setSelectedItem({
              section: 'general',
              index: settingItems.length - 1,
            })
          } else {
            setSelectedItem({ section: 'plugins', index: newIndex })
          }
        }
        return
      }

      if (kb.list.down(input, key)) {
        if (selectedItem.section === 'general') {
          const newIndex = selectedItem.index + 1
          if (newIndex >= settingItems.length) {
            if (plugins.length > 0) {
              setSelectedItem({
                section: 'plugins',
                index: 0,
              })
            }
          } else {
            setSelectedItem({ section: 'general', index: newIndex })
          }
        } else {
          const newIndex = selectedItem.index + 1
          if (newIndex >= plugins.length) {
            setSelectedItem({
              section: 'general',
              index: 0,
            })
          } else {
            setSelectedItem({ section: 'plugins', index: newIndex })
          }
        }
        return
      }

      // Selection
      if (kb.list.select(input, key)) {
        if (selectedItem.section === 'general') {
          const settingKey = settingItems[selectedItem.index].value
          startEdit(settingKey)
        } else {
          const plugin = plugins[selectedItem.index]
          if (plugin) {
            selectPlugin(plugin)
          }
        }
        return
      }

      // Plugin toggle
      if (kb.list.toggle(input, key)) {
        if (selectedItem.section === 'plugins') {
          const plugin = plugins[selectedItem.index]
          if (plugin) {
            togglePlugin(plugin, !plugin.enabled)
          }
        }
        return
      }
    },
    { isActive: mode === 'list' },
  )

  const handleChoiceSelect = (value: string) => {
    if (editingKey) {
      if (editingKey === 'primaryColor') {
        saveConfig('theme.primaryColor', value, currentLayer)
      } else {
        saveConfig(editingKey, value, currentLayer)
      }
    }
    finishEdit()
  }

  const handleReset = () => {
    if (editingKey) {
      const configKey = editingKey === 'primaryColor' ? 'theme.primaryColor' : editingKey
      resetConfig(configKey, currentLayer)
    }
    finishEdit()
  }

  // Item height for followIndex (1 for general items, 3 for plugin items)
  const itemHeight = selectedItem.section === 'general' ? 1 : PLUGIN_ITEM_HEIGHT

  return (
    <ScrollArea
      height={visibleHeight}
      followIndex={followIndex}
      itemHeight={itemHeight}
      showScrollbar
    >
      <Box flexDirection="column" flexGrow={1} paddingY={1}>
        <Text bold>{t('ui:settings.title')}</Text>

        {mode === 'list' && (
          <Box marginTop={1}>
            <LayerSelector currentLayer={currentLayer} />
          </Box>
        )}

        {mode === 'edit' && editingKey ? (
          <SettingEditMode
            editingKey={editingKey}
            onSelect={handleChoiceSelect}
            onCancel={cancelEdit}
            onReset={handleReset}
          />
        ) : (
          <Box flexDirection="column" marginTop={1}>
            <GeneralSettingsSection
              selectedItem={selectedItem}
              currentLayer={currentLayer}
              overriddenKeys={overriddenKeys}
              settingItems={settingItems}
            />

            <PluginSettingsSection plugins={plugins} selectedItem={selectedItem} />
          </Box>
        )}
      </Box>
    </ScrollArea>
  )
}
