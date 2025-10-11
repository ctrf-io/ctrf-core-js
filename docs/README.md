**CTRF v0.0.16**

***

# CTRF v0.0.16

## Schema

- [Attachment](interfaces/Attachment.md)
- [Baseline](interfaces/Baseline.md)
- [Environment](interfaces/Environment.md)
- [InsightsMetric](interfaces/InsightsMetric.md)
- [Report](interfaces/Report.md)
- [Results](interfaces/Results.md)
- [RetryAttempt](interfaces/RetryAttempt.md)
- [RootInsights](interfaces/RootInsights.md)
- [Step](interfaces/Step.md)
- [Summary](interfaces/Summary.md)
- [Test](interfaces/Test.md)
- [TestInsights](interfaces/TestInsights.md)
- [Tool](interfaces/Tool.md)
- [TestStatus](type-aliases/TestStatus.md)

## File Operations

- [readReportFromFile](functions/readReportFromFile.md)
- [readReportsFromDirectory](functions/readReportsFromDirectory.md)
- [readReportsFromGlobPattern](functions/readReportsFromGlobPattern.md)

## Report Processing

- [enrichReportWithInsights](functions/enrichReportWithInsights.md)
- [mergeReports](functions/mergeReports.md)
- [sortReportsByTimestamp](functions/sortReportsByTimestamp.md)
- [storePreviousResults](functions/storePreviousResults.md)

## Validation

- [isValidCtrfReport](functions/isValidCtrfReport.md)
- [validateReport](functions/validateReport.md)
- [validateReportStrict](functions/validateReportStrict.md)

## Tree Operations

- [findSuiteByName](functions/findSuiteByName.md)
- [findTestByName](functions/findTestByName.md)
- [flattenTree](functions/flattenTree.md)
- [getAllTests](functions/getAllTests.md)
- [getSuiteStats](functions/getSuiteStats.md)
- [organizeTestsBySuite](functions/organizeTestsBySuite.md)
- [traverseTree](functions/traverseTree.md)

## Test Operations

- [findTestById](functions/findTestById.md)
- [generateTestIdFromProperties](functions/generateTestIdFromProperties.md)
- [getTestId](functions/getTestId.md)
- [setTestId](functions/setTestId.md)
- [setTestIdsForReport](functions/setTestIdsForReport.md)

## Runtime

- [mergeTestData](functions/mergeTestData.md)

## Classes

- [CtrfRuntime](classes/CtrfRuntime.md)

## Enumerations

- [SortOrder](enumerations/SortOrder.md)

## Interfaces

- [TestContext](interfaces/TestContext.md)
- [TestTree](interfaces/TestTree.md)
- [TreeNode](interfaces/TreeNode.md)
- [TreeOptions](interfaces/TreeOptions.md)
- [ValidationResult](interfaces/ValidationResult.md)

## Type Aliases

- [TreeTest](type-aliases/TreeTest.md)

## Variables

- [ctrf](variables/ctrf.md)
- [CTRF\_NAMESPACE](variables/CTRF_NAMESPACE.md)
- [ctrfRuntime](variables/ctrfRuntime.md)
- [runtime](variables/runtime.md)
