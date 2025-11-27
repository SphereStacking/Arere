/**
 * PluginSettingsSection - Plugin list section
 *
 * Displays list of plugins with enable/disable toggle.
 */

import type { LoadedPlugin } from '@/domain/plugin/types'
import { t } from '@/infrastructure/i18n/index'
import type { SelectedItem } from '../hooks/useSettingsNavigation'
import { Box, Text } from 'ink'
import React from 'react'
import { PluginRow } from './PluginRow'

export interface PluginSettingsSectionProps {
  /** List of plugins */
  plugins: LoadedPlugin[]
  /** Current selected item */
  selectedItem: SelectedItem
}

/**
 * Plugin settings section component
 *
 * @example
 * ```tsx
 * <PluginSettingsSection
 *   plugins={[...]}
 *   selectedItem={{ section: 'plugins', index: 0 }}
 * />
 * ```
 */
export const PluginSettingsSection: React.FC<PluginSettingsSectionProps> = React.memo(
  ({ plugins, selectedItem }) => {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Text bold>{t('ui:settings.sections.plugins')}</Text>
        <Box flexDirection="column" marginTop={1}>
          {plugins.length === 0 ? (
            <Box marginLeft={2}>
              <Text dimColor>{t('ui:plugins.no_plugins')}</Text>
            </Box>
          ) : (
            plugins.map((plugin, index) => {
              const isSelected = selectedItem.section === 'plugins' && selectedItem.index === index
              return <PluginRow key={plugin.meta.name} plugin={plugin} isSelected={isSelected} />
            })
          )}
        </Box>
      </Box>
    )
  },
)
