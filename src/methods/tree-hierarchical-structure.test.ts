import { describe, it, expect } from 'vitest'
import {
  organizeTestsBySuite,
  traverseTree,
  findSuiteByName,
  findTestByName,
  flattenTree,
  getAllTests,
  getSuiteStats,
  type TreeNode,
  type TreeTest,
  type TreeOptions,
} from './tree-hierarchical-structure.js'
import type { Test } from '../../types/ctrf.js'

describe('Tree Structure Functions', () => {
  const createTest = (
    name: string,
    status: 'passed' | 'failed' | 'skipped' | 'pending' | 'other',
    duration: number,
    suite?: string[],
    flaky?: boolean,
    id?: string
  ): Test => ({
    id,
    name,
    status,
    duration,
    suite,
    flaky,
  })

  describe('organizeTestsBySuite', () => {
    it('should create a tree structure from tests with array suite paths', () => {
      const tests: Test[] = [
        createTest(
          'should login successfully',
          'passed',
          150,
          ['Authentication', 'Login'],
          false,
          'test-1'
        ),
        createTest(
          'should logout successfully',
          'passed',
          100,
          ['Authentication', 'Logout'],
          false,
          'test-2'
        ),
        createTest(
          'should handle invalid credentials',
          'failed',
          200,
          ['Authentication', 'Login'],
          false,
          'test-3'
        ),
        createTest(
          'should validate user permissions',
          'passed',
          120,
          ['Authorization', 'Permissions'],
          false,
          'test-4'
        ),
      ]

      const tree = organizeTestsBySuite(tests)

      expect(tree.roots).toHaveLength(2)

      const authSuite = tree.roots.find(r => r.name === 'Authentication')
      expect(authSuite).toBeDefined()
      expect(authSuite?.suites).toHaveLength(2) // Login, Logout
      expect(authSuite?.summary!.tests).toBe(3)
      expect(authSuite?.summary!.passed).toBe(2)
      expect(authSuite?.summary!.failed).toBe(1)
      expect(authSuite?.summary!.duration).toBe(450)
      expect(authSuite?.status).toBe('failed') // Has failed tests
      expect(authSuite?.duration).toBe(450)

      const loginSuite = authSuite?.suites?.find(s => s.name === 'Login')
      expect(loginSuite).toBeDefined()
      expect(loginSuite?.tests).toHaveLength(2)
      expect(loginSuite?.summary!.tests).toBe(2)
      expect(loginSuite?.summary!.passed).toBe(1)
      expect(loginSuite?.summary!.failed).toBe(1)

      const authzSuite = tree.roots.find(r => r.name === 'Authorization')
      expect(authzSuite).toBeDefined()
      expect(authzSuite?.suites).toHaveLength(1) // Permissions
      expect(authzSuite?.summary!.tests).toBe(1)
      expect(authzSuite?.summary!.passed).toBe(1)
      expect(authzSuite?.status).toBe('passed') // All tests passed
    })

    it('should handle tests with array suite paths', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1', 'SubSuite1']),
        createTest('test2', 'failed', 200, ['Suite1', 'SubSuite2']),
        createTest('test3', 'passed', 150, ['Suite2']),
      ]

      const tree = organizeTestsBySuite(tests)

      expect(tree.roots).toHaveLength(2)

      const suite1 = tree.roots.find(r => r.name === 'Suite1')
      expect(suite1?.suites).toHaveLength(2)

      const suite2 = tree.roots.find(r => r.name === 'Suite2')
      expect(suite2?.tests).toHaveLength(1)
    })

    it('should handle tests without suite paths', () => {
      const tests: Test[] = [
        createTest(
          'standalone test 1',
          'passed',
          100,
          undefined,
          false,
          'test-1'
        ),
        createTest(
          'standalone test 2',
          'failed',
          200,
          undefined,
          false,
          'test-2'
        ),
        createTest('suite test', 'passed', 150, ['Suite1'], false, 'test-3'),
      ]

      const tree = organizeTestsBySuite(tests)

      expect(tree.roots).toHaveLength(3) // 2 standalone tests + "Suite1"

      const standalone1 = tree.roots.find(r => r.name === 'standalone test 1')
      expect(standalone1).toBeDefined()
      expect(standalone1?.tests).toHaveLength(1)
      expect(standalone1?.tests[0].name).toBe('standalone test 1')

      const standalone2 = tree.roots.find(r => r.name === 'standalone test 2')
      expect(standalone2).toBeDefined()
      expect(standalone2?.tests[0].name).toBe('standalone test 2')

      const suite1 = tree.roots.find(r => r.name === 'Suite1')
      expect(suite1).toBeDefined()
      expect(suite1?.tests).toHaveLength(1)
    })

    it('should handle flaky test statistics correctly', () => {
      const tests: Test[] = [
        createTest('flaky test', 'passed', 100, ['Suite1'], true, 'test-1'),
        createTest('normal test', 'passed', 100, ['Suite1'], false, 'test-2'),
        createTest('another flaky', 'failed', 200, ['Suite1'], true, 'test-3'),
      ]

      const tree = organizeTestsBySuite(tests)

      const suite1 = tree.roots.find(r => r.name === 'Suite1')
      expect(suite1?.summary!.tests).toBe(3)
      expect(suite1?.summary!.flaky).toBe(2) // Two tests marked as flaky
      expect(suite1?.summary!.passed).toBe(2)
      expect(suite1?.summary!.failed).toBe(1)

      expect(tree.summary!.tests).toBe(3)
      expect(tree.summary!.flaky).toBe(2) // Two flaky tests total
    })

    it('should handle flaky tests with retries correctly', () => {
      const tests: Test[] = [
        {
          ...createTest(
            'retry test',
            'passed',
            100,
            ['Suite1'],
            false,
            'test-1'
          ),
          retries: 2,
        },
        {
          ...createTest(
            'failed retry test',
            'failed',
            100,
            ['Suite1'],
            false,
            'test-2'
          ),
          retries: 1,
        },
        createTest('normal test', 'passed', 100, ['Suite1'], false, 'test-3'),
      ]

      const tree = organizeTestsBySuite(tests)

      const suite1 = tree.roots.find(r => r.name === 'Suite1')
      expect(suite1?.summary!.tests).toBe(3)
      expect(suite1?.summary!.flaky).toBe(1) // Only the passed test with retries
      expect(suite1?.summary!.passed).toBe(2)
      expect(suite1?.summary!.failed).toBe(1)

      expect(tree.summary!.flaky).toBe(1)
    })

    it('should handle malformed suite paths gracefully', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, [], false, 'test-1'),
        createTest('test2', 'passed', 100, ['', ''], false, 'test-2'),
        createTest('test3', 'passed', 100, ['Valid', 'Suite'], false, 'test-3'),
      ]

      const tree = organizeTestsBySuite(tests)

      expect(tree.roots).toHaveLength(3) // test1 + test2 + "Valid"

      const validSuite = tree.roots.find(r => r.name === 'Valid')
      expect(validSuite).toBeDefined()

      const test1Node = tree.roots.find(r => r.name === 'test1')
      expect(test1Node).toBeDefined()

      const test2Node = tree.roots.find(r => r.name === 'test2')
      expect(test2Node).toBeDefined()
    })

    it('should handle empty test array', () => {
      const tree = organizeTestsBySuite([])

      expect(tree.roots).toHaveLength(0)
      expect(tree.summary!.tests).toBe(0)
    })

    it('should disable summary when includeSummary is false', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1'], false, 'test-1'),
        createTest('test2', 'failed', 200, ['Suite1'], false, 'test-2'),
      ]

      const options: TreeOptions = { includeSummary: false }
      const tree = organizeTestsBySuite(tests, options)

      expect(tree.summary).toBeUndefined()

      const suite1 = tree.roots.find(r => r.name === 'Suite1')
      expect(suite1).toBeDefined()

      expect(suite1?.summary).toBeUndefined()

      expect(suite1?.status).toBe('other')
      expect(suite1?.duration).toBe(0)
    })

    it('should calculate overall statistics correctly', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1'], false, 'test-1'),
        createTest('test2', 'failed', 200, ['Suite1'], false, 'test-2'),
        createTest('test3', 'skipped', 50, ['Suite2'], false, 'test-3'),
        createTest('test4', 'pending', 0, ['Suite2'], false, 'test-4'),
        createTest('test5', 'other', 25, ['Suite3'], false, 'test-5'),
      ]

      const tree = organizeTestsBySuite(tests)

      expect(tree.summary).toBeDefined()
      expect(tree.summary!.tests).toBe(5)
      expect(tree.summary!.passed).toBe(1)
      expect(tree.summary!.failed).toBe(1)
      expect(tree.summary!.skipped).toBe(1)
      expect(tree.summary!.pending).toBe(1)
      expect(tree.summary!.other).toBe(1)
      expect(tree.summary!.duration).toBe(375)
    })

    it('should handle deep nesting correctly', () => {
      const tests: Test[] = [
        createTest('deep test', 'passed', 100, [
          'Level1',
          'Level2',
          'Level3',
          'Level4',
          'Level5',
        ]),
      ]

      const tree = organizeTestsBySuite(tests)

      expect(tree.roots).toHaveLength(1)

      let current = tree.roots[0]
      expect(current.name).toBe('Level1')

      for (let i = 2; i <= 5; i++) {
        expect(current.suites).toHaveLength(1)
        current = current.suites![0]
        expect(current.name).toBe(`Level${i}`)
      }

      expect(current.tests).toHaveLength(1)
      expect(current.tests![0].name).toBe('deep test')
    })
  })

  describe('traverseTree', () => {
    it('should traverse all nodes in the correct order', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1', 'SubSuite1']),
        createTest('test2', 'passed', 100, ['Suite1', 'SubSuite2']),
        createTest('test3', 'passed', 100, ['Suite2']),
      ]

      const tree = organizeTestsBySuite(tests)
      const visitedNodes: Array<{ name: string; depth: number }> = []

      traverseTree(tree.roots, (node, depth) => {
        visitedNodes.push({ name: node.name, depth })
      })

      expect(visitedNodes).toContainEqual({ name: 'Suite1', depth: 0 })
      expect(visitedNodes).toContainEqual({ name: 'SubSuite1', depth: 1 })
      expect(visitedNodes).toContainEqual({ name: 'test1', depth: 2 })
      expect(visitedNodes).toContainEqual({ name: 'Suite2', depth: 0 })
      expect(visitedNodes).toContainEqual({ name: 'test3', depth: 1 })
    })
  })

  describe('findSuiteByName', () => {
    it('should find suite by name in root', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1'], false, 'test-1'),
        createTest('test2', 'passed', 100, ['Suite2'], false, 'test-2'),
      ]

      const tree = organizeTestsBySuite(tests)
      const found = findSuiteByName(tree.roots, 'Suite1')

      expect(found).toBeDefined()
      expect(found?.name).toBe('Suite1')
    })

    it('should find nested suite by name', () => {
      const tests: Test[] = [
        createTest(
          'test1',
          'passed',
          100,
          ['Parent', 'Child', 'Grandchild'],
          false,
          'test-1'
        ),
      ]

      const tree = organizeTestsBySuite(tests)
      const found = findSuiteByName(tree.roots, 'Grandchild')

      expect(found).toBeDefined()
      expect(found?.name).toBe('Grandchild')
    })

    it('should return undefined for non-existent suite', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1'], false, 'test-1'),
      ]

      const tree = organizeTestsBySuite(tests)
      const found = findSuiteByName(tree.roots, 'NonExistent')

      expect(found).toBeUndefined()
    })
  })

  describe('findTestByName', () => {
    it('should find test by name in suite', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1'], false, 'test-1'),
        createTest('test2', 'passed', 100, ['Suite1'], false, 'test-2'),
      ]

      const tree = organizeTestsBySuite(tests)
      const found = findTestByName(tree.roots, 'test1')

      expect(found).toBeDefined()
      expect(found?.name).toBe('test1')
    })

    it('should find test by name in nested suite', () => {
      const tests: Test[] = [
        createTest(
          'nested-test',
          'passed',
          100,
          ['Parent', 'Child'],
          false,
          'nested-test'
        ),
      ]

      const tree = organizeTestsBySuite(tests)
      const found = findTestByName(tree.roots, 'nested-test')

      expect(found).toBeDefined()
      expect(found?.name).toBe('nested-test')
    })

    it('should return undefined for non-existent test', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1'], false, 'test-1'),
      ]

      const tree = organizeTestsBySuite(tests)
      const found = findTestByName(tree.roots, 'non-existent-test')

      expect(found).toBeUndefined()
    })
  })

  describe('flattenTree', () => {
    it('should flatten tree structure with correct depth information', () => {
      const tests: Test[] = [
        createTest('test1', 'passed', 100, ['Suite1', 'SubSuite1']),
        createTest('test2', 'passed', 100, ['Suite1']),
        createTest('standalone', 'passed', 100),
      ]

      const tree = organizeTestsBySuite(tests)
      const flattened = flattenTree(tree.roots)

      expect(flattened.length).toBeGreaterThan(0)

      const suite1 = flattened.find(item => item.node.name === 'Suite1')
      expect(suite1?.depth).toBe(0)

      const subSuite1 = flattened.find(item => item.node.name === 'SubSuite1')
      expect(subSuite1?.depth).toBe(1)

      const test1 = flattened.find(item => item.node.name === 'test1')
      expect(test1?.depth).toBe(2)

      const standalone = flattened.find(item => item.node.name === 'standalone')
      expect(standalone?.depth).toBe(0)
    })
  })

  describe('Real-world test data compatibility', () => {
    it('should work with CTRF array suite format', () => {
      const tests: Test[] = [
        createTest(
          'run-insights utility functions isTestFlaky should return true for explicitly flaky tests',
          'passed',
          1,
          [
            'run-insights.test.ts',
            'run-insights utility functions',
            'isTestFlaky',
          ]
        ),
        createTest(
          'enrichReportWithInsights - Main API basic functionality should enrich a report with run-level insights when no previous reports',
          'passed',
          1,
          [
            'run-insights.test.ts',
            'enrichReportWithInsights - Main API',
            'basic functionality',
          ]
        ),
        createTest(
          'read-reports readSingleReport should read and parse a valid CTRF report file',
          'passed',
          1,
          ['read-reports.test.ts', 'read-reports', 'readSingleReport']
        ),
      ]

      const tree = organizeTestsBySuite(tests)

      expect(tree.roots).toHaveLength(2) // run-insights.test.ts and read-reports.test.ts

      const runInsightsFile = tree.roots.find(
        r => r.name === 'run-insights.test.ts'
      )
      expect(runInsightsFile?.suites).toHaveLength(2) // "run-insights utility functions" and "enrichReportWithInsights - Main API"

      const utilityFunctions = runInsightsFile?.suites?.find(
        s => s.name === 'run-insights utility functions'
      )
      expect(utilityFunctions?.suites).toHaveLength(1) // "isTestFlaky"

      const isTestFlaky = utilityFunctions?.suites?.find(
        s => s.name === 'isTestFlaky'
      )
      expect(isTestFlaky?.tests).toHaveLength(1)

      const readReportsFile = tree.roots.find(
        r => r.name === 'read-reports.test.ts'
      )
      expect(readReportsFile?.suites).toHaveLength(1) // "read-reports"
    })
  })
})
