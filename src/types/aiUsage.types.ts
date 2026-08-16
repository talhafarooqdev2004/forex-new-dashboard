export type AiUsagePreset =
    | "today"
    | "yesterday"
    | "last-7-days"
    | "current-month"
    | "previous-month"
    | "custom";

export type AiUsageRange = { from: string; to: string; timezone: string };

export type AiQueueHealth = {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    dead: number;
    staleJobsRecovered: number;
    oldestPendingJobAgeSeconds: number | null;
    recentErrors: Array<{
        jobId: string;
        status: string;
        errorCategory: string | null;
        errorMessage: string | null;
        attemptCount: number;
        updatedAt: string;
    }>;
};

export type AiUsageSummary = {
    range: AiUsageRange;
    totals: {
        headlinesDiscovered: number;
        newHeadlines: number;
        existingHeadlinesSkipped: number;
        successfulClassifications: number;
        semanticDeduplicationChecks: number;
        pendingJobs: number;
        failedDeadJobs: number;
        retryCount: number;
        openaiRequests: number;
        groqFallbackRequests: number;
        inputTokens: number;
        cachedInputTokens: number;
        outputTokens: number;
        reasoningTokens: number;
        totalTokens: number;
        estimatedCostUsd: string;
        failedCalls: number;
        enqueuedItems: number;
        recoveredItems: number;
        coverageRepairs: number;
    };
    costAlert: {
        status: "normal" | "attention" | "warning" | "critical";
        selectedRangeEstimatedCostUsd: string;
        currentMonthEstimatedCostUsd: string;
        thresholdsUsd: {
            attention: number;
            warning: number;
            critical: number;
            monthlyBudgetReference: number;
        };
        informationalOnly: boolean;
    };
    queueHealth: AiQueueHealth;
};

export type AiUsageDailyRow = {
    date: string;
    headlinesDiscovered: number;
    newHeadlines: number;
    existingHeadlinesSkipped: number;
    classifiedHeadlines: number;
    deduplicationCalls: number;
    coverageRepairCalls: number;
    openaiCalls: number;
    groqFallbackCalls: number;
    failedCalls: number;
    retryCount: number;
    inputTokens: number;
    cachedInputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: string;
};

export type AiProviderBreakdownRow = {
    provider: string;
    model: string;
    operationType: string;
    requests: number;
    successes: number;
    failures: number;
    retriesOrFallbacks: number;
    inputTokens: number;
    cachedInputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    totalTokens: number;
    averageLatencyMs: number | null;
    estimatedCostUsd: string;
};

export type AiRequestRow = {
    id: string;
    timestamp: string;
    provider: string;
    model: string;
    operationType: string;
    jobId: string | null;
    ingestId: string | null;
    status: string;
    inputTokens: number | null;
    cachedInputTokens: number | null;
    outputTokens: number | null;
    reasoningTokens: number | null;
    totalTokens: number | null;
    estimatedCostUsd: string;
    latencyMs: number | null;
    isRetry: boolean;
    isFallback: boolean;
    errorCategory: string | null;
};

export type ProcessingRunRow = {
    id: string;
    ingestId: string;
    source: string;
    startedAt: string;
    completedAt: string | null;
    itemsFetched: number;
    newItems: number;
    existingItemsSkipped: number;
    itemsEnqueued: number;
    itemsClassified: number;
    exactDuplicatesSkipped: number;
    semanticDuplicatesFound: number;
    failedItems: number;
    recoveredItems: number;
    coverageRepairs: number;
    status: string;
    errorCategory: string | null;
    durationMs: number | null;
};

export type Paginated<T> = {
    range: AiUsageRange;
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
    rows: T[];
};
