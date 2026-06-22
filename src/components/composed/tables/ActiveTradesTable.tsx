"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import ActiveTradesColumnPicker from "./ActiveTradesColumnPicker";
import { LiveFlashTd } from "./LiveFlashTd";
import {
    ActiveDirectionPill,
    StatusPill,
    TRADE_GREEN,
    TRADE_RED,
    TradingTableShell,
    activeTdClass,
    activeThClass,
    activeTradesTableScrollClass,
    ACTIVE_TRADES_VERTICAL_SCROLL_THRESHOLD,
    tradingTerminalEmptyTdClass,
    activeTradesTerminalTableClass,
} from "./tradingTerminalTableShared";
import { tradingAlertService, userPreferenceService, type TradingAlert } from "@/services";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLivePrices } from "@/hooks/useLivePrices";
import { evaluateTrade, floatingPips } from "@/lib/tradeAlertCalc";
import { cn } from "@/lib/utils";
import { formatRR } from "@/lib/tradingTerminalStats";
import { formatPrice } from "@/lib/technicalLevelsPrice";
import {
    defaultActiveTradesColumnVisibility,
    type ActiveTradeColumnId,
    type ActiveTradesColumnVisibility,
    visibleActiveTradeColumns,
} from "@/lib/activeTradesColumns";
import EditTradeAlertDialog from "@/components/features/dialogs/EditTradeAlertDialog";

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

function activeTradeSortTime(trade: TradingAlert): number {
    const created = new Date(trade.created_at).getTime();
    if (Number.isFinite(created)) return created;
    const fallback = new Date(trade.date ?? "").getTime();
    return Number.isFinite(fallback) ? fallback : 0;
}

