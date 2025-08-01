// Test the public API and utility functions
import {
  isTestFlaky,
  formatAsPercentage,
  formatInsightsMetricAsPercentage,
  enrichReportWithInsights
} from '../methods/run-insights';

import { Report, Test, InsightsMetric } from '../../types/ctrf.js';
import { CTRF_REPORT_FORMAT, CTRF_SPEC_VERSION } from '../constants';

// Mock data helpers
const createMockTest = (overrides: Partial<Test> = {}): Test => ({
  name: 'test-name',
  status: 'passed',
  duration: 100,
  ...overrides
});

const createMockReport = (tests: Test[] = [], overrides: Partial<Report> = {}): Report => ({
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
      start: Date.now(),
      stop: Date.now() + 1000
    },
    tests
  },
  ...overrides
});

describe('run-insights utility functions', () => {
  describe('isTestFlaky', () => {
    it('should return true for explicitly flaky tests', () => {
      const test = createMockTest({ flaky: true });
      expect(isTestFlaky(test)).toBe(true);
    });

    it('should return true for passed tests with retries', () => {
      const test = createMockTest({ 
        status: 'passed', 
        retries: 2 
      });
      expect(isTestFlaky(test)).toBe(true);
    });

    it('should return false for failed tests with retries', () => {
      const test = createMockTest({ 
        status: 'failed', 
        retries: 2 
      });
      expect(isTestFlaky(test)).toBe(false);
    });

    it('should return false for passed tests without retries', () => {
      const test = createMockTest({ 
        status: 'passed', 
        retries: 0 
      });
      expect(isTestFlaky(test)).toBe(false);
    });

    it('should return false for passed tests without retries property', () => {
      const test = createMockTest({ status: 'passed' });
      expect(isTestFlaky(test)).toBe(false);
    });
  });

  describe('formatAsPercentage', () => {
    it('should format ratio as percentage with default 2 decimals', () => {
      expect(formatAsPercentage(0.25)).toBe('25.00%');
      expect(formatAsPercentage(0.5)).toBe('50.00%');
      expect(formatAsPercentage(0.75)).toBe('75.00%');
      expect(formatAsPercentage(1)).toBe('100.00%');
    });

    it('should format ratio as percentage with custom decimals', () => {
      expect(formatAsPercentage(0.25, 1)).toBe('25.0%');
      expect(formatAsPercentage(0.25, 0)).toBe('25%');
      expect(formatAsPercentage(0.25, 3)).toBe('25.000%');
    });

    it('should handle edge cases', () => {
      expect(formatAsPercentage(0)).toBe('0.00%');
      expect(formatAsPercentage(0.00001)).toBe('0.00%');
      expect(formatAsPercentage(0.999)).toBe('99.90%');
    });
  });

  describe('formatInsightsMetricAsPercentage', () => {
    it('should format all metric values as percentages', () => {
      const metric: InsightsMetric = {
        current: 0.25,
        previous: 0.2,
        change: 0.05
      };

      const result = formatInsightsMetricAsPercentage(metric);

      expect(result).toEqual({
        current: '25.00%',
        previous: '20.00%',
        change: '+5.00%'
      });
    });

    it('should handle negative change values', () => {
      const metric: InsightsMetric = {
        current: 0.15,
        previous: 0.2,
        change: -0.05
      };

      const result = formatInsightsMetricAsPercentage(metric);

      expect(result).toEqual({
        current: '15.00%',
        previous: '20.00%',
        change: '-5.00%'
      });
    });

    it('should handle zero change values', () => {
      const metric: InsightsMetric = {
        current: 0.2,
        previous: 0.2,
        change: 0
      };

      const result = formatInsightsMetricAsPercentage(metric);

      expect(result).toEqual({
        current: '20.00%',
        previous: '20.00%',
        change: '+0.00%'
      });
    });
  });
});

