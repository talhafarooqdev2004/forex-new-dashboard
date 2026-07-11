"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import {
    mapMarketDriverNews,
    type MarketDriverNewsDTO,
    type NewsHeadlineRow,
} from "@/lib/calendarNewsHeadlinesData";
import { apiConfig } from "@/services/api.config";

import NewsHeadlineTable from "./NewsHeadlineTable";

type ApiEnvelope =
    | { success?: boolean; data?: MarketDriverNewsDTO[] }
    | { success?: boolean; data?: { dayKey?: string; rows?: MarketDriverNewsDTO[] } };

type AdminNewsHeadlineSectionProps = {
    /** Bumped when the parent receives a `calendarNewsUpdate` socket event. */
    refreshKey?: number;
    /** UAE day key (YYYY-MM-DD). Defaults to live today. */
    dayKey?: string;
};

function extractRows(json: ApiEnvelope): MarketDriverNewsDTO[] | null {
    if (!json.success || json.data === undefined) return null;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.data.rows)) return json.data.rows;
    return null;
}

/**
 * Admin-only News / Market Drivers table (doc §34). Fetches client-side with the admin bearer
 * token so the data never reaches non-admin browsers; renders nothing at all for other users.
 */
export default function AdminNewsHeadlineSection({
    refreshKey = 0,
    dayKey,
}: AdminNewsHeadlineSectionProps) {
    const { ready, isAdmin, token } = useAuth();
    const [rows, setRows] = useState<NewsHeadlineRow[] | null>(null);

    useEffect(() => {
        if (!ready || !isAdmin || !token) return;

        let cancelled = false;
        void (async () => {
            try {
                const qs = dayKey ? `?day=${encodeURIComponent(dayKey)}` : "";
                const res = await fetch(`${apiConfig.baseURL}/api/v1/admin/market-driver-news${qs}`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    cache: "no-store",
                });
                if (!res.ok) return;
                const json = (await res.json()) as ApiEnvelope;
                const data = extractRows(json);
                if (cancelled || !data) return;
                setRows(mapMarketDriverNews(data));
            } catch {
                /* non-fatal: admin table just stays hidden if the fetch fails */
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [ready, isAdmin, token, refreshKey, dayKey]);

    if (!ready || !isAdmin || !rows) return null;

    return <NewsHeadlineTable rows={rows} />;
}
