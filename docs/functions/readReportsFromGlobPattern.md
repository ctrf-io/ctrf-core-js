[**CTRF v0.0.13-next.5**](../README.md)

***

[CTRF](../README.md) / readReportsFromGlobPattern

# Function: readReportsFromGlobPattern()

> **readReportsFromGlobPattern**(`pattern`): [`Report`](../interfaces/Report.md)[]

Defined in: [src/methods/read-reports.ts:95](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/read-reports.ts#L95)

Reads all CTRF report files matching a glob pattern.

## Parameters

### pattern

`string`

The glob pattern to match files (e.g., ctrf/*.json).

## Returns

[`Report`](../interfaces/Report.md)[]

An array of parsed `CtrfReport` objects.

## Throws

If no valid CTRF reports are found.
