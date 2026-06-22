"use client";

import { useCallback, useEffect, useState } from "react";

import { tradingAlertService, type TradingAlert, type TradePartialClose } from "@/services";

/**
 * Shared source of all trading alerts (open + closed) for the terminal dashboard widgets.
 * Re-fetches when `refreshKey` changes (e.g. after a trade is sent/closed) and on a 30s interval.
 */
export function useTradingTerminalData(refreshKey = 0): {
    trades: TradingAlert[];
    partials: TradePartialClose[];
    ready: boolean;
} {
    const [trades, setTrades] = useState<TradingAlert[]>([]);
    const [partials, setPartials] = useState<TradePartialClose[]>([]);
    const [ready, setReady] = useState(false);

    const load = useCallback(async () => {
        try {
            const [all, partialRows] = await Promise.all([
                tradingAlertService.list(),
                tradingAlertService.listPartials(),
            ]);
            setTrades(all);
            setPartials(partialRows);
        } catch {
            /* keep last data */
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load, refreshKey]);

    useEffect(() => {
        const id = window.setInterval(() => void load(), 30_000);
        return () => window.clearInterval(id);
    }, [load]);

    return { trades, partials, ready };
}
