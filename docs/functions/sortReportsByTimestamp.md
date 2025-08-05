[**CTRF v0.0.13-next.4**](../README.md)

***

[CTRF](../README.md) / sortReportsByTimestamp

# Function: sortReportsByTimestamp()

> **sortReportsByTimestamp**(`reports`, `order`): [`Report`](../interfaces/Report.md)[]

Defined in: [src/methods/utilities/sort-reports.ts:38](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/utilities/sort-reports.ts#L38)

Sorts CTRF reports by their timestamp.

This function uses a fallback strategy for timestamp selection:
1. First tries to use `report.timestamp` if available
2. Falls back to `report.results.summary.stop` if `timestamp` is not available
3. Reports without any timestamp are sorted to the end of the array

## Parameters

### reports

[`Report`](../interfaces/Report.md)[]

Array of CTRF reports to sort

### order

[`SortOrder`](../enumerations/SortOrder.md) = `SortOrder.DESC`

Sort order: SortOrder.DESC for newest first (default), SortOrder.ASC for oldest first

## Returns

[`Report`](../interfaces/Report.md)[]

A new array with reports sorted by timestamp

## Example

```typescript
const unsortedReports = [report1, report2, report3];

const newestFirst = sortReportsByTimestamp(unsortedReports);
// newestFirst[0] will be the most recent report

const oldestFirst = sortReportsByTimestamp(unsortedReports, SortOrder.ASC);
// oldestFirst[0] will be the oldest report

const newestFirst = sortReportsByTimestamp(unsortedReports, SortOrder.DESC);
```
