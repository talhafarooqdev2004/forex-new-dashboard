"use client";

import PipsGrowthChart from "@/components/composed/Charts/PipsGrowthChart";
import { cn } from "@/lib/utils";
import { useTradingTerminalData } from "@/hooks/useTradingTerminalData";
import TradingTerminalDailyPnlHeatmap from "./TradingTerminalDailyPnlHeatmap";
import TradingTerminalStatisticsPanel from "./TradingTerminalStatisticsPanel";
import TradingTerminalSummaryCards from "./TradingTerminalSummaryCards";

const PANEL_HEIGHT = "h-[360px]";

export default function TradingTerminalPerformanceSection({ refreshKey = 0 }: { refreshKey?: number }) {
    const { trades } = useTradingTerminalData(refreshKey);

    return (
        <div className="flex flex-col gap-4">
            <TradingTerminalSummaryCards trades={trades} />

            <div className={cn("grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch", PANEL_HEIGHT)}>
                <div className={cn("xl:col-span-5 min-w-0", PANEL_HEIGHT)}>
                    <PipsGrowthChart trades={trades} />
                </div>

                <div className={cn("xl:col-span-4 min-w-0", PANEL_HEIGHT)}>
                    <TradingTerminalDailyPnlHeatmap trades={trades} />
                </div>

                <div className={cn("xl:col-span-3 min-w-0", PANEL_HEIGHT)}>
                    <TradingTerminalStatisticsPanel trades={trades} />
                </div>
            </div>
        </div>
    );
}
