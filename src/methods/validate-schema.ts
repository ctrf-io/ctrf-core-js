import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Report } from '../../types/ctrf.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const schemaPath = path.resolve(__dirname, '../ctrf-schema.json')
const ctrfSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))

/**
 * Interface for validation result
 */
export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

/**
 * Simple check to verify if an object is a CTRF report by checking the reportFormat
 * @param report - The object to check
 * @returns boolean indicating if the object has the correct CTRF reportFormat
 */
export function isValidCtrfReport(
  report: unknown
): report is { reportFormat: 'CTRF' } {
  return (
    typeof report === 'object' &&
    report !== null &&
    'reportFormat' in report &&
    (report as any).reportFormat === 'CTRF'
  )
}

/**
 * Validates a CTRF report against the JSON schema
 * @param report - The CTRF report object to validate
 * @returns ValidationResult object containing validation status and any errors
 */
export function validateReport(report: unknown): ValidationResult {
  const ajv = new Ajv({ allErrors: true })
  addFormats(ajv)

  const validate = ajv.compile(ctrfSchema)

  const valid = validate(report)

  if (valid) {
    return { valid: true }
  } else {
    const errors = validate.errors?.map(error => {
      const instancePath = error.instancePath || 'root'
      const message = error.message || 'Unknown error'
      return `${instancePath}: ${message}`
    }) || ['Unknown validation error']

    return { valid: false, errors }
  }
}

/**
 * Validates a CTRF report and throws an error if invalid
 * @param report - The CTRF report object to validate
 * @throws Error if the report is invalid
 */
export function validateReportStrict(
  report: unknown
): asserts report is Report {
  const result = validateReport(report)

  if (!result.valid) {
    const errorMessage = result.errors?.join('\n') || 'Invalid CTRF schema'
    throw new Error(`CTRF schema validation failed:\n${errorMessage}`)
  }
}
