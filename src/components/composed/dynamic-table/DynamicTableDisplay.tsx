"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/composed/base-table/TableParts";
import baseTableStyles from "@/components/composed/base-table/BaseTable.module.scss";
import { dynamicTableService, DynamicTable, CellMetadata } from '@/services/dynamicTable.service';
import { calculateFormula as calculateFormulaUtil } from '@/utils/formulaCalculator';
import { snapNearInteger } from './TableEditor/utils/tableUtils';
import BiasIcon from '@/components/composed/BiasIcon';
import { useAuth } from "@/components/providers/AuthProvider";
import { GAUGE_SIGNAL_COLORS } from '@/lib/gaugeSignalColors';
import { filterDynamicTableForNonAdmin } from "@/lib/tableColumnAdmin";

interface DynamicTableDisplayProps {
    tableIdentifier: string;
    refreshTrigger?: number; // Optional prop to trigger refresh
    currencyName?: string; // Currency name for currency fundamentals tables
    isCurrencyFundamental?: boolean; // Flag to apply currency fundamentals styling
    initialTable?: DynamicTable | null; // Optional initial table data to avoid loading state
    /** When false, currency fundamentals compact tables show numeric cells without inline trend SVGs. */
    showCurrencyFundamentalsCellTrendMarkers?: boolean;
}

interface CellData {
    value: string;
    formula?: string;
    metadata?: CellMetadata;
}

const TABLE_CELL_BG = 'var(--table-cell-bg, rgb(var(--dark-grey)))';
const TABLE_CELL_TEXT = 'var(--table-cell-text, #ffffff)';
const TABLE_CELL_BORDER = 'var(--table-cell-border, rgb(var(--charcoal)))';
const INLINE_ARROW_MARKERS_REGEX = /[\u2190-\u21FF\u27A1\u2B05\u2B06\u2B07\u25B2\u25BC\u25B6\u25C0\uFE0F\u{1F53A}\u{1F53B}]/gu;

/** Currency fundamentals read view: first column (factor + bias). */
const CURRENCY_FUNDAMENTALS_FIRST_COL_PADDING_LEFT = "16px";
/** First column width share (colgroup); remainder goes to value columns. */
const CURRENCY_FUNDAMENTALS_FIRST_COL_WIDTH_FRAC = 0.28;

function normalizeBiasValue(value: string): "Bullish" | "Bearish" | "Neutral" {
    const t = value.trim().toLowerCase();
    if (t.includes("bull")) return "Bullish";
    if (t.includes("bear")) return "Bearish";
    return "Neutral";
}

function getBiasBadgeStyle(bias: "Bullish" | "Bearish" | "Neutral"): React.CSSProperties {
    if (bias === "Bullish") return { backgroundColor: GAUGE_SIGNAL_COLORS.buy, color: "#ffffff" };
    if (bias === "Bearish") return { backgroundColor: GAUGE_SIGNAL_COLORS.sell, color: "#ffffff" };
    return { backgroundColor: GAUGE_SIGNAL_COLORS.neutral, color: "#000000" };
}

function sanitizeInlineMarkers(value: string): string {
    return value.replace(INLINE_ARROW_MARKERS_REGEX, '').replace(/\s+/g, ' ').trim();
}

