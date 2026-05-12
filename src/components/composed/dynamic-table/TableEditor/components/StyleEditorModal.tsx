import React, { useState, useEffect } from 'react';
import { ActiveTab, TableRow, TableColumn, Alignment } from '../types';
import styles from '../../TableEditor.module.scss';
import { CellMetadata } from '@/services/dynamicTable.service';

interface StyleEditorModalProps {
    hoveredCell: { rowIndex: number | 'header'; colIndex: number } | null;
    setHoveredCell: (cell: null) => void;
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    columns: TableColumn[];
    rows: TableRow[];
    cellStyles: Record<string, CellMetadata>;
    setCellStyles: React.Dispatch<React.SetStateAction<Record<string, CellMetadata>>>;
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>;
    getCellStyle: (row: number | 'header', col: number) => any;
    handleCellStyleChange: (row: number | 'header', col: number, style: any) => void;
    applyStyleToAdjacentCells: (row: number | 'header', col: number, style: any, count: number) => void;
    getUsedColors: (type: 'background' | 'text') => string[];
    globalAlignment: Alignment;
    borderColor: string;
    selectedBgColorRef: React.MutableRefObject<string>;
    selectedTextColorRef: React.MutableRefObject<string>;
    hexBgColor: string;
    setHexBgColor: (val: string) => void;
    hexTextColor: string;
    setHexTextColor: (val: string) => void;
}

