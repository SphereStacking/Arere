/**
 * SelectInput - Unified single select component
 *
 * Supports two modes:
 * - standalone: For prompt.select() - handles Enter/Escape
 * - form: For form fields - real-time onChange, isFocused control
 *
 * Navigation: ↑↓ or ←→ to move between options
 * Selection: Enter (standalone), Space/Enter (form)
 * Shortcuts: 1-9 for direct selection
 */

import type { SelectChoice } from '@/domain/action/types'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text, useInput } from 'ink'
import React, { useMemo, useState } from 'react'

export interface SelectOption<T = unknown> {
  label: string
  value: T
  description?: string
}

export interface SelectInputProps<T = unknown> {
  /** Available options */
  options: (T | SelectOption<T>)[]
  /** Current value */
  value?: T
  /** Value change callback */
  onChange?: (value: T) => void
  /** Operation mode */
  mode: 'standalone' | 'form'

  // Standalone mode props
  /** Input label (standalone) */
  label?: string
  /** Initial selected index (standalone) */
  initialIndex?: number
  /** Select callback (standalone) */
  onSelect?: (value: T) => void
  /** Cancel callback (standalone) */
  onCancel?: () => void
  /** Reset callback (standalone) */
  onReset?: () => void

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

/**
 * Normalize options to SelectOption format
 */
function normalizeOptions<T>(options: (T | SelectOption<T>)[]): SelectOption<T>[] {
  return options.map((option) => {
    if (typeof option === 'object' && option !== null && 'value' in option && 'label' in option) {
      return option as SelectOption<T>
    }
    return { label: String(option), value: option as T }
  })
}

export const SelectInput = <T,>({
  options: rawOptions,
  value: externalValue,
  onChange,
  mode,
  // Standalone props
  label,
  initialIndex = 0,
  onSelect,
  onCancel,
  onReset,
  // Form props
  message,
  description,
  isFocused = true,
  error,
}: SelectInputProps<T>) => {
  const { primaryColor } = useTheme()

  const options = useMemo(() => normalizeOptions(rawOptions), [rawOptions])

  // Find index of current value
  const valueIndex = options.findIndex((opt) => opt.value === externalValue)

  // Highlighted index (for navigation)
  const [highlightedIndex, setHighlightedIndex] = useState(() => {
    if (valueIndex >= 0) return valueIndex
    return initialIndex
  })

  const isActive = mode === 'standalone' || isFocused

  // Update selection
  const selectOption = (index: number) => {
    if (index < 0 || index >= options.length) return

    const selectedValue = options[index].value

    if (mode === 'standalone' && onSelect) {
      onSelect(selectedValue)
    } else if (onChange) {
      onChange(selectedValue)
    }
  }

  const kb = useKeyBindings()

  useInput(
    (input, key) => {
      if (!isActive) return

      // Cancel: Escape (standalone only)
      if (kb.input.cancel(input, key) && mode === 'standalone' && onCancel) {
        onCancel()
        return
      }

      // Reset: Delete (standalone only)
      if (kb.input.delete(input, key) && mode === 'standalone' && onReset) {
        onReset()
        return
      }

      // Navigation: up or left (with wrap-around)
      if (kb.list.up(input, key) || kb.input.prev(input, key)) {
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length)
        return
      }

      // Navigation: down or right (with wrap-around)
      if (kb.list.down(input, key) || kb.input.next(input, key)) {
        setHighlightedIndex((prev) => (prev + 1) % options.length)
        return
      }

      // Select: Enter
      if (kb.input.submit(input, key)) {
        selectOption(highlightedIndex)
        return
      }

      // Select: Space (form mode)
      if (kb.input.toggle(input, key) && mode === 'form') {
        selectOption(highlightedIndex)
        return
      }

      // Number key selection (1-9)
      const num = Number.parseInt(input)
      if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
        setHighlightedIndex(num - 1)
        selectOption(num - 1)
      }
    },
    { isActive },
  )

  const displayLabel = label || message
  const selectedIndex = valueIndex >= 0 ? valueIndex : mode === 'standalone' ? highlightedIndex : -1

  return (
    <Box flexDirection="column">
      {displayLabel && (
        <Box marginBottom={mode === 'standalone' ? 1 : 0}>
          <Text color={isActive ? primaryColor : 'white'}>
            {displayLabel}
            {mode === 'form' ? ':' : ''}
          </Text>
        </Box>
      )}

      <Box flexDirection="column" marginLeft={mode === 'form' ? 2 : 0}>
        {options.map((option, index) => {
          const isSelected = index === selectedIndex
          const isHighlighted = isActive && index === highlightedIndex

          return (
            <Box key={index}>
              <Text
                color={isHighlighted || isSelected ? primaryColor : undefined}
                bold={isSelected}
              >
                {isSelected ? '●' : '○'} {option.label}
              </Text>
              {option.description && <Text dimColor> - {option.description}</Text>}
            </Box>
          )
        })}
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
