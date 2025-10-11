import { createHash } from 'crypto'
import type { Test, Report } from '../../types/ctrf.js'

/**
 * The CTRF namespace UUID used for generating deterministic test IDs.
 * This namespace ensures that all CTRF test IDs are generated consistently
 * across different implementations and tools.
 *
 * @public
 */
export const CTRF_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * Generates a deterministic UUID v5 based on test properties
 * @param name - Test name
 * @param suite - Test suite path
 * @param filePath - Test file path
 * @returns A deterministic UUID v5 string based on the properties
 */
function generateTestId(
  name: string,
  suite?: string[],
  filePath?: string
): string {
  const suiteString = suite ? suite.join('/') : ''
  const identifier = `${name}|${suiteString}|${filePath || ''}`

  const namespaceBytes = CTRF_NAMESPACE.replace(/-/g, '')
    .match(/.{2}/g)!
    .map(byte => parseInt(byte, 16))

  const input = Buffer.concat([
    Buffer.from(namespaceBytes),
    Buffer.from(identifier, 'utf8'),
  ])

  const hash = createHash('sha1').update(input).digest('hex')

  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '5' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
      hash.substring(17, 20),
    hash.substring(20, 32),
  ].join('-')

  return uuid
}

/**
 * Sets a test ID for a test object based on its properties
 * @param test - The test object to add an ID to
 * @returns The test object with the ID set
 */
export function setTestId(test: Test): Test {
  if (!test.id) {
    test.id = generateTestId(test.name, test.suite, test.filePath)
  }
  return test
}

/**
 * Gets the test ID from a test object, generating one if it doesn't exist
 * @param test - The test object to get the ID from
 * @returns The test ID
 */
export function getTestId(test: Test): string {
  if (!test.id) {
    test.id = generateTestId(test.name, test.suite, test.filePath)
  }
  return test.id
}

/**
 * Sets test IDs for all tests in a report
 * @param report - The CTRF report
 * @returns The report with test IDs set for all tests
 */
export function setTestIdsForReport(report: Report): Report {
  report.results.tests.forEach(test => setTestId(test))
  return report
}

/**
 * Finds a test by its ID in a report
 * @param report - The CTRF report
 * @param testId - The test ID to search for
 * @returns The test object if found, undefined otherwise
 */
export function findTestById(report: Report, testId: string): Test | undefined {
  return report.results.tests.find(test => test.id === testId)
}

/**
 * Generates a new test ID based on test properties (exposed utility)
 * @param name - Test name
 * @param suite - Test suite path
 * @param filePath - Test file path
 * @returns A deterministic UUID v5 string based on the properties
 */
export function generateTestIdFromProperties(
  name: string,
  suite?: string[],
  filePath?: string
): string {
  return generateTestId(name, suite, filePath)
}
