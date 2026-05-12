"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type CSSProperties } from "react";
import { io } from "socket.io-client";

import styles from "./FxAnalyzerPro.module.scss";
import { Row, Col } from "@/components/layout";
import Dropdown from "@/components/ui/Dropdown";
import GuageChart from "@/components/chart/GuageChart";
import SeasonalGaugeNeedle from "@/components/chart/SeasonalGaugeNeedle";
import AdminTableEditor from "@/components/composed/dynamic-table/AdminTableEditor";
import DynamicTableDisplay from "@/components/composed/dynamic-table/DynamicTableDisplay";
import BiasIcon from "@/components/composed/BiasIcon";
import Container from "@/components/ui/layout/Container";
import PrimaryCard from "@/components/composed/PrimaryCard";
import { apiConfig } from "@/services/api.config";
import { dynamicTableService, DynamicTable, TableColumn, TableRow } from "@/services/dynamicTable.service";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useFxAnalyzerGaugeScales } from "@/hooks/useFxAnalyzerGaugeScales";
import { useDashboardBackendPoll } from "@/hooks/useDashboardBackendPoll";
import {
    buildCentralBankStanceByCurrency,
    centralBankStanceLabelColor,
    defaultCentralBankDisplayCodeForCurrency,
    FX_ANALYZER_TABLE_NEUTRAL_TEXT_LIGHT,
} from "@/lib/fundamentalDashboardData";
import {
    FX_TMV_GAUGE_ZONES_DARK,
    FX_TMV_GAUGE_ZONES_LIGHT,
    type FxTmvGaugeZoneList,
} from "@/lib/fxTmvGaugeZones";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import { FX_ANALYZER_DYNAMIC_TABLE_IDS } from "@/lib/fxAnalyzerTableIds";
import type { FxGaugeZone } from "@/lib/gaugeZonesFromConfigurations";
import { fxAnalyzerDiscreteNeedleRotationDeg, zoneColorForConfiguredScore } from "@/lib/needleAngleForConfiguredZones";

const CURRENCIES = ["USD", "GBP", "EUR", "AUD", "CAD", "NZD", "CHF"];
const shortDarkBgColor = GAUGE_SIGNAL_COLORS.sell;
const longDarkBgColor = GAUGE_SIGNAL_COLORS.buy;

const FX_ANALYZER_TABLES = [
    {
        identifier: "fx_technical_trends",
        name: "Technical Trends",
        displayName: "Technical Trends",
    },
    {
        identifier: "fx_technical_levels",
        name: "Technical Levels",
        displayName: "Technical Levels",
    },
] as const;

const SCORE_DASHBOARD_TABLE_ID = "score_dashboard_sheet76";
const COT_RAW_DATA_TABLE_ID = "cot_raw_data";
const RETAIL_SENTIMENT_TABLE_IDS = ["retail_sentiment_currency_pairs", "retail_sentiment"] as const;
const CURRENCY_STRENGTH_TABLE_ID = "edge_currency_strength_index";
const CENTRAL_BANK_POLICIES_TABLE_ID = "central_bank_policies";

const FALLBACK_PAIR_NAMES: Record<string, string[]> = {
    USD: ["USDCAD", "USDCHF", "USDJPY"],
    GBP: ["GBPUSD", "GBPJPY", "GBPAUD", "GBPCAD", "GBPCHF"],
    EUR: ["EURUSD", "EURGBP", "EURJPY", "EURCHF", "EURAUD"],
    AUD: ["AUDUSD", "AUDJPY", "AUDNZD", "AUDCAD", "AUDCHF"],
    CAD: ["USDCAD", "CADJPY", "CADCHF", "AUDCAD", "GBPCAD"],
    NZD: ["NZDUSD", "NZDJPY", "AUDNZD", "NZDCAD", "NZDCHF"],
    CHF: ["USDCHF", "EURCHF", "GBPCHF", "CHFJPY", "AUDCHF"],
};

/** Same palette as Edge Tools / Technical Dashboard TMV gauges. */
const DARK_GAUGE_ZONES = FX_TMV_GAUGE_ZONES_DARK.map((zone) => ({ ...zone }));
const LIGHT_GAUGE_ZONES = FX_TMV_GAUGE_ZONES_LIGHT.map((zone) => ({ ...zone }));

type GaugeZoneList = FxTmvGaugeZoneList;

function gaugeZones(isDark: boolean): GaugeZoneList {
    return isDark ? DARK_GAUGE_ZONES : LIGHT_GAUGE_ZONES;
}

