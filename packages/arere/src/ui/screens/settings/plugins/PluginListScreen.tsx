/**
 * Plugin list screen component
 *
 * Uses Zustand stores and hooks for state management.
 */

import { t } from '@/i18n/index'
import { HEADER_HEIGHT } from '@/ui/components/Header'
import { ScrollArea } from '@/ui/components/ScrollArea'
import { useKeyBindingHints } from '@/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/ui/hooks/useKeyBindings'
import { usePageMeta } from '@/ui/hooks/usePageMeta'
import { usePluginManagement } from '@/ui/hooks/usePluginManagement'
import { useTerminalSize } from '@/ui/hooks/useTerminalSize'
import { useTheme } from '@/ui/hooks/useTheme'
import { useScreenStore } from '@/ui/stores/screenStore'
import { useSettingsStore } from '@/ui/stores/settingsStore'
import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useState } from 'react'

/**
 * Plugin list screen component
 */
export const PluginListScreen: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { primaryColor, inactiveColor, successColor, errorColor } = useTheme()
  const { rows } = useTerminalSize()

  const plugins = useSettingsStore((s) => s.currentPlugins)
  const setScreen = useScreenStore((s) => s.setScreen)
  const { selectPlugin, togglePlugin } = usePluginManagement()
  const kbHints = useKeyBindingHints()

  // Calculate visible height
  const visibleHeight = rows - HEADER_HEIGHT

  // Each plugin item is 4 lines: name+version, description, actions count, empty line
  const PLUGIN_ITEM_HEIGHT = 4

  usePageMeta({
    breadcrumb: [t('ui:breadcrumb.home'), t('ui:breadcrumb.plugins')],
    hint: kbHints.pluginList(),
  })

  const kb = useKeyBindings()

  useInput(
    (input, key) => {
      if (kb.global.back(input, key)) {
        setScreen('settings')
        return
      }

      if (kb.list.up(input, key)) {
        setSelectedIndex((prev) => (prev - 1 + plugins.length) % plugins.length)
        return
      }

      if (kb.list.down(input, key)) {
        setSelectedIndex((prev) => (prev + 1) % plugins.length)
        return
      }

      if (kb.list.select(input, key)) {
        if (plugins[selectedIndex]) {
          selectPlugin(plugins[selectedIndex])
        }
        return
      }

      if (kb.list.toggle(input, key)) {
        const plugin = plugins[selectedIndex]
        if (plugin) {
          togglePlugin(plugin, !plugin.enabled)
        }
        return
      }
    },
    { isActive: true },
  )

  // Calculate followIndex offset (title + margin = 2 lines)
  const followIndex = 2 + selectedIndex * PLUGIN_ITEM_HEIGHT

  return (
    <ScrollArea
      height={visibleHeight}
      followIndex={followIndex}
      itemHeight={PLUGIN_ITEM_HEIGHT}
      showScrollbar
    >
      <Box flexDirection="column" flexGrow={1} padding={1}>
        {/* Title */}
        <Box marginBottom={1}>
          <Text bold color={primaryColor}>
            {t('ui:plugins.title')}
          </Text>
        </Box>

        {/* Plugin list */}
        {plugins.length === 0 ? (
          <Box>
            <Text dimColor>{t('ui:plugins.no_plugins')}</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            {plugins.map((plugin, index) => {
              const isSelected = index === selectedIndex
              return (
                <Box key={plugin.meta.name} marginBottom={0}>
                  <Box width={2}>
                    <Text color={isSelected ? primaryColor : inactiveColor}>
                      {isSelected ? '❯' : ' '}
                    </Text>
                  </Box>
                  <Box width={3}>
                    <Text color={plugin.enabled ? successColor : errorColor}>
                      [{plugin.enabled ? '●' : '○'}]
                    </Text>
                  </Box>
                  <Box flexDirection="column" flexGrow={1}>
                    <Box>
                      <Text bold={isSelected} color={isSelected ? primaryColor : undefined}>
                        {plugin.meta.name}
                      </Text>
                      <Text dimColor> v{plugin.meta.version}</Text>
                    </Box>
                    {plugin.meta.description && (
                      <Box marginLeft={2}>
                        <Text dimColor>{plugin.meta.description}</Text>
                      </Box>
                    )}
                    <Box marginLeft={2}>
                      <Text dimColor>
                        {t('ui:plugins.list.actions_count', { count: plugin.actionPaths.length })}
                        {plugin.configSchema && ` • ${t('ui:plugins.list.configurable')}`}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
    </ScrollArea>
  )
}
