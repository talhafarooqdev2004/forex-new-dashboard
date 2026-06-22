"use client";

import { useMemo } from "react";
import type { TradingAlert, TradePartialClose } from "@/services";
import { formatPips, yearlyTotals } from "@/lib/tradingTerminalStats";

const GREEN = "#05df72";
const RED = "#fa003f";
const AXIS_TEXT = "rgb(var(--foreground))";
const GRID_LINE = "rgb(var(--stroke))";

const VIEW_W = 470;
const VIEW_H = 192;
const PLOT_LEFT = 66;
const PLOT_RIGHT = VIEW_W - 10;
const PLOT_TOP = 16;
const PLOT_BOTTOM = VIEW_H - 28;
const PLOT_W = PLOT_RIGHT - PLOT_LEFT;
const PLOT_H = PLOT_BOTTOM - PLOT_TOP;
const BAR_W = 22;
const YEARLY_SCALE = { min: -6000, max: 6000, ticks: [6000, 3000, 0, -3000, -6000] };

export default function TradingTerminalYearlyPerformancePips({
    trades,
    partials = [],
}: {
    trades: TradingAlert[];
    partials?: TradePartialClose[];
}) {
    const data = useMemo(() => yearlyTotals(trades, partials), [trades, partials]);
    const values = data.map((d) => d.pips);
    const scale = YEARLY_SCALE;
    const scaleY = (v: number) => PLOT_BOTTOM - ((v - scale.min) / (scale.max - scale.min || 1)) * PLOT_H;
    const zeroY = scaleY(0);

    const slots = Math.max(data.length, 1);
    const barCenter = (index: number) => {
        const span = PLOT_W / slots;
        return PLOT_LEFT + span * index + span / 2;
    };

    const total = values.reduce((s, v) => s + v, 0);
    const best = data.length ? data.reduce((a, b) => (b.pips > a.pips ? b : a)) : null;
    const worst = data.length ? data.reduce((a, b) => (b.pips < a.pips ? b : a)) : null;
    const avg = data.length ? total / data.length : null;

    const footer = [
        { label: "Total (All Years)", value: data.length ? formatPips(total, 0) : "—", color: total >= 0 ? GREEN : RED },
        {
            label: "Best Year",
            value: best ? `${best.year} (${formatPips(best.pips, 0)})` : "—",
            color: GREEN,
        },
        {
            label: "Worst",
            value: worst && worst.pips < 0 ? `${worst.year} (${formatPips(worst.pips, 0)})` : "—",
            color: RED,
        },
        { label: "Avg. Per Year", value: avg !== null ? formatPips(avg, 0) : "—", color: (avg ?? 0) >= 0 ? GREEN : RED },
    ];

    return (
        <div className="bg-darkGrey rounded-[12px] h-full flex flex-col min-w-0 overflow-hidden">
            <div className="px-4 pt-4 pb-1 flex items-center justify-between gap-2 shrink-0">
                <h6 className="font-semibold text-sm leading-tight text-foreground whitespace-nowrap">Yearly Performance Pips</h6>
            </div>

            <div className="flex-1 min-h-0 px-4 pt-0 pb-1">
                {data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-secondary">No closed trades yet.</div>
                ) : (
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

                        {data.map((d, index) => (
                            <text key={`label-${d.year}`} x={barCenter(index)} y={VIEW_H - 4} fill={AXIS_TEXT} fontSize="11" textAnchor="middle">
                                {d.year}
                            </text>
                        ))}

                        {data.map((d, index) => {
                            const cx = barCenter(index);
                            const x = cx - BAR_W / 2;
                            const y1 = scaleY(d.pips);
                            const top = Math.min(zeroY, y1);
                            const height = Math.abs(y1 - zeroY);
                            const positive = d.pips >= 0;
                            return (
                                <g key={d.year}>
                                    <rect x={x} y={top} width={BAR_W} height={height} fill={positive ? GREEN : RED} />
                                    <text
                                        x={cx}
                                        y={positive ? top - 8 : top + height + 14}
                                        fill={positive ? GREEN : RED}
                                        fontSize="11"
                                        textAnchor="middle"
                                        fontWeight="600"
                                    >
                                        {formatPips(d.pips, 0)}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                )}
            </div>

            <div className="grid grid-cols-4 shrink-0 px-4 pb-5">
                {footer.map((stat, index) => (
                    <div key={stat.label} className={`px-2 text-center ${index > 0 ? "border-l border-stroke" : ""}`}>
                        <p className="text-[13px] text-foreground leading-tight mb-2">{stat.label}</p>
                        <p className="text-[13px] font-semibold leading-tight" style={{ color: stat.color }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
