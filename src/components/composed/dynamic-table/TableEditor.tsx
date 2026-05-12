"use client";

import styles from './TableEditor.module.scss';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { TableEditorProps } from './TableEditor/types';
import { useTableData } from './TableEditor/hooks/useTableData';
import { useTableStyles } from './TableEditor/hooks/useTableStyles';
import { useFormulaEditor } from './TableEditor/hooks/useFormulaEditor';
import { useColumnDrag } from './TableEditor/hooks/useColumnDrag';
import { useColumnResize } from './TableEditor/hooks/useColumnResize';
import { useAutoColor } from './TableEditor/hooks/useAutoColor';
import { usePaste } from './TableEditor/hooks/usePaste';
import { FormulaBar } from './TableEditor/components/FormulaBar';
import { ControlPanel } from './TableEditor/components/ControlPanel';
import { EditorTable } from './TableEditor/components/EditorTable';
import { StyleEditorModal } from './TableEditor/components/StyleEditorModal';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getCellDisplayValue, extractNumericValue } from './TableEditor/utils/formulaUtils';

export default function TableEditor(props: TableEditorProps) {
    const shouldApplyRoleBasedChecks = props.enableRoleBasedChecks ?? false;
    const isAdminView = shouldApplyRoleBasedChecks
        ? (props.showAdvancedControls || props.showStructureControls)
        : true;
    const [isReadOnly, setIsReadOnly] = useState(props.isReadOnly ?? !isAdminView);
    const [isSaving, setIsSaving] = useState(false);
    const [useSpreadEngine, setUseSpreadEngine] = useState(false);

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
    const formulaEditor = useFormulaEditor(
        tableData.rows,
        tableData.columns,
        tableData.setRows,
        tableData.formulaStartRow,
        tableStyles.handleCellStyleChange,
        props.tableIdentifier || tableData.tableIdentifier || 'default-table',
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
        props.tableIdentifier || tableData.tableIdentifier || 'default-table',
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

    const shouldShowAdvancedControls = shouldApplyRoleBasedChecks
        ? (props.showAdvancedControls || false)
        : true;
    const shouldShowStructureControls = shouldApplyRoleBasedChecks
        ? (props.showStructureControls || false)
        : true;

    const isSavingOverall = isSaving || tableData.saving;

    const isUserView = !shouldShowAdvancedControls && !shouldShowStructureControls;

    const handleEditToggle = () => {
        setIsReadOnly(false);
        props.onEditToggle?.(false);
    };

    const handleSaveChanges = async () => {
        if (!tableData.isInitialized) {
            toast.error('Table is not initialized. Please wait for the table to load.');
            return;
        }

        try {
            setIsSaving(true);
            const savePromise = tableData.handleSaveTable();

            toast.promise(savePromise, {
                loading: 'Saving table changes...',
                success: 'Table saved successfully!',
                error: 'Failed to save table. Please try again.'
            });

            await savePromise;

            // Add a small delay before hiding the overlay for a smoother transition
            await new Promise(resolve => setTimeout(resolve, 500));

            setIsReadOnly(true);
            props.onEditToggle?.(true);
            props.onSave?.();
        } catch (error) {
            console.error('Failed to save table:', error);
            // Error is handled by toast.promise
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.inlineEditor}>
            {(isSavingOverall || tableData.loading) && (
                <div className={styles.savingOverlay} style={tableData.loading ? { position: 'relative', height: '400px', backgroundColor: 'transparent', backdropFilter: 'none' } : {}}>
                    <div className={styles.spinner}></div>
                    <div className={styles.message} style={tableData.loading ? { color: 'rgb(var(--secondary))' } : {}}>{tableData.loading ? 'Loading Table Data...' : 'Processing...'}</div>
                </div>
            )}

            {!tableData.loading && (
                <>
                    {isUserView && (
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '15px',
                            padding: '10px',
                            background: 'linear-gradient(135deg, rgb(var(--background)) 0%, rgb(var(--dark-grey)) 100%)',
                            borderRadius: '12px',
                            border: '1px solid rgb(var(--stroke))',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                            {isReadOnly ? (
                                <button
                                    onClick={handleEditToggle}
                                    style={{
                                        padding: '10px 16px',
                                        background: 'linear-gradient(135deg, rgb(var(--electric-blue)) 0%, rgb(var(--electric-blue)) 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                                    }}
                                >
                                    <span>✏️</span>
                                    <span>Edit</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={isSaving}
                                    style={{
                                        padding: '10px 16px',
                                        background: isSaving
                                            ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                                            : 'linear-gradient(135deg, rgb(var(--green)) 0%, rgb(var(--green-dark)) 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        boxShadow: isSaving
                                            ? '0 2px 4px rgba(148, 163, 184, 0.3)'
                                            : '0 2px 4px rgba(16, 185, 129, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        opacity: isSaving ? 0.7 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSaving) {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSaving) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                                        }
                                    }}
                                >
                                    <span>{isSaving ? '⏳' : '💾'}</span>
                                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            )}
                        </div>
                    )}
                    {paste.isPasteMode && (
                        <div style={{
                            position: 'fixed',
                            top: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, rgb(var(--green)) 0%, rgb(var(--green-dark)) 100%)',
                            color: 'white',
                            padding: '18px 24px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            zIndex: 10000,
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            minWidth: '400px',
                            maxWidth: '600px',
                            animation: 'pulse 2s infinite'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span>📋</span>
                                <span>Paste Mode Active - Copy a table from Excel and press Ctrl+V (or Cmd+V) to paste</span>
                                <button
                                    onClick={() => paste.setIsPasteMode(false)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        padding: '4px 12px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        marginLeft: 'auto'
                                    }}
                                >
                                    ✕ Close
                                </button>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}>
                                <input
                                    type="checkbox"
                                    id="preserveFormulas"
                                    checked={paste.preserveFormulas}
                                    onChange={(e) => paste.setPreserveFormulas(e.target.checked)}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <label
                                    htmlFor="preserveFormulas"
                                    style={{
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                >
                                    Preserve Formulas (if unchecked, only displayed values will be pasted)
                                </label>
                            </div>
                        </div>
                    )}

                    {paste.isPasting && (
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(3, 7, 18, 0.72)',
                                zIndex: 12000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(2px)',
                            }}
                        >
                            <div
                                style={{
                                    minWidth: '320px',
                                    background: '#101827',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    borderRadius: '12px',
                                    padding: '18px 22px',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>⏳</span>
                                <span style={{ fontSize: '15px', fontWeight: 600 }}>
                                    Pasting table... please wait
                                </span>
                            </div>
                        </div>
                    )}

                    {tableData.isInitialized && columnDrag.isCtrlDown && (shouldShowAdvancedControls || shouldShowStructureControls) && (
                            <div style={{
                            position: 'fixed',
                            top: '20px',
                            right: paste.isPasteMode ? '280px' : '20px',
                            background: 'rgb(var(--electric-blue))',
                            color: 'white',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            zIndex: 10000,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                            {columnDrag.draggedColIdx === null
                                ? (columnDrag.swapColIdx === null
                                    ? 'Drag a column header to swap, or click to select'
                                    : 'Click another column to swap')
                                : 'Drag to another column to swap'}
                        </div>
                    )}

                    {tableData.isInitialized && (shouldShowAdvancedControls || shouldShowStructureControls) && (
                        <FormulaBar
                            {...formulaEditor}
                            syncingCells={formulaEditor.syncingCells}
                            rows={tableData.rows}
                            columns={tableData.columns}
                            formulaStartRow={tableData.formulaStartRow}
                            formulaBarInputRef={formulaEditor.formulaBarInputRef as React.RefObject<HTMLInputElement>}
                        />
                    )}

                    {shouldShowStructureControls && tableData.isInitialized && (
                        <div
                            className="mb-4 rounded-lg border border-stroke px-4 py-3"
                            style={{
                                background: "linear-gradient(135deg, rgb(var(--background)) 0%, rgb(var(--dark-grey)) 100%)",
                            }}
                        >
                            <p className="mb-1 text-[15px] font-bold">Column visibility (users)</p>
                            <p className="mb-3 text-sm text-[rgb(var(--secondary))]">
                                Columns marked admin only are hidden from non-admin accounts in read-only table views.
                            </p>
                            <div
                                className="flex max-h-[min(50vh,360px)] flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1"
                                style={{ scrollbarGutter: "stable" }}
                            >
                                {tableData.columns.map((col, idx) => (
                                    <div key={col.id} className="flex items-center justify-between gap-3">
                                        <span className="truncate text-sm">{col.header ?? ""}</span>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Label htmlFor={`col-admin-only-${idx}`} className="text-xs text-[rgb(var(--secondary))]">
                                                Admin only
                                            </Label>
                                            <Switch
                                                id={`col-admin-only-${idx}`}
                                                checked={Boolean(col.column_metadata?.admin_only)}
                                                onCheckedChange={(checked) => {
                                                    tableData.setColumns((prev) =>
                                                        prev.map((c, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...c,
                                                                      column_metadata: {
                                                                          ...(c.column_metadata || {}),
                                                                          admin_only: checked,
                                                                      },
                                                                  }
                                                                : c,
                                                        ),
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(shouldShowAdvancedControls || shouldShowStructureControls) && (
                        <ControlPanel
                            {...tableData}
                            {...autoColor}
                            {...paste}
                            tableIdentifier={props.tableIdentifier}
                            tableName={props.tableName}
                            showTableSelector={props.showTableSelector || false}
                            availableTables={props.availableTables || []}
                            onTableSelect={props.onTableSelect}
                            showAdvancedControls={shouldShowAdvancedControls}
                            showStructureControls={shouldShowStructureControls}
                            cellStyles={tableData.cellStyles}
                            setCellStyles={tableData.setCellStyles}
                            setRows={tableData.setRows}
                            useSpreadEngine={useSpreadEngine}
                            setUseSpreadEngine={setUseSpreadEngine}
                        />
                    )}

                    {tableData.isInitialized && (
                        <EditorTable
                            rows={tableData.rows}
                            columns={tableData.columns}
                            hasHeaders={tableData.hasHeaders}
                            borderColor={tableData.borderColor}
                            borderStyle={tableData.borderStyle}
                            getCellStyle={tableStyles.getCellStyle}
                            cellStyles={tableData.cellStyles}
                            columnWidths={tableData.columnWidths}
                            isCtrlDown={columnDrag.isCtrlDown}
                            swapColIdx={columnDrag.swapColIdx}
                            draggedColIdx={columnDrag.draggedColIdx}
                            dragOverColIdx={columnDrag.dragOverColIdx}
                            isDragging={columnDrag.isDragging}
                            swapDirection={columnDrag.swapDirection}
                            resizingColIdx={columnResize.resizingColIdx}
                            handleResizeStart={columnResize.handleResizeStart}
                            handleCellClick={formulaEditor.handleCellClick}
                            handleCellChange={formulaEditor.handleCellChange}
                            handleInstantCellUpdate={formulaEditor.handleInstantCellUpdate}
                            syncingCells={formulaEditor.syncingCells}
                            selectedCell={formulaEditor.selectedCell}
                            isEditingFormula={formulaEditor.isEditingFormula}
                            setIsEditingFormula={formulaEditor.setIsEditingFormula}
                            setHoveredCell={tableStyles.setHoveredCell}
                            setActiveTab={tableStyles.setActiveTab}
                            duplicateColumn={tableData.duplicateColumn}
                            handleDeleteColumn={tableData.handleDeleteColumn}
                            handleDeleteRow={tableData.handleDeleteRow}
                            handleAddRow={tableData.handleAddRow}
                            handleColumnHeaderChange={tableData.handleColumnHeaderChange}
                            getCellDisplayValue={(row, col) => getCellDisplayValue(row, col, tableData.rows, tableData.columns, tableData.formulaStartRow)}
                            extractNumericValue={(row, col) => extractNumericValue(row, col, tableData.rows, tableData.columns, tableData.formulaStartRow)}
                            tableIdentifier={props.tableIdentifier}
                            showAddRowIcon={props.showAddRowIcon}
                            formulaBarInputRef={formulaEditor.formulaBarInputRef as React.RefObject<HTMLInputElement>}
                            setFormulaBarValue={formulaEditor.setFormulaBarValue}
                            globalAlignment={tableData.globalAlignment}
                            swapColumns={columnDrag.swapColumns}
                            setSwapColIdx={columnDrag.setSwapColIdx}
                            setIsDragging={columnDrag.setIsDragging}
                            setDraggedColIdx={columnDrag.setDraggedColIdx}
                            setDragOverColIdx={columnDrag.setDragOverColIdx}
                            setSwapDirection={columnDrag.setSwapDirection}
                            dragStartPosRef={columnDrag.dragStartPosRef}
                            isUserView={isUserView}
                            initialRowCount={props.initialRowCount || 0}
                            isReadOnly={isReadOnly}
                        />
                    )}

                    {(shouldShowAdvancedControls || shouldShowStructureControls) && (
                        <StyleEditorModal
                            {...tableStyles}
                            columns={tableData.columns}
                            rows={tableData.rows}
                            cellStyles={tableData.cellStyles}
                            setCellStyles={tableData.setCellStyles}
                            setRows={tableData.setRows}
                            borderColor={tableData.borderColor}
                            globalAlignment={tableData.globalAlignment}
                        />
                    )}
                </>
            )}
        </div>
    );
}
