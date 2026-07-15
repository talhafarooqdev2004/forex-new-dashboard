"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AdminNewsHeadlineSection from "@/components/composed/calendar-news/AdminNewsHeadlineSection";
import MarketCatalystScoreboardTable from "@/components/composed/calendar-news/MarketCatalystScoreboardTable";
import Container from "@/components/ui/layout/Container";
import {
    buildCatalystScoreboardRows,
    type CatalystBoardDTO,
    type CatalystScoreboardRow,
} from "@/lib/calendarNewsScoreboardData";
import { apiConfig } from "@/services/api.config";

type DayArchiveMeta = {
    dayKey: string;
    headlineCount: number;
    relevantCount: number;
    duplicateCount: number;
    irrelevantCount: number;
    finalizedAt: string;
};

type HistoricalDayPayload = {
    dayKey: string;
    isLiveDay: boolean;
    archived: boolean;
    board: CatalystBoardDTO[];
    meta: DayArchiveMeta | null;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

function formatDayLabel(dayKey: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
    if (!match) return dayKey;
    const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

export default function HistoricalAnalysisClientPage() {
    const [days, setDays] = useState<DayArchiveMeta[]>([]);
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [payload, setPayload] = useState<HistoricalDayPayload | null>(null);
    const [loadingDays, setLoadingDays] = useState(true);
    const [loadingDay, setLoadingDay] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDays = useCallback(async () => {
        setLoadingDays(true);
        setError(null);
        try {
            const res = await fetch(`${apiConfig.baseURL}/api/v1/public/market-driver-history`, {
                cache: "no-store",
                credentials: "omit",
            });
            if (!res.ok) throw new Error("Failed to load historical days");
            const json = (await res.json()) as ApiEnvelope<DayArchiveMeta[]>;
            const list = Array.isArray(json.data) ? json.data : [];
            setDays(list);
            setSelectedDay((prev) => prev || list[0]?.dayKey || "");
        } catch {
            setError("Could not load historical days.");
            setDays([]);
        } finally {
            setLoadingDays(false);
        }
    }, []);

    const loadDay = useCallback(async (dayKey: string) => {
        if (!dayKey) {
            setPayload(null);
            return;
        }
        setLoadingDay(true);
        setError(null);
        try {
            const res = await fetch(
                `${apiConfig.baseURL}/api/v1/public/market-driver-history/${encodeURIComponent(dayKey)}`,
                { cache: "no-store", credentials: "omit" },
            );
            if (!res.ok) throw new Error("Failed to load day");
            const json = (await res.json()) as ApiEnvelope<HistoricalDayPayload>;
            setPayload(json.data ?? null);
        } catch {
            setError("Could not load that day's archive.");
            setPayload(null);
        } finally {
            setLoadingDay(false);
        }
    }, []);

    useEffect(() => {
        void loadDays();
    }, [loadDays]);

    useEffect(() => {
        if (selectedDay) void loadDay(selectedDay);
    }, [selectedDay, loadDay]);

    const catalystRows: CatalystScoreboardRow[] = useMemo(() => {
        if (!payload?.board?.length) return [];
        return buildCatalystScoreboardRows(payload.board);
    }, [payload]);

    const statusLine = useMemo(() => {
        if (!selectedDay) {
            return "No archived UAE days yet — live data stays on Daily Market View until 1:00 AM Dubai time.";
        }
        if (!payload) return null;
        const meta = payload.meta;
        const parts = [
            formatDayLabel(selectedDay),
            payload.archived ? "Finalized UAE day" : "Past day (from headlines)",
        ];
        if (meta) {
            parts.push(
                `${meta.headlineCount} headlines`,
                `${meta.relevantCount} relevant`,
                `${meta.duplicateCount} duplicates`,
            );
        }
        return parts.join(" · ");
    }, [payload, selectedDay]);

    return (
        <Container>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Historical Analysis</h1>
                    <p className="mt-1 text-sm text-[rgb(var(--secondary))]">
                        Completed UAE market days (1:00 AM → next 1:00 AM Dubai). Live boards stay on{" "}
                        <Link href="/daily-market-view" className="underline underline-offset-2">
                            Daily Market View
                        </Link>
                        .
                    </p>
                </div>
                <label className="flex flex-col gap-1 text-sm text-[rgb(var(--secondary))]">
                    Market day
                    <select
                        className="min-w-[220px] rounded-lg border border-[rgb(var(--stroke)/0.35)] bg-[rgb(var(--dark-grey))] px-3 py-2 text-white"
                        value={selectedDay}
                        disabled={loadingDays || days.length === 0}
                        onChange={(e) => setSelectedDay(e.target.value)}
                    >
                        {days.length === 0 ? (
                            <option value="">No past days</option>
                        ) : (
                            days.map((d) => (
                                <option key={d.dayKey} value={d.dayKey}>
                                    {d.dayKey}
                                    {d.finalizedAt ? "" : " (pending archive)"}
                                </option>
                            ))
                        )}
                    </select>
                </label>
            </div>

            {error ? <p className="mb-4 text-sm text-[#f84960]">{error}</p> : null}
            {statusLine ? <p className="mb-4 text-sm text-[rgb(var(--secondary))]">{statusLine}</p> : null}

            {loadingDay ? (
                <p className="text-sm text-[rgb(var(--secondary))]">Loading day…</p>
            ) : (
                <>
                    <MarketCatalystScoreboardTable
                        rows={catalystRows}
                        dayKey={selectedDay || undefined}
                    />
                    <div className="mt-4">
                        <AdminNewsHeadlineSection dayKey={selectedDay || undefined} />
                    </div>
                </>
            )}
        </Container>
    );
}
