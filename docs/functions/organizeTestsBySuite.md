[**CTRF v0.0.16**](../README.md)

***

[CTRF](../README.md) / organizeTestsBySuite

# Function: organizeTestsBySuite()

> **organizeTestsBySuite**(`tests`, `options`): [`TestTree`](../interfaces/TestTree.md)

Defined in: [src/methods/tree-hierarchical-structure.ts:92](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L92)

Organizes CTRF tests into a hierarchical tree structure based on the suite property.

The function handles array format (['suite1', 'suite2', 'suite3']) for the suite property
as defined in the CTRF schema. The output follows the CTRF Suite Tree schema specification.

## Parameters

### tests

[`Test`](../interfaces/Test.md)[]

Array of CTRF test objects

### options

[`TreeOptions`](../interfaces/TreeOptions.md) = `{}`

Options for controlling tree creation

## Returns

[`TestTree`](../interfaces/TestTree.md)

TestTree object containing the hierarchical structure and statistics

## Example

```typescript
import { organizeTestsBySuite } from 'ctrf-js-common'

const tests = [
  {
    name: 'should login successfully',
    status: 'passed',
    duration: 150,
    suite: ['Authentication', 'Login']
  },
  {
    name: 'should logout successfully',
    status: 'passed',
    duration: 100,
    suite: ['Authentication', 'Logout']
  }
]

const tree = organizeTestsBySuite(tests)

// For structure-only without summary statistics:
// const tree = organizeTestsBySuite(tests, { includeSummary: false })

// Convert to JSON for machine consumption
const treeJson = JSON.stringify(tree, null, 2)

console.log(tree.roots[0].name) // 'Authentication'
console.log(tree.roots[0].suites.length) // 2 (Login, Logout)
```
