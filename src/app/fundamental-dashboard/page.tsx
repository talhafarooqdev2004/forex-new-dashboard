import { Suspense } from "react";

import Container from "@/components/ui/layout/Container";
import FundamentalDashboardPageSkeleton from "./FundamentalDashboardPageSkeleton";
import { pageSeo } from "@/lib/seo";
import FundamentalDashboardClientPage from "./FundamentalDashboardClientPage";
import { parseFundamentalsNewPulseSheetGrid, parseRiskModeSheetValue } from "@/lib/fundamentalDashboardData";
import {
    serverFetchDynamicTableByIdentifier,
    serverFetchGoogleSheetCell,
    serverFetchGoogleSheetRange,
} from "@/lib/serverAdminApi";

export const metadata = pageSeo(
    "Fundamental Dashboard",
    "Macro fundamentals, currency strength, seasonality, central bank policy context, and risk-on/risk-off signals in one workspace.",
    "/fundamental-dashboard",
);

const CURRENCY_PAIR_SENTIMENT_ID = "currency_pair_sentiment";
const COT_RAW_DATA_ID = "cot_raw_data";
const FUNDAMENTAL_CURRENCY_STRENGTH_INDEX_ID = "fundamental_currency_strength_index";
const CURRENCY_SEASONALITY_ID = "currency_seasonality";
const CENTRAL_BANK_POLICIES_ID = "central_bank_policies";
const RISK_MODE_SCORE_SHEET_ID = "RISK ON/OFF 12";
const RISK_MODE_SCORE_CELL = "B13";

const FUNDAMENTALS_NEW_SHEET_ID = "Fundamentals New";
const FUNDAMENTALS_NEW_PULSE_RANGE = "A180:G187";

async function FundamentalDashboardWithData() {
    const [pairSentiment, cotRaw, fundamentalStrength, currencySeasonality, centralBankPolicies, riskRaw, pulseGrid] =
        await Promise.all([
            serverFetchDynamicTableByIdentifier(CURRENCY_PAIR_SENTIMENT_ID),
            serverFetchDynamicTableByIdentifier(COT_RAW_DATA_ID),
            serverFetchDynamicTableByIdentifier(FUNDAMENTAL_CURRENCY_STRENGTH_INDEX_ID),
            serverFetchDynamicTableByIdentifier(CURRENCY_SEASONALITY_ID),
            serverFetchDynamicTableByIdentifier(CENTRAL_BANK_POLICIES_ID),
            serverFetchGoogleSheetCell(RISK_MODE_SCORE_SHEET_ID, RISK_MODE_SCORE_CELL),
            serverFetchGoogleSheetRange(FUNDAMENTALS_NEW_SHEET_ID, FUNDAMENTALS_NEW_PULSE_RANGE),
        ]);

    const initialEconomicPulseScores = parseFundamentalsNewPulseSheetGrid(pulseGrid);

    return (
        <FundamentalDashboardClientPage
            initialTables={{
                pairSentiment,
                cotRaw,
                fundamentalStrength,
                currencySeasonality,
                centralBankPolicies,
            }}
            initialRiskModeScore={parseRiskModeSheetValue(riskRaw)}
            initialEconomicPulseScores={initialEconomicPulseScores}
        />
    );
}

export default function FundamentalDashboardPage() {
    return (
        <Suspense
            fallback={
                <Container className="flex flex-col gap-8">
                    <FundamentalDashboardPageSkeleton />
                </Container>
            }
        >
            <FundamentalDashboardWithData />
        </Suspense>
    );
}
