/**
 * Tests for CLI argument routing behavior
 *
 * These tests verify that CLI arguments are correctly routed:
 * - arere run --help → shows general run help
 * - arere run <action> --help → passed to HeadlessMode for action-specific help
 */

import { describe, expect, it } from 'vitest'

/**
 * CLI argument routing logic (extracted from cli.ts for testing)
 */
function routeRunCommand(args: string[]): {
  type: 'run-help' | 'action-run'
  actionName?: string
  actionArgs?: string[]
} {
  // args = everything after 'arere run'
  // e.g., ['deploy', '--help'] or ['--help'] or ['deploy', '--target=prod']

  const actionName = args[0]

  // Handle arere run --help (without action name)
  if (!actionName || actionName === '--help' || actionName === '-h') {
    return { type: 'run-help' }
  }

  // Pass to HeadlessMode (handles action-specific --help)
  return {
    type: 'action-run',
    actionName,
    actionArgs: args.slice(1),
  }
}

describe('CLI argument routing', () => {
  describe('arere run --help', () => {
    it('should route to run help when --help is the first arg', () => {
      const result = routeRunCommand(['--help'])
      expect(result.type).toBe('run-help')
    })

    it('should route to run help when -h is the first arg', () => {
      const result = routeRunCommand(['-h'])
      expect(result.type).toBe('run-help')
    })

    it('should route to run help when no args provided', () => {
      const result = routeRunCommand([])
      expect(result.type).toBe('run-help')
    })
  })

  describe('arere run <action> --help', () => {
    it('should route to action run when action name is provided', () => {
      const result = routeRunCommand(['deploy', '--help'])
      expect(result.type).toBe('action-run')
      expect(result.actionName).toBe('deploy')
      expect(result.actionArgs).toEqual(['--help'])
    })

    it('should route to action run when action name and -h provided', () => {
      const result = routeRunCommand(['deploy', '-h'])
      expect(result.type).toBe('action-run')
      expect(result.actionName).toBe('deploy')
      expect(result.actionArgs).toEqual(['-h'])
    })

    it('should route to action run with multiple args', () => {
      const result = routeRunCommand(['deploy', '--target=prod', '--yes', '--help'])
      expect(result.type).toBe('action-run')
      expect(result.actionName).toBe('deploy')
      expect(result.actionArgs).toEqual(['--target=prod', '--yes', '--help'])
    })
  })

  describe('arere run <action> [args...]', () => {
    it('should route to action run with no args', () => {
      const result = routeRunCommand(['deploy'])
      expect(result.type).toBe('action-run')
      expect(result.actionName).toBe('deploy')
      expect(result.actionArgs).toEqual([])
    })

    it('should route to action run with positional args', () => {
      const result = routeRunCommand(['deploy', 'production', '--force'])
      expect(result.type).toBe('action-run')
      expect(result.actionName).toBe('deploy')
      expect(result.actionArgs).toEqual(['production', '--force'])
    })
  })

  describe('edge cases', () => {
    it('should handle action name that starts with dash (invalid but handled)', () => {
      // This is technically an invalid action name, but the routing should still work
      // --help and -h are special cases
      const result = routeRunCommand(['--not-help'])
      // Since it's not exactly --help or -h, it's treated as an action name
      // This is correct behavior - validation happens in HeadlessMode
      expect(result.type).toBe('action-run')
      expect(result.actionName).toBe('--not-help')
    })

    it('should handle -x (short flag that is not -h)', () => {
      const result = routeRunCommand(['-x'])
      // -x is not -h, so it's treated as an action name
      expect(result.type).toBe('action-run')
      expect(result.actionName).toBe('-x')
    })
  })
})
