import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { dynamicTableService, DynamicTable, TableStructurePayload } from '@/services/dynamicTable.service';
import { apiConfig } from '@/services/api.config';
import { googleSheetsService } from '@/services/googleSheets.service';
import { TableRow, TableColumn, TableEditorProps, CellData, AutoColorSettings, BorderStyle, Alignment } from '../types';
import { calculateFinalScore, calculateFormula, getCellDisplayValue } from '../utils/formulaUtils';
import { formatNumber } from '../utils/tableUtils';
import { CellMetadata } from '@/services/dynamicTable.service';

const PLAIN_NUMERIC = /^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i;

function normalizePlainNumericValue(value: string): string {
    const normalized = value.trim().replace(/,/g, '');
    if (!normalized || !PLAIN_NUMERIC.test(normalized)) return value;
    const parsed = Number.parseFloat(normalized);
    if (Number.isNaN(parsed)) return value;
    return formatNumber(parsed);
}

/** UI columns use `id` like `col-123` matching server `TableColumn.id`. */
function parseUiColumnServerId(uiColId: string): number | null {
    const m = /^col-(\d+)$/.exec(uiColId);
    if (!m) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : null;
}

export function useTableData(props: TableEditorProps) {
    const {
        tableIdentifier,
        tableName,
        onSave,
        onDelete,
        defaultColumns,
        initialRowCount = 5,
        showAdvancedControls,
        showStructureControls
    } = props;

    const [table, setTable] = useState<DynamicTable | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [rows, setRows] = useState<TableRow[]>([]);
    const [columns, setColumns] = useState<TableColumn[]>([]);
    const [rowCount, setRowCount] = useState(initialRowCount);
    const [columnCount, setColumnCount] = useState(defaultColumns ? defaultColumns.length : 5);
    const [formulaStartRow, setFormulaStartRow] = useState<number>(1);
    const [finalScore, setFinalScore] = useState({ macroshiftSum: 0, divergenceSum: 0, finalScore: 0 });
    const [cellStyles, setCellStyles] = useState<Record<string, CellMetadata>>({});
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
    const [borderStyle, setBorderStyle] = useState<BorderStyle>('simple');
    const [borderColor, setBorderColor] = useState('rgb(var(--charcoal))');
    const [hasHeaders, setHasHeaders] = useState(true);
    const [globalAlignment, setGlobalAlignment] = useState<Alignment>('center');

    const hasAutoInitializedRef = useRef(false);

    // Helper function to check if a row is completely empty
    const isRowEmpty = (row: TableRow): boolean => {
        if (!row.cells || row.cells.length === 0) return true;
        return row.cells.every(cell => {
            const value = cell?.value || '';
            const formula = cell?.formula || '';
            // Row is empty if all cells have no value and no formula
            return (!value || value.trim() === '') && (!formula || formula.trim() === '');
        });
    };

    // Load table data logic
    const loadTable = useCallback(async () => {
        try {
            setLoading(true);
            const response = await dynamicTableService.getTableByIdentifier(tableIdentifier);
            if (response && response.data) {
                if (response.data.columns && response.data.columns.length > 0) {
                    const tableData = response.data;
                    const tableRowsData = tableData.rows ? [...tableData.rows].sort((a, b) => a.row_index - b.row_index) : [];
                    const tableColsData = [...tableData.columns!].sort((a, b) => a.column_index - b.column_index);

                    // Debug logging
                    console.log('loadTable - Table data:', {
                        hasColumns: !!tableData.columns,
                        columnsCount: tableData.columns?.length || 0,
                        hasRows: !!tableData.rows,
                        rowsCount: tableRowsData.length,
                        rows: tableRowsData.length > 0 ? tableRowsData.slice(0, 2) : 'no rows'
                    });

                    setTable(tableData);
                    setIsInitialized(true);

                    const isCurrencyFundamental = tableIdentifier.startsWith('currency_fundamental_');
                    let tableRows: TableRow[] = [];

                    if (isCurrencyFundamental) {
                        const headerRow = {
                            id: 'header-row',
                            cells: tableColsData.map(() => ({
                                value: '',
                                metadata: { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }
                            }))
                        };
                        tableRows = [headerRow];
                    }

                    if (tableRowsData.length > 0) {
                        const dataRows = tableRowsData
                            .map((row) => ({
                                id: `row-${row.id}`,
                                currencyPairId: row.currency_pair_id || undefined,
                                cells: tableColsData.map(col => {
                                    const cell = row.cells?.find(c => c.table_column_id === col.id);
                                    let cellMetadata = cell?.cell_metadata || {};
                                    if (isCurrencyFundamental && (!cellMetadata || Object.keys(cellMetadata).length === 0)) {
                                        cellMetadata = { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' };
                                    }
                                    return {
                                        value: cell?.value || '',
                                        formula: cell?.formula || undefined,
                                        metadata: cellMetadata
                                    };
                                })
                            }))
                            .filter(row => !isRowEmpty(row)); // Filter out empty rows
                        tableRows = [...tableRows, ...dataRows];
                    } else {
                        // If table has columns but no rows, create empty rows (12 for trading journal, or initialRowCount)
                        const emptyRowCount = initialRowCount || 12;
                        const emptyRows = Array.from({ length: emptyRowCount }, (_, idx) => ({
                            id: `row-empty-${idx}`,
                            cells: tableColsData.map(() => ({
                                value: '',
                                metadata: {}
                            }))
                        }));
                        tableRows = [...tableRows, ...emptyRows];
                    }

                    const tableCols = tableColsData.map((col) => ({
                        id: `col-${col.id}`,
                        header: col.header || '',
                        key: col.key || undefined,
                        column_metadata: col.column_metadata ? { ...col.column_metadata } : undefined,
                    }));

                    setRows(tableRows);
                    setColumns(tableCols);

                    const styles: Record<string, CellMetadata> = {};
                    const existingColumnWidths: Record<number, number> = {};

                    if (isCurrencyFundamental) {
                        const defaultHeaderStyles: Record<string, CellMetadata> = {
                            'header-0': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                            'header-1': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                            'header-2': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                            'header-3': { colspan: 4, bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                            'header-4': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                            'header-5': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                            'header-6': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                            'header-7': { colspan: 4, bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                            'header-8': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }
                        };

                        Object.keys(defaultHeaderStyles).forEach(key => {
                            const colIdx = parseInt(key.split('-')[1]);
                            if (tableColsData[colIdx]?.column_metadata) {
                                styles[key] = {
                                    ...defaultHeaderStyles[key],
                                    ...(tableColsData[colIdx].column_metadata as CellMetadata)
                                };
                            } else {
                                styles[key] = defaultHeaderStyles[key];
                            }
                        });
                    }

                    tableColsData.forEach((col, colIdx) => {
                        if (col.column_metadata) {
                            if (!styles[`header-${colIdx}`] || !isCurrencyFundamental) {
                                styles[`header-${colIdx}`] = col.column_metadata as CellMetadata;
                            }
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
                    setColumnWidths(existingColumnWidths);

                    const rowOffset = isCurrencyFundamental ? 1 : 0;
                    if (tableRowsData.length > 0) {
                        tableRowsData.forEach((row, rowIdx) => {
                            tableColsData.forEach((col, colIdx) => {
                                const cell = row.cells?.find(c => c.table_column_id === col.id);
                                const displayRowIdx = rowIdx + rowOffset;
                                if (cell?.cell_metadata) {
                                    styles[`${displayRowIdx}-${colIdx}`] = cell.cell_metadata;
                                } else if (isCurrencyFundamental) {
                                    styles[`${displayRowIdx}-${colIdx}`] = {
                                        bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff'
                                    };
                                }
                            });
                        });
                    }

                    if (isCurrencyFundamental) {
                        tableColsData.forEach((_, colIdx) => {
                            styles[`0-${colIdx}`] = {
                                bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff'
                            };
                        });
                    }
                    setCellStyles(styles);

                    if (tableData.table_metadata) {
                        const metadata = tableData.table_metadata;
                        setBorderStyle(metadata.borderStyle || 'simple');
                        setBorderColor(metadata.borderColor || 'rgb(var(--charcoal))');
                        if (metadata.formulaStartRow !== undefined) {
                            setFormulaStartRow(Math.max(1, Math.floor(metadata.formulaStartRow)));
                        }
                        if (metadata.hasHeaders !== undefined) {
                            setHasHeaders(metadata.hasHeaders);
                        } else {
                            setHasHeaders(!isCurrencyFundamental);
                        }
                    } else {
                        setHasHeaders(!isCurrencyFundamental);
                    }
                } else {
                    setTable(response.data);
                    setIsInitialized(false);
                }
            } else {
                setTable(null);
                setIsInitialized(false);
            }
        } catch (error) {
            setTable(null);
            setIsInitialized(false);
        } finally {
            setLoading(false);
        }
    }, [tableIdentifier]);

    useEffect(() => {
        loadTable();
    }, [loadTable]);

    // Calculate final score whenever rows, columns, or formulaStartRow changes
    useEffect(() => {
        const isCurrencyFundamental = tableIdentifier.startsWith('currency_fundamental_');
        if (isCurrencyFundamental && isInitialized && rows.length > 0 && columns.length > 0) {
            const score = calculateFinalScore(rows, columns, formulaStartRow, tableIdentifier);
            setFinalScore(score);
        } else {
            setFinalScore({ macroshiftSum: 0, divergenceSum: 0, finalScore: 0 });
        }
    }, [rows, columns, formulaStartRow, isInitialized, tableIdentifier]);

    // Auto-initialize table when defaultColumns and initialRowCount are provided
    useEffect(() => {
        const tableHasNoColumns = table && (!table.columns || table.columns.length === 0);
        const shouldAutoInitialize = !table || tableHasNoColumns;

        if (!hasAutoInitializedRef.current && !isInitialized && !loading && shouldAutoInitialize &&
            defaultColumns && defaultColumns.length > 0 && initialRowCount > 0 &&
            !showAdvancedControls && !showStructureControls) {
            hasAutoInitializedRef.current = true;
            handleApply();
        }
    }, [isInitialized, loading, table, defaultColumns, initialRowCount, showAdvancedControls, showStructureControls]);

    const handleApply = () => {
        const isCurrencyFundamental = tableIdentifier.startsWith('currency_fundamental_');
        if (isCurrencyFundamental) {
            const defaultColumns = [
                { id: 'col-0', header: 'Factor' },
                { id: 'col-1', header: 'Macroshift Score' },
                { id: 'col-2', header: 'Divergence Score' },
                { id: 'col-3', header: 'Latest Value' },
                { id: 'col-4', header: 'Latest Value' },
                { id: 'col-5', header: 'Previous' },
                { id: 'col-6', header: 'Forecast' },
                { id: 'col-7', header: 'Change' },
                { id: 'col-8', header: 'Surprise' }
            ];

            const initialStyles: Record<string, CellMetadata> = {
                'header-3': { colspan: 4, bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                'header-7': { colspan: 4, bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                'header-0': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                'header-1': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                'header-2': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                'header-4': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                'header-5': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                'header-6': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' },
                'header-8': { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }
            };

            const initialRows = Array.from({ length: rowCount }, (_, rowIdx) => ({
                id: `row-${rowIdx}`,
                cells: Array.from({ length: defaultColumns.length }, (_, colIdx) => {
                    initialStyles[`${rowIdx}-${colIdx}`] = {
                        bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff'
                    };
                    return { value: '', metadata: initialStyles[`${rowIdx}-${colIdx}`] };
                })
            }));

            setColumns(defaultColumns);
            setRows(initialRows);
            setCellStyles(initialStyles);
            setHasHeaders(false);
        } else {
            const columnsToUse = defaultColumns || Array.from({ length: columnCount }, (_, idx) => ({
                id: `col-${idx}`,
                header: ''
            }));
            const initialRows = Array.from({ length: rowCount }, (_, idx) => ({
                id: `row-${idx}`,
                cells: Array.from({ length: columnsToUse.length }, () => ({ value: '', metadata: {} }))
            }));
            setRows(initialRows);
            setColumns(columnsToUse);
        }
        setIsInitialized(true);
    };

    const handleClearTable = () => {
        if (!confirm('Are you sure you want to clear the entire table? This will remove all data, styles, and formulas.')) return;
        setRows([]);
        setColumns([]);
        setCellStyles({});
        setIsInitialized(false);
        setRowCount(5);
        setColumnCount(5);
        setBorderStyle('simple');
        setBorderColor('rgb(var(--charcoal))');
        setGlobalAlignment('center');
        setTable(null);
    };

    const handleAddRow = (afterIndex?: number) => {
        const newRow = {
            id: `row-${Date.now()}`,
            cells: columns.map(() => ({ value: '', metadata: {} }))
        };
        if (afterIndex !== undefined) {
            const newRows = [...rows];
            newRows.splice(afterIndex + 1, 0, newRow);
            setRows(newRows);
        } else {
            setRows([...rows, newRow]);
        }
    };

    const handleAddColumn = (afterIndex?: number) => {
        const newColumn = {
            id: `col-${Date.now()}`,
            header: ''
        };
        if (afterIndex !== undefined) {
            const newColumns = [...columns];
            newColumns.splice(afterIndex + 1, 0, newColumn);
            setColumns(newColumns);
            setRows(rows.map(row => ({
                ...row,
                cells: [
                    ...row.cells.slice(0, afterIndex + 1),
                    { value: '', metadata: {} },
                    ...row.cells.slice(afterIndex + 1)
                ]
            })));
        } else {
            setColumns([...columns, newColumn]);
            setRows(rows.map(row => ({
                ...row,
                cells: [...row.cells, { value: '', metadata: {} }]
            })));
        }
    };

    const handleDeleteColumn = (colIndex: number) => {
        if (columns.length > 1) {
            setColumns(columns.filter((_, idx) => idx !== colIndex));
            setRows(rows.map(row => ({
                ...row,
                cells: row.cells.filter((_, idx) => idx !== colIndex)
            })));
        }
    };

    const handleDeleteRow = (rowIndex: number) => {
        if (rows.length > 1) {
            setRows(rows.filter((_, idx) => idx !== rowIndex));
            setCellStyles(prevStyles => {
                const newStyles = { ...prevStyles };
                Object.keys(newStyles).forEach(key => {
                    if (key.startsWith(`${rowIndex}-`)) delete newStyles[key];
                    const match = key.match(/^(\d+)-(\d+)$/);
                    if (match) {
                        const rIdx = parseInt(match[1]);
                        const cIdx = match[2];
                        if (rIdx > rowIndex) {
                            newStyles[`${rIdx - 1}-${cIdx}`] = newStyles[key];
                            delete newStyles[key];
                        }
                    }
                });
                return newStyles;
            });
        }
    };

    const duplicateColumn = (colIndex: number) => {
        const colToDup = { ...columns[colIndex], id: `col-${Date.now()}` };
        const newColumns = [...columns];
        newColumns.splice(colIndex + 1, 0, colToDup);
        setColumns(newColumns);
        setRows(rows => rows.map(row => ({
            ...row,
            cells: [
                ...row.cells.slice(0, colIndex + 1),
                { ...row.cells[colIndex] },
                ...row.cells.slice(colIndex + 1)
            ]
        })));
    };

    const handleColumnHeaderChange = (colIndex: number, header: string) => {
        const newColumns = [...columns];
        newColumns[colIndex].header = header;
        setColumns(newColumns);
    };

    const handleDeleteTable = async () => {
        if (!table || !table.id) {
            toast.error('No table to delete. Table must be saved first.');
            return;
        }

        const confirmMessage = `Are you sure you want to delete "${tableName}"?\n\nThis action cannot be undone and will permanently delete all table data, rows, columns, and cells.`;
        if (!confirm(confirmMessage)) return;

        try {
            setSaving(true);
            await dynamicTableService.deleteTable(table.id);
            toast.success('Table deleted successfully!');
            setTable(null);
            setIsInitialized(false);
            setRows([]);
            setColumns([]);
            onDelete?.();
        } catch (error) {
            console.error('Failed to delete table:', error);
            toast.error('Failed to delete table. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTable = async () => {
        if (!isInitialized || rows.length === 0 || columns.length === 0) {
            toast.error('Please initialize the table first');
            return;
        }

        try {
            setSaving(true);
            console.log('handleSaveTable - Starting save process');
            let currentTable = table;
            const isCurrencyFundamental = tableIdentifier.startsWith('currency_fundamental_');

            if (!currentTable) {
                console.log('handleSaveTable - Creating new table');
                const createResponse = await dynamicTableService.createTable({
                    name: tableName,
                    identifier: tableIdentifier,
                    description: `${tableName} table`,
                    table_metadata: {
                        borderStyle,
                        borderColor,
                        formulaStartRow,
                        hasHeaders,
                        ...(isCurrencyFundamental ? {
                            finalScore: finalScore.finalScore,
                            macroshiftSum: finalScore.macroshiftSum,
                            divergenceSum: finalScore.divergenceSum
                        } : {})
                    }
                });
                currentTable = createResponse.data ?? null;
                if (!currentTable) {
                    throw new Error('Table creation did not return table data');
                }
                setTable(currentTable);
                console.log('handleSaveTable - Table created:', currentTable.id);
            } else if (currentTable.id) {
                console.log('handleSaveTable - Updating existing table metadata:', currentTable.id);
                await dynamicTableService.updateTable(currentTable.id, {
                    name: tableName,
                    identifier: tableIdentifier,
                    table_metadata: {
                        ...(currentTable.table_metadata || {}),
                        borderStyle, borderColor, hasHeaders, formulaStartRow,
                        ...(isCurrencyFundamental ? {
                            finalScore: finalScore.finalScore,
                            macroshiftSum: finalScore.macroshiftSum,
                            divergenceSum: finalScore.divergenceSum
                        } : {})
                    }
                });
                console.log('handleSaveTable - Table metadata updated');
            }

            if (!currentTable?.id) {
                console.error('handleSaveTable - Table ID is missing!');
                throw new Error('Table ID is missing');
            }

            let rowsToSave = isCurrencyFundamental ? rows.slice(1) : rows;
            // Filter out completely empty rows before saving
            rowsToSave = rowsToSave.filter(row => !isRowEmpty(row));
            const startRowIndex = isCurrencyFundamental ? 1 : 0;

            console.log('handleSaveTable - Preparing to save:', {
                totalRows: rows.length,
                rowsToSave: rowsToSave.length,
                columns: columns.length,
                tableId: currentTable.id,
                firstRow: rowsToSave[0]
            });

            const sortedServerColumns = [...(currentTable.columns ?? [])].sort((a, b) => a.column_index - b.column_index);

            const resolveServerColumnForUiIndex = (uiIdx: number) => {
                const uiCol = columns[uiIdx];
                if (!uiCol) return sortedServerColumns[uiIdx];
                const parsedId = parseUiColumnServerId(uiCol.id);
                if (parsedId != null) {
                    const hit = currentTable.columns?.find((c) => c.id === parsedId);
                    if (hit) return hit;
                }
                return sortedServerColumns[uiIdx];
            };

            const payload: TableStructurePayload = {
                dynamic_table_id: currentTable.id,
                rows: rowsToSave.map((row, idx) => ({
                    id: currentTable?.rows?.[idx]?.id || (idx + 10000),
                    row_index: idx, // Use consistent row_index (0-based from filtered array)
                    currency_pair_id: row.currencyPairId,
                    row_metadata: {}
                })),
                columns: columns.map((col, idx) => {
                    const serverCol = resolveServerColumnForUiIndex(idx);
                    const columnMetadata: Record<string, unknown> = {
                        ...(serverCol?.column_metadata as Record<string, unknown> | undefined),
                        ...(col.column_metadata || {}),
                    };
                    if (columnWidths[idx]) columnMetadata.width = columnWidths[idx];
                    if (!isCurrencyFundamental && cellStyles[`header-${idx}`]) {
                        Object.assign(columnMetadata, cellStyles[`header-${idx}`]);
                    }
                    const adminOnly = (col.column_metadata as { admin_only?: boolean } | undefined)?.admin_only;
                    if (typeof adminOnly === 'boolean') {
                        columnMetadata.admin_only = adminOnly;
                    }
                    return {
                        id: serverCol?.id ?? (idx + 20000),
                        header: isCurrencyFundamental ? '' : (col.header || ''),
                        key: col.key || undefined,
                        column_index: idx,
                        column_metadata: columnMetadata,
                    };
                }),
                cells: rowsToSave.flatMap((row, rowIdx) => {
                    // Use the same row_index as in the rows array (idx) for consistency
                    // actualRowIdx is only used for formula calculations, not for backend mapping
                    const actualRowIdx = startRowIndex + rowIdx;
                    return columns.map((_, colIdx) => {
                        const cellData = row.cells[colIdx];
                        const formulaValue = cellData.formula || (cellData.value.startsWith('=') ? cellData.value : undefined);
                        let finalValue = cellData.value;

                        if (formulaValue) {
                            const calculated = calculateFormula(formulaValue, actualRowIdx, colIdx, rows, columns, formulaStartRow);
                            const num = parseFloat(calculated);
                            finalValue = !isNaN(num) ? formatNumber(num) : calculated;
                        } else {
                            finalValue = normalizePlainNumericValue(finalValue);
                        }

                        const serverCol = resolveServerColumnForUiIndex(colIdx);

                        return {
                            table_row_id: currentTable?.rows?.[rowIdx]?.id || (rowIdx + 10000),
                            table_column_id: serverCol?.id ?? (colIdx + 20000),
                            row_index: rowIdx, // Use same row_index as rows array for proper matching
                            column_index: colIdx, // Send column index for mapping
                            value: finalValue,
                            formula: formulaValue,
                            data_type: 'text',
                            cell_metadata: cellData.metadata || {}
                        };
                    });
                })
            };

            console.log('handleSaveTable - Payload to send:', {
                dynamic_table_id: payload.dynamic_table_id,
                rowsCount: payload.rows.length,
                columnsCount: payload.columns.length,
                cellsCount: payload.cells.length,
                rows: payload.rows,
                columns: payload.columns.slice(0, 2),
                cells: payload.cells.slice(0, 5)
            });

            let saveResponse;
            try {
                console.log('handleSaveTable - About to call saveTableStructure API');
                console.log('handleSaveTable - API endpoint:', apiConfig.endpoints.tableStructure);
                saveResponse = await dynamicTableService.saveTableStructure(payload);
                console.log('handleSaveTable - Save response received successfully');

                // Sync to Google Sheets after successful database save
                try {
                    console.log('handleSaveTable - Syncing to Google Sheets:', tableIdentifier);
                    // Extract just values for syncing
                    const valuesMatrix = rows.map(row =>
                        row.cells.map(cell => cell.formula || cell.value)
                    );
                    await googleSheetsService.syncTable(tableIdentifier, valuesMatrix, `A${formulaStartRow}`);
                    console.log('handleSaveTable - Google Sheets sync complete');
                } catch (syncError) {
                    console.error('handleSaveTable - Google Sheets sync failed:', syncError);
                    // Don't throw here, database save was successful
                }
            } catch (saveError) {
                console.error('handleSaveTable - Error saving table structure:', saveError);
                throw saveError;
            }

            console.log('handleSaveTable - Save response:', {
                hasData: !!saveResponse?.data,
                hasColumns: !!saveResponse?.data?.columns,
                columnsCount: saveResponse?.data?.columns?.length || 0,
                hasRows: !!saveResponse?.data?.rows,
                rowsCount: saveResponse?.data?.rows?.length || 0,
                rows: saveResponse?.data?.rows?.slice(0, 2) || 'no rows',
                firstRowCells: saveResponse?.data?.rows?.[0]?.cells?.length || 0
            });

            // If save response has data, use it directly instead of reloading
            // This ensures we see the saved data immediately
            if (saveResponse?.data) {
                // Process the save response data similar to loadTable
                const tableData = saveResponse.data;
                const tableRowsData = tableData.rows ? [...tableData.rows].sort((a, b) => a.row_index - b.row_index) : [];
                const tableColsData = [...tableData.columns!].sort((a, b) => a.column_index - b.column_index);

                setTable(tableData);
                setIsInitialized(true);

                const isCurrencyFundamental = tableIdentifier.startsWith('currency_fundamental_');
                let tableRows: TableRow[] = [];

                if (isCurrencyFundamental) {
                    const headerRow = {
                        id: 'header-row',
                        cells: tableColsData.map(() => ({
                            value: '',
                            metadata: { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' }
                        }))
                    };
                    tableRows = [headerRow];
                }

                if (tableRowsData.length > 0) {
                    const dataRows = tableRowsData
                        .map((row) => ({
                            id: `row-${row.id}`,
                            currencyPairId: row.currency_pair_id || undefined,
                            cells: tableColsData.map(col => {
                                const cell = row.cells?.find(c => c.table_column_id === col.id);
                                let cellMetadata = cell?.cell_metadata || {};
                                if (isCurrencyFundamental && (!cellMetadata || Object.keys(cellMetadata).length === 0)) {
                                    cellMetadata = { bgColor: '#111111', textColor: '#ffffff', borderColor: '#ffffff' };
                                }
                                return {
                                    value: cell?.value || '',
                                    formula: cell?.formula || undefined,
                                    metadata: cellMetadata
                                };
                            })
                        }))
                        .filter(row => !isRowEmpty(row)); // Filter out empty rows from response
                    tableRows = [...tableRows, ...dataRows];
                } else {
                    // If no rows, create empty rows
                    const emptyRowCount = initialRowCount || 12;
                    const emptyRows = Array.from({ length: emptyRowCount }, (_, idx) => ({
                        id: `row-empty-${idx}`,
                        cells: tableColsData.map(() => ({
                            value: '',
                            metadata: {}
                        }))
                    }));
                    tableRows = [...tableRows, ...emptyRows];
                }

                const tableCols = tableColsData.map((col) => ({
                    id: `col-${col.id}`,
                    header: col.header || '',
                    key: col.key || undefined,
                    column_metadata: col.column_metadata ? { ...col.column_metadata } : undefined,
                }));

                setRows(tableRows);
                setColumns(tableCols);

                // Update cell styles and column widths from metadata
                const styles: Record<string, CellMetadata> = {};
                const existingColumnWidths: Record<number, number> = {};

                tableColsData.forEach((col, colIdx) => {
                    if (col.column_metadata) {
                        if (!styles[`header-${colIdx}`] || !isCurrencyFundamental) {
                            styles[`header-${colIdx}`] = col.column_metadata as CellMetadata;
                        }
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

                setCellStyles(styles);
                setColumnWidths(existingColumnWidths);
            } else {
                // Fallback: reload table if save response doesn't have data
                await loadTable();
            }

            onSave?.();
            // Removed alert here as it is handled by toast in TableEditor.tsx
        } catch (error: any) {
            console.error('Failed to save table:', error);
            throw error; // Let TableEditor handle it via toast.promise
        } finally {
            setSaving(false);
        }
    };

    return {
        table, setTable,
        loading, setLoading,
        saving, setSaving,
        isInitialized, setIsInitialized,
        rows, setRows,
        columns, setColumns,
        rowCount, setRowCount,
        columnCount, setColumnCount,
        formulaStartRow, setFormulaStartRow,
        finalScore, setFinalScore,
        cellStyles, setCellStyles,
        columnWidths, setColumnWidths,
        borderStyle, setBorderStyle,
        borderColor, setBorderColor,
        hasHeaders, setHasHeaders,
        globalAlignment, setGlobalAlignment,
        tableIdentifier: (tableIdentifier && tableIdentifier !== 'undefined') ? tableIdentifier : (table?.identifier || (table?.id ? String(table.id) : '')),
        tableId: table?.id,
        loadTable,
        handleApply,
        handleClearTable,
        handleAddRow,
        handleAddColumn,
        handleDeleteRow,
        handleDeleteColumn,
        duplicateColumn,
        handleColumnHeaderChange,
        handleSaveTable,
        handleDeleteTable,
        hasAutoInitializedRef
    };
}
