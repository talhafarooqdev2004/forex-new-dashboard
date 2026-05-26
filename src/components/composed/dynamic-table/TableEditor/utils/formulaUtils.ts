import { calculateFormula as calculateFormulaUtil } from '@/utils/formulaCalculator';
import { googleSheetsService } from '@/services/googleSheets.service';
import { TableRow, TableColumn } from '../types';

// Flag to enable/disable Google Sheets integration
const USE_GOOGLE_SHEETS = process.env.NEXT_PUBLIC_USE_GOOGLE_SHEETS === 'true';

/**
 * Calculate formula using Google Sheets (async) or local calculator (sync fallback)
 * 
 * NOTE: This function now returns a Promise when USE_GOOGLE_SHEETS is true.
 * For backward compatibility, it returns a string when using local calculation.
 */
export const calculateFormula = (
    formula: string,
    rowIndex: number,
    colIndex: number,
    rows: TableRow[],
    columns: TableColumn[],
    formulaStartRow: number,
    visitedCells: Set<string> = new Set()
): string => {
    if (formula.trim().endsWith('+') || formula.trim().endsWith('-') || formula.trim().endsWith('*') || formula.trim().endsWith('/')) {
        return '';
    }

    // Use local calculator (original behavior)
    const tableData = { rows, columns };
    return calculateFormulaUtil(formula, rowIndex, colIndex, tableData, visitedCells, formulaStartRow);
};

/**
 * Calculate formula using Google Sheets API (async)
 * This is the new method that should be used for Google Sheets integration
 */
export const calculateFormulaAsync = async (
    formula: string,
    rowIndex: number,
    colIndex: number,
    tableId: string
): Promise<string> => {
    if (!formula || !formula.startsWith('=')) {
        return formula || '';
    }

    if (formula.trim().endsWith('+') || formula.trim().endsWith('-') || formula.trim().endsWith('*') || formula.trim().endsWith('/')) {
        return '';
    }

    try {
        // Convert row/col to cell reference (e.g., "C3")
        const cell = googleSheetsService.indexToCell(rowIndex, colIndex);
        
        // Update cell with formula and get calculated result
        const result = await googleSheetsService.updateCell(tableId, cell, formula);
        
        return result.value?.toString() || '';
    } catch (error) {
        console.error('Error calculating formula with Google Sheets:', error);
        return '#ERROR!';
    }
};

/** Display text for a cell — no thousands grouping or decimal stripping; preserves sheet/user strings. */
export const getCellDisplayValue = (
    rowIndex: number,
    colIndex: number,
    rows: TableRow[],
    columns: TableColumn[],
    formulaStartRow: number
): string => {
    const cellData = rows[rowIndex]?.cells[colIndex];
    if (!cellData) return '';

    if (cellData.formula) {
        if (cellData.value && cellData.value.trim() !== '' && !cellData.value.startsWith('=')) {
            return cellData.value;
        }
        const calculated = calculateFormula(cellData.formula, rowIndex, colIndex, rows, columns, formulaStartRow);
        if (calculated && !calculated.startsWith('=')) {
            return calculated;
        }
        return '';
    }

    return cellData.value || '';
};

export const extractNumericValue = (
    rowIndex: number,
    colIndex: number,
    rows: TableRow[],
    columns: TableColumn[],
    formulaStartRow: number
): number | null => {
    const cellData = rows[rowIndex]?.cells[colIndex];
    const raw = (cellData?.formula
        ? getCellDisplayValue(rowIndex, colIndex, rows, columns, formulaStartRow)
        : cellData?.value) ?? '';

    if (!raw || raw.trim() === '') return null;

    const normalized = raw.trim().replace(/,/g, '').replace(/%/g, '');
    const numValue = Number.parseFloat(normalized);
    if (Number.isNaN(numValue)) return null;

    return numValue;
};

export const calculateColumnSum = (
    colIndex: number,
    startRowIndex: number,
    endRowIndex: number,
    rows: TableRow[],
    columns: TableColumn[],
    formulaStartRow: number
): number => {
    let sum = 0;
    for (let rowIdx = startRowIndex; rowIdx <= endRowIndex && rowIdx < rows.length; rowIdx++) {
        const numericValue = extractNumericValue(rowIdx, colIndex, rows, columns, formulaStartRow);
        if (numericValue !== null) {
            sum += numericValue;
        }
    }
    return sum;
};

const normHeader = (h: string | undefined) => (h || "").toLowerCase().trim();

export function resolveMacroshiftScoreColumnIndex(columns: { header?: string; id?: string | number }[]): number {
    const byExact = columns.findIndex((c) => normHeader(c.header) === "macroshift score");
    if (byExact >= 0) return byExact;
    const byScore = columns.findIndex((c) => {
        const t = normHeader(c.header);
        return t.includes("macroshift") && t.includes("score");
    });
    if (byScore >= 0) return byScore;
    if (columns.length > 2 && normHeader(columns[2]?.header).includes("macroshift")) return 2;
    return columns.findIndex((c) => normHeader(c.header).includes("macroshift"));
}

export function resolveDivergenceScoreColumnIndex(columns: { header?: string; id?: string | number }[]): number {
    const byExact = columns.findIndex((c) => normHeader(c.header) === "divergence score");
    if (byExact >= 0) return byExact;
    const byScore = columns.findIndex((c) => {
        const t = normHeader(c.header);
        return t.includes("divergence") && t.includes("score");
    });
    if (byScore >= 0) return byScore;
    if (columns.length > 3 && normHeader(columns[3]?.header).includes("divergence")) return 3;
    return columns.findIndex((c) => normHeader(c.header).includes("divergence"));
}

