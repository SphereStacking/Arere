/**
 * PluginNoConfig - Message when plugin has no configuration
 *
 * Displays a message indicating that the plugin has no configurable options.
 */

import { t } from '@/i18n/index'
import { Box, Text } from 'ink'
import React from 'react'

/**
 * Plugin no config message component
 *
 * @example
 * ```tsx
 * <PluginNoConfig />
 * ```
 */
export const PluginNoConfig: React.FC = React.memo(() => {
  return (
    <Box marginBottom={1}>
      <Text dimColor>{t('ui:plugins.detail.no_config')}</Text>
    </Box>
  )
})
