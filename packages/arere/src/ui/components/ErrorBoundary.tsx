/**
 * Error boundary component
 */

import { t } from '@/i18n/index'
import { logger } from '@/lib/logger'
import { Box, Text } from 'ink'
import React from 'react'
import { Component, type ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'

interface ErrorBoundaryProps {
  children: ReactNode
  errorColor?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryInner extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('UI Error:', error)
    logger.debug('Error info:', errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const errorColor = this.props.errorColor ?? 'red'
      return (
        <Box flexDirection="column" paddingY={2}>
          <Box marginBottom={1}>
            <Text color={errorColor} bold>
              {t('ui:error.ui_error_occurred')}
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color={errorColor}>{this.state.error.message}</Text>
          </Box>

          {this.state.error.stack && (
            <Box flexDirection="column" marginTop={1}>
              <Text dimColor>{t('ui:error.stack_trace')}</Text>
              <Box paddingLeft={2}>
                <Text dimColor>{this.state.error.stack}</Text>
              </Box>
            </Box>
          )}

          <Box marginTop={2}>
            <Text dimColor>{t('ui:error.unexpected_error')}</Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>{t('ui:error.exit_hint')}</Text>
          </Box>
        </Box>
      )
    }

    return this.props.children
  }
}

/**
 * Error boundary with theme support and i18n
 */
export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { errorColor } = useTheme()
  return <ErrorBoundaryInner errorColor={errorColor}>{children}</ErrorBoundaryInner>
}
