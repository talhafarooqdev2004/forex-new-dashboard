import React from 'react';
import { TableRow, TableColumn } from '../types';
import { getCellReference } from '../utils/tableUtils';
import { getCellDisplayValue } from '../utils/formulaUtils';
import styles from '../../TableEditor.module.scss';

interface FormulaBarProps {
    selectedCell: { rowIndex: number; colIndex: number } | null;
    formulaBarValue: string;
    isEditingFormula: boolean;
    syncingCells: Record<string, boolean>;
    formulaBarInputRef: React.RefObject<HTMLInputElement | null>;
    rows: TableRow[];
    columns: TableColumn[];
    formulaStartRow: number;
    handleFormulaBarChange: (val: string) => void;
    setIsEditingFormula: (val: boolean) => void;
    handleFormulaBarKeyDown: (e: React.KeyboardEvent) => void;
    handleCellClick: (row: number, col: number) => void;
    applyFormulaToColumn: (row: number, col: number) => void;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
    selectedCell,
    formulaBarValue,
    isEditingFormula,
    syncingCells,
    formulaBarInputRef,
    rows,
    columns,
    formulaStartRow,
    handleFormulaBarChange,
    setIsEditingFormula,
    handleFormulaBarKeyDown,
    handleCellClick,
    applyFormulaToColumn
}) => {
    const isSyncing = selectedCell ? syncingCells[`${selectedCell.rowIndex}-${selectedCell.colIndex}`] : false;

    return (
        <div className={styles.formulaBar}>
            <div className={styles.formulaBarLabel}>
                {selectedCell ? (
                    <span className={styles.cellReference}>
                        {getCellReference(selectedCell.rowIndex, selectedCell.colIndex, formulaStartRow)}
                    </span>
                ) : (
                    <span className={styles.formulaIcon}>fx</span>
                )}
            </div>
            <input
                ref={formulaBarInputRef}
                type="text"
                className={styles.formulaBarInput}
                value={formulaBarValue}
                onChange={(e) => handleFormulaBarChange(e.target.value)}
                onFocus={() => setIsEditingFormula(true)}
                onKeyDown={(e) => {
                    handleFormulaBarKeyDown(e);
                    if (!isEditingFormula && selectedCell && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (selectedCell.rowIndex < rows.length - 1) handleCellClick(selectedCell.rowIndex + 1, selectedCell.colIndex);
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (selectedCell.rowIndex > 0) handleCellClick(selectedCell.rowIndex - 1, selectedCell.colIndex);
                        } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            if (selectedCell.colIndex < columns.length - 1) handleCellClick(selectedCell.rowIndex, selectedCell.colIndex + 1);
                        } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            if (selectedCell.colIndex > 0) handleCellClick(selectedCell.rowIndex, selectedCell.colIndex - 1);
                        }
                    }
                }}
                placeholder={selectedCell ? "Enter value or formula." : "Select a cell to edit"}
                disabled={!selectedCell}
            />
            {selectedCell && (
                <>
                    <div className={styles.formulaBarHint}>
                        {isSyncing ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className={styles.miniSpinner}></span> Calculating...
                            </span>
                        ) : rows[selectedCell.rowIndex]?.cells[selectedCell.colIndex]?.formula
                            ? `Result: ${getCellDisplayValue(selectedCell.rowIndex, selectedCell.colIndex, rows, columns, formulaStartRow)}`
                            : "Value"
                        }
                    </div>
                    {rows[selectedCell.rowIndex]?.cells[selectedCell.colIndex]?.formula && !isSyncing && (
                        <button
                            onClick={() => {
                                if (confirm(`Apply formula "${rows[selectedCell.rowIndex]?.cells[selectedCell.colIndex]?.formula}" to entire column? This will overwrite existing formulas in this column.`)) {
                                    applyFormulaToColumn(selectedCell.rowIndex, selectedCell.colIndex);
                                }
                            }}
                            className={styles.applyFormulaButton}
                            title="Apply this formula to all cells in the column (with adjusted row references)"
                        >
                            📋 Apply to Column
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
