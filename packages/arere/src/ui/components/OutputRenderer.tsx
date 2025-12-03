/**
 * Output renderer component
 * Renders output messages from actions
 */

import { useTheme } from '@/ui/hooks/useTheme'
import type { OutputMessage } from '@/ui/output/types'
import Table from 'cli-table3'
import { Box, Text } from 'ink'
import React from 'react'

interface OutputRendererProps {
  messages: OutputMessage[]
}

/**
 * Render a single output message based on its type
 */
function OutputMessageRenderer({ message }: { message: OutputMessage }) {
  const { type, content, meta } = message
  const { primaryColor, successColor, errorColor, warningColor, infoColor, inactiveColor } =
    useTheme()

  switch (type) {
    case 'log':
      return <Text>{String(content)}</Text>

    case 'success':
      return <Text color={successColor}>✔ {String(content)}</Text>

    case 'error':
      return <Text color={errorColor}>✖ {String(content)}</Text>

    case 'warn':
      return <Text color={warningColor}>⚠ {String(content)}</Text>

    case 'info':
      return <Text color={infoColor}>ℹ {String(content)}</Text>

    case 'newline':
      return <Text>{'\n'}</Text>

    case 'code':
      return (
        <Box borderStyle="round" borderColor="gray" paddingX={1}>
          <Text>{String(content)}</Text>
        </Box>
      )

    case 'section': {
      const title = String(content)
      const separator = '─'.repeat(title.length + 4)
      return (
        <Box flexDirection="column">
          <Text bold color={primaryColor}>
            {title}
          </Text>
          <Text color={inactiveColor}>{separator}</Text>
        </Box>
      )
    }

    case 'list': {
      const items = Array.isArray(content) ? content : [content]
      return (
        <Box flexDirection="column">
          {items.map((item, index) => (
            <Text key={`list-${index}-${String(item).slice(0, 20)}`}>• {String(item)}</Text>
          ))}
        </Box>
      )
    }

    case 'keyValue': {
      const data = content as Record<string, unknown>
      return (
        <Box flexDirection="column">
          {Object.entries(data).map(([key, value]) => (
            <Text key={key}>
              <Text color={primaryColor}>{key}:</Text> {String(value)}
            </Text>
          ))}
        </Box>
      )
    }

    case 'table': {
      const data = Array.isArray(content) ? content : [content]
      if (data.length === 0) {
        return <Text color={inactiveColor}>(empty table)</Text>
      }

      // Get all keys from all objects
      const allKeys = new Set<string>()
      for (const row of data as Record<string, unknown>[]) {
        for (const key of Object.keys(row)) {
          allKeys.add(key)
        }
      }
      const keys = Array.from(allKeys)

      // Create table
      const table = new Table({
        head: keys,
        style: {
          head: [],
          border: [],
        },
      })

      // Add rows
      for (const row of data as Record<string, unknown>[]) {
        table.push(keys.map((key) => String(row[key] ?? '')))
      }

      return <Text>{table.toString()}</Text>
    }

    case 'json': {
      const indent = meta?.indent ?? 2
      let jsonString: string
      try {
        jsonString = JSON.stringify(content, null, indent)
      } catch {
        jsonString = String(content)
      }
      return <Text color={inactiveColor}>{jsonString}</Text>
    }

    case 'separator': {
      const char = meta?.char ?? '─'
      const length = meta?.length ?? 50
      return <Text color={inactiveColor}>{char.repeat(length)}</Text>
    }

    case 'step': {
      const number = meta?.number ?? 0
      return (
        <Text>
          <Text color={primaryColor} bold>
            {number}.
          </Text>{' '}
          {String(content)}
        </Text>
      )
    }

    default:
      return <Text>{String(content)}</Text>
  }
}

/**
 * OutputRenderer component
 * Displays all output messages from an action execution
 */
export function OutputRenderer({ messages }: OutputRendererProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {messages.map((message, index) => (
        <OutputMessageRenderer key={`${message.timestamp}-${index}`} message={message} />
      ))}
    </Box>
  )
}
