/**
 * Empty state component
 */

import { t } from '@/i18n/index'
import { useTheme } from '@/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

export const EmptyState: React.FC = () => {
  const { warningColor } = useTheme()

  return (
    <Box flexDirection="column" alignItems="center" paddingY={2}>
      <Text color={warningColor}>{t('ui:empty_state.title')}</Text>
      <Box marginTop={1}>
        <Text dimColor>{t('ui:empty_state.description')}</Text>
      </Box>
      <Box marginTop={1} flexDirection="column" paddingLeft={2}>
        <Text dimColor>• {t('ui:empty_state.locations.project')}</Text>
        <Text dimColor>• {t('ui:empty_state.locations.global')}</Text>
        <Text dimColor>• {t('ui:empty_state.locations.plugin')}</Text>
      </Box>
      <Box marginTop={2}>
        <Text dimColor>{t('ui:empty_state.help_hint')}</Text>
      </Box>
    </Box>
  )
}