export const StyleEditorModal: React.FC<StyleEditorModalProps> = ({
    hoveredCell,
    setHoveredCell,
    activeTab,
    setActiveTab,
    columns,
    rows,
    cellStyles,
    setCellStyles,
    setRows,
    getCellStyle,
    handleCellStyleChange,
    applyStyleToAdjacentCells,
    getUsedColors,
    globalAlignment,
    borderColor,
    selectedBgColorRef,
    selectedTextColorRef,
    hexBgColor,
    setHexBgColor,
    hexTextColor,
    setHexTextColor
}) => {
    const [colspanValue, setColspanValue] = useState(1);

    // Calculate currentColspan before early return to use in useEffect
    const currentColspan = hoveredCell && hoveredCell.rowIndex === 'header' 
        ? (cellStyles[`header-${hoveredCell.colIndex}`]?.colspan || 1) 
        : 1;

    // All hooks must be called before any conditional returns
    useEffect(() => {
        if (hoveredCell && hoveredCell.rowIndex === 'header') {
            const colspan = cellStyles[`header-${hoveredCell.colIndex}`]?.colspan || 1;
            setColspanValue(colspan);
        }
    }, [hoveredCell, cellStyles]);

    if (!hoveredCell) return null;

    const rowIdx = hoveredCell.rowIndex;
    const colIdx = hoveredCell.colIndex;

    const currentStyle = getCellStyle(rowIdx, colIdx);
    const currentBgColor = currentStyle.backgroundColor || 'rgb(var(--dark-grey))';
    const currentTextColor = currentStyle.color || 'rgb(var(--foreground))';
    const currentAlignment = currentStyle.textAlign || globalAlignment;
    const currentBorderColor = currentStyle.borderColor || 'rgb(var(--stroke))';
    const currentBorderWidth = (currentStyle as any).borderWidth || '2px';
    const currentFontWeight = currentStyle.fontWeight || 'normal';
    const currentFontSize = currentStyle.fontSize || '14px';

    const usedBgColors = getUsedColors('background');
    const usedTextColors = getUsedColors('text');

    const displayBgColor = selectedBgColorRef.current || currentBgColor;
    const displayTextColor = selectedTextColorRef.current || currentTextColor;

    // Apply All Styles to Next Cells - Show at top for data rows
    const handleApplyAllStyles = () => {
        if (rowIdx === 'header') return;
        const input = document.getElementById('applyAllStylesNextCells') as HTMLInputElement;
        const count = Math.max(1, Math.min(columns.length - colIdx - 1, parseInt(input?.value || '1') || 1));

        const key = `${rowIdx}-${colIdx}`;
        const currentStyles = cellStyles[key] || {};
        const cellStyle = getCellStyle(rowIdx, colIdx);

        const allStyles: Partial<CellMetadata> = {};
        if (currentStyles.bgColor || cellStyle.backgroundColor) {
            allStyles.bgColor = currentStyles.bgColor || cellStyle.backgroundColor;
        }
        if (currentStyles.textColor || cellStyle.color) {
            allStyles.textColor = currentStyles.textColor || cellStyle.color;
        }
        if (currentStyles.fontWeight || cellStyle.fontWeight) {
            allStyles.fontWeight = String(currentStyles.fontWeight || cellStyle.fontWeight || 'normal');
        }
        if (currentStyles.fontSize || cellStyle.fontSize) {
            allStyles.fontSize = currentStyles.fontSize || (cellStyle.fontSize ? String(cellStyle.fontSize) : undefined);
        }
        if (currentStyles.textAlign || cellStyle.textAlign) {
            allStyles.textAlign = (currentStyles.textAlign || cellStyle.textAlign) as 'left' | 'center' | 'right';
        }
        if (currentStyles.borderColor || cellStyle.borderColor) {
            allStyles.borderColor = currentStyles.borderColor || cellStyle.borderColor;
        }
        if (currentStyles.borderWidth || cellStyle.borderWidth) {
            allStyles.borderWidth = currentStyles.borderWidth || cellStyle.borderWidth;
        }

        applyStyleToAdjacentCells(rowIdx, colIdx, allStyles, count);
    };

    // Apply color to entire column
    const applyBgColorToColumn = (color: string) => {
        setCellStyles(prev => {
            const newStyles = { ...prev };
            newStyles[`header-${colIdx}`] = { ...prev[`header-${colIdx}`], bgColor: color };
            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                newStyles[`${rowIdx}-${colIdx}`] = { ...prev[`${rowIdx}-${colIdx}`], bgColor: color };
            }
            return newStyles;
        });
        setRows(prevRows => prevRows.map((row, rowIdx) => ({
            ...row,
            cells: row.cells.map((cell, cellIdx) => {
                if (cellIdx === colIdx) {
                    return { ...cell, metadata: { ...cell.metadata, bgColor: color } };
                }
                return cell;
            })
        })));
    };

    const applyBgColorToRow = (color: string) => {
        if (rowIdx === 'header') {
            // Apply to all header cells
            setCellStyles(prev => {
                const newStyles = { ...prev };
                for (let colIdx = 0; colIdx < columns.length; colIdx++) {
                    newStyles[`header-${colIdx}`] = { ...prev[`header-${colIdx}`], bgColor: color };
                }
                return newStyles;
            });
            return;
        }
        setCellStyles(prev => {
            const newStyles = { ...prev };
            for (let colIdx = 0; colIdx < columns.length; colIdx++) {
                newStyles[`${rowIdx}-${colIdx}`] = { ...prev[`${rowIdx}-${colIdx}`], bgColor: color };
            }
            return newStyles;
        });
        setRows(prevRows => prevRows.map((row, idx) => {
            if (idx === rowIdx) {
                return {
                    ...row,
                    cells: row.cells.map(cell => ({
                        ...cell,
                        metadata: { ...cell.metadata, bgColor: color }
                    }))
                };
            }
            return row;
        }));
    };

    const applyTextColorToColumn = (color: string) => {
        setCellStyles(prev => {
            const newStyles = { ...prev };
            newStyles[`header-${colIdx}`] = { ...prev[`header-${colIdx}`], textColor: color };
            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                newStyles[`${rowIdx}-${colIdx}`] = { ...prev[`${rowIdx}-${colIdx}`], textColor: color };
            }
            return newStyles;
        });
        setRows(prevRows => prevRows.map((row, rowIdx) => ({
            ...row,
            cells: row.cells.map((cell, cellIdx) => {
                if (cellIdx === colIdx) {
                    return { ...cell, metadata: { ...cell.metadata, textColor: color } };
                }
                return cell;
            })
        })));
    };

    const applyTextColorToRow = (color: string) => {
        if (rowIdx === 'header') {
            // Apply to all header cells
            setCellStyles(prev => {
                const newStyles = { ...prev };
                for (let colIdx = 0; colIdx < columns.length; colIdx++) {
                    newStyles[`header-${colIdx}`] = { ...prev[`header-${colIdx}`], textColor: color };
                }
                return newStyles;
            });
            return;
        }
        setCellStyles(prev => {
            const newStyles = { ...prev };
            for (let colIdx = 0; colIdx < columns.length; colIdx++) {
                newStyles[`${rowIdx}-${colIdx}`] = { ...prev[`${rowIdx}-${colIdx}`], textColor: color };
            }
            return newStyles;
        });
        setRows(prevRows => prevRows.map((row, idx) => {
            if (idx === rowIdx) {
                return {
                    ...row,
                    cells: row.cells.map(cell => ({
                        ...cell,
                        metadata: { ...cell.metadata, textColor: color }
                    }))
                };
            }
            return row;
        }));
    };

    const applyBorderColorToColumn = (color: string) => {
        setCellStyles(prev => {
            const newStyles = { ...prev };
            newStyles[`header-${colIdx}`] = { ...prev[`header-${colIdx}`], borderColor: color };
            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                newStyles[`${rowIdx}-${colIdx}`] = { ...prev[`${rowIdx}-${colIdx}`], borderColor: color };
            }
            return newStyles;
        });
        setRows(prevRows => prevRows.map((row, rowIdx) => ({
            ...row,
            cells: row.cells.map((cell, cellIdx) => {
                if (cellIdx === colIdx) {
                    return { ...cell, metadata: { ...cell.metadata, borderColor: color } };
                }
                return cell;
            })
        })));
    };

    const applyBorderColorToRow = (color: string) => {
        if (rowIdx === 'header') return;
        setCellStyles(prev => {
            const newStyles = { ...prev };
            for (let colIdx = 0; colIdx < columns.length; colIdx++) {
                newStyles[`${rowIdx}-${colIdx}`] = { ...prev[`${rowIdx}-${colIdx}`], borderColor: color };
            }
            return newStyles;
        });
        setRows(prevRows => prevRows.map((row, idx) => {
            if (idx === rowIdx) {
                return {
                    ...row,
                    cells: row.cells.map(cell => ({
                        ...cell,
                        metadata: { ...cell.metadata, borderColor: color }
                    }))
                };
            }
            return row;
        }));
    };

    const applyFontWeightToColumn = (fontWeight: string) => {
        setCellStyles(prev => {
            const newStyles = { ...prev };
            newStyles[`header-${colIdx}`] = { ...prev[`header-${colIdx}`], fontWeight };
            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                newStyles[`${rowIdx}-${colIdx}`] = { ...prev[`${rowIdx}-${colIdx}`], fontWeight };
            }
            return newStyles;
        });
        setRows(prevRows => prevRows.map((row, rowIdx) => ({
            ...row,
            cells: row.cells.map((cell, cellIdx) => {
                if (cellIdx === colIdx) {
                    return { ...cell, metadata: { ...cell.metadata, fontWeight } };
                }
                return cell;
            })
        })));
    };

    const applyBorderWidthToColumn = (borderWidth: string) => {
        setCellStyles(prev => {
            const newStyles = { ...prev };
            newStyles[`header-${colIdx}`] = { ...prev[`header-${colIdx}`], borderWidth };
            for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                newStyles[`${rowIdx}-${colIdx}`] = { ...prev[`${rowIdx}-${colIdx}`], borderWidth };
            }
            return newStyles;
        });
        setRows(prevRows => prevRows.map((row, rowIdx) => ({
            ...row,
            cells: row.cells.map((cell, cellIdx) => {
                if (cellIdx === colIdx) {
                    return { ...cell, metadata: { ...cell.metadata, borderWidth } };
                }
                return cell;
            })
        })));
    };

    return (
        <>
            <div
                className={styles.popupOverlay}
                onClick={() => {
                    setHoveredCell(null);
                    setActiveTab('background');
                }}
            />
            <div
                className={styles.colorPickerPopupOutside}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.colorPickerHeader}>
                    {rowIdx === 'header' ? 'Header' : `Cell (Row ${rowIdx + 1}, Col ${colIdx + 1})`} Styling
                </div>

                {/* Apply All Styles to Next Cells - Show at top for data rows */}
                {rowIdx !== 'header' && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: 'rgba(14, 165, 233, 0.12)',
                        borderRadius: '10px',
                        border: '2px solid rgb(var(--electric-blue))'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: 'rgb(var(--foreground))',
                            marginBottom: '8px'
                        }}>
                            Apply All Current Styles to Next Cells:
                        </label>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <input
                                type="number"
                                min="1"
                                max={columns.length - colIdx - 1}
                                defaultValue="1"
                                id="applyAllStylesNextCells"
                                style={{
                                    width: '80px',
                                    padding: '6px 10px',
                                    border: '2px solid #0ea5e9',
                                    borderRadius: '4px',
                                    fontSize: '15px',
                                    fontWeight: '600'
                                }}
                            />
                            <button
                                onClick={handleApplyAllStyles}
                                className={styles.bulkActionBtn}
                                style={{
                                    fontSize: '15px',
                                    padding: '6px 14px',
                                    backgroundColor: '#0ea5e9',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '600',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Apply All Styles
                            </button>
                        </div>
                        <div style={{
                            marginTop: '6px',
                            fontSize: '7px',
                            color: '#0369a1',
                            fontStyle: 'italic'
                        }}>
                            Applies: BG Color, Text Color, Font Weight, Font Size, Text Align, Border Color & Width
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'background' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('background')}
                    >
                        Background
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'text' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('text')}
                    >
                        Text Color
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'alignment' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('alignment')}
                    >
                        Alignment
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'border' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('border')}
                    >
                        Border
                    </button>
                </div>

                {/* Colspan Control - Only show for headers */}
                {rowIdx === 'header' && (
                    <div style={{
                        padding: '16px',
                        borderTop: '1px solid rgb(var(--stroke))',
                        borderBottom: '1px solid rgb(var(--stroke))',
                        backgroundColor: 'rgb(var(--background))'
                    }}>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            marginBottom: '8px',
                            fontSize: '15px',
                            color: 'rgb(var(--foreground))'
                        }}>
                            Column Span (Colspan)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="number"
                                min="1"
                                max={columns.length}
                                value={String(currentColspan)}
                                onChange={(e) => {
                                    const colspan = parseInt(e.target.value) || 1;
                                    const maxColspan = columns.length - colIdx;
                                    const validColspan = Math.min(Math.max(1, colspan), maxColspan);
                                    handleCellStyleChange('header', colIdx, { colspan: validColspan });
                                }}
                                style={{
                                    width: '80px',
                                    padding: '8px',
                                    border: '1px solid rgb(var(--stroke))',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: 'rgb(var(--background))',
                                    color: 'rgb(var(--foreground))'
                                }}
                            />
                            <span style={{ fontSize: '13px', color: 'rgb(var(--secondary))' }}>
                                (1-{columns.length - colIdx} columns)
                            </span>
                        </div>
                        <div style={{
                            marginTop: '8px',
                            fontSize: '13px',
                            color: 'rgb(var(--secondary))',
                            fontStyle: 'italic'
                        }}>
                            Set to 1 to remove colspan, or higher to span multiple columns
                        </div>
                    </div>
                )}

                {/* Background Tab Content */}
                {activeTab === 'background' && (
                    <>
                        <div className={styles.currentColorPreview}>
                            <span>Current Color:</span>
                            <div
                                className={styles.colorPreviewBox}
                                style={{ backgroundColor: currentBgColor }}
                            />
                            <span className={styles.colorValue}>{currentBgColor}</span>
                        </div>
                        <input
                            type="color"
                            value={displayBgColor}
                            onChange={(e) => {
                                const color = e.target.value;
                                selectedBgColorRef.current = color;
                                setHexBgColor(color.toUpperCase());
                                handleCellStyleChange(rowIdx, colIdx, { bgColor: color });
                            }}
                            className={styles.colorInput}
                        />
                        <div className={styles.hexColorInput}>
                            <label>Or enter hex color:</label>
                            <input
                                type="text"
                                value={hexBgColor || currentBgColor.toUpperCase()}
                                placeholder="#FF0000"
                                onChange={(e) => {
                                    const hex = e.target.value.toUpperCase();
                                    setHexBgColor(hex);
                                    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                        selectedBgColorRef.current = hex;
                                        handleCellStyleChange(rowIdx, colIdx, { bgColor: hex });
                                    }
                                }}
                                className={styles.hexInput}
                            />
                        </div>
                        {usedBgColors.length > 0 ? (
                            <>
                                <div className={styles.quickColorsLabel}>Previously Used Colors:</div>
                                <div className={styles.quickColors}>
                                    {usedBgColors.map(color => (
                                        <button
                                            key={color}
                                            className={styles.quickColorBtn}
                                            style={{ backgroundColor: color }}
                                            onClick={() => {
                                                selectedBgColorRef.current = color;
                                                setHexBgColor(color.toUpperCase());
                                                handleCellStyleChange(rowIdx, colIdx, { bgColor: color });
                                            }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={styles.noColorsMessage}>
                                No colors used yet. Use the color picker above to set a color.
                            </div>
                        )}
                        <div className={styles.bulkActions}>
                            <button
                                onClick={() => applyBgColorToRow(displayBgColor)}
                                className={styles.bulkActionBtn}
                            >
                                Apply to Entire Row
                            </button>
                            <button
                                onClick={() => applyBgColorToColumn(displayBgColor)}
                                className={styles.bulkActionBtn}
                            >
                                Apply to Entire Column
                            </button>
                        </div>
                        {rowIdx !== 'header' && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: 'rgb(var(--background))',
                                borderRadius: '4px',
                                border: '1px solid rgb(var(--stroke))'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: 'rgb(var(--foreground))',
                                    marginBottom: '8px'
                                }}>
                                    Apply to Next Cells:
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        min="1"
                                        max={columns.length - colIdx - 1}
                                        defaultValue="1"
                                        id="bgColorNextCells"
                                        style={{
                                            width: '80px',
                                            padding: '6px 8px',
                                            border: '1px solid rgb(var(--stroke))',
                                            borderRadius: '4px',
                                            fontSize: '15px'
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('bgColorNextCells') as HTMLInputElement;
                                            const count = Math.max(1, Math.min(columns.length - colIdx - 1, parseInt(input.value) || 1));
                                            applyStyleToAdjacentCells(rowIdx, colIdx, { bgColor: displayBgColor }, count);
                                        }}
                                        className={styles.bulkActionBtn}
                                        style={{ fontSize: '15px', padding: '6px 12px' }}
                                    >
                                        Apply to Next Cells
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Text Color Tab Content */}
                {activeTab === 'text' && (
                    <>
                        <div className={styles.currentColorPreview}>
                            <span>Current Color:</span>
                            <div
                                className={styles.colorPreviewBox}
                                style={{ backgroundColor: currentTextColor }}
                            />
                            <span className={styles.colorValue}>{currentTextColor}</span>
                        </div>
                        <input
                            type="color"
                            value={displayTextColor}
                            onChange={(e) => {
                                const color = e.target.value;
                                selectedTextColorRef.current = color;
                                setHexTextColor(color.toUpperCase());
                                handleCellStyleChange(rowIdx, colIdx, { textColor: color });
                            }}
                            className={styles.colorInput}
                        />
                        <div className={styles.hexColorInput}>
                            <label>Or enter hex color:</label>
                            <input
                                type="text"
                                value={hexTextColor || currentTextColor.toUpperCase()}
                                placeholder="#FF0000"
                                onChange={(e) => {
                                    const hex = e.target.value.toUpperCase();
                                    setHexTextColor(hex);
                                    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                        selectedTextColorRef.current = hex;
                                        handleCellStyleChange(rowIdx, colIdx, { textColor: hex });
                                    }
                                }}
                                className={styles.hexInput}
                            />
                        </div>
                        {usedTextColors.length > 0 ? (
                            <>
                                <div className={styles.quickColorsLabel}>Previously Used Colors:</div>
                                <div className={styles.quickColors}>
                                    {usedTextColors.map(color => (
                                        <button
                                            key={color}
                                            className={styles.quickColorBtn}
                                            style={{ backgroundColor: color }}
                                            onClick={() => {
                                                selectedTextColorRef.current = color;
                                                setHexTextColor(color.toUpperCase());
                                                handleCellStyleChange(rowIdx, colIdx, { textColor: color });
                                            }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={styles.noColorsMessage}>
                                No colors used yet. Use the color picker above to set a color.
                            </div>
                        )}
                        <div className={styles.bulkActions}>
                            <button
                                onClick={() => applyTextColorToRow(displayTextColor)}
                                className={styles.bulkActionBtn}
                            >
                                Apply to Entire Row
                            </button>
                            <button
                                onClick={() => applyTextColorToColumn(displayTextColor)}
                                className={styles.bulkActionBtn}
                            >
                                Apply to Entire Column
                            </button>
                        </div>
                        {rowIdx !== 'header' && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: 'rgb(var(--background))',
                                borderRadius: '4px',
                                border: '1px solid rgb(var(--stroke))'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: 'rgb(var(--foreground))',
                                    marginBottom: '8px'
                                }}>
                                    Apply to Next Cells:
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        min="1"
                                        max={columns.length - colIdx - 1}
                                        defaultValue="1"
                                        id="textColorNextCells"
                                        style={{
                                            width: '80px',
                                            padding: '6px 8px',
                                            border: '1px solid rgb(var(--stroke))',
                                            borderRadius: '4px',
                                            fontSize: '15px'
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('textColorNextCells') as HTMLInputElement;
                                            const count = Math.max(1, Math.min(columns.length - colIdx - 1, parseInt(input.value) || 1));
                                            applyStyleToAdjacentCells(rowIdx, colIdx, { textColor: displayTextColor }, count);
                                        }}
                                        className={styles.bulkActionBtn}
                                        style={{ fontSize: '15px', padding: '6px 12px' }}
                                    >
                                        Apply to Next Cells
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Font Weight Controls */}
                        <div style={{
                            marginTop: '24px',
                            paddingTop: '24px',
                            borderTop: '1px solid rgb(var(--stroke))'
                        }}>
                            <label style={{
                                display: 'block',
                                fontWeight: '600',
                                marginBottom: '12px',
                                fontSize: '15px',
                                color: 'rgb(var(--foreground))'
                            }}>
                                Font Weight
                            </label>
                            <select
                                value={String(currentFontWeight)}
                                onChange={(e) => {
                                    const fontWeight = e.target.value;
                                    handleCellStyleChange(rowIdx, colIdx, { fontWeight });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid rgb(var(--stroke))',
                                    borderRadius: '4px',
                                    fontSize: '15px',
                                    marginBottom: '12px'
                                }}
                            >
                                <option value="normal">Normal (400)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">Semi-Bold (600)</option>
                                <option value="700">Bold (700)</option>
                                <option value="800">Extra Bold (800)</option>
                                <option value="900">Black (900)</option>
                            </select>
                            <div className={styles.bulkActions}>
                                <button
                                    onClick={() => {
                                        const key = rowIdx === 'header' ? `header-${colIdx}` : `${rowIdx}-${colIdx}`;
                                        const currentFw = cellStyles[key]?.fontWeight;
                                        const fontWeight = currentFw ? String(currentFw) : 'normal';
                                        applyFontWeightToColumn(fontWeight);
                                    }}
                                    className={styles.bulkActionBtn}
                                >
                                    Apply Font Weight to Entire Column
                                </button>
                            </div>
                        </div>

                        {/* Font Size */}
                        <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid rgb(var(--stroke))'
                        }}>
                            <label style={{
                                display: 'block',
                                fontWeight: '600',
                                marginBottom: '12px',
                                fontSize: '15px',
                                color: 'rgb(var(--foreground))'
                            }}>
                                Font Size
                            </label>
                            <input
                                type="text"
                                value={String(currentFontSize)}
                                onChange={(e) => handleCellStyleChange(rowIdx, colIdx, { fontSize: e.target.value })}
                                className={styles.hexInput}
                                placeholder="10px, 14px, etc."
                            />
                        </div>
                    </>
                )}

                {/* Text Alignment Tab Content */}
                {activeTab === 'alignment' && (
                    <>
                        <div className={styles.currentAlignmentPreview}>
                            <span>Current Alignment:</span>
                            <div className={styles.alignmentPreview}>
                                <div
                                    className={`${styles.alignmentOption} ${currentAlignment === 'left' ? styles.alignmentActive : ''}`}
                                    onClick={() => handleCellStyleChange(rowIdx, colIdx, { textAlign: 'left' })}
                                >
                                    <span className={styles.alignmentIcon}>⬅</span>
                                    <span>Left</span>
                                </div>
                                <div
                                    className={`${styles.alignmentOption} ${currentAlignment === 'center' ? styles.alignmentActive : ''}`}
                                    onClick={() => handleCellStyleChange(rowIdx, colIdx, { textAlign: 'center' })}
                                >
                                    <span className={styles.alignmentIcon}>⬌</span>
                                    <span>Center</span>
                                </div>
                                <div
                                    className={`${styles.alignmentOption} ${currentAlignment === 'right' ? styles.alignmentActive : ''}`}
                                    onClick={() => handleCellStyleChange(rowIdx, colIdx, { textAlign: 'right' })}
                                >
                                    <span className={styles.alignmentIcon}>➡</span>
                                    <span>Right</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.globalAlignmentNote}>
                            Global alignment is set to: <strong>{globalAlignment}</strong>
                        </div>
                    </>
                )}

                {/* Border Tab Content */}
                {activeTab === 'border' && (
                    <>
                        <div className={styles.currentColorPreview}>
                            <span>Current Border Color:</span>
                            <div
                                className={styles.colorPreviewBox}
                                style={{ backgroundColor: currentBorderColor }}
                            />
                            <span className={styles.colorValue}>{currentBorderColor}</span>
                        </div>
                        <input
                            type="color"
                            value={currentBorderColor}
                            onChange={(e) => {
                                const color = e.target.value;
                                handleCellStyleChange(rowIdx, colIdx, { borderColor: color });
                            }}
                            className={styles.colorInput}
                        />
                        <div className={styles.hexColorInput}>
                            <label>Or enter hex color:</label>
                            <input
                                type="text"
                                value={currentBorderColor.toUpperCase()}
                                placeholder="#000000"
                                onChange={(e) => {
                                    const hex = e.target.value.toUpperCase();
                                    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                        handleCellStyleChange(rowIdx, colIdx, { borderColor: hex });
                                    }
                                }}
                                className={styles.hexInput}
                            />
                        </div>
                        <div className={styles.bulkActions}>
                            <button
                                onClick={() => applyBorderColorToRow(currentBorderColor)}
                                className={styles.bulkActionBtn}
                            >
                                Apply to Entire Row
                            </button>
                            <button
                                onClick={() => applyBorderColorToColumn(currentBorderColor)}
                                className={styles.bulkActionBtn}
                            >
                                Apply to Entire Column
                            </button>
                        </div>
                        {rowIdx !== 'header' && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: 'rgb(var(--background))',
                                borderRadius: '4px',
                                border: '1px solid rgb(var(--stroke))'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: 'rgb(var(--foreground))',
                                    marginBottom: '8px'
                                }}>
                                    Apply Border Color to Next Cells:
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        min="1"
                                        max={columns.length - colIdx - 1}
                                        defaultValue="1"
                                        id="borderColorNextCells"
                                        style={{
                                            width: '80px',
                                            padding: '6px 8px',
                                            border: '1px solid rgb(var(--stroke))',
                                            borderRadius: '4px',
                                            fontSize: '15px'
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('borderColorNextCells') as HTMLInputElement;
                                            const count = Math.max(1, Math.min(columns.length - colIdx - 1, parseInt(input.value) || 1));
                                            applyStyleToAdjacentCells(rowIdx, colIdx, { borderColor: currentBorderColor }, count);
                                        }}
                                        className={styles.bulkActionBtn}
                                        style={{ fontSize: '15px', padding: '6px 12px' }}
                                    >
                                        Apply to Next Cells
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Border Thickness Control */}
                        <div style={{
                            marginTop: '24px',
                            paddingTop: '24px',
                            borderTop: '1px solid rgb(var(--stroke))'
                        }}>
                            <label style={{
                                display: 'block',
                                fontWeight: '600',
                                marginBottom: '12px',
                                fontSize: '15px',
                                color: 'rgb(var(--foreground))'
                            }}>
                                Border Thickness (px)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={(() => {
                                    const key = rowIdx === 'header' ? `header-${colIdx}` : `${rowIdx}-${colIdx}`;
                                    const borderWidth = cellStyles[key]?.borderWidth || '2px';
                                    const match = String(borderWidth).match(/(\d+)/);
                                    return match ? parseInt(match[1]) : 2;
                                })()}
                                onChange={(e) => {
                                    const thickness = parseInt(e.target.value) || 2;
                                    const borderWidth = `${thickness}px`;
                                    handleCellStyleChange(rowIdx, colIdx, { borderWidth });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid rgb(var(--stroke))',
                                    borderRadius: '4px',
                                    fontSize: '15px',
                                    marginBottom: '12px'
                                }}
                            />
                            <div className={styles.bulkActions}>
                                <button
                                    onClick={() => {
                                        const key = rowIdx === 'header' ? `header-${colIdx}` : `${rowIdx}-${colIdx}`;
                                        const currentBorderWidth = cellStyles[key]?.borderWidth || '2px';
                                        const match = String(currentBorderWidth).match(/(\d+)/);
                                        const thickness = match ? parseInt(match[1]) : 2;
                                        const borderWidth = `${thickness}px`;
                                        applyBorderWidthToColumn(borderWidth);
                                    }}
                                    className={styles.bulkActionBtn}
                                >
                                    Apply Border Thickness to Entire Column
                                </button>
                            </div>
                            {rowIdx !== 'header' && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    backgroundColor: 'rgb(var(--background))',
                                    borderRadius: '4px',
                                    border: '1px solid rgb(var(--stroke))'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: 'rgb(var(--foreground))',
                                        marginBottom: '8px'
                                    }}>
                                        Apply Border Thickness to Next Cells:
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            min="1"
                                            max={columns.length - colIdx - 1}
                                            defaultValue="1"
                                            id="borderThicknessNextCells"
                                            style={{
                                                width: '80px',
                                                padding: '6px 8px',
                                                border: '1px solid rgb(var(--stroke))',
                                                borderRadius: '4px',
                                                fontSize: '15px'
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('borderThicknessNextCells') as HTMLInputElement;
                                                const count = Math.max(1, Math.min(columns.length - colIdx - 1, parseInt(input.value) || 1));
                                                const key = `${rowIdx}-${colIdx}`;
                                                const currentBorderWidth = cellStyles[key]?.borderWidth || '2px';
                                                const match = String(currentBorderWidth).match(/(\d+)/);
                                                const thickness = match ? parseInt(match[1]) : 2;
                                                const borderWidth = `${thickness}px`;
                                                applyStyleToAdjacentCells(rowIdx, colIdx, { borderWidth }, count);
                                            }}
                                            className={styles.bulkActionBtn}
                                            style={{ fontSize: '15px', padding: '6px 12px' }}
                                        >
                                            Apply to Next Cells
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <button
                    onClick={() => {
                        setHoveredCell(null);
                        setActiveTab('background');
                        setHexBgColor('');
                        setHexTextColor('');
                        selectedBgColorRef.current = '';
                        selectedTextColorRef.current = '';
                    }}
                    className={styles.closeColorPickerBtn}
                >
                    Close
                </button>
            </div>
        </>
    );
};
