/**
 * StepIndicator - Shows progress through step form
 */

import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

export interface StepIndicatorProps {
  /** Current step index (0-based) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
  /** Optional step title */
  title?: string
}

/**
 * StepIndicator component
 *
 * Displays: Step 1/3 ◉○○ [Title]
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, title }) => {
  const { primaryColor } = useTheme()

  // Generate step dots: ◉ for current/completed, ○ for future
  const dots = Array.from({ length: totalSteps }, (_, i) => (i <= currentStep ? '◉' : '○')).join(
    '-',
  )

  return (
    <Box gap={2}>
      <Text color={primaryColor} bold>
        Step {currentStep + 1}/{totalSteps}
      </Text>
      <Text color={primaryColor}>{dots}</Text>
      {title && (
        <Text color="white" bold>
          {title}
        </Text>
      )}
    </Box>
  )
}
