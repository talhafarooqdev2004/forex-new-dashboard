"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

import AdminTableEditor from "@/components/composed/dynamic-table/AdminTableEditor";
import DynamicTableDisplay from "@/components/composed/dynamic-table/DynamicTableDisplay";
import DirectionDriveIndex from "@/components/composed/Charts/DirectionDriveIndex";
import SentimentDriveIndex from "@/components/composed/Charts/SentimentDriveIndex";
import TrendAlignmentScoreChart, { type TrendAlignmentScoreRow } from "@/components/composed/Charts/TrendAlignmentScoreChart";
import EdgeTmGauge from "@/components/composed/Guages/EdgeTmGauge";
import { CurrencyStrengthIndexes, CurrencyStrengthIndex } from "@/components/composed/CurrencyStrengthIndex";
import type { DriveIndexBar } from "@/components/composed/Charts/DriveIndexChart";
import { Textarea } from "@/components/ui";
import Section from "@/components/ui/layout/Section";
import Container from "@/components/ui/layout/Container";
import { useAuth } from "@/components/providers/AuthProvider";
import { technicalDashboardTmvGaugeValue } from "@/lib/edgeTechnicalDashboardTmv";
import { buildCurrencyStrengthRows } from "@/lib/technicalDashboardFromScoreSheet";
import { apiConfig } from "@/services/api.config";
import { dynamicTableService, DynamicTable, TableColumn, TableRow } from "@/services/dynamicTable.service";
import { googleSheetsService } from "@/services/googleSheets.service";
import { useDashboardBackendPoll } from "@/hooks/useDashboardBackendPoll";
import {
    FX_TMV_GAUGE_ZONES_DARK,
    FX_TMV_GAUGE_ZONES_LIGHT,
    buildVolatilityGaugeZones,
} from "@/lib/fxTmvGaugeZones";
import RiskModeSheetGauge from "@/components/composed/RiskModeSheetGauge";

const EDGE_TABLES = [
    {
        identifier: "edge_currency_strength_index",
        name: "Currency Strength Index",
        displayName: "Currency Strength Index",
    },
    {
        identifier: "edge_forex_pair_analysis",
        name: "Forex Pair Analysis",
        displayName: "Forex Pair Analysis",
    },
    {
        identifier: "edge_technical_dashboard",
        name: "Technical Dashboard",
        displayName: "Technical Dashboard",
    },
] as const;

type EdgeTableIdentifier = (typeof EDGE_TABLES)[number]["identifier"];

type TableMap = Record<EdgeTableIdentifier, DynamicTable | null>;

const CURRENCY_STRENGTH_NOTES_META_KEY = "currency_strength_notes";
const RISK_MODE_SCORE_SHEET_ID = "RISK ON/OFF 12";
const RISK_MODE_SCORE_CELL = "B13";

const TREND_ALIGNMENT_MAX = 10;

const DARK_GAUGE_ZONES = FX_TMV_GAUGE_ZONES_DARK.map((z) => ({ ...z }));
const LIGHT_GAUGE_ZONES = FX_TMV_GAUGE_ZONES_LIGHT.map((z) => ({ ...z }));
const DARK_VOLATILITY_ZONES = buildVolatilityGaugeZones(FX_TMV_GAUGE_ZONES_DARK).map((z) => ({ ...z }));
const LIGHT_VOLATILITY_ZONES = buildVolatilityGaugeZones(FX_TMV_GAUGE_ZONES_LIGHT).map((z) => ({ ...z }));

const initialTableState: TableMap = {
    edge_currency_strength_index: null,
    edge_forex_pair_analysis: null,
    edge_technical_dashboard: null,
};

function getSortedColumns(table: DynamicTable): TableColumn[] {
    const explicit = [...(table.columns ?? [])];
    if (explicit.length > 0) return explicit.sort((a, b) => a.column_index - b.column_index);

    // Fallback: reconstruct unique columns from per-cell embedded column objects
    const colMap = new Map<number, TableColumn>();
    for (const row of table.rows ?? []) {
        for (const cell of row.cells ?? []) {
            if (cell.column && !colMap.has(cell.table_column_id)) {
                colMap.set(cell.table_column_id, cell.column);
            }
        }
    }
    return [...colMap.values()].sort((a, b) => a.column_index - b.column_index);
}

