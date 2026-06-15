"use client";

import { useCallback, useEffect, useState } from "react";

import { tradingAlertService, type TradingAlert } from "@/services";

/**
 * Shared source of all trading alerts (open + closed) for the terminal dashboard widgets.
 * Re-fetches when `refreshKey` changes (e.g. after a trade is sent/closed) and on a 30s interval.
 */
export function useTradingTerminalData(refreshKey = 0): { trades: TradingAlert[]; ready: boolean } {
    const [trades, setTrades] = useState<TradingAlert[]>([]);
    const [ready, setReady] = useState(false);

    const load = useCallback(async () => {
        try {
            const all = await tradingAlertService.list();
            setTrades(all);
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

    return { trades, ready };
}
