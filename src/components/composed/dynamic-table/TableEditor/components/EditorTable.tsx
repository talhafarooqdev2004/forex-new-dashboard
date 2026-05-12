import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/composed/base-table/TableParts";
import { TableRow, TableColumn, CellData } from '../types';
import { CellMetadata } from '@/services/dynamicTable.service';
import styles from '../../TableEditor.module.scss';

const TABLE_CELL_BG = 'var(--table-cell-bg, rgb(var(--dark-grey)))';
const TABLE_CELL_TEXT = 'var(--table-cell-text, #ffffff)';
const TABLE_CELL_BORDER = 'var(--table-cell-border, rgb(var(--charcoal)))';

interface EditorTableProps {
    rows: TableRow[];
    columns: TableColumn[];
    hasHeaders: boolean;
    borderColor: string;
    borderStyle: 'spacing' | 'simple';
    getCellStyle: (rowIndex: number | 'header', colIndex: number) => React.CSSProperties & { borderColor?: string };
    cellStyles: Record<string, CellMetadata>;
    columnWidths: Record<number, number>;
    isCtrlDown: boolean;
    swapColIdx: number | null;
    draggedColIdx: number | null;
    dragOverColIdx: number | null;
    isDragging: boolean;
    swapDirection: 'left' | 'right' | null;
    resizingColIdx: number | null;
    handleResizeStart: (colIdx: number, e: React.MouseEvent) => void;
    handleCellClick: (rowIdx: number, colIdx: number) => void;
    handleCellChange: (rowIdx: number, colIdx: number, value: string) => void;
    handleInstantCellUpdate: (rowIdx: number, colIdx: number, value: string) => void;
    syncingCells: Record<string, boolean>;
    selectedCell: { rowIndex: number; colIndex: number } | null;
    isEditingFormula: boolean;
    setIsEditingFormula: (val: boolean) => void;
    setHoveredCell: (cell: { rowIndex: number | 'header'; colIndex: number } | null) => void;
    setActiveTab: (tab: 'background' | 'text' | 'alignment' | 'border') => void;
    duplicateColumn: (colIdx: number) => void;
    handleDeleteColumn: (colIdx: number) => void;
    handleDeleteRow: (rowIdx: number) => void;
    handleAddRow: (afterIndex?: number) => void;
    handleColumnHeaderChange: (colIdx: number, value: string) => void;
    getCellDisplayValue: (row: number, col: number) => string;
    extractNumericValue: (row: number, col: number) => number | null;
    tableIdentifier: string;
    showAddRowIcon?: boolean;
    formulaBarInputRef: React.RefObject<HTMLInputElement>;
    setFormulaBarValue: (val: string) => void;
    globalAlignment: 'left' | 'center' | 'right';
    swapColumns: (idxA: number, idxB: number) => void;
    setSwapColIdx: (idx: number | null) => void;
    setIsDragging: (val: boolean) => void;
    setDraggedColIdx: (idx: number | null) => void;
    setDragOverColIdx: (idx: number | null) => void;
    setSwapDirection: (dir: 'left' | 'right' | null) => void;
    dragStartPosRef: React.MutableRefObject<{ x: number; colIdx: number } | null>;
    isUserView?: boolean;
    initialRowCount?: number;
    isReadOnly?: boolean;
}

// Internal SVG components for badges/icons
const PositiveIcon = ({ id }: { id: string }) => (
    <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <g clipPath={`url(#${id})`}>
            <path d="M3.5798 9.76107C3.90552 10.0868 4.43449 10.0868 4.76021 9.76107L8.09557 6.42571C8.3353 6.18598 8.40565 5.829 8.27536 5.51631C8.14508 5.20361 7.84281 5.00037 7.50406 5.00037L0.833338 5.00297C0.497196 5.00297 0.192323 5.20622 0.0620355 5.51891C-0.0682521 5.8316 0.00470899 6.18859 0.241832 6.42832L3.57719 9.76368L3.5798 9.76107Z" fill="#EF4444" />
        </g>
        <defs><clipPath id={id}><path d="M0 0H8.3384V13.3414H0V0Z" fill="white" /></clipPath></defs>
    </svg>
);

const NegativeIcon = ({ id }: { id: string }) => (
    <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <g clipPath={`url(#${id})`}>
            <path d="M4.75818 3.58035C4.43246 3.25463 3.90349 3.25463 3.57777 3.58035L0.242408 6.91571C0.00267933 7.15544 -0.067676 7.51243 0.0626116 7.82512C0.192899 8.13781 0.495166 8.34106 0.833914 8.34106H7.50464C7.84078 8.34106 8.14565 8.13781 8.27594 7.82512C8.40623 7.51243 8.33327 7.15544 8.09614 6.91571L4.76078 3.58035H4.75818Z" fill="#22C55E" />
        </g>
        <defs><clipPath id={id}><path d="M0 0H8.3384V13.3414H0V0Z" fill="white" /></clipPath></defs>
    </svg>
);

