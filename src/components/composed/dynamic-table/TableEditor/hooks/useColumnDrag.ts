import { useState, useRef, useEffect, useCallback } from 'react';
import { TableRow, TableColumn } from '../types';

export function useColumnDrag(
    columns: TableColumn[],
    setColumns: React.Dispatch<React.SetStateAction<TableColumn[]>>,
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>,
    setCellStyles: React.Dispatch<React.SetStateAction<any>>
) {
    const [isCtrlDown, setIsCtrlDown] = useState(false);
    const [swapColIdx, setSwapColIdx] = useState<number | null>(null);
    const [draggedColIdx, setDraggedColIdx] = useState<number | null>(null);
    const [dragOverColIdx, setDragOverColIdx] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [swapDirection, setSwapDirection] = useState<'left' | 'right' | null>(null);
    const dragStartPosRef = useRef<{ x: number; colIdx: number } | null>(null);

    const swapColumns = useCallback((idxA: number, idxB: number) => {
        if (idxA === idxB) return;
        setColumns(prev => {
            const newCols = [...prev];
            [newCols[idxA], newCols[idxB]] = [newCols[idxB], newCols[idxA]];
            return newCols;
        });
        setRows(prev => prev.map(row => {
            const newCells = [...row.cells];
            [newCells[idxA], newCells[idxB]] = [newCells[idxB], newCells[idxA]];
            return { ...row, cells: newCells };
        }));
        setCellStyles((prev: any) => {
            const newStyles = { ...prev };
            // Swap header styles
            const keyA = `header-${idxA}`;
            const keyB = `header-${idxB}`;
            const styleA = prev[keyA];
            const styleB = prev[keyB];
            if (styleA) newStyles[keyB] = styleA; else delete newStyles[keyB];
            if (styleB) newStyles[keyA] = styleB; else delete newStyles[keyA];
            
            // Swap cell styles for all rows
            // Note: In original code, the styles are stored by index. 
            // Swapping column indices means we need to swap all ${rowIdx}-${idxA} with ${rowIdx}-${idxB}
            // This is complex and might be better handled by unique cell IDs if we had them.
            // But for now we stick to the original behavior which actually didn't swap cell styles explicitly
            // except through row.cells mapping.
            return newStyles;
        });
    }, [setColumns, setRows, setCellStyles]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Control' || e.ctrlKey || e.metaKey) setIsCtrlDown(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Control' || (!e.ctrlKey && !e.metaKey)) {
                setIsCtrlDown(false);
                setSwapColIdx(null);
                setIsDragging(false);
                setDraggedColIdx(null);
                setDragOverColIdx(null);
                setSwapDirection(null);
                dragStartPosRef.current = null;
            }
        };
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && dragStartPosRef.current !== null && isCtrlDown) {
                const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
                if (elementBelow) {
                    const thElement = elementBelow.closest('th[data-col-index]') as HTMLElement;
                    if (thElement) {
                        const idx = parseInt(thElement.getAttribute('data-col-index') || '-1');
                        if (idx >= 0 && idx !== dragStartPosRef.current.colIdx) {
                            setDragOverColIdx(idx);
                            setSwapDirection(idx > dragStartPosRef.current.colIdx ? 'right' : 'left');
                            return;
                        }
                    }
                }
                setDragOverColIdx(null);
                setSwapDirection(null);
            }
        };
        const handleMouseUp = () => {
            if (isDragging && dragStartPosRef.current !== null) {
                if (isCtrlDown && dragOverColIdx !== null) {
                    swapColumns(dragStartPosRef.current.colIdx, dragOverColIdx);
                }
                setIsDragging(false);
                setDraggedColIdx(null);
                setDragOverColIdx(null);
                setSwapDirection(null);
                dragStartPosRef.current = null;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isCtrlDown, dragOverColIdx, swapColumns]);

    return {
        isCtrlDown,
        swapColIdx, setSwapColIdx,
        draggedColIdx, setDraggedColIdx,
        dragOverColIdx, setDragOverColIdx,
        isDragging, setIsDragging,
        swapDirection, setSwapDirection,
        dragStartPosRef,
        swapColumns
    };
}
