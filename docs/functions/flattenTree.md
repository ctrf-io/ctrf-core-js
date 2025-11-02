[**CTRF v0.0.17**](../README.md)

***

[CTRF](../README.md) / flattenTree

# Function: flattenTree()

> **flattenTree**(`nodes`): `object`[]

Defined in: [src/methods/tree-hierarchical-structure.ts:379](https://github.com/ctrf-io/ctrf-core-js/blob/main/src/methods/tree-hierarchical-structure.ts#L379)

Utility function to convert tree to a flat array with indentation information
Useful for displaying the tree in a linear format

## Parameters

### nodes

[`TreeNode`](../interfaces/TreeNode.md)[]

Array of tree nodes to flatten

## Returns

`object`[]

Array of objects containing node, depth, and nodeType information
