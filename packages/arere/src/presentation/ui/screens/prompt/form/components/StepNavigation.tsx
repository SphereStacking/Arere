/**
 * StepNavigation - Navigation buttons for step form
 */

import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

/** Button types for navigation */
export type NavigationButton = 'back' | 'cancel' | 'next'

export interface StepNavigationProps {
  /** Current step index (0-based) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
  /** Whether we can go back */
  canGoBack: boolean
  /** Whether we can go forward (validation passed) */
  canGoForward: boolean
  /** Back button label */
  backLabel?: string
  /** Next button label */
  nextLabel?: string
  /** Submit button label (shown on last step) */
  submitLabel?: string
  /** Cancel button label */
  cancelLabel?: string
  /** Whether navigation is focused (Tab selected) */
  isFocused?: boolean
  /** Currently selected button */
  selectedButton?: NavigationButton
}

/**
 * Hook for managing step navigation state
 */
export function useStepNavigation(isFirstStep: boolean, initialButton: NavigationButton = 'next') {
  const [selectedButton, setSelectedButton] = useState<NavigationButton>(initialButton)

  // Available buttons based on current step
  const availableButtons = useMemo((): NavigationButton[] => {
    const buttons: NavigationButton[] = []
    if (!isFirstStep) buttons.push('back')
    buttons.push('cancel')
    buttons.push('next')
    return buttons
  }, [isFirstStep])

  // Reset to 'next' when step changes (and 'back' is no longer available)
  useEffect(() => {
    if (isFirstStep && selectedButton === 'back') {
      setSelectedButton('next')
    }
  }, [isFirstStep, selectedButton])

  // Move selection left
  const moveLeft = useCallback(() => {
    const currentIndex = availableButtons.indexOf(selectedButton)
    if (currentIndex > 0) {
      setSelectedButton(availableButtons[currentIndex - 1])
    }
  }, [availableButtons, selectedButton])

  // Move selection right
  const moveRight = useCallback(() => {
    const currentIndex = availableButtons.indexOf(selectedButton)
    if (currentIndex < availableButtons.length - 1) {
      setSelectedButton(availableButtons[currentIndex + 1])
    }
  }, [availableButtons, selectedButton])

  return {
    selectedButton,
    setSelectedButton,
    moveLeft,
    moveRight,
    availableButtons,
  }
}

/**
 * StepNavigation component
 *
 * Displays navigation buttons: [Back] [Cancel] [Next/Submit]
 * Supports Tab focus and left/right key selection
 */
export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  canGoBack,
  canGoForward,
  backLabel = 'Back',
  nextLabel = 'Next',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isFocused = false,
  selectedButton = 'next',
}) => {
  const { primaryColor } = useTheme()
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  // Get button style based on focus and selection
  const getButtonStyle = (
    button: NavigationButton,
    baseColor: string,
  ): { color: string; bold: boolean; inverse: boolean } => {
    const isSelected = isFocused && selectedButton === button
    return {
      color: isSelected ? primaryColor : baseColor,
      bold: isSelected,
      inverse: isSelected,
    }
  }

  return (
    <Box gap={2}>
      {/* Back button */}
      {!isFirstStep && (
        <Text {...getButtonStyle('back', canGoBack ? 'yellow' : 'gray')}>[{backLabel}]</Text>
      )}

      {/* Cancel button */}
      <Text {...getButtonStyle('cancel', 'gray')}>[{cancelLabel}]</Text>

      {/* Next/Submit button */}
      <Text {...getButtonStyle('next', canGoForward ? 'green' : 'gray')}>
        [{isLastStep ? submitLabel : `${nextLabel} →`}]
      </Text>
    </Box>
  )
}
