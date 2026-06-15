"use client";

import { cn } from "@/lib/utils";
import type { TradingAlert } from "@/services";
import { activeCount, computeSummary, formatPips, profitFactorLabel } from "@/lib/tradingTerminalStats";

const GREEN = "#05df72";
const CYAN = "#22d3ee";
const RED = "#fa003f";
const TITLE_COLOR = "#9ca3af";
const YELLOW = "#facc15";

/** Jagged upward sparkline — matches design reference */
const SPARKLINE_JAGGED_D =
    "M0 22 L9 18 L18 20 L27 14 L36 16 L45 11 L54 13 L63 8 L72 10 L81 6 L90 4 L99 2";

function SummaryCard({ children, className }: React.PropsWithChildren<{ className?: string }>) {
    return (
        <div
            className={cn(
                "bg-darkGrey rounded-[12px] px-5 py-4 min-h-[118px] flex flex-col gap-3 relative",
                className,
            )}
        >
            {children}
        </div>
    );
}

function CardTitle({ children }: React.PropsWithChildren) {
    return (
        <span className="text-[13px] leading-none" style={{ color: TITLE_COLOR }}>
            {children}
        </span>
    );
}

function Sparkline({ color }: { color: string }) {
    return (
        <svg
            className="w-[100px] h-[32px] shrink-0"
            viewBox="0 0 99 24"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden
        >
            <path d={SPARKLINE_JAGGED_D} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function MiniBarChart({ color }: { color: string }) {
    const bars = [5, 7, 9, 11, 13, 15, 17, 19, 22];

    return (
        <div className="flex items-end gap-[4px] h-[32px] shrink-0" aria-hidden>
            {bars.map((height, index) => (
                <div
                    key={index}
                    className="w-[5px] rounded-[1px]"
                    style={{ height: `${height}px`, backgroundColor: color }}
                />
            ))}
        </div>
    );
}

function WinRateDonut({ percentage }: { percentage: number }) {
    const size = 64;
    const strokeWidth = 7;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgb(var(--stroke))"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={GREEN}
                strokeWidth={strokeWidth}
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function TradingTerminalSummaryCards({ trades }: { trades: TradingAlert[] }) {
    const summary = computeSummary(trades);
    const active = activeCount(trades);
    const netColor = summary.netPips >= 0 ? GREEN : RED;
    const pfText = Number.isFinite(summary.profitFactor) ? summary.profitFactor.toFixed(2) : "∞";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard>
                <CardTitle>Net Pips</CardTitle>
                <div className="flex items-end justify-between gap-3 flex-1">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[26px] font-bold leading-none" style={{ color: netColor }}>
                            {formatPips(summary.netPips)}
                        </span>
                        <span className="text-[12px] leading-none" style={{ color: netColor }}>
                            {summary.total} {summary.total === 1 ? "trade" : "trades"}
                        </span>
                    </div>
                    <Sparkline color={netColor} />
                </div>
            </SummaryCard>

            <SummaryCard>
                <CardTitle>Win Rate</CardTitle>
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-[64px] h-[64px] flex items-center justify-center shrink-0">
                        <WinRateDonut percentage={summary.winRate} />
                        <span className="absolute text-[13px] font-bold text-foreground leading-none">
                            {summary.winRate.toFixed(1)}%
                        </span>
                    </div>
                    <span className="text-[14px] font-medium text-foreground whitespace-nowrap">
                        {summary.wins}W / {summary.losses}L
                    </span>
                </div>
            </SummaryCard>

            <SummaryCard>
                <CardTitle>Profit Factor</CardTitle>
                <div className="flex items-end justify-between gap-3 flex-1">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[26px] font-bold leading-none" style={{ color: CYAN }}>
                            {pfText}
                        </span>
                        <span className="text-[12px] leading-none" style={{ color: CYAN }}>
                            {profitFactorLabel(summary.profitFactor)}
                        </span>
                    </div>
                    <MiniBarChart color={CYAN} />
                </div>
            </SummaryCard>

            <SummaryCard>
                <CardTitle>R:R Average</CardTitle>
                <div className="flex items-end justify-between gap-3 flex-1">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[26px] font-bold leading-none" style={{ color: RED }}>
                            {summary.avgRR !== null ? `1:${summary.avgRR.toFixed(2)}` : "—"}
                        </span>
                        <span className="text-[12px] leading-none" style={{ color: RED }}>
                            Avg Reward:Risk
                        </span>
                    </div>
                    <MiniBarChart color={RED} />
                </div>
            </SummaryCard>

            <SummaryCard>
                <CardTitle>Active Trades</CardTitle>
                <div className="flex items-end justify-between gap-3 flex-1">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[26px] font-bold leading-none" style={{ color: YELLOW }}>
                            {active}
                        </span>
                        <span className="text-[12px] leading-none" style={{ color: YELLOW }}>
                            Running
                        </span>
                    </div>
                    <Sparkline color={YELLOW} />
                </div>
            </SummaryCard>
        </div>
    );
}
