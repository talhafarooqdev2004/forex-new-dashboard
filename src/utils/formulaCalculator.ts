/* eslint-disable no-new-func */

interface CellData {
    value: string;
    formula?: string;
}

interface TableData {
    rows: Array<{ cells: CellData[] }>;
    columns: Array<{ id: string }>;
}

const roundFloat = (num: number): number => {
    if (!isFinite(num)) return num;
    return Math.round(num * 1e15) / 1e15;
};

const formatNumber = (num: number): string => {
    const rounded = roundFloat(num);
    let formatted = rounded.toFixed(12);
    formatted = formatted.replace(/\.?0+$/, "");
    return formatted;
};

const getColumnIndex = (columnLetters: string): number => {
    let index = 0;
    const letters = columnLetters.toUpperCase();

    for (let i = 0; i < letters.length; i++) {
        index = index * 26 + (letters.charCodeAt(i) - 64);
    }

    return index - 1;
};

const getCellReferenceInfo = (reference: string) => {
    const cleanReference = reference.replace(/\$/g, "").toUpperCase();
    const match = cleanReference.match(/^([A-Z]+)(\d+)$/);

    if (!match) {
        return null;
    }

    return {
        colIndex: getColumnIndex(match[1]),
        rowNumber: Number(match[2]),
    };
};

const normalizeScalar = (value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    if (typeof value === "boolean") {
        return value;
    }

    const numeric = Number(value);
    if (!Number.isNaN(numeric) && String(value).trim() !== "") {
        return numeric;
    }

    return value;
};

const flattenValues = (values: any[]): any[] => values.flatMap((value) => (Array.isArray(value) ? flattenValues(value) : [value]));

const createFormulaHelpers = (tableData: TableData, formulaStartRow: number, visitedCells: Set<string>) => {
    const resolveCell = (rowIndex: number, colIndex: number): any => {
        const cellKey = `${rowIndex}-${colIndex}`;
        if (visitedCells.has(cellKey)) {
            return 0;
        }

        const cell = tableData.rows[rowIndex]?.cells?.[colIndex];
        if (!cell) {
            return 0;
        }

        if (cell.formula) {
            const nextVisited = new Set(visitedCells);
            nextVisited.add(cellKey);
            return calculateFormula(cell.formula, rowIndex, colIndex, tableData, nextVisited, formulaStartRow);
        }

        return normalizeScalar(cell.value);
    };

    const resolveReference = (reference: string): any => {
        const info = getCellReferenceInfo(reference);
        if (!info) {
            return 0;
        }

        const rowIndex = info.rowNumber - formulaStartRow;
        if (rowIndex < 0 || rowIndex >= tableData.rows.length) {
            return 0;
        }

        return resolveCell(rowIndex, info.colIndex);
    };

    const resolveRange = (referenceRange: string): any[] => {
        const [start, end] = referenceRange.split(":");
        const startInfo = getCellReferenceInfo(start);
        const endInfo = getCellReferenceInfo(end);

        if (!startInfo || !endInfo) {
            return [];
        }

        const startRow = startInfo.rowNumber - formulaStartRow;
        const endRow = endInfo.rowNumber - formulaStartRow;
        const firstRow = Math.min(startRow, endRow);
        const lastRow = Math.max(startRow, endRow);
        const firstCol = Math.min(startInfo.colIndex, endInfo.colIndex);
        const lastCol = Math.max(startInfo.colIndex, endInfo.colIndex);

        const values: any[] = [];
        for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
            for (let colIndex = firstCol; colIndex <= lastCol; colIndex++) {
                values.push(resolveCell(rowIndex, colIndex));
            }
        }

        return values;
    };

    const sum = (...args: any[]) => flattenValues(args).reduce((total, value) => {
        const num = Number(value);
        return Number.isNaN(num) ? total : total + num;
    }, 0);

    const average = (...args: any[]) => {
        const values = flattenValues(args).map(Number).filter((value) => !Number.isNaN(value));
        if (values.length === 0) return 0;
        return sum(values) / values.length;
    };

    const min = (...args: any[]) => {
        const values = flattenValues(args).map(Number).filter((value) => !Number.isNaN(value));
        return values.length ? Math.min(...values) : 0;
    };

    const max = (...args: any[]) => {
        const values = flattenValues(args).map(Number).filter((value) => !Number.isNaN(value));
        return values.length ? Math.max(...values) : 0;
    };

    const count = (...args: any[]) => flattenValues(args).filter((value) => !Number.isNaN(Number(value))).length;

    const ifFn = (condition: any, whenTrue: any, whenFalse: any) => (condition ? whenTrue : whenFalse);
    const abs = (value: any) => Math.abs(Number(value));
    const round = (value: any, digits: any = 0) => {
        const number = Number(value);
        const precision = Number(digits) || 0;
        if (Number.isNaN(number)) return 0;
        const factor = 10 ** precision;
        return Math.round(number * factor) / factor;
    };
    const roundup = (value: any, digits: any = 0) => {
        const number = Number(value);
        const precision = Number(digits) || 0;
        if (Number.isNaN(number)) return 0;
        const factor = 10 ** precision;
        return Math.ceil(number * factor) / factor;
    };
    const rounddown = (value: any, digits: any = 0) => {
        const number = Number(value);
        const precision = Number(digits) || 0;
        if (Number.isNaN(number)) return 0;
        const factor = 10 ** precision;
        return Math.floor(number * factor) / factor;
    };
    const and = (...args: any[]) => flattenValues(args).every(Boolean);
    const or = (...args: any[]) => flattenValues(args).some(Boolean);
    const not = (value: any) => !value;

    return {
        CELL: resolveReference,
        RANGE: resolveRange,
        SUM: sum,
        AVERAGE: average,
        MIN: min,
        MAX: max,
        COUNT: count,
        IF: ifFn,
        ABS: abs,
        ROUND: round,
        ROUNDUP: roundup,
        ROUNDDOWN: rounddown,
        AND: and,
        OR: or,
        NOT: not,
    };
};

