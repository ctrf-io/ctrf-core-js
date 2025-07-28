export interface Report {
  reportFormat: string
  specVersion: string
  reportId?: string
  timestamp?: number
  generatedBy?: string
  results: Results
  insights?: Insights
  extra?: Record<string, unknown>
}

export interface Results {
  tool: Tool
  summary: Summary
  tests: Test[]
  environment?: Environment
  extra?: Record<string, unknown>
}

export interface Summary {
  tests: number
  passed: number
  failed: number
  skipped: number
  pending: number
  other: number
  suites?: number
  start: number
  stop: number
  extra?: Record<string, unknown>
}

export interface Test {
  id?: string
  name: string
  status: TestState
  duration: number
  start?: number
  stop?: number
  suite?: string
  message?: string
  trace?: string
  snippet?: string
  line?: number
  ai?: string
  rawStatus?: string
  tags?: string[]
  type?: string
  filePath?: string
  retries?: number
  flaky?: boolean
  stdout?: string[]
  stderr?: string[]
  threadId?: string
  attachments?: Attachment[]
  retryAttempts?: RetryAttempts[]
  browser?: string
  device?: string
  screenshot?: string
  parameters?: Record<string, unknown>
  steps?: Step[]
  insights?: TestInsights
  extra?: Record<string, unknown>
}

export interface Environment {
  reportName?: string
  appName?: string
  appVersion?: string
  osPlatform?: string
  osRelease?: string
  osVersion?: string
  buildId?: string
  buildName?: string
  buildNumber?: string
  buildUrl?: string
  repositoryName?: string
  repositoryUrl?: string
  commit?: string
  branchName?: string
  testEnvironment?: string
  extra?: Record<string, unknown>
}

export interface Tool {
  name: string
  version?: string
  extra?: Record<string, unknown>
}

export interface Step {
  name: string
  status: TestState
  extra?: Record<string, unknown>
}

export interface Attachment {
  name: string
  contentType: string
  path: string
}

export interface RetryAttempts {
  retry: number; 
  status: TestState;
  rawStatus?: string;
  duration?: number;
  message?: string;
  trace?: string;
  snippet?: string;
  line?: number;
  stdout?: string[];
  stderr?: string[];
  start?: number;
  stop?: number;
  attachments?: Attachment[];
  extra?: Record<string, unknown>;
}

export interface Insights {
  flakyRate: InsightsMetric
  failRate: InsightsMetric
  skippedRate: InsightsMetric
  averageTestDuration: InsightsMetric
  averageRunDuration: InsightsMetric
  reportsAnalyzed: number
  extra?: Record<string, unknown>
}

export interface TestInsights {
  flakyRate: InsightsMetric
  failRate: InsightsMetric
  skippedRate: InsightsMetric
  averageTestDuration: InsightsMetric
  p95Duration: InsightsMetric
  appearsInRuns: number
  extra?: Record<string, unknown>
}

export interface InsightsMetric {
  current: number
  previous: number
  change: number
}

export type TestState =
  | 'passed'
  | 'failed'
  | 'skipped'
  | 'pending'
  | 'other'
