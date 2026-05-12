import { Suspense } from "react";

import CotDataAnalysisClientPage from "@/components/features/pages/CotDataAnalysisClientPage";
import CotDataAnalysisPageSkeleton from "./CotDataAnalysisPageSkeleton";
import Container from "@/components/ui/layout/Container";
import {
    COT_OVERALL_RISK_BIAS_CELL,
    COT_OVERALL_RISK_SCORE_FALLBACK_CELL,
    COT_OVERALL_RISK_SCORE_PRIMARY_CELL,
    COT_OVERALL_SHEET_TAB,
    resolveCotOverallRiskScoreCells,
} from "@/lib/cotDataAnalysisFromTables";
import {
    serverFetchDynamicTableByIdentifier,
    serverFetchGoogleSheetCell,
    serverFetchPublicAppConfigValue,
    serverSyncCotDataAnalysisFromSession,
    serverTriggerCotDataAnalysisSheetSync,
} from "@/lib/serverAdminApi";
import {
    COT_APP_CONFIG_MARKET_COMMENTARY_KEY,
    COT_APP_CONFIG_SENTIMENT_MONTH_KEY,
} from "@/lib/cotPageAppConfig";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "COT Data & Analysis",
    "Commitment of Traders positioning, sentiment summaries, and positioning-aware commentary for major forex markets.",
    "/cot-data-analysis",
);

const CURRENCY_PAIR_SENTIMENT_ID = "currency_pair_sentiment";
const COT_SENTIMENT_NET_SCORE_ID = "cot_sentiment_net_score";
const COT_RAW_DATA_ID = "cot_raw_data";

async function CotDataAnalysisWithData() {
    const synced =
        (await serverSyncCotDataAnalysisFromSession()) || (await serverTriggerCotDataAnalysisSheetSync());
    if (!synced && process.env.NODE_ENV === "development") {
        console.warn(
            "[cot-data-analysis] Google Sheet → DB sync did not complete. Fix: stay logged in (forex_jwt) for admin sync, or set SCRAPER_WEBHOOK_SECRET on Next.js to match the API.",
        );
    }
    const [
        initialPairSentiment,
        initialCotSentimentNet,
        cotRaw,
        cotRiskScoreRaw,
        cotRiskScoreFallbackRaw,
        cotRiskBiasRaw,
        initialCotMarketCommentary,
        initialCotSentimentMonthLabel,
    ] = await Promise.all([
        serverFetchDynamicTableByIdentifier(CURRENCY_PAIR_SENTIMENT_ID),
        serverFetchDynamicTableByIdentifier(COT_SENTIMENT_NET_SCORE_ID),
        serverFetchDynamicTableByIdentifier(COT_RAW_DATA_ID),
        serverFetchGoogleSheetCell(COT_OVERALL_SHEET_TAB, COT_OVERALL_RISK_SCORE_PRIMARY_CELL),
        serverFetchGoogleSheetCell(COT_OVERALL_SHEET_TAB, COT_OVERALL_RISK_SCORE_FALLBACK_CELL),
        serverFetchGoogleSheetCell(COT_OVERALL_SHEET_TAB, COT_OVERALL_RISK_BIAS_CELL),
        serverFetchPublicAppConfigValue(COT_APP_CONFIG_MARKET_COMMENTARY_KEY),
        serverFetchPublicAppConfigValue(COT_APP_CONFIG_SENTIMENT_MONTH_KEY),
    ]);

    const initialTableExists: Record<string, boolean> = {
        [CURRENCY_PAIR_SENTIMENT_ID]: Boolean(initialPairSentiment),
        [COT_SENTIMENT_NET_SCORE_ID]: Boolean(initialCotSentimentNet),
        [COT_RAW_DATA_ID]: Boolean(cotRaw),
    };

    return (
        <CotDataAnalysisClientPage
            initialPairSentiment={initialPairSentiment}
            initialCotSentimentNet={initialCotSentimentNet}
            initialTableExists={initialTableExists}
            initialCotOverallRiskScore={resolveCotOverallRiskScoreCells(cotRiskScoreRaw, cotRiskScoreFallbackRaw)}
            initialCotOverallRiskBias={
                cotRiskBiasRaw === null || cotRiskBiasRaw === undefined ? "" : String(cotRiskBiasRaw).trim()
            }
            initialCotMarketCommentary={initialCotMarketCommentary}
            initialCotSentimentMonthLabel={initialCotSentimentMonthLabel}
        />
    );
}

export default function CotDataAnalysisPage() {
    return (
        <Suspense
            fallback={
                <Container>
                    <CotDataAnalysisPageSkeleton />
                </Container>
            }
        >
            <CotDataAnalysisWithData />
        </Suspense>
    );
}
