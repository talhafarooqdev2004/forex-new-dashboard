"use client";

import styles from "./PipsGrowthChart.module.scss";
import { cn } from "@/lib/utils";
import type { TradingAlert, TradePartialClose } from "@/services";
import { equitySeries, equityStats, formatPips, niceScale } from "@/lib/tradingTerminalStats";

const GREEN = "#05df72";
const RED = "#fa003f";
const AXIS_TEXT = "rgb(var(--foreground))";
const GRID_LINE = "rgb(var(--stroke))";
const ZERO_LINE = "rgba(var(--secondary), 0.55)";

const VIEW_W = 500;
const VIEW_H = 210;
const PLOT_LEFT = 44;
const PLOT_RIGHT = VIEW_W - 18;
const PLOT_TOP = 8;
const PLOT_BOTTOM = VIEW_H - 22;
const PLOT_W = PLOT_RIGHT - PLOT_LEFT;
const PLOT_H = PLOT_BOTTOM - PLOT_TOP;

function buildSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return pts.length === 1 ? `M ${pts[0]!.x} ${pts[0]!.y}` : "";
    let path = `M ${pts[0]!.x} ${pts[0]!.y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(i - 1, 0)]!;
        const p1 = pts[i]!;
        const p2 = pts[i + 1]!;
        const p3 = pts[Math.min(i + 2, pts.length - 1)]!;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
}

function shortDate(iso: string): string {
    const [, m, d] = iso.split("-");
    return `${m}/${d}`;
}

export default function PipsGrowthChart({
    trades,
    partials = [],
}: {
    trades: TradingAlert[];
    partials?: TradePartialClose[];
}) {
    const series = equitySeries(trades, partials);
    const stats = equityStats(trades, partials);

    const cumulatives = series.map((p) => p.cumulative);
    const scale = niceScale(Math.min(0, ...cumulatives), Math.max(0, ...cumulatives), 4);
    const xMax = Math.max(series.length - 1, 1);

    const scaleX = (i: number) => PLOT_LEFT + (i / xMax) * PLOT_W;
    const scaleY = (v: number) => PLOT_BOTTOM - ((v - scale.min) / (scale.max - scale.min || 1)) * PLOT_H;

    const pts = series.map((p, i) => ({ x: scaleX(i), y: scaleY(p.cumulative) }));
    const linePath = buildSmoothPath(pts);
    const lineColor = (cumulatives[cumulatives.length - 1] ?? 0) >= 0 ? GREEN : RED;

    // X labels: first, last and a couple in between.
    const xLabelIdx = series.length <= 6
        ? series.map((_, i) => i)
        : [0, Math.round(xMax / 3), Math.round((2 * xMax) / 3), xMax];

    const footer: { label: string; value: string; color?: string }[] = [
        { label: "Best Day", value: stats.bestDay !== null ? formatPips(stats.bestDay) : "—", color: GREEN },
        { label: "Worst", value: stats.worstDay !== null ? formatPips(stats.worstDay) : "—", color: RED },
        { label: "Avg Daily", value: stats.avgDaily !== null ? formatPips(stats.avgDaily) : "—" },
        { label: "Expectancy", value: stats.expectancy !== null ? formatPips(stats.expectancy) : "—" },
    ];

    return (
        <div className="bg-darkGrey rounded-[12px] w-full h-full min-w-0 overflow-hidden flex flex-col">
            <div className="px-5 pt-4 pb-3 border-b border-solid border-stroke shrink-0 min-h-[52px] flex items-center">
                <h6 className="font-semibold text-foreground text-sm">Pips Growth — Equity Curve</h6>
            </div>

            <div className={cn(styles.chartBody, "flex-1 min-h-0")}>
                <div className={styles.chartPlot}>
                    {series.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-xs text-secondary">No closed trades yet.</div>
                    ) : (
                        <svg
                            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                            className={styles.chartSvg}
                            preserveAspectRatio="xMidYMid meet"
                            role="img"
                            aria-label="Cumulative pips equity curve"
                        >
                            {scale.ticks.map((tick) => {
                                const y = scaleY(tick);
                                return (
                                    <g key={tick}>
                                        <text x={PLOT_LEFT - 6} y={y + 4} fill={AXIS_TEXT} fontSize="10" textAnchor="end">
                                            {tick > 0 ? `+${tick}` : tick}
                                        </text>
                                        <line
                                            x1={PLOT_LEFT}
                                            y1={y}
                                            x2={PLOT_RIGHT}
                                            y2={y}
                                            stroke={tick === 0 ? ZERO_LINE : GRID_LINE}
                                            strokeWidth="1"
                                            strokeDasharray={tick === 0 ? undefined : "4 4"}
                                        />
                                    </g>
                                );
                            })}

                            {xLabelIdx.map((i) => (
                                <text key={i} x={scaleX(i)} y={VIEW_H - 4} fill={AXIS_TEXT} fontSize="10" textAnchor="middle">
                                    {series[i] ? shortDate(series[i]!.date) : ""}
                                </text>
                            ))}

                            <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                            {pts.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="3" fill={lineColor} />
                                    {series.length <= 8 ? (
                                        <text x={p.x} y={p.y - 9} fill={AXIS_TEXT} fontSize="9" textAnchor="middle">
                                            {Math.round(series[i]!.cumulative)}
                                        </text>
                                    ) : null}
                                </g>
                            ))}
                        </svg>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-4 shrink-0 border-t border-stroke">
                {footer.map((stat, index) => (
                    <div key={stat.label} className={cn("px-2 py-2 text-center", index > 0 && "border-l border-stroke")}>
                        <p className="text-[10px] text-secondary leading-tight mb-1">{stat.label}</p>
                        <p className="text-[12px] font-semibold leading-tight" style={{ color: stat.color ?? "rgb(var(--foreground))" }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
