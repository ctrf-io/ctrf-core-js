[**CTRF v0.0.16**](../README.md)

***

[CTRF](../README.md) / mergeTestData

# Function: mergeTestData()

> **mergeTestData**\<`T`\>(`reporterTest`, `runtimeContext`): `T`

Defined in: [src/runtime/runtime.ts:213](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L213)

Merges reporter test data with runtime context metadata.

Reporter data takes precedence. Runtime context enriches only the `extra`
field. In case of key conflicts in `extra`, reporter values win.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `any`\>

## Parameters

### reporterTest

`T`

Test data from framework reporter (source of truth)

### runtimeContext

Context from ctrfRuntime.endTestContext()

`undefined` | [`TestContext`](../interfaces/TestContext.md)

## Returns

`T`

Merged test object with enriched extra metadata

## Example

```typescript
const merged = mergeTestData(
  { name: 'test', status: 'passed', extra: { framework: 'data' } },
  { name: 'test', extra: { runtime: 'metadata', framework: 'ignored' } }
)
// Result: { name: 'test', status: 'passed', extra: { runtime: 'metadata', framework: 'data' } }
```
