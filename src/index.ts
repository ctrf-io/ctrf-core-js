export { mergeReports } from './methods/merge-reports.js';
export { readReportsFromDirectory } from './methods/read-reports.js';
export { readReportsFromGlobPattern } from './methods/read-reports.js';
export { 
  enrichReportWithInsights,
} from './methods/run-insights.js';
export { storePreviousResults } from './methods/store-previous-results.js';
export { readReportFromFile } from './methods/read-reports.js';

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
  Insights,
  TestInsights,
  InsightsMetric,
  TestStatus
} from '../types/ctrf.js';

