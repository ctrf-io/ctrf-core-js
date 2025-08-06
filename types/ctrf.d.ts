export interface Report {
  reportFormat: string
  specVersion: string
  reportId?: string
  timestamp?: string
  generatedBy?: string
  results: Results
  insights?: Insights
  baseline?: Baseline
  extra?: Record<string, unknown>
}

export interface Results {
  tool: Tool
  summary: Summary
  metrics?: Metrics
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
  flaky?: number
  suites?: number
  start: number
  stop: number
  extra?: Record<string, unknown>
}

export interface Metrics {
  passRate?: number
  failRate?: number
  flakyRate?: number
  averageTestDuration?: number
  p95TestDuration?: number
  extra?: Record<string, unknown>
}

export interface Test {
  id?: string
  name: string
  status: TestStatus
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
  retryAttempts?: RetryAttempt[]
  flaky?: boolean
  stdout?: string[]
  stderr?: string[]
  threadId?: string
  attachments?: Attachment[]
  browser?: string
  device?: string
  screenshot?: string
  parameters?: Record<string, unknown>
  steps?: Step[]
  insights?: TestInsights
  baseline?: TestBaseline
  extra?: Record<string, unknown>
}

export interface TestBaseline {
  status: TestStatus
  duration: number
  extra?: Record<string, unknown>
}

export interface Environment {
  reportName?: string
  appName?: string
  appVersion?: string
  buildId?: string
  buildName?: string
  buildNumber?: string
  buildUrl?: string
  repositoryName?: string
  repositoryUrl?: string
  commit?: string
  branchName?: string
  osPlatform?: string
  osRelease?: string
  osVersion?: string
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
  status: TestStatus
  extra?: Record<string, unknown>
}

export interface Attachment {
  name: string
  contentType: string
  path: string
  extra?: Record<string, unknown>
}

export interface RetryAttempt {
  attempt: number
  status: TestStatus
  duration?: number
  message?: string
  trace?: string
  line?: number
  snippet?: string
  stdout?: string[]
  stderr?: string[]
  start?: number
  stop?: number
  attachments?: Attachment[]
  extra?: Record<string, unknown>
}

export interface Insights {
  runsAnalyzed?: number
  passRate?: InsightsMetric
  failRate?: InsightsMetric
  flakyRate?: InsightsMetric
  averageRunDuration?: InsightsMetric
  p95RunDuration?: InsightsMetric
  averageTestDuration?: InsightsMetric
  extra?: Record<string, unknown>
}

export interface TestInsights {
  passRate?: InsightsMetric
  failRate?: InsightsMetric
  flakyRate?: InsightsMetric
  averageTestDuration?: InsightsMetric
  p95TestDuration?: InsightsMetric
  executedInRuns?: number
  extra?: Record<string, unknown>
}

export interface InsightsMetric {
  current: number
  baseline: number
  change: number
}

export interface Baseline {
  reportId: string
  source?: string
  timestamp?: string
  buildName?: string
  buildNumber?: string
  buildUrl?: string
  extra?: Record<string, unknown>
}

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'pending' | 'other'
