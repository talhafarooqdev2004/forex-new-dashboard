import CalendarNewsClientPage from "@/components/features/pages/CalendarNewsClientPage";
import {
    STATIC_ECONOMIC_CALENDAR_ROWS,
    STATIC_UPCOMING_HIGH_IMPACT_ROWS,
    mapEconomicCalendarEvents,
    mapUpcomingHighImpactEvents,
} from "@/lib/calendarNewsCalendarData";
import {
    STATIC_CATALYST_SCOREBOARD_ROWS,
    STATIC_MACRO_SCOREBOARD_ROWS,
    buildCatalystScoreboardRows,
    buildMacroScoreboardRowsFromEconomicCalendar,
} from "@/lib/calendarNewsScoreboardData";
import {
    STATIC_GEOPOLITICAL_RISK_WATCH,
    STATIC_MARKET_HEATMAP_TILES,
    buildMarketHeatmapTilesFromBoards,
    buildRiskModeDisplayFromScore,
} from "@/lib/calendarNewsPageData";
import { parseRiskModeSheetValueSigned } from "@/lib/fundamentalDashboardData";
import {
    serverFetchEconomicCalendar,
    serverFetchGeopoliticalRisk,
    serverFetchGoogleSheetCell,
    serverFetchMarketCatalyst,
} from "@/lib/serverAdminApi";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Calendar & News",
    "Geopolitical risk watch, risk mode, and currency heatmap at a glance for forex positioning.",
    "/calendar-news",
);

/** Same sheet cell as Edge Tools / Fundamental Dashboard Risk Mode gauge. */
const RISK_MODE_SCORE_SHEET_ID = "RISK ON/OFF 12";
const RISK_MODE_SCORE_CELL = "B13";

export default async function CalendarNewsPage() {
    const [liveEvents, catalystBoard, riskRaw, geopoliticalRiskLive] = await Promise.all([
        serverFetchEconomicCalendar(),
        serverFetchMarketCatalyst(),
        serverFetchGoogleSheetCell(RISK_MODE_SCORE_SHEET_ID, RISK_MODE_SCORE_CELL),
        serverFetchGeopoliticalRisk(),
    ]);
    const hasLive = Boolean(liveEvents?.length);

    const economicCalendarRows = hasLive
        ? mapEconomicCalendarEvents(liveEvents!)
        : STATIC_ECONOMIC_CALENDAR_ROWS;

    const upcomingHighImpactRows = hasLive
        ? mapUpcomingHighImpactEvents(liveEvents!)
        : STATIC_UPCOMING_HIGH_IMPACT_ROWS;

    const macroScoreboardRows = hasLive
        ? buildMacroScoreboardRowsFromEconomicCalendar(liveEvents!)
        : STATIC_MACRO_SCOREBOARD_ROWS;

    const catalystScoreboardRows = catalystBoard
        ? buildCatalystScoreboardRows(catalystBoard)
        : STATIC_CATALYST_SCOREBOARD_ROWS;

    const heatmapTiles =
        catalystBoard && hasLive
            ? buildMarketHeatmapTilesFromBoards(macroScoreboardRows, catalystBoard)
            : STATIC_MARKET_HEATMAP_TILES;

    const riskMode = buildRiskModeDisplayFromScore(parseRiskModeSheetValueSigned(riskRaw));
    const geopoliticalRisk = geopoliticalRiskLive ?? STATIC_GEOPOLITICAL_RISK_WATCH;

    return (
        <CalendarNewsClientPage
            economicCalendarRows={economicCalendarRows}
            upcomingHighImpactRows={upcomingHighImpactRows}
            macroScoreboardRows={macroScoreboardRows}
            catalystScoreboardRows={catalystScoreboardRows}
            heatmapTiles={heatmapTiles}
            initialRiskMode={riskMode}
            initialGeopoliticalRisk={geopoliticalRisk}
        />
    );
}
