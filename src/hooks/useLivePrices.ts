"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { apiConfig } from "@/services/api.config";
import { dynamicTableService, type DynamicTable } from "@/services/dynamicTable.service";
import { buildPriceMap, normalizePair, TECHNICAL_LEVELS_TABLE_ID } from "@/lib/technicalLevelsPrice";
import { useDashboardBackendPoll } from "@/hooks/useDashboardBackendPoll";

type TableUpdatePayload = {
    data?: { identifier?: string; tableId?: string; table?: DynamicTable };
    table?: DynamicTable;
};

/**
 * Shared live price feed sourced from the same `fx_technical_levels` dynamic table the
 * FX Analyzer Pro page uses. Returns `getPrice(pair)` for the current price plus a `ready`
 * flag. Stays live via socket.io table events with a 60s polling fallback.
 */
export function useLivePrices(): { getPrice: (pair: string) => number | null; ready: boolean } {
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [ready, setReady] = useState(false);

    const load = useCallback(async () => {
        try {
            const response = await dynamicTableService.getTableByIdentifier(TECHNICAL_LEVELS_TABLE_ID);
            setPrices(buildPriceMap(response?.data ?? null));
        } catch {
            // keep last known prices on failure
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    useDashboardBackendPoll(load);

    useEffect(() => {
        const socket = io(apiConfig.baseURL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        const reloadForTrackedTable = (payload?: TableUpdatePayload) => {
            const identifier =
                payload?.data?.identifier ??
                payload?.data?.tableId ??
                payload?.data?.table?.identifier ??
                payload?.table?.identifier;
            if (!identifier || identifier === TECHNICAL_LEVELS_TABLE_ID) {
                void load();
            }
        };

        socket.on("tableUpdate", reloadForTrackedTable);
        socket.on("tableEditorUpdate", reloadForTrackedTable);
        socket.on("tableEditorSync", reloadForTrackedTable);

        return () => {
            socket.off("tableUpdate", reloadForTrackedTable);
            socket.off("tableEditorUpdate", reloadForTrackedTable);
            socket.off("tableEditorSync", reloadForTrackedTable);
            socket.disconnect();
        };
    }, [load]);

    const pricesRef = useRef(prices);
    pricesRef.current = prices;

    const getPrice = useCallback((pair: string): number | null => {
        const value = pricesRef.current[normalizePair(pair)];
        return value ?? null;
    }, []);

    return { getPrice, ready };
}
