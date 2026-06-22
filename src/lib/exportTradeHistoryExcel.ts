import * as XLSX from "xlsx";

import type { TradeHistoryRow } from "@/lib/tradeHistoryMerge";
import { formatRR } from "@/lib/tradingTerminalStats";

function formatDate(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

function num(v: number | null | undefined): string {
    if (v == null || !Number.isFinite(Number(v))) return "";
    return String(v);
}

function rowFromHistory(trade: TradeHistoryRow): Record<string, string | number> {
    const direction = (trade.direction ?? "buy") === "sell" ? "Sell" : "Buy";
    const pips = trade.pips != null ? Number(trade.pips) : null;

    return {
        Date: formatDate(trade.date ?? trade.created_at),
        "Trade ID": trade.trade_id ?? "",
        Symbol: trade.pair ?? "",
        Direction: direction,
        "Direction Type": trade.direction_type ?? "",
        Type: trade.type ?? "",
        Session: trade.session ?? "",
        Entry: num(trade.entry_level),
        SL: num(trade.stop_loss),
        TP1: num(trade.tp1),
        TP2: num(trade.tp2),
        TP3: num(trade.tp3),
        "Risk %": trade.risk ?? "",
        "R:R": formatRR(trade.max_tp_hit ?? 0),
        Status: trade.history_kind === "partial" ? (trade.close_reason ?? "Partial") : "Closed",
        Outcome: trade.outcome ?? "",
        Pips: pips !== null ? pips : "",
        "Exit Price": num(trade.exit_price),
        "Close Reason": trade.close_reason ?? "",
        Notes: trade.comment ?? "",
    };
}

export function downloadTradeHistoryExcel(rows: TradeHistoryRow[], from: Date, to: Date): void {
    const sheetRows = rows.map(rowFromHistory);

    const sheet = XLSX.utils.json_to_sheet(
        sheetRows.length > 0 ? sheetRows : [{ Date: "No trades in selected range." }],
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Trade History");

    const fromLabel = from.toISOString().slice(0, 10);
    const toLabel = to.toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `trade-history_${fromLabel}_to_${toLabel}.xlsx`);
}

export function toInputDateValue(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function parseInputDate(value: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
}
