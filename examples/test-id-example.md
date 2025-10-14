# Test ID Operations Example

This example demonstrates how to use the new deterministic test ID functionality.

```typescript
import {
  setTestId,
  getTestId,
  setTestIdsForReport,
  findTestById,
  generateTestIdFromProperties,
} from 'ctrf'
import type { Test, Report } from 'ctrf'

// Example test object
const test: Test = {
  name: 'should authenticate user',
  status: 'passed',
  duration: 150,
  suite: ['auth', 'login'],
  filePath: 'src/auth/login.test.ts',
}

// Set a test ID (generates deterministic UUID based on properties)
setTestId(test)
console.log('Test ID:', test.id) // Always the same UUID for these properties!

// Get a test ID (generates one if not present)
const testId = getTestId(test)
console.log('Test ID:', testId) // Same as above

// Generate a test ID from properties - always deterministic!
const customId = generateTestIdFromProperties(
  'my test',
  ['suite1', 'suite2'],
  'my-test.ts'
)
console.log('Generated ID:', customId) // Always the same for these inputs

// Demonstrate deterministic behavior
const sameId = generateTestIdFromProperties(
  'my test',
  ['suite1', 'suite2'],
  'my-test.ts'
)
console.log('Same ID?', customId === sameId) // true!

// Set IDs for all tests in a report
const report: Report = {
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
      start: Date.now(),
      stop: Date.now() + 1000,
    },
    tests: [
      {
        name: 'test 1',
        status: 'passed',
        duration: 100,
        suite: ['unit'],
        filePath: 'test1.ts',
      },
      {
        name: 'test 2',
        status: 'passed',
        duration: 200,
        suite: ['integration'],
        filePath: 'test2.ts',
      },
    ],
  },
}

// Set IDs for all tests
setTestIdsForReport(report)

// Find a test by its ID
const foundTest = findTestById(report, report.results.tests[0].id!)
console.log('Found test:', foundTest?.name)
```

## Key Features

1. **Deterministic UUIDs**: Same test properties always generate the same UUID
2. **Proper UUID format**: Valid UUIDs that follow the standard format
3. **Non-destructive**: Won't overwrite existing IDs
4. **Property-based**: Uses test name, suite, and filePath for generation
5. **Report-level operations**: Can process entire reports at once
6. **Search functionality**: Find tests by their deterministic IDs
7. **Consistent across runs**: Same test will always have the same ID
