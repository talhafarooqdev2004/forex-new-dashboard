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
        const [calRes, catRes, geoRes] = await Promise.all([
            fetch(`${apiConfig.baseURL}/api/v1/public/economic-calendar`, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            }),
            fetch(`${apiConfig.baseURL}/api/v1/public/market-catalyst`, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            }),
            fetch(`${apiConfig.baseURL}/api/v1/public/geopolitical-risk`, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            }),
        ]);

        if (!calRes.ok) return null;

        const calJson = (await calRes.json()) as ApiEnvelope<EconomicCalendarEventDTO[]>;
        const catJson = catRes.ok
            ? ((await catRes.json()) as ApiEnvelope<CatalystBoardDTO[]>)
            : null;
        const geoJson = geoRes.ok
            ? ((await geoRes.json()) as ApiEnvelope<GeopoliticalRiskWatch>)
            : null;

        const liveEvents = Array.isArray(calJson.data) ? calJson.data : [];
        const catalystBoard = Array.isArray(catJson?.data) ? catJson!.data : null;

        const upcoming = mapUpcomingHighImpactEvents(liveEvents);
        const macroScoreboardRows = buildMacroScoreboardRowsFromEconomicCalendar(liveEvents);
        const geopoliticalRisk =
            geoJson?.success && geoJson.data && typeof geoJson.data.score === "number" ? geoJson.data : null;

        return {
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
