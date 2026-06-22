"use client";

import { cn } from "@/lib/utils";
import { useTradingTerminalData } from "@/hooks/useTradingTerminalData";
import TradingTerminalMonthlyGrowth from "./TradingTerminalMonthlyGrowth";
import TradingTerminalUpcomingEvents from "./TradingTerminalUpcomingEvents";
import TradingTerminalYearlyPerformancePips from "./TradingTerminalYearlyPerformancePips";

const PANEL_HEIGHT = "h-[340px]";

export default function TradingTerminalInsightsSection({ refreshKey = 0 }: { refreshKey?: number }) {
    const { trades, partials } = useTradingTerminalData(refreshKey);

    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch", PANEL_HEIGHT)}>
            <div className={cn("min-w-0", PANEL_HEIGHT)}>
                <TradingTerminalMonthlyGrowth trades={trades} partials={partials} />
            </div>

            <div className={cn("min-w-0", PANEL_HEIGHT)}>
                <TradingTerminalYearlyPerformancePips trades={trades} partials={partials} />
            </div>

            <div className={cn("min-w-0", PANEL_HEIGHT)}>
                <TradingTerminalUpcomingEvents />
            </div>
        </div>
    );
}
