import type { DynamicTable, TableColumn, TableRow } from "@/services/dynamicTable.service";

export type CotSentimentSideRow = {
    currency: string;
    /** Formatted for display, e.g. +12, -123 */
    valueDisplay: string;
    numericValue: number;
};

export type CotPairBiasRow = {
    pair: string;
    score: number;
    /** Bullish | Bearish | Neutral for BiasIcon and pill */
    bias: string;
};

const EXCLUDED_COT_ASSETS = new Set(
    [
        "gold",
        "crude oil",
        "silver",
        "nasdaq 100",
        "natural gas",
        "wheat srw",
        "corn",
        "cotton",
        "sugar",
    ].map((s) => s.toLowerCase()),
);

function getSortedColumns(table: DynamicTable): TableColumn[] {
    return [...(table.columns ?? [])].sort((a, b) => a.column_index - b.column_index);
}

function getSortedRows(table: DynamicTable): TableRow[] {
    return [...(table.rows ?? [])].sort((a, b) => a.row_index - b.row_index);
}

function extractCellValue(row: TableRow, columnId: number): string | null {
    const cell = row.cells?.find((item) => item.table_column_id === columnId);
    return cell?.value?.toString().trim() ?? null;
}

function parseNumericValue(value: string | null | undefined): number | null {
    if (!value) return null;
    const numeric = Number.parseFloat(value.toString().replace(/[,%Kk]/g, "").trim());
    return Number.isFinite(numeric) ? numeric : null;
}

