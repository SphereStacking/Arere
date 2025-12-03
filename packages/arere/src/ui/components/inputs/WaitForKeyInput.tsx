/**
 * WaitForKey input component
 * Waits for user to press Enter or specific keys
 */

import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useState } from 'react'

export interface WaitForKeyInputProps {
  message?: string
  keys?: string[]
  caseInsensitive?: boolean
  onSubmit: (key: string) => void
}

/**
 * WaitForKey input component
 */
export const WaitForKeyInput: React.FC<WaitForKeyInputProps> = ({
  message,
  keys,
  caseInsensitive = false,
  onSubmit,
}) => {
  const [submitted, setSubmitted] = useState(false)

  useInput((input, key) => {
    if (submitted) return

    // Handle Enter key
    if (key.return) {
      setSubmitted(true)
      onSubmit('')
      return
    }

    // If no keys filter, accept any key
    if (!keys || keys.length === 0) {
      setSubmitted(true)
      onSubmit(input)
      return
    }

    // Check if pressed key matches expected keys
    const normalizedInput = caseInsensitive ? input.toLowerCase() : input
    const normalizedKeys = caseInsensitive ? keys.map((k) => k.toLowerCase()) : keys

    if (normalizedKeys.includes(normalizedInput)) {
      setSubmitted(true)
      onSubmit(input)
    }
  })

  const displayMessage = message || 'Press a key...'
  const hint = keys && keys.length > 0 ? ` [${keys.join('/')}]` : ' [any key]'

  return (
    <Box flexDirection="column">
      <Text>
        {displayMessage}
        <Text dimColor>{hint}</Text>
      </Text>
    </Box>
  )
}
