"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import {
    ActiveDirectionPill,
    StatusPill,
    TRADE_GREEN,
    TRADE_RED,
    TradingTableShell,
    activeTdClass,
    activeThClass,
} from "./tradingTerminalTableShared";
import { tradingAlertService, type TradingAlert } from "@/services";
import { useLivePrices } from "@/hooks/useLivePrices";
import { evaluateTrade, floatingPips } from "@/lib/tradeAlertCalc";
import { formatRR } from "@/lib/tradingTerminalStats";
import { formatPrice } from "@/lib/technicalLevelsPrice";
import EditTradeAlertDialog from "@/components/features/dialogs/EditTradeAlertDialog";

const ACTIVE_TRADE_HEADERS = [
    "Date",
    "Trade ID",
    "Symbol",
    "Direction",
    "Type",
    "Session",
    "Current Price",
    "Entry",
    "SL",
    "TP1",
    "TP2",
    "TP3",
    "Risk %",
    "R:R",
    "Status",
    "Pips",
    "Duration",
    "Actions",
] as const;

function formatDate(iso: string | null): string {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

function formatDuration(iso: string | null): string {
    if (!iso) return "-";
    const start = new Date(iso).getTime();
    if (Number.isNaN(start)) return "-";
    const mins = Math.max(0, Math.floor((Date.now() - start) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

function formatPips(value: number | null): string {
    if (value === null) return "-";
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

const num = (v: number | null | undefined): number | null => (v == null ? null : Number(v));

export default function ActiveTradesTable({
    showSettings = false,
    settingsHref,
    canManage = false,
    refreshKey = 0,
    onChanged,
}: {
    showSettings?: boolean;
    settingsHref?: string;
    canManage?: boolean;
    refreshKey?: number;
    onChanged?: () => void;
}) {
    const [trades, setTrades] = useState<TradingAlert[]>([]);
    const [editTrade, setEditTrade] = useState<TradingAlert | null>(null);
    const { getPrice } = useLivePrices();
    const closingRef = useRef<Set<number>>(new Set());

    const load = useCallback(async () => {
        try {
            const all = await tradingAlertService.list();
            setTrades(all.filter((t) => t.status === "open"));
        } catch {
            /* keep last data */
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load, refreshKey]);

    // Periodic refresh so durations/new data stay reasonably fresh.
    useEffect(() => {
        const id = window.setInterval(() => void load(), 30_000);
        return () => window.clearInterval(id);
    }, [load]);

    const closeTrade = useCallback(
        async (trade: TradingAlert, exitPrice: number, outcome: "Profit" | "Loss", reason: string, event: string) => {
            if (closingRef.current.has(trade.id)) return;
            closingRef.current.add(trade.id);
            try {
                const pips = floatingPips({
                    entry: num(trade.entry_level),
                    currentPrice: exitPrice,
                    pair: trade.pair ?? "",
                    direction: trade.direction ?? "buy",
                });
                await tradingAlertService.update(trade.id, {
                    status: "completed",
                    exit_price: exitPrice,
                    outcome,
                    pips: pips !== null ? Number(pips.toFixed(2)) : null,
                    close_reason: reason,
                });
                // Deliver the close alert (backend dedupes); status is now persisted with exit/pips.
                await tradingAlertService.notify(trade.id, event).catch(() => undefined);
                await load();
                onChanged?.();
            } finally {
                closingRef.current.delete(trade.id);
            }
        },
        [load, onChanged],
    );

    // Build the live view rows. Status/SL/close transitions + alerts are owned by the
    // backend evaluator worker; here we only display live price/status and offer manual actions.
    const rows = trades.map((trade) => {
        const cp = getPrice(trade.pair ?? "");
        const evaluation = evaluateTrade({
            entry: num(trade.entry_level),
            sl: num(trade.stop_loss),
            tp1: num(trade.tp1),
            tp2: num(trade.tp2),
            tp3: num(trade.tp3),
            direction: trade.direction ?? "buy",
            directionType: trade.direction_type ?? "",
            currentPrice: cp,
            activated: trade.activated,
            activationSide: trade.activation_side,
        });
        const pips = floatingPips({
            entry: num(trade.entry_level),
            currentPrice: cp,
            pair: trade.pair ?? "",
            direction: trade.direction ?? "buy",
        });
        return { trade, cp, evaluation, pips };
    });

    const handleManualClose = (trade: TradingAlert) => {
        const cp = getPrice(trade.pair ?? "");
        if (cp === null) return;
        const entry = num(trade.entry_level) ?? cp;
        const isBuy = (trade.direction ?? "buy") === "buy";
        const profit = isBuy ? cp >= entry : cp <= entry;
        void closeTrade(trade, cp, profit ? "Profit" : "Loss", "Manually Closed", "closed");
    };

    const toggleFlag = async (trade: TradingAlert, key: "tsl_enabled" | "breakeven_enabled") => {
        await tradingAlertService.update(trade.id, { [key]: !trade[key] });
        await load();
    };

    const handleDelete = async (trade: TradingAlert) => {
        if (!window.confirm(`Delete trade ${trade.trade_id ?? ""}?`)) return;
        await tradingAlertService.remove(trade.id);
        await load();
        onChanged?.();
    };

    return (
        <TradingTableShell title="Active Trades" showSettings={showSettings} settingsHref={settingsHref} footer={null}>
            <div className="horizontal-scroll">
                <table className="w-full min-w-[1680px]">
                    <thead>
                        <tr className="bg-stroke/10">
                            {ACTIVE_TRADE_HEADERS.map((header) => (
                                <th key={header} className={activeThClass()}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td className={activeTdClass("text-center text-secondary")} colSpan={ACTIVE_TRADE_HEADERS.length}>
                                    No active trades.
                                </td>
                            </tr>
                        ) : (
                            rows.map(({ trade, cp, evaluation, pips }) => {
                                const entry = num(trade.entry_level);
                                const cpUp = cp !== null && entry !== null ? cp >= entry : true;
                                const pair = trade.pair ?? "";
                                return (
                                    <tr key={trade.id} className="border-b border-stroke/50">
                                        <td className={activeTdClass()}>{formatDate(trade.date ?? trade.created_at)}</td>
                                        <td className={activeTdClass("font-bold")}>{trade.trade_id}</td>
                                        <td className={activeTdClass()}>{pair}</td>
                                        <td className={activeTdClass()}>
                                            <ActiveDirectionPill
                                                direction={(trade.direction ?? "buy") === "sell" ? "Sell" : "Buy"}
                                                label={trade.direction_type ?? undefined}
                                            />
                                        </td>
                                        <td className={activeTdClass()}>{trade.type ?? "-"}</td>
                                        <td className={activeTdClass()}>{trade.session ?? "-"}</td>
                                        <td className={activeTdClass("font-bold")} style={{ color: cpUp ? TRADE_GREEN : TRADE_RED }}>
                                            {cp !== null ? formatPrice(cp, pair) : "-"}
                                        </td>
                                        <td className={activeTdClass()}>{entry !== null ? formatPrice(entry, pair) : "-"}</td>
                                        <td className={activeTdClass("font-semibold")} style={{ color: TRADE_RED }}>
                                            {num(trade.stop_loss) !== null ? formatPrice(num(trade.stop_loss)!, pair) : "-"}
                                        </td>
                                        <td className={activeTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>
                                            {num(trade.tp1) !== null ? formatPrice(num(trade.tp1)!, pair) : "-"}
                                        </td>
                                        <td className={activeTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>
                                            {num(trade.tp2) !== null ? formatPrice(num(trade.tp2)!, pair) : "-"}
                                        </td>
                                        <td className={activeTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>
                                            {num(trade.tp3) !== null ? formatPrice(num(trade.tp3)!, pair) : "-"}
                                        </td>
                                        <td className={activeTdClass()}>{trade.risk ?? "-"}</td>
                                        <td className={activeTdClass("font-semibold")}>
                                            {formatRR(trade.max_tp_hit ?? 0)}
                                        </td>
                                        <td className={activeTdClass()}>
                                            <StatusPill
                                                label={evaluation.statusLabel}
                                                variant={evaluation.isPending ? "pending" : "open"}
                                            />
                                        </td>
                                        <td className={activeTdClass("font-bold")} style={{ color: (pips ?? 0) >= 0 ? TRADE_GREEN : TRADE_RED }}>
                                            {formatPips(pips)}
                                        </td>
                                        <td className={activeTdClass()}>{formatDuration(trade.created_at)}</td>
                                        <td className={activeTdClass()}>
                                            {canManage ? (
                                                <RowActionsMenu
                                                    trade={trade}
                                                    onClose={() => handleManualClose(trade)}
                                                    onToggleTsl={() => void toggleFlag(trade, "tsl_enabled")}
                                                    onToggleBe={() => void toggleFlag(trade, "breakeven_enabled")}
                                                    onEdit={() => setEditTrade(trade)}
                                                    onDelete={() => void handleDelete(trade)}
                                                />
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

function RowActionsMenu({
    trade,
    onClose,
    onToggleTsl,
    onToggleBe,
    onEdit,
    onDelete,
}: {
    trade: TradingAlert;
    onClose: () => void;
    onToggleTsl: () => void;
    onToggleBe: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    const toggle = () => {
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setCoords({ top: r.bottom + 4, left: Math.max(8, r.right - 176) });
        }
        setOpen((o) => !o);
    };

    const run = (fn: () => void) => () => {
        setOpen(false);
        fn();
    };

    const itemClass = "block w-full px-3 py-2 text-left text-[12px] hover:bg-stroke/30";

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={toggle}
                className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-secondary hover:text-foreground hover:bg-stroke/20"
                aria-label="Trade actions"
            >
                <MoreHorizontal className="w-[14px] h-[14px]" />
            </button>
            {open && coords ? (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-50 w-44 overflow-hidden rounded-[6px] border border-stroke bg-darkGrey shadow-lg"
                        style={{ top: coords.top, left: coords.left }}
                    >
                        <button type="button" className={itemClass} onClick={run(onClose)}>Close Trade</button>
                        <button type="button" className={itemClass} onClick={run(onToggleTsl)}>
                            {trade.tsl_enabled ? "Disable TSL" : "Enable TSL"}
                        </button>
                        <button type="button" className={itemClass} onClick={run(onToggleBe)}>
                            {trade.breakeven_enabled ? "Disable Breakeven" : "Enable Breakeven"}
                        </button>
                        <button type="button" className={itemClass} onClick={run(onEdit)}>Edit</button>
                        <button type="button" className={`${itemClass} text-[#fa003f]`} onClick={run(onDelete)}>Delete</button>
                    </div>
                </>
            ) : null}
        </>
    );
}