/** Plain text for Net Bias (no emoji / icons from Sheets). */
function stripNetBiasSheetDecorations(value: string): string {
    if (!value) return '';
    return value
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/\uFE0F/g, '')
        .replace(/\u200D/g, '')
        .replace(INLINE_ARROW_MARKERS_REGEX, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseDisplayNumeric(value: string): number | null {
    const normalized = value.trim().replace(/,/g, '').replace(/%/g, '');
    if (!normalized) return null;
    const n = Number.parseFloat(normalized);
    return Number.isFinite(n) ? n : null;
}

function currencyFundamentalsTrendTriangleColor(
    value: number,
    rowBias: "Bullish" | "Bearish" | "Neutral",
): string {
    if (rowBias === "Neutral" || value === 0) return GAUGE_SIGNAL_COLORS.neutral;
    if (rowBias === "Bullish") return GAUGE_SIGNAL_COLORS.buy;
    return GAUGE_SIGNAL_COLORS.sell;
}

function renderCurrencyFundamentalsTrendTriangle(
    value: number,
    rowBias: "Bullish" | "Bearish" | "Neutral",
): React.ReactNode {
    const color = currencyFundamentalsTrendTriangleColor(value, rowBias);
    const rotate = value > 0 ? "rotate(180 4.5 4.5)" : undefined;
    return (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
                d="M8.18945 0L4.10156 8.18945L0 0H8.18945Z"
                fill={color}
                transform={rotate}
            />
        </svg>
    );
}

// Helper function to process initial table data and return initial state
function getInitialStateFromTable(
    initialTable: DynamicTable | null,
    tableIdentifier: string,
    isCurrencyFundamental: boolean
) {
    if (!initialTable || !initialTable.columns || initialTable.columns.length === 0) {
        return {
            table: null,
            rows: [],
            columns: [],
            cellStyles: {},
            columnWidths: {},
            borderStyle: 'spacing' as const,
            borderColor: TABLE_CELL_BORDER
        };
    }

    // Sort rows and columns
    const tableRowsData = initialTable.rows ? [...initialTable.rows].sort((a, b) => a.row_index - b.row_index) : [];
    const tableColsData = [...initialTable.columns].sort((a, b) => a.column_index - b.column_index);
    const isCurrencyFundamentalTable =
        isCurrencyFundamental ||
        tableIdentifier.startsWith('currency_fundamental_');

    // Build rows
    let tableRows: Array<{ id: string; currencyPairId?: number; cells: CellData[] }> = [];

    if (isCurrencyFundamentalTable) {
        const headerRow = {
            id: 'header-row',
            cells: tableColsData.map(() => ({
                value: '',
                metadata: {
                    bgColor: TABLE_CELL_BG,
                    textColor: TABLE_CELL_TEXT,
                    borderColor: TABLE_CELL_BORDER
                }
            }))
        };
        tableRows = [headerRow];
    }

    if (tableRowsData && tableRowsData.length > 0) {
        const tempRows: Array<{ id: string; currencyPairId?: number; cells: CellData[] }> = [];

        tableRowsData.forEach((row) => {
            const tempCells: CellData[] = tableColsData.map((col) => {
                const cell = row.cells?.find(c => c.table_column_id === col.id);
                let cellMetadata = cell?.cell_metadata || {};
                if (isCurrencyFundamentalTable && (!cellMetadata || Object.keys(cellMetadata).length === 0)) {
                    cellMetadata = {
                        bgColor: TABLE_CELL_BG,
                        textColor: TABLE_CELL_TEXT,
                        borderColor: TABLE_CELL_BORDER
                    };
                }

                return {
                    value: cell?.value || '',
                    formula: cell?.formula || undefined,
                    metadata: cellMetadata
                };
            });

            tempRows.push({
                id: `row-${row.id}`,
                currencyPairId: row.currency_pair_id || undefined,
                cells: tempCells
            });
        });

        tableRows = [...tableRows, ...tempRows];
    }

    const tableCols = tableColsData.map(col => ({
        id: `col-${col.id}`,
        header: col.header,
        key: col.key || undefined
    }));

    // Process styles
    const styles: Record<string, CellMetadata> = {};
    const existingColumnWidths: Record<number, number> = {};

    tableColsData.forEach((col, colIdx) => {
        if (col.column_metadata) {
            styles[`header-${colIdx}`] = col.column_metadata as CellMetadata;
            if (col.column_metadata.width) {
                const width = typeof col.column_metadata.width === 'number'
                    ? col.column_metadata.width
                    : parseFloat(String(col.column_metadata.width));
                if (!isNaN(width) && width > 0 && isFinite(width)) {
                    existingColumnWidths[colIdx] = width;
                }
            }
        }
    });

    const rowOffset = isCurrencyFundamentalTable ? 1 : 0;
    if (tableRowsData && tableRowsData.length > 0) {
        tableRowsData.forEach((row, rowIdx) => {
            tableColsData.forEach((col, colIdx) => {
                const cell = row.cells?.find(c => c.table_column_id === col.id);
                const displayRowIdx = rowIdx + rowOffset;
                if (cell?.cell_metadata) {
                    styles[`${displayRowIdx}-${colIdx}`] = cell.cell_metadata;
                } else if (isCurrencyFundamentalTable) {
                    styles[`${displayRowIdx}-${colIdx}`] = {
                        bgColor: TABLE_CELL_BG,
                        textColor: TABLE_CELL_TEXT,
                        borderColor: TABLE_CELL_BORDER
                    };
                }
            });
        });
    }

    if (isCurrencyFundamentalTable) {
        tableColsData.forEach((col, colIdx) => {
            styles[`0-${colIdx}`] = {
                bgColor: TABLE_CELL_BG,
                textColor: TABLE_CELL_TEXT,
                borderColor: TABLE_CELL_BORDER
            };
        });
    }

    const borderStyle = initialTable.table_metadata?.borderStyle || 'spacing';
    const borderColor = initialTable.table_metadata?.borderColor || TABLE_CELL_BORDER;
    const formulaStartRow = initialTable.table_metadata?.formulaStartRow || 1;

    return {
        table: initialTable,
        rows: tableRows,
        columns: tableCols,
        cellStyles: styles,
        columnWidths: existingColumnWidths,
        borderStyle: borderStyle as 'spacing' | 'simple',
        borderColor,
        formulaStartRow
    };
}

// Helper function to check if a column header matches the current month
function isCurrentMonthColumn(header: string): boolean {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); // 0-11
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Additional variations: "Sept" for September, "Aug" for August
    const monthVariations: Record<number, string[]> = {
        7: ['August', 'Aug', 'Aug.'], // August
        8: ['September', 'Sept', 'Sep', 'Sept.'] // September
    };

    const currentMonthName = monthNames[currentMonthIndex];
    const currentMonthAbbr = monthAbbreviations[currentMonthIndex];

    // Normalize header for comparison (case-insensitive, trim whitespace)
    const normalizedHeader = header?.trim().toLowerCase() || '';

    // Check exact matches
    const exactMatch =
        normalizedHeader === currentMonthName.toLowerCase() ||
        normalizedHeader === currentMonthAbbr.toLowerCase() ||
        normalizedHeader === currentMonthAbbr.toLowerCase() + '.';

    // Check variations if they exist
    const hasVariations = monthVariations[currentMonthIndex];
    const variationMatch = hasVariations
        ? hasVariations.some(variation =>
            normalizedHeader === variation.toLowerCase() ||
            normalizedHeader === variation.toLowerCase() + '.'
        )
        : false;

    return exactMatch || variationMatch;
}

