import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { TableRow, TableColumn } from '../types';
import { adjustFormulaForRow, formatNumber } from '../utils/tableUtils';
import { calculateFormula, calculateFormulaAsync } from '../utils/formulaUtils';
import { googleSheetsService } from '@/services/googleSheets.service';

// Check if Google Sheets is enabled
const USE_GOOGLE_SHEETS = process.env.NEXT_PUBLIC_USE_GOOGLE_SHEETS === 'true';

// Log the mode on load
console.log('🔧 Formula Engine Mode:', {
    useGoogleSheets: USE_GOOGLE_SHEETS,
    envValue: process.env.NEXT_PUBLIC_USE_GOOGLE_SHEETS,
    apiUrl: process.env.NEXT_PUBLIC_API_URL
});

export function useFormulaEditor(
    rows: TableRow[],
    columns: TableColumn[],
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>,
    formulaStartRow: number,
    handleCellStyleChange: (rowIndex: number | 'header', colIndex: number, style: any) => void,
    tableIdentifier: string, // Should be numeric table ID (as string) when available, or string identifier as fallback
    useSpreadEngine: boolean
) {
    console.log('🎯🎯🎯 useFormulaEditor initialized with tableIdentifier:', {
        tableIdentifier,
        type: typeof tableIdentifier,
        isEmpty: !tableIdentifier,
        value: JSON.stringify(tableIdentifier)
    });

    // Ensure we ALWAYS have a valid tableId for Google Sheets
    // Use a stable ref to prevent issues during rapid edits
    const tableIdRef = useRef<string>(tableIdentifier || 'default-table');
    const lastSyncedValueRef = useRef<string | null>(null);
    const syncingRef = useRef<Record<string, boolean>>({});

    // Update ref when prop changes
    useEffect(() => {
        if (tableIdentifier && tableIdentifier !== 'undefined' && tableIdentifier !== '') {
            console.log('🔄 useFormulaEditor - tableIdentifier updated:', tableIdentifier);
            tableIdRef.current = tableIdentifier;
        }
    }, [tableIdentifier]);

    const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
    const [formulaBarValue, setFormulaBarValue] = useState('');
    const [isEditingFormula, setIsEditingFormula] = useState(false);
    const [syncingCells, setSyncingCells] = useState<Record<string, boolean>>({});
    const formulaBarInputRef = useRef<HTMLInputElement>(null);

    const handleCellChange = useCallback(async (rowIndex: number, colIndex: number, value: string) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        if (syncingRef.current[cellKey]) {
            console.log('⏳ Sync already in progress for this cell, skipping');
            return;
        }

        console.log('🏁 handleCellChange called:', { rowIndex, colIndex, value, lastSynced: lastSyncedValueRef.current, useSpreadEngine });

        // Use the current tableId from prop or ref
        // Priority: latest tableIdentifier param > ref value > default-table
        const currentTableId = (tableIdentifier && tableIdentifier !== 'undefined' && tableIdentifier !== '')
            ? tableIdentifier
            : (tableIdRef.current && tableIdRef.current !== 'undefined' && tableIdRef.current !== '' && tableIdRef.current !== 'default-table')
                ? tableIdRef.current
                : 'default-table';

        if (USE_GOOGLE_SHEETS) {
            // Check if value actually changed from the last synced value before sending API call
            // For formulas (starting with '='), we always allow sync on Enter/blur to ensure latest calculation
            if (value === lastSyncedValueRef.current && value !== '=' && !value.startsWith('=')) {
                console.log('⏭️ Skipping sync: Value matches lastSyncedValueRef');
                return;
            }

            try {
                syncingRef.current[cellKey] = true;
                setSyncingCells(prev => ({ ...prev, [cellKey]: true }));

                // Determine if we need to call the API based on the useSpreadEngine toggle
                let calculatedValue = value;
                let needsApiCall = useSpreadEngine;

                if (!useSpreadEngine && value.startsWith('=')) {
                    console.log('🧮 Using Local Engine for formula evaluation:', value);

                    // We'll calculate it inside setRows to have access to the latest rows
                }

                // Update local state immediately
                setRows(prevRows => {
                    const newRows = [...prevRows];
                    if (newRows[rowIndex]) {
                        const newCells = [...newRows[rowIndex].cells];
                        const cellData = { ...newCells[colIndex] };

                        cellData.formula = value.startsWith('=') ? value : undefined;

                        if (!useSpreadEngine && value.startsWith('=')) {
                            // Use local calculation result
                            const localResult = calculateFormula(value, rowIndex, colIndex, prevRows, columns, formulaStartRow);
                            console.log('✅ Local formula evaluation result inside setRows:', localResult);
                            const numValue = parseFloat(localResult);
                            cellData.value = !isNaN(numValue) ? formatNumber(numValue) : localResult;
                        } else if (value.startsWith('=')) {
                            // If needs API call, keep old value or show placeholder
                            // DON'T set cellData.value = value because value is the formula string
                            cellData.value = cellData.value || '';
                        } else {
                            cellData.value = value;
                        }

                        newCells[colIndex] = cellData;
                        newRows[rowIndex] = { ...newRows[rowIndex], cells: newCells };
                    }
                    return newRows;
                });

                // Only call API if useSpreadEngine is true
                if (needsApiCall) {
                    console.log('🔄 Google Sheets API call starting...', {
                        table: currentTableId,
                        cell: googleSheetsService.indexToCell(rowIndex, colIndex, formulaStartRow - 1),
                        value
                    });

                    const cell = googleSheetsService.indexToCell(rowIndex, colIndex, formulaStartRow - 1);

                    // Update cell in Google Sheets and get calculated result
                    const result = await googleSheetsService.updateCell(currentTableId, cell, value);
                    calculatedValue = result.value?.toString() || '';

                    console.log('✅ Google Sheets result received:', { cell, result: calculatedValue });

                    // Update local state with the final calculated value from Google
                    setRows(prevRows => {
                        const newRows = [...prevRows];
                        if (newRows[rowIndex]) {
                            const newCells = [...newRows[rowIndex].cells];
                            const cellData = { ...newCells[colIndex] };

                            // IMPORTANT: Always preserve the formula if one was entered
                            cellData.formula = value.startsWith('=') ? value : undefined;

                            // Round numeric values if it's a number
                            const numValue = parseFloat(calculatedValue);
                            cellData.value = !isNaN(numValue) ? formatNumber(numValue) : calculatedValue;

                            newCells[colIndex] = cellData;
                            newRows[rowIndex] = { ...newRows[rowIndex], cells: newCells };
                        }
                        return newRows;
                    });
                }

                // Update last synced value
                lastSyncedValueRef.current = value;

            } catch (error) {
                console.error('❌ Error syncing with Google Sheets:', error);
                // Reset last synced on error to allow retry
                lastSyncedValueRef.current = null;
            } finally {
                syncingRef.current[cellKey] = false;
                setSyncingCells(prev => {
                    const next = { ...prev };
                    delete next[cellKey];
                    return next;
                });
            }
        } else {
            // Local mode or non-formula value
            setRows(prevRows => {
                const newRows = [...prevRows];
                if (newRows[rowIndex]) {
                    const newCells = [...newRows[rowIndex].cells];
                    const cell = { ...newCells[colIndex] };
                    let roundedValue = value;

                    if (value.startsWith('=')) {
                        // Formula with local calculation
                        cell.formula = value;
                        const calculated = calculateFormula(value, rowIndex, colIndex, prevRows, columns, formulaStartRow);
                        console.log('✅ Local-only mode result:', calculated);
                        if (calculated && calculated.trim() !== '' && !calculated.startsWith('=')) {
                            const numValue = parseFloat(calculated);
                            roundedValue = !isNaN(numValue) ? formatNumber(numValue) : calculated;
                        } else if (calculated && calculated.startsWith('=')) {
                            // If it still starts with =, it's probably an error or unprocessed
                            roundedValue = '';
                        } else {
                            roundedValue = '';
                        }
                    } else {
                        const trimmed = value.trim();
                        const normalized = trimmed.replace(/,/g, '');
                        const numValue = Number.parseFloat(normalized);
                        const looksNumeric =
                            normalized !== '' &&
                            !Number.isNaN(numValue) &&
                            /^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i.test(normalized);

                        if (looksNumeric) {
                            roundedValue = formatNumber(numValue);
                        } else {
                            roundedValue = value;
                        }
                        cell.formula = undefined;
                    }
                    cell.value = roundedValue;
                    newCells[colIndex] = cell;
                    newRows[rowIndex] = { ...newRows[rowIndex], cells: newCells };
                }
                return newRows;
            });
        }
    }, [columns, formulaStartRow, setRows, tableIdentifier, useSpreadEngine]);

    const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
        setSelectedCell(prev => {
            const isSameCell = prev?.rowIndex === rowIndex && prev?.colIndex === colIndex;

            // We need the latest rows here, so we'll use a functional update for rows indirectly
            // but actually we just need the cell data.
            // Since this is a click, it's ok to use the 'rows' from closure as it's just for display
            const cellData = rows[rowIndex]?.cells[colIndex];
            const val = cellData?.formula || cellData?.value || '';
            setFormulaBarValue(val);

            // Only update lastSyncedValueRef if we're clicking a different cell
            if (!isSameCell) {
                console.log('📍 New cell selected, resetting lastSyncedValueRef:', val);
                lastSyncedValueRef.current = val;
            }

            return { rowIndex, colIndex };
        });

        setIsEditingFormula(false);

        setTimeout(() => {
            if (formulaBarInputRef.current) {
                formulaBarInputRef.current.focus();
                formulaBarInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }, [rows]);

    const applyFormulaToColumn = useCallback(async (rowIndex: number, colIndex: number) => {
        // We need the formula from the current row. 
        // Since this is a one-time action triggered by user, using 'rows' from closure is acceptable,
        // but we'll still be careful.
        const cellData = rows[rowIndex]?.cells[colIndex];
        if (!cellData?.formula) {
            toast.error('Selected cell does not have a formula');
            return;
        }

        const sourceFormula = cellData.formula;
        const currentTableId = (tableIdentifier && tableIdentifier !== 'undefined') ? tableIdentifier :
            (tableIdRef.current && tableIdRef.current !== 'undefined' ? tableIdRef.current : 'default-table');

        if (USE_GOOGLE_SHEETS) {
            // Google Sheets mode - respect the useSpreadEngine toggle
            try {
                if (useSpreadEngine) {
                    console.log('🔄 Applying formula to column using Spread Engine (API)');

                    const updates = rows
                        .map((row, idx) => {
                            if (idx === rowIndex) return null;
                            const adjustedFormula = adjustFormulaForRow(sourceFormula, rowIndex, idx);
                            const cell = googleSheetsService.indexToCell(idx, colIndex, formulaStartRow - 1);
                            return { cell, value: adjustedFormula };
                        })
                        .filter((update): update is { cell: string; value: string } => update !== null);

                    const result = await googleSheetsService.batchUpdateCells(currentTableId, updates);
                    console.log('✅ Formula applied to column via Spread Engine API');

                    // Update local state with API results
                    setRows(prevRows => {
                        return prevRows.map((row, idx) => {
                            if (idx === rowIndex) return row;
                            const cell = googleSheetsService.indexToCell(idx, colIndex, formulaStartRow - 1);
                            const updateResult = result.updates.find(u => u.cell === cell);
                            const calculatedValue = updateResult?.value?.toString() || '';
                            const numValue = parseFloat(calculatedValue);
                            const roundedValue = !isNaN(numValue) ? formatNumber(numValue) : calculatedValue;
                            const adjustedFormula = adjustFormulaForRow(sourceFormula, rowIndex, idx);

                            const newCells = [...row.cells];
                            newCells[colIndex] = {
                                ...newCells[colIndex],
                                formula: adjustedFormula,
                                value: roundedValue
                            };

                            return {
                                ...row,
                                cells: newCells
                            };
                        });
                    });
                } else {
                    // Use local engine for all rows
                    console.log('✅ Applying formula to column using Local Engine');

                    setRows(prevRows => {
                        return prevRows.map((row, idx) => {
                            if (idx === rowIndex) return row;
                            const adjustedFormula = adjustFormulaForRow(sourceFormula, rowIndex, idx);
                            const localResult = calculateFormula(adjustedFormula, idx, colIndex, prevRows, columns, formulaStartRow);

                            const numValue = parseFloat(localResult);
                            const roundedValue = !isNaN(numValue) ? formatNumber(numValue) : localResult;

                            return {
                                ...row,
                                cells: row.cells.map((c, cIdx) =>
                                    cIdx === colIndex ? { ...c, formula: adjustedFormula, value: roundedValue } : c
                                )
                            };
                        });
                    });
                }
            } catch (error) {
                console.error('❌ Error applying formula to column:', error);
                toast.error('Failed to apply formula. Please try again.');
            }
        } else {
            // Local mode
            setRows(prevRows => {
                return prevRows.map((row, idx) => {
                    if (idx === rowIndex) return row;
                    const adjustedFormula = adjustFormulaForRow(sourceFormula, rowIndex, idx);
                    const calculated = calculateFormula(adjustedFormula, idx, colIndex, prevRows, columns, formulaStartRow);
                    let roundedValue = calculated;
                    const numValue = parseFloat(calculated);
                    if (!isNaN(numValue)) roundedValue = formatNumber(numValue);
                    return {
                        ...row,
                        cells: row.cells.map((c, cIdx) =>
                            cIdx === colIndex ? { ...c, formula: adjustedFormula, value: roundedValue } : c
                        )
                    };
                });
            });
        }
    }, [columns, formulaStartRow, rows, setRows, tableIdentifier, useSpreadEngine]);

    const handleInstantCellUpdate = useCallback((rowIndex: number, colIndex: number, value: string) => {
        setRows(prevRows => {
            const newRows = [...prevRows];
            if (newRows[rowIndex]) {
                const newCells = [...newRows[rowIndex].cells];
                newCells[colIndex] = {
                    ...newCells[colIndex],
                    value: value,
                    formula: value.startsWith('=') ? value : undefined
                };
                newRows[rowIndex] = { ...newRows[rowIndex], cells: newCells };
            }
            return newRows;
        });
    }, [setRows]);

    const handleFormulaBarChange = useCallback((value: string) => {
        setFormulaBarValue(value);

        // Update local UI immediately while typing, but do NOT trigger backend sync
        if (selectedCell) {
            handleInstantCellUpdate(selectedCell.rowIndex, selectedCell.colIndex, value);
        }
    }, [selectedCell, handleInstantCellUpdate]);

    const handleFormulaBarKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && selectedCell) {
            const valueToSync = (e.target as HTMLInputElement).value;
            setIsEditingFormula(false);
            // Trigger the actual cell change logic (including API call) on Enter
            console.log('⌨️ Enter pressed in formula bar, syncing:', valueToSync);
            handleCellChange(selectedCell.rowIndex, selectedCell.colIndex, valueToSync);
        } else if (e.key === 'Escape') {
            setIsEditingFormula(false);
            if (selectedCell) {
                // Here we need the latest row data to restore the value
                // Using rows from closure is acceptable here for a cancel action
                const cellData = rows[selectedCell.rowIndex]?.cells[selectedCell.colIndex];
                setFormulaBarValue(cellData?.formula || cellData?.value || '');
            }
        }
    }, [selectedCell, rows, handleCellChange]);

    return {
        selectedCell, setSelectedCell,
        formulaBarValue, setFormulaBarValue,
        isEditingFormula, setIsEditingFormula,
        syncingCells,
        formulaBarInputRef,
        handleCellChange,
        handleInstantCellUpdate,
        handleCellClick,
        applyFormulaToColumn,
        handleFormulaBarChange,
        handleFormulaBarKeyDown
    };
}