function contrastingForeground(backgroundCss: string): string {
    const hex = backgroundCss.trim();
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (m) {
        const v = m[1]!;
        const r = Number.parseInt(v.slice(0, 2), 16);
        const g = Number.parseInt(v.slice(2, 4), 16);
        const b = Number.parseInt(v.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.62 ? "#000000" : "#FFFFFF";
    }
    if (/rgba?\(/i.test(backgroundCss)) {
        return "#000000";
    }
    return "#FFFFFF";
}

function netBiasBannerStyles(
    netBias: string | null | undefined,
    netScore: number | null,
    gaugeZonesConfigured: FxGaugeZone[],
    isDark: boolean,
): CSSProperties {
    const fromText = fxAnalyzerBannerLabelZoneColor(netBias, isDark);
    if (fromText) {
        return { backgroundColor: fromText, color: contrastingForeground(fromText) };
    }
    const fromScore = zoneColorForConfiguredScore(netScore, gaugeZonesConfigured);
    if (fromScore) {
        return { backgroundColor: fromScore, color: contrastingForeground(fromScore) };
    }
    const fallback = isDark ? "#374151" : "#e5e7eb";
    return { backgroundColor: fallback, color: contrastingForeground(fallback) };
}

/**
 * Map Net Bias label string to gauge arc colors (including **#FFFF00** neutral in light) — for the pair / bias banner only.
 */
function fxAnalyzerBannerLabelZoneColor(raw: string | null | undefined, isDark: boolean): string | undefined {
    const t = String(raw || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    if (!t || t === "n/a") return undefined;

    const zones = gaugeZones(isDark);
    const byName = (name: string) => zones.find((z) => z.name.toLowerCase() === name.toLowerCase())?.color;

    if (t.includes("strong") && (t.includes("bull") || t.includes("buy"))) return byName("Strong Buy");
    if (t.includes("strong") && (t.includes("bear") || t.includes("sell"))) return byName("Strong Sell");

    if (t.includes("weak") && (t.includes("bull") || t.includes("buy"))) return byName("Weak Buy");
    if (t.includes("weak") && (t.includes("bear") || t.includes("sell"))) return byName("Weak Sell");

    if (t.includes("bull") || t.includes("buy") || /\buptrend\b/.test(t)) return byName("Buy");
    if (t.includes("bear") || t.includes("sell") || /\bdowntrend\b/.test(t) || /\bdown trend\b/.test(t)) return byName("Sell");

    if (
        t.includes("neutral") ||
        t.includes("moderate") ||
        t.includes("non volatile") ||
        t.includes("sideways") ||
        t.includes("flat") ||
        t.includes("ranging")
    ) {
        return byName("Neutral");
    }

    return undefined;
}

/**
 * Map technical trend / score-column labels to gauge hues; light-mode neutral-like labels use readable amber (not gauge yellow).
 */
function fxAnalyzerLabelZoneColor(raw: string | null | undefined, isDark: boolean): string | undefined {
    const t = String(raw || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    if (!t || t === "n/a") return undefined;

    const zones = gaugeZones(isDark);
    const byName = (name: string) => zones.find((z) => z.name.toLowerCase() === name.toLowerCase())?.color;

    if (t.includes("strong") && (t.includes("bull") || t.includes("buy"))) return byName("Strong Buy");
    if (t.includes("strong") && (t.includes("bear") || t.includes("sell"))) return byName("Strong Sell");

    if (t.includes("weak") && (t.includes("bull") || t.includes("buy"))) return byName("Weak Buy");
    if (t.includes("weak") && (t.includes("bear") || t.includes("sell"))) return byName("Weak Sell");

    if (t.includes("bull") || t.includes("buy") || /\buptrend\b/.test(t)) return byName("Buy");
    if (t.includes("bear") || t.includes("sell") || /\bdowntrend\b/.test(t) || /\bdown trend\b/.test(t)) return byName("Sell");

    if (
        t.includes("neutral") ||
        t.includes("moderate") ||
        t.includes("non volatile") ||
        t.includes("sideways") ||
        t.includes("flat") ||
        t.includes("ranging")
    ) {
        return isDark ? byName("Neutral") : FX_ANALYZER_TABLE_NEUTRAL_TEXT_LIGHT;
    }

    return undefined;
}

type FxAnalyzerTableIdentifier = (typeof FX_ANALYZER_TABLES)[number]["identifier"];
type TableMap = Record<string, DynamicTable | null>;
type Bias = "Bullish" | "Bearish" | "Neutral";

interface TechnicalTrendData {
    timeFrame: string;
    trend: string;
    momentum: string;
    volatility: string;
}

interface COTPositionData {
    currency: string;
    nonCommercial: { long: number | null; short: number | null };
    commercial: { long: number | null; short: number | null };
}

interface RetailPositionData {
    long: number | null;
    short: number | null;
}

interface TechnicalLevelsData {
    currentPrice: string | null;
    pivot: string | null;
    s1: string | null;
    s2: string | null;
    s3: string | null;
    r1: string | null;
    r2: string | null;
    r3: string | null;
}

interface PairData {
    pair: string;
    netScore: number | null;
    netBias: string | null;
    trendScore: number | null;
    momentumScore: number | null;
    fundamentalScore: number | null;
    seasonalScore: number | null;
    cotScore: number | null;
    sentimentScore: number | null;
    riskMeter: number | null;
    technicalTrends: TechnicalTrendData[];
    cotPositions: COTPositionData | null;
    quoteCurrencyCotPositions: COTPositionData | null;
    retailPositions: RetailPositionData | null;
    technicalLevels: TechnicalLevelsData | null;
    currencyStrengths: Record<string, number | null>;
    /** Central bank policy stance per pair leg — same sheet as Fundamental “Central Bank Policies”. */
    currencyLegStances: { currency: string; centralBank: string; stance: string }[];
}

function getSortedColumns(table: DynamicTable | null): TableColumn[] {
    return [...(table?.columns ?? [])].sort((a, b) => a.column_index - b.column_index);
}

function getSortedRows(table: DynamicTable | null): TableRow[] {
    return [...(table?.rows ?? [])].sort((a, b) => a.row_index - b.row_index);
}

function getCellValue(row: TableRow | null | undefined, column: TableColumn | null | undefined): string | null {
    if (!row || !column) return null;
    const cell = row.cells?.find((item) => item.table_column_id === column.id);
    return cell?.value?.toString().trim() ?? null;
}

function getCellByColumnIndex(table: DynamicTable | null, row: TableRow | null | undefined, zeroBasedColumnIndex: number): string | null {
    const column = getSortedColumns(table)[zeroBasedColumnIndex];
    return getCellValue(row, column);
}

function parseNumericValue(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === "") return null;
    const numeric = Number.parseFloat(String(value).replace(/[,%]/g, "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
}

function normalizePair(value: string | null | undefined): string {
    return String(value || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function extractBaseCurrency(pair: string): string {
    return pair.length >= 3 ? pair.substring(0, 3) : pair;
}

function extractQuoteCurrency(pair: string): string | null {
    return pair.length >= 6 ? pair.substring(3, 6) : null;
}

function findRowByFirstColumn(table: DynamicTable | null, target: string): TableRow | null {
    const columns = getSortedColumns(table);
    const firstColumn = columns[0];
    if (!firstColumn) return null;
    const normalizedTarget = normalizePair(target);

    return getSortedRows(table).find((row) => normalizePair(getCellValue(row, firstColumn)) === normalizedTarget) ?? null;
}

function collectPairsFromTable(table: DynamicTable | null): string[] {
    const firstColumn = getSortedColumns(table)[0];
    if (!firstColumn) return [];

    return getSortedRows(table)
        .map((row) => normalizePair(getCellValue(row, firstColumn)))
        .filter((pair) => pair.length >= 6);
}

function biasFromScore(score: number | null): Bias {
    if (score === null || score === 0) return "Neutral";
    return score > 0 ? "Bullish" : "Bearish";
}

function biasColor(bias: Bias, isDark: boolean): string {
    if (!isDark && bias === "Neutral") return FX_ANALYZER_TABLE_NEUTRAL_TEXT_LIGHT;
    const z = gaugeZones(isDark);
    const pick = (name: string) => z.find((x) => x.name === name)?.color;
    if (bias === "Bullish") return pick("Buy") ?? GAUGE_SIGNAL_COLORS.buy;
    if (bias === "Bearish") return pick("Sell") ?? GAUGE_SIGNAL_COLORS.sell;
    return pick("Neutral") ?? GAUGE_SIGNAL_COLORS.neutral;
}

function clampPercent(value: number | null | undefined): number {
    if (value === null || value === undefined || Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(100, value));
}

function formatScore(score: number | null): string {
    return score === null ? "N/A" : Number.isInteger(score) ? String(score) : score.toFixed(2).replace(/\.?0+$/, "");
}

function buildCotPosition(table: DynamicTable | null, currency: string | null): COTPositionData | null {
    if (!currency) return null;
    const row = findRowByFirstColumn(table, currency);
    if (!row) return null;

    return {
        currency,
        nonCommercial: {
            long: parseNumericValue(getCellByColumnIndex(table, row, 6)),
            short: parseNumericValue(getCellByColumnIndex(table, row, 7)),
        },
        commercial: {
            long: parseNumericValue(getCellByColumnIndex(table, row, 13)),
            short: parseNumericValue(getCellByColumnIndex(table, row, 14)),
        },
    };
}

function buildRetailPosition(table: DynamicTable | null, pair: string): RetailPositionData | null {
    const row = findRowByFirstColumn(table, pair);
    if (!row) return null;
    return {
        long: parseNumericValue(getCellByColumnIndex(table, row, 1)),
        short: parseNumericValue(getCellByColumnIndex(table, row, 2)),
    };
}

function buildCurrencyStrengths(table: DynamicTable | null, pair: string): Record<string, number | null> {
    const columns = getSortedColumns(table);
    const firstColumn = columns[0];
    const lastColumn = columns[columns.length - 1];
    const currencies = [extractBaseCurrency(pair), extractQuoteCurrency(pair)].filter(Boolean) as string[];
    const values: Record<string, number | null> = {};

    for (const currency of currencies) {
        const row = getSortedRows(table).find((item) => String(getCellValue(item, firstColumn) || "").toUpperCase().includes(currency));
        values[currency] = parseNumericValue(getCellValue(row, lastColumn));
    }

    return values;
}

function buildTechnicalLevels(table: DynamicTable | null, pair: string): TechnicalLevelsData | null {
    const row = findRowByFirstColumn(table, pair);
    if (!row) return null;

    return {
        currentPrice: getCellByColumnIndex(table, row, 1),
        pivot: getCellByColumnIndex(table, row, 2),
        s1: getCellByColumnIndex(table, row, 3),
        s2: getCellByColumnIndex(table, row, 4),
        s3: getCellByColumnIndex(table, row, 5),
        r1: getCellByColumnIndex(table, row, 6),
        r2: getCellByColumnIndex(table, row, 7),
        r3: getCellByColumnIndex(table, row, 8),
    };
}

function buildTechnicalTrends(table: DynamicTable | null, pair: string): TechnicalTrendData[] {
    const row = findRowByFirstColumn(table, pair);
    if (!row) return [];

    return [
        {
            timeFrame: "1H",
            trend: getCellByColumnIndex(table, row, 1) || "N/A",
            momentum: getCellByColumnIndex(table, row, 2) || "N/A",
            volatility: getCellByColumnIndex(table, row, 3) || "N/A",
        },
        {
            timeFrame: "4H",
            trend: getCellByColumnIndex(table, row, 4) || "N/A",
            momentum: getCellByColumnIndex(table, row, 5) || "N/A",
            volatility: getCellByColumnIndex(table, row, 6) || "N/A",
        },
        {
            timeFrame: "Daily",
            trend: getCellByColumnIndex(table, row, 7) || "N/A",
            momentum: getCellByColumnIndex(table, row, 8) || "N/A",
            volatility: getCellByColumnIndex(table, row, 9) || "N/A",
        },
    ];
}

function buildCurrencyLegCentralBankStances(
    pair: string,
    centralBankTable: DynamicTable | null,
): { currency: string; centralBank: string; stance: string }[] {
    const byCurrency = buildCentralBankStanceByCurrency(centralBankTable);
    const base = extractBaseCurrency(pair);
    const quote = extractQuoteCurrency(pair);
    const legs: { currency: string; centralBank: string; stance: string }[] = [];

    const pushLeg = (currency: string | null) => {
        if (!currency) return;
        const u = currency.toUpperCase();
        const row = byCurrency[u];
        legs.push({
            currency: u,
            centralBank: row?.centralBank ?? defaultCentralBankDisplayCodeForCurrency(u),
            stance: row?.stance ?? "N/A",
        });
    };

    pushLeg(base);
    pushLeg(quote);
    return legs;
}

function buildPairData(pair: string, tables: TableMap): PairData {
    const scoreTable = tables[SCORE_DASHBOARD_TABLE_ID];
    const scoreRow = findRowByFirstColumn(scoreTable, pair);
    const baseCurrency = extractBaseCurrency(pair);
    const quoteCurrency = extractQuoteCurrency(pair);
    const retailTable = RETAIL_SENTIMENT_TABLE_IDS.map((id) => tables[id]).find(Boolean) ?? null;

    return {
        pair,
        netScore: parseNumericValue(getCellByColumnIndex(scoreTable, scoreRow, 1)),
        netBias: getCellByColumnIndex(scoreTable, scoreRow, 2),
        trendScore: parseNumericValue(getCellByColumnIndex(scoreTable, scoreRow, 3)),
        momentumScore: parseNumericValue(getCellByColumnIndex(scoreTable, scoreRow, 4)),
        sentimentScore: parseNumericValue(getCellByColumnIndex(scoreTable, scoreRow, 5)),
        fundamentalScore: parseNumericValue(getCellByColumnIndex(scoreTable, scoreRow, 6)),
        cotScore: parseNumericValue(getCellByColumnIndex(scoreTable, scoreRow, 7)),
        seasonalScore: parseNumericValue(getCellByColumnIndex(scoreTable, scoreRow, 8)),
        riskMeter: parseNumericValue(getCellByColumnIndex(scoreTable, scoreRow, 9)),
        technicalTrends: buildTechnicalTrends(tables.fx_technical_trends, pair),
        cotPositions: buildCotPosition(tables[COT_RAW_DATA_TABLE_ID], baseCurrency),
        quoteCurrencyCotPositions: buildCotPosition(tables[COT_RAW_DATA_TABLE_ID], quoteCurrency),
        retailPositions: buildRetailPosition(retailTable, pair),
        technicalLevels: buildTechnicalLevels(tables.fx_technical_levels, pair),
        currencyStrengths: buildCurrencyStrengths(tables[CURRENCY_STRENGTH_TABLE_ID], pair),
        currencyLegStances: buildCurrencyLegCentralBankStances(pair, tables[CENTRAL_BANK_POLICIES_TABLE_ID]),
    };
}

function buildPairGroups(tables: TableMap): Record<string, PairData[]> {
    const pairs = new Set<string>();
    [
        ...collectPairsFromTable(tables[SCORE_DASHBOARD_TABLE_ID]),
        ...collectPairsFromTable(tables.fx_technical_trends),
        ...collectPairsFromTable(tables.fx_technical_levels),
        ...RETAIL_SENTIMENT_TABLE_IDS.flatMap((id) => collectPairsFromTable(tables[id])),
    ].forEach((pair) => pairs.add(pair));

    if (pairs.size === 0) {
        Object.values(FALLBACK_PAIR_NAMES).flat().forEach((pair) => pairs.add(pair));
    }

    return CURRENCIES.reduce<Record<string, PairData[]>>((acc, currency) => {
        acc[currency] = [...pairs]
            .filter((pair) => pair.startsWith(currency))
            .sort()
            .map((pair) => buildPairData(pair, tables));
        return acc;
    }, {});
}

function getCurrencyStrengthStyle(score: number | null): { fillPercent: number; color: string; cursorPercent: number } {
    if (score === null || score === undefined || Number.isNaN(score)) {
        return { fillPercent: 0, color: "#e0e0e0", cursorPercent: 50 };
    }

    let normalizedScore: number;
    if (score >= -10 && score <= 10) {
        normalizedScore = score;
    } else if (score >= 0 && score <= 100) {
        // Values like 10.7 or 11.9 are almost always already on the ±strength scale from the sheet,
        // not 0–100 centered at 50 (which would map 11.9 → negative and paint the bar red).
        const looksLikeFineGrainedStrength = score % 1 !== 0 || (score > 10 && score <= 15);
        if (looksLikeFineGrainedStrength) {
            normalizedScore = Math.max(-10, Math.min(10, score));
        } else {
            normalizedScore = ((score - 50) / 50) * 10;
        }
    } else {
        normalizedScore = Math.max(-10, Math.min(10, score));
    }

    const fillPercent = (Math.abs(normalizedScore) / 10) * 100;
    const color = normalizedScore > 0 ? longDarkBgColor : normalizedScore < 0 ? shortDarkBgColor : "#e0e0e0";
    return { fillPercent, color, cursorPercent: fillPercent };
}

function NetScoreSignal({ netBias, netScore, isDark }: { netBias: string | null; netScore: number | null; isDark: boolean }) {
    const hasBiasText = Boolean(netBias?.trim());
    const label =
        netScore === null && !hasBiasText ? "N/A" : netBias?.trim() || String(biasFromScore(netScore));

    let iconBias: Bias = biasFromScore(netScore);
    if (hasBiasText) {
        const t = netBias!.toLowerCase();
        if (t.includes("bull") || t.includes("buy")) iconBias = "Bullish";
        else if (t.includes("bear") || t.includes("sell")) iconBias = "Bearish";
        else if (t.includes("neutral")) iconBias = "Neutral";
    }

    const fromText = fxAnalyzerLabelZoneColor(netBias, isDark);
    const color =
        fromText ??
        (netScore !== null && Number.isFinite(netScore) ? biasColor(biasFromScore(netScore), isDark) : "rgb(var(--secondary))");

    return (
        <div className="flex flex-nowrap items-center justify-center gap-3 whitespace-nowrap">
            <span className="font-medium" style={{ color }}>
                {label}
            </span>
            {netScore !== null || hasBiasText ? <BiasIcon sentiment={iconBias} /> : null}
        </div>
    );
}

const scoreCell = (text: React.ReactNode, style?: React.CSSProperties) => (
    <td
        className="box-border px-4 py-3 text-[14px] leading-none text-foreground"
        style={{
            textAlign: "center",
            ...style,
        }}
    >
        {text}
    </td>
);

/** Currency + central bank stance (Fundamental “Central Bank Policies” sheet). */
function FxCurrencyStanceBlock({ legs, isDark }: { legs: { currency: string; centralBank: string; stance: string }[]; isDark: boolean }) {
    if (!legs.length) {
        return null;
    }

    return (
        <div className="w-full">
            <div className={`grid w-full gap-2 ${legs.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {legs.map(({ currency, centralBank, stance }) => {
                    const stanceColor = stance === "N/A" ? undefined : centralBankStanceLabelColor(stance, isDark);
                    return (
                        <div
                            key={currency}
                            className={`flex min-h-[72px] flex-col justify-center rounded-lg bg-darkGrey px-3 py-2.5 text-center sm:px-4 ${styles.fxAnalyzerPro__stanceCard}`}
                        >
                            <span className="text-[15px] font-bold tracking-wide text-foreground">{currency}</span>

                            <span
                                className={`text-[13px] font-semibold leading-snug ${centralBank.trim().toUpperCase() !== currency ? "mt-1.5" : "mt-1"} ${stance === "N/A" ? "text-[rgb(var(--secondary))]" : ""}`}
                                style={stanceColor ? { color: stanceColor } : undefined}
                            >
                                {stance}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ScoreSignal({ score, riskMode = false, isDark }: { score: number | null; riskMode?: boolean; isDark: boolean }) {
    const bias = biasFromScore(score);
    const label = riskMode && score !== null ? (score > 0 ? "Risk On" : score < 0 ? "Risk Off" : "Neutral") : bias;

    return (
        <div className="flex flex-nowrap items-center justify-center gap-3 whitespace-nowrap">
            <span className="font-medium" style={{ color: biasColor(bias, isDark) }}>
                {score === null ? "N/A" : label}
            </span>
            {score !== null ? <BiasIcon sentiment={bias} /> : null}
        </div>
    );
}

function FxEdgeGauge({
    title,
    score,
    gaugeZonesConfigured,
    rangeMin,
    rangeMax,
    width,
    isDark,
    big = false,
}: {
    title: string;
    score: number | null;
    /** Admin score-configuration bands (raw score units); when 7 zones, needle segment follows these spans. */
    gaugeZonesConfigured: readonly FxGaugeZone[];
    rangeMin: number;
    rangeMax: number;
    width: string;
    isDark: boolean;
    big?: boolean;
}) {
    const rotation = fxAnalyzerDiscreteNeedleRotationDeg(
        score,
        [...gaugeZonesConfigured],
        rangeMin,
        rangeMax,
        big ? "netBias" : "standard",
    );
    const arcZones = gaugeZones(isDark);

    return (
        <div className="text-center">
            <GuageChart
                style={{ width, height: big ? "180px" : "100px" }}
                indicatorStyle={{
                    rotation,
                    transition: "0.8s ease-out",
                }}
                labelType={big ? "netBias" : "other"}
                gaugeZones={arcZones}
                customLeftLabel="Sell"
                customRightLabel="Buy"
                renderIndicator={({ rotation: rot, transition }) => (
                    <SeasonalGaugeNeedle
                        rotationDeg={rot}
                        isDark={isDark}
                        transition={transition}
                        width={big ? "75px" : "35px"}
                        height={big ? "50px" : "22px"}
                        style={{ left: big ? "28%" : "29.2%", top: big ? "55%" : "54%" }}
                    />
                )}
            />
            <h1 className={`${big ? "mt-2.5 text-[25px]" : "mt-2.5 text-[12px]"} font-semibold text-foreground`}>
                {title}
            </h1>
        </div>
    );
}

function initialFxAnalyzerTableMap(seed: Partial<Record<string, DynamicTable | null>>): TableMap {
    const acc: Record<string, DynamicTable | null> = {};
    for (const id of FX_ANALYZER_DYNAMIC_TABLE_IDS) {
        acc[id] = seed[id] ?? null;
    }
    return acc;
}

export default function FXAnalyzerProClient({
    initialTables = {},
}: {
    initialTables?: Partial<Record<string, DynamicTable | null>>;
}) {
    const { theme } = useTheme();
    const { token, isAdmin } = useAuth();
    const { scales: gaugeScales, zonesByType } = useFxAnalyzerGaugeScales(token);
    const [selectedTable, setSelectedTable] = useState<FxAnalyzerTableIdentifier>("fx_technical_trends");
    const [showEditor, setShowEditor] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [tables, setTables] = useState<TableMap>(() => initialFxAnalyzerTableMap(initialTables));
    const [selectedPairName, setSelectedPairName] = useState<string | null>(null);
    const [htmlHasDarkClass, setHtmlHasDarkClass] = useState(false);

    useLayoutEffect(() => {
        const sync = () => setHtmlHasDarkClass(document.documentElement.classList.contains("dark"));
        sync();
        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const gaugePaletteDark = theme === "dark" || htmlHasDarkClass;

    const trackedTableIds = useMemo(() => [...FX_ANALYZER_DYNAMIC_TABLE_IDS] as string[], []);

    const loadTables = useCallback(async () => {
        const ids = [...FX_ANALYZER_DYNAMIC_TABLE_IDS];

        try {
            const responses = await Promise.all(
                ids.map(async (identifier) => ({
                    identifier,
                    response: await dynamicTableService.getTableByIdentifier(identifier),
                }))
            );

            setTables(
                responses.reduce<TableMap>((acc, item) => {
                    acc[item.identifier] = item.response?.data ?? null;
                    return acc;
                }, {})
            );
        } catch (error) {
            console.error("Failed to load FX analyzer tables:", error);
        }
    }, []);

    useEffect(() => {
        void loadTables();
    }, [loadTables, refreshTrigger]);

    useDashboardBackendPoll(loadTables);

    useEffect(() => {
        const socket = io(apiConfig.baseURL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        const reload = () => void loadTables();
        const reloadForTrackedTable = (payload?: { data?: { identifier?: string; tableId?: string; table?: DynamicTable }; table?: DynamicTable }) => {
            const identifier = payload?.data?.identifier ?? payload?.data?.tableId ?? payload?.data?.table?.identifier ?? payload?.table?.identifier;
            if (!identifier || trackedTableIds.includes(identifier)) {
                void loadTables();
            }
        };

        socket.on("tableUpdate", reloadForTrackedTable);
        socket.on("tableEditorUpdate", reloadForTrackedTable);
        socket.on("tableEditorSync", reloadForTrackedTable);
        socket.on("scoreDashboardSnapshot", reload);
        socket.on("retailSentimentSnapshot", reload);

        return () => {
            socket.off("tableUpdate", reloadForTrackedTable);
            socket.off("tableEditorUpdate", reloadForTrackedTable);
            socket.off("tableEditorSync", reloadForTrackedTable);
            socket.off("scoreDashboardSnapshot", reload);
            socket.off("retailSentimentSnapshot", reload);
            socket.disconnect();
        };
    }, [loadTables, trackedTableIds]);

    const currencyPairs = useMemo(() => buildPairGroups(tables), [tables]);

    useEffect(() => {
        if (selectedPairName) return;
        for (const currency of CURRENCIES) {
            const firstPair = currencyPairs[currency]?.[0]?.pair;
            if (firstPair) {
                setSelectedPairName(firstPair);
                break;
            }
        }
    }, [currencyPairs, selectedPairName]);

    const displayPair = useMemo(
        () => (selectedPairName ? buildPairData(selectedPairName, tables) : null),
        [selectedPairName, tables],
    );

    const selectedTableConfig = FX_ANALYZER_TABLES.find((table) => table.identifier === selectedTable) ?? FX_ANALYZER_TABLES[0];

    const handleTableSave = async () => {
        setRefreshTrigger((value) => value + 1);
        await loadTables();
        setShowEditor(false);
    };

    const scoreRows = displayPair
        ? [
            ["Fundamental Score", displayPair.fundamentalScore, false] as const,
            ["Seasonality", displayPair.seasonalScore, false] as const,
            ["COT Score", displayPair.cotScore, false] as const,
            ["Trend Score", displayPair.trendScore, false] as const,
            ["Sentiment Score", displayPair.sentimentScore, false] as const,
            ["Risk Meter", displayPair.riskMeter, true] as const,
        ]
        : [];

    return (
        <Container>
            {isAdmin ? (
                <section className="mb-6 space-y-4 rounded-xl bg-darkGrey p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--secondary))]">FX analyzer editor panel</p>
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
                            availableTables={[...FX_ANALYZER_TABLES]}
                            onTableSelect={(identifier) => setSelectedTable(identifier as FxAnalyzerTableIdentifier)}
                        />
                    ) : null}
                </section>
            ) : null}

            <div className={styles.fxAnalyzerPro__pageContainer}>
                <div className={styles.fxAnalyzerPro__dropdownSection}>
                    {CURRENCIES.map((currency) => {
                        const pairs = currencyPairs[currency] || [];
                        return (
                            <Dropdown
                                key={currency}
                                btnLabel={currency}
                                menus={pairs.map((p) => p.pair)}
                                onMenuItemClick={(pairName) => setSelectedPairName(pairName)}
                            />
                        );
                    })}
                </div>

                <div className={styles.fxAnalyzerPro__contentSection}>
                    {displayPair ? (
                        <>
                            <div className={`${styles.fxAnalyzerPro__sentimentPanel} flex min-h-0 flex-col`} style={{ borderRight: "none", borderRadius: "16px" }}>
                                <Row className="text-[20px] font-bold text-foreground" style={{ border: "none", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
                                    <Col>
                                        <span className="text-xl">{displayPair.pair}</span>
                                    </Col>
                                </Row>
                                <Row
                                    className="text-[20px] font-bold"
                                    style={{
                                        ...netBiasBannerStyles(
                                            displayPair.netBias,
                                            displayPair.netScore,
                                            zonesByType.gauge,
                                            gaugePaletteDark,
                                        ),
                                        border: "none",
                                    }}
                                >
                                    <Col>{displayPair.netBias || String(biasFromScore(displayPair.netScore))}</Col>
                                </Row>

                                <div className="flex flex-col items-center gap-5 px-5 pb-2 pt-10">
                                    <FxEdgeGauge
                                        title="Net Bias"
                                        score={displayPair.netScore}
                                        gaugeZonesConfigured={zonesByType.gauge}
                                        rangeMin={gaugeScales.gauge.min}
                                        rangeMax={gaugeScales.gauge.max}
                                        width="280px"
                                        isDark={gaugePaletteDark}
                                        big
                                    />

                                    <div className="grid w-full grid-cols-2 gap-5">
                                        <FxEdgeGauge
                                            title="Fundamental"
                                            score={displayPair.fundamentalScore}
                                            gaugeZonesConfigured={zonesByType.fundamental}
                                            rangeMin={gaugeScales.fundamental.min}
                                            rangeMax={gaugeScales.fundamental.max}
                                            width="130px"
                                            isDark={gaugePaletteDark}
                                        />
                                        <FxEdgeGauge
                                            title="Trend"
                                            score={displayPair.trendScore}
                                            gaugeZonesConfigured={zonesByType.trend}
                                            rangeMin={gaugeScales.trend.min}
                                            rangeMax={gaugeScales.trend.max}
                                            width="130px"
                                            isDark={gaugePaletteDark}
                                        />
                                        <FxEdgeGauge
                                            title="Momentum"
                                            score={displayPair.momentumScore}
                                            gaugeZonesConfigured={zonesByType.momentum}
                                            rangeMin={gaugeScales.momentum.min}
                                            rangeMax={gaugeScales.momentum.max}
                                            width="130px"
                                            isDark={gaugePaletteDark}
                                        />
                                        <FxEdgeGauge
                                            title="Sentiment"
                                            score={displayPair.sentimentScore}
                                            gaugeZonesConfigured={zonesByType.sentiment}
                                            rangeMin={gaugeScales.sentiment.min}
                                            rangeMax={gaugeScales.sentiment.max}
                                            width="130px"
                                            isDark={gaugePaletteDark}
                                        />
                                    </div>
                                </div>

                                <div className="flex w-full min-h-0 flex-1 flex-col">
                                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl bg-darkGrey pb-1.5 pt-0">
                                        <div className="w-full shrink-0 pt-[10px]">
                                            <table
                                                className={`shrink-0 ${styles.fxAnalyzerPro__scoreTable} ${styles.fxAnalyzerDataTable}`}
                                                cellPadding={0}
                                                cellSpacing={0}
                                                style={{
                                                    display: "table",
                                                    width: "100%",
                                                    tableLayout: "fixed",
                                                    borderCollapse: "collapse",
                                                    borderSpacing: 0,
                                                    margin: 0,
                                                    padding: 0,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <tbody>
                                                {scoreRows.map(([label, score, isRisk]) => (
                                                    <tr key={label} className="bg-darkGrey">
                                                        {scoreCell(label, {
                                                            width: "38%",
                                                            fontWeight: 500,
                                                            textAlign: "left",
                                                        })}
                                                        {scoreCell(formatScore(score), { width: "24%", fontWeight: 500 })}
                                                        {scoreCell(<ScoreSignal score={score} riskMode={isRisk} isDark={gaugePaletteDark} />, {
                                                            width: "38%",
                                                            minWidth: 0,
                                                            fontWeight: 500,
                                                            whiteSpace: "nowrap",
                                                        })}
                                                    </tr>
                                                ))}
                                                <tr className="bg-darkGrey">
                                                    {scoreCell("Net Score", {
                                                        width: "38%",
                                                        fontWeight: 500,
                                                        textAlign: "left",
                                                    })}
                                                    {scoreCell(formatScore(displayPair.netScore), { width: "24%", fontWeight: 500 })}
                                                    {scoreCell(
                                                        <NetScoreSignal
                                                            netBias={displayPair.netBias}
                                                            netScore={displayPair.netScore}
                                                            isDark={gaugePaletteDark}
                                                        />,
                                                        {
                                                            width: "38%",
                                                            minWidth: 0,
                                                            fontWeight: 500,
                                                            whiteSpace: "nowrap",
                                                        },
                                                    )}
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-2">
                                            <FxCurrencyStanceBlock legs={displayPair.currencyLegStances} isDark={gaugePaletteDark} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fxAnalyzerPro__fundamentalsPanel}>
                                <PrimaryCard>
                                    <div className="grid grid-cols-2 gap-4 pb-2">
                                        <PositionCard title="Non comm Positions" pair={displayPair.pair} dataKey="nonCommercial" base={displayPair.cotPositions} quote={displayPair.quoteCurrencyCotPositions} />
                                        <PositionCard title="Comm Positions" pair={displayPair.pair} dataKey="commercial" base={displayPair.cotPositions} quote={displayPair.quoteCurrencyCotPositions} />
                                    </div>

                                    <div className="mt-5">
                                        <div className="relative mb-2.5 flex items-center justify-center text-[16px] font-medium text-foreground/85">
                                            {displayPair.retailPositions ? (
                                                <>
                                                    <span className="absolute left-0.5 text-[14px] font-medium text-foreground">{displayPair.retailPositions.short ?? "N/A"}%</span>
                                                    <span className="text-foreground">Retail Positions</span>
                                                    <span className="absolute right-0.5 text-[14px] font-medium text-foreground">{displayPair.retailPositions.long ?? "N/A"}%</span>
                                                </>
                                            ) : (
                                                <span className="text-foreground">Retail Positions</span>
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <div className="relative flex h-[8px] w-full overflow-visible rounded-full">
                                                <div className="relative flex h-full w-full overflow-hidden rounded-full bg-stroke">
                                                    <div style={{ width: `${clampPercent(displayPair.retailPositions?.short)}%`, height: "100%", background: shortDarkBgColor }} />
                                                    <div style={{ width: `${clampPercent(displayPair.retailPositions?.long)}%`, height: "100%", background: longDarkBgColor }} />
                                                </div>
                                                {displayPair.retailPositions?.short != null ? (
                                                    <div className="absolute top-1/2 z-10 h-[13px] w-[13px] -translate-y-1/2 rounded-full border-2 border-darkGrey bg-foreground" style={{ left: `calc(${clampPercent(displayPair.retailPositions.short)}% - 6px)` }} />
                                                ) : null}
                                            </div>
                                            <div className="mt-4 flex justify-between text-[16px] font-medium">
                                                <span style={{ color: shortDarkBgColor }}>Short</span>
                                                <span style={{ color: longDarkBgColor }}>Long</span>
                                            </div>
                                        </div>
                                    </div>
                                </PrimaryCard>

                                <PrimaryCard>
                                    <div className="mb-5 text-left text-[28px] font-bold leading-tight text-foreground">Currency Strength Index</div>
                                    {[extractBaseCurrency(displayPair.pair), extractQuoteCurrency(displayPair.pair)].filter(Boolean).map((currency, i) => {
                                        const rawScore = displayPair.currencyStrengths[currency as string] ?? null;
                                        const { fillPercent, color } = getCurrencyStrengthStyle(rawScore);
                                        return (
                                            <div key={`${currency}-${i}`} className={i === 0 ? "mb-5" : ""}>
                                                <div className="mb-2 flex items-center justify-between text-[16px] font-medium">
                                                    <span className="text-foreground">{currency}</span>
                                                    <span
                                                        className={
                                                            rawScore === null || Number.isNaN(rawScore) || rawScore === 0
                                                                ? "text-foreground"
                                                                : undefined
                                                        }
                                                        style={
                                                            rawScore !== null && Number.isFinite(rawScore) && rawScore < 0
                                                                ? { color: shortDarkBgColor }
                                                                : rawScore !== null && Number.isFinite(rawScore) && rawScore > 0
                                                                  ? { color: longDarkBgColor }
                                                                  : undefined
                                                        }
                                                    >
                                                        {rawScore ?? "N/A"}
                                                    </span>
                                                </div>
                                                <div className="relative h-[8px] w-full overflow-hidden rounded-full bg-currencyStrengthIndexBackground">
                                                    {fillPercent > 0 ? <div className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-300" style={{ width: `${fillPercent}%`, background: color }} /> : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </PrimaryCard>

                                <TechnicalLevelsPreview levels={displayPair.technicalLevels} />
                                <TechnicalTrendsPreview rows={displayPair.technicalTrends} isDark={gaugePaletteDark} />
                            </div>
                        </>
                    ) : (
                        <div className={styles.fxAnalyzerPro__sentimentPanel}>
                            <div className="p-12 text-center text-[15px] text-foreground/70">Select a currency pair to view analysis</div>
                        </div>
                    )}
                </div>
            </div>

            {isAdmin ? (
                <section className={`mt-6 space-y-6 ${styles.fxAnalyzerPro__dynamicTables}`}>
                    {FX_ANALYZER_TABLES.map((tableConfig) => (
                        <section key={tableConfig.identifier} className="overflow-hidden rounded-xl bg-darkGrey">
                            <DynamicTableDisplay
                                tableIdentifier={tableConfig.identifier}
                                refreshTrigger={refreshTrigger}
                                initialTable={tables[tableConfig.identifier]}
                            />
                        </section>
                    ))}
                </section>
            ) : null}
        </Container>
    );
}

function PositionCard({
    title,
    pair,
    dataKey,
    base,
    quote,
}: {
    title: string;
    pair: string;
    dataKey: "nonCommercial" | "commercial";
    base: COTPositionData | null;
    quote: COTPositionData | null;
}) {
    const quoteCurrency = extractQuoteCurrency(pair);
    return (
        <div className="overflow-visible rounded-xl bg-darkGrey px-1">
            <div className="mb-3 text-center text-[15px] font-semibold text-foreground">{title}</div>
            <div className="grid gap-4">
                <PositionBar currency={extractBaseCurrency(pair)} data={base?.[dataKey] ?? null} />
                {quoteCurrency ? <PositionBar currency={quoteCurrency} data={quote?.[dataKey] ?? null} /> : null}
            </div>
        </div>
    );
}

function PositionBar({ currency, data }: { currency: string; data: { long: number | null; short: number | null } | null }) {
    const shortValue = clampPercent(data?.short);
    const longValue = clampPercent(data?.long);
    return (
        <div className="flex items-center gap-2 pr-1">
            <div className="w-[34px] shrink-0 text-[15px] font-semibold text-foreground">{currency}</div>
            <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-foreground">
                    <span>{data?.short ?? "N/A"}%</span>
                    <span>{data?.long ?? "N/A"}%</span>
                </div>
                <div className="flex h-[8px] w-full overflow-hidden rounded-full bg-inputBg">
                    <div style={{ width: `${shortValue}%`, height: "100%", background: shortDarkBgColor }} />
                    <div style={{ width: `${longValue}%`, height: "100%", background: longDarkBgColor }} />
                </div>
                <div className="mt-1 flex justify-between text-[12px] font-semibold">
                    <span className="min-w-[44px]" style={{ color: shortDarkBgColor }}>Short</span>
                    <span className="min-w-[44px] text-right" style={{ color: longDarkBgColor }}>Long</span>
                </div>
            </div>
        </div>
    );
}

function TechnicalTrendsPreview({ rows, isDark }: { rows: TechnicalTrendData[]; isDark: boolean }) {
    const fallback = [
        { timeFrame: "1H", trend: "N/A", momentum: "N/A", volatility: "N/A" },
        { timeFrame: "4H", trend: "N/A", momentum: "N/A", volatility: "N/A" },
        { timeFrame: "Daily", trend: "N/A", momentum: "N/A", volatility: "N/A" },
    ];

    return (
        <div className="overflow-hidden rounded-xl bg-darkGrey pb-0 pt-4">
            <div className="px-3 pb-3 text-center text-[18px] font-bold leading-none text-foreground">Technical Trends</div>
            <table
                className={`m-0 w-full table-fixed border-collapse border-spacing-0 p-0 text-[14px] text-foreground [&_tbody]:m-0 [&_tbody]:p-0 [&_thead]:m-0 [&_thead]:p-0 [&_tr]:m-0 [&_tr]:p-0 ${styles.fxAnalyzerDataTable}`}
                style={{ borderCollapse: "collapse", borderSpacing: 0 }}
            >
                <thead>
                    <tr className="m-0 bg-darkGrey p-0">
                        {["Trade Frame", "Trend", "Momentum", "Volatility"].map((h) => (
                            <th key={h} className="m-0 px-3 py-3 text-center text-[14px] font-semibold text-foreground">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(rows.length ? rows : fallback).map((r) => (
                        <tr key={r.timeFrame} className="m-0 bg-darkGrey p-0">
                            {[r.timeFrame, r.trend, r.momentum, r.volatility].map((value, index) => {
                                const zoneColor = index > 0 ? fxAnalyzerLabelZoneColor(value, isDark) : undefined;
                                return (
                                    <td
                                        key={`${r.timeFrame}-${index}`}
                                        className="m-0 px-3 py-3 text-center text-[14px] text-foreground"
                                        style={{
                                            color: zoneColor,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {value}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TechnicalLevelsPreview({ levels }: { levels: TechnicalLevelsData | null }) {
    const rows = levels
        ? [
            ["Current Price", levels.currentPrice || "N/A", "Pivot Level", levels.pivot || "N/A"],
            ["S1", levels.s1 || "N/A", "R1", levels.r1 || "N/A"],
            ["S2", levels.s2 || "N/A", "R2", levels.r2 || "N/A"],
            ["S3", levels.s3 || "N/A", "R3", levels.r3 || "N/A"],
        ]
        : [
            ["Current Price", "N/A", "Pivot Level", "N/A"],
            ["S1", "N/A", "R1", "N/A"],
            ["S2", "N/A", "R2", "N/A"],
            ["S3", "N/A", "R3", "N/A"],
        ];

    return (
        <div className="overflow-hidden rounded-xl bg-darkGrey pb-0 pt-4">
            <div className="px-3 pb-3 text-center text-[18px] font-bold leading-none text-foreground">Technical Levels</div>
            <table
                className={`m-0 w-full table-fixed border-collapse border-spacing-0 p-0 text-[14px] text-foreground [&_tbody]:m-0 [&_tbody]:p-0 [&_tr]:m-0 [&_tr]:p-0 ${styles.fxAnalyzerDataTable}`}
                style={{ borderCollapse: "collapse", borderSpacing: 0 }}
            >
                <tbody>
                    {rows.map((row) => (
                        <tr key={`${row[0]}-${row[2]}`} className="m-0 bg-darkGrey p-0">
                            <td className="m-0 w-1/4 px-4 py-3 text-center font-semibold text-foreground">{row[0]}</td>
                            <td className="m-0 w-1/4 px-4 py-3 text-center font-semibold text-foreground">{row[1]}</td>
                            <td className="m-0 w-1/4 px-4 py-3 text-center font-semibold text-foreground">{row[2]}</td>
                            <td className="m-0 w-1/4 px-4 py-3 text-center font-semibold text-foreground">{row[3]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
