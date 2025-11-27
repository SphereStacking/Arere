/**
 * GeneralSettingsSection - General settings list section
 *
 * Displays general settings (locale, logLevel, primaryColor) with override indicators.
 */

import { t } from '@/infrastructure/i18n/index'
import type { ConfigLayer } from '@/infrastructure/config/types'
import type { SelectOption } from '@/presentation/ui/components/inputs'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { OverrideIndicator } from './OverrideIndicator'
import type {
  SelectedItem,
  SettingKey,
} from '../hooks/useSettingsNavigation'
import { Box, Text } from 'ink'
import React from 'react'

export interface GeneralSettingsSectionProps {
  /** Current selected item */
  selectedItem: SelectedItem
  /** Current layer being viewed */
  currentLayer: ConfigLayer
  /** Keys that are overridden in workspace layer */
  overriddenKeys: string[]
  /** Formatted setting values */
  settingItems: SelectOption<SettingKey>[]
}

/**
 * General settings section component
 *
 * @example
 * ```tsx
 * <GeneralSettingsSection
 *   selectedItem={{ section: 'general', index: 0 }}
 *   currentLayer="workspace"
 *   overriddenKeys={['locale']}
 *   settingItems={[...]}
 * />
 * ```
 */
export const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = React.memo(
  ({ selectedItem, currentLayer, overriddenKeys, settingItems }) => {
    const { primaryColor, inactiveColor } = useTheme()

    return (
      <Box flexDirection="column">
        <Text bold>{t('ui:settings.sections.general')}</Text>
        <Box flexDirection="column" marginTop={1}>
          {settingItems.map((item, index) => {
            const isSelected = selectedItem.section === 'general' && selectedItem.index === index

            // Check if this key is overridden (only for User layer)
            const keyToCheck = item.value === 'primaryColor' ? 'theme.primaryColor' : item.value
            const isOverridden = currentLayer === 'user' && overriddenKeys.includes(keyToCheck)

            return (
              <Box key={item.value} marginLeft={2}>
                <Text color={isSelected ? primaryColor : inactiveColor}>
                  {isSelected ? '❯ ' : '  '}
                </Text>
                <Box width={20}>
                  <Text
                    bold={isSelected}
                    color={isSelected ? primaryColor : undefined}
                    dimColor={isOverridden}
                  >
                    {item.label}
                  </Text>
                </Box>
                <Text dimColor={isOverridden}>{item.description}</Text>
                <OverrideIndicator isOverridden={isOverridden} />
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  },
)
