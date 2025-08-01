# CTRF Common JavaScript Library

Common JavaScript library for working with CTRF reports, including type definitions and utility functions.

<div align="center">
<div style="padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border: 1px solid #30363d;">
<span style="font-size: 23px;">💚</span>
<h3 style="margin: 1rem 0;">CTRF tooling is open source and free to use</h3>
<p style="font-size: 16px;">You can support the project with a follow and a star</p>

<div style="margin-top: 1.5rem;">
<a href="https://github.com/ctrf-io/ctrf-core-js">
<img src="https://img.shields.io/github/stars/ctrf-io/ctrf-core-js?style=for-the-badge&color=2ea043" alt="GitHub stars">
</a>
<a href="https://github.com/ctrf-io">
<img src="https://img.shields.io/github/followers/ctrf-io?style=for-the-badge&color=2ea043" alt="GitHub followers">
</a>
</div>
</div>

<p style="font-size: 14px; margin: 1rem 0;">
Contributions are very welcome! <br/>
Explore more <a href="https://www.ctrf.io/integrations">integrations</a>
</p>
</div>

## Installation

```sh
npm install ctrf@0.0.13-next.1
```

## TypeScript Types

The library exports comprehensive TypeScript types for working with CTRF reports:

```typescript
import type { Report, Test, Insights } from 'ctrf';

function analyzeReport(report: Report): void {
  const flakyTests = report.results.tests.filter((test: Test) => test.flaky);
  const insights = report.insights as Insights;
  
  console.log(`Flaky rate: ${insights?.flakyRate.current}`);
}
```

## API Reference

### Reading Reports

#### `readSingleReport(filePath: string): Report`

Reads and parses a single CTRF report file from a specified file path.

**Parameters:**
- `filePath` - Path to the JSON file containing the CTRF report

**Returns:** The parsed `Report` object

**Throws:** Error if the file does not exist, is not valid JSON, or does not conform to the CTRF report structure

**Example:**
```typescript
import { readSingleReport } from 'ctrf';

const report = readSingleReport('./test-results.json');
console.log(`Found ${report.results.summary.tests} tests`);
```

#### `readReportsFromDirectory(directoryPath: string): Report[]`

Reads all CTRF report files from a given directory.

**Parameters:**
- `directoryPath` - Path to the directory containing JSON files

**Returns:** Array of parsed `Report` objects

**Throws:** Error if the directory does not exist or no valid CTRF reports are found

**Example:**
```typescript
import { readReportsFromDirectory } from 'ctrf';

const reports = readReportsFromDirectory('./test-reports/');
console.log(`Loaded ${reports.length} reports`);
```

#### `readReportsFromGlobPattern(pattern: string): Report[]`

Reads all CTRF report files matching a glob pattern.

**Parameters:**
- `pattern` - The glob pattern to match files (e.g., `ctrf/*.json`)

**Returns:** Array of parsed `Report` objects

**Throws:** Error if no valid CTRF reports are found

**Example:**
```typescript
import { readReportsFromGlobPattern } from 'ctrf';

const reports = readReportsFromGlobPattern('reports/**/*.json');
console.log(`Found ${reports.length} reports matching pattern`);
```

### Merging Reports

#### `mergeReports(reports: Report[]): Report`

Merges multiple CTRF reports into a single report. Combines test results, summaries, and metadata from all input reports.

**Parameters:**
- `reports` - Array of CTRF report objects to be merged

**Returns:** The merged CTRF report object

**Throws:** Error if no reports are provided for merging

**Example:**
```typescript
import { mergeReports, readReportsFromDirectory } from 'ctrf';

const reports = readReportsFromDirectory('./test-reports/');
const mergedReport = mergeReports(reports);
console.log(`Merged ${reports.length} reports into one`);
```

### Report Enrichment & Insights

#### `enrichReportWithInsights(currentReport: Report, previousReports?: Report[], baseline?: number | string): Report`

Enriches a CTRF report with comprehensive insights by analyzing current and historical test data. Calculates metrics like flaky rates, failure rates, and performance trends.

**Parameters:**
- `currentReport` - The current CTRF report to enrich
- `previousReports` - Array of historical CTRF reports (ordered newest to oldest, optional)
- `baseline` - Optional baseline specification:
  - `undefined`: Use most recent previous report (default)
  - `number`: Use report at this index in previousReports array (0 = most recent)
  - `string`: Use report with specific timestamp ID

**Returns:** The current report enriched with insights

**Example:**
```typescript
import { enrichReportWithInsights, readSingleReport } from 'ctrf';

const currentReport = readSingleReport('./current-report.json');
const previousReports = readReportsFromDirectory('./historical-reports/');

const enrichedReport = enrichReportWithInsights(currentReport, previousReports);
console.log(`Flaky rate: ${enrichedReport.insights?.flakyRate.current}`);
```

### Storing Previous Results

#### `storePreviousResults(currentReport: Report, previousReports: Report[]): Report`

Stores previous test run results in the current report's metadata. Extracts key metrics from historical reports for trend analysis.

**Parameters:**
- `currentReport` - The current CTRF report to enrich with previous results
- `previousReports` - Array of previous CTRF reports to extract metrics from

**Returns:** The current report with previousResults populated in the `extra` field

**Example:**
```typescript
import { storePreviousResults, readSingleReport } from 'ctrf';

const currentReport = readSingleReport('./current-report.json');
const previousReports = readReportsFromDirectory('./historical-reports/');

const reportWithHistory = storePreviousResults(currentReport, previousReports);
console.log(`Stored ${reportWithHistory.extra?.previousResults?.length} previous results`);
```

### Utility Functions

#### `isTestFlaky(test: Test): boolean`

Determines if a test is flaky based on its retries and status.

**Parameters:**
- `test` - The CTRF test to evaluate

**Returns:** `true` if the test is considered flaky, otherwise `false`

#### `formatAsPercentage(ratio: number, decimals?: number): string`

Formats a ratio (0-1) as a percentage string for display.

**Parameters:**
- `ratio` - The ratio to format (0-1)
- `decimals` - Number of decimal places (default: 2)

**Returns:** Formatted percentage string (e.g., "25.50%")

#### `formatInsightsMetricAsPercentage(metric: InsightsMetric, decimals?: number): object`

Formats an InsightsMetric as percentage strings for display.

**Parameters:**
- `metric` - The insights metric to format
- `decimals` - Number of decimal places (default: 2)

**Returns:** Object with formatted percentage strings for current, previous, and change values

## What is CTRF?

CTRF is a universal JSON test report schema that addresses the lack of a standardized format for JSON test reports.

**Consistency Across Tools:** Different testing tools and frameworks often produce reports in varied formats. CTRF ensures a uniform structure, making it easier to understand and compare reports, regardless of the testing tool used.

**Language and Framework Agnostic:** It provides a universal reporting schema that works seamlessly with any programming language and testing framework.

**Facilitates Better Analysis:** With a standardized format, programatically analyzing test outcomes across multiple platforms becomes more straightforward.

## Support Us

If you find this project useful, consider giving it a GitHub star ⭐ It means a lot to us.
