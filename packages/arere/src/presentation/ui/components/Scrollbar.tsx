/**
 * Scrollbar component for terminal UI
 *
 * Displays a vertical scrollbar indicator showing current scroll position.
 */

import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { Box, Text } from 'ink'
import React from 'react'

export interface ScrollbarProps {
  /** Total height of the scrollbar in lines */
  height: number
  /** Current scroll position */
  scrollTop: number
  /** Total content height */
  contentHeight: number
}

/**
 * Calculate scrollbar track position and size
 */
function calculateTrack(
  height: number,
  scrollTop: number,
  contentHeight: number,
): { trackStart: number; trackSize: number } {
  if (contentHeight <= height) {
    // Content fits, no scrolling needed
    return { trackStart: 0, trackSize: height }
  }

  // Calculate track size (minimum 1 line)
  const ratio = height / contentHeight
  const trackSize = Math.max(1, Math.floor(height * ratio))

  // Calculate track position
  const maxScrollTop = contentHeight - height
  const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0
  const maxTrackStart = height - trackSize
  const trackStart = Math.round(scrollRatio * maxTrackStart)

  return { trackStart, trackSize }
}

/**
 * Scrollbar component
 *
 * Renders a vertical scrollbar using block characters.
 *
 * @example
 * <Scrollbar
 *   height={20}
 *   scrollTop={5}
 *   contentHeight={50}
 * />
 */
export const Scrollbar: React.FC<ScrollbarProps> = ({ height, scrollTop, contentHeight }) => {
  const { primaryColor, inactiveColor } = useTheme()
  const { trackStart, trackSize } = calculateTrack(height, scrollTop, contentHeight)

  // Build scrollbar lines
  const lines: React.ReactNode[] = []
  for (let i = 0; i < height; i++) {
    const isTrack = i >= trackStart && i < trackStart + trackSize
    lines.push(
      <Text key={i} color={isTrack ? primaryColor : inactiveColor}>
        {isTrack ? '█' : '░'}
      </Text>,
    )
  }

  return (
    <Box flexDirection="column" width={1}>
      {lines}
    </Box>
  )
}