/** True when the formula likely references another sheet (e.g. ='LATEST CURRENCY FUNDAMENTAL'!C25). */
function isLikelyCrossSheetReferenceFormula(formula: string | undefined): boolean {
    const t = (formula || "").trim();
    if (!t.startsWith("=")) return false;
    return /![A-Za-z]{1,3}\d+/.test(t);
}

function rowCellsLookLikeCrossSheetTotalsRow(
    row: TableRow | undefined,
    macroCol: number,
    divCol: number,
): boolean {
    const cells = row?.cells;
    if (!cells?.length) return false;
    const m = cells[macroCol]?.formula;
    const d = cells[divCol]?.formula;
    return isLikelyCrossSheetReferenceFormula(m) && isLikelyCrossSheetReferenceFormula(d);
}

function findCurrencyFundamentalsFooterRowIndex(
    rows: TableRow[],
    macroCol: number,
    divCol: number,
    sheetRowNumbers: number[] | undefined,
    formulaTotalsRow: number | undefined,
): number | null {
    const n = rows.length;
    if (n === 0) return null;
    if (formulaTotalsRow != null && sheetRowNumbers?.length === n) {
        const exact = sheetRowNumbers.findIndex((r) => r === formulaTotalsRow);
        if (exact >= 0) return exact;
    }
    for (let i = n - 1; i >= 0; i--) {
        if (rowCellsLookLikeCrossSheetTotalsRow(rows[i], macroCol, divCol)) return i;
    }
    return null;
}

function resolveFirstDataRowArrayIndex(
    rowCount: number,
    formulaStartRow: number,
    sheetRowNumbers: number[] | undefined,
): number {
    if (sheetRowNumbers?.length === rowCount) {
        const i = sheetRowNumbers.findIndex((r) => r >= formulaStartRow);
        return i >= 0 ? i : 0;
    }
    return formulaStartRow > 1 ? formulaStartRow - 1 : 1;
}

function resolveLastDataRowArrayIndexForSum(
    rowCount: number,
    formulaTotalsRow: number | undefined,
    sheetRowNumbers: number[] | undefined,
    footerRowIndex: number | null,
): number {
    if (footerRowIndex != null) {
        return Math.max(0, footerRowIndex - 1);
    }
    if (formulaTotalsRow != null && sheetRowNumbers?.length === rowCount) {
        const totalsIdx = sheetRowNumbers.findIndex((r) => r === formulaTotalsRow);
        if (totalsIdx >= 0) return Math.max(0, totalsIdx - 1);
        const firstAtOrPast = sheetRowNumbers.findIndex((r) => r >= formulaTotalsRow);
        if (firstAtOrPast >= 0) return Math.max(0, firstAtOrPast - 1);
    }
    if (formulaTotalsRow != null) {
        return Math.min(rowCount - 1, Math.max(0, formulaTotalsRow - 2));
    }
    return rowCount - 1;
}

export type CalculateFinalScoreOptions = {
    sheetRowNumbers?: number[];
    formulaTotalsRow?: number;
};

export const calculateFinalScore = (
    rows: TableRow[],
    columns: TableColumn[],
    formulaStartRow: number,
    tableIdentifier: string,
    options?: CalculateFinalScoreOptions,
): { macroshiftSum: number; divergenceSum: number; finalScore: number } => {
    void tableIdentifier;
    const macroshiftScoreColIndex = resolveMacroshiftScoreColumnIndex(columns);
    const divergenceScoreColIndex = resolveDivergenceScoreColumnIndex(columns);

    if (macroshiftScoreColIndex < 0 || divergenceScoreColIndex < 0) {
        return { macroshiftSum: 0, divergenceSum: 0, finalScore: 0 };
    }

    const sheetRows = options?.sheetRowNumbers;
    const formulaTotalsRow = options?.formulaTotalsRow;

    const footerIdx = findCurrencyFundamentalsFooterRowIndex(
        rows,
        macroshiftScoreColIndex,
        divergenceScoreColIndex,
        sheetRows,
        formulaTotalsRow,
    );

    if (footerIdx != null) {
        const macroFromFooter = extractNumericValue(footerIdx, macroshiftScoreColIndex, rows, columns, formulaStartRow);
        const divFromFooter = extractNumericValue(footerIdx, divergenceScoreColIndex, rows, columns, formulaStartRow);
        if (macroFromFooter !== null && divFromFooter !== null) {
            return {
                macroshiftSum: macroFromFooter,
                divergenceSum: divFromFooter,
                finalScore: macroFromFooter + divFromFooter,
            };
        }
    }

    const startRow = resolveFirstDataRowArrayIndex(rows.length, formulaStartRow, sheetRows);
    const endRow = resolveLastDataRowArrayIndexForSum(rows.length, formulaTotalsRow, sheetRows, footerIdx);

    if (endRow < startRow) {
        return { macroshiftSum: 0, divergenceSum: 0, finalScore: 0 };
    }

    const macroshiftSum = calculateColumnSum(macroshiftScoreColIndex, startRow, endRow, rows, columns, formulaStartRow);
    const divergenceSum = calculateColumnSum(divergenceScoreColIndex, startRow, endRow, rows, columns, formulaStartRow);
    const finalScore = macroshiftSum + divergenceSum;

    return { macroshiftSum, divergenceSum, finalScore };
};
