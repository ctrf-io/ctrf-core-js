import { ctrfRuntime } from './runtime.js'

/**
 * Lightweight helper API for CTRF runtime operations
 *
 * Provides simple functions for adding metadata during test execution.
 * Framework-agnostic and designed to work with any test runner.
 *
 * @example
 * ```typescript
 * import { ctrf } from 'ctrf'
 *
 * // In your test
 * await ctrf.test.addExtra('env', 'staging')
 * await ctrf.test.addExtra('buildNumber', '2025.10.001')
 * ```
 */
export const ctrf = {
  /**
   * Test-related operations
   */
  test: {
    /**
     * Adds extra metadata to the current test
     * @param key The metadata key
     * @param value The metadata value
     * @example
     * ```typescript
     * await ctrf.test.addExtra('env', 'staging')
     * await ctrf.test.addExtra('buildNumber', '2025.10.001')
     * await ctrf.test.addExtra('browser', 'chromium')
     * ```
     */
    addExtra: async (key: string, value: unknown): Promise<void> => {
      ctrfRuntime.addExtra(key, value)
    },

    /**
     * Gets the current test context (read-only)
     * @returns The current test context or undefined
     * @example
     * ```typescript
     * const context = await ctrf.test.getCurrentContext()
     * if (context) {
     *   console.log('Current test:', context.name)
     * }
     * ```
     */
    getCurrentContext: async () => {
      return ctrfRuntime.getCurrentContext()
    },

    /**
     * Checks if there's an active test context
     * @returns true if there's an active context
     * @example
     * ```typescript
     * if (await ctrf.test.hasActiveContext()) {
     *   await ctrf.test.addExtra('contextFound', true)
     * }
     * ```
     */
    hasActiveContext: async (): Promise<boolean> => {
      return ctrfRuntime.hasActiveContext()
    },
  },

  // Future: ctrf.environment.addExtra, ctrf.report.addExtra, etc.
}

/**
 * Direct access to the runtime for advanced usage
 * Most users should use the `ctrf` convenience API instead
 */
export const runtime = ctrfRuntime
