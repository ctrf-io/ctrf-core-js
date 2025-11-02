[**CTRF v0.0.17**](../README.md)

***

[CTRF](../README.md) / generateTestIdFromProperties

# Function: generateTestIdFromProperties()

> **generateTestIdFromProperties**(`name`, `suite?`, `filePath?`): `string`

Defined in: [src/methods/test-id.ts:102](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/test-id.ts#L102)

Generates a new test ID based on test properties (exposed utility)

## Parameters

### name

`string`

Test name

### suite?

`string`[]

Test suite path

### filePath?

`string`

Test file path

## Returns

`string`

A deterministic UUID v5 string based on the properties
