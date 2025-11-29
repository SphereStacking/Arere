/**
 * Header component
 */

import { translationManager } from '@/infrastructure/i18n/manager'
import { useKaomoji } from '@/presentation/ui/hooks/useKaomoji'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

/** Header height in lines (border top + content + border bottom) */
export const HEADER_HEIGHT = 3

export interface HeaderProps {
  breadcrumb?: string[]
  hint?: string
}

/**
 * Render breadcrumb navigation
 */
function renderBreadcrumb(items: string[]): React.ReactNode {
  if (items.length === 0) {
    return null
  }

  return items.map((item, index) => {
    const isLast = index === items.length - 1
    // Try to translate the item using breadcrumb namespace
    // If translation doesn't exist, use the original value (e.g., plugin names, field names)
    const translatedItem = translationManager.t(`ui:breadcrumb.${item}`, {
      defaultValue: item,
    })

    return (
      <React.Fragment key={`${item}-${index}`}>
        <Text dimColor={!isLast}>{translatedItem}</Text>
        {!isLast && <Text dimColor> {'>'} </Text>}
      </React.Fragment>
    )
  })
}

export const Header: React.FC<HeaderProps> = ({ breadcrumb, hint }) => {
  const { primaryColor } = useTheme()
  const kaomoji = useKaomoji()

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="round"
        borderColor={primaryColor}
        paddingX={1}
        justifyContent="space-between"
      >
        <Box>
          <Text bold color={primaryColor}>
            {'❯ '}Arere
          </Text>
          <Box width={12}>
            <Text bold color={primaryColor}>
              {kaomoji}
            </Text>
          </Box>
          {breadcrumb && breadcrumb.length > 0 && renderBreadcrumb(breadcrumb)}
        </Box>
        {hint && (
          <Text dimColor color={primaryColor}>
            {hint}
          </Text>
        )}
      </Box>
    </Box>
  )
}
