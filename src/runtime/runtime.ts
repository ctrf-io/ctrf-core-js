import { AsyncLocalStorage } from 'node:async_hooks'

/**
 * Test context data structure returned by runtime operations.
 *
 * Fields are provided for enrichment only. Reporter implementations must
 * treat their framework data as authoritative for all non-extra fields.
 *
 * @example
 * ```typescript
 * const context: TestContext = {
 *   name: 'should authenticate user',
 *   suite: ['auth', 'integration'],
 *   filePath: '/tests/auth.spec.ts',
 *   id: 'auth-001',
 *   extra: { priority: 'high', tags: ['smoke'] }
 * }
 * ```
 */
export interface TestContext {
  /** Test identifier - framework name takes precedence */
  name: string
  /** Suite hierarchy array - framework suite takes precedence */
  suite?: string[]
  /** Source file path - framework filePath takes precedence */
  filePath?: string
  /** Unique test identifier for cross-referencing */
  id?: string
  /** User-defined metadata for report enrichment */
  extra?: Record<string, unknown>
}

/**
 * AsyncLocalStorage-based test context manager.
 *
 * Provides isolated execution contexts for concurrent test scenarios using
 * Node.js AsyncLocalStorage. Context data persists across async boundaries
 * within the same logical test execution.
 *
 * @example
 * ```typescript
 * const runtime = new CtrfRuntime()
 * runtime.startTestContext('test-name')
 * runtime.addExtra('key', 'value')
 * const context = runtime.endTestContext()
 * ```
 */
export class CtrfRuntime {
  private storage = new AsyncLocalStorage<TestContext>()

  /**
   * Creates new AsyncLocalStorage context and enters it synchronously.
   *
   * @param name - Test identifier string
   * @param options - Optional context metadata
   * @param options.suite - Suite hierarchy array
   * @param options.filePath - Absolute path to test file
   * @param options.id - Unique test identifier
   *
   * @throws None - always succeeds
   *
   * @example
   * ```typescript
   * runtime.startTestContext('user login test', {
   *   suite: ['auth', 'integration'],
   *   filePath: '/tests/auth.spec.ts',
   *   id: 'declarative-uuid'
   * })
   * ```
   */
  startTestContext(
    name: string,
    options?: {
      suite?: string[]
      filePath?: string
      id?: string
    }
  ): void {
    const testData: TestContext = {
      name,
      extra: {},
      ...(options?.suite && { suite: options.suite }),
      ...(options?.filePath && { filePath: options.filePath }),
      ...(options?.id && { id: options.id }),
    }

    this.storage.enterWith(testData)
  }

  /**
   * Adds key-value pair to current context's extra object.
   *
   * Mutates the active context's extra property. Creates extra object if
   * it doesn't exist. All values must be JSON-serializable.
   *
   * @param key - Property key for metadata
   * @param value - JSON-serializable value
   *
   * @throws {Error} When no active AsyncLocalStorage context exists
   *
   * @example
   * ```typescript
   * runtime.addExtra('priority', 'high')
   * runtime.addExtra('tags', ['smoke', 'regression'])
   * runtime.addExtra('metadata', { browser: 'chrome', viewport: '1920x1080' })
   * ```
   */
  addExtra(key: string, value: unknown): void {
    const ctx = this.storage.getStore()
    if (!ctx) {
      throw new Error(
        'No active CTRF test context. Call startTestContext() first.'
      )
    }

    if (!ctx.extra) {
      ctx.extra = {}
    }

    ctx.extra[key] = value
  }

  /**
   * Returns shallow copy of current context and exits AsyncLocalStorage scope.
   *
   * Context data is intended for enrichment only. Reporter implementations
   * should merge only the `extra` field with their test data.
   *
   * @returns Shallow copy of TestContext or undefined if no active context
   *
   * @example
   * ```typescript
   * const context = runtime.endTestContext()
   * if (context) {
   *   const enriched = { ...reporterData, extra: { ...context.extra, ...reporterData.extra } }
   * }
   * ```
   */
  endTestContext(): TestContext | undefined {
    const ctx = this.storage.getStore()
    if (!ctx) {
      return undefined
    }

    // Return a copy of the context data for the reporter to use
    return { ...ctx }
  }

  /**
   * Returns current AsyncLocalStorage context without modifying it.
   *
   * @returns Current TestContext or undefined if no active context
   *
   * @example
   * ```typescript
   * const current = runtime.getCurrentContext()
   * if (current?.extra?.skipCleanup) {
   *   // conditional logic based on context
   * }
   * ```
   */
  getCurrentContext(): TestContext | undefined {
    return this.storage.getStore()
  }

  /**
   * Checks for active AsyncLocalStorage context existence.
   *
   * @returns true if context exists, false otherwise
   *
   * @example
   * ```typescript
   * if (runtime.hasActiveContext()) {
   *   runtime.addExtra('key', 'value')
   * }
   * ```
   */
  hasActiveContext(): boolean {
    return this.storage.getStore() !== undefined
  }
}

/**
 * Singleton CtrfRuntime instance for global access.
 *
 * @example
 * ```typescript
 * import { ctrfRuntime } from 'ctrf'
 * ctrfRuntime.startTestContext('test')
 * ```
 */
export const ctrfRuntime = new CtrfRuntime()

/**
 * Merges reporter test data with runtime context metadata.
 *
 * Reporter data takes precedence. Runtime context enriches only the `extra`
 * field. In case of key conflicts in `extra`, reporter values win.
 *
 * @param reporterTest - Test data from framework reporter (source of truth)
 * @param runtimeContext - Context from ctrfRuntime.endTestContext()
 * @returns Merged test object with enriched extra metadata
 *
 * @example
 * ```typescript
 * const merged = mergeTestData(
 *   { name: 'test', status: 'passed', extra: { framework: 'data' } },
 *   { name: 'test', extra: { runtime: 'metadata', framework: 'ignored' } }
 * )
 * // Result: { name: 'test', status: 'passed', extra: { runtime: 'metadata', framework: 'data' } }
 * ```
 */
export function mergeTestData<T extends Record<string, any>>(
  reporterTest: T,
  runtimeContext: TestContext | undefined
): T {
  if (!runtimeContext?.extra) {
    return reporterTest
  }

  return {
    ...reporterTest,
    extra: {
      ...(runtimeContext.extra || {}), // Runtime extra as base
      ...(reporterTest.extra || {}), // Reporter extra wins conflicts
    },
  }
}
