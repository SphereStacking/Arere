/**
 * Footer component
 */

import { useKeyBindingHints } from '@/ui/hooks/useKeyBindingHints'
import { Box, Text } from 'ink'
import React from 'react'

export interface FooterProps {
  hint?: string
}

export const Footer: React.FC<FooterProps> = ({ hint }) => {
  const kbHints = useKeyBindingHints()
  const defaultHint = kbHints.list()

  return (
    <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
      <Text dimColor>{hint || defaultHint}</Text>
    </Box>
  )
}
