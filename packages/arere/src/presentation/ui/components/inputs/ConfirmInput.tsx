/**
 * ConfirmInput - Unified Yes/No confirmation component
 *
 * Supports two modes:
 * - standalone: For prompt.confirm() - handles Enter/Escape, centered layout
 * - form: For form fields - real-time onChange, inline layout
 */

import { t } from '@/infrastructure/i18n/index'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useState } from 'react'

export interface ConfirmInputProps {
  /** Current value */
  value?: boolean
  /** Value change callback */
  onChange?: (value: boolean) => void
  /** Operation mode */
  mode: 'standalone' | 'form'

  // Standalone mode props
  /** Confirmation message (standalone) */
  message?: string
  /** Default value */
  defaultValue?: boolean
  /** Whether this is a dangerous action (standalone) */
  danger?: boolean
  /** Confirm callback (standalone) */
  onConfirm?: (confirmed: boolean) => void

  // Form mode props
  /** Field label (form) */
  label?: string
  /** Field description (form) */
  description?: string
  /** Whether the field is focused (form) */
  isFocused?: boolean
  /** External error message */
  error?: string
}

export const ConfirmInput: React.FC<ConfirmInputProps> = ({
  value: externalValue,
  onChange,
  mode,
  // Standalone props
  message,
  defaultValue = false,
  danger = false,
  onConfirm,
  // Form props
  label,
  description,
  isFocused = true,
  error,
}) => {
  const { primaryColor, errorColor } = useTheme()
  const hints = useKeyBindingHints()

  // Internal state for standalone mode
  const [selected, setSelected] = useState<boolean>(() => {
    if (externalValue !== undefined) return externalValue
    return defaultValue
  })

  const currentValue = mode === 'form' && externalValue !== undefined ? externalValue : selected
  const isActive = mode === 'standalone' || isFocused

  // Update value
  const updateValue = (newValue: boolean) => {
    if (mode === 'standalone') {
      setSelected(newValue)
    }
    if (onChange) {
      onChange(newValue)
    }
  }

  const kb = useKeyBindings()

  useInput(
    (input, key) => {
      if (!isActive) return

      // Y/N shortcuts
      if (kb.confirm.yes(input, key)) {
        if (mode === 'standalone' && onConfirm) {
          onConfirm(true)
        } else {
          updateValue(true)
        }
        return
      }
      if (kb.confirm.no(input, key)) {
        if (mode === 'standalone' && onConfirm) {
          onConfirm(false)
        } else {
          updateValue(false)
        }
        return
      }

      // Left/Right arrows - cycle between Yes/No
      if (kb.input.prev(input, key) || kb.input.next(input, key)) {
        updateValue(!currentValue)
        return
      }

      // Space - toggle (form mode)
      if (kb.input.toggle(input, key) && mode === 'form') {
        updateValue(!currentValue)
        return
      }

      // Enter - confirm (standalone mode)
      if (kb.input.submit(input, key) && mode === 'standalone' && onConfirm) {
        onConfirm(currentValue)
        return
      }

      // Escape - cancel with false (standalone mode)
      if (kb.input.cancel(input, key) && mode === 'standalone' && onConfirm) {
        onConfirm(false)
        return
      }
    },
    { isActive },
  )

  // Render standalone layout (centered)
  if (mode === 'standalone') {
    return (
      <Box flexDirection="column" alignItems="center" paddingY={1}>
        {danger && (
          <Box marginBottom={1}>
            <Text color={errorColor}>{t('ui:prompts.warning')}</Text>
          </Box>
        )}

        <Box marginBottom={1}>
          <Text color={danger ? errorColor : undefined}>{message}</Text>
        </Box>

        <Box gap={2}>
          <Text color={!currentValue ? primaryColor : undefined} bold={!currentValue}>
            {!currentValue ? '●' : '○'} No
          </Text>
          <Text color={currentValue ? primaryColor : undefined} bold={currentValue}>
            {currentValue ? '●' : '○'} Yes
          </Text>
        </Box>

        <Box marginTop={1}>
          <Text dimColor>{hints.confirm()}</Text>
        </Box>
      </Box>
    )
  }

  // Render form layout (inline)
  const displayLabel = label || message

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={isActive ? primaryColor : 'white'}>{displayLabel}:</Text>
      </Box>

      <Box marginLeft={2} gap={2}>
        <Text color={currentValue ? primaryColor : undefined} bold={currentValue}>
          {currentValue ? '●' : '○'} Yes
        </Text>
        <Text color={!currentValue ? primaryColor : undefined} bold={!currentValue}>
          {!currentValue ? '●' : '○'} No
        </Text>
      </Box>

      {description && (
        <Box marginLeft={2}>
          <Text dimColor>{description}</Text>
        </Box>
      )}
      {error && (
        <Box marginLeft={2}>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  )
}
