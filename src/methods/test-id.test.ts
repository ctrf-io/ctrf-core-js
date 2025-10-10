import { describe, it, expect } from 'vitest'
import {
  setTestId,
  getTestId,
  setTestIdsForReport,
  findTestById,
  generateTestIdFromProperties,
  CTRF_NAMESPACE,
} from './test-id.js'
import type { Test, Report } from '../../types/ctrf.js'

describe('test-id', () => {
  const mockTest: Test = {
    name: 'should pass',
    status: 'passed',
    duration: 100,
    suite: ['unit', 'auth'],
    filePath: 'src/auth.test.ts',
  }

  const mockReport: Report = {
    reportFormat: 'CTRF',
    specVersion: '1.0.0',
    results: {
      tool: { name: 'vitest' },
      summary: {
        tests: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        pending: 0,
        other: 0,
        start: 1234567890,
        stop: 1234567990,
      },
      tests: [
        {
          name: 'test 1',
          status: 'passed',
          duration: 50,
          suite: ['unit'],
          filePath: 'test1.ts',
        },
        {
          name: 'test 2',
          status: 'passed',
          duration: 75,
          suite: ['integration'],
          filePath: 'test2.ts',
        },
      ],
    },
  }

  describe('setTestId', () => {
    it('should add a deterministic UUID to a test without one', () => {
      const test = { ...mockTest }
      const result = setTestId(test)
      
      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('string')
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      
      const test2 = { ...mockTest }
      const result2 = setTestId(test2)
      expect(result.id).toBe(result2.id)
    })

    it('should not overwrite existing ID', () => {
      const test = { ...mockTest, id: 'existing-id' }
      const result = setTestId(test)
      
      expect(result.id).toBe('existing-id')
    })
  })

  describe('getTestId', () => {
    it('should return existing ID', () => {
      const test = { ...mockTest, id: 'existing-id' }
      const result = getTestId(test)
      
      expect(result).toBe('existing-id')
    })

    it('should generate and return deterministic UUID if none exists', () => {
      const test = { ...mockTest }
      const result = getTestId(test)
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      expect(test.id).toBe(result) 
      
      const test2 = { ...mockTest }
      const result2 = getTestId(test2)
      expect(result).toBe(result2)
    })
  })

  describe('setTestIdsForReport', () => {
    it('should set IDs for all tests in a report', () => {
      const report = JSON.parse(JSON.stringify(mockReport)) 
      const result = setTestIdsForReport(report)
      
      expect(result.results.tests).toHaveLength(2)
      expect(result.results.tests[0].id).toBeDefined()
      expect(result.results.tests[1].id).toBeDefined()
      expect(result.results.tests[0].id).not.toBe(result.results.tests[1].id)
    })

    it('should not overwrite existing IDs', () => {
      const report = JSON.parse(JSON.stringify(mockReport))
      report.results.tests[0].id = 'existing-id'
      
      const result = setTestIdsForReport(report)
      
      expect(result.results.tests[0].id).toBe('existing-id')
      expect(result.results.tests[1].id).toBeDefined()
      expect(result.results.tests[1].id).not.toBe('existing-id')
    })
  })

  describe('findTestById', () => {
    it('should find test by ID', () => {
      const report = JSON.parse(JSON.stringify(mockReport))
      report.results.tests[0].id = 'test-id-1'
      report.results.tests[1].id = 'test-id-2'
      
      const result = findTestById(report, 'test-id-1')
      
      expect(result).toBeDefined()
      expect(result?.name).toBe('test 1')
    })

    it('should return undefined for non-existent ID', () => {
      const report = JSON.parse(JSON.stringify(mockReport))
      
      const result = findTestById(report, 'non-existent-id')
      
      expect(result).toBeUndefined()
    })
  })

  describe('generateTestIdFromProperties', () => {
    it('should generate deterministic UUID from properties', () => {
      const result = generateTestIdFromProperties(
        'test name',
        ['suite1', 'suite2'],
        'test.ts'
      )
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      
      const result2 = generateTestIdFromProperties(
        'test name',
        ['suite1', 'suite2'],
        'test.ts'
      )
      expect(result).toBe(result2)
    })

    it('should handle missing optional parameters', () => {
      const result = generateTestIdFromProperties('test name')
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should generate different UUIDs for different properties', () => {
      const result1 = generateTestIdFromProperties('test1', ['suite1'], 'file1.ts')
      const result2 = generateTestIdFromProperties('test2', ['suite2'], 'file2.ts')
      
      expect(result1).not.toBe(result2)
    })
  })

  describe('CTRF_NAMESPACE', () => {
    it('should be a valid UUID', () => {
      expect(CTRF_NAMESPACE).toBeDefined()
      expect(typeof CTRF_NAMESPACE).toBe('string')
      expect(CTRF_NAMESPACE).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should be stable and not change', () => {
      expect(CTRF_NAMESPACE).toBe('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
    })
  })
})