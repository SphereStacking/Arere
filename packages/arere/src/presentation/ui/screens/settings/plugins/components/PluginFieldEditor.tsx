/**
 * PluginFieldEditor - Field editing screen
 *
 * Displays text input or select input for editing a field value.
 */

import type { LoadedPlugin } from '@/domain/plugin/types'
import { t } from '@/infrastructure/i18n/index'
import { translationManager } from '@/infrastructure/i18n/manager'
import { SelectInput, type SelectOption, TextInput } from '@/presentation/ui/components/inputs'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import type { FormField } from '@/presentation/ui/utils/schema-to-fields'
import { Box, Text } from 'ink'
import React from 'react'

export interface PluginFieldEditorProps {
  plugin: LoadedPlugin
  field: FormField
  type: 'text' | 'select'
  currentValue: unknown
  onTextSubmit: (value: string) => void
  onTextCancel: () => void
  onSelectSubmit: (value: unknown) => void
  onSelectCancel: () => void
}

/**
 * Get translated description or fallback to schema description
 */
function getDescription(plugin: LoadedPlugin, field: FormField): string {
  if (!plugin.i18nNamespace) {
    return field.description || ''
  }

  const translationKey = `config.${field.name}.description`
  const translated = translationManager.t(translationKey, { ns: plugin.i18nNamespace })

  if (translated !== translationKey) {
    return translated
  }
  return field.description || translationKey
}

/**
 * Plugin field editor component
 *
 * @example
 * ```tsx
 * <PluginFieldEditor
 *   plugin={plugin}
 *   field={field}
 *   type="text"
 *   currentValue="value"
 *   onTextSubmit={(value) => console.log(value)}
 *   onTextCancel={() => console.log('cancelled')}
 *   onSelectSubmit={(value) => console.log(value)}
 *   onSelectCancel={() => console.log('cancelled')}
 * />
 * ```
 */
export const PluginFieldEditor: React.FC<PluginFieldEditorProps> = React.memo(
  ({
    plugin,
    field,
    type,
    currentValue,
    onTextSubmit,
    onTextCancel,
    onSelectSubmit,
    onSelectCancel,
  }) => {
    const description = getDescription(plugin, field)
    const { primaryColor } = useTheme()

    if (type === 'text') {
      const initialValue = String(currentValue ?? field.defaultValue ?? '')
      const label = t('ui:plugins.detail.edit_field', { field: field.name })

      return (
        <Box flexDirection="column" flexGrow={1} padding={1}>
          {/* Plugin info */}
          <Box marginBottom={1}>
            <Text bold color={primaryColor}>
              {plugin.meta.name}
            </Text>
            <Text dimColor> v{plugin.meta.version}</Text>
          </Box>

          {/* Field label and description */}
          <Box marginBottom={1} flexDirection="column">
            <Text>{label}</Text>
            {description && <Text dimColor>{description}</Text>}
          </Box>

          <Box marginBottom={1}>
            <Text dimColor>{t('ui:plugins.detail.current_value')}</Text>
            <Text>{initialValue}</Text>
          </Box>
          <TextInput
            mode="standalone"
            label={t('ui:plugins.detail.new_value')}
            initialValue={initialValue}
            onSubmit={onTextSubmit}
            onCancel={onTextCancel}
          />
        </Box>
      )
    }

    if (type === 'select') {
      const label = t('ui:plugins.detail.select_field', { field: field.name })
      let options: SelectOption<unknown>[]

      if (field.type === 'boolean') {
        options = [
          { label: 'true', value: true as unknown },
          { label: 'false', value: false as unknown },
        ]
      } else if (field.choices) {
        options = field.choices.map((choice: any) => ({
          label: String(choice.value),
          value: choice.value as unknown,
        }))
      } else {
        return null
      }

      return (
        <Box flexDirection="column" flexGrow={1} padding={1}>
          {/* Plugin info */}
          <Box marginBottom={1}>
            <Text bold color={primaryColor}>
              {plugin.meta.name}
            </Text>
            <Text dimColor> v{plugin.meta.version}</Text>
          </Box>

          {/* Field label and description */}
          <Box marginBottom={1} flexDirection="column">
            <Text>{label}</Text>
            {description && <Text dimColor>{description}</Text>}
          </Box>

          <SelectInput
            mode="standalone"
            options={options}
            label=""
            onSelect={onSelectSubmit}
            onCancel={onSelectCancel}
          />
        </Box>
      )
    }

    return null
  },
)
