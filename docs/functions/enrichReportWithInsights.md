[**CTRF v0.0.13-next.6**](../README.md)

***

[CTRF](../README.md) / enrichReportWithInsights

# Function: enrichReportWithInsights()

> **enrichReportWithInsights**(`currentReport`, `previousReports`, `baseline?`): [`Report`](../interfaces/Report.md)

Defined in: [src/methods/run-insights.ts:824](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/run-insights.ts#L824)

## Parameters

### currentReport

[`Report`](../interfaces/Report.md)

The current CTRF report to enrich

### previousReports

[`Report`](../interfaces/Report.md)[] = `[]`

Array of historical CTRF reports

### baseline?

[`Report`](../interfaces/Report.md)

Optional baseline report to compare against. If not provided, no baseline comparisons are made.

## Returns

[`Report`](../interfaces/Report.md)

The current report fully enriched with run-level insights, test-level insights, and baseline comparisons (if baseline provided)
