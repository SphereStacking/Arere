/**
 * Layer selector component for switching between User and Workspace settings
 */

import type { ConfigLayer } from '@/config/types'
import { t } from '@/i18n/index'
import { useTheme } from '@/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

export interface LayerSelectorProps {
  currentLayer: ConfigLayer
  onLayerChange?: (layer: ConfigLayer) => void
}

export const LayerSelector: React.FC<LayerSelectorProps> = ({ currentLayer, onLayerChange }) => {
  const layers: ConfigLayer[] = ['workspace', 'user']
  const { primaryColor, inactiveColor } = useTheme()

  return (
    <Box flexDirection="row" gap={1}>
      <Text dimColor>{t('ui:settings.layer.label')}:</Text>
      {layers.map((layer) => {
        const isActive = currentLayer === layer
        const label = t(`ui:settings.layer.${layer}`)

        return (
          <Box key={layer} marginLeft={layer === 'workspace' ? 0 : 0}>
            <Text bold={isActive} color={isActive ? primaryColor : inactiveColor}>
              [{isActive ? <Text underline>{label}</Text> : label}]
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}
