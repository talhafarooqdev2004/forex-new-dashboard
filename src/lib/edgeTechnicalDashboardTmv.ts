import type { DynamicTable, TableColumn } from "@/services/dynamicTable.service";

import { getSortedColumns, getSortedRows, getCellValue } from "@/lib/technicalDashboardFromScoreSheet";
import { FX_TMV_SCORE_MAX, FX_TMV_SCORE_MIN } from "@/lib/fxTmvGaugeZones";

/** Same clamp as Edge TMV gauges (`EdgeToolsAlertsClientPage`). */
export const TMV_SCORE_MIN = FX_TMV_SCORE_MIN;
export const TMV_SCORE_MAX = FX_TMV_SCORE_MAX;

const TMV_EXCEL_COLS = {
    trend: "AH",
    momentum: "AI",
    volatility: "AJ",
} as const;

export type TmvMetric = keyof typeof TMV_EXCEL_COLS;

function parseNumeric(value: string | null | undefined): number | null {
    if (!value) return null;
    const parsed = Number.parseFloat(value.toString().replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
}

function excelColumnLettersToZeroBasedIndex(letters: string): number {
    let n = 0;
    for (const ch of letters.toUpperCase()) {
        n = n * 26 + (ch.charCodeAt(0) - 64);
    }
    return n - 1;
}

function getColumnByExcelZeroBasedIndex(table: DynamicTable, excelZeroBasedIndex: number): TableColumn | null {
    return getSortedColumns(table).find((c) => c.column_index === excelZeroBasedIndex) ?? null;
}

function sumColumnDividedBy28ForRows2to29(table: DynamicTable, column: TableColumn): number {
    const sortedRows = getSortedRows(table);
    const hasZeroBasedRows = sortedRows.some((r) => r.row_index === 0);
    const start = hasZeroBasedRows ? 0 : 1;
    const end = start + 27;
    const byIndex = sortedRows.filter((r) => r.row_index >= start && r.row_index <= end);
    const rowsToUse =
        byIndex.length === 28 ? [...byIndex].sort((a, b) => a.row_index - b.row_index) : sortedRows.slice(0, 28);

    let sum = 0;
    for (let i = 0; i < 28; i++) {
        const row = rowsToUse[i];
        if (!row) continue;
        const v = parseNumeric(getCellValue(row, column.id));
        sum += v !== null && !Number.isNaN(v) ? v : 0;
    }
    return sum / 28;
}

/**
 * Trend / Momentum / Volatility aggregate from **`edge_technical_dashboard`** (same columns as Edge Tools gauges).
 */
export function technicalDashboardTmvGaugeValue(table: DynamicTable | null, which: TmvMetric): number {
    if (!table?.rows?.length || !table.columns?.length) return 0;
    const letters = TMV_EXCEL_COLS[which];
    const col = getColumnByExcelZeroBasedIndex(table, excelColumnLettersToZeroBasedIndex(letters));
    if (!col) return 0;
    const raw = sumColumnDividedBy28ForRows2to29(table, col);
    return Math.max(TMV_SCORE_MIN, Math.min(TMV_SCORE_MAX, raw));
}

export function technicalDashboardTmvTriple(table: DynamicTable | null): {
    trend: number;
    momentum: number;
    volatility: number;
} {
    return {
        trend: technicalDashboardTmvGaugeValue(table, "trend"),
        momentum: technicalDashboardTmvGaugeValue(table, "momentum"),
        volatility: technicalDashboardTmvGaugeValue(table, "volatility"),
    };
}
