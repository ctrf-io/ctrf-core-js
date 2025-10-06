import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  enrichReportsWithInsights,
  EnrichmentConfig,
} from '../../scripts/enrich-reports'
import { Report, Test } from '../../types/ctrf.js'
import { CTRF_REPORT_FORMAT, CTRF_SPEC_VERSION } from '../constants'

/**
 * Test helper for creating and testing report enrichment scenarios
 */
export class ReportEnrichmentTestHelper {
  private tempDir: string
  private reportPaths: string[] = []

  constructor() {
    // Create a temporary directory for this test session
    this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctrf-test-'))
  }

  /**
   * Create a mock CTRF test
   */
  createMockTest(overrides: Partial<Test> = {}): Test {
    return {
      name: 'test-name',
      status: 'passed',
      duration: 100,
      ...overrides,
    }
  }

  /**
   * Create a mock CTRF report
   */
  createMockReport(
    tests: Test[],
    startTime: number = Date.now(),
    toolName: string = 'jest'
  ): Report {
    return {
      reportFormat: CTRF_REPORT_FORMAT,
      specVersion: CTRF_SPEC_VERSION,
      results: {
        tool: { name: toolName },
        summary: {
          tests: tests.length,
          passed: tests.filter(t => t.status === 'passed').length,
          failed: tests.filter(t => t.status === 'failed').length,
          skipped: tests.filter(t => t.status === 'skipped').length,
          pending: tests.filter(t => t.status === 'pending').length,
          other: tests.filter(
            t => !['passed', 'failed', 'skipped', 'pending'].includes(t.status)
          ).length,
          flaky: tests.filter(t => t.flaky === true).length,
          duration: tests.reduce((sum, t) => sum + t.duration, 0),
          start: startTime,
          stop: startTime + 5000,
        },
        tests,
      },
    }
  }

  /**
   * Add a report to the test scenario
   */
  addReport(report: Report, filename?: string): string {
    const reportPath = path.join(
      this.tempDir,
      filename || `report-${this.reportPaths.length + 1}.json`
    )
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    this.reportPaths.push(reportPath)
    return reportPath
  }

  /**
   * Add multiple reports with timestamps spaced apart
   */
  addReportsWithTimestamps(
    reportsData: Array<{ tests: Test[]; toolName?: string }>,
    intervalMs: number = 10000
  ): string[] {
    const baseTime = Date.now()
    const paths: string[] = []

    reportsData.forEach((reportData, index) => {
      const report = this.createMockReport(
        reportData.tests,
        baseTime - index * intervalMs, // Earlier reports have smaller timestamps
        reportData.toolName
      )
      const path = this.addReport(report, `report-${index + 1}.json`)
      paths.push(path)
    })

    return paths
  }

  /**
   * Create a typical flaky test scenario
   */
  createFlakyTestScenario(): {
    currentReport: Report
    previousReports: Report[]
    reportPaths: string[]
  } {
    const currentTests = [
      this.createMockTest({
        name: 'stable-test',
        status: 'passed',
        duration: 100,
      }),
      this.createMockTest({
        name: 'flaky-test',
        status: 'passed',
        retries: 2,
        flaky: true,
        duration: 150,
      }),
      this.createMockTest({
        name: 'failing-test',
        status: 'failed',
        duration: 200,
      }),
    ]

    const previousTests1 = [
      this.createMockTest({
        name: 'stable-test',
        status: 'passed',
        duration: 95,
      }),
      this.createMockTest({
        name: 'flaky-test',
        status: 'failed',
        duration: 180,
      }),
      this.createMockTest({
        name: 'failing-test',
        status: 'passed',
        duration: 190,
      }),
    ]

    const previousTests2 = [
      this.createMockTest({
        name: 'stable-test',
        status: 'passed',
        duration: 105,
      }),
      this.createMockTest({
        name: 'flaky-test',
        status: 'passed',
        retries: 1,
        flaky: true,
        duration: 160,
      }),
      this.createMockTest({
        name: 'failing-test',
        status: 'failed',
        duration: 210,
      }),
    ]

    const reportPaths = this.addReportsWithTimestamps([
      { tests: currentTests },
      { tests: previousTests1 },
      { tests: previousTests2 },
    ])

    const currentReport = this.createMockReport(currentTests)
    const previousReports = [
      this.createMockReport(previousTests1, Date.now() - 10000),
      this.createMockReport(previousTests2, Date.now() - 20000),
    ]

    return { currentReport, previousReports, reportPaths }
  }

  /**
   * Run enrichment on the collected reports
   */
  async enrichReports(
    outputFilename: string = 'enriched-report.json',
    verbose: boolean = false
  ): Promise<Report> {
    const config: EnrichmentConfig = {
      inputReports: this.reportPaths,
      outputPath: path.join(this.tempDir, outputFilename),
      verbose,
    }

    return await enrichReportsWithInsights(config)
  }

  /**
   * Get the path to the temporary directory
   */
  getTempDir(): string {
    return this.tempDir
  }

  /**
   * Get all report paths
   */
  getReportPaths(): string[] {
    return [...this.reportPaths]
  }

  /**
   * Read a file from the temp directory
   */
  readFile(filename: string): string {
    return fs.readFileSync(path.join(this.tempDir, filename), 'utf8')
  }

  /**
   * Check if a file exists in the temp directory
   */
  fileExists(filename: string): boolean {
    return fs.existsSync(path.join(this.tempDir, filename))
  }

  /**
   * Clean up all temporary files
   */
  cleanup(): void {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true })
    }
  }
}

/**
 * Simple helper function for quick testing
 */
export async function testReportEnrichment(
  reports: Report[],
  outputPath?: string
): Promise<Report> {
  const helper = new ReportEnrichmentTestHelper()

  try {
    // Add all reports
    reports.forEach((report, index) => {
      helper.addReport(report, `input-${index + 1}.json`)
    })

    // Run enrichment
    const result = await helper.enrichReports(outputPath, false)

    return result
  } finally {
    helper.cleanup()
  }
}
