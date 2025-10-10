[**CTRF v0.0.16**](../README.md)

***

[CTRF](../README.md) / TreeNode

# Interface: TreeNode

Defined in: [src/methods/tree-hierarchical-structure.ts:16](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L16)

Represents a tree node (suite) that can contain tests and child suites
Following the CTRF Suite Tree schema specification

## Properties

### duration

> **duration**: `number`

Defined in: [src/methods/tree-hierarchical-structure.ts:22](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L22)

Total duration of all tests in this suite and children

***

### extra?

> `optional` **extra**: `Record`\<`string`, `unknown`\>

Defined in: [src/methods/tree-hierarchical-structure.ts:30](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L30)

Additional properties

***

### name

> **name**: `string`

Defined in: [src/methods/tree-hierarchical-structure.ts:18](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L18)

The name of this suite

***

### status

> **status**: [`TestStatus`](../type-aliases/TestStatus.md)

Defined in: [src/methods/tree-hierarchical-structure.ts:20](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L20)

The status of this suite (derived from child test results)

***

### suites

> **suites**: `TreeNode`[]

Defined in: [src/methods/tree-hierarchical-structure.ts:28](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L28)

Child suites contained within this suite

***

### summary?

> `optional` **summary**: [`Summary`](Summary.md)

Defined in: [src/methods/tree-hierarchical-structure.ts:24](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L24)

Aggregated statistics for this suite (only present when includeSummary is true)

***

### tests

> **tests**: [`TreeTest`](../type-aliases/TreeTest.md)[]

Defined in: [src/methods/tree-hierarchical-structure.ts:26](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L26)

Tests directly contained in this suite
