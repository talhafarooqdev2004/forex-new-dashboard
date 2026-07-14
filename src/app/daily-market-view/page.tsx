import CalendarNewsClientPage from "@/components/features/pages/CalendarNewsClientPage";
import {
    mapEconomicCalendarEvents,
    mapUpcomingHighImpactEvents,
} from "@/lib/calendarNewsCalendarData";
import {
    buildCatalystScoreboardRows,
    buildMacroScoreboardRowsFromEconomicCalendar,
} from "@/lib/calendarNewsScoreboardData";
import {
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
    "Daily Market View",
    "Geopolitical risk watch, risk mode, and currency heatmap at a glance for forex positioning.",
    "/daily-market-view",
);

/** Same sheet cell as Edge Tools / Fundamental Dashboard Risk Mode gauge. */
const RISK_MODE_SCORE_SHEET_ID = "RISK ON/OFF 12";
const RISK_MODE_SCORE_CELL = "B13";

export default async function DailyMarketViewPage() {
    const [liveEvents, catalystBoard, riskRaw, geopoliticalRiskLive] = await Promise.all([
        serverFetchEconomicCalendar(),
        serverFetchMarketCatalyst(),
        serverFetchGoogleSheetCell(RISK_MODE_SCORE_SHEET_ID, RISK_MODE_SCORE_CELL),
        serverFetchGeopoliticalRisk(),
    ]);
    const hasLiveCalendar = Boolean(liveEvents?.length);

    const economicCalendarRows = hasLiveCalendar
        ? mapEconomicCalendarEvents(liveEvents!)
        : [];

    const upcomingHighImpactRows = hasLiveCalendar
        ? mapUpcomingHighImpactEvents(liveEvents!)
        : [];

    const macroScoreboardRows = hasLiveCalendar
        ? buildMacroScoreboardRowsFromEconomicCalendar(liveEvents!)
        : [];

    // Never inject fake catalyst/heatmap values when an API is unavailable.
    const catalystScoreboardRows = buildCatalystScoreboardRows(catalystBoard ?? []);
    const heatmapTiles = buildMarketHeatmapTilesFromBoards(macroScoreboardRows, catalystBoard ?? []);

    const riskMode = buildRiskModeDisplayFromScore(parseRiskModeSheetValueSigned(riskRaw));
    const geopoliticalRisk = geopoliticalRiskLive ?? {
        score: 0,
        band: "Low Risk" as const,
        explanation: "No live geopolitical headlines are currently available.",
        eventCount: 0,
    };

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
