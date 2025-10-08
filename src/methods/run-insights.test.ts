import { describe, it, expect } from 'vitest'
import {
  isTestFlaky,
  formatAsPercentage,
  formatInsightsMetricAsPercentage,
  enrichReportWithInsights,
} from './run-insights'

import { Report, Test, InsightsMetric } from '../../types/ctrf.js'
import { CTRF_REPORT_FORMAT, CTRF_SPEC_VERSION } from '../constants'

const createMockTest = (overrides: Partial<Test> = {}): Test => ({
  name: 'test-name',
  status: 'passed',
  duration: 100,
  ...overrides,
})

const createMockReport = (
  tests: Test[] = [],
  overrides: Partial<Report> = {}
): Report => ({
  reportFormat: CTRF_REPORT_FORMAT,
  specVersion: CTRF_SPEC_VERSION,
  results: {
    tool: { name: 'jest' },
    summary: {
      tests: tests.length,
      passed: tests.filter(t => t.status === 'passed').length,
      failed: tests.filter(t => t.status === 'failed').length,
      skipped: tests.filter(t => t.status === 'skipped').length,
      pending: tests.filter(t => t.status === 'pending').length,
      other: tests.filter(t => t.status === 'other').length,
      flaky: tests.filter(t => t.flaky === true).length,
      start: Date.now(),
      stop: Date.now() + 1000,
      duration: 1000,
    },
    tests,
  },
  ...overrides,
})

describe('run-insights utility functions', () => {
  describe('isTestFlaky', () => {
    it('should return true for explicitly flaky tests', () => {
      const test = createMockTest({ flaky: true })
      expect(isTestFlaky(test)).toBe(true)
    })

    it('should return true for passed tests with retries', () => {
      const test = createMockTest({
        status: 'passed',
        retries: 2,
      })
      expect(isTestFlaky(test)).toBe(true)
    })

    it('should return false for failed tests with retries', () => {
      const test = createMockTest({
        status: 'failed',
        retries: 2,
      })
      expect(isTestFlaky(test)).toBe(false)
    })

    it('should return false for passed tests without retries', () => {
      const test = createMockTest({
        status: 'passed',
        retries: 0,
      })
      expect(isTestFlaky(test)).toBe(false)
    })

    it('should return false for passed tests without retries property', () => {
      const test = createMockTest({ status: 'passed' })
      expect(isTestFlaky(test)).toBe(false)
    })
  })

  describe('formatAsPercentage', () => {
    it('should format ratio as percentage with default 2 decimals', () => {
      expect(formatAsPercentage(0.25)).toBe('25.00%')
      expect(formatAsPercentage(0.5)).toBe('50.00%')
      expect(formatAsPercentage(0.75)).toBe('75.00%')
      expect(formatAsPercentage(1)).toBe('100.00%')
    })

    it('should format ratio as percentage with custom decimals', () => {
      expect(formatAsPercentage(0.25, 1)).toBe('25.0%')
      expect(formatAsPercentage(0.25, 0)).toBe('25%')
      expect(formatAsPercentage(0.25, 3)).toBe('25.000%')
    })

    it('should handle edge cases', () => {
      expect(formatAsPercentage(0)).toBe('0.00%')
      expect(formatAsPercentage(0.00001)).toBe('0.00%')
      expect(formatAsPercentage(0.999)).toBe('99.90%')
    })
  })

  describe('formatInsightsMetricAsPercentage', () => {
    it('should format all metric values as percentages', () => {
      const metric: InsightsMetric = {
        current: 0.25,
        baseline: 0.2,
        change: 0.05,
      }

      const result = formatInsightsMetricAsPercentage(metric)

      expect(result).toEqual({
        current: '25.00%',
        baseline: '20.00%',
        change: '+5.00%',
      })
    })

    it('should handle negative change values', () => {
      const metric: InsightsMetric = {
        current: 0.15,
        baseline: 0.2,
        change: -0.05,
      }

      const result = formatInsightsMetricAsPercentage(metric)

      expect(result).toEqual({
        current: '15.00%',
        baseline: '20.00%',
        change: '-5.00%',
      })
    })

    it('should handle zero change values', () => {
      const metric: InsightsMetric = {
        current: 0.2,
        baseline: 0.2,
        change: 0,
      }

      const result = formatInsightsMetricAsPercentage(metric)

      expect(result).toEqual({
        current: '20.00%',
        baseline: '20.00%',
        change: '+0.00%',
      })
    })
  })
})

