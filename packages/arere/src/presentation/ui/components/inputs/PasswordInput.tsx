/**
 * PasswordInput - Unified password input component with masking
 *
 * Supports two modes:
 * - standalone: For prompt.password() - handles Enter/Escape, cursor movement
 * - form: For form fields - real-time onChange, isFocused control
 */

import { t } from '@/infrastructure/i18n/index'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text, useInput } from 'ink'
import React, { useEffect, useState } from 'react'

export interface PasswordInputProps {
  /** Current value */
  value?: string
  /** Value change callback */
  onChange?: (value: string) => void
  /** Operation mode */
  mode: 'standalone' | 'form'

  // Standalone mode props
  /** Input label (standalone) */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Minimum length (standalone) */
  minLength?: number
  /** Validation function (standalone) */
  validate?: (value: string) => string | undefined
  /** Submit callback (standalone) */
  onSubmit?: (value: string) => void
  /** Cancel callback (standalone) */
  onCancel?: () => void

  // Form mode props
  /** Field message (form) */
  message?: string
  /** Field description (form) */
  description?: string
  /** Whether the field is focused (form) */
  isFocused?: boolean
  /** External error message */
  error?: string
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value: externalValue,
  onChange,
  mode,
  // Standalone props
  label,
  placeholder,
  minLength,
  validate,
  onSubmit,
  onCancel,
  // Form props
  message,
  description,
  isFocused = true,
  error: externalError,
}) => {
  const { primaryColor, errorColor } = useTheme()
  const hints = useKeyBindingHints()

  // Internal state
  const [inputValue, setInputValue] = useState(externalValue || '')
  const [cursorPosition, setCursorPosition] = useState(inputValue.length)
  const [error, setError] = useState<string | undefined>()

  // Sync with external value (form mode)
  useEffect(() => {
    if (mode === 'form' && externalValue !== undefined && externalValue !== inputValue) {
      setInputValue(externalValue)
    }
  }, [mode, externalValue, inputValue])

  // Keep cursor within bounds
  useEffect(() => {
    if (cursorPosition > inputValue.length) {
      setCursorPosition(inputValue.length)
    }
  }, [inputValue, cursorPosition])

  const isActive = mode === 'standalone' || isFocused

  // Update value and notify parent
  const updateValue = (newValue: string) => {
    setInputValue(newValue)
    setError(undefined)

    if (mode === 'form' && onChange) {
      onChange(newValue)
    }
  }

  // Validate and submit (standalone mode)
  const handleSubmit = () => {
    if (mode !== 'standalone' || !onSubmit) return

    if (minLength !== undefined && inputValue.length < minLength) {
      setError(t('ui:prompts.errors.password_minlength', { minLength }))
      return
    }

    if (validate) {
      const validationError = validate(inputValue)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setError(undefined)
    onSubmit(inputValue)
  }

  const kb = useKeyBindings()

  useInput(
    (input, key) => {
      if (!isActive) return

      // Submit on Enter (standalone only)
      if (kb.input.submit(input, key) && mode === 'standalone') {
        handleSubmit()
        return
      }

      // Cancel on Escape (standalone only)
      if (kb.input.cancel(input, key) && mode === 'standalone' && onCancel) {
        onCancel()
        return
      }

      // Cursor movement (standalone only)
      if (mode === 'standalone') {
        if (kb.input.prev(input, key)) {
          setCursorPosition((prev) => Math.max(0, prev - 1))
          return
        }
        if (kb.input.next(input, key)) {
          setCursorPosition((prev) => Math.min(inputValue.length, prev + 1))
          return
        }
      }

      // Backspace/Delete
      if (kb.input.delete(input, key)) {
        if (mode === 'standalone' && cursorPosition > 0) {
          const newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition)
          updateValue(newValue)
          setCursorPosition(cursorPosition - 1)
        } else if (mode === 'form') {
          updateValue(inputValue.slice(0, -1))
        }
        return
      }

      // Character input
      if (input && !key.ctrl && !key.meta) {
        // Filter non-printable characters
        const sanitizedInput = input.replace(/[\x00-\x1F\x7F]/g, '')
        if (!sanitizedInput) return

        if (mode === 'standalone') {
          const newValue = inputValue.slice(0, cursorPosition) + sanitizedInput + inputValue.slice(cursorPosition)
          updateValue(newValue)
          setCursorPosition(cursorPosition + sanitizedInput.length)
        } else {
          updateValue(inputValue + sanitizedInput)
        }
      }
    },
    { isActive },
  )

  // Render with cursor (standalone mode)
  const renderWithCursor = () => {
    if (inputValue.length === 0 && placeholder) {
      return <Text dimColor>{placeholder}</Text>
    }

    const maskedValue = '*'.repeat(inputValue.length)
    const beforeCursor = maskedValue.slice(0, cursorPosition)
    const atCursor = maskedValue[cursorPosition] || ' '
    const afterCursor = maskedValue.slice(cursorPosition + 1)

    return (
      <Text>
        {beforeCursor}
        <Text inverse>{atCursor}</Text>
        {afterCursor}
      </Text>
    )
  }

  // Render simple value (form mode)
  const renderSimple = () => {
    const maskedValue = '*'.repeat(inputValue.length)
    return (
      <Text color={isFocused ? primaryColor : undefined}>
        {maskedValue || placeholder || ''}
      </Text>
    )
  }

  const displayError = error || externalError
  const displayLabel = label || message

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={isActive ? primaryColor : 'white'}>{displayLabel}: </Text>
        {mode === 'standalone' ? renderWithCursor() : renderSimple()}
      </Box>

      {description && (
        <Box marginLeft={2}>
          <Text dimColor>{description}</Text>
        </Box>
      )}

      {displayError && (
        <Box marginTop={mode === 'standalone' ? 1 : 0} marginLeft={mode === 'form' ? 2 : 0}>
          <Text color={errorColor || 'red'}>
            {mode === 'standalone' ? '❌ ' : ''}{displayError}
          </Text>
        </Box>
      )}

      {mode === 'standalone' && (
        <Box marginTop={1}>
          <Text dimColor>{hints.passwordInput(minLength)}</Text>
        </Box>
      )}
    </Box>
  )
}
