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
npm install ctrf@0.0.13-next.5
```

## API reference

See [API reference](./docs) for more details.

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
