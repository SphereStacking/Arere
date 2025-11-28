import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { ArereRender } from '@/presentation/ui/components/ArereRender'

describe('ArereRender', () => {
  it('renders simple format', () => {
    const { lastFrame } = render(
      <ArereRender format="${name}" data={{ name: 'hello' }} width={80} />,
    )

    expect(lastFrame()).toContain('hello')
  })

  it('renders format with literals', () => {
    const { lastFrame } = render(
      <ArereRender format="[${category}] ${name}" data={{ category: 'git', name: 'clone' }} width={80} />,
    )

    expect(lastFrame()).toContain('[git]')
    expect(lastFrame()).toContain('clone')
  })

  it('renders format with max modifier', () => {
    const { lastFrame } = render(
      <ArereRender
        format="${name:max}"
        data={{ name: 'hi' }}
        width={80}
        maxWidths={{ name: 10 }}
      />,
    )

    // Should be padded to 10 characters
    expect(lastFrame()).toContain('hi')
  })

  it('renders selected state with primary color', () => {
    const { lastFrame } = render(
      <ArereRender
        format="${name}"
        data={{ name: 'hello' }}
        width={80}
        isSelected={true}
        primaryColor="green"
      />,
    )

    expect(lastFrame()).toContain('hello')
  })

  it('handles empty data gracefully', () => {
    const { lastFrame } = render(
      <ArereRender format="${name} ${missing}" data={{ name: 'hello' }} width={80} />,
    )

    expect(lastFrame()).toContain('hello')
  })

  it('renders complex format correctly', () => {
    const { lastFrame } = render(
      <ArereRender
        format="${prefix}[${category:max}] ${name:max} ${description:grow}"
        data={{
          prefix: '❯ ',
          category: 'git',
          name: 'clone-repo',
          description: 'Clone a repository',
        }}
        width={80}
        maxWidths={{ category: 8, name: 15 }}
      />,
    )

    expect(lastFrame()).toContain('❯')
    expect(lastFrame()).toContain('[git')
    expect(lastFrame()).toContain('clone-repo')
    expect(lastFrame()).toContain('Clone a repository')
  })

  it('renders right-aligned tokens', () => {
    const { lastFrame } = render(
      <ArereRender
        format="${name} ${tags:right}"
        data={{ name: 'hello', tags: '#test' }}
        width={80}
      />,
    )

    expect(lastFrame()).toContain('hello')
    expect(lastFrame()).toContain('#test')
  })
})
