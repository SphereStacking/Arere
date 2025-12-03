/**
 * Tests for useTheme hook
 */

import type { ArereConfig } from '@/config/schema.js'
import { defaultKeyBindings } from '@/ui/keybindings/index.js'
import { useTheme } from '@/ui/hooks/useTheme.js'
import { AppContext } from '@/ui/AppContext.js'
import { Text } from 'ink'
import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it } from 'vitest'

// Helper to create AppContext value
const createContextValue = (config: ArereConfig) => ({
  config,
  keyBindings: defaultKeyBindings,
})

// Test component that uses useTheme
function TestComponent() {
  const {
    primaryColor,
    primaryColorContrastText,
    inactiveColor,
    errorColor,
    successColor,
    warningColor,
    infoColor,
  } = useTheme()
  return (
    <Text>
      Primary: {primaryColor}, Contrast: {primaryColorContrastText}, Inactive: {inactiveColor},
      Error: {errorColor}, Success: {successColor}, Warning: {warningColor}, Info: {infoColor}
    </Text>
  )
}

describe('useTheme', () => {
  it('returns all default colors when no theme config is provided', () => {
    const config = {} as ArereConfig

    const { lastFrame } = render(
      <AppContext.Provider value={createContextValue(config)}>
        <TestComponent />
      </AppContext.Provider>,
    )

    const output = lastFrame()
    expect(output).toContain('Primary: green')
    expect(output).toContain('Contrast: white')
    expect(output).toContain('Inactive: gray')
    expect(output).toContain('Error: red')
    expect(output).toContain('Success: green')
    expect(output).toContain('Warning: yellow')
    expect(output).toContain('Info:')
  })

  it('returns configured primary color and default semantic colors when theme.primaryColor is set', () => {
    const config = {
      theme: {
        primaryColor: 'magenta',
      },
    } as ArereConfig

    const { lastFrame } = render(
      <AppContext.Provider value={createContextValue(config)}>
        <TestComponent />
      </AppContext.Provider>,
    )

    const output = lastFrame()
    expect(output).toContain('Primary: magenta')
    expect(output).toContain('Contrast: white')
    expect(output).toContain('Inactive: gray')
  })

  it('returns all default colors when theme exists but primaryColor is not set', () => {
    const config = {
      theme: {},
    } as ArereConfig

    const { lastFrame } = render(
      <AppContext.Provider value={createContextValue(config)}>
        <TestComponent />
      </AppContext.Provider>,
    )

    const output = lastFrame()
    expect(output).toContain('Primary: green')
    expect(output).toContain('Contrast: white')
    expect(output).toContain('Inactive: gray')
  })

  it('returns correct contrast text color for light background colors', () => {
    const testCases = [
      { primaryColor: 'cyan', expectedContrast: 'black' },
      { primaryColor: 'yellow', expectedContrast: 'black' },
      { primaryColor: 'white', expectedContrast: 'black' },
    ]

    testCases.forEach(({ primaryColor, expectedContrast }) => {
      const config = {
        theme: { primaryColor },
      } as ArereConfig

      const { lastFrame } = render(
        <AppContext.Provider value={createContextValue(config)}>
          <TestComponent />
        </AppContext.Provider>,
      )

      expect(lastFrame()).toContain(`Contrast: ${expectedContrast}`)
    })
  })

  it('returns correct contrast text color for dark background colors', () => {
    const testCases = [
      { primaryColor: 'green', expectedContrast: 'white' },
      { primaryColor: 'blue', expectedContrast: 'white' },
      { primaryColor: 'red', expectedContrast: 'white' },
      { primaryColor: 'magenta', expectedContrast: 'white' },
      { primaryColor: 'black', expectedContrast: 'white' },
      { primaryColor: 'gray', expectedContrast: 'white' },
    ]

    testCases.forEach(({ primaryColor, expectedContrast }) => {
      const config = {
        theme: { primaryColor },
      } as ArereConfig

      const { lastFrame } = render(
        <AppContext.Provider value={createContextValue(config)}>
          <TestComponent />
        </AppContext.Provider>,
      )

      expect(lastFrame()).toContain(`Contrast: ${expectedContrast}`)
    })
  })
})
