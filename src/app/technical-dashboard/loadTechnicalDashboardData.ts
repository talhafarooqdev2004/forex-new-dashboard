import { serverFetchDynamicTableByIdentifier } from "@/lib/serverAdminApi";

import type { TechnicalDashboardInitialWidgetTables } from "./technicalDashboardTypes";

const SCORE_DASHBOARD_TABLE_ID = "score_dashboard_sheet76";
const EDGE_CURRENCY_STRENGTH_INDEX_ID = "edge_currency_strength_index";
const EDGE_TECHNICAL_DASHBOARD_TABLE_ID = "edge_technical_dashboard";

export async function loadTechnicalDashboardInitialWidgetTables(): Promise<TechnicalDashboardInitialWidgetTables> {
    const [scoreHeatmap, currencyStrength, tmv] = await Promise.all([
        serverFetchDynamicTableByIdentifier(SCORE_DASHBOARD_TABLE_ID),
        serverFetchDynamicTableByIdentifier(EDGE_CURRENCY_STRENGTH_INDEX_ID),
        serverFetchDynamicTableByIdentifier(EDGE_TECHNICAL_DASHBOARD_TABLE_ID),
    ]);

    return {
        scoreHeatmap,
        currencyStrength,
        tmv,
    };
}
