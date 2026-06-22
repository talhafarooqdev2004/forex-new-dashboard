"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PencilLine, Trash2, ZoomIn, ZoomOut } from "lucide-react";

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
    historyZoomTdClass,
    historyZoomThClass,
    tradingTerminalEmptyTdClass,
    tradingTerminalTableClass,
    tradingTerminalTableScrollClass,
} from "./tradingTerminalTableShared";
import { tradingAlertService, type TradingAlert } from "@/services";
import { formatPrice } from "@/lib/technicalLevelsPrice";
import { formatRR } from "@/lib/tradingTerminalStats";
import { cn } from "@/lib/utils";
import { buildTradeHistoryRows, netPipsFromHistory, tradeHistoryRowKey, type TradeHistoryRow } from "@/lib/tradeHistoryMerge";
import {
    DEFAULT_TRADE_HISTORY_SORT,
    sortTradeHistoryRows,
    type TradeHistorySortKey,
} from "@/lib/tradeHistorySort";
import TradeHistorySortSelect from "@/components/composed/trading-terminal/TradeHistorySortSelect";
import EditTradeAlertDialog from "@/components/features/dialogs/EditTradeAlertDialog";
import { EXPORT_TRADE_HISTORY_PATH } from "@/components/features/pages/ExportTradeHistoryClientPage";

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

function thClass(zoomed: boolean, extra = "") {
    return zoomed ? historyZoomThClass(extra) : historyThClass(extra);
}

function tdClass(zoomed: boolean, extra = "") {
    return zoomed ? historyZoomTdClass(extra) : historyTdClass(extra);
}

type HistoryTableBodyProps = {
    zoomed: boolean;
    pageRows: TradeHistoryRow[];
    canManage: boolean;
    onEdit: (trade: TradingAlert) => void;
    onDelete: (trade: TradingAlert) => void;
};

