"use client";

import React from 'react';
import { TableEditorProps } from './types';
import { useTableData } from './hooks/useTableData';
import { useTableStyles } from './hooks/useTableStyles';
import { useFormulaEditor } from './hooks/useFormulaEditor';
import { useColumnDrag } from './hooks/useColumnDrag';
import { useColumnResize } from './hooks/useColumnResize';
import { useAutoColor } from './hooks/useAutoColor';
import { usePaste } from './hooks/usePaste';
import { FormulaBar } from './components/FormulaBar';
import { ControlPanel } from './components/ControlPanel';
import styles from './TableEditor.module.scss';

export default function TableEditor(props: TableEditorProps) {
    // Debug: Log props to see what we're receiving
    console.log('📋 TableEditor props:', { 
        tableIdentifier: props.tableIdentifier,
        tableName: props.tableName,
        hasTableIdentifier: !!props.tableIdentifier,
        typeOfTableIdentifier: typeof props.tableIdentifier,
        allProps: Object.keys(props)
    });
    
    const tableData = useTableData(props);
    const tableStyles = useTableStyles(
        tableData.rows,
        tableData.columns,
        tableData.setRows,
        tableData.cellStyles,
        tableData.setCellStyles,
        tableData.globalAlignment
    );
    const autoColor = useAutoColor(
        tableData.rows,
        tableData.setRows,
        tableData.cellStyles,
        tableData.setCellStyles
    );
    const [useSpreadEngine, setUseSpreadEngine] = React.useState(false);
    
    // Use tableIdentifier from props, fallback to tableData (state) if needed
    // If still missing, check if we have a table ID from tableData
    // If all else fails, use a default based on tableName or 'default-table'
    const tableIdentifier = (props.tableIdentifier && props.tableIdentifier !== 'undefined') ? props.tableIdentifier : 
        (tableData.tableIdentifier && tableData.tableIdentifier !== 'undefined' ? tableData.tableIdentifier : 
        (tableData.tableId ? `table-${tableData.tableId}` : 
        (props.tableName ? props.tableName.toLowerCase().replace(/\s+/g, '-') : 'default-table')));
    
    // For Google Sheets API, use string identifier (e.g., "fx_analyzer_pro")
    // This is used as the sheet tab name in Google Sheets
    // Note: This is DIFFERENT from the numeric database ID used in table-structure API
    const googleSheetsTableId = (
        (props.tableIdentifier && props.tableIdentifier !== 'undefined' && props.tableIdentifier !== '') 
            ? props.tableIdentifier 
            : (tableIdentifier && tableIdentifier !== 'undefined' && tableIdentifier !== '')
                ? tableIdentifier
                : 'default-table'
    );
    
    console.log('🔑 Table ID resolution for Google Sheets:', {
        propsTableIdentifier: props.tableIdentifier,
        tableDataTableId: tableData.tableId,
        tableDataTableIdentifier: tableData.tableIdentifier,
        computedTableIdentifier: tableIdentifier,
        googleSheetsTableId: googleSheetsTableId,
        typeof_propsTableIdentifier: typeof props.tableIdentifier,
        typeof_googleSheetsTableId: typeof googleSheetsTableId
    });
    
    // Ensure googleSheetsTableId is never undefined or empty
    if (!googleSheetsTableId || googleSheetsTableId === 'undefined' || googleSheetsTableId === '') {
        console.error('❌ CRITICAL: googleSheetsTableId is invalid!', {
            value: googleSheetsTableId,
            propsTableIdentifier: props.tableIdentifier,
            computedTableIdentifier: tableIdentifier
        });
    }
    
    if (!props.tableIdentifier && !tableData.tableIdentifier && !tableData.tableId) {
        console.warn('⚠️ No table identifier found, using fallback:', tableIdentifier);
    } else {
        console.log('✅ Resolved tableIdentifier for Google Sheets:', googleSheetsTableId);
    }
    
    // Create a stable reference for the table ID to pass to hooks
    // Use props.tableIdentifier with fallback to avoid undefined
    const stableTableId = props.tableIdentifier || tableData.tableIdentifier || 
        (props.tableName ? props.tableName.toLowerCase().replace(/\s+/g, '-') : 'default-table');
    
    console.log('🎯 Passing to useFormulaEditor:', {
        stableTableId,
        propsTableIdentifier: props.tableIdentifier,
        googleSheetsTableId
    });
    
    const formulaEditor = useFormulaEditor(
        tableData.rows,
        tableData.columns,
        tableData.setRows,
        tableData.formulaStartRow,
        tableStyles.handleCellStyleChange,
        stableTableId,
        useSpreadEngine
    );
    const columnDrag = useColumnDrag(
        tableData.columns,
        tableData.setColumns,
        tableData.setRows,
        tableData.setCellStyles
    );
    const columnResize = useColumnResize(
        tableData.columnWidths,
        tableData.setColumnWidths
    );
    const paste = usePaste(
        props.tableIdentifier,
        tableData.rows,
        tableData.setRows,
        tableData.columns,
        tableData.setColumns,
        tableData.cellStyles,
        tableData.setCellStyles,
        tableData.isInitialized,
        tableData.setIsInitialized,
        tableData.formulaStartRow,
        tableData.hasHeaders,
        tableData.setHasHeaders,
        formulaEditor.selectedCell,
        autoColor.autoColorEnabled,
        autoColor.calculateAutoColor,
        props.onPasteProgress
    );

    if (tableData.loading) {
        return <div className={styles.loading}>Loading table...</div>;
    }

    return (
        <div className={styles.inlineEditor}>
            {tableData.isInitialized && (
                <FormulaBar
                    {...formulaEditor}
                    rows={tableData.rows}
                    columns={tableData.columns}
                    formulaStartRow={tableData.formulaStartRow}
                />
            )}

            <ControlPanel
                {...tableData}
                {...autoColor}
                {...paste}
                tableName={props.tableName}
                showTableSelector={props.showTableSelector || false}
                availableTables={props.availableTables || []}
                onTableSelect={props.onTableSelect}
                showAdvancedControls={props.showAdvancedControls || false}
                showStructureControls={props.showStructureControls || false}
                useSpreadEngine={useSpreadEngine}
                setUseSpreadEngine={setUseSpreadEngine}
            />

            {/* Main Table component would be here */}
            {/* ... */}
        </div>
    );
}
