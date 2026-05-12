import { Suspense } from "react";

import Container from "@/components/ui/layout/Container";
import FxAnalyzerProPageSkeleton from "./FxAnalyzerProPageSkeleton";
import { pageSeo } from "@/lib/seo";
import { serverFetchDynamicTablesByIdentifiers, serverSyncFxAnalyzerTechnicalTablesFromSession, serverTriggerFxAnalyzerTechnicalSheetSync } from "@/lib/serverAdminApi";
import FXAnalyzerProClient from "./FXAnalyzerProClient";
import { FX_ANALYZER_DYNAMIC_TABLE_IDS } from "@/lib/fxAnalyzerTableIds";

export const metadata = pageSeo(
    "FX Analyzer Pro",
    "Dynamic forex tables and structured analysis workflows for pairs, scores, and institutional-style data views.",
    "/fx-analyzer-pro",
);

async function FxAnalyzerProWithData() {
    const synced =
        (await serverSyncFxAnalyzerTechnicalTablesFromSession()) || (await serverTriggerFxAnalyzerTechnicalSheetSync());
    if (!synced && process.env.NODE_ENV === "development") {
        console.warn(
            "[fx-analyzer-pro] Google Sheet → DB sync did not complete. Fix: stay logged in (forex_jwt) so the session sync can run, or set SCRAPER_WEBHOOK_SECRET in this Next.js env to match the API, or clear SCRAPER_WEBHOOK_SECRET on the API for local dev.",
        );
    }
    const initialTables = await serverFetchDynamicTablesByIdentifiers([...FX_ANALYZER_DYNAMIC_TABLE_IDS]);
    return <FXAnalyzerProClient initialTables={initialTables} />;
}

export default function FxAnalyzerProPage() {
    return (
        <Suspense
            fallback={
                <Container>
                    <FxAnalyzerProPageSkeleton />
                </Container>
            }
        >
            <FxAnalyzerProWithData />
        </Suspense>
    );
}
