import React from 'react';
import { TableOption, TableRow, TableColumn, AutoColorSettings, BorderStyle, Alignment } from '../types';
import { CellMetadata } from '@/services/dynamicTable.service';
import styles from '../../TableEditor.module.scss';

interface ControlPanelProps {
    tableName: string;
    table: any;
    tableIdentifier: string;
    showTableSelector: boolean;
    availableTables: TableOption[];
    onTableSelect?: (id: string) => void;
    showAdvancedControls: boolean;
    showStructureControls: boolean;
    hasHeaders: boolean;
    setHasHeaders: (val: boolean) => void;
    formulaStartRow: number;
    setFormulaStartRow: (val: number) => void;
    rows: TableRow[];
    columns: TableColumn[];
    autoColorEnabled: boolean;
    setAutoColorEnabled: (val: boolean) => void;
    recalculateColors: () => void;
    autoColorApplyToAllColumns: boolean;
    setAutoColorApplyToAllColumns: (val: boolean) => void;
    autoColorSelectedColumns: number[];
    setAutoColorSelectedColumns: (val: number[]) => void;
    autoColorReferenceColumn: number | null;
    setAutoColorReferenceColumn: (val: number | null) => void;
    autoColorSettings: AutoColorSettings;
    setAutoColorSettings: (val: AutoColorSettings) => void;
    rowCount: number;
    setRowCount: (val: number) => void;
    columnCount: number;
    setColumnCount: (val: number) => void;
    handleApply: () => void;
    isPasteMode: boolean;
    setIsPasteMode: (val: boolean) => void;
    isInitialized: boolean;
    finalScore: { macroshiftSum: number; divergenceSum: number; finalScore: number };
    handleAddRow: () => void;
    handleAddColumn: () => void;
    handleClearTable: () => void;
    globalAlignment: Alignment;
    setGlobalAlignment: (val: Alignment) => void;
    handleSaveTable: () => void;
    handleDeleteTable: () => void;
    saving: boolean;
    borderStyle: BorderStyle;
    setBorderStyle: (val: BorderStyle) => void;
    borderColor: string;
    setBorderColor: (val: string) => void;
    cellStyles: Record<string, CellMetadata>;
    setCellStyles: React.Dispatch<React.SetStateAction<Record<string, CellMetadata>>>;
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>;
    useSpreadEngine: boolean;
    setUseSpreadEngine: (val: boolean) => void;
}

// Helper functions for gradient preview
const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const parseNumericValue = (value: number | string): number => {
    if (typeof value === 'number') return value;
    const strValue = String(value).trim();
    if (strValue === '' || strValue === 'Infinity' || strValue === '-Infinity') {
        return strValue.includes('-') ? -Infinity : Infinity;
    }
    if (strValue.includes('%')) {
        const numValue = parseFloat(strValue.replace(/[%,$,\s]/g, ''));
        return isNaN(numValue) ? (strValue.includes('-') ? -Infinity : Infinity) : numValue;
    }
    const numValue = parseFloat(strValue);
    return isNaN(numValue) ? (strValue.includes('-') ? -Infinity : Infinity) : numValue;
};

const sectionLabelStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '15px',
    lineHeight: 1.45,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere'
};

const helpTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgb(var(--secondary))',
    lineHeight: 1.55,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere'
};

const toggleLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
    lineHeight: 1.45,
    flexWrap: 'wrap'
};

const checkboxStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    marginTop: '2px',
    flexShrink: 0
};

const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid rgb(var(--stroke))',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    color: 'rgb(var(--foreground))',
    backgroundColor: 'rgb(var(--background))',
    boxSizing: 'border-box'
};

const fieldSelectStyle: React.CSSProperties = {
    ...fieldStyle,
    cursor: 'pointer'
};

const actionRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'stretch'
};

const actionButtonWrapStyle: React.CSSProperties = {
    flex: '1 1 180px',
    minWidth: '170px'
};

const colorFieldRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    alignItems: 'stretch'
};

