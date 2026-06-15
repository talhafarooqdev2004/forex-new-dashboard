import type { DynamicTable, TableColumn, TableRow } from "@/services/dynamicTable.service";

/** Dynamic-table identifier that holds the live "Technical Levels" prices (same source as FX Analyzer Pro). */
export const TECHNICAL_LEVELS_TABLE_ID = "fx_technical_levels";

/** Zero-based column index that holds the current price in the Technical Levels table. */
const CURRENT_PRICE_COLUMN_INDEX = 1;

export function normalizePair(value: string | null | undefined): string {
    return String(value || "").toUpperCase().replace(/[^A-Z]/g, "");
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

export function parseNumericValue(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === "") return null;
    const numeric = Number.parseFloat(String(value).replace(/[,%]/g, "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
}

/** Builds a map of normalized pair -> current price from the Technical Levels table. */
export function buildPriceMap(table: DynamicTable | null): Record<string, number> {
    const map: Record<string, number> = {};
    const firstColumn = getSortedColumns(table)[0];
    if (!firstColumn) return map;

    for (const row of getSortedRows(table)) {
        const pair = normalizePair(getCellValue(row, firstColumn));
        if (pair.length < 6) continue;
        const price = parseNumericValue(getCellByColumnIndex(table, row, CURRENT_PRICE_COLUMN_INDEX));
        if (price !== null) map[pair] = price;
    }
    return map;
}

/** Quote currency = characters 3..6 of the (normalized) pair, e.g. EURUSD -> USD. */
function quoteCurrency(pair: string): string {
    const normalized = normalizePair(pair);
    return normalized.length >= 6 ? normalized.slice(3, 6) : "";
}

/** Standard pip size: 0.01 for JPY-quoted pairs, otherwise 0.0001. */
export function pipSize(pair: string): number {
    return quoteCurrency(pair) === "JPY" ? 0.01 : 0.0001;
}

/** Display precision: 3 decimals for JPY pairs, otherwise 5. */
export function priceDecimals(pair: string): number {
    return quoteCurrency(pair) === "JPY" ? 3 : 5;
}

export function formatPrice(value: number, pair: string): string {
    return value.toFixed(priceDecimals(pair));
}
