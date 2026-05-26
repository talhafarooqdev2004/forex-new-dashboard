// Round floating point numbers to fix precision issues
// Rounds to 15 decimal places to handle JavaScript floating point errors
export const roundFloat = (num: number): number => {
    if (!isFinite(num)) return num;
    return Math.round(num * 1e15) / 1e15;
};

/** Fractional part is Excel/JS float noise (e.g. 999999999942, 999999). */
function isNineFloatNoise(frac: string): boolean {
    if (!frac) return false;
    if (/9{4,}/.test(frac)) return true;
    if (frac.length >= 4 && /^9+$/.test(frac)) return true;
    const nineCount = (frac.match(/9/g) ?? []).length;
    return frac.length >= 4 && nineCount / frac.length >= 0.75;
}

/** Snap values like 381615.0000000000058 → 381615 (float noise; keeps real decimals like 0.17). */
export const snapNearInteger = (num: number, fracPart?: string): number => {
    if (!Number.isFinite(num)) return num;
    const r = Math.round(num);
    const epsilon = Math.max(1e-7, Math.abs(r) * 1e-9);
    if (Math.abs(num - r) < epsilon) return r;
    if (fracPart && isNineFloatNoise(fracPart)) return r;
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

function addThousandsSeparators(plain: string): string {
    const sign = plain.startsWith("-") ? "-" : "";
    const unsigned = sign ? plain.slice(1) : plain;
    const [intPart, fracPart] = unsigned.split(".");
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fracPart !== undefined ? `${sign}${grouped}.${fracPart}` : `${sign}${grouped}`;
}

/** Infer decimal places to keep for float noise (e.g. 000000000058 → 3); never keep nine-runs. */
function inferStableDecimalPlaces(frac: string): number {
    if (!frac) return 0;
    if (isNineFloatNoise(frac)) return 0;
    if (frac.length > 6) {
        const leadingZeros = frac.match(/^0+/)?.[0].length ?? 0;
        if (leadingZeros >= 1) return Math.min(3, leadingZeros);
        return 0;
    }
    return frac.length;
}

/**
 * Cleans float noise in stored/displayed numeric cells without changing real user intent.
 * e.g. 422,587.000000000058 → 422,587.000 ; 319,164.999999999942 → 319,165
 */
export function normalizeCellValueString(value: string): string {
    if (value == null) return "";
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith("=")) return value;

    const hasPercent = trimmed.endsWith("%");
    const core = hasPercent ? trimmed.slice(0, -1).trim() : trimmed;
    const useCommas = core.includes(",");
    const norm = core.replace(/,/g, "");
    if (!/^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i.test(norm)) return value;

    const fracPart = norm.includes(".") ? norm.split(".")[1] ?? "" : "";
    let n = Number.parseFloat(norm);
    if (!Number.isFinite(n)) return value;

    n = roundFloat(snapNearInteger(n, fracPart));

    const decimals = inferStableDecimalPlaces(fracPart);
    let plain = decimals > 0 ? n.toFixed(decimals) : formatNumber(n);
    if (hasPercent) plain = `${plain}%`;
    if (!useCommas) return plain;
    if (hasPercent) {
        const withoutPct = plain.slice(0, -1);
        return `${addThousandsSeparators(withoutPct)}%`;
    }
    return addThousandsSeparators(plain);
}

/** Convert API/sheet cell payload to string without reformatting (FORMATTED_VALUE from Sheets). */
export function toCellValueString(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : String(value);
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return String(value);
}

/** Value shown in the formula bar and in-cell editor — exact stored value; formulas unchanged. */
export function getCellEditorString(cell: { value?: string; formula?: string } | undefined): string {
    if (!cell) return '';
    const formula = cell.formula?.trim();
    if (formula) return cell.formula!;
    return cell.value ?? '';
}

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
