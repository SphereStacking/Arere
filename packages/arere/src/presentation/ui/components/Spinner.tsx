/**
 * Spinner component for loading states
 * Self-contained implementation without external dependencies
 */

import { Text } from 'ink'
import React from 'react'
import { useEffect, useState } from 'react'

export interface SpinnerProps {
  /** Spinner type */
  type?: 'dots' | 'line' | 'arc'
}

// Spinner frame sequences
const SPINNERS = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['|', '/', '-', '\\'],
  arc: ['◜', '◠', '◝', '◞', '◡', '◟'],
}

export const Spinner: React.FC<SpinnerProps> = ({ type = 'dots' }) => {
  const [frame, setFrame] = useState(0)
  const frames = SPINNERS[type]

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length)
    }, 80)

    return () => clearInterval(interval)
  }, [frames.length])

  return <Text>{frames[frame]}</Text>
}
