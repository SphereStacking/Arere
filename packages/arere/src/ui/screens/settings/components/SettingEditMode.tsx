/**
 * SettingEditMode - Edit mode for a single setting
 *
 * Displays a SelectInput for choosing the value of a specific setting.
 */

import { t } from '@/i18n/index'
import { SelectInput, type SelectOption } from '@/ui/components/inputs'
import { Box } from 'ink'
import React from 'react'
import type { SettingKey } from '../hooks/useSettingsNavigation'

export interface SettingEditModeProps {
  editingKey: SettingKey
  onSelect: (value: string) => void
  onCancel: () => void
  onReset?: () => void
}

/**
 * Get choice options for each setting key
 */
function getChoicesForKey(key: SettingKey): SelectOption<string>[] {
  switch (key) {
    case 'locale':
      return [
        { label: 'en', value: 'en' },
        { label: 'ja', value: 'ja' },
      ]
    case 'logLevel':
      return [
        { label: 'debug', value: 'debug' },
        { label: 'info', value: 'info' },
        { label: 'warn', value: 'warn' },
        { label: 'error', value: 'error' },
      ]
    case 'primaryColor':
      return [
        { label: 'cyan', value: 'cyan' },
        { label: 'blue', value: 'blue' },
        { label: 'green', value: 'green' },
        { label: 'magenta', value: 'magenta' },
        { label: 'yellow', value: 'yellow' },
        { label: 'red', value: 'red' },
      ]
  }
}

/**
 * Setting edit mode component
 *
 * @example
 * ```tsx
 * <SettingEditMode
 *   editingKey="locale"
 *   onSelect={(value) => console.log(value)}
 *   onCancel={() => console.log('cancelled')}
 * />
 * ```
 */
export const SettingEditMode: React.FC<SettingEditModeProps> = React.memo(
  ({ editingKey, onSelect, onCancel, onReset }) => {
    return (
      <Box marginTop={1}>
        <SelectInput
          mode="standalone"
          label={t(`ui:settings.options.${editingKey}`)}
          options={getChoicesForKey(editingKey)}
          onSelect={onSelect}
          onCancel={onCancel}
          onReset={onReset}
        />
      </Box>
    )
  },
)