const NeutralIcon = ({ id }: { id: string }) => (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <g clipPath={`url(#${id})`}>
            <path d="M11.2579 6.67075C11.2579 7.13197 10.8853 7.5046 10.4241 7.5046H1.25181C0.790591 7.5046 0.417969 7.13197 0.417969 6.67075C0.417969 6.20954 0.790591 5.83691 1.25181 5.83691H10.4241C10.8853 5.83691 11.2579 6.20954 11.2579 6.67075Z" fill="#3B82F6" />
        </g>
        <defs><clipPath id={id}><path d="M0 0H11.6738V13.3414H0V0Z" fill="white" /></clipPath></defs>
    </svg>
);

const PositiveBadge = ({ id }: { id: string }) => (
    <svg width="76" height="23" viewBox="0 0 76 23" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M71.71 0C73.5519 0 75.0457 1.49308 75.0459 3.33496V19.335C75.0457 21.1769 73.5519 22.6699 71.71 22.6699H3.33496C1.49317 22.6697 0.00015357 21.1768 0 19.335V3.33496C0.00021592 1.49321 1.49321 0.000216693 3.33496 0H71.71Z" fill="#DC2626" />
        <path d="M71.71 0C73.5519 0 75.0457 1.49308 75.0459 3.33496V19.335C75.0457 21.1769 73.5519 22.6699 71.71 22.6699H3.33496C1.49317 22.6697 0.00015357 21.1768 0 19.335V3.33496C0.00021592 1.49321 1.49321 0.000216693 3.33496 0H71.71Z" stroke="#E5E7EB" />
        <path d="M8.85279 15.0029V7.24063H11.6954V15.0029H8.85279ZM13.538V15.0029H16.3806V7.24063H13.538V15.0029ZM18.2232 15.0029H21.0658V7.24063H18.2232V15.0029ZM22.9084 15.0029H25.751V7.24063H22.9084V15.0029ZM27.5936 15.0029H30.4362V7.24063H27.5936V15.0029ZM32.2788 15.0029H35.1214V7.24063H32.2788V15.0029ZM36.964 15.0029H39.8066V7.24063H36.964V15.0029ZM41.6492 15.0029H44.4918V7.24063H41.6492V15.0029ZM46.3344 15.0029H49.177V7.24063H46.3344V15.0029ZM51.0196 15.0029H53.8622V7.24063H51.0196V15.0029ZM55.7048 15.0029H58.5474V7.24063H55.7048V15.0029ZM60.39 15.0029H63.2326V7.24063H60.39V15.0029ZM65.0752 15.0029H67.9178V7.24063H65.0752V15.0029Z" fill="white" />
    </svg>
);

const NegativeBadge = ({ id }: { id: string }) => (
    <svg width="76" height="23" viewBox="0 0 76 23" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M71.71 0C73.5519 0 75.0457 1.49308 75.0459 3.33496V19.335C75.0457 21.1769 73.5519 22.6699 71.71 22.6699H3.33496C1.49317 22.6697 0.00015357 21.1768 0 19.335V3.33496C0.00021592 1.49321 1.49321 0.000216693 3.33496 0H71.71Z" fill="#16A34A" />
        <path d="M71.71 0C73.5519 0 75.0457 1.49308 75.0459 3.33496V19.335C75.0457 21.1769 73.5519 22.6699 71.71 22.6699H3.33496C1.49317 22.6697 0.00015357 21.1768 0 19.335V3.33496C0.00021592 1.49321 1.49321 0.000216693 3.33496 0H71.71Z" stroke="#E5E7EB" />
        <path d="M8.85279 15.0029V7.24063H11.6954V15.0029H8.85279ZM13.538V15.0029H16.3806V7.24063H13.538V15.0029ZM18.2232 15.0029H21.0658V7.24063H18.2232V15.0029ZM22.9084 15.0029H25.751V7.24063H22.9084V15.0029ZM27.5936 15.0029H30.4362V7.24063H27.5936V15.0029ZM32.2788 15.0029H35.1214V7.24063H32.2788V15.0029ZM36.964 15.0029H39.8066V7.24063H36.964V15.0029ZM41.6492 15.0029H44.4918V7.24063H41.6492V15.0029ZM46.3344 15.0029H49.177V7.24063H46.3344V15.0029ZM51.0196 15.0029H53.8622V7.24063H51.0196V15.0029ZM55.7048 15.0029H58.5474V7.24063H55.7048V15.0029ZM60.39 15.0029H63.2326V7.24063H60.39V15.0029ZM65.0752 15.0029H67.9178V7.24063H65.0752V15.0029Z" fill="white" />
    </svg>
);

