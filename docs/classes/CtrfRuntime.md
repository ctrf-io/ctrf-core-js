[**CTRF v0.0.16**](../README.md)

***

[CTRF](../README.md) / CtrfRuntime

# Class: CtrfRuntime

Defined in: [src/runtime/runtime.ts:48](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L48)

AsyncLocalStorage-based test context manager.

Provides isolated execution contexts for concurrent test scenarios using
Node.js AsyncLocalStorage. Context data persists across async boundaries
within the same logical test execution.

## Example

```typescript
const runtime = new CtrfRuntime()
runtime.startTestContext('test-name')
runtime.addExtra('key', 'value')
const context = runtime.endTestContext()
```

## Constructors

### Constructor

> **new CtrfRuntime**(): `CtrfRuntime`

#### Returns

`CtrfRuntime`

## Methods

### addExtra()

> **addExtra**(`key`, `value`): `void`

Defined in: [src/runtime/runtime.ts:108](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L108)

Adds key-value pair to current context's extra object.

Mutates the active context's extra property. Creates extra object if
it doesn't exist. All values must be JSON-serializable.

#### Parameters

##### key

`string`

Property key for metadata

##### value

`unknown`

JSON-serializable value

#### Returns

`void`

#### Throws

When no active AsyncLocalStorage context exists

#### Example

```typescript
runtime.addExtra('priority', 'high')
runtime.addExtra('tags', ['smoke', 'regression'])
runtime.addExtra('metadata', { browser: 'chrome', viewport: '1920x1080' })
```

***

### endTestContext()

> **endTestContext**(): `undefined` \| [`TestContext`](../interfaces/TestContext.md)

Defined in: [src/runtime/runtime.ts:139](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L139)

Returns shallow copy of current context and exits AsyncLocalStorage scope.

Context data is intended for enrichment only. Reporter implementations
should merge only the `extra` field with their test data.

#### Returns

`undefined` \| [`TestContext`](../interfaces/TestContext.md)

Shallow copy of TestContext or undefined if no active context

#### Example

```typescript
const context = runtime.endTestContext()
if (context) {
  const enriched = { ...reporterData, extra: { ...context.extra, ...reporterData.extra } }
}
```

***

### getCurrentContext()

> **getCurrentContext**(): `undefined` \| [`TestContext`](../interfaces/TestContext.md)

Defined in: [src/runtime/runtime.ts:162](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L162)

Returns current AsyncLocalStorage context without modifying it.

#### Returns

`undefined` \| [`TestContext`](../interfaces/TestContext.md)

Current TestContext or undefined if no active context

#### Example

```typescript
const current = runtime.getCurrentContext()
if (current?.extra?.skipCleanup) {
  // conditional logic based on context
}
```

***

### hasActiveContext()

> **hasActiveContext**(): `boolean`

Defined in: [src/runtime/runtime.ts:178](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L178)

Checks for active AsyncLocalStorage context existence.

#### Returns

`boolean`

true if context exists, false otherwise

#### Example

```typescript
if (runtime.hasActiveContext()) {
  runtime.addExtra('key', 'value')
}
```

***

### startTestContext()

> **startTestContext**(`name`, `options?`): `void`

Defined in: [src/runtime/runtime.ts:71](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/runtime/runtime.ts#L71)

Creates new AsyncLocalStorage context and enters it synchronously.

#### Parameters

##### name

`string`

Test identifier string

##### options?

Optional context metadata

###### filePath?

`string`

Absolute path to test file

###### id?

`string`

Unique test identifier

###### suite?

`string`[]

Suite hierarchy array

#### Returns

`void`

#### Throws

None - always succeeds

#### Example

```typescript
runtime.startTestContext('user login test', {
  suite: ['auth', 'integration'],
  filePath: '/tests/auth.spec.ts',
  id: 'declarative-uuid'
})
```
