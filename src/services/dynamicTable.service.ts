import { apiConfig, fetchAPI } from "./api.config";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

export interface DynamicTable {
    id: number;
    name: string;
    identifier: string;
    description?: string;
    table_metadata?: Record<string, any>;
    is_active: boolean;
    rows?: TableRow[];
    columns?: TableColumn[];
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TableRow {
    id: number;
    dynamic_table_id: number;
    currency_pair_id?: number | null;
    row_index: number;
    row_metadata?: Record<string, any>;
    currency_pair?: CurrencyPair;
    cells?: TableCell[];
}

export interface TableColumn {
    id: number;
    dynamic_table_id: number;
    header: string;
    key?: string;
    column_index: number;
    column_metadata?: Record<string, any>;
}

export interface CellMetadata {
    bgColor?: string;
    textColor?: string;
    fontSize?: string;
    fontWeight?: string;
    borderColor?: string;
    padding?: string;
    textAlign?: "left" | "center" | "right";
    colspan?: number;
    width?: number | string;
    [key: string]: any;
}

export interface TableCell {
    id: number;
    table_row_id: number;
    table_column_id: number;
    value?: string | null;
    formula?: string | null;
    data_type: string;
    cell_metadata?: CellMetadata | null;
    column?: TableColumn;
}

export interface CurrencyPair {
    id: number;
    code: string;
    base_currency: string;
    quote_currency: string;
    is_active: boolean;
    display_order: number;
}

export interface TableStructurePayload {
    dynamic_table_id: number;
    rows: Array<{
        id?: number;
        row_index: number;
        currency_pair_id?: number;
        row_metadata?: Record<string, any>;
    }>;
    columns: Array<{
        id?: number;
        header: string;
        key?: string;
        column_index: number;
        column_metadata?: Record<string, any>;
    }>;
    cells: Array<{
        id?: number;
        table_row_id: number;
        table_column_id: number;
        row_index?: number;
        column_index?: number;
        value?: string;
        formula?: string;
        data_type?: string;
        cell_metadata?: CellMetadata;
    }>;
}

const handleTableNotFound = (error: unknown) => {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    return message.includes("404") || message.includes("not found");
};

export const dynamicTableService = {
    getTables: async (): Promise<ApiResponse<DynamicTable[]>> => {
        const result = await fetchAPI<ApiResponse<DynamicTable[]>>(apiConfig.endpoints.dynamicTables, {
            method: "GET",
        });
        return result as ApiResponse<DynamicTable[]>;
    },

    getTable: async (id: number): Promise<ApiResponse<DynamicTable>> => {
        const result = await fetchAPI<ApiResponse<DynamicTable>>(`${apiConfig.endpoints.dynamicTables}/${id}`, {
            method: "GET",
        });
        return result as ApiResponse<DynamicTable>;
    },

    getTableByIdentifier: async (identifier: string): Promise<ApiResponse<DynamicTable> | null> => {
        try {
            const result = await fetchAPI<ApiResponse<DynamicTable>>(`${apiConfig.endpoints.dynamicTables}/identifier/${identifier}`, {
                method: "GET",
            });
            return result;
        } catch (error) {
            if (handleTableNotFound(error)) {
                return null;
            }
            throw error;
        }
    },

    createTable: async (data: {
        name: string;
        identifier: string;
        description?: string;
        table_metadata?: Record<string, any>;
    }): Promise<ApiResponse<DynamicTable>> => {
        const result = await fetchAPI<ApiResponse<DynamicTable>>(apiConfig.endpoints.dynamicTables, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return result as ApiResponse<DynamicTable>;
    },

    updateTable: async (id: number, data: {
        name?: string;
        identifier?: string;
        description?: string;
        table_metadata?: Record<string, any>;
        is_active?: boolean;
    }): Promise<ApiResponse<DynamicTable>> => {
        const result = await fetchAPI<ApiResponse<DynamicTable>>(`${apiConfig.endpoints.dynamicTables}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        if (result === null) {
            return {
                success: true,
                message: "Table updated successfully",
                data: {} as DynamicTable,
            };
        }

        return result as ApiResponse<DynamicTable>;
    },

    deleteTable: async (id: number): Promise<void> => {
        await fetchAPI(`${apiConfig.endpoints.dynamicTables}/${id}`, {
            method: "DELETE",
        });
    },

    deleteTableByIdentifier: async (identifier: string): Promise<void> => {
        const tableResponse = await dynamicTableService.getTableByIdentifier(identifier);
        if (tableResponse?.data?.id) {
            await dynamicTableService.deleteTable(tableResponse.data.id);
            return;
        }

        throw new Error(`Table with identifier "${identifier}" not found`);
    },

    saveTableStructure: async (data: TableStructurePayload): Promise<ApiResponse<DynamicTable>> => {
        const result = await fetchAPI<ApiResponse<DynamicTable>>(apiConfig.endpoints.tableStructure, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
            },
            body: JSON.stringify(data),
            cache: "no-store",
        });
        return result as ApiResponse<DynamicTable>;
    },

    recalculateTable: async (id: number): Promise<ApiResponse<DynamicTable>> => {
        const result = await fetchAPI<ApiResponse<DynamicTable>>(`${apiConfig.endpoints.dynamicTables}/${id}/recalculate`, {
            method: "POST",
        });
        return result as ApiResponse<DynamicTable>;
    },
};
