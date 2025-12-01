/**
 * Execution mode types
 *
 * Arere supports two execution modes:
 * - UI mode: Interactive terminal UI with Ink
 * - Headless mode: Non-interactive execution for CI/CD
 */

/**
 * Common interface for execution modes
 */
export interface ExecutionMode {
  /**
   * Run the mode
   * @param actionName - Optional action name to run directly
   */
  run(actionName?: string): Promise<void>
}

/**
 * Output mode based on environment detection
 */
export type OutputMode = 'interactive' | 'plain'
