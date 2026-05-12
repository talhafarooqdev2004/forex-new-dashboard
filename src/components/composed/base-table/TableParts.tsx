"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './BaseTable.module.scss';

export type TableProps = {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    cellPadding?: 'normal' | 'large';
    bordered?: boolean;
    borderSpacing?: boolean;
    smallBorderSpacing?: boolean;
    rounded?: 'default' | 'top';
    enableDragScroll?: boolean;
    scrollSpeedMultiplier?: number;
    ariaLabel?: string;
    /** Extra px tolerance before treating the table as horizontally scrollable (avoids false overflow from sub-pixel layout). */
    horizontalOverflowSlackPx?: number;
    /** When scrollable, use minimal bottom padding instead of the default gap reserved for the scrollbar. */
    tightScrollPadding?: boolean;
};

export function Table({
    children,
    style,
    className,
    cellPadding = 'normal',
    bordered = false,
    borderSpacing = false,
    smallBorderSpacing = false,
    rounded = 'default',
    enableDragScroll = true,
    scrollSpeedMultiplier = 1,
    ariaLabel,
    horizontalOverflowSlackPx = 1,
    tightScrollPadding = false,
}: TableProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

    const updateOverflowState = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        setHasHorizontalOverflow(container.scrollWidth > container.clientWidth + horizontalOverflowSlackPx);
    }, [horizontalOverflowSlackPx]);

    useLayoutEffect(() => {
        updateOverflowState();
    }, [
        updateOverflowState,
        children,
        style,
        className,
        cellPadding,
        bordered,
        borderSpacing,
        smallBorderSpacing,
        rounded,
        horizontalOverflowSlackPx,
    ]);

    useEffect(() => {
        const container = containerRef.current;
        const table = tableRef.current;
        if (!container || !table) return;

        const resizeObserver = new ResizeObserver(() => {
            updateOverflowState();
        });

        resizeObserver.observe(container);
        resizeObserver.observe(table);

        const mutationObserver = new MutationObserver(() => {
            window.requestAnimationFrame(updateOverflowState);
        });

        mutationObserver.observe(table, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        window.addEventListener('resize', updateOverflowState);

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            window.removeEventListener('resize', updateOverflowState);
        };
    }, [updateOverflowState]);

    const getTableClasses = () => [
        rounded === 'top' ? styles['table--rounded-top'] : "",
        cellPadding === 'large' ? styles['table--cellPaddingLarge'] : "",
        bordered ? styles['table--bordered'] : "",
        borderSpacing ? styles['table--border-spacing'] : "",
        smallBorderSpacing ? styles['table--border-small-spacing'] : "",
    ].join(" ");

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;

        isDragging.current = true;
        startX.current = e.pageX - containerRef.current.offsetLeft;
        scrollLeft.current = containerRef.current.scrollLeft;
        containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX.current) * scrollSpeedMultiplier;
        containerRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (containerRef.current) {
            containerRef.current.style.cursor = 'pointer';
        }
    };

    const handleMouseLeave = () => {
        if (isDragging.current) {
            isDragging.current = false;
            if (containerRef.current) {
                containerRef.current.style.cursor = 'pointer';
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.tableContainer} ${hasHorizontalOverflow ? styles['tableContainer--hasOverflow'] : ''} ${hasHorizontalOverflow && tightScrollPadding ? styles['tableContainer--overflowPadTight'] : ''}`}
            {...(enableDragScroll ? {
                onMouseDown: handleMouseDown,
                onMouseMove: handleMouseMove,
                onMouseUp: handleMouseUp,
                onMouseLeave: handleMouseLeave,
            } : {})}
        >
            <table
                ref={tableRef}
                className={`${styles.table} ${getTableClasses()} ${className || ''}`}
                style={{
                    ...style,
                }}
                aria-label={ariaLabel}
            >
                {children}
            </table>
        </div>
    );
}

export type TheadProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    bgColor?: string | null;
    borderColor?: string | null;
};

export function Thead({
    children,
    className,
    style,
    bgColor,
    borderColor: _borderColor,
}: TheadProps) {
    const headStyle: React.CSSProperties & { [key: string]: string | number | undefined } = {
        ...style,
        ...(bgColor ? { backgroundColor: bgColor } : {}),
    };
    return (
        <thead
            className={`${styles.thead} ${className || ''}`}
            style={headStyle}
        >
            {children}
        </thead>
    );
}

export type TbodyProps = { children: React.ReactNode; fullBorders?: boolean; className?: string; style?: React.CSSProperties; };

export function Tbody({
    children,
    fullBorders = false,
    className,
    style,
}: TbodyProps) {
    return (
        <tbody className={`${styles.tbody} ${fullBorders ? styles['tbody-full-borders'] : ''} ${className || ''}`} style={style}>
            {children}
        </tbody>
    );
}

export type TrProps = {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    equalWidth?: boolean;
};

export function Tr({
    children,
    style,
    className,
    equalWidth = false,
}: TrProps) {
    return (
        <tr
            className={`${equalWidth ? styles.equalWidth : ''} ${className || ''}`}
            style={style}
        >
            {children}
        </tr>
    );
}

export type ThProps = {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    color?: React.CSSProperties['color'];
    bgColor?: string;
    borderColor?: string;
    colSpan?: number;
    rowSpan?: number;
    textDecoration?: 'default' | 'underline';
    [key: `data-${string}`]: string | number | undefined;
    onMouseDown?: React.MouseEventHandler<HTMLTableHeaderCellElement>;
    onClick?: React.MouseEventHandler<HTMLTableHeaderCellElement>;
    onDoubleClick?: React.MouseEventHandler<HTMLTableHeaderCellElement>;
};

export function Th({
    children,
    className,
    style,
    color = 'var(--table-cell-text, #ffffff)',
    bgColor = 'var(--table-cell-bg, rgb(var(--dark-grey)))',
    borderColor: _borderColor,
    colSpan = 1,
    rowSpan = 1,
    textDecoration = 'default',
    onMouseDown,
    onClick,
    onDoubleClick,
    ...restProps
}: ThProps) {
    const thStyle: React.CSSProperties & { [key: string]: string | number | undefined } = {
        ...(bgColor ? { backgroundColor: bgColor } : {}),
        ...(color ? { color } : {}),
        ...style,
    };

    // Extract data attributes
    const dataAttributes: Record<string, string | number | undefined> = {};
    Object.keys(restProps).forEach(key => {
        if (key.startsWith('data-')) {
            dataAttributes[key] = restProps[key as keyof typeof restProps];
        }
    });

    return (
        <th
            colSpan={colSpan}
            rowSpan={rowSpan}
            className={`${styles.th} ${textDecoration === 'underline' ? styles['th--underline'] : ''} ${className || ''}`}
            style={thStyle}
            onMouseDown={onMouseDown}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            {...dataAttributes}
        >
            {children}
        </th>
    );
}

export type TdProps = React.HTMLAttributes<HTMLTableCellElement> & {
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    bold?: boolean;
    color?: React.CSSProperties['color'];
    bgColor?: string;
    borderColor?: string;
    colSpan?: number;
    rowSpan?: number;
    fontSize?: 'small' | 'large';
    textDecoration?: 'default' | 'underline';
};

export function Td({
    children,
    style,
    className,
    bold = false,
    rowSpan = 1,
    colSpan = 1,
    fontSize = 'large',
    color = "var(--table-cell-text, #ffffff)",
    bgColor = "var(--table-cell-bg, rgb(var(--dark-grey)))",
    borderColor,
    textDecoration = 'default',
    ...restProps
}: TdProps) {
    const getTdClasses = (): string => [
        bold ? styles['td--bold'] : '',
        textDecoration === 'underline' ? styles['td--underline'] : '',
        fontSize === 'small' ? styles['td--small-text'] : '',
    ].join("");

    return (
        <td
            className={`${styles.td} ${getTdClasses()} ${className || ''}`}
            style={{
                backgroundColor: bgColor,
                color: color,
                ...style,
                ...(borderColor ? { ['--table-cell-border']: borderColor } : {}),
            }}
            colSpan={colSpan}
            rowSpan={rowSpan}
            {...restProps}
        >
            {children}
        </td>
    );
}
