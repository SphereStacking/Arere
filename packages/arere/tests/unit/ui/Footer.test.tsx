/**
 * Tests for Footer component
 */

import { Footer } from '@/ui/components/Footer.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it } from 'vitest'

describe('Footer', () => {
  it('should render default hint with dynamic keybinding hints', () => {
    const { lastFrame } = render(<Footer />)

    // Dynamic hints from useKeyBindingHints().list() - bracket format [key] label
    expect(lastFrame()).toContain('[Ctrl+C] 終了')
    expect(lastFrame()).toContain('[/] 検索')
    expect(lastFrame()).toContain('[?] ヘルプ')
    expect(lastFrame()).toContain('[s] 設定')
  })

  it('should render custom hint', () => {
    const { lastFrame } = render(<Footer hint="カスタムヒント" />)

    expect(lastFrame()).toContain('カスタムヒント')
    expect(lastFrame()).not.toContain('[Ctrl+C] 終了')
  })
})
