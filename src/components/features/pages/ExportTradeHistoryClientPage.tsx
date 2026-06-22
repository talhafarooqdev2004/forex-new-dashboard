"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Loader2, X } from "lucide-react";

import { Button, Input } from "@/components/ui";
import Container from "@/components/ui/layout/Container";
import { FieldLabel } from "@/components/composed/trading-terminal/tradeAlertSettingsShared";
import TradeHistorySortSelect from "@/components/composed/trading-terminal/TradeHistorySortSelect";
import { tradingAlertService } from "@/services";
import { buildTradeHistoryRows } from "@/lib/tradeHistoryMerge";
import {
    filterHistoryRowsByDateRange,
    normalizeTradeHistorySortKey,
    sortTradeHistoryRows,
    type TradeHistorySortKey,
} from "@/lib/tradeHistorySort";
import {
    downloadTradeHistoryExcel,
    parseInputDate,
    toInputDateValue,
} from "@/lib/exportTradeHistoryExcel";

export const EXPORT_TRADE_HISTORY_PATH = "/trading-terminal/export-trade-history";

export default function ExportTradeHistoryClientPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = useMemo(() => new Date(), []);
    const thirtyDaysAgo = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
    }, []);

    const initialSort = useMemo(() => normalizeTradeHistorySortKey(searchParams.get("sort")), [searchParams]);

    const [fromDate, setFromDate] = useState(toInputDateValue(thirtyDaysAgo));
    const [toDate, setToDate] = useState(toInputDateValue(today));
    const [sortBy, setSortBy] = useState<TradeHistorySortKey>(initialSort);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trades, setTrades] = useState<Awaited<ReturnType<typeof tradingAlertService.list>>>([]);
    const [partials, setPartials] = useState<Awaited<ReturnType<typeof tradingAlertService.listPartials>>>([]);

    useEffect(() => {
        setSortBy(initialSort);
    }, [initialSort]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [all, partialRows] = await Promise.all([
                tradingAlertService.list(),
                tradingAlertService.listPartials(),
            ]);
            setTrades(all);
            setPartials(partialRows);
        } catch {
            setError("Failed to load trade history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const from = parseInputDate(fromDate);
    const to = parseInputDate(toDate);

    const exportRows = useMemo(() => {
        if (!from || !to) return [];
        const merged = buildTradeHistoryRows(trades, partials);
        const filtered = filterHistoryRowsByDateRange(merged, from, to);
        return sortTradeHistoryRows(filtered, sortBy);
    }, [trades, partials, from, to, sortBy]);

    const matchCount = exportRows.length;

    const handleDownload = async () => {
        if (!from || !to) {
            setError("Please select a valid start and end date.");
            return;
        }
        if (from > to) {
            setError("Start date must be on or before end date.");
            return;
        }

        setDownloading(true);
        setError(null);
        try {
            let rows = exportRows;
            if (trades.length === 0) {
                const [all, partialRows] = await Promise.all([
                    tradingAlertService.list(),
                    tradingAlertService.listPartials(),
                ]);
                const merged = buildTradeHistoryRows(all, partialRows);
                const filtered = filterHistoryRowsByDateRange(merged, from, to);
                rows = sortTradeHistoryRows(filtered, sortBy);
            }
            downloadTradeHistoryExcel(rows, from, to);
        } catch {
            setError("Failed to generate Excel file.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Container className="pb-8 text-foreground">
            <div className="flex items-center justify-between gap-4 py-2">
                <h1 className="font-['Inter',sans-serif] font-bold text-xl text-foreground">Export Trade History</h1>
                <button
                    type="button"
                    onClick={() => router.push("/trading-terminal")}
                    className="text-foreground/80 hover:text-foreground p-1"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-darkGrey rounded-[12px] border border-stroke p-6 max-w-lg">
                <p className="text-sm text-secondary mb-6">
                    Select a date range and sort order. The Excel file includes the same closed trades and partial
                    closes shown in Trade History, filtered and sorted to match your selection.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <FieldLabel>From</FieldLabel>
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel>To</FieldLabel>
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                </div>

                <div className="mb-6">
                    <FieldLabel>Sort by</FieldLabel>
                    <TradeHistorySortSelect
                        value={sortBy}
                        onChange={setSortBy}
                        className="w-full h-9 text-sm mt-1"
                    />
                </div>

                {loading ? (
                    <p className="text-xs text-secondary mb-4 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading trade history…
                    </p>
                ) : (
                    <p className="text-xs text-secondary mb-4">
                        {matchCount} {matchCount === 1 ? "record" : "records"} in selected range
                    </p>
                )}

                {error ? <p className="text-xs text-[#fa003f] mb-4">{error}</p> : null}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                        variant="send-alert"
                        size="send-alert"
                        type="button"
                        className="font-bold"
                        onClick={() => void handleDownload()}
                        disabled={downloading || loading}
                    >
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download Excel
                    </Button>
                    <Button variant="outline" type="button" className="border-stroke bg-transparent" asChild>
                        <Link href="/trading-terminal">Back to Trading Terminal</Link>
                    </Button>
                </div>
            </div>
        </Container>
    );
}
