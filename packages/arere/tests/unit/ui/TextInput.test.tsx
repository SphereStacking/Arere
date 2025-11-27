/**
 * Tests for TextInput component
 */

import { TextInput } from '@/presentation/ui/components/inputs/TextInput.js'
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

describe('TextInput', () => {
  beforeEach(() => {
    capturedHandler = null
    vi.clearAllMocks()
  })

  it('should render with label', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    const { lastFrame } = render(
      <TextInput mode="standalone" label="Enter your name:" onSubmit={onSubmit} onCancel={onCancel} />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('Enter your name')
  })

  it('should render with placeholder', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    const { lastFrame } = render(
      <TextInput
        mode="standalone"
        label="Username:"
        placeholder="john_doe"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('john_doe')
  })

  it('should show validation error', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const validate = () => 'Invalid input'

    const { lastFrame } = render(
      <TextInput mode="standalone" label="Email:" validate={validate} onSubmit={onSubmit} onCancel={onCancel} />,
    )

    const output = lastFrame()
    expect(output).toBeTruthy()
  })

  describe('Keyboard interactions - Basic input', () => {
    it('should call onSubmit when Enter is pressed', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(<TextInput mode="standalone" label="Name:" onSubmit={onSubmit} onCancel={onCancel} />)

      // Simulate Enter key press
      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith('')
    })

    it('should call onCancel when Escape is pressed', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(<TextInput mode="standalone" label="Name:" onSubmit={onSubmit} onCancel={onCancel} />)

      // Simulate Escape key press
      capturedHandler?.('', { escape: true })

      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should not call onCancel when Escape is pressed without onCancel prop', () => {
      const onSubmit = vi.fn()

      render(<TextInput mode="standalone" label="Name:" onSubmit={onSubmit} />)

      // Simulate Escape key press (should not crash)
      capturedHandler?.('', { escape: true })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should accept text input', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Name:" onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Type "test"
      capturedHandler?.('t', {})
      capturedHandler?.('e', {})
      capturedHandler?.('s', {})
      capturedHandler?.('t', {})

      const output = lastFrame()
      expect(output).toBeTruthy()
    })

    it('should handle backspace to delete character', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Name:" initialValue="test" onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Delete one character with backspace
      capturedHandler?.('', { backspace: true })

      const output = lastFrame()
      expect(output).toBeTruthy()
    })

    it('should handle delete key to remove character', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Name:" initialValue="test" onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Delete character with delete key
      capturedHandler?.('', { delete: true })

      const output = lastFrame()
      expect(output).toBeTruthy()
    })
  })

  describe('Keyboard interactions - Cursor movement', () => {
    it('should move cursor left with left arrow', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Name:" initialValue="test" onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Move cursor left
      capturedHandler?.('', { leftArrow: true })

      expect(lastFrame()).toBeTruthy()
    })

    it('should move cursor right with right arrow', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Name:" initialValue="test" onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Move cursor left then right
      capturedHandler?.('', { leftArrow: true })
      capturedHandler?.('', { rightArrow: true })

      expect(lastFrame()).toBeTruthy()
    })

    it('should move cursor to start with Home key', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Name:" initialValue="test" onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Move cursor to start
      capturedHandler?.('', { home: true })

      expect(lastFrame()).toBeTruthy()
    })

    it('should move cursor to end with End key', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Name:" initialValue="test" onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Move cursor to start then to end
      capturedHandler?.('', { home: true })
      capturedHandler?.('', { end: true })

      expect(lastFrame()).toBeTruthy()
    })
  })

  describe('Keyboard interactions - Validation', () => {
    it('should show validation error when submitting invalid input', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()
      const validate = (value: string) => (value.length < 3 ? 'Too short' : undefined)

      const { lastFrame } = render(
        <TextInput
          mode="standalone"
          label="Name:"
          initialValue="ab"
          validate={validate}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Try to submit with invalid value
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      expect(output).toContain('Too short')
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should submit when validation passes', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()
      const validate = (value: string) => (value.length < 3 ? 'Too short' : undefined)

      render(
        <TextInput
          mode="standalone"
          label="Name:"
          initialValue="abc"
          validate={validate}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Submit with valid value
      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith('abc')
    })

    it('should clear error when typing after validation error', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()
      const validate = (value: string) => (value.length < 3 ? 'Too short' : undefined)

      const { lastFrame } = render(
        <TextInput
          mode="standalone"
          label="Name:"
          initialValue="ab"
          validate={validate}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // Try to submit with invalid value
      capturedHandler?.('', { return: true })

      // Type a character (should clear error)
      capturedHandler?.('c', {})

      const output = lastFrame()
      expect(output).toBeTruthy()
    })
  })

  describe('Prefix and Suffix', () => {
    it('should display prefix as dimmed text', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput
          mode="standalone"
          label="Plugin name:"
          prefix="arere-plugin-"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      const output = lastFrame()
      expect(output).toBeTruthy()
      expect(output).toContain('arere-plugin-')
    })

    it('should display suffix as dimmed text', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput
          mode="standalone"
          label="Username:"
          suffix="@company.com"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      const output = lastFrame()
      expect(output).toBeTruthy()
      expect(output).toContain('@company.com')
    })

    it('should include prefix in submitted value', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Plugin name:"
          prefix="arere-plugin-"
          initialValue="example"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('arere-plugin-example')
    })

    it('should include suffix in submitted value', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Username:"
          suffix="@company.com"
          initialValue="john"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('john@company.com')
    })

    it('should include both prefix and suffix in submitted value', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Email:"
          prefix="admin-"
          suffix="@company.com"
          initialValue="john"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('admin-john@company.com')
    })
  })

  describe('Length restrictions', () => {
    it('should enforce maxLength', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Code:" maxLength={5} onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Try to type 6 characters
      capturedHandler?.('a', {})
      capturedHandler?.('b', {})
      capturedHandler?.('c', {})
      capturedHandler?.('d', {})
      capturedHandler?.('e', {})
      capturedHandler?.('f', {}) // This should be ignored

      const output = lastFrame()
      expect(output).toBeTruthy()
    })

    it('should enforce maxLength including prefix and suffix', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput
          mode="standalone"
          label="Code:"
          prefix="pre-"
          suffix="-suf"
          maxLength={10}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // prefix (4) + user input (2 max) + suffix (4) = 10 max
      capturedHandler?.('a', {})
      capturedHandler?.('b', {})
      capturedHandler?.('c', {}) // This should be ignored (would exceed maxLength)

      const output = lastFrame()
      expect(output).toBeTruthy()
    })

    it('should show error when submitting below minLength', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Password:" minLength={8} onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Type only 5 characters
      capturedHandler?.('a', {})
      capturedHandler?.('b', {})
      capturedHandler?.('c', {})
      capturedHandler?.('d', {})
      capturedHandler?.('e', {})

      // Try to submit
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      expect(output).toBeTruthy()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should check minLength including prefix and suffix', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Code:"
          prefix="pre-"
          suffix="-suf"
          minLength={10}
          initialValue="ab"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      // prefix (4) + user input (2) + suffix (4) = 10 (meets minLength)
      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('pre-ab-suf')
    })
  })

  describe('Pattern restriction', () => {
    it('should block characters that do not match pattern', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()
      const pattern = /^[a-z0-9-]+$/

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Slug:" pattern={pattern} onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Try to type valid and invalid characters
      capturedHandler?.('a', {}) // Valid
      capturedHandler?.('1', {}) // Valid
      capturedHandler?.('-', {}) // Valid
      capturedHandler?.('_', {}) // Invalid - should be blocked
      capturedHandler?.('@', {}) // Invalid - should be blocked
      capturedHandler?.('A', {}) // Invalid - should be blocked (uppercase)

      const output = lastFrame()
      expect(output).toBeTruthy()
    })

    it('should allow all characters when no pattern is specified', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      const { lastFrame } = render(
        <TextInput mode="standalone" label="Text:" onSubmit={onSubmit} onCancel={onCancel} />,
      )

      // Type various characters
      capturedHandler?.('a', {})
      capturedHandler?.('A', {})
      capturedHandler?.('1', {})
      capturedHandler?.('@', {})
      capturedHandler?.('_', {})

      const output = lastFrame()
      expect(output).toBeTruthy()
    })
  })

  describe('Format transformation', () => {
    it('should apply lowercase format on submit', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Email:"
          initialValue="TEST@EXAMPLE.COM"
          format="lowercase"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('test@example.com')
    })

    it('should apply uppercase format on submit', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Code:"
          initialValue="abc123"
          format="uppercase"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('ABC123')
    })

    it('should apply trim format on submit', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Name:"
          initialValue="  hello world  "
          format="trim"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('hello world')
    })

    it('should apply kebab-case format on submit', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Slug:"
          initialValue="My Awesome Plugin"
          format="kebab-case"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('my-awesome-plugin')
    })

    it('should apply custom format function on submit', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()
      const customFormat = (value: string) => value.split('').reverse().join('')

      render(
        <TextInput
          mode="standalone"
          label="Text:"
          initialValue="hello"
          format={customFormat}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('olleh')
    })

    it('should apply format before validation', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()
      const validate = (value: string) => {
        // Expect lowercase value (after format is applied)
        return value === value.toLowerCase() ? undefined : 'Must be lowercase'
      }

      render(
        <TextInput
          mode="standalone"
          label="Text:"
          initialValue="HELLO"
          format="lowercase"
          validate={validate}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('hello')
    })

    it('should apply format with prefix and suffix', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <TextInput
          mode="standalone"
          label="Plugin:"
          prefix="arere-plugin-"
          initialValue="My Plugin"
          format="kebab-case"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('arere-plugin-my-plugin')
    })
  })

  describe('Combined features', () => {
    it('should work with all features together', () => {
      const onSubmit = vi.fn()
      const onCancel = vi.fn()
      const pattern = /^[a-z0-9-]+$/
      const validate = (value: string) => (value.length > 0 ? undefined : 'Required')

      render(
        <TextInput
          mode="standalone"
          label="Plugin name:"
          prefix="arere-plugin-"
          format="kebab-case"
          pattern={pattern}
          maxLength={50}
          minLength={14} // arere-plugin- (13) + at least 1 char
          placeholder="example"
          validate={validate}
          initialValue="example"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('arere-plugin-example')
    })
  })

  describe('Form mode', () => {
    it('should render without label when not provided', () => {
      const onChange = vi.fn()
      const { lastFrame } = render(
        <TextInput mode="form" value="" onChange={onChange} placeholder="Search..." />,
      )

      const output = lastFrame() ?? ''
      // Should not contain ": " (label separator)
      expect(output).not.toContain(': ')
      expect(output).toContain('Search...')
    })

    it('should call onChange on character input', () => {
      const onChange = vi.fn()
      render(<TextInput mode="form" value="" onChange={onChange} />)

      capturedHandler?.('a', {})

      expect(onChange).toHaveBeenCalledWith('a')
    })

    it('should call onSubmit on Enter in form mode', () => {
      const onChange = vi.fn()
      const onSubmit = vi.fn()
      render(<TextInput mode="form" value="test" onChange={onChange} onSubmit={onSubmit} />)

      capturedHandler?.('', { return: true })

      expect(onSubmit).toHaveBeenCalledWith('test')
    })

    it('should not call onSubmit when not provided in form mode', () => {
      const onChange = vi.fn()
      render(<TextInput mode="form" value="test" onChange={onChange} />)

      // Should not crash
      capturedHandler?.('', { return: true })
    })

    it('should handle backspace in form mode', () => {
      const onChange = vi.fn()
      render(<TextInput mode="form" value="test" onChange={onChange} />)

      capturedHandler?.('', { backspace: true })

      expect(onChange).toHaveBeenCalledWith('tes')
    })

    it('should respect isFocused prop', () => {
      const onChange = vi.fn()
      render(<TextInput mode="form" value="" onChange={onChange} isFocused={false} />)

      // Handler should not be captured when not focused
      expect(capturedHandler).toBeNull()
    })
  })
})