function HistoryTableBody({ zoomed, pageRows, canManage, onEdit, onDelete }: HistoryTableBodyProps) {
    return (
        <div className={cn(tradingTerminalTableScrollClass, "w-full min-w-0", zoomed && "max-h-[calc(96vh-11rem)] overflow-auto")}>
            <table className={tradingTerminalTableClass(zoomed ? "min-w-[1880px]" : "min-w-[1580px]")}>
                <thead className={zoomed ? "sticky top-0 z-10" : undefined}>
                    <tr>
                        {HISTORY_HEADERS.map((header) => (
                            <th key={header} className={thClass(zoomed)}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pageRows.length === 0 ? (
                        <tr>
                            <td className={tradingTerminalEmptyTdClass("text-secondary")} colSpan={HISTORY_HEADERS.length}>
                                No closed trades yet.
                            </td>
                        </tr>
                    ) : (
                        pageRows.map((trade) => {
                            const pair = trade.pair ?? "";
                            const pips = num(trade.pips);
                            const iconSize = zoomed ? "w-[18px] h-[18px]" : "w-[14px] h-[14px]";
                            const actionBtn = zoomed ? "w-9 h-9" : "w-7 h-7";

                            return (
                                <tr key={tradeHistoryRowKey(trade)}>
                                    <td className={tdClass(zoomed)}>{formatDate(trade.date ?? trade.created_at)}</td>
                                    <td className={tdClass(zoomed, "font-bold")}>{trade.trade_id}</td>
                                    <td className={tdClass(zoomed)}>{pair}</td>
                                    <td className={tdClass(zoomed)}>
                                        <HistoryDirectionPill
                                            direction={(trade.direction ?? "buy") === "sell" ? "Sell" : "Buy"}
                                            label={trade.direction_type ?? undefined}
                                        />
                                    </td>
                                    <td className={tdClass(zoomed)}>
                                        <HistoryTypePill type={trade.type ?? "-"} />
                                    </td>
                                    <td className={tdClass(zoomed)}>{trade.session ?? "-"}</td>
                                    <td className={tdClass(zoomed)}>{price(num(trade.entry_level), pair)}</td>
                                    <td className={tdClass(zoomed, "font-semibold")} style={{ color: TRADE_RED }}>
                                        {price(num(trade.stop_loss), pair)}
                                    </td>
                                    <td className={tdClass(zoomed, "font-semibold")} style={{ color: TRADE_GREEN }}>
                                        {price(num(trade.tp1), pair)}
                                    </td>
                                    <td className={tdClass(zoomed, "font-semibold")} style={{ color: TRADE_GREEN }}>
                                        {price(num(trade.tp2), pair)}
                                    </td>
                                    <td className={tdClass(zoomed, "font-semibold")} style={{ color: TRADE_GREEN }}>
                                        {price(num(trade.tp3), pair)}
                                    </td>
                                    <td className={tdClass(zoomed)}>{trade.risk ?? "-"}</td>
                                    <td className={tdClass(zoomed, "font-semibold")}>{formatRR(trade.max_tp_hit ?? 0)}</td>
                                    <td className={tdClass(zoomed)}>
                                        <StatusPill
                                            label={trade.history_kind === "partial" ? (trade.close_reason ?? "Partial") : "Closed"}
                                            variant={trade.history_kind === "partial" ? "open" : "closed"}
                                        />
                                    </td>
                                    <td className={tdClass(zoomed, "font-semibold")} style={{ color: outcomeColor(trade.outcome) }}>
                                        {trade.outcome ?? "-"}
                                    </td>
                                    <td className={tdClass(zoomed, "font-bold")} style={{ color: (pips ?? 0) >= 0 ? TRADE_GREEN : TRADE_RED }}>
                                        {pips !== null ? `${pips >= 0 ? "+" : ""}${pips.toFixed(1)}` : "-"}
                                    </td>
                                    <td className={tdClass(zoomed)}>{price(num(trade.exit_price), pair)}</td>
                                    <td className={tdClass(zoomed)}>
                                        {canManage && trade.history_kind !== "partial" ? (
                                            <button
                                                type="button"
                                                onClick={() => onEdit(trade)}
                                                className={cn(
                                                    "inline-flex items-center justify-center rounded-[4px] text-secondary hover:text-foreground hover:bg-stroke/20",
                                                    actionBtn,
                                                )}
                                                aria-label="Edit trade"
                                            >
                                                <PencilLine className={iconSize} />
                                            </button>
                                        ) : null}
                                    </td>
                                    <td className={tdClass(zoomed)}>
                                        {canManage && trade.history_kind !== "partial" ? (
                                            <button
                                                type="button"
                                                onClick={() => void onDelete(trade)}
                                                className={cn(
                                                    "inline-flex items-center justify-center rounded-[4px] text-secondary hover:text-foreground hover:bg-stroke/20",
                                                    actionBtn,
                                                )}
                                                aria-label="Delete trade"
                                            >
                                                <Trash2 className={iconSize} />
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
    );
}

function HistoryFooter({
    currentPage,
    totalPages,
    totalPips,
    onPageChange,
    zoomed = false,
}: {
    currentPage: number;
    totalPages: number;
    totalPips: number;
    onPageChange: (page: number) => void;
    zoomed?: boolean;
}) {
    return (
        <TradingTablePagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            trailing={
                <>
                    <div className="flex items-center justify-center px-4 py-2 border-l border-stroke min-w-[120px]">
                        <span
                            className={cn("font-semibold", zoomed ? "text-[17px]" : "text-[13px]")}
                            style={{ color: totalPips >= 0 ? TRADE_GREEN : TRADE_RED }}
                        >
                            {`${totalPips >= 0 ? "+" : ""}${totalPips.toFixed(1)}`}
                        </span>
                    </div>
                    <div className={cn("py-2 border-l border-stroke", zoomed ? "w-[124px]" : "w-[96px]")} />
                </>
            }
        />
    );
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
    const [partials, setPartials] = useState<Awaited<ReturnType<typeof tradingAlertService.listPartials>>>([]);
    const [editTrade, setEditTrade] = useState<TradingAlert | null>(null);
    const [page, setPage] = useState(1);
    const [zoomed, setZoomed] = useState(false);
    const [sortBy, setSortBy] = useState<TradeHistorySortKey>(DEFAULT_TRADE_HISTORY_SORT);

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
        }
    }, []);

    const historyRows = useMemo(
        () => sortTradeHistoryRows(buildTradeHistoryRows(trades, partials), sortBy),
        [trades, partials, sortBy],
    );

    useEffect(() => {
        setPage(1);
    }, [sortBy]);

    useEffect(() => {
        // load() is async; setState runs after await, not synchronously.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load, refreshKey]);

    useEffect(() => {
        if (!zoomed) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setZoomed(false);
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [zoomed]);

    const totalPips = netPipsFromHistory(trades, partials);
    const totalPages = Math.max(1, Math.ceil(historyRows.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageRows = historyRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handlePageChange = useCallback(
        (next: number) => {
            setPage(Math.max(1, Math.min(totalPages, next)));
        },
        [totalPages],
    );

    useEffect(() => {
        setPage((p) => Math.min(p, totalPages));
    }, [totalPages]);

    const handleDelete = async (trade: TradingAlert) => {
        if (!window.confirm(`Delete trade ${trade.trade_id ?? ""}?`)) return;
        await tradingAlertService.remove(trade.id);
        await load();
        onChanged?.();
    };

    const headerButtonClass =
        "inline-flex items-center justify-center rounded-[8px] border border-stroke bg-stroke/10 text-foreground hover:bg-stroke/20";

    return (
        <>
            <TradingTableShell
                title="Trade History"
                headerActions={
                    <>
                        <TradeHistorySortSelect value={sortBy} onChange={setSortBy} />
                        <button
                            type="button"
                            onClick={() => setZoomed(true)}
                            className={cn(headerButtonClass, "w-9 h-9")}
                            aria-label="Zoom in trade history"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <Link
                            href={`${EXPORT_TRADE_HISTORY_PATH}?sort=${sortBy}`}
                            className={cn(headerButtonClass, "px-3 py-1.5 text-xs font-semibold")}
                        >
                            Export Trade History
                        </Link>
                    </>
                }
                footer={
                    <HistoryFooter
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalPips={totalPips}
                        onPageChange={handlePageChange}
                    />
                }
            >
                <HistoryTableBody
                    zoomed={false}
                    pageRows={pageRows}
                    canManage={canManage}
                    onEdit={setEditTrade}
                    onDelete={handleDelete}
                />
            </TradingTableShell>

            {zoomed ? (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Trade History zoom view"
                    onClick={() => setZoomed(false)}
                >
                    <div
                        className="flex flex-col w-full max-w-[99vw] max-h-[96vh] bg-darkGrey rounded-[12px] border border-stroke overflow-hidden text-foreground shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-stroke shrink-0">
                            <h2 className="font-bold text-[24px] leading-[28px]">Trade History</h2>
                            <button
                                type="button"
                                onClick={() => setZoomed(false)}
                                className={cn(headerButtonClass, "gap-2 px-3 py-1.5 text-xs font-semibold")}
                                aria-label="Close zoom view"
                            >
                                <ZoomOut className="w-4 h-4" />
                                Close zoom
                            </button>
                        </div>

                        <HistoryTableBody
                            zoomed
                            pageRows={pageRows}
                            canManage={canManage}
                            onEdit={setEditTrade}
                            onDelete={handleDelete}
                        />

                        <HistoryFooter
                            zoomed
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalPips={totalPips}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            ) : null}

            <EditTradeAlertDialog
                open={editTrade !== null}
                trade={editTrade}
                allowPipsEdit
                onOpenChange={(o) => !o && setEditTrade(null)}
                onSaved={() => {
                    void load();
                    onChanged?.();
                }}
            />
        </>
    );
}
