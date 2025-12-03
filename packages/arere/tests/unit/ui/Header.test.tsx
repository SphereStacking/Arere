/**
 * Tests for Header component
 */

import { Header } from '@/ui/components/Header.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

// Mock useKaomoji to return a fixed face for testing
vi.mock('@/ui/hooks/useKaomoji', () => ({
  useKaomoji: () => '(・_・?)',
}))

describe('Header', () => {
  it('should render header with title', () => {
    const { lastFrame } = render(<Header />)

    expect(lastFrame()).toContain('Arere(・_・?)')
  })

  it('should render border', () => {
    const { lastFrame } = render(<Header />)

    const frame = lastFrame()
    expect(frame).toContain('╭')
    expect(frame).toContain('╮')
  })

  it('should render hint when provided', () => {
    const { lastFrame } = render(<Header hint="q: 終了 | ?: ヘルプ" />)

    const frame = lastFrame()
    expect(frame).toContain('Arere(・_・?)')
    expect(frame).toContain('q: 終了 | ?: ヘルプ')
  })

  it('should not render hint when not provided', () => {
    const { lastFrame } = render(<Header />)

    const frame = lastFrame()
    expect(frame).toContain('Arere(・_・?)')
    expect(frame).not.toContain('q:')
  })

  it('should render breadcrumb when provided', () => {
    const { lastFrame } = render(<Header breadcrumb={['設定', 'プラグイン']} />)

    const frame = lastFrame()
    expect(frame).toContain('Arere(・_・?)')
    expect(frame).toContain('設定')
    expect(frame).toContain('プラグイン')
    expect(frame).toContain('>')
  })

  it('should handle empty breadcrumb array', () => {
    const { lastFrame } = render(<Header breadcrumb={[]} />)

    const frame = lastFrame()
    expect(frame).toContain('Arere(・_・?)')
  })

  it('should render single breadcrumb item without separator', () => {
    const { lastFrame } = render(<Header breadcrumb={['ホーム']} />)

    const frame = lastFrame()
    expect(frame).toContain('Arere(・_・?)')
    expect(frame).toContain('ホーム')
  })
})
