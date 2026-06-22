"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { activeTdClass } from "./tradingTerminalTableShared";

function liveValueChanged(prev: number | null | undefined, next: number | null): boolean {
    if (prev === undefined) return false;
    if (prev === null && next === null) return false;
    if (prev === null || next === null) return true;
    return prev !== next;
}

/** Table cell that briefly highlights when its tracked numeric value changes. */
export function LiveFlashTd({
    value,
    className = "",
    style,
    children,
}: {
    value: number | null;
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
}) {
    const prevRef = useRef<number | null | undefined>(undefined);
    const [flash, setFlash] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (liveValueChanged(prevRef.current, value)) {
            if (timerRef.current) clearTimeout(timerRef.current);
            setFlash(true);
            timerRef.current = setTimeout(() => setFlash(false), 750);
        }
        prevRef.current = value;
    }, [value]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <td className={cn(activeTdClass(className), flash && "live-value-flash")} style={style}>
            {children}
        </td>
    );
}
