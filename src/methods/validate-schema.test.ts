import { describe, it, expect } from 'vitest'
import {
  validateReport,
  validateReportStrict,
  isValidCtrfReport,
} from './validate-schema'
import type { Report } from '../../types/ctrf'

describe('validate-schema', () => {
  // Valid CTRF report for testing
  const validCtrfReport: Report = {
    reportFormat: 'CTRF',
    specVersion: '1.0.0',
    results: {
      tool: { name: 'jest' },
      summary: {
        tests: 1,
        passed: 1,
        failed: 0,
        skipped: 0,
        pending: 0,
        other: 0,
        start: Date.now(),
        stop: Date.now() + 1000,
      },
      tests: [
        {
          name: 'test1',
          status: 'passed',
          duration: 100,
        },
      ],
    },
  }

  const validCtrfReportWithOptionalFields: Report = {
    reportFormat: 'CTRF',
    specVersion: '1.2.3',
    reportId: '550e8400-e29b-41d4-a716-446655440000',
    timestamp: '2024-01-01T00:00:00Z',
    generatedBy: 'jest-ctrf',
    results: {
      tool: {
        name: 'jest',
        version: '29.0.0',
        extra: { customField: 'value' },
      },
      summary: {
        tests: 2,
        passed: 1,
        failed: 1,
        skipped: 0,
        pending: 0,
        other: 0,
        flaky: 1,
        suites: 1,
        start: Date.now(),
        stop: Date.now() + 2000,
        duration: 2000,
        extra: { summaryField: 'value' },
      },
      tests: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'successful test',
          status: 'passed',
          duration: 100,
          start: Date.now(),
          stop: Date.now() + 100,
          suite: ['test suite'],
          tags: ['unit', 'fast'],
          type: 'test',
          filePath: '/path/to/test.js',
          extra: { testField: 'value' },
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'failed test',
          status: 'failed',
          duration: 200,
          message: 'Test failed',
          trace: 'Error: Test failed\n  at test.js:10',
          snippet: 'expect(false).toBe(true)',
          line: 10,
          flaky: true,
          retries: 2,
          retryAttempts: [
            {
              attempt: 1,
              status: 'failed',
              duration: 150,
              message: 'First attempt failed',
            },
            {
              attempt: 2,
              status: 'failed',
              duration: 180,
              message: 'Second attempt failed',
            },
          ],
          stdout: ['console output'],
          stderr: ['error output'],
          attachments: [
            {
              name: 'screenshot.png',
              contentType: 'image/png',
              path: '/path/to/screenshot.png',
            },
          ],
          steps: [
            {
              name: 'step 1',
              status: 'passed',
            },
            {
              name: 'step 2',
              status: 'failed',
            },
          ],
        },
      ],
      environment: {
        appName: 'My App',
        appVersion: '1.0.0',
        buildId: 'build-123',
        osPlatform: 'linux',
        extra: { envField: 'value' },
      },
      extra: { resultsField: 'value' },
    },
    insights: {
      runsAnalyzed: 10,
      passRate: {
        current: 0.8,
        baseline: 0.75,
        change: 0.05,
      },
      failRate: {
        current: 0.2,
        baseline: 0.25,
        change: -0.05,
      },
    },
    baseline: {
      reportId: '550e8400-e29b-41d4-a716-446655440003',
      source: 'previous-run',
      timestamp: '2023-12-31T23:59:59Z',
    },
    extra: { reportField: 'value' },
  }

  describe('validateReport', () => {
    it('should validate a minimal valid CTRF report', () => {
      const result = validateReport(validCtrfReport)
      expect(result.valid).toBe(true)
      expect(result.errors).toBeUndefined()
    })

    it('should validate a complete CTRF report with all optional fields', () => {
      const result = validateReport(validCtrfReportWithOptionalFields)
      expect(result.valid).toBe(true)
      expect(result.errors).toBeUndefined()
    })

    it('should return false for missing required reportFormat', () => {
      const invalidReport = { ...validCtrfReport }
      delete (invalidReport as any).reportFormat

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('reportFormat'))).toBe(
        true
      )
    })

    it('should return false for invalid reportFormat value', () => {
      const invalidReport = { ...validCtrfReport, reportFormat: 'INVALID' }

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('reportFormat'))).toBe(
        true
      )
    })

    it('should return false for missing required specVersion', () => {
      const invalidReport = { ...validCtrfReport }
      delete (invalidReport as any).specVersion

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('specVersion'))).toBe(
        true
      )
    })

    it('should return false for invalid specVersion format', () => {
      const invalidReport = {
        ...validCtrfReport,
        specVersion: 'invalid-version',
      }

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('specVersion'))).toBe(
        true
      )
    })

    it('should return false for missing results', () => {
      const invalidReport = { ...validCtrfReport }
      delete (invalidReport as any).results

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('results'))).toBe(true)
    })

    it('should return false for missing tool in results', () => {
      const invalidReport = {
        ...validCtrfReport,
        results: {
          ...validCtrfReport.results,
        },
      }
      delete (invalidReport.results as any).tool

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('tool'))).toBe(true)
    })

    it('should return false for missing tool name', () => {
      const invalidReport = {
        ...validCtrfReport,
        results: {
          ...validCtrfReport.results,
          tool: {},
        },
      }

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('name'))).toBe(true)
    })

    it('should return false for missing summary', () => {
      const invalidReport = {
        ...validCtrfReport,
        results: {
          ...validCtrfReport.results,
        },
      }
      delete (invalidReport.results as any).summary

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('summary'))).toBe(true)
    })

    it('should return false for missing required summary fields', () => {
      const invalidReport = {
        ...validCtrfReport,
        results: {
          ...validCtrfReport.results,
          summary: {
            tests: 1,
            // Missing other required fields
          },
        },
      }

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return false for missing tests array', () => {
      const invalidReport = {
        ...validCtrfReport,
        results: {
          ...validCtrfReport.results,
        },
      }
      delete (invalidReport.results as any).tests

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('tests'))).toBe(true)
    })

    it('should return false for test missing required fields', () => {
      const invalidReport = {
        ...validCtrfReport,
        results: {
          ...validCtrfReport.results,
          tests: [
            {
              // Missing name, status, duration
            },
          ],
        },
      }

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return false for invalid test status', () => {
      const invalidReport = {
        ...validCtrfReport,
        results: {
          ...validCtrfReport.results,
          tests: [
            {
              name: 'test',
              status: 'invalid-status',
              duration: 100,
            },
          ],
        },
      }

      const result = validateReport(invalidReport)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(
        result.errors?.some(error =>
          error.includes('must be equal to one of the allowed values')
        )
      ).toBe(true)
    })

    it('should return false for non-object input', () => {
      const result = validateReport('not an object')
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return false for null input', () => {
      const result = validateReport(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return false for undefined input', () => {
      const result = validateReport(undefined)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should validate insights structure', () => {
      const reportWithInvalidInsights = {
        ...validCtrfReport,
        insights: {
          passRate: {
            current: 'not a number', // Invalid type
            baseline: 0.75,
            change: 0.05,
          },
        },
      }

      const result = validateReport(reportWithInvalidInsights)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should validate baseline structure', () => {
      const reportWithInvalidBaseline = {
        ...validCtrfReport,
        baseline: {
          // Missing required reportId
          source: 'test',
        },
      }

      const result = validateReport(reportWithInvalidBaseline)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('reportId'))).toBe(
        true
      )
    })

    it('should validate attachment structure', () => {
      const reportWithInvalidAttachment = {
        ...validCtrfReport,
        results: {
          ...validCtrfReport.results,
          tests: [
            {
              name: 'test',
              status: 'passed',
              duration: 100,
              attachments: [
                {
                  name: 'attachment',
                  // Missing contentType and path
                },
              ],
            },
          ],
        },
      }

      const result = validateReport(reportWithInvalidAttachment)
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })

  describe('validateReportStrict', () => {
    it('should not throw for valid CTRF report', () => {
      expect(() => validateReportStrict(validCtrfReport)).not.toThrow()
    })

    it('should not throw for complete CTRF report', () => {
      expect(() =>
        validateReportStrict(validCtrfReportWithOptionalFields)
      ).not.toThrow()
    })

    it('should throw error for invalid CTRF report', () => {
      const invalidReport = { ...validCtrfReport, reportFormat: 'INVALID' }

      expect(() => validateReportStrict(invalidReport)).toThrow(
        'CTRF schema validation failed'
      )
    })

    it('should throw error with detailed validation errors', () => {
      const invalidReport = {
        reportFormat: 'CTRF',
        // Missing specVersion and results
      }

      expect(() => validateReportStrict(invalidReport)).toThrow(/specVersion/)
      expect(() => validateReportStrict(invalidReport)).toThrow(/results/)
    })

    it('should throw error for null input', () => {
      expect(() => validateReportStrict(null)).toThrow(
        'CTRF schema validation failed'
      )
    })

    it('should throw error for undefined input', () => {
      expect(() => validateReportStrict(undefined)).toThrow(
        'CTRF schema validation failed'
      )
    })

    it('should throw error for non-object input', () => {
      expect(() => validateReportStrict('not an object')).toThrow(
        'CTRF schema validation failed'
      )
    })
  })

  describe('isValidCtrfReport', () => {
    it('should return true for valid CTRF report object', () => {
      const validReport = { reportFormat: 'CTRF', other: 'data' }
      expect(isValidCtrfReport(validReport)).toBe(true)
    })

    it('should return true for minimal CTRF report', () => {
      expect(isValidCtrfReport(validCtrfReport)).toBe(true)
    })

    it('should return true for complete CTRF report', () => {
      expect(isValidCtrfReport(validCtrfReportWithOptionalFields)).toBe(true)
    })

    it('should return false for object with wrong reportFormat', () => {
      const invalidReport = { reportFormat: 'INVALID', other: 'data' }
      expect(isValidCtrfReport(invalidReport)).toBe(false)
    })

    it('should return false for object without reportFormat', () => {
      const invalidReport = { other: 'data' }
      expect(isValidCtrfReport(invalidReport)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isValidCtrfReport(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidCtrfReport(undefined)).toBe(false)
    })

    it('should return false for string', () => {
      expect(isValidCtrfReport('not an object')).toBe(false)
    })

    it('should return false for number', () => {
      expect(isValidCtrfReport(123)).toBe(false)
    })

    it('should return false for array', () => {
      expect(isValidCtrfReport([{ reportFormat: 'CTRF' }])).toBe(false)
    })

    it('should provide type narrowing', () => {
      const unknownData: unknown = { reportFormat: 'CTRF', someField: 'value' }

      if (isValidCtrfReport(unknownData)) {
        // TypeScript should now know that unknownData has reportFormat: 'CTRF'
        expect(unknownData.reportFormat).toBe('CTRF')
      }
    })
  })
})
