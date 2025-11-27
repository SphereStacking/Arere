/**
 * Progress bar component
 */

import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

export interface ProgressBarProps {
  /** Progress percentage (0-100) */
  percent: number
  /** Progress message */
  message?: string
  /** Width of the progress bar (default: 40) */
  width?: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percent, message, width = 40 }) => {
  const { primaryColor } = useTheme()
  const clampedPercent = Math.max(0, Math.min(100, percent))
  const filledWidth = Math.round((clampedPercent / 100) * width)
  const emptyWidth = width - filledWidth

  const filledBar = '█'.repeat(filledWidth)
  const emptyBar = '░'.repeat(emptyWidth)

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={primaryColor}>[</Text>
        <Text color={primaryColor}>{filledBar}</Text>
        <Text dimColor>{emptyBar}</Text>
        <Text color={primaryColor}>]</Text>
        <Text> {clampedPercent.toFixed(0)}%</Text>
      </Box>
      {message && (
        <Box marginTop={1}>
          <Text dimColor>{message}</Text>
        </Box>
      )}
    </Box>
  )
}
