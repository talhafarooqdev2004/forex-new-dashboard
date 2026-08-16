"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import { aiUsageService, type AiUsageFilters } from "@/services/aiUsage.service";
import type {
    AiProviderBreakdownRow,
    AiQueueHealth,
    AiRequestRow,
    AiUsageDailyRow,
    AiUsagePreset,
    AiUsageSummary,
    Paginated,
    ProcessingRunRow,
} from "@/types/aiUsage.types";

const PAGE_SIZE = 25;

const PRESETS: Array<{ value: AiUsagePreset; label: string }> = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last-7-days", label: "Last 7 days" },
    { value: "current-month", label: "Current month" },
    { value: "previous-month", label: "Previous month" },
    { value: "custom", label: "Custom range" },
];

function formatNumber(value: number | null | undefined): string {
    return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatNullableNumber(value: number | null | undefined): string {
    return value == null ? "—" : formatNumber(value);
}

function formatMoney(value: string | number | null | undefined): string {
    const amount = Number(value ?? 0);
    return `$${Number.isFinite(amount) ? amount.toFixed(4) : "0.0000"}`;
}

function operationLabel(operation: string): string {
    return operation.replace(/_/g, " ");
}

function ageLabel(seconds: number | null | undefined): string {
    if (seconds == null) return "—";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatDateTime(value: string | null | undefined, timezone: string): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        dateStyle: "short",
        timeStyle: "medium",
    }).format(date);
}

function zeroDailyRow(date: string): AiUsageDailyRow {
    return {
        date,
        headlinesDiscovered: 0,
        newHeadlines: 0,
        existingHeadlinesSkipped: 0,
        classifiedHeadlines: 0,
        deduplicationCalls: 0,
        coverageRepairCalls: 0,
        openaiCalls: 0,
        groqFallbackCalls: 0,
        failedCalls: 0,
        retryCount: 0,
        inputTokens: 0,
        cachedInputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: "0",
    };
}

/** The API returns activity days; the UI fills the selected range with zero rows. */
function fillDailyRange(rows: AiUsageDailyRow[], from: string | undefined, to: string | undefined): AiUsageDailyRow[] {
    if (!from || !to) return rows;
    const byDate = new Map(rows.map((row) => [row.date, row]));
    const cursor = new Date(`${from}T12:00:00Z`);
    const end = new Date(`${to}T12:00:00Z`);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime()) || cursor > end) return rows;

    const filled: AiUsageDailyRow[] = [];
    while (cursor <= end) {
        const date = cursor.toISOString().slice(0, 10);
        filled.push(byDate.get(date) ?? zeroDailyRow(date));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return filled;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="flex min-h-[92px] flex-col justify-center gap-1 rounded-xl border border-stroke bg-darkGrey p-4 shadow-sm">
            <span className="text-xs leading-tight text-[rgb(var(--secondary))]">{label}</span>
            <strong className="text-xl font-semibold tabular-nums text-foreground">{value}</strong>
            {hint ? <span className="text-[11px] text-[rgb(var(--secondary))]">{hint}</span> : null}
        </div>
    );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
    return (
        <section className="min-w-0 rounded-xl border border-stroke bg-darkGrey p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold capitalize text-foreground">{title}</h2>
                {hint ? <span className="text-xs text-[rgb(var(--secondary))]">{hint}</span> : null}
            </div>
            {children}
        </section>
    );
}

function Pager({ data, onPage }: { data: Paginated<unknown> | null; onPage: (page: number) => void }) {
    if (!data || data.pagination.totalPages <= 1) return null;
    const { page, totalPages, total } = data.pagination;
    return (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-xs text-[rgb(var(--secondary))]">
            <span>{formatNumber(total)} records</span>
            <button
                type="button"
                className="rounded-md border border-stroke px-3 py-1.5 text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => onPage(page - 1)}
                disabled={page <= 1}
            >
                Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
                type="button"
                className="rounded-md border border-stroke px-3 py-1.5 text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => onPage(page + 1)}
                disabled={page >= totalPages}
            >
                Next
            </button>
        </div>
    );
}

