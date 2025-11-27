/**
 * Success screen component
 *
 * Uses Zustand stores for state management.
 */

import { t } from '@/infrastructure/i18n/index'
import { HEADER_HEIGHT } from '@/presentation/ui/components/Header'
import { OutputRenderer } from '@/presentation/ui/components/OutputRenderer'
import { ScrollArea } from '@/presentation/ui/components/ScrollArea'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { useExecutionStore } from '@/presentation/ui/stores/executionStore'
import { Box, Text } from 'ink'
import React from 'react'

/**
 * Success screen component
 */
export const SuccessScreen: React.FC = () => {
  // Get state from stores
  const selectedAction = useExecutionStore((s) => s.selectedAction)
  const executionDuration = useExecutionStore((s) => s.executionDuration)
  const outputMessages = useExecutionStore((s) => s.outputMessages)
  const { rows } = useTerminalSize()

  const message = t('ui:success.message', { name: selectedAction?.meta.name || '' })
  const duration = executionDuration
  const { successColor } = useTheme()

  // Calculate visible height
  const visibleHeight = rows - HEADER_HEIGHT

  return (
    <ScrollArea height={visibleHeight} enableKeyboardScroll showScrollbar>
      <Box flexDirection="column" flexGrow={1} paddingY={1}>
        {/* Show output messages first if any */}
        {outputMessages && outputMessages.length > 0 && (
          <Box flexDirection="column" marginBottom={1}>
            <OutputRenderer messages={outputMessages} />
          </Box>
        )}

        {/* Success summary */}
        <Box flexDirection="column" alignItems="center" paddingY={1}>
          <Text color={successColor}>{t('ui:success.title')}</Text>
          <Box marginTop={1}>
            <Text>{message}</Text>
          </Box>
          {duration !== undefined && (
            <Box marginTop={1}>
              <Text dimColor>{t('ui:success.duration', { ms: duration })}</Text>
            </Box>
          )}
          <Box marginTop={2}>
            <Text dimColor>{t('ui:success.hint')}</Text>
          </Box>
        </Box>
      </Box>
    </ScrollArea>
  )
}
