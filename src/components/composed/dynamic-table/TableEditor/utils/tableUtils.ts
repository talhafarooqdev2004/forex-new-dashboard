// Round floating point numbers to fix precision issues
// Rounds to 15 decimal places to handle JavaScript floating point errors
export const roundFloat = (num: number): number => {
    if (!isFinite(num)) return num;
    return Math.round(num * 1e15) / 1e15;
};

/** Snap values like 381615.0000000000058 → 381615 (float noise; keeps real decimals like 0.17). */
export const snapNearInteger = (num: number): number => {
    if (!Number.isFinite(num)) return num;
    const r = Math.round(num);
    if (Math.abs(num - r) < 1e-7) return r;
    return num;
};

// Convert column index to letter (A, B, C...)
export const getColumnLetter = (colIndex: number): string => {
    return String.fromCharCode(65 + colIndex);
};

// Get cell reference (e.g., "B2", "C3")
export const getCellReference = (rowIndex: number, colIndex: number, formulaStartRow: number): string => {
    return `${getColumnLetter(colIndex)}${rowIndex + formulaStartRow}`;
};

// Format a number to remove unnecessary decimal places while preserving precision
export const formatNumber = (num: number): string => {
    const rounded = roundFloat(snapNearInteger(roundFloat(num)));
    let formatted = rounded.toFixed(12);
    formatted = formatted.replace(/\.?0+$/, '');
    return formatted;
};

/** Thousands separators for table display (matches DynamicTableDisplay). */
export const formatNumberGrouped = (num: number): string => {
    const rounded = roundFloat(snapNearInteger(roundFloat(num)));
    if (!Number.isFinite(rounded)) return String(num);
    const s = formatNumber(rounded);
    const sign = s.startsWith("-") ? "-" : "";
    const unsigned = sign ? s.slice(1) : s;
    const [intPart, fracPart] = unsigned.split(".");
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fracPart !== undefined ? `${sign}${grouped}.${fracPart}` : `${sign}${grouped}`;
};

// Adjust formula cell references for a different row
export const adjustFormulaForRow = (formula: string, sourceRowIndex: number, targetRowIndex: number): string => {
    if (!formula.startsWith('=')) {
        return formula;
    }

    const rowOffset = targetRowIndex - sourceRowIndex;
    if (rowOffset === 0) {
        return formula;
    }

    const cellRefRegex = /([A-Z]+)(\d+)/g;
    return formula.replace(cellRefRegex, (match, colLetter, rowNum) => {
        const originalExcelRow = parseInt(rowNum);
        if (originalExcelRow < 1) {
            return match;
        }

        const newExcelRow = originalExcelRow + rowOffset;
        const adjustedRow = Math.max(1, newExcelRow);
        return `${colLetter}${adjustedRow}`;
    });
};
