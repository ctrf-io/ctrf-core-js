/**
 * Tests for CTRF Runtime Core Functionality
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { CtrfRuntime, ctrfRuntime, mergeTestData } from './runtime.js'
import { ctrf } from './api.js'

describe('CTRF Runtime Core', () => {
  let runtime: CtrfRuntime

  beforeEach(() => {
    runtime = new CtrfRuntime()
  })

  describe('Core API Methods', () => {
    test('startTestContext should create active context', () => {
      expect(runtime.hasActiveContext()).toBe(false)

      runtime.startTestContext('My Test')
      expect(runtime.hasActiveContext()).toBe(true)
      expect(runtime.getCurrentContext()?.name).toBe('My Test')
    })

    test('startTestContext should accept optional identification data', () => {
      runtime.startTestContext('My Test', {
        suite: ['unit', 'auth'],
        filePath: '/tests/auth.test.ts',
        id: 'test-123',
      })

      const context = runtime.getCurrentContext()
      expect(context).toEqual({
        name: 'My Test',
        suite: ['unit', 'auth'],
        filePath: '/tests/auth.test.ts',
        id: 'test-123',
        extra: {},
      })
    })

    test('addExtra should add metadata to current test', () => {
      runtime.startTestContext('Test')
      runtime.addExtra('env', 'staging')
      runtime.addExtra('buildNumber', '2025.10.001')

      const context = runtime.getCurrentContext()
      expect(context?.extra).toEqual({
        env: 'staging',
        buildNumber: '2025.10.001',
      })
    })

    test('endTestContext should return test context data', () => {
      runtime.startTestContext('Test 1', {
        suite: ['integration'],
        filePath: '/tests/integration.test.ts',
      })
      runtime.addExtra('env', 'test')

      const result = runtime.endTestContext()

      expect(result).toEqual({
        name: 'Test 1',
        suite: ['integration'],
        filePath: '/tests/integration.test.ts',
        extra: { env: 'test' },
      })
    })

    test('endTestContext should return undefined when no active context', () => {
      const result = runtime.endTestContext()
      expect(result).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    test('should throw error when no active context', () => {
      expect(() => runtime.addExtra('key', 'value')).toThrow(
        'No active CTRF test context'
      )
    })
  })

  describe('AsyncLocalStorage Context Isolation', () => {
    test('should maintain separate contexts in concurrent scenarios', async () => {
      const results: string[] = []

      const promise1 = new Promise<void>(resolve => {
        runtime.startTestContext('Test 1')
        runtime.addExtra('testId', 1)
        setTimeout(() => {
          results.push(runtime.getCurrentContext()?.name || 'unknown')
          resolve()
        }, 10)
      })

      const promise2 = new Promise<void>(resolve => {
        runtime.startTestContext('Test 2')
        runtime.addExtra('testId', 2)
        setTimeout(() => {
          results.push(runtime.getCurrentContext()?.name || 'unknown')
          resolve()
        }, 5)
      })

      await Promise.all([promise1, promise2])

      // Both contexts should have maintained their identity
      expect(results).toEqual(['Test 2', 'Test 1'])
    })
  })

  describe('Global Runtime Instance', () => {
    test('should provide global ctrfRuntime instance', () => {
      expect(ctrfRuntime).toBeInstanceOf(CtrfRuntime)
    })
  })
})

describe('CTRF Helper API', () => {
  describe('ctrf helper functions', () => {
    test('ctrf.test.addExtra should work with active context', async () => {
      ctrfRuntime.startTestContext('Helper Test')

      await ctrf.test.addExtra('env', 'staging')
      await ctrf.test.addExtra('buildNumber', '123')

      const context = await ctrf.test.getCurrentContext()
      expect(context?.extra).toEqual({
        env: 'staging',
        buildNumber: '123',
      })
    })

    test('ctrf.test.hasActiveContext should return correct state', async () => {
      expect(await ctrf.test.hasActiveContext()).toBe(false)

      ctrfRuntime.startTestContext('Test')
      expect(await ctrf.test.hasActiveContext()).toBe(true)
    })

    test('ctrf.test.getCurrentContext should return current context', async () => {
      expect(await ctrf.test.getCurrentContext()).toBeUndefined()

      ctrfRuntime.startTestContext('Context Test')
      const context = await ctrf.test.getCurrentContext()
      expect(context?.name).toBe('Context Test')
    })
  })
})

describe('mergeTestData Utility', () => {
  test('should return reporter test unchanged when no runtime context', () => {
    const reporterTest = { name: 'Test', status: 'passed', duration: 100 }
    const result = mergeTestData(reporterTest, undefined)
    expect(result).toEqual(reporterTest)
  })

  test('should merge extra data with runtime extra as base', () => {
    const reporterTest = {
      name: 'Test',
      status: 'passed',
      duration: 100,
      extra: { reporter: 'data', conflict: 'reporter-wins' },
    }
    const runtimeContext = {
      name: 'Runtime Test',
      extra: { runtime: 'metadata', conflict: 'runtime-value' },
    }

    const result = mergeTestData(reporterTest, runtimeContext)

    expect(result).toEqual({
      name: 'Test',
      status: 'passed',
      duration: 100,
      extra: {
        runtime: 'metadata', // From runtime
        conflict: 'reporter-wins', // Reporter wins conflicts
        reporter: 'data', // From reporter
      },
    })
  })

  test('should use runtime extra when reporter has no extra', () => {
    const reporterTest = { name: 'Test', status: 'passed', duration: 100 }
    const runtimeContext = {
      name: 'Runtime Test',
      extra: { runtime: 'metadata', env: 'test' },
    }

    const result = mergeTestData(reporterTest, runtimeContext)

    expect(result).toEqual({
      name: 'Test',
      status: 'passed',
      duration: 100,
      extra: {
        runtime: 'metadata',
        env: 'test',
      },
    })
  })

  test('should handle empty runtime extra', () => {
    const reporterTest = {
      name: 'Test',
      status: 'passed',
      extra: { reporter: 'data' },
    }
    const runtimeContext = { name: 'Runtime Test', extra: {} }

    const result = mergeTestData(reporterTest, runtimeContext)

    expect(result).toEqual({
      name: 'Test',
      status: 'passed',
      extra: { reporter: 'data' },
    })
  })
})
