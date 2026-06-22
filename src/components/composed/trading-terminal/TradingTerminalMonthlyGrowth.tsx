"use client";

import { useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import type { TradingAlert, TradePartialClose } from "@/services";
import { availableYears, monthlyTotals } from "@/lib/tradingTerminalStats";

const GREEN = "#05df72";
const RED = "#fa003f";
const AXIS_TEXT = "rgb(var(--foreground))";
const GRID_LINE = "rgb(var(--stroke))";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const VIEW_W = 470;
const VIEW_H = 250;
const PLOT_LEFT = 64;
const PLOT_RIGHT = VIEW_W - 10;
const PLOT_TOP = 18;
const PLOT_BOTTOM = VIEW_H - 38;
const PLOT_W = PLOT_RIGHT - PLOT_LEFT;
const PLOT_H = PLOT_BOTTOM - PLOT_TOP;
const BAR_W = 20;
const SLOT_W = PLOT_W / 12;
const MONTHLY_SCALE = { min: -1000, max: 1000, ticks: [1000, 500, 0, -500, -1000] };

function slotCenter(index: number): number {
    return PLOT_LEFT + index * SLOT_W + SLOT_W / 2;
}

export default function TradingTerminalMonthlyGrowth({
    trades,
    partials = [],
}: {
    trades: TradingAlert[];
    partials?: TradePartialClose[];
}) {
    const years = useMemo(() => availableYears(trades, partials), [trades, partials]);
    const yearOptions = years.length > 0 ? years : [new Date().getFullYear()];
    const [year, setYear] = useState<string>(String(yearOptions[0]));

    // Trades load async, so the initial `year` may not be in the list once real data arrives.
    // Fall back to the most recent year with trades so a year is always selected.
    const activeYear = yearOptions.some((y) => String(y) === year) ? year : String(yearOptions[0]);

    const totals = useMemo(
        () => monthlyTotals(trades, Number(activeYear), partials),
        [trades, activeYear, partials],
    );
    const scale = MONTHLY_SCALE;
    const scaleY = (v: number) => PLOT_BOTTOM - ((v - scale.min) / (scale.max - scale.min || 1)) * PLOT_H;
    const zeroY = scaleY(0);

    return (
        <div className="bg-darkGrey rounded-[12px] h-full flex flex-col min-w-0 overflow-hidden">
            <div className="px-4 pt-4 pb-1 flex items-center justify-between gap-2 shrink-0">
                <h6 className="font-semibold text-sm leading-tight text-foreground whitespace-nowrap">Monthly Growth</h6>
                <Select value={activeYear} onValueChange={setYear}>
                    <SelectTrigger className="w-[92px] h-7 text-[10px] px-2 shrink-0 bg-inputBg border-stroke rounded-[5px] text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {yearOptions.map((y) => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 min-h-0 px-4 pb-5 pt-0">
                <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
                    {scale.ticks.map((tick) => {
                        const y = scaleY(tick);
                        return (
                            <g key={tick}>
                                <text x={PLOT_LEFT - 14} y={y + 6} fill={AXIS_TEXT} fontSize="16" textAnchor="end">
                                    {tick.toLocaleString("en-US")}
                                </text>
                                <line x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} stroke={GRID_LINE} strokeWidth="1.2" />
                            </g>
                        );
                    })}

                    {MONTHS.map((label, index) => (
                        <text key={label} x={slotCenter(index)} y={VIEW_H - 8} fill={AXIS_TEXT} fontSize="11" textAnchor="middle">
                            {label}
                        </text>
                    ))}

                    {totals.map((value, index) => {
                        if (!value) return null;
                        const cx = slotCenter(index);
                        const x = cx - BAR_W / 2;
                        const y1 = scaleY(value);
                        const top = Math.min(zeroY, y1);
                        const height = Math.abs(y1 - zeroY);
                        const positive = value > 0;
                        return (
                            <g key={index}>
                                <rect x={x} y={top} width={BAR_W} height={height} fill={positive ? GREEN : RED} />
                                <text
                                    x={cx}
                                    y={positive ? top - 6 : top + height + 14}
                                    fill={positive ? GREEN : RED}
                                    fontSize="11"
                                    textAnchor="middle"
                                    fontWeight="600"
                                >
                                    {positive ? "+" : ""}{Math.round(value)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
