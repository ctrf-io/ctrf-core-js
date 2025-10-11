/**
 * CTRF Runtime Module
 *
 * Core runtime library for CTRF reporters.
 * Provides AsyncLocalStorage-based context management for test metadata.
 * 100% framework-agnostic.
 */

export { CtrfRuntime, ctrfRuntime, mergeTestData } from './runtime.js'
export { ctrf, runtime } from './api.js'
export type { TestContext } from './runtime.js'
