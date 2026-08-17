import {
    mapEconomicCalendarEvents,
    mapUpcomingHighImpactEvents,
    type EconomicCalendarEventDTO,
    type EconomicCalendarRow,
    type UpcomingHighImpactRow,
} from "@/lib/calendarNewsCalendarData";
import {
    buildMarketHeatmapTilesFromBoards,
    type GeopoliticalRiskWatch,
    type MarketHeatmapTile,
} from "@/lib/calendarNewsPageData";
import {
    buildCatalystScoreboardRows,
    buildMacroScoreboardRowsFromEconomicCalendar,
    type CatalystBoardDTO,
    type CatalystScoreboardRow,
    type MacroScoreboardRow,
} from "@/lib/calendarNewsScoreboardData";
import { apiConfig } from "@/services/api.config";

type ApiEnvelope<T> = { success?: boolean; data?: T };

export type CalendarNewsLiveBundle = {
    snapshotId: string;
    riskModeScore: number;
    economicCalendarRows: EconomicCalendarRow[];
    upcomingHighImpactRows: UpcomingHighImpactRow[];
    macroScoreboardRows: MacroScoreboardRow[];
    catalystScoreboardRows: CatalystScoreboardRow[] | null;
    heatmapTiles: MarketHeatmapTile[] | null;
    geopoliticalRisk: GeopoliticalRiskWatch | null;
};

/** Client-side refetch of public calendar-news boards (used after `calendarNewsUpdate` socket events). */
export async function fetchCalendarNewsLiveBundle(): Promise<CalendarNewsLiveBundle | null> {
    try {
        const response = await fetch(`${apiConfig.baseURL}/api/v1/public/daily-market-snapshot`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
        if (!response.ok) return null;
        const json = (await response.json()) as ApiEnvelope<{
            snapshotId: string;
            calendar: { data: EconomicCalendarEventDTO[] };
            catalystBoard: CatalystBoardDTO[];
            geopoliticalRisk: GeopoliticalRiskWatch;
            riskMode: { score: number };
        }>;
        if (!json.success || !json.data || !Array.isArray(json.data.calendar?.data)) return null;
        const liveEvents = json.data.calendar.data;
        const catalystBoard = Array.isArray(json.data.catalystBoard) ? json.data.catalystBoard : null;

        const upcoming = mapUpcomingHighImpactEvents(liveEvents);
        const macroScoreboardRows = buildMacroScoreboardRowsFromEconomicCalendar(liveEvents);
        const geopoliticalRisk =
            json.data.geopoliticalRisk && typeof json.data.geopoliticalRisk.score === "number"
                ? json.data.geopoliticalRisk
                : null;

        return {
            snapshotId: json.data.snapshotId,
            riskModeScore: Number(json.data.riskMode?.score ?? 0),
            economicCalendarRows: mapEconomicCalendarEvents(liveEvents),
            upcomingHighImpactRows: upcoming,
            macroScoreboardRows,
            catalystScoreboardRows: catalystBoard
                ? buildCatalystScoreboardRows(catalystBoard)
                : null,
            heatmapTiles:
                catalystBoard != null
                    ? buildMarketHeatmapTilesFromBoards(macroScoreboardRows, catalystBoard)
                    : null,
            geopoliticalRisk,
        };
    } catch {
        return null;
    }
}
