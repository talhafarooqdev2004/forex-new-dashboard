import type { TradePartialClose, TradingAlert } from "@/services";

/** History row derived from a manual partial close (parent trade stays open). */
export type TradeHistoryRow = TradingAlert & {
    history_kind?: "trade" | "partial";
    partial_id?: number;
};

function idKey(value: number | string | null | undefined): string {
    return String(value ?? "");
}

export function partialToHistoryRow(partial: TradePartialClose): TradeHistoryRow | null {
    const parent = partial.trading_alert;
    if (!parent) return null;

    return {
        ...parent,
        partial_id: partial.id,
        history_kind: "partial",
        status: "completed",
        pips: partial.pips,
        exit_price: partial.exit_price,
        outcome: partial.outcome,
        close_reason: partial.close_reason,
        created_at: partial.created_at,
        date: partial.created_at,
    };
}

/** Stable React list key — partial rows must not reuse trading alert ids. */
export function tradeHistoryRowKey(row: TradeHistoryRow): string {
    if (row.history_kind === "partial" && row.partial_id != null) {
        return `partial-${row.partial_id}`;
    }
    return `trade-${row.id}`;
}

/** Merge closed trades + partial closes for history display (newest first). */
export function buildTradeHistoryRows(
    trades: TradingAlert[],
    partials: TradePartialClose[],
): TradeHistoryRow[] {
    const completedParentIds = new Set(
        trades.filter((t) => t.status === "completed").map((t) => idKey(t.id)),
    );

    const partialRows = partials
        .filter((p) => !completedParentIds.has(idKey(p.trading_alert_id)))
        .map(partialToHistoryRow)
        .filter((r): r is TradeHistoryRow => r !== null);

    const closed = trades.filter((t) => t.status !== "open") as TradeHistoryRow[];

    return [...closed, ...partialRows];
}

/** Net pips for stats — avoids double-counting partial + final total on the same trade. */
export function netPipsFromHistory(trades: TradingAlert[], partials: TradePartialClose[]): number {
    const completedParentIds = new Set(
        trades.filter((t) => t.status === "completed").map((t) => idKey(t.id)),
    );

    const partialSum = partials
        .filter((p) => !completedParentIds.has(idKey(p.trading_alert_id)))
        .reduce((s, p) => s + Number(p.pips ?? 0), 0);

    const closedSum = trades
        .filter((t) => t.status === "completed")
        .reduce((s, t) => s + Number(t.pips ?? 0), 0);

    return partialSum + closedSum;
}