describe('enrichReportWithInsights - Main API', () => {
  describe('basic functionality', () => {
    it('should enrich a report with run-level insights when no previous reports', () => {
      const tests = [
        createMockTest({ name: 'test1', status: 'passed', duration: 100 }),
        createMockTest({ name: 'test2', status: 'failed', duration: 200 }),
        createMockTest({ name: 'test3', status: 'passed', retries: 1, flaky: true, duration: 150 })
      ];
      const currentReport = createMockReport(tests);
      
      const result = enrichReportWithInsights(currentReport, []);
      
      expect(result.insights).toBeDefined();
      expect(result.insights!.flakyRate?.current).toBeGreaterThan(0);
      expect(result.insights!.failRate?.current).toBeGreaterThan(0);
      expect(result.insights!.averageTestDuration?.current).toBe(150); // (100+200+150)/3
      expect(result.insights!.runsAnalyzed).toBe(1);
      
      // Should have no baseline comparison (previous/change should be 0)
      expect(result.insights!.flakyRate?.previous).toBe(0);
      expect(result.insights!.flakyRate?.change).toBe(0);
    });

    it('should add test-level insights to each test', () => {
      const tests = [
        createMockTest({ name: 'test1', status: 'passed', duration: 100 }),
        createMockTest({ name: 'test2', status: 'failed', duration: 200 })
      ];
      const currentReport = createMockReport(tests);
      
      const result = enrichReportWithInsights(currentReport, []);
      
      expect(result.results.tests[0].insights).toBeDefined();
      expect(result.results.tests[1].insights).toBeDefined();
      
      expect(result.results.tests[0].insights!.failRate?.current).toBe(0);
      expect(result.results.tests[1].insights!.failRate?.current).toBe(1);
      expect(result.results.tests[0].insights!.averageTestDuration?.current).toBe(100);
      expect(result.results.tests[1].insights!.averageTestDuration?.current).toBe(200);
    });
  });

  describe('baseline comparison functionality', () => {
    it('should compare against previous report by default', () => {
      const currentTests = [
        createMockTest({ name: 'test1', status: 'passed', duration: 100 }),
        createMockTest({ name: 'test2', status: 'passed', duration: 200 })
      ];
      const previousTests = [
        createMockTest({ name: 'test1', status: 'failed', duration: 150 }),
        createMockTest({ name: 'test2', status: 'failed', duration: 250 })
      ];
      
      const currentReport = createMockReport(currentTests, {
        results: {
          ...createMockReport(currentTests).results,
          summary: { ...createMockReport(currentTests).results.summary, start: 2000 }
        }
      });
      const previousReport = createMockReport(previousTests, {
        results: {
          ...createMockReport(previousTests).results,
          summary: { ...createMockReport(previousTests).results.summary, start: 1000 }
        }
      });
      
      const result = enrichReportWithInsights(currentReport, [previousReport]);
      
             expect(result.insights).toBeDefined();
       expect(result.insights!.failRate?.current).toBe(0.5); // Overall: 2 passed + 2 failed = 50% fail rate
       expect(result.insights!.failRate?.previous).toBe(1); // Previous: all failed
       expect(result.insights!.failRate?.change).toBe(-0.5); // Improvement of 50%
       expect(result.insights!.runsAnalyzed).toBe(2);
    });

    it('should handle baseline by index', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })];
      const previous1Tests = [createMockTest({ name: 'test1', status: 'failed' })];
      const previous2Tests = [createMockTest({ name: 'test1', status: 'passed' })];
      
      const currentReport = createMockReport(currentTests);
      const previousReport1 = createMockReport(previous1Tests);
      const previousReport2 = createMockReport(previous2Tests);
      
      // Use index 1 (second previous report)
      const result = enrichReportWithInsights(currentReport, [previousReport1, previousReport2], 1);
      
             expect(result.insights!.failRate?.current).toBe(0.3333); // 1 passed + 1 failed + 1 passed = 1/3 fail rate
       expect(result.insights!.failRate?.previous).toBe(0); // previous2 had no failures  
       expect(result.insights!.failRate?.change).toBe(0.3333);
    });

    it('should handle baseline by report ID', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })];
      const previousTests = [createMockTest({ name: 'test1', status: 'failed' })];
      
      const currentReport = createMockReport(currentTests);
      const previousReport = createMockReport(previousTests, {
        results: {
          ...createMockReport(previousTests).results,
          summary: { ...createMockReport(previousTests).results.summary, start: 12345 }
        }
      });
      
      const result = enrichReportWithInsights(currentReport, [previousReport], "12345");
      
             expect(result.insights!.failRate?.current).toBe(0.5); // 1 passed + 1 failed = 50% fail rate  
       expect(result.insights!.failRate?.previous).toBe(1);
       expect(result.insights!.failRate?.change).toBe(-0.5);
    });

    it('should handle invalid baseline gracefully', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })];
      const previousTests = [createMockTest({ name: 'test1', status: 'failed' })];
      
      const currentReport = createMockReport(currentTests);
      const previousReport = createMockReport(previousTests);
      
      // Invalid index
      const result1 = enrichReportWithInsights(currentReport, [previousReport], 999);
      expect(result1.insights!.failRate?.previous).toBe(0);
      expect(result1.insights!.failRate?.change).toBe(0);
      
      // Invalid ID
      const result2 = enrichReportWithInsights(currentReport, [previousReport], "invalid-id");
      expect(result2.insights!.failRate?.previous).toBe(0);
      expect(result2.insights!.failRate?.change).toBe(0);
    });
  });

  describe('added/removed tests tracking', () => {
    it('should track tests added since baseline', () => {
      const currentTests = [
        createMockTest({ name: 'test1', status: 'passed' }),
        createMockTest({ name: 'test2', status: 'passed' }), // New test
        createMockTest({ name: 'test3', status: 'passed' })  // New test
      ];
      const previousTests = [
        createMockTest({ name: 'test1', status: 'passed' })
      ];
      
      const currentReport = createMockReport(currentTests);
      const previousReport = createMockReport(previousTests);
      
      const result = enrichReportWithInsights(currentReport, [previousReport]);
      
             expect(result.insights!.extra!.testsAdded).toHaveLength(2);
       expect((result.insights!.extra!.testsAdded as any[])[0].name).toBe('test2');
       expect((result.insights!.extra!.testsAdded as any[])[1].name).toBe('test3');
    });

    it('should track tests removed since baseline', () => {
      const currentTests = [
        createMockTest({ name: 'test1', status: 'passed' })
      ];
      const previousTests = [
        createMockTest({ name: 'test1', status: 'passed' }),
        createMockTest({ name: 'test2', status: 'passed' }), // Removed test
        createMockTest({ name: 'test3', status: 'passed' })  // Removed test
      ];
      
      const currentReport = createMockReport(currentTests);
      const previousReport = createMockReport(previousTests);
      
      const result = enrichReportWithInsights(currentReport, [previousReport]);
      
             expect(result.insights!.extra!.testsRemoved).toHaveLength(2);
       expect((result.insights!.extra!.testsRemoved as any[])[0].name).toBe('test2');
       expect((result.insights!.extra!.testsRemoved as any[])[1].name).toBe('test3');
    });

    it('should handle single report no added/removed tests', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })];
      
      const currentReport = createMockReport(currentTests);
      const result = enrichReportWithInsights(currentReport, []);
      
      expect(result.insights!.extra!.testsAdded).toBeUndefined();
      expect(result.insights!.extra!.testsRemoved).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty current report', () => {
      const currentReport = createMockReport([]);
      const previousReport = createMockReport([createMockTest()]);
      
      const result = enrichReportWithInsights(currentReport, [previousReport]);
      
             expect(result.insights).toBeDefined();
       expect(result.insights!.failRate?.current).toBe(0); // Previous report has 1 test, current has 0, so 0 failed overall
       expect(result.insights!.averageTestDuration?.current).toBe(100); // Previous report had 1 test with 100ms duration
    });

    it('should handle invalid current report', () => {
      const invalidReport = { results: null } as any;
      
      const result = enrichReportWithInsights(invalidReport, []);
      
      expect(result).toBe(invalidReport); // Should return unchanged
    });

    it('should handle multiple previous reports', () => {
      const currentTests = [createMockTest({ name: 'test1', status: 'passed' })];
      const previous1Tests = [createMockTest({ name: 'test1', status: 'failed' })];
      const previous2Tests = [createMockTest({ name: 'test1', status: 'passed' })];
      const previous3Tests = [createMockTest({ name: 'test1', status: 'failed' })];
      
      const currentReport = createMockReport(currentTests);
      const previousReports = [
        createMockReport(previous1Tests),
        createMockReport(previous2Tests),
        createMockReport(previous3Tests)
      ];
      
      const result = enrichReportWithInsights(currentReport, previousReports);
      
      expect(result.insights!.runsAnalyzed).toBe(4); // Current + 3 previous
      expect(result.insights!.failRate?.current).toBeDefined();
      expect(result.insights!.failRate?.previous).toBeDefined();
    });
  });
}); 