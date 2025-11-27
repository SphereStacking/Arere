/**
 * Executing screen component
 *
 * Uses Zustand stores for state management.
 */

import { t } from '@/infrastructure/i18n/index'
import { HEADER_HEIGHT } from '@/presentation/ui/components/Header'
import { OutputRenderer } from '@/presentation/ui/components/OutputRenderer'
import { ProgressBar } from '@/presentation/ui/components/ProgressBar'
import { ScrollArea } from '@/presentation/ui/components/ScrollArea'
import { Spinner } from '@/presentation/ui/components/Spinner'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { useExecutionStore } from '@/presentation/ui/stores/executionStore'
import { Box, Text } from 'ink'
import React from 'react'

/**
 * Executing screen component
 */
export const ExecutingScreen: React.FC = () => {
  // Get state from stores
  const selectedAction = useExecutionStore((s) => s.selectedAction)
  const outputMessages = useExecutionStore((s) => s.outputMessages)
  const visualFeedback = useExecutionStore((s) => s.visualFeedback)
  const { rows } = useTerminalSize()

  const actionName = selectedAction?.meta.name || 'Unknown'
  const { primaryColor, successColor, errorColor } = useTheme()

  // Calculate visible height
  const visibleHeight = rows - HEADER_HEIGHT

  // Determine what to show based on visual feedback
  const showingSpinner = 'type' in visualFeedback && visualFeedback.type === 'spinner'
  const showingProgress = 'type' in visualFeedback && visualFeedback.type === 'progress'
  const showingDefault = !showingSpinner && !showingProgress

  return (
    <ScrollArea height={visibleHeight} enableKeyboardScroll showScrollbar>
      <Box flexDirection="column" flexGrow={1} paddingY={2}>
        {/* Execution status header with default spinner */}
      {showingDefault && (
        <Box flexDirection="column" alignItems="center">
          <Box>
            <Text color={primaryColor}>
              <Spinner type="dots" />
            </Text>
            <Text> {t('ui:executing.status')}</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>{actionName}</Text>
          </Box>
        </Box>
      )}

      {/* Custom spinner from action */}
      {showingSpinner && (
        <Box flexDirection="column" alignItems="center">
          <Box>
            <Text color={primaryColor}>
              <Spinner type={visualFeedback.spinner.type} />
            </Text>
            <Text> {visualFeedback.spinner.message}</Text>
            {visualFeedback.spinner.status === 'success' && <Text color={successColor}> ✓</Text>}
            {visualFeedback.spinner.status === 'error' && <Text color={errorColor}> ✗</Text>}
          </Box>
          <Box marginTop={1}>
            <Text dimColor>{actionName}</Text>
          </Box>
        </Box>
      )}

      {/* Progress bar from action */}
      {showingProgress && (
        <Box flexDirection="column" alignItems="center">
          <Box marginBottom={1}>
            <Text>{visualFeedback.progress.message}</Text>
            {visualFeedback.progress.status === 'success' && <Text color={successColor}> ✓</Text>}
            {visualFeedback.progress.status === 'error' && <Text color={errorColor}> ✗</Text>}
          </Box>
          <ProgressBar
            percent={(visualFeedback.progress.value / visualFeedback.progress.total) * 100}
          />
          <Box marginTop={1}>
            <Text dimColor>
              {visualFeedback.progress.value} / {visualFeedback.progress.total}
            </Text>
          </Box>
        </Box>
      )}

      {/* Output messages */}
      {outputMessages.length > 0 && (
        <Box marginTop={1}>
          <OutputRenderer messages={outputMessages} />
        </Box>
      )}
      </Box>
    </ScrollArea>
  )
}