function getSortedRows(table: DynamicTable): TableRow[] {
    return [...(table.rows ?? [])].sort((a, b) => a.row_index - b.row_index);
}

function parseNumericValue(value: string | null | undefined): number | null {
    if (!value) return null;
    const parsed = Number.parseFloat(value.toString().replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
}

function getCellValue(row: TableRow, columnId: number): string | null {
    const cell = row.cells?.find((item) => item.table_column_id === columnId);
    return cell?.value?.toString().trim() ?? null;
}

/**
 * Drive charts use **table column order** (sorted by `column_index`):
 * labels from the first column; scores from the 2nd (Forex Pair Analysis) or last (Technical Dashboard).
 */
function buildDriveIndexData(
    table: DynamicTable | null,
    scoreSource: "second" | "last"
): DriveIndexBar[] {
    if (!table?.rows?.length) return [];

    const sortedColumns = getSortedColumns(table);
    if (sortedColumns.length < 2) return [];

    const labelColumn = sortedColumns[0];
    const scoreColumn =
        scoreSource === "last" ? sortedColumns[sortedColumns.length - 1] : sortedColumns[1];
    if (!labelColumn || !scoreColumn) return [];

    const bars = getSortedRows(table)
        .map((row) => {
            const label = getCellValue(row, labelColumn.id);
            const value = parseNumericValue(getCellValue(row, scoreColumn.id));
            if (!label || value === null) return null;
            return { label, value };
        })
        .filter((item): item is DriveIndexBar => item !== null);

    return bars;
}

/**
 * Trend Alignment: Currency Strength Index table by **display column order** (sorted by column_index):
 * col 0 = currency, 1 = ULTF, 2 = LTF, 3 = MTF, 4 = HTF.
 */
function buildTrendAlignmentData(table: DynamicTable | null): TrendAlignmentScoreRow[] {
    if (!table?.rows?.length) return [];

    const sortedColumns = getSortedColumns(table);
    if (sortedColumns.length < 5) return [];

    const currencyColumn = sortedColumns[0]!;
    const ultfColumn = sortedColumns[1]!;
    const ltfColumn = sortedColumns[2]!;
    const mtfColumn = sortedColumns[3]!;
    const htfColumn = sortedColumns[4]!;

    return getSortedRows(table)
        .map((row) => {
            const currency = getCellValue(row, currencyColumn.id);
            const ultf = parseNumericValue(getCellValue(row, ultfColumn.id));
            const ltf = parseNumericValue(getCellValue(row, ltfColumn.id));
            const mtf = parseNumericValue(getCellValue(row, mtfColumn.id));
            const htf = parseNumericValue(getCellValue(row, htfColumn.id));
            if (!currency) return null;

            const n = (v: number | null) =>
                Math.max(
                    -TREND_ALIGNMENT_MAX,
                    Math.min(TREND_ALIGNMENT_MAX, v ?? 0)
                );

            return {
                currency,
                ultf: n(ultf),
                ltf: n(ltf),
                mtf: n(mtf),
                htf: n(htf),
            };
        })
        .filter((item): item is TrendAlignmentScoreRow => item !== null);
}

function getMetadataString(table: DynamicTable | null, key: string): string {
    const value = table?.table_metadata?.[key];
    return typeof value === "string" ? value : "";
}

const CALCULATOR_LINKS = [
    { label: "Position Size Calculator", href: "https://fxverify.com/widgets/position-size-calculator" },
    { label: "Pip Calculator", href: "https://fxverify.com/widgets/pip-value-calculator" },
    { label: "Profit Calculator", href: "https://fxverify.com/widgets/profit-calculator" },
] as const;

export default function EdgeToolsAlertsClientPage({
    initialTables,
    initialRiskModeScore = 0,
}: {
    initialTables?: Partial<TableMap> | null;
    initialRiskModeScore?: number;
}) {
    const { isAdmin } = useAuth();
    const [selectedTable, setSelectedTable] = useState<EdgeTableIdentifier>("edge_currency_strength_index");
    const [showEditor, setShowEditor] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const mergedFromServer: TableMap = {
        ...initialTableState,
        ...(initialTables ?? {}),
    };
    const [tables, setTables] = useState<TableMap>(mergedFromServer);
    const [isSavingCurrencyNotes, setIsSavingCurrencyNotes] = useState(false);
    const [riskModeScore, setRiskModeScore] = useState(() => initialRiskModeScore);
    const technicalInit = mergedFromServer.edge_technical_dashboard;
    const notesInit = getMetadataString(technicalInit, CURRENCY_STRENGTH_NOTES_META_KEY);
    const [currencyStrengthNotesInitialValue, setCurrencyStrengthNotesInitialValue] = useState(notesInit);
    const currencyStrengthNotesRef = useRef(notesInit);
    const [notesFieldsVersion, setNotesFieldsVersion] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const updateTheme = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const loadTables = useCallback(async () => {
        try {
            const responses = await Promise.all(
                EDGE_TABLES.map((table) => dynamicTableService.getTableByIdentifier(table.identifier))
            );

            const nextTables = EDGE_TABLES.reduce<TableMap>((acc, table, idx) => {
                acc[table.identifier] = responses[idx]?.data ?? null;
                return acc;
            }, { ...initialTableState });

            setTables(nextTables);
            const technical = nextTables.edge_technical_dashboard;
            const currencyNotesValue = getMetadataString(technical, CURRENCY_STRENGTH_NOTES_META_KEY);

            setCurrencyStrengthNotesInitialValue(currencyNotesValue);

            currencyStrengthNotesRef.current = currencyNotesValue;
            setNotesFieldsVersion((value) => value + 1);
        } catch (error) {
            console.error("Failed to load edge-tools tables:", error);
            setTables(initialTableState);
        }
    }, []);

    const loadRiskModeScore = useCallback(async () => {
        try {
            const value = await googleSheetsService.getCell(RISK_MODE_SCORE_SHEET_ID, RISK_MODE_SCORE_CELL);
            const parsed = parseNumericValue(String(value));
            setRiskModeScore(parsed === null ? 0 : Math.max(0, Math.min(100, parsed)));
        } catch (error) {
            console.error("Failed to load risk mode score from sheet:", error);
            setRiskModeScore(0);
        }
    }, []);

    useEffect(() => {
        void loadTables();
        void loadRiskModeScore();
    }, [loadTables, loadRiskModeScore, refreshTrigger]);

    const pollEdgeToolsBackend = useCallback(async () => {
        await Promise.all([loadTables(), loadRiskModeScore()]);
    }, [loadTables, loadRiskModeScore]);

    useDashboardBackendPoll(pollEdgeToolsBackend);

    useEffect(() => {
        const socket = io(apiConfig.baseURL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        const handleTableUpdate = (payload: { type?: string; data?: { identifier?: string } }) => {
            if (payload?.type === "TABLE_UPDATE") {
                void loadTables();
                void loadRiskModeScore();
            }
        };

        const handleRiskModeScoreUpdate = () => {
            void loadRiskModeScore();
        };

        socket.on("tableUpdate", handleTableUpdate);
        socket.on("riskModeScoreUpdate", handleRiskModeScoreUpdate);

        return () => {
            socket.off("tableUpdate", handleTableUpdate);
            socket.off("riskModeScoreUpdate", handleRiskModeScoreUpdate);
            socket.disconnect();
        };
    }, [loadRiskModeScore, loadTables]);

    const handleTableSave = async () => {
        setRefreshTrigger((value) => value + 1);
        await loadTables();
    };

    const buildEdgeTechnicalMetadata = useCallback(() => {
        return {
            ...(tables.edge_technical_dashboard?.table_metadata || {}),
            [CURRENCY_STRENGTH_NOTES_META_KEY]: currencyStrengthNotesRef.current,
        };
    }, [tables.edge_technical_dashboard]);

    const persistEdgeTechnicalDashboardMetadata = useCallback(async () => {
        const tableMetadata = buildEdgeTechnicalMetadata();
        const technicalTable = tables.edge_technical_dashboard;
        if (!technicalTable) {
            await dynamicTableService.createTable({
                identifier: "edge_technical_dashboard",
                name: "Technical Dashboard",
                table_metadata: tableMetadata,
            });
        } else {
            await dynamicTableService.updateTable(technicalTable.id, {
                table_metadata: tableMetadata,
            });
        }
        setRefreshTrigger((value) => value + 1);
    }, [buildEdgeTechnicalMetadata, tables.edge_technical_dashboard]);

    const handleSaveCurrencyStrengthNotes = async () => {
        setIsSavingCurrencyNotes(true);
        try {
            await persistEdgeTechnicalDashboardMetadata();
        } catch (error) {
            console.error("Failed to save currency strength notes:", error);
        } finally {
            setIsSavingCurrencyNotes(false);
        }
    };

    const directionDriveData = useMemo(
        () => buildDriveIndexData(tables.edge_technical_dashboard, "last"),
        [tables.edge_technical_dashboard]
    );
    const sentimentDriveData = useMemo(
        () => buildDriveIndexData(tables.edge_forex_pair_analysis, "second"),
        [tables.edge_forex_pair_analysis]
    );
    const currencyStrengthRows = useMemo(
        () => buildCurrencyStrengthRows(tables.edge_currency_strength_index),
        [tables.edge_currency_strength_index]
    );
    const currencyStrengthRange = useMemo(() => {
        if (currencyStrengthRows.length === 0) return undefined;
        const vals = currencyStrengthRows.map((r) => r.value).filter((v) => Number.isFinite(v));
        if (vals.length === 0) return undefined;
        return { min: Math.min(...vals), max: Math.max(...vals) };
    }, [currencyStrengthRows]);
    const trendAlignmentRows = useMemo(
        () => buildTrendAlignmentData(tables.edge_currency_strength_index),
        [tables.edge_currency_strength_index]
    );

    const trendGaugeScore = useMemo(
        () => technicalDashboardTmvGaugeValue(tables.edge_technical_dashboard, "trend"),
        [tables.edge_technical_dashboard]
    );
    const momentumGaugeScore = useMemo(
        () => technicalDashboardTmvGaugeValue(tables.edge_technical_dashboard, "momentum"),
        [tables.edge_technical_dashboard]
    );
    const volatilityGaugeScore = useMemo(
        () => technicalDashboardTmvGaugeValue(tables.edge_technical_dashboard, "volatility"),
        [tables.edge_technical_dashboard]
    );

    const selectedTableConfig = EDGE_TABLES.find((table) => table.identifier === selectedTable) ?? EDGE_TABLES[0];
    const tmvGaugeZones = useMemo(() => (isDarkMode ? DARK_GAUGE_ZONES : LIGHT_GAUGE_ZONES), [isDarkMode]);

    return (
        <Container>
            {isAdmin ? (
                <section className="space-y-4 rounded-xl bg-darkGrey py-4">
                    <div className="flex flex-col gap-4 px-4 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--secondary))]">Edge tools editor panel</p>
                        <button
                            type="button"
                            onClick={() => setShowEditor((current) => !current)}
                            className="rounded-lg bg-[rgb(var(--electric-blue))] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                            {showEditor ? "Hide editor" : "Open editor"}
                        </button>
                    </div>

                    {showEditor ? (
                        <AdminTableEditor
                            tableIdentifier={selectedTable}
                            tableName={selectedTableConfig.name}
                            onSave={handleTableSave}
                            showTableSelector={true}
                            availableTables={[...EDGE_TABLES]}
                            onTableSelect={(identifier) => setSelectedTable(identifier as EdgeTableIdentifier)}
                        />
                    ) : null}
                </section>
            ) : null}

            <div className="mt-6 flex flex-col gap-6 min-[1450px]:flex-row min-[1450px]:items-stretch">
                <div className="flex min-w-0 w-full flex-nowrap gap-4 min-[1450px]:w-[45%]">
                    <EdgeTmGauge
                        title="Trend"
                        score={trendGaugeScore}
                        gaugeZones={tmvGaugeZones}
                        isDark={isDarkMode}
                    />
                    <EdgeTmGauge
                        title="Momentum"
                        score={momentumGaugeScore}
                        gaugeZones={tmvGaugeZones}
                        isDark={isDarkMode}
                    />
                    <EdgeTmGauge
                        title="Volatility"
                        score={volatilityGaugeScore}
                        gaugeZones={isDarkMode ? DARK_VOLATILITY_ZONES : LIGHT_VOLATILITY_ZONES}
                        isDark={isDarkMode}
                        needleMode="volatility"
                    />
                </div>

                <Section className="min-w-0 w-full overflow-visible min-[1450px]:w-[55%]">
                    <div className="flex min-h-[200px] flex-wrap items-center justify-center gap-8 p-6 sm:gap-10">
                        <h5 className="m-0 shrink-0 text-left font-semibold text-foreground text-2xl">Risk Mode</h5>
                        <RiskModeSheetGauge riskModeScore={riskModeScore} isDark={isDarkMode} />
                    </div>
                </Section>
            </div>

            <div className="flex flex-col gap-6 mt-6">
                <DirectionDriveIndex
                    bars={
                        tables.edge_technical_dashboard?.rows?.length
                            ? directionDriveData
                            : undefined
                    }
                />
                <SentimentDriveIndex
                    bars={
                        tables.edge_forex_pair_analysis?.rows?.length
                            ? sentimentDriveData
                            : undefined
                    }
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-2 mt-6">
                <Section>
                    <h5 className="mb-3">Currency Strength Index</h5>
                    <CurrencyStrengthIndexes>
                        {currencyStrengthRows.map((item) => (
                            <CurrencyStrengthIndex
                                key={item.currency}
                                currency={item.currency}
                                value={item.value}
                                strengthRange={currencyStrengthRange}
                            />
                        ))}
                    </CurrencyStrengthIndexes>
                </Section>
                <Section className="flex flex-col">
                    <div className="flex h-full flex-col">
                        <Textarea
                            key={`currency-notes-${notesFieldsVersion}`}
                            variant="dark"
                            rows={9}
                            placeholder="Currency strength notes..."
                            defaultValue={currencyStrengthNotesInitialValue}
                            readOnly={!isAdmin}
                            onChange={(e) => {
                                currencyStrengthNotesRef.current = e.target.value;
                            }}
                            className="flex-1 [&_textarea]:h-full [&_textarea]:min-h-0"
                        />
                        <div className="mt-3 flex justify-end">
                            {isAdmin ? (
                                <button
                                    type="button"
                                    onClick={handleSaveCurrencyStrengthNotes}
                                    disabled={isSavingCurrencyNotes}
                                    className="rounded-md bg-[rgb(var(--electric-blue))] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                                >
                                    {isSavingCurrencyNotes ? "Saving..." : "Save"}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </Section>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {CALCULATOR_LINKS.map((item) => (
                    <div
                        key={item.href}
                        className="flex items-center justify-between gap-3 rounded-xl bg-darkGrey px-4 py-3.5 border border-stroke/60"
                    >
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[rgb(var(--electric-blue))] transition hover:bg-white/10"
                        >
                            View
                        </a>
                    </div>
                ))}
            </div>

            <div className="mt-6">{isAdmin ? <TrendAlignmentScoreChart rows={trendAlignmentRows.length ? trendAlignmentRows : null} /> : null}</div>

            {isAdmin ? (
                <section className="space-y-6 mt-6">
                    {EDGE_TABLES.map((tableConfig) => (
                        <Section key={tableConfig.identifier} padding={false} className="overflow-hidden">
                            <DynamicTableDisplay
                                tableIdentifier={tableConfig.identifier}
                                refreshTrigger={refreshTrigger}
                                initialTable={tables[tableConfig.identifier]}
                            />
                        </Section>
                    ))}
                </section>
            ) : null}
        </Container>
    );
}
