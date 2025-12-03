/**
 * PluginDetailHeader - Plugin information header
 *
 * Displays plugin name, version, and description.
 */

import type { LoadedPlugin } from '@/plugin/types'
import { useTheme } from '@/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

export interface PluginDetailHeaderProps {
  plugin: LoadedPlugin
}

/**
 * Plugin detail header component
 *
 * @example
 * ```tsx
 * <PluginDetailHeader
 *   plugin={plugin}
 * />
 * ```
 */
export const PluginDetailHeader: React.FC<PluginDetailHeaderProps> = React.memo(({ plugin }) => {
  const { primaryColor } = useTheme()

  return (
    <Box marginBottom={1} flexDirection="column">
      <Box>
        <Text bold color={primaryColor}>
          {plugin.meta.name}
        </Text>
        <Text dimColor> v{plugin.meta.version}</Text>
      </Box>
      {plugin.meta.description && (
        <Box>
          <Text>{plugin.meta.description}</Text>
        </Box>
      )}
    </Box>
  )
})