const normalizeFormula = (formula: string) => {
    let processed = formula.trim();
    const quotedStrings: string[] = [];

    processed = processed.replace(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g, (match) => {
        const token = `__STRING_${quotedStrings.length}__`;
        quotedStrings.push(match);
        return token;
    });

    processed = processed.replace(/\$/g, "");
    processed = processed.replace(/<>/g, "!=");
    processed = processed.replace(/(?<![<>=!])=(?![=])/g, "==");
    processed = processed.replace(/\^/g, "**");
    processed = processed.replace(/&/g, "+");
    processed = processed.replace(/\b(true|false)\b/gi, (match) => match.toLowerCase());
    processed = processed.replace(/\b(sum|average|min|max|count|if|abs|round|roundup|rounddown|and|or|not)\s*\(/gi, (match) => match.toUpperCase());

    const rangeTokens: string[] = [];
    processed = processed.replace(/([A-Z]+\d+:[A-Z]+\d+)/gi, (match) => {
        const token = `__RANGE_${rangeTokens.length}__`;
        rangeTokens.push(match);
        return token;
    });

    processed = processed.replace(/(?<![A-Z_])([A-Z]+\d+)(?![A-Z_])/gi, 'CELL("$1")');

    processed = processed.replace(/__RANGE_(\d+)__/g, (_, index: string) => `RANGE("${rangeTokens[Number(index)]}")`);
    processed = processed.replace(/__STRING_(\d+)__/g, (_, index: string) => quotedStrings[Number(index)]);

    return processed;
};

export const calculateFormula = (
    formula: string,
    rowIndex: number,
    colIndex: number,
    tableData: TableData,
    visitedCells: Set<string> = new Set(),
    formulaStartRow: number = 1
): string => {
    if (!formula || !formula.startsWith("=")) {
        return formula || "";
    }

    const trimmedFormula = formula.trim();
    if (trimmedFormula.endsWith("+") || trimmedFormula.endsWith("-") || trimmedFormula.endsWith("*") || trimmedFormula.endsWith("/")) {
        return "";
    }

    try {
        const activeVisited = new Set(visitedCells);
        activeVisited.add(`${rowIndex}-${colIndex}`);
        const normalized = normalizeFormula(trimmedFormula.slice(1));
        const helpers = createFormulaHelpers(tableData, formulaStartRow, activeVisited);
        const evaluator = new Function(
            "CELL",
            "RANGE",
            "SUM",
            "AVERAGE",
            "MIN",
            "MAX",
            "COUNT",
            "IF",
            "ABS",
            "ROUND",
            "ROUNDUP",
            "ROUNDDOWN",
            "AND",
            "OR",
            "NOT",
            `return (${normalized});`
        );

        const result = evaluator(
            helpers.CELL,
            helpers.RANGE,
            helpers.SUM,
            helpers.AVERAGE,
            helpers.MIN,
            helpers.MAX,
            helpers.COUNT,
            helpers.IF,
            helpers.ABS,
            helpers.ROUND,
            helpers.ROUNDUP,
            helpers.ROUNDDOWN,
            helpers.AND,
            helpers.OR,
            helpers.NOT
        );

        if (result === null || result === undefined) {
            return "";
        }

        if (typeof result === "number") {
            return formatNumber(result);
        }

        if (typeof result === "boolean") {
            return result ? "TRUE" : "FALSE";
        }

        const numericResult = Number(result);
        if (!Number.isNaN(numericResult) && String(result).trim() !== "") {
            return formatNumber(numericResult);
        }

        return String(result);
    } catch (error) {
        console.error("Formula calculation error:", error);
        return "#ERROR!";
    }
};
