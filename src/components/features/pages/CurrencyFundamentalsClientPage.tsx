"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AdminTableEditor from "@/components/composed/dynamic-table/AdminTableEditor";
import DynamicTableDisplay from "@/components/composed/dynamic-table/DynamicTableDisplay";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui";
import Container from "@/components/ui/layout/Container";
import { GAUGE_SIGNAL_COLORS, gaugeSignalColorForTone } from "@/lib/gaugeSignalColors";
import { calculateFinalScore } from "@/components/composed/dynamic-table/TableEditor/utils/formulaUtils";
import type { TableColumn as EditorTableColumn, TableRow as EditorTableRow } from "@/components/composed/dynamic-table/TableEditor/types";
import { DynamicTable, dynamicTableService } from "@/services/dynamicTable.service";
import { cn } from "@/lib/utils";

const CURRENCIES = ["usd", "gbp", "eur", "cad", "aud", "nzd", "chf", "jpy"] as const;

type CurrencyCode = (typeof CURRENCIES)[number];

function getCurrencyTableIdentifier(currency: CurrencyCode): string {
    return `currency_fundamentals_${currency}`;
}

function getCurrencyTableName(currency: CurrencyCode): string {
    return `${currency.toUpperCase()} Fundamental Outlook`;
}

type SummaryTone = "Bullish" | "Bearish" | "Neutral";

function extractSignedIntegerLikeSheet(value: string | null | undefined): number | null {
    if (!value) return null;
    const match = value.match(/-?\d+/);
    if (!match) return null;
    const parsed = Number.parseInt(match[0], 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function formatTotalLikeSheet(value: number): string {
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    if (Number.isInteger(rounded)) return String(rounded);
    return String(rounded).replace(/\.?0+$/, "");
}

function getSummaryFromTable(table: DynamicTable | null): {
    bias: SummaryTone;
    macroDirection: string;
    divergenceDirection: string;
    macroTotal: number;
    divergenceTotal: number;
} | null {
    if (!table?.columns?.length || !table.rows?.length) {
        return {
            bias: "Neutral",
            macroDirection: "Neutral",
            divergenceDirection: "Neutral",
            macroTotal: 0,
            divergenceTotal: 0,
        };
    }

    const sortedColumns = [...table.columns].sort((a, b) => a.column_index - b.column_index);
    const sortedRows = [...table.rows].sort((a, b) => a.row_index - b.row_index);

    let macroSum = 0;
    let divergenceSum = 0;

    if (table.identifier?.startsWith("currency_fundamentals_")) {
        const rowsForCalc: EditorTableRow[] = sortedRows.map((row) => ({
            id: String(row.id),
            currencyPairId: row.currency_pair_id ?? undefined,
            cells: sortedColumns.map((col) => {
                const cell = row.cells?.find((c) => c.table_column_id === col.id);
                return {
                    value: cell?.value != null ? String(cell.value) : "",
                    formula: cell?.formula || undefined,
                    metadata: (cell?.cell_metadata || {}) as EditorTableRow["cells"][number]["metadata"],
                };
            }),
        }));

        const colsForCalc: EditorTableColumn[] = sortedColumns.map((c) => ({
            id: String(c.id),
            header: c.header || "",
            key: c.key,
        }));

        const meta = table.table_metadata as { formulaStartRow?: number; formulaTotalsRow?: number } | undefined;
        const rawFs = meta?.formulaStartRow;
        const formulaStartRow =
            rawFs !== undefined && rawFs !== null && Number.isFinite(Number(rawFs))
                ? Math.max(1, Math.floor(Number(rawFs)))
                : 1;
        const rawTotalsRow = meta?.formulaTotalsRow;
        const formulaTotalsRow =
            rawTotalsRow !== undefined && rawTotalsRow !== null && Number.isFinite(Number(rawTotalsRow))
                ? Math.max(1, Math.floor(Number(rawTotalsRow)))
                : undefined;

        const scored = calculateFinalScore(rowsForCalc, colsForCalc, formulaStartRow, table.identifier, {
            sheetRowNumbers: sortedRows.map((r) => r.row_index),
            formulaTotalsRow,
        });
        macroSum = scored.macroshiftSum;
        divergenceSum = scored.divergenceSum;
    } else {
        const macroIndex = sortedColumns.findIndex((col) => (col.header || "").toLowerCase().includes("macroshift"));
        const divergenceIndex = sortedColumns.findIndex((col) => (col.header || "").toLowerCase().includes("divergence"));

        const sumColumn = (colIndex: number) => {
            if (colIndex < 0) return 0;
            const column = sortedColumns[colIndex];
            return sortedRows.reduce((sum, row) => {
                const cell = row.cells?.find((item) => item.table_column_id === column.id);
                const value = extractSignedIntegerLikeSheet(cell?.value);
                return value === null ? sum : sum + value;
            }, 0);
        };

        macroSum = sumColumn(macroIndex);
        divergenceSum = sumColumn(divergenceIndex);
    }

    const total = macroSum + divergenceSum;

    return {
        bias: total > 0 ? "Bullish" : total < 0 ? "Bearish" : "Neutral",
        macroDirection: macroSum > 0 ? "Uptrend" : macroSum < 0 ? "Downtrend" : "Neutral",
        divergenceDirection: divergenceSum > 0 ? "Uptrend" : divergenceSum < 0 ? "Downtrend" : "Neutral",
        macroTotal: macroSum,
        divergenceTotal: divergenceSum,
    };
}

function DirectionMarker({ tone }: { tone: SummaryTone }) {
    if (tone === "Bullish") {
        return <span style={{ color: GAUGE_SIGNAL_COLORS.buy }}>▲</span>;
    }
    if (tone === "Bearish") {
        return <span style={{ color: GAUGE_SIGNAL_COLORS.sell }}>▼</span>;
    }
    return (
        <span className="inline-block min-w-[0.85em] text-center font-semibold leading-none text-[#C0C0C0]" aria-hidden>
            —
        </span>
    );
}

function BiasDot({ tone, isDark }: { tone: SummaryTone; isDark: boolean }) {
    return (
        <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: gaugeSignalColorForTone(tone, isDark) }}
            aria-hidden
        />
    );
}

