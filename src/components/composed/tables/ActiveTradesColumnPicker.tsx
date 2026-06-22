"use client";

import { useEffect, useRef, useState } from "react";
import { Columns3 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    ACTIVE_TRADE_COLUMNS,
    type ActiveTradeColumnId,
    type ActiveTradesColumnVisibility,
} from "@/lib/activeTradesColumns";

const headerButtonClass =
    "inline-flex items-center justify-center rounded-[8px] border border-stroke bg-stroke/10 text-foreground hover:bg-stroke/20";

export default function ActiveTradesColumnPicker({
    visibility,
    onChange,
}: {
    visibility: ActiveTradesColumnVisibility;
    onChange: (next: ActiveTradesColumnVisibility) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    const toggle = (id: ActiveTradeColumnId) => {
        onChange({ ...visibility, [id]: !visibility[id] });
    };

    const visibleCount = ACTIVE_TRADE_COLUMNS.filter((c) => visibility[c.id]).length;

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn(headerButtonClass, "gap-1.5 px-2.5 py-1.5 text-xs font-semibold")}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="Choose visible columns"
            >
                <Columns3 className="w-4 h-4" />
                Columns
            </button>
            {open ? (
                <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-[8px] border border-stroke bg-darkGrey py-2 shadow-lg">
                    <p className="px-3 pb-2 text-[11px] font-semibold text-secondary">Show columns</p>
                    <ul className="max-h-64 overflow-y-auto">
                        {ACTIVE_TRADE_COLUMNS.map((col) => (
                            <li key={col.id}>
                                <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-stroke/20">
                                    <input
                                        type="checkbox"
                                        className="h-3.5 w-3.5 rounded border-stroke accent-[#05df72]"
                                        checked={visibility[col.id]}
                                        onChange={() => toggle(col.id)}
                                        disabled={visibleCount <= 1 && visibility[col.id]}
                                    />
                                    <span>{col.label}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