function EmptyRow({ columns, children }: { columns: number; children: ReactNode }) {
    return (
        <tr>
            <td colSpan={columns} className="px-4 py-8 text-center text-sm text-[rgb(var(--secondary))]">
                {children}
            </td>
        </tr>
    );
}

function MiniLineChart({ label, values, color, valueFormatter }: {
    label: string;
    values: number[];
    color: string;
    valueFormatter: (value: number) => string;
}) {
    const max = Math.max(...values, 1);
    const points = values.length > 1
        ? values.map((value, index) => `${(index / (values.length - 1)) * 100},${94 - (value / max) * 78}`).join(" ")
        : "0,94 100,94";
    const last = values[values.length - 1] ?? 0;

    return (
        <div className="min-w-0" aria-label={`${label}: ${valueFormatter(last)}`}>
            {values.length ? (
                <>
                    <svg viewBox="0 0 100 100" className="h-40 w-full overflow-visible" role="img" aria-label={label} preserveAspectRatio="none">
                        <title>{label}</title>
                        <line x1="0" y1="94" x2="100" y2="94" stroke="rgb(var(--stroke))" strokeWidth="0.7" />
                        <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex justify-between text-[11px] text-[rgb(var(--secondary))]">
                        <span>{valueFormatter(values[0] ?? 0)}</span>
                        <span>{valueFormatter(last)}</span>
                    </div>
                </>
            ) : (
                <div className="flex h-40 items-center justify-center text-sm text-[rgb(var(--secondary))]">No data in this range.</div>
            )}
        </div>
    );
}

