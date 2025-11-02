[**CTRF v0.0.17**](../README.md)

***

[CTRF](../README.md) / readReportFromFile

# Function: readReportFromFile()

> **readReportFromFile**(`filePath`): [`Report`](../interfaces/Report.md)

Defined in: [src/methods/read-reports.ts:13](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/read-reports.ts#L13)

Reads a single CTRF report file from a specified path.

## Parameters

### filePath

`string`

Path to the JSON file containing the CTRF report.

## Returns

[`Report`](../interfaces/Report.md)

The parsed `CtrfReport` object.

## Throws

If the file does not exist, is not a valid JSON, or does not conform to the `CtrfReport` structure.
