/**
 * Executing screen tests
 *
 * ExecutingScreen uses Zustand stores for state, so tests mock the stores.
 */

import type { Action } from '@/domain/action/types.js'
import type { VisualFeedback } from '@/domain/types/control.js'
import { ExecutingScreen as Executing } from '@/presentation/ui/screens/execution/ExecutingScreen.js'
import { useExecutionStore } from '@/presentation/ui/stores/executionStore.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Executing', () => {
  const mockAction: Action = {
    meta: {
      name: 'test-action',
      description: 'Test action',
    },
    filePath: '/fake/test.ts',
    run: async () => {},
  }

  // Helper to reset stores to default state
  const resetStores = () => {
    useExecutionStore.setState({
      selectedAction: mockAction,
      executionError: null,
      executionDuration: 0,
      outputMessages: [],
      visualFeedback: {},
      setSelectedAction: vi.fn(),
      setExecutionError: vi.fn(),
      setExecutionDuration: vi.fn(),
      addOutputMessage: vi.fn(),
      setVisualFeedback: vi.fn(),
      resetExecution: vi.fn(),
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
  })

  it('renders default spinner when no visual feedback', () => {
    useExecutionStore.setState({
      selectedAction: mockAction,
      outputMessages: [],
      visualFeedback: {},
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('test-action')
  })

  it('renders custom spinner when visual feedback provided', () => {
    const visualFeedback: VisualFeedback = {
      type: 'spinner',
      spinner: {
        type: 'dots',
        message: 'Loading data...',
        status: 'running',
      },
    }

    useExecutionStore.setState({
      selectedAction: mockAction,
      outputMessages: [],
      visualFeedback,
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('Loading data...')
    expect(lastFrame()).toContain('test-action')
  })

  it('renders spinner with success status', () => {
    const visualFeedback: VisualFeedback = {
      type: 'spinner',
      spinner: {
        type: 'dots',
        message: 'Done!',
        status: 'success',
      },
    }

    useExecutionStore.setState({
      selectedAction: mockAction,
      outputMessages: [],
      visualFeedback,
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('Done!')
    expect(lastFrame()).toContain('✓')
  })

  it('renders spinner with error status', () => {
    const visualFeedback: VisualFeedback = {
      type: 'spinner',
      spinner: {
        type: 'dots',
        message: 'Failed!',
        status: 'error',
      },
    }

    useExecutionStore.setState({
      selectedAction: mockAction,
      outputMessages: [],
      visualFeedback,
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('Failed!')
    expect(lastFrame()).toContain('✗')
  })

  it('renders progress bar when visual feedback provided', () => {
    const visualFeedback: VisualFeedback = {
      type: 'progress',
      progress: {
        value: 50,
        total: 100,
        message: 'Processing...',
        status: 'running',
      },
    }

    useExecutionStore.setState({
      selectedAction: mockAction,
      outputMessages: [],
      visualFeedback,
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('Processing...')
    expect(lastFrame()).toContain('50 / 100')
  })

  it('renders progress bar with success status', () => {
    const visualFeedback: VisualFeedback = {
      type: 'progress',
      progress: {
        value: 100,
        total: 100,
        message: 'Complete!',
        status: 'success',
      },
    }

    useExecutionStore.setState({
      selectedAction: mockAction,
      outputMessages: [],
      visualFeedback,
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('Complete!')
    expect(lastFrame()).toContain('✓')
    expect(lastFrame()).toContain('100 / 100')
  })

  it('renders progress bar with error status', () => {
    const visualFeedback: VisualFeedback = {
      type: 'progress',
      progress: {
        value: 30,
        total: 100,
        message: 'Failed!',
        status: 'error',
      },
    }

    useExecutionStore.setState({
      selectedAction: mockAction,
      outputMessages: [],
      visualFeedback,
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('Failed!')
    expect(lastFrame()).toContain('✗')
    expect(lastFrame()).toContain('30 / 100')
  })

  it('renders output messages', () => {
    const outputMessages = [
      { type: 'log' as const, content: 'Log message', timestamp: Date.now() },
      { type: 'success' as const, content: 'Success message', timestamp: Date.now() },
    ]

    useExecutionStore.setState({
      selectedAction: mockAction,
      outputMessages,
      visualFeedback: {},
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('Log message')
    expect(lastFrame()).toContain('Success message')
  })

  it('renders spinner with different types', () => {
    const types: Array<'dots' | 'line' | 'arc'> = ['dots', 'line', 'arc']

    for (const type of types) {
      const visualFeedback: VisualFeedback = {
        type: 'spinner',
        spinner: {
          type,
          message: `Spinner ${type}`,
          status: 'running',
        },
      }

      useExecutionStore.setState({
        selectedAction: mockAction,
        outputMessages: [],
        visualFeedback,
      })

      const { lastFrame } = render(<Executing />)

      expect(lastFrame()).toContain(`Spinner ${type}`)
    }
  })

  it('shows Unknown when no action is selected', () => {
    useExecutionStore.setState({
      selectedAction: null,
      outputMessages: [],
      visualFeedback: {},
    })

    const { lastFrame } = render(<Executing />)

    expect(lastFrame()).toContain('Unknown')
  })
})
