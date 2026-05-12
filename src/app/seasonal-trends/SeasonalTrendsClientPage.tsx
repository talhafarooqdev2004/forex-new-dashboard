"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CurrencySeasonalTrends from "@/components/composed/CurrencySeasonalTrends";
import PeriodPicker from "@/components/composed/PeriodPicker";
import SeasonalTrendsPairsAndBias from "@/components/composed/SeasonalTrendsPairsAndBias";
import type { CurrencySeasonalTrendGaugeItem } from "@/components/composed/CurrencySeasonalTrends";
import type { SeasonalPairBiasItem } from "@/components/composed/SeasonalTrendsPairsAndBias";
import AdminTableEditor from "@/components/composed/dynamic-table/AdminTableEditor";
import DynamicTableDisplay from "@/components/composed/dynamic-table/DynamicTableDisplay";
import Container from "@/components/ui/layout/Container";
import { useAuth } from "@/components/providers/AuthProvider";
import StrengthIndicatorsBar from "@/components/composed/StrengthIndicatorsBar";
import { dynamicTableService, type DynamicTable, type TableColumn, type TableRow } from "@/services/dynamicTable.service";

const YEARLY_SEASONALITY_IDENTIFIER = "yearly_seasonality_trends";
const MONTHLY_HEATMAP_IDENTIFIER = "monthly_performance_heatmap";
const CURRENCY_SEASONALITY_IDENTIFIER = "currency_seasonality";

const MONTH_ALIASES: string[][] = [
    ["january", "jan", "jan."],
    ["february", "feb", "feb."],
    ["march", "mar", "mar."],
    ["april", "apr", "apr."],
    ["may"],
    ["june", "jun", "jun."],
    ["july", "jul", "jul."],
    ["august", "aug", "aug."],
    ["september", "sep", "sept", "sep.", "sept."],
    ["october", "oct", "oct."],
    ["november", "nov", "nov."],
    ["december", "dec", "dec."],
];

const EXCLUDED_ASSETS = new Set([
    "gold",
    "silver",
    "crude oil",
    "nasdaq 100",
    "natural gas",
    "wheat srw",
    "corn",
    "cotton",
    "sugar",
]);