describe('enrichReportWithInsights - Main API', () => {
  describe('basic functionality', () => {
    it('should enrich a report with run-level insights when no baseline reports', () => {
      const tests = [
        createMockTest({ name: 'test1', status: 'passed', duration: 100 }),
        createMockTest({ name: 'test2', status: 'failed', duration: 200 }),
        createMockTest({
          name: 'test3',
          status: 'passed',
          retries: 1,
          flaky: true,
          duration: 150,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      expect(result.insights).toBeDefined()
      expect(result.insights!.flakyRate?.current).toBeGreaterThan(0)
      expect(result.insights!.failRate?.current).toBeGreaterThan(0)
      expect(result.insights!.averageTestDuration?.current).toBe(150) // (100+200+150)/3
      expect(result.insights!.runsAnalyzed).toBe(1)

      expect(result.insights!.flakyRate?.baseline).toBe(0)
      expect(result.insights!.flakyRate?.change).toBe(0)
    })

    it('should add test-level insights to each test', () => {
      const tests = [
        createMockTest({ name: 'test1', status: 'passed', duration: 100 }),
        createMockTest({ name: 'test2', status: 'failed', duration: 200 }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      expect(result.results.tests[0].insights).toBeDefined()
      expect(result.results.tests[1].insights).toBeDefined()

      expect(result.results.tests[0].insights!.failRate?.current).toBe(0)
      expect(result.results.tests[1].insights!.failRate?.current).toBe(1)
      expect(
        result.results.tests[0].insights!.averageTestDuration?.current
      ).toBe(100)
      expect(
        result.results.tests[1].insights!.averageTestDuration?.current
      ).toBe(200)
    })
  })

  describe('baseline comparison functionality', () => {
    it('should compare against previous report by default', () => {
      const currentTests = [
        createMockTest({ name: 'test1', status: 'passed', duration: 100 }),
        createMockTest({ name: 'test2', status: 'passed', duration: 200 }),
      ]
      const previousTests = [
        createMockTest({ name: 'test1', status: 'failed', duration: 150 }),
        createMockTest({ name: 'test2', status: 'failed', duration: 250 }),
      ]

      const currentReport = createMockReport(currentTests, {
        results: {
          ...createMockReport(currentTests).results,
          summary: {
            ...createMockReport(currentTests).results.summary,
            start: 2000,
          },
        },
      })
      const previousReport = createMockReport(previousTests, {
        results: {
          ...createMockReport(previousTests).results,
          summary: {
            ...createMockReport(previousTests).results.summary,
            start: 1000,
          },
        },
      })

      const result = enrichReportWithInsights(
        currentReport,
        [previousReport],
        previousReport
      )

      expect(result.insights).toBeDefined()
      expect(result.insights!.failRate?.current).toBe(0.5) // Overall: 2 passed + 2 failed = 50% fail rate
      expect(result.insights!.failRate?.baseline).toBe(1) // Previous: all failed
      expect(result.insights!.failRate?.change).toBe(-0.5) // Improvement of 50%
      expect(result.insights!.runsAnalyzed).toBe(2)
    })

    it('should handle baseline by index', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })]
      const previous1Tests = [
        createMockTest({ name: 'test1', status: 'failed' }),
      ]
      const previous2Tests = [
        createMockTest({ name: 'test1', status: 'passed' }),
      ]

      const currentReport = createMockReport(currentTests)
      const previousReport1 = createMockReport(previous1Tests)
      const previousReport2 = createMockReport(previous2Tests)

      // Use previousReport2 as baseline (second previous report)
      const result = enrichReportWithInsights(
        currentReport,
        [previousReport1, previousReport2],
        previousReport2
      )

      expect(result.insights!.failRate?.current).toBe(0.3333) // 1 passed + 1 failed + 1 passed = 1/3 fail rate
      expect(result.insights!.failRate?.baseline).toBe(0) // previous2 had no failures
      expect(result.insights!.failRate?.change).toBe(0.3333)
    })

    it('should handle baseline by report ID', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })]
      const previousTests = [
        createMockTest({ name: 'test1', status: 'failed' }),
      ]

      const currentReport = createMockReport(currentTests)
      const previousReport = createMockReport(previousTests, {
        results: {
          ...createMockReport(previousTests).results,
          summary: {
            ...createMockReport(previousTests).results.summary,
            start: 12345,
          },
        },
      })

      const result = enrichReportWithInsights(
        currentReport,
        [previousReport],
        previousReport
      )

      expect(result.insights!.failRate?.current).toBe(0.5)
      expect(result.insights!.failRate?.baseline).toBe(1)
      expect(result.insights!.failRate?.change).toBe(-0.5)
    })

    it('should handle invalid baseline gracefully', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })]
      const previousTests = [
        createMockTest({ name: 'test1', status: 'failed' }),
      ]

      const currentReport = createMockReport(currentTests)
      const previousReport = createMockReport(previousTests)

      const invalidBaseline = createMockReport([], { results: null } as any)
      const result1 = enrichReportWithInsights(
        currentReport,
        [previousReport],
        invalidBaseline
      )
      expect(result1.insights!.failRate?.baseline).toBe(0)
      expect(result1.insights!.failRate?.change).toBe(0)

      const result2 = enrichReportWithInsights(currentReport, [previousReport])
      expect(result2.insights!.failRate?.baseline).toBe(0)
      expect(result2.insights!.failRate?.change).toBe(0)
    })
  })

  describe('added/removed tests tracking', () => {
    it.skip('should track tests added since baseline', () => {
      const currentTests = [
        createMockTest({ name: 'test1', status: 'passed' }),
        createMockTest({ name: 'test2', status: 'passed' }),
        createMockTest({ name: 'test3', status: 'passed' }),
      ]
      const previousTests = [
        createMockTest({ name: 'test1', status: 'passed' }),
      ]

      const currentReport = createMockReport(currentTests)
      const previousReport = createMockReport(previousTests)

      const result = enrichReportWithInsights(
        currentReport,
        [previousReport],
        previousReport
      )

      expect(result.insights!.extra!.testsAdded).toHaveLength(2)
      expect((result.insights!.extra!.testsAdded as any[])[0].name).toBe(
        'test2'
      )
      expect((result.insights!.extra!.testsAdded as any[])[1].name).toBe(
        'test3'
      )
    })

    it.skip('should track tests removed since baseline', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })]
      const previousTests = [
        createMockTest({ name: 'test1', status: 'passed' }),
        createMockTest({ name: 'test2', status: 'passed' }),
        createMockTest({ name: 'test3', status: 'passed' }),
      ]

      const currentReport = createMockReport(currentTests)
      const previousReport = createMockReport(previousTests)

      const result = enrichReportWithInsights(
        currentReport,
        [previousReport],
        previousReport
      )

      expect(result.insights!.extra!.testsRemoved).toHaveLength(2)
      expect((result.insights!.extra!.testsRemoved as any[])[0].name).toBe(
        'test2'
      )
      expect((result.insights!.extra!.testsRemoved as any[])[1].name).toBe(
        'test3'
      )
    })

    it.skip('should handle single report no added/removed tests', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })]

      const currentReport = createMockReport(currentTests)
      const result = enrichReportWithInsights(currentReport, [])

      expect(result.insights!.extra!.testsAdded).toBeUndefined()
      expect(result.insights!.extra!.testsRemoved).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle empty current report', () => {
      const currentReport = createMockReport([])
      const previousReport = createMockReport([createMockTest()])

      const result = enrichReportWithInsights(currentReport, [previousReport])

      expect(result.insights).toBeDefined()
      expect(result.insights!.failRate?.current).toBe(0)
      expect(result.insights!.averageTestDuration?.current).toBe(100)
    })

    it('should handle invalid current report', () => {
      const invalidReport = { results: null } as any

      const result = enrichReportWithInsights(invalidReport, [])

      expect(result).toBe(invalidReport)
    })

    it('should handle multiple previous reports', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })]
      const previous1Tests = [
        createMockTest({ name: 'test1', status: 'failed' }),
      ]
      const previous2Tests = [
        createMockTest({ name: 'test1', status: 'passed' }),
      ]
      const previous3Tests = [
        createMockTest({ name: 'test1', status: 'failed' }),
      ]

      const currentReport = createMockReport(currentTests)
      const previousReports = [
        createMockReport(previous1Tests),
        createMockReport(previous2Tests),
        createMockReport(previous3Tests),
      ]

      const result = enrichReportWithInsights(currentReport, previousReports)

      expect(result.insights!.runsAnalyzed).toBe(4)
      expect(result.insights!.failRate?.current).toBeDefined()
      expect(result.insights!.failRate?.baseline).toBeDefined()
    })
  })
})

