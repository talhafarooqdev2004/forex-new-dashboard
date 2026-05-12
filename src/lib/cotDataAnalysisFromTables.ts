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

/**
 * Currency Pair Sentiment: 2nd-to-last column = name, last column = numeric sentiment.
 */
export function buildCurrencyPairSentimentLists(table: DynamicTable): {
    bullish: CotSentimentSideRow[];
    bearish: CotSentimentSideRow[];
} {
    const columns = getSortedColumns(table);
    if (columns.length < 2) {
        return { bullish: [], bearish: [] };
    }

    const nameColumn = columns[columns.length - 2];
    const valueColumn = columns[columns.length - 1];

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
    rank: number;
    currency: string;
    positionDisplay: string;
    prevDisplay: string;
    sentiment: "Bullish" | "Bearish";
};

/** Format net position for table cells (values assumed in contract “K” units like the legacy mock). */
function formatOutlookContractsK(n: number): string {
    const rounded = Math.round(n);
    if (rounded === 0) return "0K";
    const sign = rounded > 0 ? "+" : "-";
    return `${sign}${Math.abs(rounded)}K`;
}

/**
 * COT Raw Data — Current Forex Positioning (sorted by `column_index`):
 *
 * **6+ columns:**
 * - **Position** = col2 − col4 (indices `1` and `3`).
 * - **Prev** from col6 (index `5`): if that score is **negative**, `Prev = Position + col6`; if **positive**,
 *   `Prev = Position − col6`; if zero or empty, `Prev = Position` (or col6 omitted → `Prev = Position`).
 *
 * **5 columns:** **Position** = col2 − col4; **Prev** = col5 − col3 (same rule as before when col5 present; else Position − col3).
 *
 * **Legacy 3 columns:** col2 = position; **Prev** = `position − col3`.
 *
 * Rows with net position 0 are omitted. Sentiment from sign of net position.
 */
export function buildForexPositioningFromCotRawTable(table: DynamicTable): ForexPositioningRow[] {
    const columns = getSortedColumns(table);
    if (columns.length < 3) {
        return [];
    }

    const currencyCol = columns[0];
    const positionCol = columns[1];
    const prevInputCol = columns[2];
    const legacyMode = columns.length < 5;
    const sixthColMode = columns.length >= 6;
    const subtractCol = legacyMode ? null : columns[3];
    /** Used only when there are exactly five data columns (no 6th-col Prev rule). */
    const prevBaseCol = !legacyMode && !sixthColMode ? columns[4] : null;
    const sixthAdjCol = sixthColMode ? columns[5] : null;

    const out: ForexPositioningRow[] = [];
    let rank = 0;

    for (const row of getSortedRows(table)) {
        const currency = extractCellValue(row, currencyCol.id);
        if (!currency?.trim()) continue;

        const positionRaw = extractCellValue(row, positionCol.id);
        const prevInputRaw = extractCellValue(row, prevInputCol.id);
        const prevInput = parseNumericValue(prevInputRaw);

        let current: number | null;
        if (legacyMode) {
            current = parseNumericValue(positionRaw);
        } else {
            const v2 = parseNumericValue(positionRaw);
            const v4 = parseNumericValue(extractCellValue(row, subtractCol!.id));
            if (v2 === null && v4 === null) continue;
            current = (v2 ?? 0) - (v4 ?? 0);
        }

        if (current === null || current === 0) continue;

        let prevComputed: number;
        if (legacyMode) {
            prevComputed = prevInput === null ? current : current - prevInput;
        } else if (sixthColMode) {
            const c6 = parseNumericValue(extractCellValue(row, sixthAdjCol!.id));
            if (c6 === null) {
                prevComputed = current;
            } else if (c6 < 0) {
                prevComputed = current + c6;
            } else if (c6 > 0) {
                prevComputed = current - c6;
            } else {
                prevComputed = current;
            }
        } else {
            const prevBase = parseNumericValue(extractCellValue(row, prevBaseCol!.id));
            if (prevBase !== null) {
                prevComputed = prevInput === null ? prevBase : prevBase - prevInput;
            } else {
                prevComputed = prevInput === null ? current : current - prevInput;
            }
        }

        rank += 1;
        out.push({
            rank,
            currency: currency.trim().toUpperCase(),
            positionDisplay: formatOutlookContractsK(current),
            prevDisplay: formatOutlookContractsK(prevComputed),
            sentiment: current > 0 ? "Bullish" : "Bearish",
        });
    }

    return out;
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
