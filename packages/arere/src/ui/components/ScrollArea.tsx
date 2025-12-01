/**
 * ScrollArea component for scrollable content
 *
 * Provides a scrollable container using marginTop technique.
 * Works with any content type (not just lists).
 *
 * Based on: https://gist.github.com/janis-me/1a55a8747f12e1c4fc86ebe2d05a0a55
 */

import { Scrollbar } from '@/ui/components/Scrollbar'
import { Box, type DOMElement, measureElement, useInput } from 'ink'
import React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Keyboard scroll handler component
 * Separated to avoid useInput being called when enableKeyboardScroll is false
 */
interface KeyboardScrollHandlerProps {
  height: number
  scrollStep: number
  scrollTop: number
  onScroll: (newScrollTop: number) => void
}

const KeyboardScrollHandler: React.FC<KeyboardScrollHandlerProps> = ({
  height,
  scrollStep,
  scrollTop,
  onScroll,
}) => {
  useInput((_input, key) => {
    if (key.downArrow || key.pageDown) {
      const step = key.pageDown ? height : scrollStep
      onScroll(scrollTop + step)
    }
    if (key.upArrow || key.pageUp) {
      const step = key.pageUp ? height : scrollStep
      onScroll(scrollTop - step)
    }
  })
  return null
}

export interface ScrollAreaProps {
  /** Height of the visible area in lines */
  height: number
  /** Current scroll position (controlled mode) */
  scrollTop?: number
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void
  /** Enable keyboard scrolling with arrow keys */
  enableKeyboardScroll?: boolean
  /** Scroll step size for keyboard navigation */
  scrollStep?: number
  /** Show scrollbar when content is scrollable */
  showScrollbar?: boolean
  /** Index to follow (for list selection tracking) */
  followIndex?: number
  /** Height of each item when using followIndex */
  itemHeight?: number
  /** Children to render inside the scroll area */
  children: React.ReactNode
}

/**
 * A scrollable container that clips content to a fixed height
 *
 * Uses negative margin technique to simulate scrolling within Ink's
 * flexbox-based layout system.
 *
 * @example
 * // Uncontrolled mode with keyboard scrolling
 * <ScrollArea height={20} enableKeyboardScroll>
 *   <LongContent />
 * </ScrollArea>
 *
 * @example
 * // Controlled mode
 * const [scrollTop, setScrollTop] = useState(0)
 * <ScrollArea height={20} scrollTop={scrollTop} onScroll={setScrollTop}>
 *   <LongContent />
 * </ScrollArea>
 */
export const ScrollArea: React.FC<ScrollAreaProps> = ({
  height,
  scrollTop: controlledScrollTop,
  onScroll,
  enableKeyboardScroll = false,
  scrollStep = 1,
  showScrollbar = false,
  followIndex,
  itemHeight = 1,
  children,
}) => {
  const [internalScrollTop, setInternalScrollTop] = useState(0)
  const [innerHeight, setInnerHeight] = useState(0)
  const innerRef = useRef<DOMElement>(null)

  // Use controlled or uncontrolled scroll position
  const isControlled = controlledScrollTop !== undefined
  const scrollTop = isControlled ? controlledScrollTop : internalScrollTop

  // Calculate max scroll position
  const maxScrollTop = Math.max(0, innerHeight - height)

  // Measure inner content height (children triggers re-measurement when content changes)
  // biome-ignore lint/correctness/useExhaustiveDependencies: children is used to trigger re-measurement when content changes
  useEffect(() => {
    if (!innerRef.current) return
    const dimensions = measureElement(innerRef.current)
    setInnerHeight(dimensions.height)
  }, [children])

  // Scroll handler (memoized for mouse scroll hook)
  const handleScroll = useCallback(
    (newScrollTop: number) => {
      const clampedScrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop))
      if (isControlled) {
        onScroll?.(clampedScrollTop)
      } else {
        setInternalScrollTop(clampedScrollTop)
      }
    },
    [maxScrollTop, isControlled, onScroll],
  )

  // Follow index (selection tracking for lists)
  useEffect(() => {
    if (followIndex === undefined) return

    const itemTop = followIndex * itemHeight
    const itemBottom = itemTop + itemHeight

    // If item is above visible area, scroll up
    if (itemTop < scrollTop) {
      handleScroll(itemTop)
    }
    // If item is below visible area, scroll down
    else if (itemBottom > scrollTop + height) {
      handleScroll(itemBottom - height)
    }
  }, [followIndex, itemHeight, scrollTop, height, handleScroll])

  // Determine if scrollbar should be shown
  const isScrollable = innerHeight > height
  const shouldShowScrollbar = showScrollbar && isScrollable

  return (
    <>
      {enableKeyboardScroll && (
        <KeyboardScrollHandler
          height={height}
          scrollStep={scrollStep}
          scrollTop={scrollTop}
          onScroll={handleScroll}
        />
      )}
      <Box height={height} flexDirection="row" overflow="hidden" flexGrow={1}>
        <Box flexGrow={1} flexDirection="column" overflow="hidden">
          <Box ref={innerRef} flexShrink={0} flexDirection="column" marginTop={-scrollTop}>
            {children}
          </Box>
        </Box>
        {shouldShowScrollbar && (
          <Scrollbar height={height} scrollTop={scrollTop} contentHeight={innerHeight} />
        )}
      </Box>
    </>
  )
}

/**
 * Hook to manage scroll state with content measurement
 */
export interface UseScrollStateOptions {
  /** Height of the visible area */
  visibleHeight: number
  /** Total content height (if known) */
  contentHeight?: number
}

export interface UseScrollStateResult {
  /** Current scroll position */
  scrollTop: number
  /** Set scroll position */
  setScrollTop: (scrollTop: number) => void
  /** Scroll down by amount */
  scrollDown: (amount?: number) => void
  /** Scroll up by amount */
  scrollUp: (amount?: number) => void
  /** Scroll to make a position visible */
  scrollToPosition: (position: number, itemHeight?: number) => void
  /** Whether content is scrollable */
  isScrollable: boolean
  /** Maximum scroll position */
  maxScrollTop: number
}

export function useScrollState({
  visibleHeight,
  contentHeight = 0,
}: UseScrollStateOptions): UseScrollStateResult {
  const [scrollTop, setScrollTopInternal] = useState(0)
  const maxScrollTop = Math.max(0, contentHeight - visibleHeight)

  const setScrollTop = (newScrollTop: number) => {
    setScrollTopInternal(Math.max(0, Math.min(maxScrollTop, newScrollTop)))
  }

  const scrollDown = (amount = 1) => {
    setScrollTop(scrollTop + amount)
  }

  const scrollUp = (amount = 1) => {
    setScrollTop(scrollTop - amount)
  }

  const scrollToPosition = (position: number, itemHeight = 1) => {
    const itemBottom = position + itemHeight

    // If item is above visible area, scroll up
    if (position < scrollTop) {
      setScrollTop(position)
    }
    // If item is below visible area, scroll down
    else if (itemBottom > scrollTop + visibleHeight) {
      setScrollTop(itemBottom - visibleHeight)
    }
  }

  return {
    scrollTop,
    setScrollTop,
    scrollDown,
    scrollUp,
    scrollToPosition,
    isScrollable: contentHeight > visibleHeight,
    maxScrollTop,
  }
}
