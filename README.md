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
Explore more <a href="https://www.ctrf.io/integrations">integrations</a> <br/>
We’d love your feedback, <a href="https://app.formbricks.com/s/cmefs524mhlh1tl01gkpvefrb">share it anonymously</a>.

</p>
</div>

## Installation

```sh
npm install ctrf
```

## API Reference

### Schema Types

- [Attachment](docs/interfaces/Attachment.md)
- [Baseline](docs/interfaces/Baseline.md)
- [Environment](docs/interfaces/Environment.md)
- [InsightsMetric](docs/interfaces/InsightsMetric.md)
- [Report](docs/interfaces/Report.md)
- [Results](docs/interfaces/Results.md)
- [RetryAttempt](docs/interfaces/RetryAttempt.md)
- [RootInsights](docs/interfaces/RootInsights.md)
- [Step](docs/interfaces/Step.md)
- [Summary](docs/interfaces/Summary.md)
- [Test](docs/interfaces/Test.md)
- [TestInsights](docs/interfaces/TestInsights.md)
- [Tool](docs/interfaces/Tool.md)
- [TestStatus](docs/type-aliases/TestStatus.md)

### File Operations Methods

- [readReportFromFile](docs/functions/readReportFromFile.md)
- [readReportsFromDirectory](docs/functions/readReportsFromDirectory.md)
- [readReportsFromGlobPattern](docs/functions/readReportsFromGlobPattern.md)

### Report Processing Methods

- [enrichReportWithInsights](docs/functions/enrichReportWithInsights.md)
- [mergeReports](docs/functions/mergeReports.md)
- [sortReportsByTimestamp](docs/functions/sortReportsByTimestamp.md)
- [storePreviousResults](docs/functions/storePreviousResults.md)

### Validation Methods

- [isValidCtrfReport](docs/functions/isValidCtrfReport.md)
- [validateReport](docs/functions/validateReport.md)
- [validateReportStrict](docs/functions/validateReportStrict.md)

### Tree Operations Methods

- [findSuiteByName](docs/functions/findSuiteByName.md)
- [findTestByName](docs/functions/findTestByName.md)
- [flattenTree](docs/functions/flattenTree.md)
- [getAllTests](docs/functions/getAllTests.md)
- [getSuiteStats](docs/functions/getSuiteStats.md)
- [organizeTestsBySuite](docs/functions/organizeTestsBySuite.md)
- [traverseTree](docs/functions/traverseTree.md)

### Utility Types

- [SortOrder](docs/enumerations/SortOrder.md) (enumeration)
- [TestTree](docs/interfaces/TestTree.md)
- [TreeNode](docs/interfaces/TreeNode.md)
- [TreeOptions](docs/interfaces/TreeOptions.md)
- [ValidationResult](docs/interfaces/ValidationResult.md)
- [TreeTest](docs/type-aliases/TreeTest.md)

## TypeScript Types

The library exports comprehensive TypeScript types for working with CTRF reports:

```typescript
import type { Report, Test, Insights } from "ctrf";

function analyzeReport(report: Report): void {
  const flakyTests = report.results.tests.filter((test: Test) => test.flaky);
  const insights = report.insights as Insights;

  console.log(`Flaky rate: ${insights?.flakyRate.current}`);
}
```

## What is CTRF?

CTRF is a universal JSON test report schema that addresses the lack of a standardized format for JSON test reports.

**Consistency Across Tools:** Different testing tools and frameworks often produce reports in varied formats. CTRF ensures a uniform structure, making it easier to understand and compare reports, regardless of the testing tool used.

**Language and Framework Agnostic:** It provides a universal reporting schema that works seamlessly with any programming language and testing framework.

**Facilitates Better Analysis:** With a standardized format, programatically analyzing test outcomes across multiple platforms becomes more straightforward.

## Support Us

If you find this project useful, consider giving it a GitHub star ⭐ It means a lot to us.
