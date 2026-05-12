import type { DynamicTable, TableColumn, TableRow } from "@/services/dynamicTable.service";

/** Sorted by `column_index`; falls back to inferring columns from row cells (same as Edge tools). */
export function getSortedColumns(table: DynamicTable): TableColumn[] {
    const explicit = [...(table.columns ?? [])];
    if (explicit.length > 0) return explicit.sort((a, b) => a.column_index - b.column_index);

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

export function getSortedRows(table: DynamicTable): TableRow[] {
    return [...(table.rows ?? [])].sort((a, b) => a.row_index - b.row_index);
}

export function getCellValue(row: TableRow, columnId: number): string | null {
    const cell = row.cells?.find((item) => item.table_column_id === columnId);
    return cell?.value?.toString().trim() ?? null;
}

/** Same as `SeasonalTrendsClientPage` — allows commas/percent in sheet values. */
function parseNumericValueSeasonal(value: string | null | undefined): number | null {
    if (!value) return null;
    const numeric = Number.parseFloat(value.toString().replace(/[,%]/g, "").trim());
    return Number.isFinite(numeric) ? numeric : null;
}

/** Same as `EdgeToolsAlertsClientPage` `parseNumericValue`. */
function parseNumericValueEdge(value: string | null | undefined): number | null {
    if (!value) return null;
    const normalized = value
        .toString()
        .replace(/\u2212/g, "-")
        .replace(/\u00a0/g, "")
        .trim();
    const parsed = Number.parseFloat(normalized.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
}

export type PairHeatmapRow = { pair: string; value: number };

/** Same three-block order as `buildSeasonalPairs` in `SeasonalTrendsClientPage.tsx`. */
export function orderedPairRowsLikeSeasonal<T extends { pair: string; value: number }>(items: T[]): T[] {
    const positive = items
        .filter((item) => item.value > 0)
        .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.pair.localeCompare(b.pair)));
    const neutral = items.filter((item) => item.value === 0);
    const negative = items
        .filter((item) => item.value < 0)
        .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.pair.localeCompare(b.pair)));
    return [...positive, ...neutral, ...negative];
}

/** @deprecated Use {@link PairHeatmapRow} */
export type ScoreDashboardHeatmapItem = PairHeatmapRow;

/**
 * Score Dashboard (Sheet76): **first column** = currency pair, **second column** = net score (may be negative).
 * **Sort** uses {@link orderedPairRowsLikeSeasonal} (same rules as `buildSeasonalPairs` on the Seasonal page).
 * Tile colors on the Technical Dashboard use the same **seasonal OKLCH gradient + grid min/max normalization** as
 * “Pair Seasonal Trends & Bias” (`HeatMap` `scoreScale="seasonal"` + `seasonalDisplayRange`).
 */
export function buildScoreDashboardPairHeatmapItems(table: DynamicTable | null): PairHeatmapRow[] {
    if (!table?.rows?.length) return [];

    const sortedColumns = getSortedColumns(table);
    const firstColumn = sortedColumns[0];
    const secondColumn = sortedColumns[1];
    if (!firstColumn || !secondColumn) return [];

    const rawRows: { pair: string; value: number }[] = [];
    for (const row of getSortedRows(table)) {
        const pair = getCellValue(row, firstColumn.id);
        const raw = parseNumericValueSeasonal(getCellValue(row, secondColumn.id));
        if (!pair || raw === null) continue;
        rawRows.push({ pair: pair.toUpperCase(), value: raw });
    }

    if (rawRows.length === 0) return [];

    return orderedPairRowsLikeSeasonal(rawRows);
}

/**
 * Display order for Currency Strength lists:
 * - **Greens:** strongest positive first → visually **top row** with the **widest** green bar (**furthest right** in the track).
 * - **Zeros:** middle.
 * - **Reds:** weakest (closest to zero) first → **largest red bar last** at the bottom.
 */
export function orderedCurrencyStrengthRows<T extends { currency: string; value: number }>(items: T[]): T[] {
    const positive = items
        .filter((item) => item.value > 0)
        .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.currency.localeCompare(b.currency)));
    const neutral = items
        .filter((item) => item.value === 0)
        .sort((a, b) => a.currency.localeCompare(b.currency));
    const negative = items
        .filter((item) => item.value < 0)
        .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.currency.localeCompare(b.currency)));
    return [...positive, ...neutral, ...negative];
}

/**
 * Maps **`edge_currency_strength_index`**: first column = currency label, last column = score, clamped **[-10, 10]**.
 * Row order: {@link orderedCurrencyStrengthRows}.
 */
export function buildCurrencyStrengthRows(table: DynamicTable | null): Array<{ currency: string; value: number }> {
    if (!table?.rows?.length) return [];

    const sortedColumns = getSortedColumns(table);
    const firstColumn = sortedColumns[0];
    const lastColumn = sortedColumns[sortedColumns.length - 1];
    if (!firstColumn || !lastColumn) return [];

    const rows = getSortedRows(table)
        .map((row) => {
            const currency = getCellValue(row, firstColumn.id);
            const value = parseNumericValueEdge(getCellValue(row, lastColumn.id));
            if (!currency || value === null) return null;
            return {
                currency,
                value: Math.max(-10, Math.min(10, value)),
            };
        })
        .filter((item): item is { currency: string; value: number } => item !== null);

    return orderedCurrencyStrengthRows(rows);
}