function sortActiveTradesOldestFirst(a: TradingAlert, b: TradingAlert): number {
    const byCreatedAt = activeTradeSortTime(a) - activeTradeSortTime(b);
    if (byCreatedAt !== 0) return byCreatedAt;
    return Number(a.id) - Number(b.id);
}

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
    const { user, ready } = useAuth();
    const [trades, setTrades] = useState<TradingAlert[]>([]);
    const [editTrade, setEditTrade] = useState<TradingAlert | null>(null);
    const [columnVisibility, setColumnVisibility] = useState<ActiveTradesColumnVisibility>(
        defaultActiveTradesColumnVisibility,
    );
    const [columnsLoaded, setColumnsLoaded] = useState(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { getPrice } = useLivePrices();
    const closingRef = useRef<Set<number>>(new Set());

    const visibleColumns = visibleActiveTradeColumns(columnVisibility);

    const load = useCallback(async () => {
        try {
            const all = await tradingAlertService.list();
            const open = all
                .filter((t) => t.status === "open")
                .sort(sortActiveTradesOldestFirst);
            setTrades(open);
        } catch {
            /* keep last data */
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load, refreshKey]);

    useEffect(() => {
        const id = window.setInterval(() => void load(), 30_000);
        return () => window.clearInterval(id);
    }, [load]);

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            setColumnVisibility(defaultActiveTradesColumnVisibility());
            setColumnsLoaded(true);
            return;
        }

        let active = true;
        (async () => {
            try {
                const visibility = await userPreferenceService.getActiveTradesColumnVisibility();
                if (active) setColumnVisibility(visibility);
            } catch {
                if (active) setColumnVisibility(defaultActiveTradesColumnVisibility());
            } finally {
                if (active) setColumnsLoaded(true);
            }
        })();

        return () => {
            active = false;
        };
    }, [ready, user?.id]);

    const persistColumnVisibility = useCallback(
        (next: ActiveTradesColumnVisibility) => {
            if (!user) return;
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                void userPreferenceService.saveActiveTradesColumnVisibility(next).catch(() => undefined);
            }, 400);
        },
        [user],
    );

    const handleColumnVisibilityChange = (next: ActiveTradesColumnVisibility) => {
        const visibleCount = Object.values(next).filter(Boolean).length;
        if (visibleCount < 1) return;
        setColumnVisibility(next);
        persistColumnVisibility(next);
    };

    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    const closeTrade = useCallback(
        async (trade: TradingAlert) => {
            if (closingRef.current.has(trade.id)) return;
            closingRef.current.add(trade.id);
            try {
                await tradingAlertService.fullClose(trade.id);
                await load();
                onChanged?.();
            } finally {
                closingRef.current.delete(trade.id);
            }
        },
        [load, onChanged],
    );

    const partialCloseTrade = useCallback(
        async (trade: TradingAlert, level: 1 | 2 | 3) => {
            if (closingRef.current.has(trade.id)) return;
            closingRef.current.add(trade.id);
            try {
                await tradingAlertService.partialClose(trade.id, level);
                await load();
                onChanged?.();
            } finally {
                closingRef.current.delete(trade.id);
            }
        },
        [load, onChanged],
    );

    const handleManualClose = (trade: TradingAlert) => {
        if (!window.confirm(`Fully close trade ${trade.trade_id ?? ""}?`)) return;
        void closeTrade(trade);
    };

    const handlePartialClose = (trade: TradingAlert, level: 1 | 2 | 3) => {
        const cp = getPrice(trade.pair ?? "");
        const pips = floatingPips({
            entry: num(trade.entry_level),
            currentPrice: cp,
            pair: trade.pair ?? "",
            direction: trade.direction ?? "buy",
        });
        const pipsLabel = pips !== null ? `${pips >= 0 ? "+" : ""}${pips.toFixed(1)}` : "current";
        if (!window.confirm(`Record partial close at TP${level} (${pipsLabel} pips)? The trade will remain active.`)) return;
        void partialCloseTrade(trade, level);
    };

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
            maxTpHit: trade.max_tp_hit ?? 0,
            activated: trade.activated,
            activationSide: trade.activation_side,
            breakevenDone: trade.breakeven_done,
        });
        const pips = evaluation.isPending
            ? null
            : floatingPips({
                  entry: num(trade.entry_level),
                  currentPrice: cp,
                  pair: trade.pair ?? "",
                  direction: trade.direction ?? "buy",
              });
        return { trade, cp, evaluation, pips };
    });

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

    const renderCell = (
        columnId: ActiveTradeColumnId,
        trade: TradingAlert,
        cp: number | null,
        evaluation: ReturnType<typeof evaluateTrade>,
        pips: number | null,
    ) => {
        const entry = num(trade.entry_level);
        const cpUp = cp !== null && entry !== null ? cp >= entry : true;
        const pair = trade.pair ?? "";

        switch (columnId) {
            case "date":
                return <td className={activeTdClass()}>{formatDate(trade.date ?? trade.created_at)}</td>;
            case "trade_id":
                return <td className={activeTdClass("font-bold")}>{trade.trade_id}</td>;
            case "symbol":
                return <td className={activeTdClass()}>{pair}</td>;
            case "direction":
                return (
                    <td className={activeTdClass()}>
                        <ActiveDirectionPill
                            direction={(trade.direction ?? "buy") === "sell" ? "Sell" : "Buy"}
                            label={trade.direction_type ?? undefined}
                        />
                    </td>
                );
            case "type":
                return <td className={activeTdClass()}>{trade.type ?? "-"}</td>;
            case "session":
                return <td className={activeTdClass()}>{trade.session ?? "-"}</td>;
            case "current_price":
                return (
                    <LiveFlashTd
                        key={`${trade.id}-current_price`}
                        value={cp}
                        className="font-bold"
                        style={{ color: cpUp ? TRADE_GREEN : TRADE_RED }}
                    >
                        {cp !== null ? formatPrice(cp, pair) : "-"}
                    </LiveFlashTd>
                );
            case "entry":
                return <td className={activeTdClass()}>{entry !== null ? formatPrice(entry, pair) : "-"}</td>;
            case "sl":
                return (
                    <td className={activeTdClass("font-semibold")} style={{ color: TRADE_RED }}>
                        {num(trade.stop_loss) !== null ? formatPrice(num(trade.stop_loss)!, pair) : "-"}
                    </td>
                );
            case "tp1":
                return (
                    <td className={activeTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>
                        {num(trade.tp1) !== null ? formatPrice(num(trade.tp1)!, pair) : "-"}
                    </td>
                );
            case "tp2":
                return (
                    <td className={activeTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>
                        {num(trade.tp2) !== null ? formatPrice(num(trade.tp2)!, pair) : "-"}
                    </td>
                );
            case "tp3":
                return (
                    <td className={activeTdClass("font-semibold")} style={{ color: TRADE_GREEN }}>
                        {num(trade.tp3) !== null ? formatPrice(num(trade.tp3)!, pair) : "-"}
                    </td>
                );
            case "risk":
                return <td className={activeTdClass()}>{trade.risk ?? "-"}</td>;
            case "rr":
                return <td className={activeTdClass("font-semibold")}>{formatRR(trade.max_tp_hit ?? 0)}</td>;
            case "status":
                return (
                    <td className={activeTdClass()}>
                        <div className="flex flex-col items-start gap-1">
                            <StatusPill
                                label={evaluation.statusLabel}
                                variant={evaluation.isPending ? "pending" : "open"}
                            />
                            {evaluation.slStatusLabel ? (
                                <StatusPill label={evaluation.slStatusLabel} variant="breakeven" />
                            ) : null}
                        </div>
                    </td>
                );
            case "pips":
                return (
                    <LiveFlashTd
                        key={`${trade.id}-pips`}
                        value={pips}
                        className="font-bold"
                        style={{ color: (pips ?? 0) >= 0 ? TRADE_GREEN : TRADE_RED }}
                    >
                        {formatPips(pips)}
                    </LiveFlashTd>
                );
            case "duration":
                return <td className={activeTdClass()}>{formatDuration(trade.created_at)}</td>;
            case "actions":
                return (
                    <td className={activeTdClass()}>
                        {canManage ? (
                            <RowActionsMenu
                                trade={trade}
                                onPartialClose={(level) => handlePartialClose(trade, level)}
                                onFullClose={() => handleManualClose(trade)}
                                onToggleTsl={() => void toggleFlag(trade, "tsl_enabled")}
                                onToggleBe={() => void toggleFlag(trade, "breakeven_enabled")}
                                onEdit={() => setEditTrade(trade)}
                                onDelete={() => void handleDelete(trade)}
                            />
                        ) : null}
                    </td>
                );
            default:
                return null;
        }
    };

    return (
        <TradingTableShell
            title="Active Trades"
            showSettings={showSettings}
            settingsHref={settingsHref}
            headerActions={
                columnsLoaded && user ? (
                    <ActiveTradesColumnPicker visibility={columnVisibility} onChange={handleColumnVisibilityChange} />
                ) : null
            }
            footer={null}
        >
            <div className={activeTradesTableScrollClass(rows.length)}>
                <table className={activeTradesTerminalTableClass()}>
                    <thead className={rows.length > ACTIVE_TRADES_VERTICAL_SCROLL_THRESHOLD ? "sticky top-0 z-10" : undefined}>
                        <tr>
                            {visibleColumns.map((col) => (
                                <th key={col.id} className={activeThClass()}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td className={tradingTerminalEmptyTdClass()} colSpan={visibleColumns.length || 1}>
                                    No active trades.
                                </td>
                            </tr>
                        ) : (
                            rows.map(({ trade, cp, evaluation, pips }) => (
                                <tr key={trade.id}>
                                    {visibleColumns.map((col) => (
                                        <Fragment key={col.id}>
                                            {renderCell(col.id, trade, cp, evaluation, pips)}
                                        </Fragment>
                                    ))}
                                </tr>
                            ))
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
    onPartialClose,
    onFullClose,
    onToggleTsl,
    onToggleBe,
    onEdit,
    onDelete,
}: {
    trade: TradingAlert;
    onPartialClose: (level: 1 | 2 | 3) => void;
    onFullClose: () => void;
    onToggleTsl: () => void;
    onToggleBe: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const afterPartial = Boolean(trade.manual_partial_closed);

    const toggle = () => {
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            const menuWidth = afterPartial ? 160 : 200;
            setCoords({ top: r.bottom + 4, left: Math.max(8, r.right - menuWidth) });
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
                        className={cn(
                            "fixed z-50 overflow-hidden rounded-[6px] border border-stroke bg-darkGrey shadow-lg",
                            afterPartial ? "w-40" : "w-52",
                        )}
                        style={{ top: coords.top, left: coords.left }}
                    >
                        {afterPartial ? (
                            <button type="button" className={itemClass} onClick={run(onFullClose)}>
                                Full Close
                            </button>
                        ) : (
                            <>
                                <button type="button" className={itemClass} onClick={run(() => onPartialClose(1))}>
                                    Partial Close TP1
                                </button>
                                <button type="button" className={itemClass} onClick={run(() => onPartialClose(2))}>
                                    Partial Close TP2
                                </button>
                                <button type="button" className={itemClass} onClick={run(() => onPartialClose(3))}>
                                    Partial Close TP3
                                </button>
                                <button type="button" className={itemClass} onClick={run(onFullClose)}>
                                    Full Close
                                </button>
                                <button type="button" className={itemClass} onClick={run(onToggleTsl)}>
                                    {trade.tsl_enabled ? "Disable TSL" : "Enable TSL"}
                                </button>
                                <button type="button" className={itemClass} onClick={run(onToggleBe)}>
                                    {trade.breakeven_enabled ? "Disable Breakeven" : "Enable Breakeven"}
                                </button>
                                <button type="button" className={itemClass} onClick={run(onEdit)}>Edit</button>
                                <button type="button" className={`${itemClass} text-[#fa003f]`} onClick={run(onDelete)}>
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </>
            ) : null}
        </>
    );
}