const NeutralBadge = ({ id }: { id: string }) => (
    <svg width="76" height="23" viewBox="0 0 76 23" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M71.71 0C73.5519 0 75.0457 1.49308 75.0459 3.33496V19.335C75.0457 21.1769 73.5519 22.6699 71.71 22.6699H3.33496C1.49317 22.6697 0.00015357 21.1768 0 19.335V3.33496C0.00021592 1.49321 1.49321 0.000216693 3.33496 0H71.71Z" fill="#3B82F6" />
        <path d="M71.71 0C73.5519 0 75.0457 1.49308 75.0459 3.33496V19.335C75.0457 21.1769 73.5519 22.6699 71.71 22.6699H3.33496C1.49317 22.6697 0.00015357 21.1768 0 19.335V3.33496C0.00021592 1.49321 1.49321 0.000216693 3.33496 0H71.71Z" stroke="#E5E7EB" />
        <path d="M8.85279 15.0029V7.24063H11.6954V15.0029H8.85279ZM13.538V15.0029H16.3806V7.24063H13.538V15.0029ZM18.2232 15.0029H21.0658V7.24063H18.2232V15.0029ZM22.9084 15.0029H25.751V7.24063H22.9084V15.0029ZM27.5936 15.0029H30.4362V7.24063H27.5936V15.0029ZM32.2788 15.0029H35.1214V7.24063H32.2788V15.0029ZM36.964 15.0029H39.8066V7.24063H36.964V15.0029ZM41.6492 15.0029H44.4918V7.24063H41.6492V15.0029ZM46.3344 15.0029H49.177V7.24063H46.3344V15.0029ZM51.0196 15.0029H53.8622V7.24063H51.0196V15.0029ZM55.7048 15.0029H58.5474V7.24063H55.7048V15.0029ZM60.39 15.0029H63.2326V7.24063H60.39V15.0029ZM65.0752 15.0029H67.9178V7.24063H65.0752V15.0029Z" fill="white" />
    </svg>
);

