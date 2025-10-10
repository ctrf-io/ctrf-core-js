[**CTRF v0.0.16**](../README.md)

***

[CTRF](../README.md) / traverseTree

# Function: traverseTree()

> **traverseTree**(`nodes`, `callback`, `depth`): `void`

Defined in: src/methods/tree-hierarchical-structure.ts:302

Utility function to traverse the tree and apply a function to each node

## Parameters

### nodes

[`TreeNode`](../interfaces/TreeNode.md)[]

Array of tree nodes to traverse

### callback

(`node`, `depth`, `nodeType`) => `void`

Function to call for each node (suites and tests)

### depth

`number` = `0`

Current depth in the tree (starts at 0)

## Returns

`void`
