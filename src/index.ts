/**
 * @group Methods
 */
export { mergeReports } from './methods/merge-reports.js'
/**
 * @group Methods
 */
export { readReportsFromDirectory } from './methods/read-reports.js'
/**
 * @group Methods
 */
export { readReportsFromGlobPattern } from './methods/read-reports.js'
/**
 * @group Methods
 */
export { enrichReportWithInsights } from './methods/run-insights.js'
/**
 * @group Methods
 */
export {
  sortReportsByTimestamp,
  SortOrder,
} from './methods/utilities/sort-reports.js'
/**
 * @group Methods
 */
export { storePreviousResults } from './methods/store-previous-results.js'
/**
 * @group Methods
 */
export { readReportFromFile } from './methods/read-reports.js'
/**
 * @group Methods
 */
export {
  validateReport,
  validateReportStrict,
  isValidCtrfReport,
} from './methods/validate-schema.js'
/**
 * @group Methods
 */
export {
  organizeTestsBySuite,
  traverseTree,
  findSuiteByName,
  findTestByName,
  flattenTree,
  getAllTests,
  getSuiteStats,
} from './methods/tree-hierarchical-structure.js'

/**
 * @group Schema
 */
export type {
  Report,
  Results,
  Summary,
  Test,
  Environment,
  Tool,
  Step,
  Attachment,
  RetryAttempt,
  RootInsights,
  TestInsights,
  Baseline,
  InsightsMetric,
  TestStatus,
} from '../types/ctrf.js'

/**
 * @group Utility Types
 */
export type {
  TreeNode,
  TreeTest,
  TreeOptions,
  TestTree,
} from './methods/tree-hierarchical-structure.js'

/**
 * @group Utility Types
 */
export type { ValidationResult } from './methods/validate-schema.js'
