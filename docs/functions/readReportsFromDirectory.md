[**CTRF v0.0.13-next.5**](../README.md)

***

[CTRF](../README.md) / readReportsFromDirectory

# Function: readReportsFromDirectory()

> **readReportsFromDirectory**(`directoryPath`): [`Report`](../interfaces/Report.md)[]

Defined in: [src/methods/read-reports.ts:48](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/read-reports.ts#L48)

Reads all CTRF report files from a given directory.

## Parameters

### directoryPath

`string`

Path to the directory containing JSON files.

## Returns

[`Report`](../interfaces/Report.md)[]

An array of parsed `CtrfReport` objects.

## Throws

If the directory does not exist or no valid CTRF reports are found.