function normalizeAssetLabel(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function isExcludedCotAsset(name: string): boolean {
    return EXCLUDED_COT_ASSETS.has(normalizeAssetLabel(name));
}

function formatSignedValue(n: number): string {
    if (n > 0) return `+${n}`;
    return String(n);
}

/** Currency / asset label — 5th column from the end (sheet col Z when `T1:AA18` + `AB` + `AF` + `AG`). */
export function resolveCurrencyPairSentimentSymbolColumn(columns: TableColumn[]): TableColumn | null {
    if (columns.length < 5) return null;
    return columns[columns.length - 5] ?? null;
}

/** Numeric change score (sheet col AA) — 4th from end; was the last column before AB/AF/AG were appended. */
export function resolveCurrencyPairSentimentScoreColumn(columns: TableColumn[]): TableColumn | null {
    if (columns.length >= 5) {
        return columns[columns.length - 4] ?? null;
    }
    if (columns.length >= 1) {
        return columns[columns.length - 1] ?? null;
    }
    return null;
}

/** Weekly change % (COT bar chart) — always first column in merged grid (sheet position change %). */
export function resolveCurrencyPairSentimentWeeklyChangeColumn(columns: TableColumn[]): TableColumn | null {
    if (columns.length < 1) return null;
    return columns[0] ?? null;
}

/** Current column (sheet col AB) — 3rd from end. */
export function resolveCurrencyPairSentimentCurrentColumn(columns: TableColumn[]): TableColumn | null {
    if (columns.length >= 5) {
        return columns[columns.length - 3] ?? null;
    }
    if (columns.length >= 1) {
        return columns[0] ?? null;
    }
    return null;
}

/** Column map for merged `T1:AA18` + `AB` + `AF` + `AG` (and legacy 3+ col tables). */
export function getCurrencyPairSentimentColumnMap(columns: TableColumn[]): {
    symbol: TableColumn;
    changeInNcomm: TableColumn;
    positionChangePct: TableColumn;
} | null {
    if (columns.length >= 5) {
        const symbol = columns[columns.length - 5];
        const changeInNcomm = columns[columns.length - 4];
        const positionChangePct = columns[columns.length - 3];
        if (!symbol || !changeInNcomm || !positionChangePct) return null;
        return { symbol, changeInNcomm, positionChangePct };
    }
    if (columns.length >= 3) {
        const symbol = columns[columns.length - 2];
        const changeInNcomm = columns[columns.length - 1];
        const positionChangePct = columns[0];
        if (!symbol || !changeInNcomm || !positionChangePct) return null;
        return { symbol, changeInNcomm, positionChangePct };
    }
    return null;
}

/**
 * Currency Pair Sentiment → top bullish / bearish: name = 5th-to-last; score = 4th-to-last (Change Position).
 */
export function buildCurrencyPairSentimentLists(table: DynamicTable): {
    bullish: CotSentimentSideRow[];
    bearish: CotSentimentSideRow[];
} {
    const columns = getSortedColumns(table);
    if (columns.length < 2) {
        return { bullish: [], bearish: [] };
    }

    const nameColumn = resolveCurrencyPairSentimentSymbolColumn(columns);
    const valueColumn = resolveCurrencyPairSentimentScoreColumn(columns);
    if (!nameColumn || !valueColumn) {
        return { bullish: [], bearish: [] };
    }

    const bullishCandidates: CotSentimentSideRow[] = [];
    const bearishCandidates: CotSentimentSideRow[] = [];

    for (const row of getSortedRows(table)) {
        const name = extractCellValue(row, nameColumn.id);
        const rawValue = extractCellValue(row, valueColumn.id);
        if (!name || isExcludedCotAsset(name)) continue;

        const numericValue = parseNumericValue(rawValue);
        if (numericValue === null || numericValue === 0) continue;

        const entry: CotSentimentSideRow = {
            currency: name.trim().toUpperCase(),
            numericValue,
            valueDisplay: formatSignedValue(numericValue),
        };

        if (numericValue > 0) {
            bullishCandidates.push(entry);
        } else {
            bearishCandidates.push(entry);
        }
    }

    const byScoreDescThenName = (a: CotSentimentSideRow, b: CotSentimentSideRow) => {
        if (b.numericValue !== a.numericValue) {
            return b.numericValue - a.numericValue;
        }
        return a.currency.localeCompare(b.currency);
    };

    const byScoreAscThenName = (a: CotSentimentSideRow, b: CotSentimentSideRow) => {
        if (a.numericValue !== b.numericValue) {
            return a.numericValue - b.numericValue;
        }
        return a.currency.localeCompare(b.currency);
    };

    bullishCandidates.sort(byScoreDescThenName);
    bearishCandidates.sort(byScoreAscThenName);

    return {
        bullish: bullishCandidates.slice(0, 2),
        bearish: bearishCandidates.slice(0, 2),
    };
}

function normalizeBiasLabel(raw: string): "Bullish" | "Bearish" | "Neutral" {
    const t = raw.trim().toLowerCase();
    if (t.includes("bull")) return "Bullish";
    if (t.includes("bear")) return "Bearish";
    return "Neutral";
}

/**
 * COT Sentiment & Net Score: col 0 = pair, 1 = score, 2 = bias. Signal icon follows bias (BiasIcon).
 */
export function buildPairBiasRowsFromCotTable(table: DynamicTable): CotPairBiasRow[] {
    const columns = getSortedColumns(table);
    if (columns.length < 3) {
        return [];
    }

    const pairCol = columns[0];
    const scoreCol = columns[1];
    const biasCol = columns[2];

    const rows: CotPairBiasRow[] = [];

    for (const row of getSortedRows(table)) {
        const pairRaw = extractCellValue(row, pairCol.id);
        const scoreRaw = extractCellValue(row, scoreCol.id);
        const biasRaw = extractCellValue(row, biasCol.id);
        if (!pairRaw) continue;

        const score = parseNumericValue(scoreRaw);
        if (score === null) continue;

        rows.push({
            pair: pairRaw.trim().toUpperCase(),
            score,
            bias: biasRaw ? normalizeBiasLabel(biasRaw) : "Neutral",
        });
    }

    rows.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.pair.localeCompare(b.pair);
    });

    return rows;
}

export type ForexPositioningRow = {
    symbol: string;
    previousDisplay: string;
    currentDisplay: string;
    changePositionDisplay: string;
    sentiment: "Bullish" | "Bearish" | "Neutral";
};

function formatOutlookCellDisplay(raw: string | null | undefined): string {
    const s = raw?.trim();
    return s && s.length > 0 ? s : "—";
}

/**
 * Currency Pair Sentiment → Current Forex Positioning:
 * - **Symbols** = 5th-to-last column (currency name)
 * - **Change Position** = 4th-to-last column
 * - **Current** = 3rd-to-last column
 * - **Previous** = 2nd-to-last column
 * - **Sentiment** = last column (Bullish / Bearish / Neutral label)
 */