const CURRENCY_CODES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "MXN", "NOK", "SEK", "DKK", "PLN", "SGD", "HKD", "CZK"];
const SEASONAL_GAUGE_CURRENCY_ORDER = ["USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "NZD"] as const;

type CurrencyScore = { currency: string; score: number };
type TopCurrencyItem = { label: string; value: string; score: number };

function getSortedColumns(table: DynamicTable): TableColumn[] {
    return [...(table.columns ?? [])].sort((a, b) => a.column_index - b.column_index);
}

function getSortedRows(table: DynamicTable): TableRow[] {
    return [...(table.rows ?? [])].sort((a, b) => a.row_index - b.row_index);
}

function normalizeValue(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getCurrentMonthColumn(table: DynamicTable): TableColumn | null {
    const monthIndex = new Date().getMonth();
    const aliases = MONTH_ALIASES[monthIndex];

    const sortedColumns = getSortedColumns(table);
    // First column is asset/currency name; months start from second column.
    const monthColumns = sortedColumns.filter((column) => column.column_index > 0);
    const matchedByHeader = monthColumns.find((column) => {
        const normalized = normalizeValue(column.header ?? "");
        return aliases.some((alias) => normalized === alias || normalized.startsWith(alias));
    });

    if (matchedByHeader) return matchedByHeader;
    // Fallback to positional month: Jan => 2nd column, Feb => 3rd, ... Apr => 5th.
    return monthColumns[monthIndex] ?? null;
}

function getFirstColumn(table: DynamicTable): TableColumn | null {
    const sortedColumns = getSortedColumns(table);
    return sortedColumns[0] ?? null;
}

function parseNumericValue(value: string | null | undefined): number | null {
    if (!value) return null;
    const numeric = Number.parseFloat(value.toString().replace(/[,%]/g, "").trim());
    return Number.isFinite(numeric) ? numeric : null;
}

function extractCellValue(row: TableRow, columnId: number): string | null {
    const cell = row.cells?.find((item) => item.table_column_id === columnId);
    return cell?.value?.toString().trim() ?? null;
}

function extractCodesFromText(text: string): string[] {
    const upper = text.toUpperCase();
    const matchedCodes = CURRENCY_CODES.filter((code) => upper.includes(code));
    return [...new Set(matchedCodes)];
}

function isCurrencyLikeAsset(text: string): boolean {
    const normalized = normalizeValue(text);
    if (EXCLUDED_ASSETS.has(normalized)) return false;
    return extractCodesFromText(text).length > 0;
}

function buildTopCurrencyLists(table: DynamicTable): { bullish: TopCurrencyItem[]; bearish: TopCurrencyItem[] } {
    const firstColumn = getFirstColumn(table);
    const monthColumn = getCurrentMonthColumn(table);
    if (!firstColumn || !monthColumn) {
        return { bullish: [], bearish: [] };
    }

    const currencyScores: CurrencyScore[] = [];

    for (const row of getSortedRows(table)) {
        const assetName = extractCellValue(row, firstColumn.id);
        const rawScore = extractCellValue(row, monthColumn.id);
        if (!assetName) continue;
        if (!isCurrencyLikeAsset(assetName)) continue;

        const score = parseNumericValue(rawScore);
        if (score === null) continue;

        currencyScores.push({ currency: assetName.toUpperCase(), score });
    }

    const uniqueByLabel = currencyScores.filter(
        (item, index, arr) => arr.findIndex((candidate) => candidate.currency === item.currency) === index
    );

    const maxTwo = uniqueByLabel
        .sort((a, b) => b.score - a.score)
        .filter((item, index, arr) => arr.findIndex((candidate) => candidate.score === item.score) === index)
        .slice(0, 2);

    const minTwo = uniqueByLabel
        .sort((a, b) => a.score - b.score)
        .filter((item, index, arr) => arr.findIndex((candidate) => candidate.score === item.score) === index)
        .slice(0, 2);

    return {
        bullish: maxTwo.map((item) => ({
            label: item.currency,
            value: `${item.score >= 0 ? "+" : ""}${item.score.toFixed(2)}`,
            score: item.score,
        })),
        bearish: minTwo.map((item) => ({
            label: item.currency,
            value: `-${Math.abs(item.score).toFixed(2)}`,
            score: item.score,
        })),
    };
}

function buildCurrencySeasonalityGauges(table: DynamicTable): CurrencySeasonalTrendGaugeItem[] {
    const firstColumn = getFirstColumn(table);
    const monthColumn = getCurrentMonthColumn(table);
    if (!firstColumn || !monthColumn) return [];

    const currencyScoreMap = new Map<string, number>();
    for (const row of getSortedRows(table)) {
        const currency = extractCellValue(row, firstColumn.id);
        const value = parseNumericValue(extractCellValue(row, monthColumn.id));
        if (!currency || value === null) continue;
        const normalizedCurrency = currency.toUpperCase();
        if (SEASONAL_GAUGE_CURRENCY_ORDER.includes(normalizedCurrency as (typeof SEASONAL_GAUGE_CURRENCY_ORDER)[number])) {
            currencyScoreMap.set(normalizedCurrency, Math.max(-5, Math.min(5, value)));
        }
    }

    return SEASONAL_GAUGE_CURRENCY_ORDER.map((currency) => ({
        currency,
        score: currencyScoreMap.get(currency) ?? 0,
    }));
}

function buildSeasonalPairs(table: DynamicTable): SeasonalPairBiasItem[] {
    const firstColumn = getFirstColumn(table);
    const monthColumn = getCurrentMonthColumn(table);
    if (!firstColumn || !monthColumn) return [];

    const items: SeasonalPairBiasItem[] = [];
    for (const row of getSortedRows(table)) {
        const pair = extractCellValue(row, firstColumn.id);
        const value = parseNumericValue(extractCellValue(row, monthColumn.id));
        if (!pair || value === null) continue;
        if (EXCLUDED_ASSETS.has(normalizeValue(pair))) continue;
        items.push({ pair: pair.toUpperCase(), value: Math.max(-5, Math.min(5, value)) });
    }

    // Positives: largest first (+5, +4, +3 … +0.2 last before neutral).
    const positive = items.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
    const neutral = items.filter((item) => item.value === 0);
    // Negatives: closest to zero first (-0.3, -1, -2 … strongest shorts -3, -4 last), same as moving right on the number line from 0.
    const negative = items.filter((item) => item.value < 0).sort((a, b) => b.value - a.value);
    return [...positive, ...neutral, ...negative];
}

const SEASONAL_TREND_TABLES = [
    {
        identifier: "yearly_seasonality_trends",
        name: "Yearly Seasonality Trends",
        displayName: "Yearly Seasonality Trends",
    },
    {
        identifier: "monthly_performance_heatmap",
        name: "Monthly Performance Heatmap",
        displayName: "Monthly Performance Heatmap",
    },
    {
        identifier: "currency_seasonality",
        name: "Currency seasonality",
        displayName: "Currency seasonality",
    },
] as const;

export default function SeasonalTrendsClientPage({
    initialYearly,
    initialMonthly,
    initialCurrencySeasonality,
    initialTableExists,
}: {
    initialYearly: DynamicTable | null;
    initialMonthly: DynamicTable | null;
    initialCurrencySeasonality: DynamicTable | null;
    initialTableExists: Record<string, boolean>;
}) {
    const { isAdmin } = useAuth();
    const [selectedTable, setSelectedTable] = useState<string>(SEASONAL_TREND_TABLES[0].identifier);
    const [tableExists, setTableExists] = useState<Record<string, boolean>>(initialTableExists);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showEditor, setShowEditor] = useState(false);
    const firstAdminTableCheckRef = useRef(true);
    const [isLoadingTables, setIsLoadingTables] = useState(false);
    const [yearlyTable, setYearlyTable] = useState<DynamicTable | null>(initialYearly);
    const [monthlyTable, setMonthlyTable] = useState<DynamicTable | null>(initialMonthly);
    const [currencySeasonalityTableState, setCurrencySeasonalityTableState] = useState<DynamicTable | null>(
        initialCurrencySeasonality,
    );

    const bullishCurrencies = useMemo(() => {
        if (!yearlyTable) return [];
        return buildTopCurrencyLists(yearlyTable).bullish;
    }, [yearlyTable]);

    const bearishCurrencies = useMemo(() => {
        if (!yearlyTable) return [];
        return buildTopCurrencyLists(yearlyTable).bearish;
    }, [yearlyTable]);

    const seasonalPairItems = useMemo(() => {
        if (!monthlyTable) return [];
        return buildSeasonalPairs(monthlyTable);
    }, [monthlyTable]);

    const currencyGaugeItems = useMemo(() => {
        if (!currencySeasonalityTableState) return [];
        return buildCurrencySeasonalityGauges(currencySeasonalityTableState);
    }, [currencySeasonalityTableState]);

    const loadSeasonalWidgets = useCallback(async () => {
        try {
            const [yearlyResponse, monthlyResponse, currencyResponse] = await Promise.all([
                dynamicTableService.getTableByIdentifier(YEARLY_SEASONALITY_IDENTIFIER),
                dynamicTableService.getTableByIdentifier(MONTHLY_HEATMAP_IDENTIFIER),
                dynamicTableService.getTableByIdentifier(CURRENCY_SEASONALITY_IDENTIFIER),
            ]);

            setYearlyTable(yearlyResponse?.data ?? null);
            setMonthlyTable(monthlyResponse?.data ?? null);
            setCurrencySeasonalityTableState(currencyResponse?.data ?? null);
        } catch (error) {
            console.error("Failed to load seasonal widgets:", error);
        }
    }, []);

    const checkTables = useCallback(async () => {
        try {
            if (!firstAdminTableCheckRef.current) {
                setIsLoadingTables(true);
            }
            firstAdminTableCheckRef.current = false;

            const responses = await Promise.all(
                SEASONAL_TREND_TABLES.map(async (table) => {
                    try {
                        const response = await dynamicTableService.getTableByIdentifier(table.identifier);
                        return {
                            identifier: table.identifier,
                            exists: Boolean(response?.data),
                        };
                    } catch (error) {
                        console.error(`Failed to load table "${table.identifier}":`, error);
                        return {
                            identifier: table.identifier,
                            exists: false,
                        };
                    }
                })
            );

            const nextTableExists = responses.reduce<Record<string, boolean>>((acc, current) => {
                acc[current.identifier] = current.exists;
                return acc;
            }, {});

            setTableExists(nextTableExists);
            // Keep editor visibility controlled by user actions.
        } finally {
            setIsLoadingTables(false);
        }
    }, []);

    useEffect(() => {
        void checkTables();
    }, [checkTables]);

    useEffect(() => {
        void loadSeasonalWidgets();
    }, [loadSeasonalWidgets, refreshTrigger]);

    const selectedTableConfig = useMemo(
        () => SEASONAL_TREND_TABLES.find((table) => table.identifier === selectedTable) ?? SEASONAL_TREND_TABLES[0],
        [selectedTable]
    );

    const selectedTableExists = tableExists[selectedTable] ?? false;

    const handleTableSave = useCallback(async () => {
        setRefreshTrigger((current) => current + 1);
        await checkTables();
        await loadSeasonalWidgets();
        setTableExists((current) => ({ ...current, [selectedTable]: true }));
        setShowEditor(false);
    }, [checkTables, loadSeasonalWidgets, selectedTable]);

    const handleTableSelection = useCallback((identifier: string) => {
        setSelectedTable(identifier);
        // Selecting table from dropdown should not collapse editor.
        setShowEditor(true);
    }, []);

    return (
        <Container>
            <PeriodPicker />

            <TopCurrenciesSections>
                <TopCurrenciesSection
                    label="Top Bullish Currency"
                    type="bullish"
                    currencies={bullishCurrencies}
                />
                <TopCurrenciesSection
                    label="Top Bearish Currency"
                    type="bearish"
                    currencies={bearishCurrencies}
                />
            </TopCurrenciesSections>

            <CurrencySeasonalTrends items={currencyGaugeItems} />

            <SeasonalTrendsPairsAndBias items={seasonalPairItems} />

            {isAdmin ? (
                <section className="space-y-4">
                    <div className="flex flex-col gap-4 rounded-xl bg-darkGrey p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--secondary))]">
                                Seasonal trends table editor
                            </p>
                        </div>

                        <button
                            onClick={() => setShowEditor((current) => !current)}
                            disabled={isLoadingTables}
                            className="rounded-lg bg-[rgb(var(--electric-blue))] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {showEditor ? "Hide editor" : selectedTableExists ? "Edit table" : "Create table"}
                        </button>
                    </div>

                    {showEditor && (
                        <section>
                            <AdminTableEditor
                                tableIdentifier={selectedTable}
                                tableName={selectedTableConfig.name}
                                onSave={handleTableSave}
                                showTableSelector={true}
                                availableTables={[...SEASONAL_TREND_TABLES]}
                                onTableSelect={handleTableSelection}
                            />
                        </section>
                    )}
                </section>
            ) : null}

            {isAdmin ? (
                <section className="space-y-6">
                    {SEASONAL_TREND_TABLES.map((table) => (
                        <section key={table.identifier} className="space-y-4 rounded-xl bg-darkGrey">
                            <DynamicTableDisplay
                                tableIdentifier={table.identifier}
                                refreshTrigger={refreshTrigger}
                            />
                        </section>
                    ))}
                </section>
            ) : null}
        </Container>
    );
}

function TopCurrenciesSections({ children }: React.PropsWithChildren) {
    return (
        <div>
            <h5 className="mb-6">Top Bullish & Bearish Currencies</h5>

            <div className="flex items-center gap-6 min-w-0">
                {children}
            </div>
        </div>
    );
}

function TopCurrenciesSection({
    label,
    type,
    currencies
}: {
    label: string,
    type: "bullish" | "bearish",
    currencies:
    { label: string, value: string, score?: number }[]
}) {
    return (
        <div className="bg-darkGrey rounded-xl px-6 py-8 flex-1">
            <h6 className="mb-4">{label}</h6>

            <StrengthIndicatorsBars>
                {currencies.map((currency) => (
                    <StrengthIndicatorsBar
                        key={currency.label}
                        type={type}
                        currency={currency.label}
                        value={currency.value}
                        score={currency.score ?? (Number.parseFloat(currency.value) || 0)}
                    />
                ))}
            </StrengthIndicatorsBars>
        </div>
    );
}

function StrengthIndicatorsBars({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-col gap-4">
            {children}
        </div>
    );
}
