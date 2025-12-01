/**
 * Multiline text input component
 */

import { t } from '@/i18n/index'
import { useKeyBindingHints } from '@/ui/hooks/useKeyBindingHints'
import { useTheme } from '@/ui/hooks/useTheme'
import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useState } from 'react'

export interface MultilineInputProps {
  /** Input label */
  label: string
  /** Placeholder text */
  placeholder?: string
  /** Initial value */
  initialValue?: string
  /** On submit callback */
  onSubmit: (value: string) => void
  /** On cancel callback */
  onCancel?: () => void
}

export const MultilineInput: React.FC<MultilineInputProps> = ({
  label,
  placeholder,
  initialValue = '',
  onSubmit,
  onCancel,
}) => {
  const [lines, setLines] = useState<string[]>(initialValue ? initialValue.split('\n') : [''])
  const [currentLine, setCurrentLine] = useState(0)
  const { primaryColor } = useTheme()
  const hints = useKeyBindingHints()

  useInput((input, key) => {
    if (key.return) {
      // Add new line
      setLines((prev) => {
        const newLines = [...prev]
        newLines.splice(currentLine + 1, 0, '')
        return newLines
      })
      setCurrentLine((prev) => prev + 1)
    } else if (key.backspace || key.delete) {
      // Handle backspace
      if (lines[currentLine].length === 0 && lines.length > 1) {
        // Remove empty line
        setLines((prev) => prev.filter((_, i) => i !== currentLine))
        setCurrentLine((prev) => Math.max(0, prev - 1))
      } else {
        setLines((prev) => {
          const newLines = [...prev]
          newLines[currentLine] = newLines[currentLine].slice(0, -1)
          return newLines
        })
      }
    } else if (key.escape) {
      if (key.ctrl || key.meta) {
        // Ctrl+Esc or Cmd+Esc to submit
        onSubmit(lines.join('\n'))
      } else {
        onCancel?.()
      }
    } else if (key.upArrow) {
      setCurrentLine((prev) => Math.max(0, prev - 1))
    } else if (key.downArrow) {
      setCurrentLine((prev) => Math.min(lines.length - 1, prev + 1))
    } else if (key.ctrl && input === 'd') {
      // Ctrl+D to submit
      onSubmit(lines.join('\n'))
    } else if (!key.ctrl && !key.meta && input) {
      // Add character
      setLines((prev) => {
        const newLines = [...prev]
        newLines[currentLine] += input
        return newLines
      })
    }
  })

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={primaryColor}>{label}:</Text>
      </Box>

      {lines.length === 0 || (lines.length === 1 && lines[0] === '') ? (
        <Box>
          <Text dimColor>{placeholder || t('ui:prompts.placeholder.multiline')}</Text>
        </Box>
      ) : (
        <Box flexDirection="column" borderStyle="single" paddingX={1}>
          {lines.map((line, index) => (
            <Box key={`line-${index}-${line.slice(0, 10)}`}>
              <Text color={index === currentLine ? primaryColor : undefined}>
                {index === currentLine ? '> ' : '  '}
                {line || ' '}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>{hints.multilineInput(lines.length)}</Text>
      </Box>
    </Box>
  )
}
