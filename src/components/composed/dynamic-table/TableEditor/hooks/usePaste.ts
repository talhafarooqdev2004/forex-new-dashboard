import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { TableRow, TableColumn, CellData } from '../types';
import { CellMetadata } from '@/services/dynamicTable.service';
import { formatNumber } from '../utils/tableUtils';

const NON_TEXT_MARKERS_REGEX = /<[^>]*>/g;
const ARROW_MARKERS_REGEX = /[\u2190-\u21FF\u27A1\u2B05\u2B06\u2B07\u25B2\u25BC\u25B6\u25C0\uFE0F\u{1F53A}\u{1F53B}]/gu;

function normalizeBiasText(value: string): string {
    const lower = value.toLowerCase();
    if (lower.includes('bull')) return 'Bullish';
    if (lower.includes('bear')) return 'Bearish';
    if (lower.includes('neut')) return 'Neutral';
    return value.trim();
}

function sanitizeCurrencyFundamentalsPasteValue(
    value: string,
    colIdx: number,
    totalCols: number
): string {
    const cleaned = value
        .replace(NON_TEXT_MARKERS_REGEX, ' ')
        .replace(ARROW_MARKERS_REGEX, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const isBiasCol = colIdx === 1;
    const isSecondLastCol = colIdx === totalCols - 2;
    const isLastCol = colIdx === totalCols - 1;

    if (isBiasCol) return normalizeBiasText(cleaned);
    if (isSecondLastCol || isLastCol) return cleaned;

    return value.trim();
}

function isCurrencyFundamentalsHeaderLikeRow(row: string[]): boolean {
    if (!row || row.length === 0) return false;
    const normalized = row.map((c) => c.trim().toLowerCase());
    const joined = normalized.join(' ');

    const hasFactorHeader = normalized[0] === 'factor' || normalized[0].includes('factor');
    const hasKnownHeaders =
        joined.includes('latest') ||
        joined.includes('previous') ||
        joined.includes('forecast') ||
        joined.includes('change') ||
        joined.includes('surprise') ||
        joined.includes('macroshift') ||
        joined.includes('divergence');

    const hasOnlyBiasInSecondCol =
        !normalized[0] &&
        ['bullish', 'bearish', 'neutral'].includes(normalized[1] || '') &&
        normalized.slice(2).every((v) => !v);

    return (hasFactorHeader && hasKnownHeaders) || hasOnlyBiasInSecondCol;
}

export function usePaste(
    tableIdentifier: string,
    rows: TableRow[],
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>,
    columns: TableColumn[],
    setColumns: React.Dispatch<React.SetStateAction<TableColumn[]>>,
    cellStyles: Record<string, CellMetadata>,
    setCellStyles: React.Dispatch<React.SetStateAction<Record<string, CellMetadata>>>,
    isInitialized: boolean,
    setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>,
    formulaStartRow: number,
    hasHeaders: boolean,
    setHasHeaders: React.Dispatch<React.SetStateAction<boolean>>,
    selectedCell: { rowIndex: number; colIndex: number } | null,
    autoColorEnabled: boolean,
    calculateAutoColor: (value: string) => { bgColor?: string; textColor?: string },
    onPasteProgress?: (isPasting: boolean) => void
) {
    const [isPasteMode, setIsPasteMode] = useState(false);
    const [preserveFormulas, setPreserveFormulas] = useState(true);
    const [isPasting, setIsPasting] = useState(false);

    const normalizePastedStyle = (style: CellMetadata): CellMetadata => {
        return {
            ...style,
            fontWeight: '400',
        };
    };

    const convertR1C1ToA1 = (formula: string, currentRow: number, currentCol: number, totalRows: number, totalCols: number): string => {
        const r1c1Pattern = /R(\[(-?\d+)\])?C(\[(-?\d+)\])?/g;
        return formula.replace(r1c1Pattern, (match, rowBracket, rowOffset, colBracket, colOffset) => {
            let targetRow = currentRow + (rowOffset !== undefined ? parseInt(rowOffset) : 0);
            targetRow = Math.max(0, Math.min(targetRow, totalRows - 1));
            let targetCol = currentCol + (colOffset !== undefined ? parseInt(colOffset) : 0);
            targetCol = Math.max(0, Math.min(targetCol, totalCols - 1));

            const colLetter = String.fromCharCode(65 + targetCol);
            const baseRow = targetRow === 0 ? 1 : targetRow;
            const rowNumber = Math.max(1, baseRow - (formulaStartRow - 2));
            return `${colLetter}${rowNumber}`;
        });
    };

    const parseHTMLTable = async (html: string): Promise<{ data: string[][], styles: CellMetadata[][], formulas: (string | undefined)[][] }> => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const table = doc.querySelector('table');
        if (!table) throw new Error('No table found in HTML');

        const rowsElements = Array.from(table.querySelectorAll('tr'));
        const data: string[][] = [];
        const styles: CellMetadata[][] = [];
        const formulas: (string | undefined)[][] = [];

        rowsElements.forEach((row, rowIdx) => {
            const cells = Array.from(row.querySelectorAll('th, td'));
            const rowData: string[] = [];
            const rowStyles: CellMetadata[] = [];
            const rowFormulas: (string | undefined)[] = [];
            let logicalColIdx = 0;

            cells.forEach((cell) => {
                const cellElement = cell as HTMLElement;
                const colspan = parseInt(cellElement.getAttribute('colspan') || '1') || 1;
                const displayedValue = (cellElement.textContent || '').trim();

                let formula = cellElement.getAttribute('data-formula') ||
                    (displayedValue.startsWith('=') ? displayedValue : undefined);

                if (formula && /R(\[?-?\d+\]?)?C(\[?-?\d+\]?)?/.test(formula)) {
                    formula = convertR1C1ToA1(formula, rowIdx, logicalColIdx, rowsElements.length, cells.length);
                }

                // Extract styles from cell
                const bgColor = cellElement.style.backgroundColor || cellElement.getAttribute('bgcolor');
                const textColor = cellElement.style.color;
                const fontWeight = cellElement.style.fontWeight;
                const fontSize = cellElement.style.fontSize;
                const textAlign = cellElement.style.textAlign;

                const extractedCellStyle: CellMetadata = {};
                if (bgColor || textColor || fontWeight || fontSize || textAlign) {
                    if (bgColor) extractedCellStyle.bgColor = bgColor.startsWith('#') ? bgColor : `#${bgColor}`;
                    if (textColor) extractedCellStyle.textColor = textColor.startsWith('#') ? textColor : `#${textColor}`;
                    if (fontWeight) extractedCellStyle.fontWeight = fontWeight as any;
                    if (fontSize) extractedCellStyle.fontSize = fontSize;
                    if (textAlign) extractedCellStyle.textAlign = textAlign as any;
                }

                for (let i = 0; i < colspan; i++) {
                    if (i === 0) {
                        rowData.push(displayedValue);
                        rowFormulas.push(formula);
                        rowStyles.push({
                            ...(colspan > 1 ? { colspan } : {}),
                            ...normalizePastedStyle(extractedCellStyle)
                        });
                    } else {
                        rowData.push('');
                        rowFormulas.push(undefined);
                        rowStyles.push(normalizePastedStyle({}));
                    }
                }
                logicalColIdx += colspan;
            });
            if (rowData.length > 0) {
                data.push(rowData);
                styles.push(rowStyles);
                formulas.push(rowFormulas);
            }
        });
        return { data, styles, formulas };
    };

    const handleCopy = useCallback((e: ClipboardEvent) => {
        // If an input or textarea is focused, let the default copy happen
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            return;
        }

        // Otherwise, copy the entire table data
        e.preventDefault();

        // Format as TSV for Excel
        const tsvLines = rows.map(row =>
            row.cells.map(cell => cell.formula || cell.value || '').join('\t')
        );
        const tsv = tsvLines.join('\n');

        // Format as HTML table for better spreadsheet compatibility
        const html = `<table>${rows.map(row =>
            `<tr>${row.cells.map(cell => `<td>${cell.formula || cell.value || ''}</td>`).join('')}</tr>`
        ).join('')}</table>`;

        if (e.clipboardData) {
            e.clipboardData.setData('text/plain', tsv);
            e.clipboardData.setData('text/html', html);
            toast.success('Table data copied to clipboard!');
        }
    }, [rows]);

    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        if (!isPasteMode) return;
        e.preventDefault();
        setIsPasting(true);
        onPasteProgress?.(true);
        const loadingToastId = toast.loading('Pasting table... please wait');
        const clipboardData = e.clipboardData;
        if (!clipboardData) {
            console.log('❌ No clipboard data found');
            toast.dismiss(loadingToastId);
            setIsPasting(false);
            onPasteProgress?.(false);
            return;
        }

        console.log('📋 Paste event triggered, processing data...');

        try {
            let parsedData: string[][] = [];
            let pastedStyles: CellMetadata[][] = [];
            let pastedFormulas: (string | undefined)[][] = [];

            const html = clipboardData.getData('text/html');
            if (html) {
                console.log('📋 Found HTML data, parsing...');
                const res = await parseHTMLTable(html);
                parsedData = res.data;
                pastedStyles = res.styles;
                pastedFormulas = preserveFormulas ? res.formulas : parsedData.map(r => r.map(() => undefined));
            } else {
                const text = clipboardData.getData('text/plain');
                if (!text) {
                    console.log('❌ No text data found in clipboard');
                    return;
                }
                console.log('📋 Found plain text data, parsing TSV...');
                parsedData = text.split(/\r?\n/).filter(l => l.trim()).map(l => l.split('\t').map(c => c.trim()));
                pastedStyles = parsedData.map(r => r.map(() => ({})));
                pastedFormulas = parsedData.map(r => r.map(() => undefined));
            }

            if (parsedData.length === 0) {
                console.log('❌ Parsed data is empty');
                return;
            }

            console.log(`📋 Parsed ${parsedData.length} rows and ${parsedData[0].length} columns`);

            const isCurrencyFundamental =
                tableIdentifier.startsWith('currency_fundamental_') ||
                tableIdentifier.startsWith('currency_fundamentals_');
            const usePastedHeaders = hasHeaders;
            const headerRowData = usePastedHeaders ? (parsedData[0] || []) : [];
            const rawBodyData = usePastedHeaders ? parsedData.slice(1) : parsedData;
            const bodyData = isCurrencyFundamental
                ? rawBodyData.filter((row, index) => !(index < 2 && isCurrencyFundamentalsHeaderLikeRow(row)))
                : rawBodyData;
            const targetColumnCount = isCurrencyFundamental
                ? (columns.length || 9)
                : Math.max(1, ...parsedData.map(r => r.length));

            // Capture existing first data row style to reuse as a fallback template.
            const firstDataRowStyles: Record<number, CellMetadata> = {};
            const templateRowIdx = isCurrencyFundamental ? 1 : 0;
            columns.forEach((_, colIdx) => {
                const style = cellStyles[`${templateRowIdx}-${colIdx}`];
                if (style) firstDataRowStyles[colIdx] = style;
            });

            // Unified behavior: Replace all rows for regular tables, append for Currency Fundamental
            const newRows: TableRow[] = bodyData.map((rowData, rowIdx) => {
                return {
                    id: `row-pasted-${Date.now()}-${rowIdx}`,
                    cells: Array.from({ length: targetColumnCount }, (_, colIdx) => {
                        let val = rowData[colIdx] || '';
                        const sourceRowIdx = usePastedHeaders ? rowIdx + 1 : rowIdx;
                        let formula = preserveFormulas ? pastedFormulas[sourceRowIdx]?.[colIdx] : undefined;

                        // Use template style from previous data rows if available
                        let metadata = normalizePastedStyle({ ...(firstDataRowStyles[colIdx] || {}) });

                        if (usePastedHeaders && pastedStyles[0]?.[colIdx] && Object.keys(pastedStyles[0][colIdx] || {}).length > 0) {
                            metadata = normalizePastedStyle({ ...pastedStyles[0][colIdx] });
                        } else if (pastedStyles[sourceRowIdx]?.[colIdx] && Object.keys(pastedStyles[sourceRowIdx][colIdx] || {}).length > 0) {
                            metadata = normalizePastedStyle({ ...metadata, ...pastedStyles[sourceRowIdx][colIdx] });
                        }

                        if (autoColorEnabled && !formula && !val.startsWith('=')) {
                            const auto = calculateAutoColor(val);
                            if (auto.bgColor) metadata = { ...metadata, ...auto };
                        }

                        if (isCurrencyFundamental) {
                            val = sanitizeCurrencyFundamentalsPasteValue(val, colIdx, targetColumnCount);
                        }

                        if (formula) {
                            const num = parseFloat(val);
                            if (!isNaN(num)) val = formatNumber(num);
                        }

                        return { value: val, formula, metadata };
                    })
                };
            });

            const newCellStyles: Record<string, CellMetadata> = {};

            const nextColumns = Array.from({ length: targetColumnCount }, (_, colIdx) => {
                const existingCol = columns[colIdx];
                const nextHeader = usePastedHeaders ? (headerRowData[colIdx] || '') : '';
                const headerStyle = usePastedHeaders ? pastedStyles[0]?.[colIdx] : undefined;

                if (usePastedHeaders && headerStyle && Object.keys(headerStyle).length > 0) {
                    newCellStyles[`header-${colIdx}`] = headerStyle;
                }

                return {
                    id: existingCol?.id || `col-p-${Date.now()}-${colIdx}`,
                    header: nextHeader,
                    key: existingCol?.key
                };
            });

            newRows.forEach((row, rowIdx) => {
                row.cells.forEach((cell, colIdx) => {
                    if (cell.metadata) newCellStyles[`${rowIdx}-${colIdx}`] = normalizePastedStyle(cell.metadata);
                });
            });

            // Replace table content with pasted content (same behavior across pages).
            setColumns(nextColumns);
            setRows(newRows);
            setCellStyles(newCellStyles);

            setHasHeaders(usePastedHeaders);
            setIsInitialized(true);
            setIsPasteMode(false);
            toast.dismiss(loadingToastId);
            toast.success(`Successfully replaced table with ${bodyData.length} pasted rows!`);
        } catch (err) {
            console.error(err);
            toast.dismiss(loadingToastId);
            toast.error('Paste failed');
        } finally {
            setIsPasting(false);
            onPasteProgress?.(false);
        }
    }, [isPasteMode, preserveFormulas, tableIdentifier, columns, rows, selectedCell, autoColorEnabled, calculateAutoColor, setRows, setColumns, cellStyles, setCellStyles, isInitialized, setIsInitialized, hasHeaders, setHasHeaders, onPasteProgress]);

    useEffect(() => {
        if (isPasteMode) {
            console.log('📋 Paste mode active, adding event listeners');
            window.addEventListener('paste', handlePaste);
            window.addEventListener('copy', handleCopy);
            return () => {
                console.log('📋 Paste mode inactive, removing event listeners');
                window.removeEventListener('paste', handlePaste);
                window.removeEventListener('copy', handleCopy);
            };
        }
    }, [isPasteMode, handlePaste, handleCopy]);

    return {
        isPasteMode, setIsPasteMode,
        isPasting,
        preserveFormulas, setPreserveFormulas,
        handlePaste,
        handleCopy
    };
}
