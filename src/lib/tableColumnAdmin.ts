import type { DynamicTable, TableColumn, TableRow } from "@/services/dynamicTable.service";

export function isColumnAdminOnly(column: TableColumn | undefined): boolean {
    if (!column?.column_metadata || typeof column.column_metadata !== "object") return false;
    return Boolean((column.column_metadata as Record<string, unknown>).admin_only);
}

/** Drops admin-only columns and matching cells for non-admin viewers (display only). */
export function filterDynamicTableForNonAdmin(table: DynamicTable, isAdmin: boolean): DynamicTable {
    if (isAdmin || !table.columns?.length) return table;
    const dropIds = new Set(table.columns.filter((c) => isColumnAdminOnly(c)).map((c) => c.id));
    if (dropIds.size === 0) return table;
    const columns = table.columns.filter((c) => !dropIds.has(c.id));
    const rows: TableRow[] | undefined = table.rows?.map((row) => ({
        ...row,
        cells: row.cells?.filter((cell) => !dropIds.has(cell.table_column_id)),
    }));
    return { ...table, columns, rows };
}
