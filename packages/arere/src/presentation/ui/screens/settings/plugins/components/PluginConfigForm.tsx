/**
 * PluginConfigForm - Plugin configuration form list
 *
 * Displays list of configuration fields with focus navigation.
 */

import type { LoadedPlugin } from '@/domain/plugin/types'
import { t } from '@/infrastructure/i18n/index'
import { translationManager } from '@/infrastructure/i18n/manager'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import type { FormField } from '@/presentation/ui/utils/schema-to-fields'
import { Box, Text } from 'ink'
import React from 'react'

export interface PluginConfigFormProps {
  plugin: LoadedPlugin
  fields: FormField[]
  values: Record<string, unknown>
  focusedFieldIndex: number
}

/**
 * Get translated description or fallback to schema description
 */
function getDescription(plugin: LoadedPlugin, field: FormField): string {
  if (!plugin.i18nNamespace) {
    return field.description || ''
  }

  const translationKey = `config.${field.name}.description`
  const fullKey = `${plugin.i18nNamespace}:${translationKey}`
  const translated = translationManager.t(fullKey)

  // If translation found (not returning the key itself), use it
  if (translated !== fullKey) {
    return translated
  }
  return field.description || ''
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
 *   plugin={plugin}
 *   fields={fields}
 *   values={values}
 *   focusedFieldIndex={0}
 * />
 * ```
 */
export const PluginConfigForm: React.FC<PluginConfigFormProps> = React.memo(
  ({ plugin, fields, values, focusedFieldIndex }) => {
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
          const description = getDescription(plugin, field)

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
