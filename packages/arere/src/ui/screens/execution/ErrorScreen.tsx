/**
 * Error screen component
 *
 * Uses Zustand stores for state management.
 */

import { t } from '@/i18n/index'
import { HEADER_HEIGHT } from '@/ui/components/Header'
import { OutputRenderer } from '@/ui/components/OutputRenderer'
import { ScrollArea } from '@/ui/components/ScrollArea'
import { useKeyBindingHints } from '@/ui/hooks/useKeyBindingHints'
import { useTerminalSize } from '@/ui/hooks/useTerminalSize'
import { useTheme } from '@/ui/hooks/useTheme'
import { useExecutionStore } from '@/ui/stores/executionStore'
import { Box, Text } from 'ink'
import React from 'react'

/**
 * Error screen component
 */
export const ErrorScreen: React.FC = () => {
  // Get state from stores
  const executionError = useExecutionStore((s) => s.executionError)
  const outputMessages = useExecutionStore((s) => s.outputMessages)
  const { rows } = useTerminalSize()

  const error = executionError || new Error('Unknown error')
  const message = typeof error === 'string' ? error : error.message
  const { errorColor } = useTheme()
  const hints = useKeyBindingHints()

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

        {/* Error summary */}
        <Box flexDirection="column" alignItems="center" paddingY={1}>
          <Text color={errorColor}>❌ {t('ui:error.title')}</Text>
          <Box marginTop={1}>
            <Text color={errorColor}>{message}</Text>
          </Box>
          <Box marginTop={2}>
            <Text dimColor>{hints.result()}</Text>
          </Box>
        </Box>
      </Box>
    </ScrollArea>
  )
}
