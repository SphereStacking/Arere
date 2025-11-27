/**
 * Tests for useKeyboardInput hook
 *
 * Goal: Improve coverage from 45% to 75%+
 * Testing all keyboard shortcuts:
 * - Ctrl+C to exit
 * - 'q' to quit from list
 * - '/' for fuzzy search
 * - Enter from success/error
 * - Escape navigation
 * - '?' for help
 * - 's' for settings
 */

import type { UseKeyboardInputProps } from '@/presentation/ui/hooks/app/useKeyboardInput.js'
import type { ScreenState } from '@/presentation/ui/types.js'
import { Text } from 'ink'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock useInput to capture the handler
let capturedHandler: ((input: string, key: any) => void) | null = null
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink')
  return {
    ...actual,
    useInput: (handler: (input: string, key: any) => void, options?: { isActive?: boolean }) => {
      if (options?.isActive !== false) {
        capturedHandler = handler
      } else {
        capturedHandler = null
      }
    },
  }
})

// Import after mocking
const { useKeyboardInput } = await import('@/presentation/ui/hooks/app/useKeyboardInput.js')

// Test component that uses the hook
const TestComponent: React.FC<UseKeyboardInputProps> = (props) => {
  useKeyboardInput(props)
  return <Text>{props.screen}</Text>
}

describe('useKeyboardInput', () => {
  let setScreen: ReturnType<typeof vi.fn>
  let setSelectedAction: ReturnType<typeof vi.fn>
  let setSelectedPlugin: ReturnType<typeof vi.fn>
  let setExecutionError: ReturnType<typeof vi.fn>
  let onExit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setScreen = vi.fn()
    setSelectedAction = vi.fn()
    setSelectedPlugin = vi.fn()
    setExecutionError = vi.fn()
    onExit = vi.fn()
  })

  describe('Basic Setup', () => {
    it('should render with list screen', () => {
      const { lastFrame } = render(
        <TestComponent
          screen="list"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      expect(lastFrame()).toContain('list')
    })

    it('should render with different screens', () => {
      const screens: ScreenState[] = [
        'list',
        'search',
        'help',
        'settings',
        'executing',
        'success',
        'error',
        'input',
      ]

      screens.forEach((screen) => {
        const { lastFrame } = render(
          <TestComponent
            screen={screen}
            setScreen={setScreen}
            setSelectedAction={setSelectedAction}
            setSelectedPlugin={setSelectedPlugin}
            setExecutionError={setExecutionError}
            onExit={onExit}
          />,
        )
        expect(lastFrame()).toContain(screen)
      })
    })
  })

  describe('Ctrl+C to exit', () => {
    it('should call onExit when Ctrl+C is pressed', () => {
      render(
        <TestComponent
          screen="list"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      // Simulate Ctrl+C
      capturedHandler?.('c', { ctrl: true })
      expect(onExit).toHaveBeenCalledTimes(1)
    })

    it('should call onExit from any screen with Ctrl+C', () => {
      render(
        <TestComponent
          screen="settings"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('c', { ctrl: true })
      expect(onExit).toHaveBeenCalledTimes(1)
    })
  })

  describe('q to quit from list', () => {
    it('should call onExit when q is pressed on list screen', () => {
      render(
        <TestComponent
          screen="list"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('q', {})
      expect(onExit).toHaveBeenCalledTimes(1)
    })

    it('should call onExit when q is pressed on any screen', () => {
      render(
        <TestComponent
          screen="settings"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('q', {})
      expect(onExit).toHaveBeenCalledTimes(1)
    })
  })

  describe('/ for fuzzy search', () => {
    it('should navigate to search screen when / is pressed on list', () => {
      render(
        <TestComponent
          screen="list"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('/', {})
      expect(setScreen).toHaveBeenCalledWith('search')
    })

    it('should not navigate to search when / is pressed on other screens', () => {
      render(
        <TestComponent
          screen="settings"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('/', {})
      expect(setScreen).not.toHaveBeenCalled()
    })
  })

  describe('Enter from success/error screens', () => {
    it('should return to list from success screen', () => {
      render(
        <TestComponent
          screen="success"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('', { return: true })
      expect(setScreen).toHaveBeenCalledWith('list')
      expect(setSelectedAction).toHaveBeenCalledWith(null)
      expect(setExecutionError).toHaveBeenCalledWith(null)
    })

    it('should return to list from error screen', () => {
      render(
        <TestComponent
          screen="error"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('', { return: true })
      expect(setScreen).toHaveBeenCalledWith('list')
      expect(setSelectedAction).toHaveBeenCalledWith(null)
      expect(setExecutionError).toHaveBeenCalledWith(null)
    })
  })

  describe('Escape navigation', () => {
    // Note: plugin-detail screen now handles its own Escape key internally (in PluginDetail.tsx)
    // so this test has been removed

    it('should navigate from plugin-list to settings', () => {
      render(
        <TestComponent
          screen="plugin-list"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('', { escape: true })
      expect(setScreen).toHaveBeenCalledWith('settings')
    })

    it('should navigate from help to list', () => {
      render(
        <TestComponent
          screen="help"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('', { escape: true })
      expect(setScreen).toHaveBeenCalledWith('list')
      expect(setSelectedAction).toHaveBeenCalledWith(null)
      expect(setExecutionError).toHaveBeenCalledWith(null)
    })

    // Note: settings screen now handles its own Escape key internally (in Settings.tsx)
    // so this test has been removed

    it('should navigate from error to list', () => {
      render(
        <TestComponent
          screen="error"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('', { escape: true })
      expect(setScreen).toHaveBeenCalledWith('list')
      expect(setSelectedAction).toHaveBeenCalledWith(null)
      expect(setExecutionError).toHaveBeenCalledWith(null)
    })

    it('should navigate from success to list', () => {
      render(
        <TestComponent
          screen="success"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('', { escape: true })
      expect(setScreen).toHaveBeenCalledWith('list')
      expect(setSelectedAction).toHaveBeenCalledWith(null)
      expect(setExecutionError).toHaveBeenCalledWith(null)
    })
  })

  describe('? for help', () => {
    it('should navigate to help when ? is pressed on list', () => {
      render(
        <TestComponent
          screen="list"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('?', {})
      expect(setScreen).toHaveBeenCalledWith('help')
    })

    it('should not navigate to help when ? is pressed on other screens', () => {
      render(
        <TestComponent
          screen="settings"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('?', {})
      expect(setScreen).not.toHaveBeenCalled()
    })
  })

  describe('s for settings', () => {
    it('should navigate to settings when s is pressed on list', () => {
      render(
        <TestComponent
          screen="list"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('s', {})
      expect(setScreen).toHaveBeenCalledWith('settings')
    })

    it('should not navigate to settings when s is pressed on other screens', () => {
      render(
        <TestComponent
          screen="help"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      capturedHandler?.('s', {})
      expect(setScreen).not.toHaveBeenCalled()
    })
  })

  describe('isActive condition', () => {
    it('should not handle input on input screen', () => {
      render(
        <TestComponent
          screen="input"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      // Handler should be null because isActive is false
      expect(capturedHandler).toBeNull()
    })

    it('should not handle input on search screen for regular keys', () => {
      render(
        <TestComponent
          screen="search"
          setScreen={setScreen}
          setSelectedAction={setSelectedAction}
          setSelectedPlugin={setSelectedPlugin}
          setExecutionError={setExecutionError}
          onExit={onExit}
        />,
      )

      // Handler should be null because isActive is false
      expect(capturedHandler).toBeNull()
    })
  })
})