const MANUAL_BIAS_META_KEY = "currency_fundamentals_manual_bias";

function parsePersistedBias(meta: Record<string, unknown> | undefined): SummaryTone | null {
    const v = meta?.[MANUAL_BIAS_META_KEY];
    if (v === "Bullish" || v === "Bearish" || v === "Neutral") return v;
    return null;
}

function CurrencyFundamentalsSummaryBar({
    currency,
    tableIdentifier,
    refreshTrigger,
    onPersist,
    isAdmin,
    initialTable,
    serverHydrated,
}: {
    currency: CurrencyCode;
    tableIdentifier: string;
    refreshTrigger: number;
    onPersist?: () => void;
    isAdmin: boolean;
    initialTable: DynamicTable | null;
    serverHydrated: boolean;
}) {
    const [table, setTable] = useState<DynamicTable | null>(() => initialTable);
    const [isEditingBias, setIsEditingBias] = useState(false);

    useEffect(() => {
        setTable(initialTable);
    }, [initialTable]);

    useEffect(() => {
        let cancelled = false;
        if (serverHydrated && refreshTrigger === 0) {
            return () => {
                cancelled = true;
            };
        }

        (async () => {
            try {
                const response = await dynamicTableService.getTableByIdentifier(tableIdentifier);
                if (!cancelled) {
                    setTable(response?.data ?? null);
                }
            } catch {
                if (!cancelled) {
                    setTable(null);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [tableIdentifier, refreshTrigger, serverHydrated]);

    const { theme } = useTheme();
    const isDark = theme === "dark";

    const summary = useMemo(() => getSummaryFromTable(table), [table]);
    if (!summary) return null;

    const persistedBias = parsePersistedBias(table?.table_metadata as Record<string, unknown> | undefined);
    const biasTone = persistedBias ?? summary.bias;
    const macroTone: SummaryTone =
        summary.macroDirection === "Uptrend" ? "Bullish" : summary.macroDirection === "Downtrend" ? "Bearish" : "Neutral";
    const divergenceTone: SummaryTone =
        summary.divergenceDirection === "Uptrend"
            ? "Bullish"
            : summary.divergenceDirection === "Downtrend"
                ? "Bearish"
                : "Neutral";
    const netScore = summary.macroTotal + summary.divergenceTotal;

    return (
        <div className="mt-3 w-full min-w-0 rounded-[0_0_34px_34px] border-t border-stroke bg-darkGrey px-6 py-5 dark:border-[rgba(255,255,255,0.24)]">
            <div className="flex flex-wrap items-center gap-5 text-[15px] text-foreground dark:text-white/95">
                <div className="flex items-center gap-2">
                    <span className="text-foreground/90 dark:text-white/90">{currency.toUpperCase()} Bias:</span>
                    {isEditingBias ? (
                        <select
                            autoFocus
                            value={biasTone}
                            onBlur={() => setIsEditingBias(false)}
                            onChange={async (e) => {
                                const next = e.target.value as SummaryTone;
                                setIsEditingBias(false);
                                if (!table?.id) return;
                                try {
                                    await dynamicTableService.updateTable(table.id, {
                                        table_metadata: {
                                            ...(table.table_metadata || {}),
                                            [MANUAL_BIAS_META_KEY]: next,
                                        },
                                    });
                                    onPersist?.();
                                } catch {

                                }
                            }}
                            className="rounded-md border border-stroke bg-inputBg px-2 py-1 text-sm font-semibold text-foreground outline-none dark:border-white/20 dark:bg-[#0E1220] dark:text-white"
                        >
                            <option value="Bullish">Bullish</option>
                            <option value="Bearish">Bearish</option>
                            <option value="Neutral">Neutral</option>
                        </select>
                    ) : (
                        <button
                            type="button"
                            onDoubleClick={() => setIsEditingBias(true)}
                            className="flex items-center gap-2 font-semibold uppercase"
                            title="Double click to edit bias"
                        >
                            <span className="scale-[1.2]">
                                <BiasDot tone={biasTone} isDark={isDark} />
                            </span>
                            <span style={{ color: gaugeSignalColorForTone(biasTone, isDark) }}>
                                {biasTone}
                            </span>
                        </button>
                    )}
                </div>

                <div className="h-5 w-px bg-stroke dark:bg-white/15" />

                <div className="flex items-center gap-2">
                    <span>Macro Direction:</span>
                    <div className="flex items-center gap-1.5 font-semibold">
                        <DirectionMarker tone={macroTone} />
                        <span>{summary.macroDirection}</span>
                    </div>
                </div>

                <div className="h-5 w-px bg-stroke dark:bg-white/15" />

                <div className="flex items-center gap-2">
                    <span>Divergence Direction:</span>
                    <div className="flex items-center gap-1.5 font-semibold">
                        <DirectionMarker tone={divergenceTone} />
                        <span>{summary.divergenceDirection}</span>
                    </div>
                </div>

                {isAdmin ? (
                    <div className="ml-auto flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <span>Total:</span>
                            <span className="font-semibold">{formatTotalLikeSheet(summary.macroTotal)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Total:</span>
                            <span className="font-semibold">{formatTotalLikeSheet(summary.divergenceTotal)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Net score:</span>
                            <span className="font-semibold">{formatTotalLikeSheet(netScore)}</span>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function CurrencyFundamentalsClientPage({
    initialCurrencyTables,
}: {
    initialCurrencyTables: Record<string, DynamicTable | null>;
}) {
    const { isAdmin } = useAuth();
    const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>("usd");
    const [tableCache, setTableCache] = useState<Record<string, DynamicTable | null>>(() => ({
        ...initialCurrencyTables,
    }));
    const [tabSwitchLoading, setTabSwitchLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [openEditors, setOpenEditors] = useState<Record<CurrencyCode, boolean>>({
        usd: false,
        gbp: false,
        eur: false,
        cad: false,
        aud: false,
        nzd: false,
        chf: false,
        jpy: false,
    });
    const [tablePasteActive, setTablePasteActive] = useState<Record<CurrencyCode, boolean>>({
        usd: false,
        gbp: false,
        eur: false,
        cad: false,
        aud: false,
        nzd: false,
        chf: false,
        jpy: false,
    });

    const handleTableSave = () => setRefreshTrigger((current) => current + 1);

    useEffect(() => {
        setTableCache((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(initialCurrencyTables)) {
                const incoming = initialCurrencyTables[key];
                if (incoming !== undefined) {
                    next[key] = incoming ?? null;
                }
            }
            return next;
        });
    }, [initialCurrencyTables]);

    useEffect(() => {
        if (refreshTrigger === 0) return;
        let cancelled = false;
        const id = getCurrencyTableIdentifier(activeCurrency);
        void (async () => {
            try {
                const response = await dynamicTableService.getTableByIdentifier(id);
                if (!cancelled) {
                    setTableCache((prev) => ({ ...prev, [id]: response?.data ?? null }));
                }
            } catch {
                if (!cancelled) {
                    setTableCache((prev) => ({ ...prev, [id]: null }));
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [refreshTrigger, activeCurrency]);

    const handleTabRequest = useCallback(
        async (value: string) => {
            const next = value as CurrencyCode;
            if (next === activeCurrency || tabSwitchLoading) return;
            const id = getCurrencyTableIdentifier(next);
            const cached = tableCache[id];
            if (cached?.columns?.length) {
                setActiveCurrency(next);
                return;
            }
            setTabSwitchLoading(true);
            try {
                const response = await dynamicTableService.getTableByIdentifier(id);
                const data = response?.data ?? null;
                setTableCache((prev) => ({ ...prev, [id]: data }));
                setActiveCurrency(next);
            } finally {
                setTabSwitchLoading(false);
            }
        },
        [activeCurrency, tabSwitchLoading, tableCache],
    );

    const toggleEditor = (currency: CurrencyCode) => {
        setOpenEditors((current) => ({
            ...current,
            [currency]: !current[currency],
        }));
    };

    return (
        <Container className="relative">
            {tablePasteActive[activeCurrency] ? (
                <div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/65 px-6 text-white"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-end justify-center gap-1.5" aria-hidden>
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-2.5 animate-pulse rounded-full bg-white/50"
                                style={{
                                    height: `${18 + (i % 3) * 8}px`,
                                    animationDelay: `${i * 120}ms`,
                                }}
                            />
                        ))}
                    </div>
                    <p className="text-base font-semibold">Pasting table data…</p>
                </div>
            ) : null}
            <Tabs value={activeCurrency} onValueChange={(v) => void handleTabRequest(v)}>
                <TabsList
                    className={`gap-4${tabSwitchLoading ? " pointer-events-none opacity-60" : ""}`}
                    aria-busy={tabSwitchLoading}
                >
                    <TabsTrigger variant="currency-fundamentals" value="usd">USD</TabsTrigger>
                    <TabsTrigger variant="currency-fundamentals" value="gbp">GBP</TabsTrigger>
                    <TabsTrigger variant="currency-fundamentals" value="eur">EUR</TabsTrigger>
                    <TabsTrigger variant="currency-fundamentals" value="cad">CAD</TabsTrigger>
                    <TabsTrigger variant="currency-fundamentals" value="aud">AUD</TabsTrigger>
                    <TabsTrigger variant="currency-fundamentals" value="nzd">NZD</TabsTrigger>
                    <TabsTrigger variant="currency-fundamentals" value="chf">CHF</TabsTrigger>
                    <TabsTrigger variant="currency-fundamentals" value="jpy">JPY</TabsTrigger>
                </TabsList>

                {CURRENCIES.map((currency) => {
                    const tableIdentifier = getCurrencyTableIdentifier(currency);
                    const tableName = getCurrencyTableName(currency);

                    return (
                        <TabsContent
                            key={currency}
                            value={currency}
                            className={cn(
                                "mt-0 flex flex-col gap-0",
                                "data-[state=active]:relative data-[state=active]:z-10 data-[state=active]:mt-6",
                                "data-[state=inactive]:pointer-events-none data-[state=inactive]:absolute data-[state=inactive]:inset-x-0 data-[state=inactive]:top-0 data-[state=inactive]:z-0 data-[state=inactive]:mt-0 data-[state=inactive]:opacity-0",
                            )}
                        >
                            {isAdmin ? (
                                <section className="mb-4 flex flex-col gap-4 rounded-xl bg-darkGrey p-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--secondary))]">
                                            {tableName}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleEditor(currency)}
                                        className="rounded-lg bg-[rgb(var(--electric-blue))] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                                    >
                                        {openEditors[currency] ? "Hide editor" : "Open editor"}
                                    </button>
                                </section>
                            ) : null}

                            {isAdmin && openEditors[currency] ? (
                                <>
                                    <section className="mb-4 rounded-xl bg-darkGrey p-4">
                                        <AdminTableEditor
                                            tableIdentifier={tableIdentifier}
                                            tableName={tableName}
                                            onSave={handleTableSave}
                                            onPasteProgress={(active) =>
                                                setTablePasteActive((prev) => ({ ...prev, [currency]: active }))
                                            }
                                        />
                                    </section>
                                    <CurrencyFundamentalsSummaryBar
                                        currency={currency}
                                        tableIdentifier={tableIdentifier}
                                        refreshTrigger={refreshTrigger}
                                        onPersist={handleTableSave}
                                        isAdmin={isAdmin}
                                        initialTable={tableCache[tableIdentifier] ?? null}
                                        serverHydrated
                                    />
                                </>
                            ) : null}

                            <section className="w-full min-w-0 space-y-3 rounded-xl bg-darkGrey px-0 pb-0 pt-4">
                                <h4 className="text-center px-4">{tableName}</h4>
                                <DynamicTableDisplay
                                    tableIdentifier={tableIdentifier}
                                    refreshTrigger={refreshTrigger}
                                    initialTable={tableCache[tableIdentifier] ?? null}
                                    showCurrencyFundamentalsCellTrendMarkers={
                                        (!isAdmin || !openEditors[currency]) && !tablePasteActive[currency]
                                    }
                                />
                            </section>
                            {!isAdmin || !openEditors[currency] ? (
                                <CurrencyFundamentalsSummaryBar
                                    currency={currency}
                                    tableIdentifier={tableIdentifier}
                                    refreshTrigger={refreshTrigger}
                                    onPersist={handleTableSave}
                                    isAdmin={isAdmin}
                                    initialTable={tableCache[tableIdentifier] ?? null}
                                    serverHydrated
                                />
                            ) : null}
                        </TabsContent>
                    );
                })}
            </Tabs>
        </Container>
    );
}
