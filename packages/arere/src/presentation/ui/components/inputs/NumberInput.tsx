/**
 * NumberInput - Unified number input component
 *
 * Supports two modes:
 * - standalone: For prompt.number() - handles Enter/Escape, cursor movement
 * - form: For form fields - real-time onChange, isFocused control
 */

import { t } from '@/infrastructure/i18n/index'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useEffect, useState } from 'react'

export interface NumberInputProps {
  /** Current value (number or string for editing) */
  value?: number | string
  /** Value change callback */
  onChange?: (value: number) => void
  /** Operation mode */
  mode: 'standalone' | 'form'
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number

  // Standalone mode props
  /** Input label (standalone) */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Initial value (standalone) */
  initialValue?: number
  /** Validation function (standalone) */
  validate?: (value: number) => string | undefined
  /** Submit callback (standalone) */
  onSubmit?: (value: number) => void
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

export const NumberInput: React.FC<NumberInputProps> = ({
  value: externalValue,
  onChange,
  mode,
  min,
  max,
  // Standalone props
  label,
  placeholder,
  initialValue,
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
  const [inputText, setInputText] = useState(() => {
    if (externalValue !== undefined) return String(externalValue)
    if (initialValue !== undefined) return initialValue.toString()
    return ''
  })
  const [cursorPosition, setCursorPosition] = useState(inputText.length)
  const [error, setError] = useState<string | undefined>()

  // Sync with external value (form mode)
  useEffect(() => {
    if (mode === 'form' && externalValue !== undefined && String(externalValue) !== inputText) {
      setInputText(String(externalValue))
    }
  }, [mode, externalValue, inputText])

  // Keep cursor within bounds
  useEffect(() => {
    if (cursorPosition > inputText.length) {
      setCursorPosition(inputText.length)
    }
  }, [inputText, cursorPosition])

  const isActive = mode === 'standalone' || isFocused

  // Update value and notify parent
  const updateValue = (newText: string) => {
    setInputText(newText)
    setError(undefined)

    if (mode === 'form' && onChange) {
      const parsed = Number.parseFloat(newText) || 0
      onChange(parsed)
    }
  }

  // Validate and submit (standalone mode)
  const handleSubmit = () => {
    if (mode !== 'standalone' || !onSubmit) return

    const numValue = Number.parseFloat(inputText)
    if (Number.isNaN(numValue)) {
      setError(t('ui:prompts.errors.number_invalid'))
      return
    }

    if (min !== undefined && numValue < min) {
      setError(t('ui:prompts.errors.number_min', { min }))
      return
    }
    if (max !== undefined && numValue > max) {
      setError(t('ui:prompts.errors.number_max', { max }))
      return
    }

    if (validate) {
      const validationError = validate(numValue)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setError(undefined)
    onSubmit(numValue)
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

      // Cursor movement (standalone only - form uses arrows for field navigation)
      if (mode === 'standalone') {
        if (kb.input.prev(input, key)) {
          setCursorPosition((prev) => Math.max(0, prev - 1))
          return
        }
        if (kb.input.next(input, key)) {
          setCursorPosition((prev) => Math.min(inputText.length, prev + 1))
          return
        }
      }

      // Backspace/Delete
      if (kb.input.delete(input, key)) {
        if (mode === 'standalone' && cursorPosition > 0) {
          const newText = inputText.slice(0, cursorPosition - 1) + inputText.slice(cursorPosition)
          updateValue(newText)
          setCursorPosition(cursorPosition - 1)
        } else if (mode === 'form') {
          const newText = inputText.slice(0, -1)
          updateValue(newText)
        }
        return
      }

      // Number input
      if (input && !key.ctrl && !key.meta && /^[0-9.-]$/.test(input)) {
        // Prevent invalid input
        if (input === '.' && inputText.includes('.')) return
        if (input === '-' && inputText.length > 0 && mode === 'form') return
        if (input === '-' && cursorPosition !== 0 && mode === 'standalone') return

        // Form mode: check bounds before accepting
        if (mode === 'form') {
          const newText = inputText + input
          const parsed = Number.parseFloat(newText)
          if (!Number.isNaN(parsed)) {
            if (min !== undefined && parsed < min) return
            if (max !== undefined && parsed > max) return
          }
          updateValue(newText)
        } else {
          // Standalone mode: insert at cursor
          const newText =
            inputText.slice(0, cursorPosition) + input + inputText.slice(cursorPosition)
          updateValue(newText)
          setCursorPosition(cursorPosition + 1)
        }
      }
    },
    { isActive },
  )

  // Render cursor (standalone mode)
  const renderWithCursor = () => {
    if (inputText.length === 0 && placeholder) {
      return <Text dimColor>{placeholder}</Text>
    }

    const beforeCursor = inputText.slice(0, cursorPosition)
    const atCursor = inputText[cursorPosition] || ' '
    const afterCursor = inputText.slice(cursorPosition + 1)

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
    return (
      <Text color={isFocused ? primaryColor : undefined}>{inputText || placeholder || '0'}</Text>
    )
  }

  const displayError = error || externalError
  const displayLabel = label || message

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={isActive ? primaryColor : 'white'}>{displayLabel}: </Text>
        {mode === 'standalone' ? renderWithCursor() : renderSimple()}
        {(min !== undefined || max !== undefined) && (
          <Text dimColor>
            {' '}
            ({min ?? '-∞'} - {max ?? '∞'})
          </Text>
        )}
      </Box>

      {description && (
        <Box marginLeft={2}>
          <Text dimColor>{description}</Text>
        </Box>
      )}

      {displayError && (
        <Box marginTop={mode === 'standalone' ? 1 : 0} marginLeft={mode === 'form' ? 2 : 0}>
          <Text color={errorColor || 'red'}>
            {mode === 'standalone' ? '❌ ' : ''}
            {displayError}
          </Text>
        </Box>
      )}

      {mode === 'standalone' && (
        <Box marginTop={1}>
          <Text dimColor>{hints.numberInput(min, max)}</Text>
        </Box>
      )}
    </Box>
  )
}
