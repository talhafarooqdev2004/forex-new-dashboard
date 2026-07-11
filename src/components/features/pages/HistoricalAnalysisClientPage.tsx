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

type DayMeta = {
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
    meta: DayMeta | null;
};

type ApiEnvelope<T> = { success?: boolean; data?: T };

export default function HistoricalAnalysisClientPage() {
    const [days, setDays] = useState<DayMeta[]>([]);
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [catalystRows, setCatalystRows] = useState<CatalystScoreboardRow[]>([]);
    const [meta, setMeta] = useState<DayMeta | null>(null);
    const [archived, setArchived] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDays = useCallback(async () => {
        try {
            const res = await fetch(`${apiConfig.baseURL}/api/v1/public/market-driver-history`, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            });
            if (!res.ok) throw new Error("Failed to load historical days");
            const json = (await res.json()) as ApiEnvelope<DayMeta[]>;
            const list = Array.isArray(json.data) ? json.data : [];
            setDays(list);
            setSelectedDay((prev) => prev || list[0]?.dayKey || "");
        } catch {
            setError("Could not load historical days.");
        }
    }, []);

    const loadDay = useCallback(async (dayKey: string) => {
        if (!dayKey) {
            setCatalystRows([]);
            setMeta(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${apiConfig.baseURL}/api/v1/public/market-driver-history/${encodeURIComponent(dayKey)}`,
                { headers: { Accept: "application/json" }, cache: "no-store" },
            );
            if (!res.ok) throw new Error("Failed to load day");
            const json = (await res.json()) as ApiEnvelope<HistoricalDayPayload>;
            if (!json.data) throw new Error("Empty day payload");
            setCatalystRows(buildCatalystScoreboardRows(json.data.board));
            setMeta(json.data.meta);
            setArchived(json.data.archived);
        } catch {
            setError("Could not load this day's archive.");
            setCatalystRows([]);
            setMeta(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDays();
    }, [loadDays]);

    useEffect(() => {
        if (selectedDay) void loadDay(selectedDay);
    }, [selectedDay, loadDay]);

    const statusLine = useMemo(() => {
        if (!selectedDay) return "No archived UAE days yet — live data stays on Calendar & News until midnight Dubai time.";
        if (archived && meta) {
            return `Finalized ${meta.finalizedAt ? new Date(meta.finalizedAt).toLocaleString() : ""} · ${meta.relevantCount} relevant · ${meta.duplicateCount} duplicates · ${meta.irrelevantCount} irrelevant`;
        }
        return `UAE day ${selectedDay} — not yet finalized (showing reconstructed board from stored headlines)`;
    }, [selectedDay, archived, meta]);

    return (
        <Container>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-white">Historical Analysis</h1>
                    <p className="mt-1 max-w-2xl text-sm text-white/55">
                        Completed UAE days (Asia/Dubai midnight reset). Live day stays on{" "}
                        <Link href="/calendar-news" className="text-[#00c076] underline-offset-2 hover:underline">
                            Calendar & News
                        </Link>
                        .
                    </p>
                </div>
                <label className="flex flex-col gap-1 text-xs text-white/55">
                    UAE day
                    <select
                        className="min-w-[160px] rounded-md border border-white/15 bg-[rgb(var(--dark-grey))] px-3 py-2 text-sm text-white"
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        disabled={days.length === 0}
                    >
                        {days.length === 0 ? <option value="">No past days</option> : null}
                        {days.map((d) => (
                            <option key={d.dayKey} value={d.dayKey}>
                                {d.dayKey}
                                {d.finalizedAt ? " · archived" : ""}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <p className="mb-4 text-sm text-white/45">{statusLine}</p>

            {error ? <p className="mb-4 text-sm text-[#f84960]">{error}</p> : null}

            {loading ? (
                <div className="min-h-[200px] rounded-xl bg-darkGrey/60" aria-hidden />
            ) : (
                <>
                    <MarketCatalystScoreboardTable rows={catalystRows} />
                    <div className="mt-4">
                        <AdminNewsHeadlineSection dayKey={selectedDay || undefined} />
                    </div>
                </>
            )}
        </Container>
    );
}
