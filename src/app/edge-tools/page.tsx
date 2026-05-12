import { Suspense } from "react";

import EdgeToolsAlertsClientPage from "@/components/features/pages/EdgeToolsAlertsClientPage";
import EdgeToolsPageSkeleton from "./EdgeToolsPageSkeleton";
import Container from "@/components/ui/layout/Container";
import { parseRiskModeSheetValue } from "@/lib/fundamentalDashboardData";
import { serverFetchDynamicTableByIdentifier, serverFetchGoogleSheetCell } from "@/lib/serverAdminApi";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Edge Tools",
    "Edge currency strength, pair analysis, technical overlays, and risk-mode context in one toolkit.",
    "/edge-tools",
);

const RISK_MODE_SCORE_SHEET_ID = "RISK ON/OFF 12";
const RISK_MODE_SCORE_CELL = "B13";

async function EdgeToolsWithData() {
    const [edge_currency_strength_index, edge_forex_pair_analysis, edge_technical_dashboard, riskRaw] =
        await Promise.all([
            serverFetchDynamicTableByIdentifier("edge_currency_strength_index"),
            serverFetchDynamicTableByIdentifier("edge_forex_pair_analysis"),
            serverFetchDynamicTableByIdentifier("edge_technical_dashboard"),
            serverFetchGoogleSheetCell(RISK_MODE_SCORE_SHEET_ID, RISK_MODE_SCORE_CELL),
        ]);

    return (
        <EdgeToolsAlertsClientPage
            initialTables={{
                edge_currency_strength_index,
                edge_forex_pair_analysis,
                edge_technical_dashboard,
            }}
            initialRiskModeScore={parseRiskModeSheetValue(riskRaw)}
        />
    );
}

export default function EdgeToolsPage() {
    return (
        <Suspense
            fallback={
                <Container>
                    <EdgeToolsPageSkeleton />
                </Container>
            }
        >
            <EdgeToolsWithData />
        </Suspense>
    );
}