const colorSwatchStyle: React.CSSProperties = {
    width: '52px',
    height: '48px',
    cursor: 'pointer',
    border: '2px solid rgb(var(--stroke))',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    padding: '2px',
    flexShrink: 0
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
    tableName,
    table,
    tableIdentifier,
    showTableSelector,
    availableTables,
    onTableSelect,
    showAdvancedControls,
    showStructureControls,
    hasHeaders,
    setHasHeaders,
    formulaStartRow,
    setFormulaStartRow,
    rows,
    columns,
    autoColorEnabled,
    setAutoColorEnabled,
    recalculateColors,
    autoColorApplyToAllColumns,
    setAutoColorApplyToAllColumns,
    autoColorSelectedColumns,
    setAutoColorSelectedColumns,
    autoColorReferenceColumn,
    setAutoColorReferenceColumn,
    autoColorSettings,
    setAutoColorSettings,
    rowCount,
    setRowCount,
    columnCount,
    setColumnCount,
    handleApply,
    isPasteMode,
    setIsPasteMode,
    isInitialized,
    finalScore,
    handleAddRow,
    handleAddColumn,
    handleClearTable,
    globalAlignment,
    setGlobalAlignment,
    handleSaveTable,
    handleDeleteTable,
    saving,
    borderStyle,
    setBorderStyle,
    borderColor,
    setBorderColor,
    cellStyles,
    setCellStyles,
    setRows,
    useSpreadEngine,
    setUseSpreadEngine
}) => {
    const handleGlobalAlignmentChange = (alignment: Alignment) => {
        setGlobalAlignment(alignment);
        // Apply to all cells
        const newRows = rows.map(row => ({
            ...row,
            cells: row.cells.map(cell => ({
                ...cell,
                metadata: {
                    ...cell.metadata,
                    textAlign: alignment
                }
            }))
        }));
        setRows(newRows);
        // Update cell styles
        const newCellStyles: Record<string, CellMetadata> = {};
        rows.forEach((row, rowIdx) => {
            row.cells.forEach((_, colIdx) => {
                const key = `${rowIdx}-${colIdx}`;
                newCellStyles[key] = {
                    ...cellStyles[key],
                    textAlign: alignment
                };
            });
        });
        columns.forEach((_, colIdx) => {
            const key = `header-${colIdx}`;
            newCellStyles[key] = {
                ...cellStyles[key],
                textAlign: alignment
            };
        });
        setCellStyles(newCellStyles);
    };

    return (
        <div className={styles.controlPanel}>
            <div className={styles.controlPanelLeft}>
                <h2 className={styles.controlPanelTitle}>
                    {tableName}
                    {table && <span className={styles.editModeBadge}>Edit Mode</span>}
                </h2>
                {showTableSelector && availableTables.length > 0 && (
                    <div className={styles.tableSelectorGroup}>
                        <label className={styles.tableSelectorLabel}>Select Table to Edit:</label>
                        <select
                            className={styles.tableSelector}
                            value={tableIdentifier}
                            onChange={(e) => onTableSelect?.(e.target.value)}
                        >
                            {availableTables.map((opt) => (
                                <option key={opt.identifier} value={opt.identifier}>
                                    {opt.displayName || opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {showAdvancedControls && (
                    <>
                        {/* Table Headers Toggle */}
                        <div className={styles.autoColorSettings} style={{ marginBottom: '16px' }}>
                            <div className={styles.autoColorHeader}>
                                <label style={toggleLabelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={hasHeaders}
                                        onChange={(e) => setHasHeaders(e.target.checked)}
                                        style={checkboxStyle}
                                    />
                                    <span style={sectionLabelStyle}>Show Table Headers (TH)</span>
                                </label>
                            </div>
                        </div>

                        {/* Formula Start Row Setting */}
                        <div className={styles.autoColorSettings} style={{ marginBottom: '16px' }}>
                            <div className={styles.autoColorHeader}>
                                <label style={{ ...sectionLabelStyle, marginBottom: '8px', display: 'block' }}>
                                    Formula Start Row
                                </label>
                                <div style={{ ...helpTextStyle, marginBottom: '8px' }}>
                                    Specify which row should be considered as row 1 for formulas. For example, if set to 2, the first data row will show as "A2" instead of "A1".
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="number"
                                        min="1"
                                        max={rows.length + 1}
                                        value={formulaStartRow}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (!isNaN(value) && value >= 1) {
                                                setFormulaStartRow(value);
                                            }
                                        }}
                                        style={{ ...fieldStyle, width: '96px', textAlign: 'center' }}
                                    />
                                    <span style={{ fontSize: '15px', color: 'rgb(var(--secondary))', lineHeight: 1.45 }}>
                                        (Current: Row {formulaStartRow} = A{formulaStartRow})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Spread Engine Toggle */}
                        <div className={styles.autoColorSettings} style={{ marginBottom: '16px', background: '#fff7ed', border: '1px solid #ffedd5' }}>
                            <div className={styles.autoColorHeader}>
                                <label style={toggleLabelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={useSpreadEngine}
                                        onChange={(e) => setUseSpreadEngine(e.target.checked)}
                                        style={checkboxStyle}
                                    />
                                    <span style={{ ...sectionLabelStyle, color: '#9a3412' }}>Use Spreadsheet Engine for complex formulas that is not working so enable this settings</span>
                                </label>
                            </div>
                        </div>

                        {/* Auto-Color Settings */}
                        <div className={styles.autoColorSettings}>
                            <div className={styles.autoColorHeader}>
                                <label style={toggleLabelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={autoColorEnabled}
                                        onChange={(e) => setAutoColorEnabled(e.target.checked)}
                                        style={checkboxStyle}
                                    />
                                    <span style={sectionLabelStyle}>Auto-Color Feature</span>
                                </label>
                                <div style={{ ...helpTextStyle, marginTop: '6px', marginLeft: '28px' }}>
                                    Supports numbers, percentages (%), and currency ($)
                                </div>
                                {autoColorEnabled && isInitialized && (
                                    <button
                                        onClick={recalculateColors}
                                        style={{
                                            marginTop: '12px',
                                            padding: '8px 16px',
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            width: '100%',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Apply auto-colors to all existing cells based on their current values"
                                    >
                                        🎨 Recalculate Colors
                                    </button>
                                )}
                            </div>

                            {autoColorEnabled && (
                                <div className={styles.autoColorContent}>
                                    {/* Column Selection */}
                                    <div style={{ marginBottom: '16px', padding: '12px', background: 'rgb(var(--background))', borderRadius: '10px', border: '1px solid rgb(var(--stroke))' }}>
                                        <label style={{ ...sectionLabelStyle, marginBottom: '8px', display: 'block' }}>
                                            Apply to Columns
                                        </label>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={toggleLabelStyle}>
                                                <input
                                                    type="radio"
                                                    checked={autoColorApplyToAllColumns}
                                                    onChange={() => setAutoColorApplyToAllColumns(true)}
                                                    style={checkboxStyle}
                                                />
                                                <span>All Columns</span>
                                            </label>
                                            <label style={toggleLabelStyle}>
                                                <input
                                                    type="radio"
                                                    checked={!autoColorApplyToAllColumns}
                                                    onChange={() => setAutoColorApplyToAllColumns(false)}
                                                    style={checkboxStyle}
                                                />
                                                <span>Selected Columns</span>
                                            </label>
                                        </div>
                                        {!autoColorApplyToAllColumns && isInitialized && (
                                            <div style={{ marginTop: '12px', maxHeight: '220px', overflowY: 'auto', border: '1px solid rgb(var(--stroke))', borderRadius: '8px', padding: '10px' }}>
                                                {columns.map((col, idx) => (
                                                    <label
                                                        key={idx}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '10px',
                                                            cursor: 'pointer',
                                                            padding: '6px 0',
                                                            fontSize: '15px',
                                                            lineHeight: 1.45
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={autoColorSelectedColumns.includes(idx)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setAutoColorSelectedColumns([...autoColorSelectedColumns, idx]);
                                                                } else {
                                                                    setAutoColorSelectedColumns(autoColorSelectedColumns.filter(i => i !== idx));
                                                                }
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                        <span>{col.header ?? ""}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Reference Column Selection */}
                                    <div style={{ marginTop: '16px', marginBottom: '16px', padding: '12px', background: 'rgb(var(--background))', borderRadius: '10px', border: '1px solid rgb(var(--stroke))' }}>
                                        <label style={{ ...sectionLabelStyle, marginBottom: '8px', display: 'block' }}>
                                            Reference Column (Optional)
                                        </label>
                                        <div style={helpTextStyle}>
                                            Select a column to read numeric values from. Colors will be applied to selected columns based on values in the reference column. Leave empty to use each column's own values.
                                        </div>
                                        {isInitialized && (
                                            <select
                                                value={autoColorReferenceColumn !== null ? autoColorReferenceColumn : ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setAutoColorReferenceColumn(value === '' ? null : parseInt(value));
                                                }}
                                                style={fieldSelectStyle}
                                            >
                                                <option value="" style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))' }}>None (use column's own values)</option>
                                                {columns.map((col, idx) => (
                                                    <option key={idx} value={idx} style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))' }}>
                                                        {col.header ?? ""}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Base Colors and Range Settings */}
                                    <div className={styles.colorGroup}>
                                        <div style={{ ...helpTextStyle, marginBottom: '16px', padding: '10px 12px', background: 'rgba(14, 165, 233, 0.12)', borderRadius: '10px', border: '1px solid rgb(var(--electric-blue))' }}>
                                            <strong>Automatic Gradient System:</strong> Colors are automatically calculated based on distance from zero. Values closer to zero are lighter, values farther from zero are darker. {autoColorSettings.neutralMode === 'exact' ? 'Only value 0 uses the neutral (yellow) color.' : 'Values between -1 and +1 use the neutral (yellow) color.'}
                                        </div>

                                        {/* Positive Color */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ ...sectionLabelStyle, marginBottom: '8px', display: 'block' }}>
                                                Positive Color (Green)
                                            </label>
                                            <div style={colorFieldRowStyle}>
                                                <input
                                                    type="color"
                                                    value={autoColorSettings.positiveColor}
                                                    onChange={(e) => setAutoColorSettings({
                                                        ...autoColorSettings,
                                                        positiveColor: e.target.value
                                                    })}
                                                    style={colorSwatchStyle}
                                                />
                                                <input
                                                    type="text"
                                                    value={autoColorSettings.positiveColor.toUpperCase()}
                                                    onChange={(e) => {
                                                        const hex = e.target.value.toUpperCase();
                                                        if (hex === '' || /^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                                                            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                                                setAutoColorSettings({
                                                                    ...autoColorSettings,
                                                                    positiveColor: hex
                                                                });
                                                            } else {
                                                                setAutoColorSettings({
                                                                    ...autoColorSettings,
                                                                    positiveColor: hex || '#89F336'
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const hex = e.target.value.toUpperCase();
                                                        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                                            setAutoColorSettings({
                                                                ...autoColorSettings,
                                                                positiveColor: autoColorSettings.positiveColor
                                                            });
                                                        }
                                                    }}
                                                    placeholder="#89F336"
                                                    style={{ ...fieldStyle, flex: 1, fontFamily: 'Courier New, monospace', textTransform: 'uppercase' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Negative Color */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ ...sectionLabelStyle, marginBottom: '8px', display: 'block' }}>
                                                Negative Color (Red)
                                            </label>
                                            <div style={colorFieldRowStyle}>
                                                <input
                                                    type="color"
                                                    value={autoColorSettings.negativeColor}
                                                    onChange={(e) => setAutoColorSettings({
                                                        ...autoColorSettings,
                                                        negativeColor: e.target.value
                                                    })}
                                                    style={colorSwatchStyle}
                                                />
                                                <input
                                                    type="text"
                                                    value={autoColorSettings.negativeColor.toUpperCase()}
                                                    onChange={(e) => {
                                                        const hex = e.target.value.toUpperCase();
                                                        if (hex === '' || /^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                                                            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                                                setAutoColorSettings({
                                                                    ...autoColorSettings,
                                                                    negativeColor: hex
                                                                });
                                                            } else {
                                                                setAutoColorSettings({
                                                                    ...autoColorSettings,
                                                                    negativeColor: hex || '#FF7782'
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const hex = e.target.value.toUpperCase();
                                                        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                                            setAutoColorSettings({
                                                                ...autoColorSettings,
                                                                negativeColor: autoColorSettings.negativeColor
                                                            });
                                                        }
                                                    }}
                                                    placeholder="#FF7782"
                                                    style={{ ...fieldStyle, flex: 1, fontFamily: 'Courier New, monospace', textTransform: 'uppercase' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Neutral Mode Selection */}
                                        <div style={{ marginBottom: '16px', padding: '12px', background: 'rgb(var(--background))', borderRadius: '10px', border: '1px solid rgb(var(--stroke))' }}>
                                            <label style={{ ...sectionLabelStyle, marginBottom: '8px', display: 'block' }}>
                                                Neutral Zone Mode
                                            </label>
                                            <div style={helpTextStyle}>
                                                Choose how neutral values are determined
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={toggleLabelStyle}>
                                                    <input
                                                        type="radio"
                                                        checked={autoColorSettings.neutralMode === 'range'}
                                                        onChange={() => setAutoColorSettings({
                                                            ...autoColorSettings,
                                                            neutralMode: 'range'
                                                        })}
                                                        style={checkboxStyle}
                                                    />
                                                    <span>Range Mode: Values between -1 and +1 are neutral</span>
                                                </label>
                                                <label style={toggleLabelStyle}>
                                                    <input
                                                        type="radio"
                                                        checked={autoColorSettings.neutralMode === 'exact'}
                                                        onChange={() => setAutoColorSettings({
                                                            ...autoColorSettings,
                                                            neutralMode: 'exact'
                                                        })}
                                                        style={checkboxStyle}
                                                    />
                                                    <span>Exact Mode: Only 0 is neutral</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Neutral Color */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ ...sectionLabelStyle, marginBottom: '8px', display: 'block' }}>
                                                Neutral Color (Yellow) - Used for {autoColorSettings.neutralMode === 'exact' ? 'value 0' : 'values between -1 and +1'}
                                            </label>
                                            <div style={colorFieldRowStyle}>
                                                <input
                                                    type="color"
                                                    value={autoColorSettings.neutralColor}
                                                    onChange={(e) => setAutoColorSettings({
                                                        ...autoColorSettings,
                                                        neutralColor: e.target.value
                                                    })}
                                                    style={colorSwatchStyle}
                                                />
                                                <input
                                                    type="text"
                                                    value={autoColorSettings.neutralColor.toUpperCase()}
                                                    onChange={(e) => {
                                                        const hex = e.target.value.toUpperCase();
                                                        if (hex === '' || /^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                                                            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                                                setAutoColorSettings({
                                                                    ...autoColorSettings,
                                                                    neutralColor: hex
                                                                });
                                                            } else {
                                                                setAutoColorSettings({
                                                                    ...autoColorSettings,
                                                                    neutralColor: hex || '#FFD700'
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const hex = e.target.value.toUpperCase();
                                                        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                                            setAutoColorSettings({
                                                                ...autoColorSettings,
                                                                neutralColor: autoColorSettings.neutralColor
                                                            });
                                                        }
                                                    }}
                                                    placeholder="#FFD700"
                                                    style={{ ...fieldStyle, flex: 1, fontFamily: 'Courier New, monospace', textTransform: 'uppercase' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Min/Max Values */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ ...sectionLabelStyle, marginBottom: '8px', display: 'block' }}>
                                                Value Range
                                            </label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ ...helpTextStyle, display: 'block', marginBottom: '4px' }}>Min Value</label>
                                                    <input
                                                        type="text"
                                                        value={autoColorSettings.minValue === -Infinity || autoColorSettings.minValue === null || autoColorSettings.minValue === undefined ? '' : String(autoColorSettings.minValue)}
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value.trim();
                                                            let newValue: number | string;
                                                            if (inputValue === '') {
                                                                newValue = -100;
                                                            } else if (inputValue.includes('%')) {
                                                                newValue = inputValue;
                                                            } else {
                                                                const numValue = parseFloat(inputValue);
                                                                newValue = isNaN(numValue) ? -100 : numValue;
                                                            }
                                                            setAutoColorSettings({
                                                                ...autoColorSettings,
                                                                minValue: newValue
                                                            });
                                                        }}
                                                        placeholder="-100"
                                                        style={fieldStyle}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ ...helpTextStyle, display: 'block', marginBottom: '4px' }}>Max Value</label>
                                                    <input
                                                        type="text"
                                                        value={autoColorSettings.maxValue === Infinity || autoColorSettings.maxValue === null || autoColorSettings.maxValue === undefined ? '' : String(autoColorSettings.maxValue)}
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value.trim();
                                                            let newValue: number | string;
                                                            if (inputValue === '') {
                                                                newValue = 100;
                                                            } else if (inputValue.includes('%')) {
                                                                newValue = inputValue;
                                                            } else {
                                                                const numValue = parseFloat(inputValue);
                                                                newValue = isNaN(numValue) ? 100 : numValue;
                                                            }
                                                            setAutoColorSettings({
                                                                ...autoColorSettings,
                                                                maxValue: newValue
                                                            });
                                                        }}
                                                        placeholder="100"
                                                        style={fieldStyle}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gradient Preview */}
                                        <div style={{ marginTop: '20px', padding: '12px', background: 'rgb(var(--background))', borderRadius: '10px', border: '1px solid rgb(var(--stroke))' }}>
                                            <label style={{ ...sectionLabelStyle, marginBottom: '12px', display: 'block' }}>
                                                Gradient Preview
                                            </label>
                                            <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', height: '40px', alignItems: 'center' }}>
                                                {/* Negative gradient */}
                                                {(() => {
                                                    const minVal = parseNumericValue(autoColorSettings.minValue);
                                                    const maxVal = parseNumericValue(autoColorSettings.maxValue);
                                                    const maxDistance = Math.max(Math.abs(minVal), Math.abs(maxVal));
                                                    const steps = 10;
                                                    const previewValues: number[] = [];

                                                    for (let i = 0; i < steps / 2; i++) {
                                                        const val = minVal + (Math.abs(minVal) - 1) * (i / (steps / 2));
                                                        previewValues.push(val);
                                                    }

                                                    return previewValues.map((val, idx) => {
                                                        const distance = Math.abs(val);
                                                        const normalizedDistance = maxDistance > 0 ? Math.min(distance / maxDistance, 1.0) : 0;
                                                        const opacity = 0.2 + (normalizedDistance * 0.8);
                                                        const bgColor = hexToRgba(autoColorSettings.negativeColor, opacity);
                                                        return (
                                                            <div
                                                                key={`neg-${idx}`}
                                                                style={{
                                                                    flex: 1,
                                                                    height: '100%',
                                                                    backgroundColor: bgColor,
                                                                    border: '1px solid rgb(var(--stroke))',
                                                                    borderRadius: idx === 0 ? '4px 0 0 4px' : '0'
                                                                }}
                                                                title={`Value: ${val.toFixed(1)}`}
                                                            />
                                                        );
                                                    });
                                                })()}

                                                {/* Neutral zone */}
                                                <div
                                                    style={{
                                                        width: '40px',
                                                        height: '100%',
                                                        backgroundColor: autoColorSettings.neutralColor,
                                                        border: '1px solid rgb(var(--stroke))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#000'
                                                    }}
                                                    title="Neutral zone: -1 to +1"
                                                >
                                                    0
                                                </div>

                                                {/* Positive gradient */}
                                                {(() => {
                                                    const minVal = parseNumericValue(autoColorSettings.minValue);
                                                    const maxVal = parseNumericValue(autoColorSettings.maxValue);
                                                    const maxDistance = Math.max(Math.abs(minVal), Math.abs(maxVal));
                                                    const steps = 10;
                                                    const previewValues: number[] = [];

                                                    for (let i = 0; i < steps / 2; i++) {
                                                        const val = 1 + (maxVal - 1) * (i / (steps / 2));
                                                        previewValues.push(val);
                                                    }

                                                    return previewValues.map((val, idx) => {
                                                        const distance = Math.abs(val);
                                                        const normalizedDistance = maxDistance > 0 ? Math.min(distance / maxDistance, 1.0) : 0;
                                                        const opacity = 0.2 + (normalizedDistance * 0.8);
                                                        const bgColor = hexToRgba(autoColorSettings.positiveColor, opacity);
                                                        return (
                                                            <div
                                                                key={`pos-${idx}`}
                                                                style={{
                                                                    flex: 1,
                                                                    height: '100%',
                                                                    backgroundColor: bgColor,
                                                                    border: '1px solid rgb(var(--stroke))',
                                                                    borderRadius: idx === previewValues.length - 1 ? '0 4px 4px 0' : '0'
                                                                }}
                                                                title={`Value: ${val.toFixed(1)}`}
                                                            />
                                                        );
                                                    });
                                                })()}
                                            </div>
                                            <div style={{ ...helpTextStyle, marginTop: '8px' }}>
                                                Colors automatically get darker as values move away from zero
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className={styles.controlPanelRight}>
                {!isInitialized ? (
                    (showAdvancedControls || showStructureControls) && (
                        <div className={styles.initializer}>
                            <div className={styles.inputGroup}>
                                <label>Rows</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={rowCount}
                                    onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                                    className={styles.countInput}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Columns</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={columnCount}
                                    onChange={(e) => setColumnCount(parseInt(e.target.value) || 1)}
                                    className={styles.countInput}
                                />
                            </div>
                            <button onClick={handleApply} className={styles.applyButton} style={{ gridColumn: '1 / -1' }}>
                                Apply
                            </button>
                            <div style={{ gridColumn: '1 / -1', width: '100%', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgb(var(--stroke))' }}>
                                <div className={styles.inputGroup} style={{ width: '100%' }}>
                                    <label style={{ ...sectionLabelStyle, color: 'rgb(var(--secondary))' }}>Or paste from Excel</label>
                                    <button
                                        onClick={() => setIsPasteMode(!isPasteMode)}
                                        className={`${styles.addControlButton} ${isPasteMode ? styles.pasteModeActive : ''}`}
                                        style={{ width: '100%' }}
                                        title="Enable paste mode to paste tables from Excel or other sources"
                                    >
                                        {isPasteMode ? '✓ Paste Mode ON - Press Ctrl+V' : '📋 Enable Paste Mode'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        {/* Final Score Display Panel - Only show for currency fundamentals tables */}
                        {tableIdentifier.startsWith('currency_fundamental_') && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '12px',
                                backgroundColor: 'rgb(var(--background))',
                                borderRadius: '8px',
                                border: '1px solid rgb(var(--stroke))'
                            }}>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', color: 'rgb(var(--foreground))' }}>
                                    Final Score Calculation
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: 'rgb(var(--secondary))' }}>Macroshift Sum:</span>
                                        <span style={{ fontWeight: '600', color: 'rgb(var(--foreground))' }}>{finalScore.macroshiftSum.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: 'rgb(var(--secondary))' }}>Divergence Sum:</span>
                                        <span style={{ fontWeight: '600', color: 'rgb(var(--foreground))' }}>{finalScore.divergenceSum.toFixed(2)}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '15px',
                                        paddingTop: '8px',
                                        borderTop: '1px solid rgb(var(--stroke))',
                                        marginTop: '4px'
                                    }}>
                                        <span style={{ fontWeight: '600', color: 'rgb(var(--foreground))' }}>Final Score:</span>
                                        <span style={{ fontWeight: '700', color: 'rgb(var(--foreground))', fontSize: '14px' }}>
                                            {finalScore.finalScore.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Structure Controls (Add Row/Column) - Show when pairs exist */}
                        {showStructureControls && (
                            <div className={styles.editorControls}>
                                <div className={styles.inputGroup}>
                                    <label>Add Row</label>
                                    <button onClick={() => handleAddRow()} className={styles.addControlButton}>
                                        + Add Row
                                    </button>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Add Column</label>
                                    <button onClick={() => handleAddColumn()} className={styles.addControlButton}>
                                        + Add Column
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Copy & Paste - Show during setup OR when editing (isInitialized) */}
                        {(!showStructureControls || isInitialized) && (
                            <div className={styles.editorControls}>
                                <div className={styles.inputGroup}>
                                    <label>Copy & Paste</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setIsPasteMode(!isPasteMode)}
                                            className={`${styles.addControlButton} ${isPasteMode ? styles.pasteModeActive : ''}`}
                                            style={{ flex: 1 }}
                                            title="Enable paste mode to paste tables from Excel or other sources"
                                        >
                                            {isPasteMode ? '✓ Paste Mode ON' : '📋 Enable Paste Mode'}
                                        </button>
                                    </div>
                                    {isPasteMode && (
                                        <p style={helpTextStyle}>
                                            Once enabled, you can use Ctrl+C to copy the whole table and Ctrl+V to paste data.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Advanced Controls (Clear, Alignment, Save, Delete, Border Settings) - Show when showAdvancedControls is true */}
                        {showAdvancedControls && (
                            <div className={styles.editorControls}>
                                <div className={styles.inputGroup}>
                                    <label>Clear Table</label>
                                    <button
                                        onClick={handleClearTable}
                                        className={styles.addControlButton}
                                        style={{ backgroundColor: '#FF0000' }}
                                        title="Clear all table data, styles, and formulas"
                                    >
                                        🗑️ Clear Table
                                    </button>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Global Alignment</label>
                                    <select
                                        value={globalAlignment}
                                        onChange={(e) => handleGlobalAlignmentChange(e.target.value as Alignment)}
                                        className={styles.alignmentSelect}
                                        style={fieldSelectStyle}
                                    >
                                        <option value="left" style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))' }}>Left</option>
                                        <option value="center" style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))' }}>Center</option>
                                        <option value="right" style={{ backgroundColor: 'rgb(var(--background))', color: 'rgb(var(--foreground))' }}>Right</option>
                                    </select>
                                </div>
                                <div style={{ ...actionRowStyle, gridColumn: '1 / -1' }}>
                                    <button
                                        onClick={handleSaveTable}
                                        disabled={saving}
                                        className={styles.saveButton}
                                        style={actionButtonWrapStyle}
                                    >
                                        {saving ? 'Saving...' : 'Save Table'}
                                    </button>
                                    {table && table.id && (
                                        <button
                                            onClick={handleDeleteTable}
                                            disabled={saving}
                                            className={styles.saveButton}
                                            style={{ backgroundColor: '#FF0000', ...actionButtonWrapStyle }}
                                            title="Delete this table permanently"
                                        >
                                            🗑️ Delete Table
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Table Border Settings Section - Only show when advanced controls are enabled */}
                        {/* {showAdvancedControls && (
                            <div className={styles.borderSettingsSection}>
                                <h3 className={styles.borderSettingsTitle}>Table Border Settings</h3>
                                <div className={styles.borderSettingsContent}>
                                    <div className={styles.borderStyleGroup}>
                                        <label className={styles.borderStyleLabel}>Border Style</label>
                                        <div className={styles.borderStyleOptions}>
                                            <label className={styles.borderStyleOption}>
                                                <input
                                                    type="radio"
                                                    name="borderStyle"
                                                    value="spacing"
                                                    checked={borderStyle === 'spacing'}
                                                    onChange={(e) => setBorderStyle(e.target.value as 'spacing' | 'simple')}
                                                    className={styles.borderStyleRadio}
                                                />
                                                <span className={styles.borderStyleOptionLabel}>
                                                    <span className={styles.borderStyleOptionTitle}>Spacing</span>
                                                    <span className={styles.borderStyleOptionDesc}>Shows background color between cells</span>
                                                </span>
                                            </label>
                                            <label className={styles.borderStyleOption}>
                                                <input
                                                    type="radio"
                                                    name="borderStyle"
                                                    value="simple"
                                                    checked={borderStyle === 'simple'}
                                                    onChange={(e) => setBorderStyle(e.target.value as 'spacing' | 'simple')}
                                                    className={styles.borderStyleRadio}
                                                />
                                                <span className={styles.borderStyleOptionLabel}>
                                                    <span className={styles.borderStyleOptionTitle}>Simple Borders</span>
                                                    <span className={styles.borderStyleOptionDesc}>Traditional table borders</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.borderColorGroup}>
                                        <label className={styles.borderColorLabel}>Border Color</label>
                                        <div className={styles.borderColorPicker}>
                                            <input
                                                type="color"
                                                value={borderColor}
                                                onChange={(e) => setBorderColor(e.target.value)}
                                                className={styles.borderColorInput}
                                                title="Select border color"
                                            />
                                            <input
                                                type="text"
                                                value={borderColor.toUpperCase()}
                                                onChange={(e) => {
                                                    const hex = e.target.value.toUpperCase();
                                                    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                                        setBorderColor(hex);
                                                    }
                                                }}
                                                placeholder="#000000"
                                                className={styles.borderColorHex}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} */}
                    </>
                )}
            </div>
        </div>
    );
};
