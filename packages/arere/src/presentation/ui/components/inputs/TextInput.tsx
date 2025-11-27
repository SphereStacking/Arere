/**
 * TextInput - Unified text input component
 *
 * Supports two modes:
 * - standalone: For prompt.text() - handles Enter/Escape, format transformation
 * - form: For form fields - real-time onChange, isFocused control
 */

import { t } from '@/infrastructure/i18n/index'
import { applyFormat } from '@/infrastructure/prompt/formatters'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text, useInput } from 'ink'
import React, { useEffect, useState } from 'react'

export interface TextInputProps {
  /** Current value */
  value?: string
  /** Value change callback */
  onChange?: (value: string) => void
  /** Operation mode */
  mode: 'standalone' | 'form'

  // Standalone mode props
  /** Input label (standalone) */
  label?: string
  /** Initial value (standalone) */
  initialValue?: string
  /** Validation function (standalone) */
  validate?: (value: string) => string | undefined
  /** Submit callback (standalone) */
  onSubmit?: (value: string) => void
  /** Cancel callback (standalone) */
  onCancel?: () => void
  /** Format transformation (standalone only) */
  format?: 'lowercase' | 'uppercase' | 'trim' | 'kebab-case' | ((value: string) => string)

  // Common props
  /** Placeholder text */
  placeholder?: string
  /** Prefix text (read-only) */
  prefix?: string
  /** Suffix text (read-only) */
  suffix?: string
  /** Maximum length */
  maxLength?: number
  /** Minimum length */
  minLength?: number
  /** Input pattern restriction */
  pattern?: RegExp

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

export const TextInput: React.FC<TextInputProps> = ({
  value: externalValue,
  onChange,
  mode,
  // Standalone props
  label,
  initialValue = '',
  validate,
  onSubmit,
  onCancel,
  format,
  // Common props
  placeholder,
  prefix = '',
  suffix = '',
  maxLength,
  minLength,
  pattern,
  // Form props
  message,
  description,
  isFocused = true,
  error: externalError,
}) => {
  const { primaryColor, errorColor } = useTheme()
  const hints = useKeyBindingHints()

  // Internal state
  const [inputValue, setInputValue] = useState(() => {
    if (externalValue !== undefined) return externalValue
    return initialValue
  })
  const [cursorPosition, setCursorPosition] = useState(inputValue.length)
  const [error, setError] = useState<string | undefined>()

  // Sync with external value (form mode)
  useEffect(() => {
    if (mode === 'form' && externalValue !== undefined && externalValue !== inputValue) {
      setInputValue(externalValue)
      setCursorPosition(externalValue.length)
    }
  }, [mode, externalValue, inputValue])

  // Keep cursor within bounds
  useEffect(() => {
    if (cursorPosition > inputValue.length) {
      setCursorPosition(inputValue.length)
    }
  }, [inputValue, cursorPosition])

  const isActive = mode === 'standalone' || isFocused

  // Get full value with prefix/suffix
  const getFullValue = (val: string = inputValue): string => {
    return prefix + val + suffix
  }

  // Update value and notify parent
  const updateValue = (newValue: string, newCursorPos: number) => {
    setInputValue(newValue)
    setCursorPosition(newCursorPos)
    setError(undefined)

    if (mode === 'form' && onChange) {
      onChange(newValue)
    }
  }

  // Validate and submit (standalone mode)
  const handleSubmit = () => {
    if (mode !== 'standalone' || !onSubmit) return

    let finalValue = inputValue

    // Apply format transformation
    if (format) {
      finalValue = applyFormat(inputValue, format)
    }

    // Get full value with prefix/suffix
    const fullValue = getFullValue(finalValue)

    // Check minimum length
    if (minLength !== undefined && fullValue.length < minLength) {
      setError(t('ui:prompts.errors.text_minlength', { minLength }))
      return
    }

    // Custom validation
    if (validate) {
      const validationError = validate(fullValue)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setError(undefined)
    onSubmit(fullValue)
  }

  const kb = useKeyBindings()

  useInput(
    (input, key) => {
      if (!isActive) return

      // Submit on Enter
      if (kb.input.submit(input, key)) {
        if (mode === 'standalone') {
          handleSubmit()
        } else if (onSubmit) {
          // form mode: simple submit without validation/format
          onSubmit(inputValue)
        }
        return
      }

      // Cancel on Escape (standalone only)
      if (kb.input.cancel(input, key) && mode === 'standalone' && onCancel) {
        onCancel()
        return
      }

      // Cursor movement
      if (kb.input.prev(input, key)) {
        setCursorPosition((prev) => Math.max(0, prev - 1))
        return
      }
      if (kb.input.next(input, key)) {
        setCursorPosition((prev) => Math.min(inputValue.length, prev + 1))
        return
      }

      // Backspace/Delete
      if (kb.input.delete(input, key)) {
        if (cursorPosition > 0) {
          const newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition)
          updateValue(newValue, cursorPosition - 1)
        }
        return
      }

      // Character input
      if (input && !key.ctrl && !key.meta) {
        // Filter non-printable characters
        const sanitizedInput = input.replace(/[\x00-\x1F\x7F]/g, '')
        if (!sanitizedInput) return

        // Check pattern
        if (pattern && !pattern.test(sanitizedInput)) {
          return
        }

        // Check max length
        const newValue = inputValue.slice(0, cursorPosition) + sanitizedInput + inputValue.slice(cursorPosition)
        const fullNewValue = getFullValue(newValue)
        if (maxLength !== undefined && fullNewValue.length > maxLength) {
          return
        }

        updateValue(newValue, cursorPosition + sanitizedInput.length)
      }
    },
    { isActive },
  )

  // Render value with cursor
  const renderValue = () => {
    const showPlaceholder = inputValue.length === 0 && placeholder

    if (showPlaceholder && !isActive) {
      return (
        <Text>
          {prefix && <Text dimColor>{prefix}</Text>}
          <Text dimColor>{placeholder}</Text>
          {suffix && <Text dimColor>{suffix}</Text>}
        </Text>
      )
    }

    const beforeCursor = inputValue.slice(0, cursorPosition)
    const atCursor = inputValue[cursorPosition] || ' '
    const afterCursor = inputValue.slice(cursorPosition + 1)

    return (
      <Text>
        {prefix && <Text dimColor>{prefix}</Text>}
        {showPlaceholder ? (
          <Text dimColor>{placeholder}</Text>
        ) : (
          <>
            {beforeCursor}
            <Text inverse>{atCursor}</Text>
            {afterCursor}
          </>
        )}
        {suffix && <Text dimColor>{suffix}</Text>}
      </Text>
    )
  }

  const displayError = error || externalError
  const displayLabel = label || message

  return (
    <Box flexDirection="column">
      <Box>
        {displayLabel && <Text color={isActive ? primaryColor : 'white'}>{displayLabel}: </Text>}
        {renderValue()}
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
          <Text dimColor>{hints.textInput()}</Text>
        </Box>
      )}
    </Box>
  )
}
