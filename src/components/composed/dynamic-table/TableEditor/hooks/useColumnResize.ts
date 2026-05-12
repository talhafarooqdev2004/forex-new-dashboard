import { useState, useRef, useEffect, useCallback } from 'react';

export function useColumnResize(
    columnWidths: Record<number, number>,
    setColumnWidths: React.Dispatch<React.SetStateAction<Record<number, number>>>
) {
    const [resizingColIdx, setResizingColIdx] = useState<number | null>(null);
    const resizeRef = useRef<{
        colIdx: number;
        startX: number;
        startWidth: number;
        thElements: HTMLElement[];
        tdElements: HTMLElement[];
    } | null>(null);
    const resizeAnimationFrameRef = useRef<number | null>(null);

    const handleResizeStart = useCallback((colIdx: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const cellElement = (e.currentTarget.closest('th') || e.currentTarget.closest('td')) as HTMLElement;
        let currentWidth = columnWidths[colIdx] || cellElement?.getBoundingClientRect().width || 110;

        const table = cellElement.closest('table');
        const thElements: HTMLElement[] = [];
        const tdElements: HTMLElement[] = [];

        if (table) {
            const findColumnElement = (row: HTMLTableRowElement, targetColIdx: number): HTMLElement | null => {
                let currentColIdx = 0;
                for (let i = 0; i < row.children.length; i++) {
                    const cell = row.children[i] as HTMLElement;
                    const colspan = parseInt(cell.getAttribute('colspan') || '1');
                    if (currentColIdx === targetColIdx) return cell;
                    currentColIdx += colspan;
                    if (currentColIdx > targetColIdx) return null;
                }
                return null;
            };

            const thead = table.querySelector('thead');
            if (thead) {
                const headerRow = thead.querySelector('tr');
                if (headerRow) {
                    const th = findColumnElement(headerRow as HTMLTableRowElement, colIdx);
                    if (th) thElements.push(th);
                }
            }

            const tbodyRows = Array.from(table.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
            tbodyRows.forEach(row => {
                const td = findColumnElement(row, colIdx);
                if (td) tdElements.push(td);
            });
        }

        resizeRef.current = {
            colIdx,
            startX: e.clientX,
            startWidth: currentWidth,
            thElements,
            tdElements
        };
        setResizingColIdx(colIdx);
    }, [columnWidths]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (resizeRef.current) {
                e.preventDefault();
                const { colIdx, startX, startWidth, thElements, tdElements } = resizeRef.current;
                const diff = e.clientX - startX;
                const newWidth = Math.max(110, Math.round(startWidth + diff));

                if (resizeAnimationFrameRef.current !== null) {
                    cancelAnimationFrame(resizeAnimationFrameRef.current);
                }

                resizeAnimationFrameRef.current = requestAnimationFrame(() => {
                    thElements.forEach(th => { th.style.width = `${newWidth}px`; th.style.minWidth = `${newWidth}px`; });
                    tdElements.forEach(td => { td.style.width = `${newWidth}px`; td.style.minWidth = `${newWidth}px`; });
                    setColumnWidths(prev => prev[colIdx] === newWidth ? prev : { ...prev, [colIdx]: newWidth });
                });
            }
        };

        const handleMouseUp = () => {
            if (resizeRef.current) {
                const { colIdx, startX, startWidth } = resizeRef.current;
                // Final sync
                setResizingColIdx(null);
                resizeRef.current = null;
            }
        };

        if (resizingColIdx !== null) {
            document.addEventListener('mousemove', handleMouseMove, true);
            document.addEventListener('mouseup', handleMouseUp, true);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove, true);
                document.removeEventListener('mouseup', handleMouseUp, true);
            };
        }
    }, [resizingColIdx, setColumnWidths]);

    return {
        resizingColIdx,
        handleResizeStart
    };
}
