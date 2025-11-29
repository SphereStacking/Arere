/**
 * PluginConfigForm - Plugin configuration form list
 *
 * Displays list of configuration fields with focus navigation.
 * Uses field.description directly from Zod schema.
 */

import { t } from '@/infrastructure/i18n'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import type { FormField } from '@/presentation/ui/utils/schema-to-fields'
import { Box, Text } from 'ink'
import React from 'react'

export interface PluginConfigFormProps {
  fields: FormField[]
  values: Record<string, unknown>
  focusedFieldIndex: number
}

/**
 * Format value for display
 */
function formatValue(field: FormField, value: unknown): string {
  const displayValue = value !== undefined ? value : field.defaultValue
  if (displayValue === undefined || displayValue === null) return ''
  if (field.type === 'boolean') {
    return String(displayValue)
  }
  return String(displayValue)
}

/**
 * Plugin config form component
 *
 * @example
 * ```tsx
 * <PluginConfigForm
 *   fields={fields}
 *   values={values}
 *   focusedFieldIndex={0}
 * />
 * ```
 */
export const PluginConfigForm: React.FC<PluginConfigFormProps> = React.memo(
  ({ fields, values, focusedFieldIndex }) => {
    const { primaryColor, successColor } = useTheme()

    // Calculate column widths
    const maxNameWidth = Math.max(...fields.map((f) => f.name.length), 0)
    const maxValueWidth = Math.min(
      Math.max(...fields.map((f) => formatValue(f, values[f.name]).length), 0),
      20,
    )

    return (
      <Box flexDirection="column" marginBottom={1}>
        {fields.map((field, index) => {
          const isFocused = focusedFieldIndex === index
          const value = formatValue(field, values[field.name])
          // Use field.description directly from Zod schema
          const description = field.description || ''

          const namePadded = field.name.padEnd(maxNameWidth + 2)
          const valuePadded = value.padEnd(maxValueWidth + 2)

          return (
            <Box key={field.name}>
              <Text color={isFocused ? primaryColor : undefined} bold={isFocused}>
                {isFocused ? '❯ ' : '  '}
                {namePadded}
                {valuePadded}
                <Text dimColor>{description}</Text>
              </Text>
            </Box>
          )
        })}
        {/* Save button */}
        <Box marginTop={1}>
          <Text
            bold={focusedFieldIndex === fields.length}
            color={focusedFieldIndex === fields.length ? primaryColor : successColor}
          >
            {focusedFieldIndex === fields.length ? '❯ ' : '  '}[{t('ui:plugins.detail.save')}]
          </Text>
        </Box>
      </Box>
    )
  },
)
