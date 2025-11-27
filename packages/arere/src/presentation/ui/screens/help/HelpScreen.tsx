/**
 * Help screen component
 */

import { t } from '@/infrastructure/i18n/index'
import { HEADER_HEIGHT } from '@/presentation/ui/components/Header'
import { ScrollArea } from '@/presentation/ui/components/ScrollArea'
import { usePageMeta } from '@/presentation/ui/hooks/usePageMeta'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

export const HelpScreen: React.FC = () => {
  const { primaryColor } = useTheme()
  const { rows } = useTerminalSize()

  usePageMeta({
    breadcrumb: ['home', 'help'],
    hint: t('ui:help.hint'),
  })

  // Calculate visible height
  const visibleHeight = rows - HEADER_HEIGHT

  return (
    <ScrollArea height={visibleHeight} enableKeyboardScroll showScrollbar>
      <Box flexDirection="column" flexGrow={1} paddingY={1}>
        <Text bold>{t('ui:help.title')}</Text>
        <Box marginTop={1} flexDirection="column" paddingLeft={2}>
          <Text>
            <Text color={primaryColor}>↑↓</Text> - {t('ui:help.shortcuts.navigate')}
          </Text>
          <Text>
            <Text color={primaryColor}>Enter</Text> - {t('ui:help.shortcuts.run')}
          </Text>
          <Text>
            <Text color={primaryColor}>?</Text> - {t('ui:help.shortcuts.help')}
          </Text>
          <Text>
            <Text color={primaryColor}>Esc</Text> - {t('ui:help.shortcuts.back')}
          </Text>
          <Text>
            <Text color={primaryColor}>Ctrl+C</Text> - {t('ui:help.shortcuts.quit')}
          </Text>
        </Box>
        <Box marginTop={2}>
          <Text dimColor>{t('ui:help.hint')}</Text>
        </Box>
      </Box>
    </ScrollArea>
  )
}
