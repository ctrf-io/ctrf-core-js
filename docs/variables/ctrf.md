[**CTRF v0.0.16**](../README.md)

***

[CTRF](../README.md) / ctrf

# Variable: ctrf

> `const` **ctrf**: `object`

Defined in: [src/runtime/api.ts:18](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/api.ts#L18)

Lightweight helper API for CTRF runtime operations

Provides simple functions for adding metadata during test execution.
Framework-agnostic and designed to work with any test runner.

## Type declaration

### test

> **test**: `object`

Test-related operations

#### test.addExtra()

> **addExtra**: (`key`, `value`) => `Promise`\<`void`\>

Adds extra metadata to the current test

##### Parameters

###### key

`string`

The metadata key

###### value

`unknown`

The metadata value

##### Returns

`Promise`\<`void`\>

##### Example

```typescript
await ctrf.test.addExtra('env', 'staging')
await ctrf.test.addExtra('buildNumber', '2025.10.001')
await ctrf.test.addExtra('browser', 'chromium')
```

#### test.getCurrentContext()

> **getCurrentContext**: () => `Promise`\<`undefined` \| [`TestContext`](../interfaces/TestContext.md)\>

Gets the current test context (read-only)

##### Returns

`Promise`\<`undefined` \| [`TestContext`](../interfaces/TestContext.md)\>

The current test context or undefined

##### Example

```typescript
const context = await ctrf.test.getCurrentContext()
if (context) {
  console.log('Current test:', context.name)
}
```

#### test.hasActiveContext()

> **hasActiveContext**: () => `Promise`\<`boolean`\>

Checks if there's an active test context

##### Returns

`Promise`\<`boolean`\>

true if there's an active context

##### Example

```typescript
if (await ctrf.test.hasActiveContext()) {
  await ctrf.test.addExtra('contextFound', true)
}
```

## Example

```typescript
import { ctrf } from 'ctrf'

// In your test
await ctrf.test.addExtra('env', 'staging')
await ctrf.test.addExtra('buildNumber', '2025.10.001')
```
