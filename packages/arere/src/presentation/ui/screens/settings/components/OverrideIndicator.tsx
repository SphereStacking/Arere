/**
 * Override indicator component
 *
 * Displays a warning when a user setting is overridden by workspace setting.
 */

import { t } from '@/infrastructure/i18n/index'
import { Text } from 'ink'
import React from 'react'

export interface OverrideIndicatorProps {
  isOverridden: boolean
}

/**
 * Override indicator component
 *
 * @param props - Component props
 * @returns Override indicator or null
 *
 * @example
 * ```tsx
 * <OverrideIndicator isOverridden={true} />
 * // Renders: <Text dimColor> (⚠ overridden by workspace)</Text>
 * ```
 */
export const OverrideIndicator: React.FC<OverrideIndicatorProps> = ({ isOverridden }) => {
  if (!isOverridden) {
    return null
  }

  return <Text dimColor> {t('ui:settings.layer.overridden')}</Text>
}
