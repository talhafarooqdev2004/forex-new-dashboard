import type { TradeHistoryRow } from "@/lib/tradeHistoryMerge";

export const TRADE_HISTORY_SORT_OPTIONS = [
    { value: "date", label: "Date" },
    { value: "type", label: "Trade Style" },
    { value: "pips", label: "Pips" },
    { value: "profit", label: "Profits First" },
    { value: "loss", label: "Losses First" },
] as const;

export type TradeHistorySortKey = (typeof TRADE_HISTORY_SORT_OPTIONS)[number]["value"];

export const DEFAULT_TRADE_HISTORY_SORT: TradeHistorySortKey = "date";

const TYPE_ORDER: Record<string, number> = {
    Scalping: 0,
    Swing: 1,
    Intraday: 2,
};

function dayStart(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function rowDay(row: TradeHistoryRow): number | null {
    const iso = row.date ?? row.created_at;
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return dayStart(d);
}

function rowTimestamp(row: TradeHistoryRow): number {
    const iso = row.date ?? row.created_at;
    const t = iso ? new Date(iso).getTime() : 0;
    return Number.isFinite(t) ? t : 0;
}

function rowPips(row: TradeHistoryRow): number {
    const p = Number(row.pips ?? 0);
    return Number.isFinite(p) ? p : 0;
}

function rowTypeOrder(row: TradeHistoryRow): number {
    return TYPE_ORDER[row.type ?? ""] ?? 99;
}

function rowIsProfit(row: TradeHistoryRow): boolean {
    return row.outcome === "Profit";
}

function rowIsLoss(row: TradeHistoryRow): boolean {
    return row.outcome === "Loss";
}

export function isTradeHistorySortKey(value: string | null | undefined): value is TradeHistorySortKey {
    return TRADE_HISTORY_SORT_OPTIONS.some((o) => o.value === value);
}

/** Maps legacy `outcome` query params to the split profit/loss options. */
export function normalizeTradeHistorySortKey(value: string | null | undefined): TradeHistorySortKey {
    if (value === "outcome") return "profit";
    return isTradeHistorySortKey(value) ? value : DEFAULT_TRADE_HISTORY_SORT;
}

export function sortTradeHistoryRows(
    rows: TradeHistoryRow[],
    sortBy: TradeHistorySortKey = DEFAULT_TRADE_HISTORY_SORT,
): TradeHistoryRow[] {
    const copy = [...rows];

    switch (sortBy) {
        case "type":
            return copy.sort((a, b) => {
                const byType = rowTypeOrder(a) - rowTypeOrder(b);
                return byType !== 0 ? byType : rowTimestamp(b) - rowTimestamp(a);
            });
        case "pips":
            return copy.sort((a, b) => {
                const byPips = rowPips(b) - rowPips(a);
                return byPips !== 0 ? byPips : rowTimestamp(b) - rowTimestamp(a);
            });
        case "profit":
            return copy.sort((a, b) => {
                const aProfit = rowIsProfit(a) ? 0 : 1;
                const bProfit = rowIsProfit(b) ? 0 : 1;
                if (aProfit !== bProfit) return aProfit - bProfit;
                const byPips = rowPips(b) - rowPips(a);
                return byPips !== 0 ? byPips : rowTimestamp(b) - rowTimestamp(a);
            });
        case "loss":
            return copy.sort((a, b) => {
                const aLoss = rowIsLoss(a) ? 0 : 1;
                const bLoss = rowIsLoss(b) ? 0 : 1;
                if (aLoss !== bLoss) return aLoss - bLoss;
                const byPips = rowPips(a) - rowPips(b);
                return byPips !== 0 ? byPips : rowTimestamp(b) - rowTimestamp(a);
            });
        case "date":
        default:
            return copy.sort((a, b) => rowTimestamp(b) - rowTimestamp(a));
    }
}

/** History rows whose calendar date falls within [from, to] (inclusive). */
export function filterHistoryRowsByDateRange(
    rows: TradeHistoryRow[],
    from: Date,
    to: Date,
): TradeHistoryRow[] {
    const start = dayStart(from);
    const end = dayStart(to);
    const [lo, hi] = start <= end ? [start, end] : [end, start];

    return rows.filter((row) => {
        const day = rowDay(row);
        return day !== null && day >= lo && day <= hi;
    });
}
