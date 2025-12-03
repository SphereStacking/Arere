/**
 * Tests for ErrorBoundary component
 */

import { ErrorBoundary } from "@/ui/components/ErrorBoundary"
import { render } from "ink-testing-library"
import React from "react"
import { Text } from "ink"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/ui/hooks/useTheme", () => ({
  useTheme: () => ({ errorColor: "red" }),
}))

vi.mock("@/i18n/index", () => ({
  t: (key: string) => key,
}))

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), debug: vi.fn() },
}))

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test error message")
  return <Text>Normal content</Text>
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders children when no error", () => {
    const { lastFrame } = render(
      <ErrorBoundary><ThrowingComponent shouldThrow={false} /></ErrorBoundary>
    )
    expect(lastFrame()).toContain("Normal content")
  })

  it("renders error UI when child throws", () => {
    const { lastFrame } = render(
      <ErrorBoundary><ThrowingComponent shouldThrow={true} /></ErrorBoundary>
    )
    expect(lastFrame()).toContain("ui:error.ui_error_occurred")
    expect(lastFrame()).toContain("Test error message")
  })

  it("displays exit hint", () => {
    const { lastFrame } = render(
      <ErrorBoundary><ThrowingComponent shouldThrow={true} /></ErrorBoundary>
    )
    expect(lastFrame()).toContain("ui:error.exit_hint")
  })
})
