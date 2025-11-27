/**
 * PluginRow component - Single plugin display in settings
 */

import type { LoadedPlugin } from '@/domain/plugin/types'
import { t } from '@/infrastructure/i18n/index'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

export interface PluginRowProps {
  /** Plugin to display */
  plugin: LoadedPlugin
  /** Whether this plugin is currently selected */
  isSelected: boolean
}

/**
 * PluginRow component
 *
 * Displays a single plugin row with checkbox, name, version, description, and metadata
 *
 * @param props - Plugin row props
 * @returns Rendered plugin row
 *
 * @example
 * ```tsx
 * <PluginRow
 *   plugin={loadedPlugin}
 *   isSelected={true}
 * />
 * ```
 */
export const PluginRow: React.FC<PluginRowProps> = ({ plugin, isSelected }) => {
  const { primaryColor, inactiveColor, successColor, errorColor } = useTheme()

  return (
    <Box flexDirection="column" marginLeft={2}>
      <Box>
        {/* Selection indicator */}
        <Box width={2}>
          <Text color={isSelected ? primaryColor : inactiveColor}>{isSelected ? '❯' : ' '}</Text>
        </Box>

        {/* Enabled/Disabled checkbox */}
        <Box width={3}>
          <Text color={plugin.enabled ? successColor : errorColor}>
            [{plugin.enabled ? '●' : '○'}]
          </Text>
        </Box>

        {/* Plugin name and version */}
        <Text bold={isSelected} color={isSelected ? primaryColor : undefined}>
          {plugin.meta.name}
        </Text>
        <Text dimColor> v{plugin.meta.version}</Text>
      </Box>

      {/* Description */}
      {plugin.meta.description && (
        <Box marginLeft={7}>
          <Text dimColor>{plugin.meta.description}</Text>
        </Box>
      )}

      {/* Action count and configurable indicator */}
      <Box marginLeft={7}>
        <Text dimColor>
          {t('ui:plugins.list.actions_count', { count: plugin.actionPaths.length })}
          {plugin.configSchema && ` • ${t('ui:plugins.list.configurable')}`}
        </Text>
      </Box>
    </Box>
  )
}
