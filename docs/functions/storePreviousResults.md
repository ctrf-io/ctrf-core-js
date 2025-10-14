[**CTRF v0.0.16**](../README.md)

***

[CTRF](../README.md) / storePreviousResults

# Function: storePreviousResults()

> **storePreviousResults**(`currentReport`, `previousReports`): [`Report`](../interfaces/Report.md)

Defined in: [src/methods/store-previous-results.ts:35](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/store-previous-results.ts#L35)

Stores previous results in the current report's previousResults array.
Extracts key metrics from each previous report and adds them to the current report.

## Parameters

### currentReport

[`Report`](../interfaces/Report.md)

The current CTRF report to enrich with previous results

### previousReports

[`Report`](../interfaces/Report.md)[]

Array of previous CTRF reports to extract metrics from

## Returns

[`Report`](../interfaces/Report.md)

The current report with previousResults populated