export default function DynamicTableDisplay({
    tableIdentifier,
    refreshTrigger,
    currencyName,
    isCurrencyFundamental = false,
    initialTable = null,
    showCurrencyFundamentalsCellTrendMarkers = true,
}: DynamicTableDisplayProps) {
    const { isAdmin } = useAuth();
    const initialState = getInitialStateFromTable(
        initialTable ? filterDynamicTableForNonAdmin(initialTable, isAdmin) : null,
        tableIdentifier,
        isCurrencyFundamental,
    );

    const [table, setTable] = useState<DynamicTable | null>(initialState.table);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Array<{ id: string; currencyPairId?: number; cells: CellData[] }>>(initialState.rows);
    const [columns, setColumns] = useState<Array<{ id: string; header: string; key?: string }>>(initialState.columns);
    const [cellStyles, setCellStyles] = useState<Record<string, CellMetadata>>(initialState.cellStyles);
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>(initialState.columnWidths);
    const [borderStyle, setBorderStyle] = useState<'spacing' | 'simple'>(initialState.borderStyle);
    const [borderColor, setBorderColor] = useState(initialState.borderColor);
    const [formulaStartRow, setFormulaStartRow] = useState(initialState.formulaStartRow);
    const [globalAlignment, setGlobalAlignment] = useState<'left' | 'center' | 'right'>('center');

    /** Max rendered width of factor labels so bias badges align in `currency_fundamentals_*` tables. */
    const [currencyFundamentalsFactorTextMaxPx, setCurrencyFundamentalsFactorTextMaxPx] = useState(0);
    const currencyFundamentalsFactorMeasureRef = useRef<HTMLSpanElement | null>(null);
    const getCellDisplayValueRef = useRef<(rowIndex: number, colIndex: number) => string>((_r, _c) => "");

    // Check if this is the seasonal_trends table
    const isSeasonalTrendsTable = tableIdentifier === 'seasonal_trends';

    // Find the current month column index for seasonal trends table (recalculate when columns change)
    const currentMonthColumnIndex = useMemo(() => {
        if (!isSeasonalTrendsTable || columns.length === 0) return -1;
        return columns.findIndex((col, idx) => idx > 0 && isCurrentMonthColumn(col.header)); // Skip first column (currency pairs)
    }, [isSeasonalTrendsTable, columns]);

    // Process table data helper function
    const processTableData = (incoming: DynamicTable) => {
        const tableData = filterDynamicTableForNonAdmin(incoming, isAdmin);
        if (!tableData.columns || tableData.columns.length === 0) return;

        // Sort rows by row_index to ensure correct order
        const tableRowsData = tableData.rows! ? [...tableData.rows!].sort((a, b) => a.row_index - b.row_index) : [];
        // Sort columns by column_index to ensure correct order
        const tableColsData = [...tableData.columns!].sort((a, b) => a.column_index - b.column_index);
        setTable(tableData);

        // Check if this is a currency fundamentals table
        const isCurrencyFundamentalTable =
            isCurrencyFundamental ||
            tableIdentifier.startsWith('currency_fundamental_');

        // Initialize rows and columns from existing table
        // For currency fundamentals, add a header row at the beginning (not stored in DB)
        let tableRows: Array<{ id: string; currencyPairId?: number; cells: CellData[] }> = [];

        if (isCurrencyFundamentalTable) {
            // Create header row with default styling (not stored in DB)
            const headerRow = {
                id: 'header-row',
                cells: tableColsData.map(() => ({
                    value: '',
                    metadata: {
                        bgColor: TABLE_CELL_BG,
                        textColor: TABLE_CELL_TEXT,
                        borderColor: TABLE_CELL_BORDER
                    }
                }))
            };
            tableRows = [headerRow];
        }

        // Add data rows from database
        if (tableRowsData && tableRowsData.length > 0) {
            // First pass: build all rows with stored values
            const tempRows: Array<{ id: string; currencyPairId?: number; cells: CellData[] }> = [];

            tableRowsData.forEach((row) => {
                const tempCells: CellData[] = tableColsData.map((col) => {
                    const cell = row.cells?.find(c => c.table_column_id === col.id);

                    // For currency fundamentals, apply default cell styling if metadata is empty
                    let cellMetadata = cell?.cell_metadata || {};
                    if (isCurrencyFundamentalTable && (!cellMetadata || Object.keys(cellMetadata).length === 0)) {
                        cellMetadata = {
                            bgColor: TABLE_CELL_BG,
                            textColor: TABLE_CELL_TEXT,
                            borderColor: TABLE_CELL_BORDER
                        };
                    }

                    return {
                        value: cell?.value || '',
                        formula: cell?.formula || undefined,
                        metadata: cellMetadata
                    };
                });

                tempRows.push({
                    id: `row-${row.id}`,
                    currencyPairId: row.currency_pair_id || undefined,
                    cells: tempCells
                });
            });

            // Second pass: calculate formulas for cells that have formulas but empty values
            // This handles cases where old data doesn't have computed values stored
            const tableDataForCalc = {
                rows: tempRows,
                columns: tableColsData.map(c => ({ id: c.id.toString(), header: c.header || '', key: c.key }))
            };

            tempRows.forEach((tempRow, rowIdx) => {
                tempRow.cells.forEach((cell, colIdx) => {
                    // If cell has formula but no stored value, calculate it once during load
                    if (cell.formula && (!cell.value || cell.value.trim() === '')) {
                        // Calculate formula once - use row index accounting for header row offset
                        const actualRowIdx = isCurrencyFundamentalTable ? rowIdx + 1 : rowIdx;
                        const currentFormulaStartRow = tableData.table_metadata?.formulaStartRow || 1;
                        const calculated = calculateFormulaUtil(cell.formula, actualRowIdx, colIdx, tableDataForCalc, new Set(), currentFormulaStartRow);
                        if (calculated && calculated.trim() !== '') {
                            cell.value = calculated;
                        }
                    }
                });
            });

            tableRows = [...tableRows, ...tempRows];
        }

        const tableCols = tableColsData.map(col => ({
            id: `col-${col.id}`,
            header: col.header,
            key: col.key || undefined
        }));
        setRows(tableRows);
        setColumns(tableCols);

        // Load cell styles and column widths
        const styles: Record<string, CellMetadata> = {};
        const existingColumnWidths: Record<number, number> = {};

        // Load header styles from column metadata
        tableColsData.forEach((col, colIdx) => {
            if (col.column_metadata) {
                styles[`header-${colIdx}`] = col.column_metadata as CellMetadata;
                // Load column width from metadata - validate it's a valid number
                if (col.column_metadata.width) {
                    const width = typeof col.column_metadata.width === 'number'
                        ? col.column_metadata.width
                        : parseFloat(String(col.column_metadata.width));
                    if (!isNaN(width) && width > 0 && isFinite(width)) {
                        existingColumnWidths[colIdx] = width;
                    }
                }
            }
        });

        // Load cell styles from row data
        // For currency fundamentals, row indices are offset by 1 (header row at index 0)
        const rowOffset = isCurrencyFundamentalTable ? 1 : 0;
        if (tableRowsData && tableRowsData.length > 0) {
            tableRowsData.forEach((row, rowIdx) => {
                tableColsData.forEach((col, colIdx) => {
                    const cell = row.cells?.find(c => c.table_column_id === col.id);
                    const displayRowIdx = rowIdx + rowOffset;
                    if (cell?.cell_metadata) {
                        styles[`${displayRowIdx}-${colIdx}`] = cell.cell_metadata;
                    } else if (isCurrencyFundamentalTable) {
                        // Apply default cell styling for currency fundamentals if no metadata exists
                        styles[`${displayRowIdx}-${colIdx}`] = {
                            bgColor: TABLE_CELL_BG,
                            textColor: TABLE_CELL_TEXT,
                            borderColor: TABLE_CELL_BORDER
                        };
                    }
                });
            });
        }

        // For currency fundamentals, add header row styles
        if (isCurrencyFundamentalTable) {
            tableColsData.forEach((col, colIdx) => {
                styles[`0-${colIdx}`] = {
                    bgColor: TABLE_CELL_BG,
                    textColor: TABLE_CELL_TEXT,
                    borderColor: TABLE_CELL_BORDER
                };
            });
        }

        setCellStyles(styles);
        setColumnWidths(existingColumnWidths);

        // Load table border settings from metadata
        if (tableData.table_metadata) {
            const metadata = tableData.table_metadata;
            if (metadata.borderStyle) {
                setBorderStyle(metadata.borderStyle);
            }
            if (metadata.borderColor) {
                setBorderColor(metadata.borderColor);
            }
            if (metadata.formulaStartRow) {
                setFormulaStartRow(metadata.formulaStartRow);
            }
        }
    };

    // Track if we've processed initial data to avoid double-loading
    const hasProcessedInitial = useRef(!!initialTable);
    const previousTableIdentifier = useRef<string | null>(tableIdentifier);

    useEffect(() => {
        if (initialTable && initialTable.columns && initialTable.columns.length > 0) {
            processTableData(initialTable);
            hasProcessedInitial.current = true;
            previousTableIdentifier.current = tableIdentifier;
            setLoading(false);
        }
    }, [initialTable, tableIdentifier, isCurrencyFundamental, isAdmin]);

    // Load table when identifier changes or refresh is triggered
    useEffect(() => {
        // Always reload when refreshTrigger changes (user action)
        if (refreshTrigger !== undefined && refreshTrigger > 0) {
            loadTable();
            return;
        }

        // If tableIdentifier changes, always reload (different table)
        if (previousTableIdentifier.current !== tableIdentifier) {
            loadTable();
            previousTableIdentifier.current = tableIdentifier;
            return;
        }

        // On initial mount, only load if we don't have initialTable
        if (!hasProcessedInitial.current) {
            loadTable();
            previousTableIdentifier.current = tableIdentifier;
        }
    }, [tableIdentifier, refreshTrigger, isAdmin]);

    const loadTable = async () => {
        try {
            setLoading(true);
            const response = await dynamicTableService.getTableByIdentifier(tableIdentifier);
            if (response && response.data && response.data.columns && response.data.columns.length > 0) {
                const tableData = filterDynamicTableForNonAdmin(response.data, isAdmin);
                // Sort rows by row_index to ensure correct order
                const tableRowsData = tableData.rows! ? [...tableData.rows!].sort((a, b) => a.row_index - b.row_index) : [];
                // Sort columns by column_index to ensure correct order
                const tableColsData = [...tableData.columns!].sort((a, b) => a.column_index - b.column_index);
                setTable(tableData);

                // Check if this is a currency fundamentals table
                const isCurrencyFundamentalTable =
                    isCurrencyFundamental ||
                    tableIdentifier.startsWith('currency_fundamental_');

                // Initialize rows and columns from existing table
                // For currency fundamentals, add a header row at the beginning (not stored in DB)
                let tableRows: Array<{ id: string; currencyPairId?: number; cells: CellData[] }> = [];

                if (isCurrencyFundamentalTable) {
                    // Create header row with default styling (not stored in DB)
                    const headerRow = {
                        id: 'header-row',
                        cells: tableColsData.map(() => ({
                            value: '',
                            metadata: {
                                bgColor: TABLE_CELL_BG,
                                textColor: TABLE_CELL_TEXT,
                                borderColor: TABLE_CELL_BORDER
                            }
                        }))
                    };
                    tableRows = [headerRow];
                }

                // Add data rows from database
                if (tableRowsData && tableRowsData.length > 0) {
                    // First pass: build all rows with stored values
                    const tempRows: Array<{ id: string; currencyPairId?: number; cells: CellData[] }> = [];

                    tableRowsData.forEach((row) => {
                        const tempCells: CellData[] = tableColsData.map((col) => {
                            const cell = row.cells?.find(c => c.table_column_id === col.id);

                            // For currency fundamentals, apply default cell styling if metadata is empty
                            let cellMetadata = cell?.cell_metadata || {};
                            if (isCurrencyFundamentalTable && (!cellMetadata || Object.keys(cellMetadata).length === 0)) {
                                cellMetadata = {
                                    bgColor: TABLE_CELL_BG,
                                    textColor: TABLE_CELL_TEXT,
                                    borderColor: TABLE_CELL_BORDER
                                };
                            }

                            return {
                                value: cell?.value || '',
                                formula: cell?.formula || undefined,
                                metadata: cellMetadata
                            };
                        });

                        tempRows.push({
                            id: `row-${row.id}`,
                            currencyPairId: row.currency_pair_id || undefined,
                            cells: tempCells
                        });
                    });

                    // Second pass: calculate formulas for cells that have formulas but empty values
                    // This handles cases where old data doesn't have computed values stored
                    const tableData = {
                        rows: tempRows,
                        columns: tableColsData.map(c => ({ id: c.id.toString(), header: c.header || '', key: c.key })),
                        table_metadata: initialTable?.table_metadata || {}
                    };

                    tempRows.forEach((tempRow, rowIdx) => {
                        tempRow.cells.forEach((cell, colIdx) => {
                            // If cell has formula but no stored value, calculate it once during load
                            if (cell.formula && (!cell.value || cell.value.trim() === '')) {
                                // Calculate formula once - use row index accounting for header row offset
                                const actualRowIdx = isCurrencyFundamentalTable ? rowIdx + 1 : rowIdx;
                                const currentFormulaStartRow = tableData.table_metadata?.formulaStartRow || 1;
                                const calculated = calculateFormulaUtil(cell.formula, actualRowIdx, colIdx, tableData, new Set(), currentFormulaStartRow);
                                if (calculated && calculated.trim() !== '') {
                                    cell.value = calculated;
                                }
                            }
                        });
                    });

                    tableRows = [...tableRows, ...tempRows];
                } else {
                    // If table has columns but no rows, create 12 empty rows for trading journal
                    // (or show empty state for other tables)
                    const emptyRowCount = tableIdentifier === 'trading_journal_table' ? 12 : 0;
                    if (emptyRowCount > 0) {
                        const emptyRows = Array.from({ length: emptyRowCount }, (_, idx) => ({
                            id: `row-empty-${idx}`,
                            cells: tableColsData.map(() => ({
                                value: '',
                                metadata: {}
                            }))
                        }));
                        tableRows = [...tableRows, ...emptyRows];
                    }
                }

                const tableCols = tableColsData.map(col => ({
                    id: `col-${col.id}`,
                    header: col.header,
                    key: col.key || undefined
                }));
                setRows(tableRows);
                setColumns(tableCols);

                // Load cell styles and column widths
                const styles: Record<string, CellMetadata> = {};
                const existingColumnWidths: Record<number, number> = {};

                // For currency fundamentals, apply default header styles
                // COMMENTED OUT: Default header styles application
                // if (isCurrencyFundamentalTable) {
                //     // Apply default header styles for currency fundamentals structure
                //     const defaultHeaderStyles: Record<string, CellMetadata> = {
                //         'header-0': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }, // Factor
                //         'header-1': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }, // Macroshift Score
                //         'header-2': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }, // Divergence Score
                //         'header-3': { colspan: 4, bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }, // USD section
                //         'header-4': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }, // Latest Value (under USD)
                //         'header-5': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }, // Previous (under USD)
                //         'header-6': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }, // Forecast (under USD)
                //         'header-7': { colspan: 4, bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }, // DATA section
                //         'header-8': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }  // Surprise (under DATA)
                //     };

                //     // Merge default styles with saved styles (saved styles take precedence)
                //     Object.keys(defaultHeaderStyles).forEach(key => {
                //         const colIdx = parseInt(key.split('-')[1]);
                //         if (tableColsData[colIdx]?.column_metadata) {
                //             styles[key] = {
                //                 ...defaultHeaderStyles[key],
                //                 ...(tableColsData[colIdx].column_metadata as CellMetadata)
                //             };
                //         } else {
                //             styles[key] = defaultHeaderStyles[key];
                //         }
                //     });
                // }

                // Load header styles from column metadata (for non-currency fundamentals or to override)
                tableColsData.forEach((col, colIdx) => {
                    if (col.column_metadata) {
                        // Only override if not already set by currency fundamentals defaults
                        if (!styles[`header-${colIdx}`] || !isCurrencyFundamental) {
                            styles[`header-${colIdx}`] = col.column_metadata as CellMetadata;
                        }
                        // Load column width from metadata - validate it's a valid number
                        if (col.column_metadata.width) {
                            const width = typeof col.column_metadata.width === 'number'
                                ? col.column_metadata.width
                                : parseFloat(String(col.column_metadata.width));
                            if (!isNaN(width) && width > 0 && isFinite(width)) {
                                existingColumnWidths[colIdx] = width;
                            }
                        }
                    }
                });

                // Load cell styles from row data
                // For currency fundamentals, row indices are offset by 1 (header row at index 0)
                const rowOffset = isCurrencyFundamentalTable ? 1 : 0;
                if (tableRowsData && tableRowsData.length > 0) {
                    tableRowsData.forEach((row, rowIdx) => {
                        tableColsData.forEach((col, colIdx) => {
                            const cell = row.cells?.find(c => c.table_column_id === col.id);
                            const displayRowIdx = rowIdx + rowOffset;
                            if (cell?.cell_metadata) {
                                styles[`${displayRowIdx}-${colIdx}`] = cell.cell_metadata;
                            } else if (isCurrencyFundamentalTable) {
                                // Apply default cell styling for currency fundamentals if no metadata exists
                                styles[`${displayRowIdx}-${colIdx}`] = {
                                    bgColor: TABLE_CELL_BG,
                                    textColor: TABLE_CELL_TEXT,
                                    borderColor: TABLE_CELL_BORDER
                                };
                            }
                        });
                    });
                }

                // For currency fundamentals, add header row styles
                if (isCurrencyFundamentalTable) {
                    tableColsData.forEach((col, colIdx) => {
                        styles[`0-${colIdx}`] = {
                            bgColor: TABLE_CELL_BG,
                            textColor: TABLE_CELL_TEXT,
                            borderColor: TABLE_CELL_BORDER
                        };
                    });
                }

                setCellStyles(styles);
                setColumnWidths(existingColumnWidths);

                // Load table border settings from metadata
                if (tableData.table_metadata) {
                    const metadata = tableData.table_metadata;
                    if (metadata.borderStyle) {
                        setBorderStyle(metadata.borderStyle);
                    }
                    if (metadata.borderColor) {
                        setBorderColor(metadata.borderColor);
                    }
                    if (metadata.formulaStartRow) {
                        setFormulaStartRow(metadata.formulaStartRow);
                    }
                }
            } else {
                // Table exists but has no columns yet, reset state
                setTable(null);
                setRows([]);
                setColumns([]);
                setCellStyles({});
            }
        } catch (error) {
            // Table doesn't exist yet, this is normal - just reset state silently
            setTable(null);
            setRows([]);
            setColumns([]);
            setCellStyles({});
        } finally {
            setLoading(false);
        }
    };

    const getCellStyle = (rowIndex: number | 'header', colIndex: number): React.CSSProperties & { borderColor?: string } => {
        const key = rowIndex === 'header' ? `header-${colIndex}` : `${rowIndex}-${colIndex}`;
        // First check cellStyles (most recent), then check row metadata, then default
        const cellStyleData = cellStyles[key];
        const rowMetadata = rowIndex !== 'header' ? rows[rowIndex]?.cells[colIndex]?.metadata : {};
        const style = cellStyleData || rowMetadata || {};
        return {
            backgroundColor: style.bgColor || undefined,
            color: style.textColor || undefined,
            fontSize: style.fontSize || undefined,
            fontWeight: style.fontWeight || undefined,
            padding: style.padding || undefined,
            textAlign: (style.textAlign || globalAlignment) as 'left' | 'center' | 'right' | undefined,
            borderColor: style.borderColor || undefined,
        };
    };

    // Round floating point numbers to fix precision issues
    // Rounds to 15 decimal places to handle JavaScript floating point errors
    // Examples: 0.19999999999999973 -> 0.2, 1.0000000000000002 -> 1
    const roundFloat = (num: number): number => {
        if (!isFinite(num)) return num;
        // Round to 15 decimal places to handle floating point precision issues
        return Math.round(num * 1e15) / 1e15;
    };

    // Format a number to remove unnecessary decimal places while preserving precision
    const formatNumber = (num: number): string => {
        // Round to fix floating point errors first (15 decimal places)
        const rounded = roundFloat(num);

        // Format to 12 decimal places and remove trailing zeros
        // This fixes cases like 0.600000000000001 -> 0.6, -11.259999999999998 -> -11.26
        let formatted = rounded.toFixed(12);

        // Remove trailing zeros and decimal point if not needed
        formatted = formatted.replace(/\.?0+$/, '');

        return formatted;
    };

    /** Display numeric cells with grouping (e.g. 23084 -> "23,084") — avoids parseFloat("23,084") === 23 */
    const formatNumberForDisplay = (num: number): string => {
        const rounded = roundFloat(snapNearInteger(roundFloat(num)));
        if (!isFinite(rounded)) return String(num);
        const s = formatNumber(rounded);
        const sign = s.startsWith("-") ? "-" : "";
        const unsigned = sign ? s.slice(1) : s;
        const [intPart, fracPart] = unsigned.split(".");
        const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return fracPart !== undefined ? `${sign}${grouped}.${fracPart}` : `${sign}${grouped}`;
    };

    // Get display value for a cell (use stored computed value only, never recalculate)
    // Applies rounding to fix floating point precision issues
    const getCellDisplayValue = (rowIndex: number, colIndex: number): string => {
        const cellData = rows[rowIndex]?.cells[colIndex];
        if (!cellData) return '';

        // Always use the stored computed value - never recalculate formulas
        // The value should have been calculated and stored at creation/editing time
        const value = cellData.value || '';

        if (tableIdentifier === 'score_dashboard_sheet76') {
            const headerLower = (columns[colIndex]?.header || '').toLowerCase();
            if (headerLower.includes('net bias')) {
                return stripNetBiasSheetDecorations(value);
            }
        }

        // Apply rounding and formatting if it's a numeric value
        // But preserve text values like dates (containing /) or other non-numeric strings
        if (value && value.trim() !== '') {
            // Check if value contains date-like patterns (/, -, or other non-numeric characters)
            // Only parse as number if it's a pure number (no slashes, dashes in date context, etc.)
            const hasDatePattern = /[\/\-]/.test(value.trim());
            if (!hasDatePattern) {
                const normalized = value.trim().replace(/,/g, "");
                const numValue = parseFloat(normalized);
                const looksNumeric =
                    normalized !== "" &&
                    !Number.isNaN(numValue) &&
                    /^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i.test(normalized);
                if (looksNumeric) {
                    return formatNumberForDisplay(numValue);
                }
            }
            // If it has date pattern or is not a number, return as-is
        }

        return value;
    };
    getCellDisplayValueRef.current = getCellDisplayValue;

    const isCurrencyFundamentalTable =
        isCurrencyFundamental ||
        tableIdentifier.startsWith("currency_fundamental_");
    const isCurrencyFundamentalsCompactTable = tableIdentifier.startsWith("currency_fundamentals_");
    const visibleColumnIndices = useMemo(
        () => columns.map((_, idx) => idx).filter((idx) => !(isCurrencyFundamentalsCompactTable && idx === 1)),
        [columns, isCurrencyFundamentalsCompactTable]
    );
    const trendIndicatorColumnIndices = useMemo(() => {
        if (!isCurrencyFundamentalsCompactTable || columns.length < 4) return new Set<number>();
        return new Set<number>([2, 3, columns.length - 2, columns.length - 1]);
    }, [columns.length, isCurrencyFundamentalsCompactTable]);

    useLayoutEffect(() => {
        const measureEl = currencyFundamentalsFactorMeasureRef.current;
        if (!isCurrencyFundamentalsCompactTable || !measureEl || rows.length === 0) {
            setCurrencyFundamentalsFactorTextMaxPx(0);
            return;
        }
        let max = 0;
        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            const text = getCellDisplayValueRef.current(rowIdx, 0);
            measureEl.textContent = text;
            max = Math.max(max, measureEl.getBoundingClientRect().width);
        }
        measureEl.textContent = "";
        const padded = Math.ceil(max) + 10;
        setCurrencyFundamentalsFactorTextMaxPx(max > 0 ? Math.min(padded, 200) : 0);
    }, [isCurrencyFundamentalsCompactTable, rows, refreshTrigger, loading, tableIdentifier, columns.length]);

    // `currency_fundamentals_*` is compact (hidden column, trend cells) but must still span the main column on Currency Fundamentals.
    const useFullWidthLayout =
        isCurrencyFundamentalTable ||
        !isCurrencyFundamentalsCompactTable ||
        tableIdentifier.startsWith("currency_fundamentals_");

    const currencyFundamentalsFullWidth = isCurrencyFundamentalsCompactTable && useFullWidthLayout;

    /** Mirrors editor "Show Table Headers (TH)" — hide `<thead>` when false (not used for currency fundamentals). */
    const showThead =
        isCurrencyFundamentalTable || table?.table_metadata?.hasHeaders !== false;

    const scrollWrapperStyle: React.CSSProperties = useFullWidthLayout
        ? { width: "100%", overflow: "auto" }
        : { width: "max-content", maxWidth: "100%", overflowX: "auto" };

    const tableWidthStyle: React.CSSProperties =
        currencyFundamentalsFullWidth
            ? { tableLayout: "fixed" as const, width: "100%" }
            : useFullWidthLayout
                ? { tableLayout: "auto" as const, width: "100%" }
                : { tableLayout: "auto" as const, width: "max-content" };

    /** Full-width tables: minWidth only so remaining space fills when columns are removed (e.g. admin-only hidden). */
    const getDisplayColumnSizeStyle = useCallback(
        (colIdx: number): React.CSSProperties => {
            if (currencyFundamentalsFullWidth) {
                if (colIdx === 0) {
                    const labelReserve =
                        currencyFundamentalsFactorTextMaxPx > 0
                            ? currencyFundamentalsFactorTextMaxPx + 100
                            : 188;
                    return { minWidth: `${Math.min(labelReserve, 300)}px` };
                }
                return { minWidth: "72px" };
            }
            const w = columnWidths[colIdx];
            const minStr =
                w && w > 0 && !Number.isNaN(w) ? `${Math.max(110, w)}px` : "110px";
            if (useFullWidthLayout) {
                return { minWidth: minStr };
            }
            if (w && w > 0 && !Number.isNaN(w)) {
                return { minWidth: minStr, width: `${w}px` };
            }
            return { minWidth: minStr };
        },
        [columnWidths, useFullWidthLayout, currencyFundamentalsFullWidth, currencyFundamentalsFactorTextMaxPx],
    );

    if (loading && columns.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading table...</div>;
    }

    if (!table || columns.length === 0) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'rgb(var(--secondary))',
                border: '2px dashed var(--table-cell-border, #e5e7eb)',
                borderRadius: '5px',
                backgroundColor: 'var(--table-cell-bg, #f9fafb)'
            }}>
                <div style={{ fontSize: '11px', marginBottom: '5px' }}>📊 Waiting for table data</div>
                <div style={{ fontSize: '9px' }}>Create and save a table above to see it here</div>
            </div>
        );
    }

    // Show table structure even if no rows exist yet
    if (rows.length === 0) {
        return (
            <div style={scrollWrapperStyle}>
                <Table
                    borderSpacing={borderStyle === 'spacing'}
                    smallBorderSpacing={borderStyle === 'spacing'}
                    style={tableWidthStyle}
                >
                    {showThead ? (
                        <Thead borderColor={borderColor}>
                            <Tr>
                                {columns.map((col, colIdx) => {
                                    // Get colspan from column metadata
                                    const colMetadata = cellStyles[`header-${colIdx}`] || {};
                                    const colspan = colMetadata.colspan ? parseInt(String(colMetadata.colspan)) : 1;

                                    // Check if this column is covered by a previous column's colspan
                                    let isCoveredByPrevious = false;
                                    for (let i = 0; i < colIdx; i++) {
                                        const prevColMetadata = cellStyles[`header-${i}`] || {};
                                        const prevColspan = prevColMetadata.colspan ? parseInt(String(prevColMetadata.colspan)) : 1;
                                        // A column is covered if it's within the range of a previous column's colspan
                                        if (prevColspan > 1 && colIdx >= i + 1 && colIdx < i + prevColspan) {
                                            isCoveredByPrevious = true;
                                            break;
                                        }
                                    }

                                    // If this column is covered by a previous column's colspan, don't render a separate TH
                                    if (isCoveredByPrevious) {
                                        return null;
                                    }

                                    // Apply colspan only to columns that have it and aren't covered by a previous one
                                    const headerStyle = getCellStyle('header', colIdx);
                                    return (
                                        <Th
                                            key={col.id}
                                            colSpan={colspan > 1 ? colspan : undefined}
                                            style={{
                                                backgroundColor: headerStyle.backgroundColor || TABLE_CELL_BG,
                                                color: headerStyle.color || TABLE_CELL_TEXT,
                                                fontSize: headerStyle.fontSize,
                                                fontWeight: headerStyle.fontWeight,
                                                textAlign: (headerStyle.textAlign || globalAlignment) as 'left' | 'center' | 'right',
                                                whiteSpace: 'nowrap',
                                                padding: '12px 8px',
                                                ...getDisplayColumnSizeStyle(colIdx),
                                            }}
                                            bgColor={headerStyle.backgroundColor || TABLE_CELL_BG}
                                            color={headerStyle.color || TABLE_CELL_TEXT}
                                            borderColor={getCellStyle('header', colIdx).borderColor || borderColor}
                                        >
                                            {col.header}
                                        </Th>
                                    );
                                })}
                            </Tr>
                        </Thead>
                    ) : null}
                    <Tbody>
                        <Tr>
                            {visibleColumnIndices.map((colIdx) => {
                                const col = columns[colIdx];
                                return (
                                    <Td
                                        key={col.id}
                                        style={{
                                            padding: '12px 8px',
                                            textAlign: 'center',
                                            fontStyle: 'italic',
                                            color: '#6b7280',
                                            ...getDisplayColumnSizeStyle(colIdx),
                                        }}
                                        borderColor={borderColor}
                                    >
                                        No data
                                    </Td>
                                );
                            })}
                        </Tr>
                    </Tbody>
                </Table>
            </div>
        );
    }

    return (
        <div style={scrollWrapperStyle}>
            {isCurrencyFundamentalsCompactTable && !loading ? (
                <span
                    ref={currencyFundamentalsFactorMeasureRef}
                    className="pointer-events-none fixed left-0 top-0 z-[-1] whitespace-nowrap text-sm font-semibold"
                    aria-hidden
                />
            ) : null}
            <Table
                borderSpacing={borderStyle === 'spacing'}
                smallBorderSpacing={borderStyle === 'spacing'}
                style={tableWidthStyle}
                className={isCurrencyFundamentalsCompactTable ? baseTableStyles["table--currencyFundamentalsFlush"] : undefined}
                horizontalOverflowSlackPx={isCurrencyFundamentalsCompactTable ? 8 : 1}
                tightScrollPadding={isCurrencyFundamentalsCompactTable}
            >
                {currencyFundamentalsFullWidth && visibleColumnIndices.length > 1 ? (
                    <colgroup>
                        {visibleColumnIndices.map((colIdx) => {
                            const n = visibleColumnIndices.length;
                            const firstPct = Math.round(CURRENCY_FUNDAMENTALS_FIRST_COL_WIDTH_FRAC * 100);
                            const restPct = 100 - firstPct;
                            if (colIdx === 0) {
                                return <col key={`cfw-${colIdx}`} style={{ width: `${firstPct}%` }} />;
                            }
                            const share = restPct / (n - 1);
                            return <col key={`cfw-${colIdx}`} style={{ width: `${share}%` }} />;
                        })}
                    </colgroup>
                ) : null}
                {showThead ? (
                    <Thead borderColor={isCurrencyFundamental ? TABLE_CELL_BORDER : borderColor}>
                        {isCurrencyFundamental ? (
                            <>
                                <Tr>
                                    {columns.slice(0, 3).map((col, colIdx) => {
                                        const headerStyle = getCellStyle('header', colIdx);
                                        return (
                                            <Th
                                                key={`first-row-${col.id}`}
                                                rowSpan={2}
                                                style={{
                                                    backgroundColor: headerStyle.backgroundColor || TABLE_CELL_BG,
                                                    color: headerStyle.color || TABLE_CELL_TEXT,
                                                    textAlign: 'left',
                                                    whiteSpace: 'nowrap',
                                                    padding: '12px 8px',
                                                    borderColor: TABLE_CELL_BORDER,
                                                    border: `3px solid ${TABLE_CELL_BORDER}`,
                                                    fontSize: headerStyle.fontSize,
                                                    fontWeight: headerStyle.fontWeight || 'normal',
                                                    ...getDisplayColumnSizeStyle(colIdx),
                                                }}
                                                bgColor={headerStyle.backgroundColor || TABLE_CELL_BG}
                                                color={headerStyle.color || TABLE_CELL_TEXT}
                                                borderColor={TABLE_CELL_BORDER}
                                            >
                                                {col.header}
                                            </Th>
                                        );
                                    })}
                                    <Th
                                        colSpan={4}
                                        style={{
                                            backgroundColor: TABLE_CELL_BG,
                                            color: TABLE_CELL_TEXT,
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap',
                                            padding: '12px 8px',
                                            borderColor: TABLE_CELL_BORDER,
                                            border: `3px solid ${TABLE_CELL_BORDER}`,
                                            fontWeight: 'normal',
                                            fontSize: '11px'
                                        }}
                                        bgColor={TABLE_CELL_BG}
                                        color={TABLE_CELL_TEXT}
                                        borderColor={TABLE_CELL_BORDER}
                                    >
                                        {currencyName || 'USD'}
                                    </Th>
                                    <Th
                                        colSpan={2}
                                        style={{
                                            backgroundColor: TABLE_CELL_BG,
                                            color: TABLE_CELL_TEXT,
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap',
                                            padding: '12px 8px',
                                            borderColor: TABLE_CELL_BORDER,
                                            border: `3px solid ${TABLE_CELL_BORDER}`,
                                            fontWeight: 'normal',
                                            fontSize: '11px'
                                        }}
                                        bgColor={TABLE_CELL_BG}
                                        color={TABLE_CELL_TEXT}
                                        borderColor={TABLE_CELL_BORDER}
                                    >
                                        DATA
                                    </Th>
                                </Tr>
                                <Tr>
                                    {columns.slice(3).map((col, relativeIdx) => {
                                        const colIdx = relativeIdx + 3;
                                        const headerStyle = getCellStyle('header', colIdx);
                                        const thBgColor = headerStyle.backgroundColor || TABLE_CELL_BG;

                                        return (
                                            <Th
                                                key={col.id}
                                                style={{
                                                    backgroundColor: thBgColor,
                                                    color: headerStyle.color || TABLE_CELL_TEXT,
                                                    fontSize: headerStyle.fontSize,
                                                    fontWeight: headerStyle.fontWeight,
                                                    textAlign: (headerStyle.textAlign || 'left') as 'left' | 'center' | 'right',
                                                    whiteSpace: 'nowrap',
                                                    padding: '12px 8px',
                                                    borderColor: TABLE_CELL_BORDER,
                                                    border: `3px solid ${TABLE_CELL_BORDER}`,
                                                    ...getDisplayColumnSizeStyle(colIdx),
                                                }}
                                                bgColor={thBgColor}
                                                color={headerStyle.color || TABLE_CELL_TEXT}
                                                borderColor={TABLE_CELL_BORDER}
                                            >
                                                {col.header}
                                            </Th>
                                        );
                                    })}
                                </Tr>
                            </>
                        ) : (
                            <Tr>
                                {visibleColumnIndices.map((colIdx) => {
                                    const col = columns[colIdx];
                                    const colMetadata = cellStyles[`header-${colIdx}`] || {};
                                    const colspan = colMetadata.colspan ? parseInt(String(colMetadata.colspan)) : 1;

                                    // Check if this column is covered by a previous column's colspan
                                    let isCoveredByPrevious = false;
                                    for (let i = 0; i < colIdx; i++) {
                                        const prevColMetadata = cellStyles[`header-${i}`] || {};
                                        const prevColspan = prevColMetadata.colspan ? parseInt(String(prevColMetadata.colspan)) : 1;
                                        // A column is covered if it's within the range of a previous column's colspan
                                        if (prevColspan > 1 && colIdx >= i + 1 && colIdx < i + prevColspan) {
                                            isCoveredByPrevious = true;
                                            break;
                                        }
                                    }

                                    // If this column is covered by a previous column's colspan, don't render a separate TH
                                    if (isCoveredByPrevious) {
                                        return null;
                                    }

                                    const headerStyle = getCellStyle('header', colIdx);
                                    // Check if this is the current month column for seasonal trends table
                                    const isCurrentMonth = isSeasonalTrendsTable && colIdx === currentMonthColumnIndex;
                                    const isMonthColumn = isSeasonalTrendsTable && colIdx > 0; // First column is currency pairs
                                    const isOtherMonth = isMonthColumn && !isCurrentMonth;

                                    return (
                                        <Th
                                            key={col.id}
                                            colSpan={colspan > 1 ? colspan : undefined}
                                            style={{
                                                backgroundColor: headerStyle.backgroundColor || TABLE_CELL_BG,
                                                color: headerStyle.color || TABLE_CELL_TEXT,
                                                fontSize: headerStyle.fontSize,
                                                fontWeight: isCurrentMonth ? 'bold' : (headerStyle.fontWeight || 'normal'),
                                                textAlign: (headerStyle.textAlign || globalAlignment) as 'left' | 'center' | 'right',
                                                whiteSpace: 'nowrap',
                                                padding: '12px 8px',
                                                opacity: isOtherMonth ? 0.3 : 1,
                                                filter: isOtherMonth ? 'blur(1px)' : 'none',
                                                transition: 'opacity 0.3s, filter 0.3s',
                                                ...(isCurrentMonth && {
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                                    border: '2px solid #3b82f6',
                                                    borderRadius: '4px'
                                                }),
                                                ...(isCurrencyFundamentalsCompactTable && colIdx === 0
                                                    ? {
                                                        paddingLeft: CURRENCY_FUNDAMENTALS_FIRST_COL_PADDING_LEFT,
                                                        textAlign: "left",
                                                    }
                                                    : {}),
                                                ...getDisplayColumnSizeStyle(colIdx),
                                            }}
                                            bgColor={headerStyle.backgroundColor || TABLE_CELL_BG}
                                            color={headerStyle.color || TABLE_CELL_TEXT}
                                            borderColor={getCellStyle('header', colIdx).borderColor || borderColor}
                                        >
                                            {col.header}
                                        </Th>
                                    );
                                })}
                            </Tr>
                        )}
                    </Thead>
                ) : null}
                <Tbody>
                    {rows.map((row, rowIdx) => (
                        <Tr key={row.id}>
                            {visibleColumnIndices.map((colIdx) => {
                                const col = columns[colIdx];
                                const cellData = row.cells[colIdx] || { value: '', metadata: {} };
                                const cellStyle = getCellStyle(rowIdx, colIdx);

                                // Currency fundamentals styling for td
                                const defaultTdBg = TABLE_CELL_BG;
                                const defaultTdColor = TABLE_CELL_TEXT;
                                const defaultTdBorder = TABLE_CELL_BORDER;

                                // Check if this is the current month column for seasonal trends table
                                const isCurrentMonth = isSeasonalTrendsTable && colIdx === currentMonthColumnIndex;
                                const isMonthColumn = isSeasonalTrendsTable && colIdx > 0; // First column is currency pairs
                                const isOtherMonth = isMonthColumn && !isCurrentMonth;

                                return (
                                    <Td
                                        key={col.id}
                                        bgColor={cellStyle.backgroundColor || defaultTdBg}
                                        color={cellStyle.color || defaultTdColor}
                                        borderColor={cellStyle.borderColor || defaultTdBorder}
                                        style={{
                                            whiteSpace:
                                                isCurrencyFundamentalsCompactTable && colIdx === 0
                                                    ? "normal"
                                                    : "nowrap",
                                            padding: '12px 8px',
                                            fontSize: cellStyle.fontSize,
                                            fontWeight: isCurrentMonth ? 'bold' : (cellStyle.fontWeight || 'normal'),
                                            textAlign: (cellStyle.textAlign || globalAlignment) as 'left' | 'center' | 'right',
                                            backgroundColor: cellStyle.backgroundColor || defaultTdBg,
                                            color: cellStyle.color || defaultTdColor,
                                            borderColor: cellStyle.borderColor || defaultTdBorder,
                                            opacity: isOtherMonth ? 0.3 : 1,
                                            filter: isOtherMonth ? 'blur(1px)' : 'none',
                                            transition: 'opacity 0.3s, filter 0.3s',
                                            ...(isCurrentMonth && {
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                                border: '2px solid #3b82f6',
                                                borderRadius: '4px'
                                            }),
                                            ...(isCurrencyFundamentalsCompactTable && colIdx === 0
                                                ? {
                                                    paddingLeft: CURRENCY_FUNDAMENTALS_FIRST_COL_PADDING_LEFT,
                                                    textAlign: "left",
                                                }
                                                : {}),
                                            ...getDisplayColumnSizeStyle(colIdx),
                                        }}
                                    >
                                        {isCurrencyFundamentalsCompactTable && colIdx === 0 ? (
                                            (() => {
                                                const factor = getCellDisplayValue(rowIdx, colIdx);
                                                const biasRaw = rows[rowIdx]?.cells[1]?.value || "";
                                                const bias = normalizeBiasValue(biasRaw);
                                                const biasStyle = getBiasBadgeStyle(bias);

                                                return (
                                                    <div className="flex w-full min-w-0 items-center gap-2 pr-1">
                                                        <span
                                                            className="inline-block shrink-0 truncate text-left text-sm font-semibold"
                                                            style={
                                                                currencyFundamentalsFactorTextMaxPx > 0
                                                                    ? {
                                                                          width: `${currencyFundamentalsFactorTextMaxPx}px`,
                                                                      }
                                                                    : undefined
                                                            }
                                                            title={factor}
                                                        >
                                                            {factor}
                                                        </span>
                                                        <div className="flex shrink-0 items-center gap-2">
                                                            <div
                                                                className="min-w-[4.5rem] rounded-[4px] px-2 py-1 text-center text-xs font-semibold"
                                                                style={biasStyle}
                                                            >
                                                                {bias}
                                                            </div>
                                                            <BiasIcon sentiment={bias} />
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        ) : isCurrencyFundamentalsCompactTable &&
                                            showCurrencyFundamentalsCellTrendMarkers &&
                                            trendIndicatorColumnIndices.has(colIdx) ? (
                                            (() => {
                                                const cleaned = sanitizeInlineMarkers(getCellDisplayValue(rowIdx, colIdx));
                                                const numeric = parseDisplayNumeric(cleaned);
                                                if (numeric === null) return cleaned;
                                                const rowBias = normalizeBiasValue(
                                                    rows[rowIdx]?.cells[1]?.value || "",
                                                );
                                                return (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span>{cleaned}</span>
                                                        {renderCurrencyFundamentalsTrendTriangle(numeric, rowBias)}
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            getCellDisplayValue(rowIdx, colIdx)
                                        )}
                                    </Td>
                                );
                            })}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </div>
    );
}
