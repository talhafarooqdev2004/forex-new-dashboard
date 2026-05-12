"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { fetchVisitorGeoAdminStats, type VisitorGeoAdminStats } from "@/services/visitorAnalytics.service";
import { VisitorAnalyticsDataSkeleton, VisitorAnalyticsPageSkeleton } from "./VisitorAnalyticsSkeletons";

function formatPercent(n: number): string {
    if (!Number.isFinite(n)) return "0%";
    return `${n < 10 ? n.toFixed(1) : Math.round(n)}%`;
}

export default function VisitorAnalyticsClientPage() {
    const { isAdmin, token, ready } = useAuth();
    const [stats, setStats] = useState<VisitorGeoAdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchVisitorGeoAdminStats(token);
            if (!data) {
                setError("Could not load visitor analytics.");
                setStats(null);
            } else {
                setStats(data);
            }
        } catch {
            setError("Could not load visitor analytics.");
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (ready && isAdmin && token) void load();
    }, [ready, isAdmin, token, load]);

    if (!ready) {
        return <VisitorAnalyticsPageSkeleton />;
    }

    if (!isAdmin) {
        return (
            <div className="rounded-xl border border-stroke bg-darkGrey p-6 text-sm text-[rgb(var(--secondary))]">
                You need an administrator account to view this page.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-lg font-semibold">Visitor geography</h1>
                <p className="text-sm text-[rgb(var(--secondary))]">
                    Unique IP addresses are recorded once. Country and region are resolved asynchronously and never block page loads. Only
                    routable public IPs are stored unless the API is configured to record local/private traffic for testing.
                </p>
            </div>

            {loading ? (
                <VisitorAnalyticsDataSkeleton />
            ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : stats ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Distinct IPs tracked" value={String(stats.totalDistinctIps)} />
                        <StatCard label="Resolved (with country)" value={String(stats.resolvedVisitors)} />
                        <StatCard label="Pending lookup" value={String(stats.pendingCount)} />
                        <StatCard label="Failed lookup" value={String(stats.failedCount)} />
                    </div>

                    <section className="rounded-xl border border-stroke bg-darkGrey p-6">
                        <h2 className="text-base font-semibold">Visitors by country</h2>
                        <p className="mt-1 text-xs text-[rgb(var(--secondary))]">
                            Share is percent of resolved visitors only (IPs with a successful country lookup).
                        </p>
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[480px] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-stroke text-left text-[rgb(var(--secondary))]">
                                        <th className="py-2 pr-4 font-medium">Country</th>
                                        <th className="py-2 pr-4 font-medium">Code</th>
                                        <th className="py-2 pr-4 font-medium tabular-nums">Visitors</th>
                                        <th className="py-2 font-medium tabular-nums">Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.byCountry.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-[rgb(var(--secondary))]">
                                                No resolved country data yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        stats.byCountry.map((row) => (
                                            <tr key={`${row.countryCode ?? ""}-${row.countryName ?? ""}`} className="border-b border-stroke/60">
                                                <td className="py-2 pr-4">{row.countryName ?? "—"}</td>
                                                <td className="py-2 pr-4 tabular-nums text-[rgb(var(--secondary))]">
                                                    {row.countryCode ?? "—"}
                                                </td>
                                                <td className="py-2 pr-4 tabular-nums">{row.visitorCount}</td>
                                                <td className="py-2 tabular-nums">{formatPercent(row.percentOfResolved)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="rounded-xl border border-stroke bg-darkGrey p-6">
                        <h2 className="text-base font-semibold">Visitors by country / region</h2>
                        <p className="mt-1 text-xs text-[rgb(var(--secondary))]">
                            Total visitors by region (sub-national), grouped with country. Sorted by volume.
                        </p>
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[560px] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-stroke text-left text-[rgb(var(--secondary))]">
                                        <th className="py-2 pr-4 font-medium">Country</th>
                                        <th className="py-2 pr-4 font-medium">Region</th>
                                        <th className="py-2 pr-4 font-medium tabular-nums">Visitors</th>
                                        <th className="py-2 font-medium tabular-nums">Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.byRegion.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-[rgb(var(--secondary))]">
                                                No resolved region data yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        stats.byRegion.map((row, idx) => (
                                            <tr
                                                key={`${row.countryCode ?? "c"}-${row.regionName ?? "r"}-${idx}`}
                                                className="border-b border-stroke/60"
                                            >
                                                <td className="py-2 pr-4">{row.countryName ?? "—"}</td>
                                                <td className="py-2 pr-4">{row.regionName ?? "—"}</td>
                                                <td className="py-2 pr-4 tabular-nums">{row.visitorCount}</td>
                                                <td className="py-2 tabular-nums">{formatPercent(row.percentOfResolved)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <button
                        type="button"
                        className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium hover:bg-muted/30"
                        onClick={() => void load()}
                    >
                        Refresh
                    </button>
                </>
            ) : null}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-stroke bg-darkGrey p-4">
            <p className="text-xs text-[rgb(var(--secondary))]">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
    );
}