describe('root insights', () => {
  describe('flakyRate calculation', () => {
    /**
     * Flaky Rate Definition:
     * The proportion of test attempts that initially failed but eventually passed after retries.
     *
     * Formula: flakyAttempts / relevantAttempts
     * Where:
     * - flakyAttempts = total retry attempts from tests that eventually passed
     * - relevantAttempts = total final results + flakyAttempts
     *
     * Key principle: Only tests that eventually pass can be considered flaky.
     * Tests that fail after all retries are consistently failing, not flaky.
     */

    it('should calculate 50% flaky rate for single flaky test that passed after 1 retry', () => {
      const tests = [
        createMockTest({
          name: 'test-that-failed-once-then-passed',
          status: 'passed', // Final status: passed
          retries: 1, // Initially failed 1 time, then passed
          flaky: true,
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      /*
       * Calculation breakdown:
       * - flakyAttempts = 1 (the initial failure that was retried)
       * - relevantAttempts = 1 final result + 1 flaky attempt = 2 total
       * - flakyRate = 1/2 = 0.5 (50%)
       */
      expect(result.insights!.flakyRate?.current).toBeCloseTo(0.5, 1)
    })

    it('should calculate 33.33% flaky rate when mixing flaky and stable tests', () => {
      const tests = [
        createMockTest({
          name: 'test-that-failed-once-then-passed',
          status: 'passed', // Final status: passed after retry
          retries: 1, // Initially failed 1 time
          flaky: true,
          duration: 100,
        }),
        createMockTest({
          name: 'test-that-passed-immediately',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      /*
       * Calculation breakdown:
       * - flakyAttempts = 1 (retry from the flaky test)
       * - relevantAttempts = 2 final results + 1 flaky attempt = 3 total
       * - flakyRate = 1/3 = 0.3333 (33.33%)
       *
       * This shows that 1 out of 3 total attempts was a flaky failure.
       */
      expect(result.insights!.flakyRate?.current).toBeCloseTo(0.3333, 4)
    })

    it('should exclude consistently failing test retries from flaky rate calculation', () => {
      const tests = [
        createMockTest({
          name: 'test-that-consistently-fails',
          status: 'failed', // Final status: failed (after all retries)
          retries: 2, // Failed 2 times, then failed again (total 3 failures)
          flaky: false, // NOT flaky because it never passed
          duration: 100,
        }),
        createMockTest({
          name: 'test-that-eventually-passed',
          status: 'passed', // Final status: passed
          retries: 1, // Failed 1 time, then passed
          flaky: true,
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      /*
       * Calculation breakdown:
       * - flakyAttempts = 1 (only the retry from the test that eventually passed)
       * - relevantAttempts = 2 final results + 1 flaky attempt = 3 total
       * - flakyRate = 1/3 = 0.3333 (33.33%)
       *
       * Key insight: The 2 retries from the consistently failing test are NOT included
       * in the flaky rate calculation because that test never passed (not flaky).
       * Only the retry from the test that eventually passed counts as a "flaky attempt".
       */
      expect(result.insights!.flakyRate?.current).toBeCloseTo(0.3333, 4)
    })

    it('should return 0% flaky rate when all tests pass without retries', () => {
      const tests = [
        createMockTest({
          name: 'test-that-passed-immediately-1',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 100,
        }),
        createMockTest({
          name: 'test-that-passed-immediately-2',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      /*
       * Calculation breakdown:
       * - flakyAttempts = 0 (no tests had retries)
       * - relevantAttempts = 2 final results + 0 flaky attempts = 2 total
       * - flakyRate = 0/2 = 0 (0%)
       */
      expect(result.insights!.flakyRate?.current).toBe(0)
    })

    it('should return 0% flaky rate when all tests consistently fail despite retries', () => {
      const tests = [
        createMockTest({
          name: 'test-that-failed-after-1-retry',
          status: 'failed', // Final status: failed
          retries: 1, // Tried once more, still failed
          duration: 100,
        }),
        createMockTest({
          name: 'test-that-failed-after-2-retries',
          status: 'failed', // Final status: failed
          retries: 2, // Tried twice more, still failed
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      /*
       * Calculation breakdown:
       * - flakyAttempts = 0 (no tests eventually passed, so no flaky attempts)
       * - relevantAttempts = 2 final results + 0 flaky attempts = 2 total
       * - flakyRate = 0/2 = 0 (0%)
       *
       * Key insight: Tests that fail after retries are consistently failing tests,
       * not flaky tests. Their retries don't count toward flakiness metrics.
       */
      expect(result.insights!.flakyRate?.current).toBe(0)
    })

    it('should handle passed test with multiple retries and stable test correctly', () => {
      const tests = [
        createMockTest({
          name: 'test-with-multiple-retries',
          status: 'passed', // Final status: passed
          retries: 3, // Failed 3 times, then passed
          flaky: true, // Explicitly mark as flaky to ensure it's detected
          duration: 100,
        }),
        createMockTest({
          name: 'test-that-passed-immediately',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      /*
       * Calculation breakdown:
       * - Test 1 (flaky): 4 total attempts (3 retries + 1 final), 3 flaky attempts
       * - Test 2 (normal): 1 total attempt, 0 flaky attempts
       * - Expected: totalAttempts = 5, totalAttemptsFlaky = 3, flaky rate = 3/5 = 0.6
       */
      expect(result.insights!.flakyRate?.current).toBeCloseTo(0.6, 4)
    })

    it('should calculate flaky rate correctly across multiple reports', () => {
      // Current report with mixed test results
      const currentTests = [
        createMockTest({
          name: 'test-a',
          status: 'passed', // Final status: passed
          retries: 1, // Failed 1 time, then passed
          flaky: true,
          duration: 100,
        }),
        createMockTest({
          name: 'test-b',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 100,
        }),
      ]

      // Previous report 1 with different flaky patterns
      const previousTests1 = [
        createMockTest({
          name: 'test-a',
          status: 'passed', // Final status: passed
          retries: 2, // Failed 2 times, then passed
          flaky: true,
          duration: 120,
        }),
        createMockTest({
          name: 'test-b',
          status: 'failed', // Final status: failed
          retries: 1, // Failed 1 time, then failed again (not flaky)
          duration: 90,
        }),
      ]

      // Previous report 2 with more tests
      const previousTests2 = [
        createMockTest({
          name: 'test-a',
          status: 'failed', // Final status: failed
          retries: 3, // Failed 3 times, then failed again (not flaky)
          duration: 110,
        }),
        createMockTest({
          name: 'test-b',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 95,
        }),
        createMockTest({
          name: 'test-c',
          status: 'passed', // Final status: passed
          retries: 1, // Failed 1 time, then passed
          flaky: true,
          duration: 105,
        }),
      ]

      const currentReport = createMockReport(currentTests, {
        results: {
          ...createMockReport(currentTests).results,
          summary: {
            ...createMockReport(currentTests).results.summary,
            start: 3000,
          },
        },
      })

      const previousReport1 = createMockReport(previousTests1, {
        results: {
          ...createMockReport(previousTests1).results,
          summary: {
            ...createMockReport(previousTests1).results.summary,
            start: 2000,
          },
        },
      })

      const previousReport2 = createMockReport(previousTests2, {
        results: {
          ...createMockReport(previousTests2).results,
          summary: {
            ...createMockReport(previousTests2).results.summary,
            start: 1000,
          },
        },
      })

      const result = enrichReportWithInsights(currentReport, [
        previousReport1,
        previousReport2,
      ])

      /*
       * Multi-report calculation breakdown:
       *
       * Current report:
       * - test-a: passed after 1 retry → 1 flaky attempt
       * - test-b: passed immediately → 0 flaky attempts
       * Current subtotal: 1 flaky attempt, 2 final results
       *
       * Previous report 1:
       * - test-a: passed after 2 retries → 2 flaky attempts
       * - test-b: failed after 1 retry → 0 flaky attempts (not flaky because failed)
       * Previous1 subtotal: 2 flaky attempts, 2 final results
       *
       * Previous report 2:
       * - test-a: failed after 3 retries → 0 flaky attempts (not flaky because failed)
       * - test-b: passed immediately → 0 flaky attempts
       * - test-c: passed after 1 retry → 1 flaky attempt
       * Previous2 subtotal: 1 flaky attempt, 3 final results
       *
       * Overall totals:
       * - totalFlakyAttempts = 1 + 2 + 1 = 4
       * - totalFinalResults = 2 + 2 + 3 = 7
       * - relevantAttempts = 7 + 4 = 11
       * - flakyRate = 4/11 = 0.3636 (36.36%)
       *
       */
      expect(result.insights!.flakyRate?.current).toBeCloseTo(0.3636, 4)
      expect(result.insights!.runsAnalyzed).toBe(3)
    })
  })
})

describe('test insights', () => {
  describe('flakyRate calculation single report', () => {
    /**
     * Per-Test Flaky Rate Definition:
     * For individual tests, the flaky rate represents the proportion of that specific test's
     * attempts that were initial failures (retries) versus its total attempts.
     *
     * Formula: testFlakyAttempts / testTotalAttempts
     * Where:
     * - testFlakyAttempts = retries count for this test (if flaky), 0 otherwise
     * - testTotalAttempts = 1 final result + retries count
     */

    it('should calculate 50% flaky rate for individual test that passed after 1 retry', () => {
      const tests = [
        createMockTest({
          name: 'individual-flaky-test',
          status: 'passed', // Final status: passed
          retries: 1, // Initially failed 1 time, then passed
          flaky: true,
          duration: 100,
        }),
        createMockTest({
          name: 'other-test',
          status: 'passed',
          retries: 0,
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      const flakyTest = result.results.tests.find(
        t => t.name === 'individual-flaky-test'
      )
      const normalTest = result.results.tests.find(t => t.name === 'other-test')

      /*
       * Flaky test calculation:
       * - testFlakyAttempts = 1 (the retry)
       * - testTotalAttempts = 1 final + 1 retry = 2 total
       * - testFlakyRate = 1/2 = 0.5 (50%)
       */
      expect(flakyTest!.insights!.flakyRate?.current).toBeCloseTo(0.5, 4)

      /*
       * Normal test calculation:
       * - testFlakyAttempts = 0 (no retries, not flaky)
       * - testTotalAttempts = 1 final + 0 retries = 1 total
       * - testFlakyRate = 0/1 = 0 (0%)
       */
      expect(normalTest!.insights!.flakyRate?.current).toBe(0)
    })

    it('should calculate 66.67% flaky rate for test that passed after 2 retries', () => {
      const tests = [
        createMockTest({
          name: 'very-flaky-test',
          status: 'passed', // Final status: passed
          retries: 2, // Initially failed 2 times, then passed
          flaky: true,
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      const flakyTest = result.results.tests.find(
        t => t.name === 'very-flaky-test'
      )

      /*
       * Very flaky test calculation:
       * - testFlakyAttempts = 2 (the retries)
       * - testTotalAttempts = 1 final + 2 retries = 3 total
       * - testFlakyRate = 2/3 = 0.6667 (66.67%)
       */
      expect(flakyTest!.insights!.flakyRate?.current).toBeCloseTo(0.6667, 4)
    })

    it('should return 0% flaky rate for test that failed after retries', () => {
      const tests = [
        createMockTest({
          name: 'consistently-failing-test',
          status: 'failed', // Final status: failed
          retries: 3, // Tried 3 times, still failed
          flaky: false, // NOT flaky because it never passed
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      const failingTest = result.results.tests.find(
        t => t.name === 'consistently-failing-test'
      )

      /*
       * Consistently failing test calculation:
       * - testFlakyAttempts = 0 (test never passed, so not flaky)
       * - testTotalAttempts = 1 final + 3 retries = 4 total
       * - testFlakyRate = 0/4 = 0 (0%)
       */
      expect(failingTest!.insights!.flakyRate?.current).toBe(0)
    })

    it('should return 0% flaky rate for test that passed without retries', () => {
      const tests = [
        createMockTest({
          name: 'stable-test',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      const stableTest = result.results.tests.find(
        t => t.name === 'stable-test'
      )

      /*
       * Stable test calculation:
       * - testFlakyAttempts = 0 (no retries)
       * - testTotalAttempts = 1 final + 0 retries = 1 total
       * - testFlakyRate = 0/1 = 0 (0%)
       */
      expect(stableTest!.insights!.flakyRate?.current).toBe(0)
    })

    it('should handle mixed test scenarios with different flaky rates', () => {
      const tests = [
        createMockTest({
          name: 'mildly-flaky-test',
          status: 'passed', // Final status: passed
          retries: 1, // Failed once, then passed
          flaky: true,
          duration: 100,
        }),
        createMockTest({
          name: 'very-flaky-test',
          status: 'passed', // Final status: passed
          retries: 3, // Failed 3 times, then passed
          flaky: true,
          duration: 100,
        }),
        createMockTest({
          name: 'stable-test',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 100,
        }),
        createMockTest({
          name: 'failing-test',
          status: 'failed', // Final status: failed
          retries: 2, // Failed 2 times, then failed again
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      const mildlyFlaky = result.results.tests.find(
        t => t.name === 'mildly-flaky-test'
      )
      const veryFlaky = result.results.tests.find(
        t => t.name === 'very-flaky-test'
      )
      const stable = result.results.tests.find(t => t.name === 'stable-test')
      const failing = result.results.tests.find(t => t.name === 'failing-test')

      /*
       * Individual test calculations:
       *
       * Mildly flaky: 1 retry / 2 total = 0.5 (50%)
       * Very flaky: 3 retries / 4 total = 0.75 (75%)
       * Stable: 0 retries / 1 total = 0 (0%)
       * Failing: 0 flaky attempts / 3 total = 0 (0%) - not flaky because it failed
       */
      expect(mildlyFlaky!.insights!.flakyRate?.current).toBeCloseTo(0.5, 4)
      expect(veryFlaky!.insights!.flakyRate?.current).toBeCloseTo(0.75, 4)
      expect(stable!.insights!.flakyRate?.current).toBe(0)
      expect(failing!.insights!.flakyRate?.current).toBe(0)
    })

    it('should handle explicitly marked flaky test correctly at test level', () => {
      const tests = [
        createMockTest({
          name: 'explicitly-flaky-test',
          status: 'passed', // Final status: passed
          retries: 2, // Failed 2 times, then passed
          flaky: true, // Explicitly marked as flaky
          duration: 100,
        }),
      ]
      const currentReport = createMockReport(tests)

      const result = enrichReportWithInsights(currentReport, [])

      const explicitlyFlaky = result.results.tests.find(
        t => t.name === 'explicitly-flaky-test'
      )

      /*
       * Explicitly flaky test calculation:
       * - testFlakyAttempts = 2 (the retries)
       * - testTotalAttempts = 1 final + 2 retries = 3 total
       * - testFlakyRate = 2/3 = 0.6667 (66.67%)
       */
      expect(explicitlyFlaky!.insights!.flakyRate?.current).toBeCloseTo(
        0.6667,
        4
      )
    })
  })

  describe('flakyRate calculation multi report', () => {
    /**
     * Multi-Report Per-Test Flaky Rate Definition:
     * For individual tests across multiple reports, the flaky rate represents the proportion
     * of that specific test's attempts that were initial failures (retries) versus its total
     * attempts across all reports where the test appears.
     *
     * Formula: testFlakyAttempts / testTotalAttempts (aggregated across reports)
     * Where:
     * - testFlakyAttempts = sum of retries for this test across all reports (only when test eventually passed)
     * - testTotalAttempts = sum of (1 final result + retries) for this test across all reports
     *
     * Key principle: Test-level insights aggregate data for the same test name across multiple reports.
     * Only retries from runs where the test eventually passed count as flaky attempts.
     */

    it('should calculate individual test flaky rate across multiple reports', () => {
      // Current report
      const currentTests = [
        createMockTest({
          name: 'test-a',
          status: 'passed', // Final status: passed
          retries: 1, // Failed 1 time, then passed
          flaky: true,
          duration: 100,
        }),
        createMockTest({
          name: 'test-b',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 120,
        }),
      ]

      // Previous report 1
      const previousTests1 = [
        createMockTest({
          name: 'test-a',
          status: 'passed', // Final status: passed
          retries: 2, // Failed 2 times, then passed
          flaky: true,
          duration: 110,
        }),
        createMockTest({
          name: 'test-b',
          status: 'failed', // Final status: failed
          retries: 1, // Failed 1 time, then failed again (not flaky)
          duration: 130,
        }),
      ]

      // Previous report 2
      const previousTests2 = [
        createMockTest({
          name: 'test-a',
          status: 'failed', // Final status: failed
          retries: 3, // Failed 3 times, then failed again (not flaky)
          duration: 105,
        }),
        createMockTest({
          name: 'test-b',
          status: 'passed', // Final status: passed
          retries: 1, // Failed 1 time, then passed
          flaky: true,
          duration: 125,
        }),
      ]

      const currentReport = createMockReport(currentTests, {
        results: {
          ...createMockReport(currentTests).results,
          summary: {
            ...createMockReport(currentTests).results.summary,
            start: 3000,
          },
        },
      })

      const previousReport1 = createMockReport(previousTests1, {
        results: {
          ...createMockReport(previousTests1).results,
          summary: {
            ...createMockReport(previousTests1).results.summary,
            start: 2000,
          },
        },
      })

      const previousReport2 = createMockReport(previousTests2, {
        results: {
          ...createMockReport(previousTests2).results,
          summary: {
            ...createMockReport(previousTests2).results.summary,
            start: 1000,
          },
        },
      })

      const result = enrichReportWithInsights(currentReport, [
        previousReport1,
        previousReport2,
      ])

      const testA = result.results.tests.find(t => t.name === 'test-a')
      const testB = result.results.tests.find(t => t.name === 'test-b')

      /*
       * Multi-report per-test calculation breakdown:
       *
       * Test A across reports:
       * - Current: passed after 1 retry → 1 flaky attempt, 2 total attempts
       * - Previous1: passed after 2 retries → 2 flaky attempts, 3 total attempts
       * - Previous2: failed after 3 retries → 0 flaky attempts, 4 total attempts (not flaky because failed)
       * Test A totals: 3 flaky attempts, 9 total attempts → 3/9 = 0.3333 (33.33%)
       *
       * Test B across reports:
       * - Current: passed immediately → 0 flaky attempts, 1 total attempt
       * - Previous1: failed after 1 retry → 0 flaky attempts, 2 total attempts (not flaky because failed)
       * - Previous2: passed after 1 retry → 1 flaky attempt, 2 total attempts
       * Test B totals: 1 flaky attempt, 5 total attempts → 1/5 = 0.2 (20%)
       */
      expect(testA!.insights!.flakyRate?.current).toBeCloseTo(0.3333, 4)
      expect(testB!.insights!.flakyRate?.current).toBeCloseTo(0.2, 4)
    })

    it('should handle test that appears in some but not all reports', () => {
      // Current report
      const currentTests = [
        createMockTest({
          name: 'test-consistent',
          status: 'passed',
          retries: 1,
          flaky: true,
          duration: 100,
        }),
        createMockTest({
          name: 'test-new',
          status: 'passed',
          retries: 2,
          flaky: true,
          duration: 120,
        }),
      ]

      // Previous report (missing 'test-new')
      const previousTests = [
        createMockTest({
          name: 'test-consistent',
          status: 'passed',
          retries: 0,
          duration: 110,
        }),
        createMockTest({
          name: 'test-old',
          status: 'failed',
          retries: 1,
          duration: 90,
        }),
      ]

      const currentReport = createMockReport(currentTests, {
        results: {
          ...createMockReport(currentTests).results,
          summary: {
            ...createMockReport(currentTests).results.summary,
            start: 2000,
          },
        },
      })

      const previousReport = createMockReport(previousTests, {
        results: {
          ...createMockReport(previousTests).results,
          summary: {
            ...createMockReport(previousTests).results.summary,
            start: 1000,
          },
        },
      })

      const result = enrichReportWithInsights(currentReport, [previousReport])

      const testConsistent = result.results.tests.find(
        t => t.name === 'test-consistent'
      )
      const testNew = result.results.tests.find(t => t.name === 'test-new')

      /*
       * Test calculations:
       *
       * test-consistent (appears in both reports):
       * - Current: passed after 1 retry → 1 flaky attempt, 2 total attempts
       * - Previous: passed immediately → 0 flaky attempts, 1 total attempt
       * Total: 1 flaky attempt, 3 total attempts → 1/3 = 0.3333 (33.33%)
       *
       * test-new (appears only in current report):
       * - Current: passed after 2 retries → 2 flaky attempts, 3 total attempts
       * Total: 2 flaky attempts, 3 total attempts → 2/3 = 0.6667 (66.67%)
       */
      expect(testConsistent!.insights!.flakyRate?.current).toBeCloseTo(
        0.3333,
        4
      )
      expect(testNew!.insights!.flakyRate?.current).toBeCloseTo(0.6667, 4)
    })

    it('should handle test that was consistently flaky then became stable', () => {
      // Current report - now stable
      const currentTests = [
        createMockTest({
          name: 'improving-test',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed (improved!)
          duration: 100,
        }),
      ]

      // Previous report 1 - was flaky
      const previousTests1 = [
        createMockTest({
          name: 'improving-test',
          status: 'passed', // Final status: passed
          retries: 2, // Failed 2 times, then passed
          flaky: true,
          duration: 120,
        }),
      ]

      // Previous report 2 - was very flaky
      const previousTests2 = [
        createMockTest({
          name: 'improving-test',
          status: 'passed', // Final status: passed
          retries: 3, // Failed 3 times, then passed
          flaky: true,
          duration: 130,
        }),
      ]

      const currentReport = createMockReport(currentTests, {
        results: {
          ...createMockReport(currentTests).results,
          summary: {
            ...createMockReport(currentTests).results.summary,
            start: 3000,
          },
        },
      })

      const previousReport1 = createMockReport(previousTests1, {
        results: {
          ...createMockReport(previousTests1).results,
          summary: {
            ...createMockReport(previousTests1).results.summary,
            start: 2000,
          },
        },
      })

      const previousReport2 = createMockReport(previousTests2, {
        results: {
          ...createMockReport(previousTests2).results,
          summary: {
            ...createMockReport(previousTests2).results.summary,
            start: 1000,
          },
        },
      })

      const result = enrichReportWithInsights(currentReport, [
        previousReport1,
        previousReport2,
      ])

      const improvingTest = result.results.tests.find(
        t => t.name === 'improving-test'
      )

      /*
       * Improving test calculation across reports:
       * - Current: passed immediately → 0 flaky attempts, 1 total attempt
       * - Previous1: passed after 2 retries → 2 flaky attempts, 3 total attempts
       * - Previous2: passed after 3 retries → 3 flaky attempts, 4 total attempts
       * Total: 5 flaky attempts, 8 total attempts → 5/8 = 0.625 (62.5%)
       *
       * This shows historical flakiness even though the test is currently stable.
       */
      expect(improvingTest!.insights!.flakyRate?.current).toBeCloseTo(0.625, 4)
    })

    it('should handle test that became consistently failing', () => {
      // Current report - now failing
      const currentTests = [
        createMockTest({
          name: 'degrading-test',
          status: 'failed', // Final status: failed
          retries: 2, // Failed 2 times, then failed again
          duration: 100,
        }),
      ]

      // Previous report 1 - was flaky but passed
      const previousTests1 = [
        createMockTest({
          name: 'degrading-test',
          status: 'passed', // Final status: passed
          retries: 1, // Failed 1 time, then passed
          flaky: true,
          duration: 110,
        }),
      ]

      // Previous report 2 - was stable
      const previousTests2 = [
        createMockTest({
          name: 'degrading-test',
          status: 'passed', // Final status: passed
          retries: 0, // No retries needed
          duration: 105,
        }),
      ]

      const currentReport = createMockReport(currentTests, {
        results: {
          ...createMockReport(currentTests).results,
          summary: {
            ...createMockReport(currentTests).results.summary,
            start: 3000,
          },
        },
      })

      const previousReport1 = createMockReport(previousTests1, {
        results: {
          ...createMockReport(previousTests1).results,
          summary: {
            ...createMockReport(previousTests1).results.summary,
            start: 2000,
          },
        },
      })

      const previousReport2 = createMockReport(previousTests2, {
        results: {
          ...createMockReport(previousTests2).results,
          summary: {
            ...createMockReport(previousTests2).results.summary,
            start: 1000,
          },
        },
      })

      const result = enrichReportWithInsights(currentReport, [
        previousReport1,
        previousReport2,
      ])

      const degradingTest = result.results.tests.find(
        t => t.name === 'degrading-test'
      )

      /*
       * Degrading test calculation across reports:
       * - Current: failed after 2 retries → 0 flaky attempts, 3 total attempts (not flaky because failed)
       * - Previous1: passed after 1 retry → 1 flaky attempt, 2 total attempts
       * - Previous2: passed immediately → 0 flaky attempts, 1 total attempt
       * Total: 1 flaky attempt, 6 total attempts → 1/6 = 0.1667 (16.67%)
       */
      expect(degradingTest!.insights!.flakyRate?.current).toBeCloseTo(0.1667, 4)
    })

    it('should calculate 0% flaky rate for test that never had retries across reports', () => {
      // Current report
      const currentTests = [
        createMockTest({
          name: 'stable-test',
          status: 'passed',
          retries: 0,
          duration: 100,
        }),
      ]

      // Previous report 1
      const previousTests1 = [
        createMockTest({
          name: 'stable-test',
          status: 'passed',
          retries: 0,
          duration: 105,
        }),
      ]

      // Previous report 2
      const previousTests2 = [
        createMockTest({
          name: 'stable-test',
          status: 'passed',
          retries: 0,
          duration: 95,
        }),
      ]

      const currentReport = createMockReport(currentTests, {
        results: {
          ...createMockReport(currentTests).results,
          summary: {
            ...createMockReport(currentTests).results.summary,
            start: 3000,
          },
        },
      })

      const previousReport1 = createMockReport(previousTests1, {
        results: {
          ...createMockReport(previousTests1).results,
          summary: {
            ...createMockReport(previousTests1).results.summary,
            start: 2000,
          },
        },
      })

      const previousReport2 = createMockReport(previousTests2, {
        results: {
          ...createMockReport(previousTests2).results,
          summary: {
            ...createMockReport(previousTests2).results.summary,
            start: 1000,
          },
        },
      })

      const result = enrichReportWithInsights(currentReport, [
        previousReport1,
        previousReport2,
      ])

      const stableTest = result.results.tests.find(
        t => t.name === 'stable-test'
      )

      /*
       * Stable test calculation across reports:
       * - Current: passed immediately → 0 flaky attempts, 1 total attempt
       * - Previous1: passed immediately → 0 flaky attempts, 1 total attempt
       * - Previous2: passed immediately → 0 flaky attempts, 1 total attempt
       * Total: 0 flaky attempts, 3 total attempts → 0/3 = 0 (0%)
       */
      expect(stableTest!.insights!.flakyRate?.current).toBe(0)
    })
  })
})
