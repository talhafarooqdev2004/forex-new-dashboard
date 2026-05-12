const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5005";
const TABLE_EDITOR_ENDPOINT = `${API_BASE_URL.replace(/\/$/, "")}/api/v1/admin/table-editor`;

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

class GoogleSheetsService {
    async updateCell(tableId: string, cell: string, value: string | number): Promise<{ cell: string; value: any }> {
        const response = await fetch(`${TABLE_EDITOR_ENDPOINT}/update-cell`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tableId, cell, value }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update cell: ${response.statusText}`);
        }

        const result: ApiResponse<{ cell: string; value: any }> = await response.json();
        if (!result.success) {
            throw new Error(result.message || "Failed to update cell");
        }

        return result.data;
    }

    async batchUpdateCells(
        tableId: string,
        updates: Array<{ cell: string; value: string | number }>
    ): Promise<{ updatedCells: number; updates: Array<{ cell: string; value: any }> }> {
        const response = await fetch(`${TABLE_EDITOR_ENDPOINT}/batch-update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tableId, updates }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to batch update: ${response.statusText}`);
        }

        const result: ApiResponse<{
            updatedCells: number;
            updates: Array<{ cell: string; value: any }>;
        }> = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Failed to batch update");
        }

        return result.data;
    }

    async getCell(tableId: string, cell: string): Promise<any> {
        const response = await fetch(
            `${TABLE_EDITOR_ENDPOINT}/cell?tableId=${encodeURIComponent(tableId)}&cell=${encodeURIComponent(cell)}`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to get cell: ${response.statusText}`);
        }

        const result: ApiResponse<{ tableId: string; cell: string; value: any }> = await response.json();
        if (!result.success) {
            throw new Error(result.message || "Failed to get cell");
        }

        return result.data.value;
    }

    async getRange(tableId: string, range: string): Promise<any[][]> {
        const response = await fetch(
            `${TABLE_EDITOR_ENDPOINT}/range?tableId=${encodeURIComponent(tableId)}&range=${encodeURIComponent(range)}`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to get range: ${response.statusText}`);
        }

        const result: ApiResponse<{ tableId: string; range: string; values: any[][] }> = await response.json();
        if (!result.success) {
            throw new Error(result.message || "Failed to get range");
        }

        return result.data.values;
    }

    async syncTable(
        tableId: string,
        data: any[][],
        startCell: string = "A1"
    ): Promise<{ tableId: string; rowsSynced: number; calculatedData: any[][] }> {
        const response = await fetch(`${TABLE_EDITOR_ENDPOINT}/sync-table`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tableId, data, startCell }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to sync table: ${response.statusText}`);
        }

        const result: ApiResponse<{
            tableId: string;
            rowsSynced: number;
            calculatedData: any[][];
        }> = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Failed to sync table");
        }

        return result.data;
    }

    indexToCell(row: number, col: number, rowOffset: number = 0): string {
        return `${this.indexToColumn(col)}${row + 1 + rowOffset}`;
    }

    indexToColumn(index: number): string {
        let column = "";
        let temp = index + 1;

        while (temp > 0) {
            const remainder = (temp - 1) % 26;
            column = String.fromCharCode(65 + remainder) + column;
            temp = Math.floor((temp - 1) / 26);
        }

        return column;
    }
}

export const googleSheetsService = new GoogleSheetsService();
