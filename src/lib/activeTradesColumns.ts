export const ACTIVE_TRADE_COLUMN_IDS = [
    "date",
    "trade_id",
    "symbol",
    "direction",
    "type",
    "session",
    "current_price",
    "entry",
    "sl",
    "tp1",
    "tp2",
    "tp3",
    "risk",
    "rr",
    "status",
    "pips",
    "duration",
    "actions",
] as const;

export type ActiveTradeColumnId = (typeof ACTIVE_TRADE_COLUMN_IDS)[number];

export const ACTIVE_TRADE_COLUMNS: { id: ActiveTradeColumnId; label: string }[] = [
    { id: "date", label: "Date" },
    { id: "trade_id", label: "Trade ID" },
    { id: "symbol", label: "Symbol" },
    { id: "direction", label: "Direction" },
    { id: "type", label: "Type" },
    { id: "session", label: "Session" },
    { id: "current_price", label: "Current Price" },
    { id: "entry", label: "Entry" },
    { id: "sl", label: "SL" },
    { id: "tp1", label: "TP1" },
    { id: "tp2", label: "TP2" },
    { id: "tp3", label: "TP3" },
    { id: "risk", label: "Risk %" },
    { id: "rr", label: "R:R" },
    { id: "status", label: "Status" },
    { id: "pips", label: "Pips" },
    { id: "duration", label: "Duration" },
    { id: "actions", label: "Actions" },
];

export const ACTIVE_TRADES_COLUMNS_PREF_KEY = "active_trades_columns";

export type ActiveTradesColumnVisibility = Record<ActiveTradeColumnId, boolean>;

export function defaultActiveTradesColumnVisibility(): ActiveTradesColumnVisibility {
    return Object.fromEntries(ACTIVE_TRADE_COLUMN_IDS.map((id) => [id, true])) as ActiveTradesColumnVisibility;
}

export function parseActiveTradesColumnVisibility(raw: string | null | undefined): ActiveTradesColumnVisibility {
    const defaults = defaultActiveTradesColumnVisibility();
    if (!raw) return defaults;
    try {
        const parsed = JSON.parse(raw) as { visibility?: Partial<Record<ActiveTradeColumnId, boolean>> };
        const visibility = parsed?.visibility;
        if (!visibility || typeof visibility !== "object") return defaults;
        for (const id of ACTIVE_TRADE_COLUMN_IDS) {
            if (typeof visibility[id] === "boolean") {
                defaults[id] = visibility[id]!;
            }
        }
        return defaults;
    } catch {
        return defaults;
    }
}

export function serializeActiveTradesColumnVisibility(visibility: ActiveTradesColumnVisibility): string {
    return JSON.stringify({ visibility });
}

export function visibleActiveTradeColumns(visibility: ActiveTradesColumnVisibility) {
    return ACTIVE_TRADE_COLUMNS.filter((col) => visibility[col.id]);
}
