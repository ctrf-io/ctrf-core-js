[**CTRF v0.0.16**](../README.md)

***

[CTRF](../README.md) / TestContext

# Interface: TestContext

Defined in: [src/runtime/runtime.ts:20](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L20)

Test context data structure returned by runtime operations.

Fields are provided for enrichment only. Reporter implementations must
treat their framework data as authoritative for all non-extra fields.

## Example

```typescript
const context: TestContext = {
  name: 'should authenticate user',
  suite: ['auth', 'integration'],
  filePath: '/tests/auth.spec.ts',
  id: 'auth-001',
  extra: { priority: 'high', tags: ['smoke'] }
}
```

## Properties

### extra?

> `optional` **extra**: `Record`\<`string`, `unknown`\>

Defined in: [src/runtime/runtime.ts:30](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L30)

User-defined metadata for report enrichment

***

### filePath?

> `optional` **filePath**: `string`

Defined in: [src/runtime/runtime.ts:26](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L26)

Source file path - framework filePath takes precedence

***

### id?

> `optional` **id**: `string`

Defined in: [src/runtime/runtime.ts:28](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L28)

Unique test identifier for cross-referencing

***

### name

> **name**: `string`

Defined in: [src/runtime/runtime.ts:22](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L22)

Test identifier - framework name takes precedence

***

### suite?

> `optional` **suite**: `string`[]

Defined in: [src/runtime/runtime.ts:24](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L24)

Suite hierarchy array - framework suite takes precedence
