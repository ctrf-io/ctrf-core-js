import fs from 'fs'
import path from 'path'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  readReportFromFile,
  readReportsFromDirectory,
  readReportsFromGlobPattern,
} from './read-reports'
import { Report } from '../../types/ctrf'

// Mock fs module for testing
vi.mock('fs')
vi.mock('glob')

const mockFs = vi.mocked(fs)
const mockGlob = vi.mocked(await import('glob'))

describe('read-reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('readSingleReport', () => {
    const validCtrfReport: Report = {
      reportFormat: 'ctrf',
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

    it('should read and parse a valid CTRF report file', () => {
      const filePath = '/path/to/report.json'
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validCtrfReport))

      const result = readReportFromFile(filePath)

      expect(result).toEqual(validCtrfReport)
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        path.resolve(filePath),
        'utf8'
      )
    })

    it('should throw error when file does not exist', () => {
      const filePath = '/path/to/nonexistent.json'
      mockFs.existsSync.mockReturnValue(false)

      expect(() => readReportFromFile(filePath)).toThrow(
        'JSON file not found: /path/to/nonexistent.json'
      )
    })

    it('should throw error when file is not valid JSON', () => {
      const filePath = '/path/to/invalid.json'
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('invalid json')

      expect(() => readReportFromFile(filePath)).toThrow(
        /Failed to read or parse the file/
      )
    })

    it('should throw error when file is not a valid CTRF report', () => {
      const filePath = '/path/to/invalid-ctrf.json'
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ invalid: 'data' }))

      expect(() => readReportFromFile(filePath)).toThrow(
        /is not a valid CTRF report/
      )
    })
  })

  describe('readReportsFromDirectory', () => {
    it('should read valid CTRF reports from directory', () => {
      const directoryPath = '/path/to/reports'
      const validCtrfReport: Report = {
        reportFormat: 'ctrf',
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

      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([
        'report1.json',
        'report2.json',
        'not-json.txt',
      ] as any)
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validCtrfReport))

      const result = readReportsFromDirectory(directoryPath)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(validCtrfReport)
      expect(result[1]).toEqual(validCtrfReport)
    })

    it('should throw error when directory does not exist', () => {
      const directoryPath = '/path/to/nonexistent'
      mockFs.existsSync.mockReturnValue(false)

      expect(() => readReportsFromDirectory(directoryPath)).toThrow(
        /does not exist/
      )
    })

    it('should throw error when no valid CTRF reports are found', () => {
      const directoryPath = '/path/to/empty'
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['not-json.txt'] as any)

      expect(() => readReportsFromDirectory(directoryPath)).toThrow(
        /No valid CTRF reports found/
      )
    })

    it('should skip invalid files and warn about them', () => {
      const directoryPath = '/path/to/mixed'
      const validCtrfReport: Report = {
        reportFormat: 'ctrf',
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

      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['valid.json', 'invalid.json'] as any)
      mockFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(validCtrfReport))
        .mockReturnValueOnce(JSON.stringify({ invalid: 'data' }))

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = readReportsFromDirectory(directoryPath)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(validCtrfReport)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Skipping invalid CTRF report file: invalid.json'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('readReportsFromGlobPattern', () => {
    it('should read valid CTRF reports from glob pattern', () => {
      const pattern = 'reports/*.json'
      const validCtrfReport: Report = {
        reportFormat: 'ctrf',
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

      mockGlob.sync.mockReturnValue(['report1.json', 'report2.json'])
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validCtrfReport))

      const result = readReportsFromGlobPattern(pattern)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(validCtrfReport)
      expect(result[1]).toEqual(validCtrfReport)
    })

    it('should throw error when no files match the pattern', () => {
      const pattern = 'nonexistent/*.json'
      mockGlob.sync.mockReturnValue([])

      expect(() => readReportsFromGlobPattern(pattern)).toThrow(
        /No files found matching the pattern/
      )
    })

    it('should throw error when no valid CTRF reports are found', () => {
      const pattern = 'invalid/*.json'
      mockGlob.sync.mockReturnValue(['invalid.json'])
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ invalid: 'data' }))

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => readReportsFromGlobPattern(pattern)).toThrow(
        /No valid CTRF reports found/
      )

      consoleSpy.mockRestore()
    })
  })
})
