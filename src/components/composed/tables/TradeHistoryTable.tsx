"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilLine, Trash2 } from "lucide-react";

import {
    HistoryDirectionPill,
    HistoryTypePill,
    StatusPill,
    TRADE_GREEN,
    TRADE_RED,
    TradingTablePagination,
    TradingTableShell,
    historyTdClass,
    historyThClass,
} from "./tradingTerminalTableShared";
import { tradingAlertService, type TradingAlert } from "@/services";
import { formatPrice } from "@/lib/technicalLevelsPrice";
import { formatRR } from "@/lib/tradingTerminalStats";
import EditTradeAlertDialog from "@/components/features/dialogs/EditTradeAlertDialog";

const PAGE_SIZE = 10;

const HISTORY_HEADERS = [
    "Date",
    "Trade ID",
    "Symbol",
    "Direction",
    "Type",
    "Session",
    "Entry",
    "SL",
    "TP1",
    "TP2",
    "TP3",
    "Risk %",
    "R:R",
    "Status",
    "Outcome",
    "Pips",
    "Exit Price",
    "Edit",
    "Delete",
] as const;

function formatDate(iso: string | null): string {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

const num = (v: number | null | undefined): number | null => (v == null ? null : Number(v));
const price = (v: number | null, pair: string) => (v !== null ? formatPrice(v, pair) : "-");

function outcomeColor(outcome: string | null): string | undefined {
    if (outcome === "Profit") return TRADE_GREEN;
    if (outcome === "Loss") return TRADE_RED;
    return undefined;
}

export default function TradeHistoryTable({
    canManage = false,
    refreshKey = 0,
    onChanged,
}: {
    canManage?: boolean;
    refreshKey?: number;
    onChanged?: () => void;
}) {
    const [trades, setTrades] = useState<TradingAlert[]>([]);
    const [editTrade, setEditTrade] = useState<TradingAlert | null>(null);
    const [page, setPage] = useState(1);

    const load = useCallback(async () => {
        try {
            const all = await tradingAlertService.list();
            setTrades(all.filter((t) => t.status !== "open"));
        } catch {
            /* keep last data */
        }
    }, []);

    useEffect(() => {
        // load() is async; setState runs after await, not synchronously.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load, refreshKey]);

    const totalPips = trades.reduce((sum, t) => sum + (num(t.pips) ?? 0), 0);
    const totalPages = Math.max(1, Math.ceil(trades.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageRows = trades.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleDelete = async (trade: TradingAlert) => {
        if (!window.confirm(`Delete trade ${trade.trade_id ?? ""}?`)) return;
        await tradingAlertService.remove(trade.id);
        await load();
        onChanged?.();
    };

    return (
        <TradingTableShell
            title="Trade History"
            footer={
                <TradingTablePagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    trailing={
                        <>
                            <div className="flex items-center justify-center px-4 py-2 border-l border-stroke min-w-[120px]">
                                <span className="text-[13px] font-semibold" style={{ color: totalPips >= 0 ? TRADE_GREEN : TRADE_RED }}>
                                    {`${totalPips >= 0 ? "+" : ""}${totalPips.toFixed(1)}`}
                                </span>
                            </div>
                            <div className="w-[96px] py-2 border-l border-stroke" />
                        </>
                    }
                />
            }
        >
            <div className="w-full min-w-0 horizontal-scroll">
                <table className="w-full min-w-[1580px]">
                    <thead>
                        <tr>
                            {HISTORY_HEADERS.map((header) => (
                                <th key={header} className={historyThClass()}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td className={historyTdClass("text-secondary")} colSpan={HISTORY_HEADERS.length}>
                                    No closed trades yet.
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((trade) => {
                                const pair = trade.pair ?? "";
                                const pips = num(trade.pips);
                                return (
                                    <tr key={trade.id}>
                                        <td className={historyTdClass()}>{formatDate(trade.date ?? trade.created_at)}</td>
                                        <td className={historyTdClass("font-bold")}>{trade.trade_id}</td>
                                        <td className={historyTdClass()}>{pair}</td>
                                        <td className={historyTdClass()}>
                                            <HistoryDirectionPill
                                                direction={(trade.direction ?? "buy") === "sell" ? "Sell" : "Buy"}
                                                label={trade.direction_type ?? undefined}
                                            />
                                        </td>
                                        <td className={historyTdClass()}>
                                            <HistoryTypePill type={trade.type ?? "-"} />
                                        </td>
                                        <td className={historyTdClass()}>{trade.session ?? "-"}</td>
                                        <td className={historyTdClass()}>{price(num(trade.entry_level), pair)}</td>
                                        <td className={historyTdClass("font-semibold")} style={{ color: TRADE_RED }}>{price(num(trade.stop_loss), pair)}</td>
                                        <td className={historyTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>{price(num(trade.tp1), pair)}</td>
                                        <td className={historyTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>{price(num(trade.tp2), pair)}</td>
                                        <td className={historyTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>{price(num(trade.tp3), pair)}</td>
                                        <td className={historyTdClass()}>{trade.risk ?? "-"}</td>
                                        <td className={historyTdClass("font-semibold")}>{formatRR(trade.max_tp_hit ?? 0)}</td>
                                        <td className={historyTdClass()}>
                                            <StatusPill label="Closed" variant="closed" />
                                        </td>
                                        <td className={historyTdClass("font-semibold")} style={{ color: outcomeColor(trade.outcome) }}>
                                            {trade.outcome ?? "-"}
                                        </td>
                                        <td className={historyTdClass("font-bold")} style={{ color: (pips ?? 0) >= 0 ? TRADE_GREEN : TRADE_RED }}>
                                            {pips !== null ? `${pips >= 0 ? "+" : ""}${pips.toFixed(1)}` : "-"}
                                        </td>
                                        <td className={historyTdClass()}>{price(num(trade.exit_price), pair)}</td>
                                        <td className={historyTdClass()}>
                                            {canManage ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditTrade(trade)}
                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-secondary hover:text-foreground hover:bg-stroke/20"
                                                    aria-label="Edit trade"
                                                >
                                                    <PencilLine className="w-[14px] h-[14px]" />
                                                </button>
                                            ) : null}
                                        </td>
                                        <td className={historyTdClass()}>
                                            {canManage ? (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleDelete(trade)}
                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-secondary hover:text-foreground hover:bg-stroke/20"
                                                    aria-label="Delete trade"
                                                >
                                                    <Trash2 className="w-[14px] h-[14px]" />
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <EditTradeAlertDialog
                open={editTrade !== null}
                trade={editTrade}
                onOpenChange={(o) => !o && setEditTrade(null)}
                onSaved={() => {
                    void load();
                    onChanged?.();
                }}
            />
        </TradingTableShell>
    );
}
