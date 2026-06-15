"use client";

import { useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { TradingAlert } from "@/services";
import { availableMonths, calendarTotals } from "@/lib/tradingTerminalStats";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Shared trade green/red used across the whole trading-terminal page.
const GREEN = "#05df72";
const RED = "#fa003f";

type DayCell = { day: number; pnl?: number } | null;

function isNoDataCell(pnl?: number): boolean {
    return pnl === undefined || pnl === 0;
}

function tradeCellStyle(pnl: number): { backgroundColor: string; color: string; borderColor: string } {
    if (pnl > 0) return { backgroundColor: GREEN, color: "#ffffff", borderColor: GREEN };
    return { backgroundColor: RED, color: "#ffffff", borderColor: RED };
}

function formatCellLabel(day: number, pnl?: number): string {
    if (pnl === undefined || pnl === 0) return String(day);
    return `${day} (${pnl > 0 ? "+" : ""}${Math.round(pnl)})`;
}

/** Mon-first weekday index for a date. */
function monFirst(weekday: number): number {
    return (weekday + 6) % 7;
}

export default function TradingTerminalDailyPnlHeatmap({ trades }: { trades: TradingAlert[] }) {
    const months = useMemo(() => availableMonths(trades), [trades]);
    const now = new Date();
    const options = months.length > 0 ? months : [{ year: now.getFullYear(), month: now.getMonth() }];
    const [selected, setSelected] = useState<string>(`${options[0].year}-${options[0].month}`);

    // Trades load async, so the initial `selected` (current month) may not exist once real
    // months arrive. Fall back to the most recent available month to avoid an empty calendar.
    const selectedKey = options.some((o) => `${o.year}-${o.month}` === selected)
        ? selected
        : `${options[0].year}-${options[0].month}`;

    const [year, month] = selectedKey.split("-").map(Number);
    const totals = useMemo(() => calendarTotals(trades, year, month), [trades, year, month]);

    const grid = useMemo<DayCell[]>(() => {
        const firstOffset = monFirst(new Date(year, month, 1).getDay());
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: DayCell[] = [];
        for (let i = 0; i < firstOffset; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, pnl: totals.get(d) });
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [year, month, totals]);

    return (
        <div className="bg-darkGrey rounded-[12px] h-full flex flex-col min-w-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-solid border-stroke flex items-center justify-between gap-2 shrink-0 min-h-[52px]">
                <h6 className="font-semibold text-sm leading-tight whitespace-nowrap min-w-0 truncate">
                    Daily PnL Heatmap (Pips)
                </h6>
                <Select value={selectedKey} onValueChange={setSelected}>
                    <SelectTrigger className="w-[92px] h-7 text-[10px] px-2 shrink-0 [&>span]:truncate">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((o) => (
                            <SelectItem key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
                                {MONTH_NAMES[o.month]} {o.year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="px-3 py-3 flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="grid grid-cols-7 gap-1 mb-1.5 shrink-0">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="text-center text-[10px] text-secondary py-0.5">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 auto-rows-fr">
                    {grid.map((cell, index) => {
                        if (!cell) return <div key={`empty-${index}`} />;
                        const noData = isNoDataCell(cell.pnl);
                        return (
                            <div
                                key={`${cell.day}-${index}`}
                                className={cn(
                                    "rounded-[4px] min-h-[28px] flex items-center justify-center text-[9px] font-medium px-0.5 text-center leading-tight border",
                                    noData &&
                                        "bg-chartInnerBg border-stroke text-foreground dark:bg-[#2A2E37] dark:border-[#2A2E37] dark:text-white",
                                )}
                                style={noData ? undefined : tradeCellStyle(cell.pnl!)}
                            >
                                {formatCellLabel(cell.day, cell.pnl)}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-4 mt-2 pt-1 shrink-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-secondary whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: GREEN }} />
                        Profit
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-secondary whitespace-nowrap">
                        <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 bg-chartInnerBg border border-stroke dark:bg-[#2A2E37] dark:border-[#2A2E37]"
                        />
                        No Data
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-secondary whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: RED }} />
                        Loss
                    </div>
                </div>
            </div>
        </div>
    );
}
