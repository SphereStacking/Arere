/**
 * MultiSelectInput - Unified multi-select component
 *
 * Supports two modes:
 * - standalone: For prompt.multiSelect() - handles Enter/Escape
 * - form: For form fields - real-time onChange, isFocused control, min/max constraints
 *
 * Navigation: ↑↓ or ←→ to move between options
 * Toggle: Space to select/deselect
 * Shortcuts: 1-9 for direct toggle
 */

import type { SelectChoice } from '@/domain/action/types'
import { t } from '@/infrastructure/i18n/index'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text, useInput } from 'ink'
import React, { useMemo, useState } from 'react'

export interface MultiSelectOption<T = unknown> {
  label: string
  value: T
  description?: string
}

export interface MultiSelectInputProps<T = unknown> {
  /** Available options */
  options: (T | MultiSelectOption<T>)[]
  /** Currently selected values */
  value?: T[]
  /** Value change callback */
  onChange?: (values: T[]) => void
  /** Operation mode */
  mode: 'standalone' | 'form'

  // Standalone mode props
  /** Input label (standalone) */
  label?: string
  /** Initially selected values (standalone) */
  initialSelected?: T[]
  /** Submit callback (standalone) */
  onSubmit?: (values: T[]) => void
  /** Cancel callback (standalone) */
  onCancel?: () => void

  // Form mode props
  /** Field message (form) */
  message?: string
  /** Field description (form) */
  description?: string
  /** Whether the field is focused (form) */
  isFocused?: boolean
  /** Minimum selections (form) */
  min?: number
  /** Maximum selections (form) */
  max?: number
  /** External error message */
  error?: string
}

/**
 * Normalize options to MultiSelectOption format
 */
function normalizeOptions<T>(options: (T | MultiSelectOption<T>)[]): MultiSelectOption<T>[] {
  return options.map((option) => {
    if (typeof option === 'object' && option !== null && 'value' in option && 'label' in option) {
      return option as MultiSelectOption<T>
    }
    return { label: String(option), value: option as T }
  })
}

export const MultiSelectInput = <T,>({
  options: rawOptions,
  value: externalValue,
  onChange,
  mode,
  // Standalone props
  label,
  initialSelected = [],
  onSubmit,
  onCancel,
  // Form props
  message,
  description,
  isFocused = true,
  min,
  max,
  error,
}: MultiSelectInputProps<T>) => {
  const { primaryColor } = useTheme()
  const hints = useKeyBindingHints()

  const options = useMemo(() => normalizeOptions(rawOptions), [rawOptions])

  // Internal selection state (standalone mode)
  const [internalSelected, setInternalSelected] = useState<Set<T>>(() => new Set(initialSelected))

  // Highlighted index (for navigation)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const isActive = mode === 'standalone' || isFocused

  // Get current selected values
  const selectedValues =
    mode === 'form' && externalValue !== undefined ? externalValue : Array.from(internalSelected)

  const isSelected = (value: T) => selectedValues.some((v) => v === value)

  // Toggle selection
  const toggleSelection = (value: T) => {
    if (mode === 'standalone') {
      setInternalSelected((prev) => {
        const next = new Set(prev)
        if (next.has(value)) {
          next.delete(value)
        } else {
          next.add(value)
        }
        return next
      })
    } else {
      // Form mode with min/max constraints
      const currentlySelected = isSelected(value)

      if (currentlySelected) {
        // Check min constraint
        if (min !== undefined && selectedValues.length <= min) {
          return
        }
        onChange?.(selectedValues.filter((v) => v !== value))
      } else {
        // Check max constraint
        if (max !== undefined && selectedValues.length >= max) {
          return
        }
        onChange?.([...selectedValues, value])
      }
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

      // Submit: Enter (standalone only)
      if (kb.input.submit(input, key) && mode === 'standalone' && onSubmit) {
        onSubmit(Array.from(internalSelected))
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

      // Toggle: Space
      if (kb.input.toggle(input, key)) {
        toggleSelection(options[highlightedIndex].value)
        return
      }

      // Number key toggle (1-9)
      const num = Number.parseInt(input)
      if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
        setHighlightedIndex(num - 1)
        toggleSelection(options[num - 1].value)
      }
    },
    { isActive },
  )

  const displayLabel = label || message
  const selectedCount = selectedValues.length

  return (
    <Box flexDirection="column">
      {displayLabel && (
        <Box marginBottom={mode === 'standalone' ? 1 : 0}>
          <Text color={isActive ? primaryColor : 'white'}>
            {displayLabel}
            {mode === 'form' ? ':' : ''}
          </Text>
          <Text dimColor>
            {mode === 'standalone'
              ? ` ${t('ui:prompts.selected_count', { count: selectedCount })}`
              : ` (${selectedCount} selected)`}
          </Text>
        </Box>
      )}

      <Box flexDirection="column" marginLeft={mode === 'form' ? 2 : 0}>
        {options.map((option, index) => {
          const selected = isSelected(option.value)
          const isHighlighted = isActive && index === highlightedIndex

          return (
            <Box key={index}>
              <Text color={isHighlighted || selected ? primaryColor : undefined} bold={selected}>
                {mode === 'standalone' && (isHighlighted ? '> ' : '  ')}[{selected ? 'x' : ' '}]{' '}
                {option.label}
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

      {mode === 'standalone' && (
        <Box marginTop={1}>
          <Text dimColor>{hints.multiSelect()}</Text>
        </Box>
      )}
    </Box>
  )
}