export function buildForexPositioningFromCurrencyPairSentimentTable(table: DynamicTable): ForexPositioningRow[] {
    const columns = getSortedColumns(table);
    if (columns.length < 5) {
        return [];
    }

    const symbolCol = resolveCurrencyPairSentimentSymbolColumn(columns);
    if (!symbolCol) return [];

    const changeCol = columns[columns.length - 4]!;
    const currentCol = columns[columns.length - 3]!;
    const previousCol = columns[columns.length - 2]!;
    const sentimentCol = columns[columns.length - 1]!;

    const out: ForexPositioningRow[] = [];

    for (const row of getSortedRows(table)) {
        const symbol = extractCellValue(row, symbolCol.id);
        if (!symbol?.trim()) continue;

        const sentimentRaw = extractCellValue(row, sentimentCol.id);
        if (!sentimentRaw?.trim()) continue;

        out.push({
            symbol: symbol.trim().toUpperCase(),
            previousDisplay: formatOutlookCellDisplay(extractCellValue(row, previousCol.id)),
            currentDisplay: formatOutlookCellDisplay(extractCellValue(row, currentCol.id)),
            changePositionDisplay: formatOutlookCellDisplay(extractCellValue(row, changeCol.id)),
            sentiment: normalizeBiasLabel(sentimentRaw),
        });
    }

    return out;
}

/** @deprecated Use `buildForexPositioningFromCurrencyPairSentimentTable`. */
export function buildForexPositioningFromCotRawTable(table: DynamicTable): ForexPositioningRow[] {
    return buildForexPositioningFromCurrencyPairSentimentTable(table);
}

/** True when Google Sheets returned no usable value (empty, dash, em dash). */
export function isEmptyGoogleSheetCell(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "number") return !Number.isFinite(value);
    const s = String(value).trim();
    if (!s) return true;
    if (s.startsWith("#")) return true;
    return s === "-" || s === "—" || s === "--" || s === "N/A" || s === "#N/A";
}

/** Google Sheet tab for COT overall risk row (AC2 / AC3 = score, AD2 = bias). */
export const COT_OVERALL_SHEET_TAB = "RECENT COT DATA 4A" as const;
export const COT_OVERALL_RISK_SCORE_PRIMARY_CELL = "AC2" as const;
export const COT_OVERALL_RISK_SCORE_FALLBACK_CELL = "AC3" as const;
export const COT_OVERALL_RISK_BIAS_CELL = "AD2" as const;

/**
 * Parses raw risk score from `RECENT COT DATA 4A` AC column.
 * Supports signed decimals (e.g. `-0.8`, mapped on the gauge as **−2.5…+2.5**) and legacy 0–100 style (`62`, `62%`, `62,5`).
 */
export function parseCotOverallRiskScoreFromSheet(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (isEmptyGoogleSheetCell(value)) return 0;
    const s = String(value).trim();
    const normalized = s.replace(/\s/g, "").replace(/,/g, ".").replace(/%/g, "");
    const n = Number.parseFloat(normalized.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
}

const COT_RISK_DECIMAL_MIN = -2.5;
const COT_RISK_DECIMAL_MAX = 2.5;

/**
 * `RiskModeSheetGauge` expects 0–100. Sheet “risk score” decimals in **[-2.5, 2.5]**
 * map linearly: −2.5 → 0, 0 → 50, +2.5 → 100. Values outside that band are treated as legacy 0–100 and clamped.
 */
export function mapCotOverallRiskScoreToGauge0100(raw: number): number {
    if (!Number.isFinite(raw)) return 0;
    if (raw >= COT_RISK_DECIMAL_MIN && raw <= COT_RISK_DECIMAL_MAX) {
        const t = Math.max(COT_RISK_DECIMAL_MIN, Math.min(COT_RISK_DECIMAL_MAX, raw));
        const u = (t / COT_RISK_DECIMAL_MAX) * 50 + 50;
        return Math.round(Math.max(0, Math.min(100, u)));
    }
    return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Human-readable score next to the gauge (matches sheet for signed decimals). */
export function formatCotOverallRiskScoreDisplay(raw: number): string {
    if (!Number.isFinite(raw)) return "0";
    if (raw >= COT_RISK_DECIMAL_MIN && raw <= COT_RISK_DECIMAL_MAX) {
        const rounded1 = Math.round(raw * 10) / 10;
        const s = rounded1.toFixed(1);
        if (s.endsWith(".0")) return String(Math.round(rounded1));
        return s;
    }
    return String(Math.round(Math.max(0, Math.min(100, raw))));
}

/** Prefer AC2; if empty, use AC3 (e.g. label on row 2 and value on row 3). */
export function resolveCotOverallRiskScoreCells(primary: unknown, fallback: unknown): number {
    if (!isEmptyGoogleSheetCell(primary)) {
        return parseCotOverallRiskScoreFromSheet(primary);
    }
    return parseCotOverallRiskScoreFromSheet(fallback);
}
