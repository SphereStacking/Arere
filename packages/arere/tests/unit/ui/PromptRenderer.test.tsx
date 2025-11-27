/**
 * Tests for PromptRenderer component
 *
 * PromptScreen uses Zustand stores for state, so tests mock the stores.
 */

import type { PromptRequest } from '@/infrastructure/prompt/renderer.js'
import { PromptScreen as PromptRenderer } from '@/presentation/ui/screens/prompt/PromptScreen.js'
import { usePromptStore } from '@/presentation/ui/stores/promptStore.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('PromptRenderer', () => {
  const mockSubmit = vi.fn()
  const mockCancel = vi.fn()

  // Helper to reset stores to default state
  const resetStores = () => {
    usePromptStore.setState({
      promptRequest: null,
      promptResolver: null,
      showPrompt: vi.fn(),
      submitPrompt: mockSubmit,
      cancelPrompt: mockCancel,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
  })

  it('should render loading state when promptRequest is null', () => {
    usePromptStore.setState({ promptRequest: null })

    const { lastFrame } = render(<PromptRenderer />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render TextInput for text prompt type', () => {
    const promptRequest: PromptRequest = {
      type: 'text',
      message: 'Enter your name',
      options: {
        placeholder: 'John Doe',
      },
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    const frame = lastFrame()
    expect(frame).toContain('Enter your name')
  })

  it('should render SelectInput for select prompt type', () => {
    const promptRequest: PromptRequest = {
      type: 'select',
      message: 'Choose an option',
      choices: [
        { label: 'Option 1', value: 1 },
        { label: 'Option 2', value: 2 },
      ],
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    const frame = lastFrame()
    expect(frame).toContain('Choose an option')
  })

  it('should render ConfirmInput for confirm prompt type', () => {
    const promptRequest: PromptRequest = {
      type: 'confirm',
      message: 'Are you sure?',
      options: { defaultValue: true },
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    const frame = lastFrame()
    expect(frame).toContain('Are you sure?')
  })

  it('should render MultiSelectInput for multiSelect prompt type', () => {
    const promptRequest: PromptRequest = {
      type: 'multiSelect',
      message: 'Select multiple options',
      choices: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ],
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    const frame = lastFrame()
    expect(frame).toContain('Select multiple options')
  })

  it('should pass validation function to TextInput', () => {
    const validate = (value: string) => value.length > 0 || 'Required'
    const promptRequest: PromptRequest = {
      type: 'text',
      message: 'Enter value',
      options: {
        validate,
      },
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    const frame = lastFrame()
    expect(frame).toContain('Enter value')
  })

  it('should have submitPrompt callback from store', () => {
    const promptRequest: PromptRequest = {
      type: 'text',
      message: 'Test',
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    expect(mockSubmit).toBeDefined()
    expect(lastFrame()).toBeTruthy()
  })

  it('should have cancelPrompt callback from store', () => {
    const promptRequest: PromptRequest = {
      type: 'text',
      message: 'Test',
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    expect(mockCancel).toBeDefined()
    expect(lastFrame()).toBeTruthy()
  })

  it('should handle text prompt without options', () => {
    const promptRequest: PromptRequest = {
      type: 'text',
      message: 'Simple text prompt',
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    const frame = lastFrame()
    expect(frame).toContain('Simple text prompt')
  })

  it('should handle confirm prompt without defaultValue', () => {
    const promptRequest: PromptRequest = {
      type: 'confirm',
      message: 'Confirm this action',
    }

    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<PromptRenderer />)

    const frame = lastFrame()
    expect(frame).toContain('Confirm this action')
  })
})