function MiniBarChart({ label, values, color, valueFormatter }: {
    label: string;
    values: number[];
    color: string;
    valueFormatter: (value: number) => string;
}) {
    const max = Math.max(...values, 1);
    return (
        <div className="min-w-0" aria-label={label}>
            {values.length ? (
                <>
                    <div className="flex h-40 items-end gap-1 border-b border-stroke px-1">
                        {values.map((value, index) => (
                            <div key={`${value}-${index}`} className="group relative flex min-w-0 flex-1 items-end" style={{ height: "100%" }}>
                                <div
                                    className="w-full rounded-t-sm transition-opacity group-hover:opacity-80"
                                    style={{ height: `${Math.max(2, (value / max) * 100)}%`, backgroundColor: color }}
                                    title={valueFormatter(value)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-[rgb(var(--secondary))]">
                        <span>{valueFormatter(values[0] ?? 0)}</span>
                        <span>{valueFormatter(values[values.length - 1] ?? 0)}</span>
                    </div>
                </>
            ) : (
                <div className="flex h-40 items-center justify-center text-sm text-[rgb(var(--secondary))]">No data in this range.</div>
            )}
        </div>
    );
}

function ProviderBars({ summary }: { summary: AiUsageSummary | null }) {
    const openai = summary?.totals.openaiRequests ?? 0;
    const groq = summary?.totals.groqFallbackRequests ?? 0;
    const total = Math.max(1, openai + groq);
    return (
        <div className="space-y-5 pt-3">
            {[
                { label: "OpenAI", value: openai, color: "rgb(var(--electric-blue))" },
                { label: "Groq fallback", value: groq, color: "rgb(var(--green-dark))" },
            ].map((provider) => (
                <div key={provider.label} className="grid grid-cols-[7rem_3rem_minmax(0,1fr)] items-center gap-3 text-sm">
                    <span className="text-[rgb(var(--secondary))]">{provider.label}</span>
                    <strong className="text-right tabular-nums">{formatNumber(provider.value)}</strong>
                    <span className="h-2 overflow-hidden rounded-full bg-foreground/10">
                        <span className="block h-full rounded-full" style={{ width: `${(provider.value / total) * 100}%`, backgroundColor: provider.color }} />
                    </span>
                </div>
            ))}
        </div>
    );
}

function TableShell({ children, minWidth = "min-w-[980px]" }: { children: ReactNode; minWidth?: string }) {
    return <div className="overflow-x-auto"><table className={`w-full ${minWidth} border-collapse text-xs`}>{children}</table></div>;
}

function TableHead({ children }: { children: ReactNode }) {
    return <thead className="bg-foreground/5 text-left text-[rgb(var(--secondary))]"><tr>{children}</tr></thead>;
}

function Th({ children }: { children: ReactNode }) {
    return <th className="whitespace-nowrap border-b border-stroke px-3 py-2 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <td className={`whitespace-nowrap border-b border-stroke/60 px-3 py-2 align-top ${className}`}>{children}</td>;
}

export default function AiUsageClientPage() {
    const { isAdmin, ready, token } = useAuth();
    const router = useRouter();
    const [filters, setFilters] = useState<AiUsageFilters>({ preset: "current-month" });
    const [draftFrom, setDraftFrom] = useState("");
    const [draftTo, setDraftTo] = useState("");
    const [summary, setSummary] = useState<AiUsageSummary | null>(null);
    const [daily, setDaily] = useState<AiUsageDailyRow[]>([]);
    const [providers, setProviders] = useState<AiProviderBreakdownRow[]>([]);
    const [queue, setQueue] = useState<AiQueueHealth | null>(null);
    const [requests, setRequests] = useState<Paginated<AiRequestRow> | null>(null);
    const [processing, setProcessing] = useState<Paginated<ProcessingRunRow> | null>(null);
    const [requestPage, setRequestPage] = useState(1);
    const [processingPage, setProcessingPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (ready && !isAdmin) router.replace("/dashboard");
    }, [isAdmin, ready, router]);

    const load = useCallback(async () => {
        if (!ready || !isAdmin || !token) return;
        if (filters.preset === "custom" && (!filters.from || !filters.to)) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [summaryResult, dailyResult, providerResult, queueResult, requestResult, processingResult] = await Promise.all([
                aiUsageService.getSummary(filters),
                aiUsageService.getDaily(filters),
                aiUsageService.getProviders(filters),
                aiUsageService.getQueue(),
                aiUsageService.getRequests(filters, { page: requestPage, pageSize: PAGE_SIZE }),
                aiUsageService.getProcessing(filters, { page: processingPage, pageSize: PAGE_SIZE }),
            ]);
            setSummary(summaryResult);
            setDaily(dailyResult.rows);
            setProviders(providerResult.rows);
            setQueue(queueResult);
            setRequests(requestResult);
            setProcessing(processingResult);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load AI usage data.");
        } finally {
            setLoading(false);
        }
    }, [filters, isAdmin, processingPage, ready, requestPage, token]);

    useEffect(() => {
        void load();
    }, [load]);

    const handlePreset = (preset: AiUsagePreset) => {
        setRequestPage(1);
        setProcessingPage(1);
        if (preset === "custom") {
            setFilters({ preset, from: draftFrom, to: draftTo });
            return;
        }
        setFilters({ preset });
    };

    const applyCustomRange = () => {
        if (!draftFrom || !draftTo) {
            setError("Choose both a start and end date for the custom report.");
            return;
        }
        if (draftFrom > draftTo) {
            setError("The custom report start date must be before its end date.");
            return;
        }
        setError(null);
        setRequestPage(1);
        setProcessingPage(1);
        setFilters({ preset: "custom", from: draftFrom, to: draftTo });
    };

    const handleRetry = async (jobId: string) => {
        if (!window.confirm("Retry this failed job once? The existing idempotency key will be reused.")) return;
        try {
            await aiUsageService.retryJob(jobId);
            await load();
        } catch (retryError) {
            setError(retryError instanceof Error ? retryError.message : "Unable to retry AI job.");
        }
    };

    const reportTimezone = summary?.range.timezone ?? "Asia/Dubai";
    const dailyRows = useMemo(
        () => fillDailyRange(daily, summary?.range.from, summary?.range.to),
        [daily, summary?.range.from, summary?.range.to],
    );
    const chartRows = dailyRows;
    const activeQueue = queue ?? summary?.queueHealth ?? null;

    if (!ready) {
        return <div className="flex min-h-[45vh] items-center justify-center text-sm text-[rgb(var(--secondary))]">Checking administrator access…</div>;
    }

    if (!isAdmin) {
        return <div className="rounded-xl border border-stroke bg-darkGrey p-6 text-sm text-[rgb(var(--secondary))]">Redirecting to the dashboard…</div>;
    }

    const totals = summary?.totals;
    const alert = summary?.costAlert;
    const alertClass = alert?.status === "critical"
        ? "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-200"
        : alert?.status === "warning"
          ? "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-200"
          : alert?.status === "attention"
            ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-800 dark:text-yellow-200"
            : "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-200";

    return (
        <main className="min-w-0 space-y-6" aria-labelledby="ai-usage-title">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--electric-blue))]">Operations</p>
                    <h1 id="ai-usage-title" className="mt-1 text-2xl font-semibold tracking-tight">AI Usage &amp; Processing</h1>
                    <p className="mt-2 max-w-3xl text-sm text-[rgb(var(--secondary))]">Headline ingestion, provider requests, durable queue health, and estimated AI cost.</p>
                </div>
                <button
                    type="button"
                    className="rounded-lg border border-stroke bg-darkGrey px-4 py-2 text-sm font-medium transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void load()}
                    disabled={loading}
                >
                    {loading ? "Refreshing…" : "Refresh"}
                </button>
            </header>

            <section className="flex flex-wrap items-end gap-3 rounded-xl border border-stroke bg-darkGrey p-4" aria-label="Report date filters">
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            type="button"
                            className={`rounded-full border px-3 py-1.5 text-xs transition ${filters.preset === preset.value ? "border-[rgb(var(--electric-blue))] bg-[rgb(var(--electric-blue))]/10 font-semibold text-[rgb(var(--electric-blue))]" : "border-stroke text-[rgb(var(--secondary))] hover:bg-foreground/5"}`}
                            onClick={() => handlePreset(preset.value)}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
                {filters.preset === "custom" ? (
                    <div className="flex flex-wrap items-end gap-2">
                        <label className="flex flex-col gap-1 text-xs text-[rgb(var(--secondary))]">From<input className="h-9 rounded-md border border-stroke bg-inputBg px-2 text-sm text-foreground" type="date" value={draftFrom} onChange={(event) => setDraftFrom(event.target.value)} /></label>
                        <label className="flex flex-col gap-1 text-xs text-[rgb(var(--secondary))]">To<input className="h-9 rounded-md border border-stroke bg-inputBg px-2 text-sm text-foreground" type="date" value={draftTo} onChange={(event) => setDraftTo(event.target.value)} /></label>
                        <button type="button" className="h-9 rounded-md bg-[rgb(var(--electric-blue))] px-3 text-xs font-semibold text-white hover:brightness-110" onClick={applyCustomRange}>Apply</button>
                    </div>
                ) : null}
                <span className="ml-auto text-xs text-[rgb(var(--secondary))]">Reporting timezone: {reportTimezone}</span>
            </section>

            {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200" role="alert">{error}</div> : null}

            {alert ? (
                <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-3 text-sm ${alertClass}`}>
                    <strong>Estimated current-month cost: {formatMoney(alert.currentMonthEstimatedCostUsd)}</strong>
                    <span>{alert.status} indicator · attention ${alert.thresholdsUsd.attention}, warning ${alert.thresholdsUsd.warning}, critical ${alert.thresholdsUsd.critical}; monthly reference ${alert.thresholdsUsd.monthlyBudgetReference}.</span>
                    <small className="basis-full text-xs opacity-80">Informational only; this does not replace an OpenAI Platform billing limit.</small>
                </div>
            ) : null}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Headlines discovered" value={formatNumber(totals?.headlinesDiscovered)} />
                <StatCard label="New headlines" value={formatNumber(totals?.newHeadlines)} />
                <StatCard label="Existing headlines skipped" value={formatNumber(totals?.existingHeadlinesSkipped)} />
                <StatCard label="Successfully classified" value={formatNumber(totals?.successfulClassifications)} />
                <StatCard label="Semantic dedup processed" value={formatNumber(totals?.semanticDeduplicationChecks)} />
                <StatCard label="Coverage repairs" value={formatNumber(totals?.coverageRepairs)} />
                <StatCard label="Pending jobs" value={formatNumber(activeQueue?.pending ?? totals?.pendingJobs)} />
                <StatCard label="Processing jobs" value={formatNumber(activeQueue?.processing)} />
                <StatCard label="Failed jobs" value={formatNumber(activeQueue?.failed)} />
                <StatCard label="Dead jobs" value={formatNumber(activeQueue?.dead)} />
                <StatCard label="Retry count" value={formatNumber(totals?.retryCount)} />
                <StatCard label="Recovered items" value={formatNumber(totals?.recoveredItems)} />
                <StatCard label="OpenAI requests" value={formatNumber(totals?.openaiRequests)} />
                <StatCard label="Groq fallback requests" value={formatNumber(totals?.groqFallbackRequests)} />
                <StatCard label="Input tokens" value={formatNumber(totals?.inputTokens)} />
                <StatCard label="Cached-input tokens" value={formatNumber(totals?.cachedInputTokens)} />
                <StatCard label="Output tokens" value={formatNumber(totals?.outputTokens)} />
                <StatCard label="Total tokens" value={formatNumber(totals?.totalTokens)} />
                <StatCard label="Estimated AI cost" value={formatMoney(totals?.estimatedCostUsd)} hint="USD, estimated" />
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Panel title="Daily estimated cost" hint="USD">
                    <MiniLineChart label="Daily estimated cost" values={chartRows.map((row) => Number(row.estimatedCostUsd))} color="rgb(var(--electric-blue))" valueFormatter={formatMoney} />
                </Panel>
                <Panel title="Daily token consumption" hint="total tokens">
                    <MiniBarChart label="Daily token consumption" values={chartRows.map((row) => row.totalTokens)} color="rgb(var(--green-dark))" valueFormatter={formatNumber} />
                </Panel>
                <Panel title="Daily processed headlines" hint="classified">
                    <MiniLineChart label="Daily processed headlines" values={chartRows.map((row) => row.classifiedHeadlines)} color="rgb(var(--royal-blue))" valueFormatter={formatNumber} />
                </Panel>
                <Panel title="Provider usage split" hint="selected range">
                    <ProviderBars summary={summary} />
                </Panel>
            </section>

            <Panel title="Queue health" hint="current database state">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
                    <StatCard label="Pending" value={formatNumber(activeQueue?.pending)} />
                    <StatCard label="Processing" value={formatNumber(activeQueue?.processing)} />
                    <StatCard label="Completed" value={formatNumber(activeQueue?.completed)} />
                    <StatCard label="Failed" value={formatNumber(activeQueue?.failed)} />
                    <StatCard label="Dead" value={formatNumber(activeQueue?.dead)} />
                    <StatCard label="Stale recovered" value={formatNumber(activeQueue?.staleJobsRecovered)} />
                    <StatCard label="Oldest pending" value={ageLabel(activeQueue?.oldestPendingJobAgeSeconds)} />
                </div>
                <div className="mt-5">
                    <TableShell minWidth="min-w-[760px]">
                        <TableHead><Th>Job</Th><Th>Status</Th><Th>Error category</Th><Th>Sanitized error</Th><Th>Attempts</Th><Th>Updated</Th><Th>Action</Th></TableHead>
                        <tbody>
                            {(activeQueue?.recentErrors ?? []).map((row) => (
                                <tr key={row.jobId}>
                                    <Td className="font-mono text-[11px]">{row.jobId}</Td>
                                    <Td>{row.status}</Td>
                                    <Td>{row.errorCategory ?? "—"}</Td>
                                    <Td className="max-w-[280px] whitespace-normal">{row.errorMessage ?? "—"}</Td>
                                    <Td>{row.attemptCount}</Td>
                                    <Td>{formatDateTime(row.updatedAt, reportTimezone)}</Td>
                                    <Td><button type="button" className="rounded-md bg-[rgb(var(--electric-blue))] px-2.5 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40" onClick={() => void handleRetry(row.jobId)} disabled={!['failed', 'dead'].includes(row.status)}>Retry</button></Td>
                                </tr>
                            ))}
                            {!activeQueue?.recentErrors.length ? <EmptyRow columns={7}>No recent queue errors.</EmptyRow> : null}
                        </tbody>
                    </TableShell>
                </div>
            </Panel>

            <Panel title="Provider / model / operation" hint="database aggregation">
                <TableShell minWidth="min-w-[1380px]">
                    <TableHead><Th>Provider</Th><Th>Model</Th><Th>Operation</Th><Th>Requests</Th><Th>Success</Th><Th>Failure</Th><Th>Retry/fallback</Th><Th>Input</Th><Th>Cached input</Th><Th>Output</Th><Th>Reasoning</Th><Th>Total</Th><Th>Avg latency</Th><Th>Estimated cost</Th></TableHead>
                    <tbody>
                        {providers.map((row) => <ProviderRow key={`${row.provider}-${row.model}-${row.operationType}`} row={row} />)}
                        {!providers.length ? <EmptyRow columns={14}>No provider requests in this range.</EmptyRow> : null}
                    </tbody>
                </TableShell>
            </Panel>

            <Panel title="Daily breakdown" hint={`${dailyRows.length} day(s), including zero-activity days`}>
                <TableShell minWidth="min-w-[1500px]">
                    <TableHead><Th>Date</Th><Th>Discovered</Th><Th>New</Th><Th>Existing skipped</Th><Th>Classified</Th><Th>Dedup calls</Th><Th>Coverage repairs</Th><Th>Failed</Th><Th>Retries</Th><Th>OpenAI</Th><Th>Groq</Th><Th>Input</Th><Th>Cached input</Th><Th>Output</Th><Th>Total</Th><Th>Estimated cost</Th></TableHead>
                    <tbody>
                        {dailyRows.map((row) => <DailyRow key={row.date} row={row} />)}
                        {!dailyRows.length ? <EmptyRow columns={16}>No days in this range.</EmptyRow> : null}
                    </tbody>
                </TableShell>
            </Panel>

            <Panel title="Recent AI requests" hint="paginated and sanitized; no prompts or secrets">
                <TableShell minWidth="min-w-[1420px]">
                    <TableHead><Th>Timestamp</Th><Th>Provider / model</Th><Th>Operation</Th><Th>Job / ingest</Th><Th>Status</Th><Th>Input</Th><Th>Cached input</Th><Th>Output</Th><Th>Reasoning</Th><Th>Total</Th><Th>Estimated cost</Th><Th>Latency</Th><Th>Retry/fallback</Th><Th>Error category</Th></TableHead>
                    <tbody>
                        {(requests?.rows ?? []).map((row) => <RequestRow key={row.id} row={row} timezone={reportTimezone} />)}
                        {!requests?.rows.length ? <EmptyRow columns={14}>No AI requests in this range.</EmptyRow> : null}
                    </tbody>
                </TableShell>
                <Pager data={requests} onPage={setRequestPage} />
            </Panel>

            <Panel title="Processing history" hint="ingest counters; RSS payloads are not stored here">
                <TableShell minWidth="min-w-[1420px]">
                    <TableHead><Th>Date/time</Th><Th>Source/feed</Th><Th>Fetched</Th><Th>New</Th><Th>Existing skipped</Th><Th>Queued</Th><Th>Classified</Th><Th>Exact duplicates</Th><Th>Semantic duplicates</Th><Th>Failed</Th><Th>Recovered</Th><Th>Coverage repairs</Th><Th>Duration</Th><Th>Status</Th></TableHead>
                    <tbody>
                        {(processing?.rows ?? []).map((row) => <ProcessingRow key={row.id} row={row} timezone={reportTimezone} />)}
                        {!processing?.rows.length ? <EmptyRow columns={14}>No processing runs in this range.</EmptyRow> : null}
                    </tbody>
                </TableShell>
                <Pager data={processing} onPage={setProcessingPage} />
            </Panel>
        </main>
    );
}

function ProviderRow({ row }: { row: AiProviderBreakdownRow }) {
    return (
        <tr>
            <Td>{row.provider}</Td><Td className="font-mono text-[11px]">{row.model}</Td><Td className="capitalize">{operationLabel(row.operationType)}</Td>
            <Td>{formatNumber(row.requests)}</Td><Td>{formatNumber(row.successes)}</Td><Td>{formatNumber(row.failures)}</Td><Td>{formatNumber(row.retriesOrFallbacks)}</Td>
            <Td>{formatNumber(row.inputTokens)}</Td><Td>{formatNumber(row.cachedInputTokens)}</Td><Td>{formatNumber(row.outputTokens)}</Td><Td>{formatNumber(row.reasoningTokens)}</Td><Td>{formatNumber(row.totalTokens)}</Td>
            <Td>{row.averageLatencyMs == null ? "—" : `${Math.round(row.averageLatencyMs)}ms`}</Td><Td>{formatMoney(row.estimatedCostUsd)}</Td>
        </tr>
    );
}

function DailyRow({ row }: { row: AiUsageDailyRow }) {
    return (
        <tr>
            <Td className="font-medium">{row.date}</Td><Td>{formatNumber(row.headlinesDiscovered)}</Td><Td>{formatNumber(row.newHeadlines)}</Td><Td>{formatNumber(row.existingHeadlinesSkipped)}</Td><Td>{formatNumber(row.classifiedHeadlines)}</Td>
            <Td>{formatNumber(row.deduplicationCalls)}</Td><Td>{formatNumber(row.coverageRepairCalls)}</Td><Td>{formatNumber(row.failedCalls)}</Td><Td>{formatNumber(row.retryCount)}</Td><Td>{formatNumber(row.openaiCalls)}</Td><Td>{formatNumber(row.groqFallbackCalls)}</Td>
            <Td>{formatNumber(row.inputTokens)}</Td><Td>{formatNumber(row.cachedInputTokens)}</Td><Td>{formatNumber(row.outputTokens)}</Td><Td>{formatNumber(row.totalTokens)}</Td><Td>{formatMoney(row.estimatedCostUsd)}</Td>
        </tr>
    );
}

function RequestRow({ row, timezone }: { row: AiRequestRow; timezone: string }) {
    const flags = [row.isRetry ? "retry" : "", row.isFallback ? "fallback" : ""].filter(Boolean).join(" ") || "—";
    return (
        <tr>
            <Td>{formatDateTime(row.timestamp, timezone)}</Td><Td>{row.provider}<br /><span className="font-mono text-[11px]">{row.model}</span></Td><Td className="capitalize">{operationLabel(row.operationType)}</Td>
            <Td className="font-mono text-[11px]">{row.jobId ?? row.ingestId ?? "—"}</Td><Td>{row.status}</Td><Td>{formatNullableNumber(row.inputTokens)}</Td><Td>{formatNullableNumber(row.cachedInputTokens)}</Td><Td>{formatNullableNumber(row.outputTokens)}</Td><Td>{formatNullableNumber(row.reasoningTokens)}</Td><Td>{formatNullableNumber(row.totalTokens)}</Td>
            <Td>{formatMoney(row.estimatedCostUsd)}</Td><Td>{row.latencyMs == null ? "—" : `${row.latencyMs}ms`}</Td><Td>{flags}</Td><Td>{row.errorCategory ?? "—"}</Td>
        </tr>
    );
}

function ProcessingRow({ row, timezone }: { row: ProcessingRunRow; timezone: string }) {
    return (
        <tr>
            <Td>{formatDateTime(row.startedAt, timezone)}</Td><Td>{row.source}</Td><Td>{formatNumber(row.itemsFetched)}</Td><Td>{formatNumber(row.newItems)}</Td><Td>{formatNumber(row.existingItemsSkipped)}</Td><Td>{formatNumber(row.itemsEnqueued)}</Td><Td>{formatNumber(row.itemsClassified)}</Td><Td>{formatNumber(row.exactDuplicatesSkipped)}</Td><Td>{formatNumber(row.semanticDuplicatesFound)}</Td><Td>{formatNumber(row.failedItems)}</Td><Td>{formatNumber(row.recoveredItems)}</Td><Td>{formatNumber(row.coverageRepairs)}</Td><Td>{row.durationMs == null ? "—" : `${row.durationMs}ms`}</Td><Td>{row.status}{row.errorCategory ? ` · ${row.errorCategory}` : ""}</Td>
        </tr>
    );
}
