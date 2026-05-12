import { useState, useRef, useCallback } from 'react';
import { CellMetadata } from '@/services/dynamicTable.service';
import { TableRow, TableColumn, ActiveTab, Alignment } from '../types';

export function useTableStyles(
    rows: TableRow[],
    columns: TableColumn[],
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>,
    cellStyles: Record<string, CellMetadata>,
    setCellStyles: React.Dispatch<React.SetStateAction<Record<string, CellMetadata>>>,
    globalAlignment: Alignment
) {
    const [hoveredCell, setHoveredCell] = useState<{ rowIndex: number | 'header'; colIndex: number } | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('background');
    const [hexBgColor, setHexBgColor] = useState('');
    const [hexTextColor, setHexTextColor] = useState('');
    const selectedBgColorRef = useRef<string>('');
    const selectedTextColorRef = useRef<string>('');

    const getCellStyle = useCallback((rowIndex: number | 'header', colIndex: number): React.CSSProperties & { borderColor?: string } => {
        const key = rowIndex === 'header' ? `header-${colIndex}` : `${rowIndex}-${colIndex}`;
        const style = cellStyles[key] || (rowIndex !== 'header' ? rows[rowIndex]?.cells[colIndex]?.metadata : {}) || {};

        return {
            backgroundColor: style.bgColor || undefined,
            color: style.textColor || undefined,
            fontSize: style.fontSize || undefined,
            fontWeight: (style.fontWeight || undefined) as React.CSSProperties['fontWeight'],
            padding: style.padding || undefined,
            textAlign: (style.textAlign || globalAlignment) as 'left' | 'center' | 'right' | undefined,
            borderColor: style.borderColor || undefined,
            borderWidth: style.borderWidth || undefined,
        };
    }, [cellStyles, rows, globalAlignment]);

    const handleCellStyleChange = useCallback((rowIndex: number | 'header', colIndex: number, style: Partial<CellMetadata>) => {
        const key = rowIndex === 'header' ? `header-${colIndex}` : `${rowIndex}-${colIndex}`;

        setCellStyles(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                ...style
            }
        }));

        if (rowIndex !== 'header') {
            setRows(prevRows => {
                return prevRows.map((row, idx) => {
                    if (idx === rowIndex) {
                        return {
                            ...row,
                            cells: row.cells.map((cell, cellIdx) => {
                                if (cellIdx === colIndex) {
                                    return {
                                        ...cell,
                                        metadata: {
                                            ...cell.metadata,
                                            ...style
                                        }
                                    };
                                }
                                return cell;
                            })
                        };
                    }
                    return row;
                });
            });
        }
    }, [setCellStyles, setRows]);

    const applyStyleToAdjacentCells = useCallback((rowIndex: number | 'header', colIndex: number, style: Partial<CellMetadata>, count: number) => {
        if (rowIndex === 'header') return;
        for (let i = colIndex + 1; i <= colIndex + count && i < columns.length; i++) {
            handleCellStyleChange(rowIndex, i, style);
        }
    }, [columns.length, handleCellStyleChange]);

    const getUsedColors = useCallback((type: 'background' | 'text'): string[] => {
        const usedColors = new Set<string>();
        columns.forEach((_, colIdx) => {
            const style = getCellStyle('header', colIdx);
            const color = type === 'background' ? style.backgroundColor : style.color;
            if (color && !['#ffffff', 'transparent', '#000000', 'inherit'].includes(color)) usedColors.add(color);
        });
        rows.forEach((row, rowIdx) => {
            row.cells.forEach((_, colIdx) => {
                const style = getCellStyle(rowIdx, colIdx);
                const color = type === 'background' ? style.backgroundColor : style.color;
                if (color && !['#ffffff', 'transparent', '#000000', 'inherit'].includes(color)) usedColors.add(color);
            });
        });
        return Array.from(usedColors);
    }, [columns, rows, getCellStyle]);

    return {
        hoveredCell, setHoveredCell,
        activeTab, setActiveTab,
        hexBgColor, setHexBgColor,
        hexTextColor, setHexTextColor,
        selectedBgColorRef, selectedTextColorRef,
        getCellStyle,
        handleCellStyleChange,
        applyStyleToAdjacentCells,
        getUsedColors
    };
}
