"use client";

import type { TradingAlert, TradePartialClose } from "@/services";
import { availableMonths, monthStats } from "@/lib/tradingTerminalStats";
import { cn } from "@/lib/utils";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Shared trade green/red used across the whole trading-terminal page.
const GREEN = "#05df72";
const RED = "#fa003f";

type StatRow = { label: string; value: string; color?: string };

export default function TradingTerminalStatisticsPanel({
    trades,
    partials = [],
}: {
    trades: TradingAlert[];
    partials?: TradePartialClose[];
}) {
    const now = new Date();
    const recent = availableMonths(trades, partials)[0];
    const year = recent?.year ?? now.getFullYear();
    const month = recent?.month ?? now.getMonth();
    const s = monthStats(trades, year, month, partials);

    const pf = Number.isFinite(s.profitFactor) ? s.profitFactor.toFixed(2) : "∞";
    const stats: StatRow[] = [
        { label: "Total Trades", value: String(s.total) },
        { label: "Total Wins", value: String(s.wins), color: GREEN },
        { label: "Total Losses", value: String(s.losses), color: RED },
        { label: "Win Rate", value: `${s.winRate.toFixed(1)}%`, color: "#F54900" },
        { label: "Profit Factor", value: pf, color: GREEN },
        { label: "Average R:R", value: s.avgRR !== null ? `1:${s.avgRR.toFixed(2)}` : "—", color: GREEN },
        {
            label: "Average Pips Win",
            value: s.avgWinPips !== null ? `+${s.avgWinPips.toFixed(1)}` : "—",
            color: GREEN,
        },
        {
            label: "Average Pips Loss",
            value: s.avgLossPips !== null ? s.avgLossPips.toFixed(1) : "—",
            color: RED,
        },
        {
            label: "Expectancy (Pips)",
            value: s.expectancy !== null ? `${s.expectancy >= 0 ? "+" : ""}${s.expectancy.toFixed(1)}` : "—",
            color: (s.expectancy ?? 0) >= 0 ? GREEN : RED,
        },
    ];

    return (
        <div className="bg-darkGrey rounded-[12px] h-full flex flex-col min-w-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-solid border-stroke shrink-0 min-h-[52px] flex items-center">
                <h6 className="font-semibold text-sm text-foreground whitespace-nowrap">
                    Statistics ({MONTH_NAMES[month]} {year})
                </h6>
            </div>

            <div className="px-5 py-2 flex flex-col flex-1 min-h-0 overflow-hidden">
                {stats.map((row, index) => (
                    <div
                        key={row.label}
                        className={cn(
                            "grid grid-cols-[minmax(0,1fr)_minmax(4.5rem,38%)] items-center gap-x-3 flex-1 min-h-0",
                            index < stats.length - 1 && "border-b border-stroke",
                        )}
                    >
                        <span className="text-secondary text-xs leading-tight">{row.label}</span>
                        <span
                            className="text-xs font-medium text-right pr-4 leading-tight"
                            style={row.color ? { color: row.color } : undefined}
                        >
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