export const EditorTable: React.FC<EditorTableProps> = ({
    rows,
    columns,
    hasHeaders,
    borderColor,
    borderStyle,
    getCellStyle,
    cellStyles,
    columnWidths,
    isCtrlDown,
    swapColIdx,
    draggedColIdx,
    dragOverColIdx,
    isDragging,
    swapDirection,
    resizingColIdx,
    handleResizeStart,
    handleCellClick,
    handleCellChange,
    handleInstantCellUpdate,
    syncingCells,
    selectedCell,
    isEditingFormula,
    setIsEditingFormula,
    setHoveredCell,
    setActiveTab,
    duplicateColumn,
    handleDeleteColumn,
    handleDeleteRow,
    handleAddRow,
    handleColumnHeaderChange,
    getCellDisplayValue,
    extractNumericValue,
    tableIdentifier,
    showAddRowIcon,
    formulaBarInputRef,
    setFormulaBarValue,
    globalAlignment,
    swapColumns,
    setSwapColIdx,
    setIsDragging,
    setDraggedColIdx,
    setDragOverColIdx,
    setSwapDirection,
    dragStartPosRef,
    isUserView = false,
    initialRowCount = 0,
    isReadOnly = false
}) => {
    const isCurrencyFundamentalsTable =
        tableIdentifier.startsWith('currency_fundamental_') ||
        tableIdentifier.startsWith('currency_fundamentals_');
    const isLegacyCurrencyFundamentalTable =
        tableIdentifier.startsWith('currency_fundamental_') &&
        !tableIdentifier.startsWith('currency_fundamentals_');

    const getBadgeForValue = (value: number | null, colIdx: number): 'positive' | 'negative' | 'neutral' | null => {
        if (value === null || isNaN(value)) return null;
        if (colIdx === 7) { // Change column
            if (value > 0) return 'positive';
            if (value < 0) return 'negative';
            return 'neutral';
        }
        if (colIdx === 8) { // Surprise column
            if (value > 0) return 'positive';
            if (value < 0) return 'negative';
            return 'neutral';
        }
        return null;
    };

    const renderBadgeOrIcon = (value: number | null, colIdx: number, rowIdx: number) => {
        const badgeType = getBadgeForValue(value, colIdx);
        if (!badgeType) return null;

        const uniqueId = `badge-${rowIdx}-${colIdx}`;
        if (colIdx === 7 || colIdx === 8) {
            if (badgeType === 'positive') return <PositiveBadge id={uniqueId} />;
            if (badgeType === 'negative') return <NegativeBadge id={uniqueId} />;
            if (badgeType === 'neutral') return <NeutralBadge id={uniqueId} />;
        }
        return null;
    };

    return (
        <div
            className={styles.tableWrapper}
            onMouseLeave={() => {
                // Reset drag states when mouse leaves table area
                if (isDragging) {
                    setIsDragging(false);
                    setDraggedColIdx(null);
                    setDragOverColIdx(null);
                    setSwapDirection(null);
                    dragStartPosRef.current = null;
                }
            }}
        >
            <Table
                borderSpacing={borderStyle === 'spacing'}
                smallBorderSpacing={borderStyle === 'spacing'}
                style={{ tableLayout: 'auto', width: 'auto' }}
            >
                {hasHeaders && (
                    <Thead borderColor={isCurrencyFundamentalsTable ? TABLE_CELL_BORDER : borderColor}>
                        <Tr>
                            {columns.map((col, colIdx) => {
                                // Get colspan from column metadata
                                const colMetadata = cellStyles[`header-${colIdx}`] || {};
                                const colspan = colMetadata.colspan ? parseInt(String(colMetadata.colspan)) : 1;

                                // Check if this column is covered by a previous column's colspan
                                let isCoveredByPrevious = false;
                                for (let i = 0; i < colIdx; i++) {
                                    const prevColMetadata = cellStyles[`header-${i}`] || {};
                                    const prevColspan = prevColMetadata.colspan ? parseInt(String(prevColMetadata.colspan)) : 1;
                                    // A column is covered if it's within the range of a previous column's colspan
                                    if (prevColspan > 1 && colIdx >= i + 1 && colIdx < i + prevColspan) {
                                        isCoveredByPrevious = true;
                                        break;
                                    }
                                }

                                // If this column is covered by a previous column's colspan, don't render a separate TH
                                if (isCoveredByPrevious) {
                                    return null;
                                }

                                // Apply colspan only to columns that have it
                                const headerStyle = getCellStyle('header', colIdx);

                                return (
                                    <Th
                                        key={col.id}
                                        data-col-index={colIdx}
                                        colSpan={colspan > 1 ? colspan : undefined}
                                            style={{
                                            position: 'relative',
                                            backgroundColor: (isCtrlDown && (swapColIdx === colIdx || draggedColIdx === colIdx)) ? '#dbeafe' :
                                                (isCtrlDown && dragOverColIdx === colIdx) ? '#bfdbfe' :
                                                    (headerStyle.backgroundColor || TABLE_CELL_BG),
                                            color: headerStyle.color || TABLE_CELL_TEXT,
                                            whiteSpace: 'nowrap',
                                            padding: '12px 8px',
                                            transition: 'background 0.15s',
                                            cursor: isCtrlDown ? (isDragging && draggedColIdx === colIdx ? 'grabbing' : 'grab') : undefined,
                                            opacity: (isCtrlDown && isDragging && draggedColIdx === colIdx) ? 0.7 : 1,
                                            userSelect: isCtrlDown ? 'none' : 'auto',
                                            ...(columnWidths[colIdx] && columnWidths[colIdx] > 0 && !isNaN(columnWidths[colIdx])
                                                ? { minWidth: `${Math.max(110, columnWidths[colIdx])}px` }
                                                : { minWidth: '110px' }
                                            ),
                                        }}
                                        className={[
                                            isCtrlDown ? styles.swapCursor : '',
                                            isCtrlDown && swapColIdx === colIdx ? styles.swapActiveCol : '',
                                        ].filter(Boolean).join(' ')}
                                        bgColor={(isCtrlDown && (swapColIdx === colIdx || draggedColIdx === colIdx)) ? '#dbeafe' :
                                            (isCtrlDown && dragOverColIdx === colIdx) ? '#bfdbfe' :
                                                (headerStyle.backgroundColor || TABLE_CELL_BG)}
                                        color={headerStyle.color || TABLE_CELL_TEXT}
                                        borderColor={getCellStyle('header', colIdx).borderColor || borderColor}
                                        onDoubleClick={() => {
                                            if (!isCtrlDown && !isUserView) {
                                                setHoveredCell({ rowIndex: 'header', colIndex: colIdx });
                                                setActiveTab('background');
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            // Don't interfere with resize handle
                                            const target = e.target as HTMLElement;
                                            if (target.style.cursor === 'col-resize' || target.closest('[style*="cursor: col-resize"]')) {
                                                return; // Let resize handle handle it
                                            }
                                            if (isCtrlDown) {
                                                // Only start drag if clicking on the header itself, not buttons
                                                if (target.tagName !== 'BUTTON' && !target.closest('button') &&
                                                    target.tagName !== 'INPUT' && !target.closest('input')) {
                                                    e.preventDefault();
                                                    // Clear any previous drag states
                                                    setDragOverColIdx(null);
                                                    setSwapDirection(null);
                                                    setIsDragging(true);
                                                    setDraggedColIdx(colIdx);
                                                    dragStartPosRef.current = { x: e.clientX, colIdx };
                                                }
                                            }
                                        }}
                                        onClick={e => {
                                            // Only handle click if not dragging
                                            if (!isDragging && (e.ctrlKey || e.metaKey || isCtrlDown)) {
                                                const target = e.target as HTMLElement;
                                                // Don't trigger swap if clicking buttons
                                                if (target.tagName !== 'BUTTON' && !target.closest('button')) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (swapColIdx === null) {
                                                        setSwapColIdx(colIdx);
                                                    } else if (swapColIdx !== colIdx) {
                                                        swapColumns(swapColIdx, colIdx);
                                                        setSwapColIdx(null);
                                                    } else {
                                                        setSwapColIdx(null);
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        {!isUserView && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateColumn(colIdx);
                                                    }}
                                                    className={styles.duplicateBtn}
                                                    aria-label="Duplicate column"
                                                    title="Duplicate column"
                                                >
                                                    🗐
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteColumn(colIdx);
                                                    }}
                                                    className={styles.crossRemoveBtn}
                                                    aria-label="Remove column"
                                                    title="Remove column"
                                                >
                                                    ×
                                                </button>
                                            </>
                                        )}
                                        <input
                                            type="text"
                                            value={col.header}
                                            onChange={(e) => handleColumnHeaderChange(colIdx, e.target.value)}
                                            className={styles.headerInput}
                                            placeholder=""
                                            readOnly={isUserView}
                                            style={{
                                                textAlign: (headerStyle.textAlign || globalAlignment) as 'left' | 'center' | 'right',
                                                color: headerStyle.color || TABLE_CELL_TEXT,
                                                fontWeight: headerStyle.fontWeight || 'normal',
                                                cursor: isUserView ? 'default' : (isCtrlDown ? 'grab' : 'text'),
                                                pointerEvents: isUserView ? 'none' : (isCtrlDown ? 'none' : 'auto'),
                                            }}
                                            onDoubleClick={(e) => {
                                                if (!isCtrlDown) {
                                                    e.stopPropagation();
                                                    setHoveredCell({ rowIndex: 'header', colIndex: colIdx });
                                                    setActiveTab('background');
                                                }
                                            }}
                                            onClick={(e) => {
                                                if (isUserView) return; // Disable column swap for user view
                                                if (isCtrlDown || e.ctrlKey || e.metaKey) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // Trigger the parent Th's onClick
                                                    if (swapColIdx === null) {
                                                        setSwapColIdx(colIdx);
                                                    } else if (swapColIdx !== colIdx) {
                                                        swapColumns(swapColIdx, colIdx);
                                                        setSwapColIdx(null);
                                                    } else {
                                                        setSwapColIdx(null);
                                                    }
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (isCtrlDown) {
                                                    e.target.blur();
                                                }
                                            }}
                                        />
                                        {/* Column Resize Handle */}
                                        {!isCtrlDown && (
                                            <div
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleResizeStart(colIdx, e);
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: '-2px',
                                                    width: '6px',
                                                    height: '100%',
                                                    cursor: 'col-resize',
                                                    zIndex: 100,
                                                    backgroundColor: resizingColIdx === colIdx ? '#2563eb' : 'transparent',
                                                    transition: 'background-color 0.2s',
                                                    userSelect: 'none',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (resizingColIdx === null) {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#cbd5e1';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (resizingColIdx !== colIdx) {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                                title="Drag to resize column width"
                                            />
                                        )}
                                        {/* Swap Direction Indicators */}
                                        {isDragging && dragOverColIdx === colIdx && swapDirection && (
                                            <>
                                                <div className={styles.swapIndicator}>
                                                    {swapDirection === 'left' ? (
                                                        <div className={styles.swapArrowLeft}>
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M9 12L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className={styles.swapArrowRight}>
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M15 12L3 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Placement indicator line */}
                                                <div className={swapDirection === 'left' ? styles.swapLineLeft : styles.swapLineRight}></div>
                                            </>
                                        )}
                                    </Th>
                                );
                            })}
                            {/* Empty header cell for add row column (if showAddRowIcon and not read-only) */}
                            {hasHeaders && showAddRowIcon && !isReadOnly && (
                                <Th
                                    key="add-row-header"
                                    style={{
                                        padding: '5px',
                                        width: '50px',
                                        minWidth: '50px',
                                        borderColor: borderColor
                                    }}
                                    borderColor={borderColor}
                                >
                                </Th>
                            )}
                            {/* Empty header cell for delete button column (if not read-only) */}
                            {hasHeaders && !isReadOnly && (
                                <Th
                                    key="delete-header"
                                    style={{
                                        padding: '5px',
                                        width: '50px',
                                        minWidth: '50px',
                                        borderColor: borderColor
                                    }}
                                    borderColor={borderColor}
                                >
                                </Th>
                            )}
                        </Tr>
                    </Thead>
                )}
                <Tbody>
                    {rows.map((row, rowIdx) => (
                        <Tr key={row.id}>
                            {columns.map((col, colIdx) => {
                                const cellData = row.cells[colIdx] || { value: '', metadata: {} };
                                const cellStyle = getCellStyle(rowIdx, colIdx);
                                const isSelected = selectedCell?.rowIndex === rowIdx && selectedCell?.colIndex === colIdx;
                                const isSyncing = syncingCells[`${rowIdx}-${colIdx}`];
                                const cellValue = extractNumericValue(rowIdx, colIdx);
                                const displayValue = getCellDisplayValue(rowIdx, colIdx);
                                const hasFormula = cellData.formula && cellData.formula.trim().length > 0;
                                return (
                                    <Td
                                        key={col.id}
                                        bgColor={cellStyle.backgroundColor}
                                        color={cellStyle.color}
                                        borderColor={cellStyle.borderColor || borderColor}
                                        style={{
                                            whiteSpace: 'nowrap',
                                            padding: '12px 8px',
                                            position: 'relative',
                                            backgroundColor: cellStyle.backgroundColor || undefined,
                                            boxShadow: isSelected ? 'inset 0 0 0 2px #3b82f6' : undefined,
                                            cursor: isUserView ? 'text' : 'pointer',
                                            ...(columnWidths[colIdx] && columnWidths[colIdx] > 0 && !isNaN(columnWidths[colIdx])
                                                ? { minWidth: `${Math.max(110, columnWidths[colIdx])}px` }
                                                : { minWidth: '110px' }
                                            ),
                                        }}
                                    >
                                        <div
                                            onClick={() => !isReadOnly && handleCellClick(rowIdx, colIdx)}
                                            style={{
                                                position: 'relative',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            {isSyncing ? (
                                                <div style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'rgba(255, 255, 255, 0.8)',
                                                    zIndex: 10
                                                }}>
                                                    <span className={styles.miniSpinner}></span>
                                                </div>
                                            ) : hasFormula && (
                                                <span
                                                    className={styles.formulaIndicator}
                                                    title={`Formula: ${cellData.formula}`}
                                                >
                                                    fx
                                                </span>
                                            )}
                                            {/* Show badge for column 2 (based on column 3 - Macroshift Score value in same row) */}
                                            {(() => {
                                                if (isCurrencyFundamentalsTable && !isReadOnly) return null;
                                                const columnId = columns[colIdx]?.id || '';

                                                // Check if this is column 2 (index 1, col-1) - should show badge based on Macroshift Score value
                                                // Only show badge for currency fundamentals tables
                                                const isColumn2 = isLegacyCurrencyFundamentalTable && (colIdx === 1 || columnId === 'col-1');

                                                if (!isColumn2) return null;

                                                // Find Macroshift Score column index (column 3, index 2)
                                                // Try multiple ways to find it: by header name, by ID, or by index
                                                let macroshiftScoreColIndex = columns.findIndex(
                                                    col => col.header === 'Macroshift Score' ||
                                                        col.id === 'col-2' ||
                                                        (col.header && col.header.toLowerCase().includes('macroshift'))
                                                );

                                                // If not found, try column index 2 (third column, 0-indexed)
                                                if (macroshiftScoreColIndex < 0 && columns.length > 2) {
                                                    // Check if column at index 2 is Macroshift Score
                                                    if (columns[2]?.header === 'Macroshift Score' ||
                                                        columns[2]?.id === 'col-2' ||
                                                        (columns[2]?.header && columns[2].header.toLowerCase().includes('macroshift'))) {
                                                        macroshiftScoreColIndex = 2;
                                                    }
                                                }

                                                // Column 2: use Macroshift Score column (column 3) value from the same row
                                                let numericValue: number | null = null;
                                                if (macroshiftScoreColIndex >= 0 && macroshiftScoreColIndex < columns.length) {
                                                    numericValue = extractNumericValue(rowIdx, macroshiftScoreColIndex);
                                                }

                                                // Show badge even if value is 0 (neutral badge)
                                                // Only return null if we can't determine the value at all
                                                if (numericValue === null) {
                                                    return null;
                                                }

                                                // Generate unique ID for this cell's badge to avoid clipPath conflicts
                                                const badgeId = `badge-${rowIdx}-${colIdx}`;

                                                // Determine which badge to show based on value from column 3 (Macroshift Score)
                                                // Use a small epsilon to handle floating point comparisons
                                                const epsilon = 1e-10;

                                                if (numericValue > epsilon) {
                                                    // Positive value → show positive badge (red)
                                                    return <PositiveBadge id={badgeId} />;
                                                } else if (numericValue < -epsilon) {
                                                    // Negative value → show negative badge (green)
                                                    return <NegativeBadge id={badgeId} />;
                                                } else {
                                                    // Neutral/zero value → show neutral badge (blue)
                                                    return <NeutralBadge id={badgeId} />;
                                                }
                                            })()}
                                            {/* Show small arrow icons for Macroshift Score and Divergence Score columns */}
                                            {(() => {
                                                if (isCurrencyFundamentalsTable && !isReadOnly) return null;
                                                const columnHeader = columns[colIdx]?.header || '';
                                                const columnId = columns[colIdx]?.id || '';

                                                // Check if this is Macroshift Score column (index 2, col-2)
                                                const isMacroshiftScore =
                                                    columnHeader === 'Macroshift Score' ||
                                                    columnId === 'col-2' ||
                                                    (colIdx === 2 && columnHeader.toLowerCase().includes('macroshift'));

                                                // Check if this is Divergence Score column (index 3, col-3)
                                                const isDivergenceScore =
                                                    columnHeader === 'Divergence Score' ||
                                                    columnId === 'col-3' ||
                                                    (colIdx === 3 && columnHeader.toLowerCase().includes('divergence'));

                                                // Only show icons for Macroshift Score or Divergence Score columns
                                                if (!isMacroshiftScore && !isDivergenceScore) return null;

                                                // Use own value for Macroshift Score or Divergence Score
                                                const numericValue = extractNumericValue(rowIdx, colIdx);

                                                // Show icon even if value is 0 (neutral icon)
                                                // Only return null if we can't determine the value at all
                                                if (numericValue === null) {
                                                    // If cell is empty, don't show icon
                                                    const cellData = rows[rowIdx]?.cells[colIdx];
                                                    if (!cellData || (!cellData.value || cellData.value.trim() === '') && !cellData.formula) {
                                                        return null;
                                                    }
                                                    // If there's a formula or value but we can't parse it, don't show icon
                                                    return null;
                                                }

                                                // Generate unique ID for this cell's icon to avoid clipPath conflicts
                                                const iconId = `icon-${rowIdx}-${colIdx}`;

                                                // Determine which icon to show based on value
                                                // Use a small epsilon to handle floating point comparisons
                                                const epsilon = 1e-10;
                                                if (numericValue > epsilon) {
                                                    return <PositiveIcon id={iconId} />;
                                                } else if (numericValue < -epsilon) {
                                                    return <NegativeIcon id={iconId} />;
                                                } else {
                                                    return <NeutralIcon id={iconId} />;
                                                }
                                            })()}
                                            {isReadOnly ? (
                                                // Read-only mode: display value as text
                                                <div style={{
                                                    width: '100%',
                                                    padding: '5px 0',
                                                    color: cellStyle.color || TABLE_CELL_TEXT,
                                                    fontSize: cellStyle.fontSize,
                                                    fontWeight: cellStyle.fontWeight,
                                                    textAlign: (cellStyle.textAlign || globalAlignment) as 'left' | 'center' | 'right',
                                                }}>
                                                    {(() => {
                                                        // Column 2 (index 1, col-1) should be empty - only show badge SVG
                                                        const columnId = columns[colIdx]?.id || '';
                                                        const isColumn2 = isLegacyCurrencyFundamentalTable && (colIdx === 1 || columnId === 'col-1');
                                                        if (isColumn2) {
                                                            return '';
                                                        }
                                                        // If cell has formula, show calculated result
                                                        if (cellData.formula) {
                                                            return displayValue;
                                                        }
                                                        return displayValue;
                                                    })()}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={(() => {
                                                        // Column 2 (index 1, col-1) should be empty - only show badge SVG
                                                        // Only restrict for currency fundamentals tables
                                                        const columnId = columns[colIdx]?.id || '';
                                                        const isColumn2 = isLegacyCurrencyFundamentalTable && (colIdx === 1 || columnId === 'col-1');
                                                        if (isColumn2) {
                                                            return '';
                                                        }

                                                        // If focused on this cell, show formula/raw value for editing
                                                        if (isSelected || (isEditingFormula && selectedCell?.rowIndex === rowIdx && selectedCell?.colIndex === colIdx)) {
                                                            return cellData.formula || cellData.value || '';
                                                        }

                                                        // If cell has formula, show calculated result
                                                        if (cellData.formula) {
                                                            return displayValue;
                                                        }
                                                        return displayValue;
                                                    })()}
                                                    onChange={(e) => {
                                                        // Column 2 (index 1, col-1) should not allow text input - only show badge SVG
                                                        // Only restrict for currency fundamentals tables
                                                        const columnId = columns[colIdx]?.id || '';
                                                        const isColumn2 = isLegacyCurrencyFundamentalTable && (colIdx === 1 || columnId === 'col-1');
                                                        if (isColumn2) {
                                                            return; // Prevent any changes to column 2
                                                        }

                                                        const value = e.target.value;
                                                        // Update local state immediately, but don't call backend yet
                                                        handleInstantCellUpdate(rowIdx, colIdx, value);

                                                        // If user starts typing =, focus formula bar (only for admin view)
                                                        if (!isUserView && value.startsWith('=') && formulaBarInputRef.current) {
                                                            setIsEditingFormula(true);
                                                            setTimeout(() => {
                                                                formulaBarInputRef.current?.focus();
                                                                formulaBarInputRef.current?.setSelectionRange(value.length, value.length);
                                                            }, 10);
                                                        }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onFocus={() => {
                                                        handleCellClick(rowIdx, colIdx);
                                                    }}
                                                    onBlur={(e) => {
                                                        // Only sync with backend if the value actually changed
                                                        const value = e.target.value;
                                                        const originalValue = cellData.formula || cellData.value || '';
                                                        if (value !== originalValue) {
                                                            handleCellChange(rowIdx, colIdx, value);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        // If user presses =, focus formula bar (only for admin view)
                                                        if (!isUserView && e.key === '=' && !isEditingFormula) {
                                                            e.preventDefault();
                                                            setIsEditingFormula(true);
                                                            setFormulaBarValue('=');
                                                            handleInstantCellUpdate(rowIdx, colIdx, '=');
                                                            setTimeout(() => {
                                                                formulaBarInputRef.current?.focus();
                                                                formulaBarInputRef.current?.setSelectionRange(1, 1);
                                                            }, 10);
                                                        }
                                                        // Enter key to confirm and move down
                                                        else if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            setIsEditingFormula(false);

                                                            // Sync with backend on Enter
                                                            const value = (e.target as HTMLInputElement).value;
                                                            handleCellChange(rowIdx, colIdx, value);

                                                            if (rowIdx < rows.length - 1) {
                                                                handleCellClick(rowIdx + 1, colIdx);
                                                            }
                                                        }
                                                        // Tab to move right
                                                        else if (e.key === 'Tab') {
                                                            e.preventDefault();
                                                            setIsEditingFormula(false);

                                                            // Sync with backend on Tab
                                                            const value = (e.target as HTMLInputElement).value;
                                                            handleCellChange(rowIdx, colIdx, value);

                                                            if (e.shiftKey) {
                                                                // Shift+Tab: move left
                                                                if (colIdx > 0) {
                                                                    handleCellClick(rowIdx, colIdx - 1);
                                                                }
                                                            } else {
                                                                // Tab: move right
                                                                if (colIdx < columns.length - 1) {
                                                                    handleCellClick(rowIdx, colIdx + 1);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    className={styles.cellInput}
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        width: '100%',
                                                        flex: 1,
                                                        minWidth: 0,
                                                        color: cellStyle.color || TABLE_CELL_TEXT,
                                                        fontSize: cellStyle.fontSize,
                                                        fontWeight: cellStyle.fontWeight,
                                                        textAlign: (cellStyle.textAlign || globalAlignment) as 'left' | 'center' | 'right',
                                                        paddingLeft: cellData.formula ? '15px' : '0',
                                                        // Hide input for column 2 - only show badge SVG
                                                        // Only restrict for currency fundamentals tables
                                                        ...(() => {
                                                            const columnId = columns[colIdx]?.id || '';
                                                            const isColumn2 = isLegacyCurrencyFundamentalTable && (colIdx === 1 || columnId === 'col-1');
                                                            return isColumn2 ? { display: 'none' } : {};
                                                        })(),
                                                    }}
                                                    onDoubleClick={(e) => {
                                                        if (!isUserView) {
                                                            e.stopPropagation();
                                                            setHoveredCell({ rowIndex: rowIdx, colIndex: colIdx });
                                                            setActiveTab('background');
                                                        }
                                                    }}
                                                    ref={isSelected ? formulaBarInputRef : null}
                                                />
                                            )}
                                        </div>
                                        {/* Column Resize Handle - on every cell */}
                                        {!isCtrlDown && !isUserView && (
                                            <div
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleResizeStart(colIdx, e);
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: '-2px',
                                                    width: '6px',
                                                    height: '100%',
                                                    cursor: 'col-resize',
                                                    zIndex: 100,
                                                    backgroundColor: resizingColIdx === colIdx ? '#2563eb' : 'transparent',
                                                    transition: 'background-color 0.2s',
                                                    userSelect: 'none',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (resizingColIdx === null) {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#cbd5e1';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (resizingColIdx !== colIdx) {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                                title="Drag to resize column width"
                                            />
                                        )}
                                    </Td>
                                );
                            })}
                            {/* Add Row Icon - Show column on every row if enabled, but icon only on last row */}
                            {showAddRowIcon && !isReadOnly && (
                                <Td
                                    onClick={(e) => {
                                        if (rowIdx === rows.length - 1) {
                                            e.stopPropagation();
                                            handleAddRow(rowIdx);
                                        }
                                    }}
                                    className={rowIdx === rows.length - 1 ? styles.addRowTd : ''}
                                    style={{
                                        width: '50px',
                                        padding: '12px 8px',
                                        cursor: rowIdx === rows.length - 1 ? 'pointer' : 'default',
                                        textAlign: 'center',
                                        borderColor: borderColor,
                                        backgroundColor: rowIdx === rows.length - 1 ? '#f0f9ff' : 'transparent',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (rowIdx === rows.length - 1) {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = '#dbeafe';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (rowIdx === rows.length - 1) {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f9ff';
                                        }
                                    }}
                                    title={rowIdx === rows.length - 1 ? "Add row below" : ""}
                                >
                                    {rowIdx === rows.length - 1 ? '+' : ''}
                                </Td>
                            )}
                            {/* Delete Row Button - Only show when not read-only */}
                            {!isReadOnly && (
                                <Td
                                    key={`delete-row-${rowIdx}`}
                                    style={{
                                        position: 'relative',
                                        padding: '5px',
                                        width: '50px',
                                        minWidth: '50px',
                                        textAlign: 'center',
                                        verticalAlign: 'middle',
                                        borderColor: borderColor
                                    }}
                                    borderColor={borderColor}
                                >
                                    {/* For user view: show delete button for all rows EXCEPT the last one */}
                                    {/* For admin view: show delete button for all rows except admin-created ones (rowIdx >= initialRowCount) */}
                                    {isUserView ? (
                                        // User view: show delete button on all rows except the last one
                                        rowIdx !== rows.length - 1 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRow(rowIdx);
                                                }}
                                                className={styles.crossRemoveBtn}
                                                aria-label="Remove row"
                                                title="Remove row"
                                                style={{
                                                    position: 'relative',
                                                    top: 'auto',
                                                    right: 'auto',
                                                    margin: '0 auto'
                                                }}
                                            >
                                                ×
                                            </button>
                                        )
                                    ) : (
                                        // Admin view: show delete button for user-created rows
                                        rowIdx >= initialRowCount && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRow(rowIdx);
                                                }}
                                                className={styles.crossRemoveBtn}
                                                aria-label="Remove row"
                                                title="Remove row"
                                                style={{
                                                    position: 'relative',
                                                    top: 'auto',
                                                    right: 'auto',
                                                    margin: '0 auto'
                                                }}
                                            >
                                                ×
                                            </button>
                                        )
                                    )}
                                </Td>
                            )}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </div>
    );
};
