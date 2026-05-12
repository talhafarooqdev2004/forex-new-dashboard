import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AutoColorSettings, TableRow, TableColumn } from '../types';
import { DEFAULT_AUTO_COLOR_SETTINGS } from '../constants';
import { CellMetadata } from '@/services/dynamicTable.service';

export function useAutoColor(
    rows: TableRow[],
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>,
    cellStyles: Record<string, CellMetadata>,
    setCellStyles: React.Dispatch<React.SetStateAction<Record<string, CellMetadata>>>
) {
    const [autoColorEnabled, setAutoColorEnabled] = useState(false);
    const [autoColorApplyToAllColumns, setAutoColorApplyToAllColumns] = useState(true);
    const [autoColorSelectedColumns, setAutoColorSelectedColumns] = useState<number[]>([]);
    const [autoColorReferenceColumn, setAutoColorReferenceColumn] = useState<number | null>(null);
    const [autoColorSettings, setAutoColorSettings] = useState<AutoColorSettings>(DEFAULT_AUTO_COLOR_SETTINGS);

    const hexToRgba = (hex: string, opacity: number): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const parseNumericValue = (value: number | string): number => {
        if (typeof value === 'number') return value;
        const strValue = String(value).trim();
        if (strValue === '' || strValue === 'Infinity' || strValue === '-Infinity') return strValue.includes('-') ? -Infinity : Infinity;
        const numValue = parseFloat(strValue.replace(/[%,$,\s]/g, ''));
        return isNaN(numValue) ? (strValue.includes('-') ? -Infinity : Infinity) : numValue;
    };

    const calculateAutoColor = useCallback((value: string): { bgColor?: string; textColor?: string } => {
        if (!autoColorEnabled) return {};
        const cleanedValue = value.trim().replace(/[%,$,\s]/g, '');
        const numValue = parseFloat(cleanedValue);
        if (isNaN(numValue)) return {};

        const minValue = parseNumericValue(autoColorSettings.minValue);
        const maxValue = parseNumericValue(autoColorSettings.maxValue);

        if (autoColorSettings.neutralMode === 'exact') {
            if (numValue === 0) return { bgColor: autoColorSettings.neutralColor, textColor: '#000000' };
        } else {
            if (numValue >= -1 && numValue <= 1) return { bgColor: autoColorSettings.neutralColor, textColor: '#000000' };
        }

        const distanceFromZero = Math.abs(numValue);
        const baseColor = numValue > 0 ? autoColorSettings.positiveColor : autoColorSettings.negativeColor;
        const maxDistance = Math.max(Math.abs(minValue), Math.abs(maxValue));
        
        let opacity = maxDistance === 0 || !isFinite(maxDistance) 
            ? Math.min(0.2 + (distanceFromZero / 10) * 0.8, 1.0)
            : 0.2 + (Math.min(distanceFromZero / maxDistance, 1.0) * 0.8);

        opacity = Math.max(0.2, Math.min(1.0, opacity));
        return { bgColor: hexToRgba(baseColor, opacity), textColor: '#000000' };
    }, [autoColorEnabled, autoColorSettings]);

    const recalculateColors = useCallback(() => {
        if (!autoColorEnabled) {
            toast.error('Please enable Auto-Color Feature first');
            return;
        }

        const newCellStyles = { ...cellStyles };
        const newRows = rows.map((row, rowIdx) => ({
            ...row,
            cells: row.cells.map((cell, colIdx) => {
                const shouldApplyColor = autoColorApplyToAllColumns || autoColorSelectedColumns.includes(colIdx);
                if (shouldApplyColor) {
                    let valueToUse = cell.value || '';
                    if (autoColorReferenceColumn !== null && autoColorReferenceColumn >= 0 && autoColorReferenceColumn < row.cells.length) {
                        valueToUse = row.cells[autoColorReferenceColumn]?.value || '';
                    }

                    if (!valueToUse.startsWith('=')) {
                        const autoColor = calculateAutoColor(valueToUse);
                        const cellKey = `${rowIdx}-${colIdx}`;
                        if (autoColor.bgColor) {
                            const { bgColor, textColor, ...restStyle } = newCellStyles[cellKey] || {};
                            newCellStyles[cellKey] = { ...restStyle, bgColor: autoColor.bgColor, textColor: autoColor.textColor };
                            const { bgColor: cBg, textColor: cText, ...restMetadata } = cell.metadata || {};
                            return {
                                ...cell,
                                metadata: { ...restMetadata, bgColor: autoColor.bgColor, textColor: autoColor.textColor }
                            };
                        }
                    }
                }
                return cell;
            })
        }));

        setRows(newRows);
        setCellStyles(newCellStyles);
        toast.success('Colors recalculated successfully!');
    }, [autoColorEnabled, autoColorSettings, rows, cellStyles, autoColorApplyToAllColumns, autoColorSelectedColumns, autoColorReferenceColumn, calculateAutoColor, setRows, setCellStyles]);

    return {
        autoColorEnabled, setAutoColorEnabled,
        autoColorApplyToAllColumns, setAutoColorApplyToAllColumns,
        autoColorSelectedColumns, setAutoColorSelectedColumns,
        autoColorReferenceColumn, setAutoColorReferenceColumn,
        autoColorSettings, setAutoColorSettings,
        calculateAutoColor,
        recalculateColors
    };
}
