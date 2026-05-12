import { Suspense } from "react";

import Container from "@/components/ui/layout/Container";
import SeasonalTrendsPageSkeleton from "./SeasonalTrendsPageSkeleton";
import { pageSeo } from "@/lib/seo";
import { serverFetchDynamicTableByIdentifier } from "@/lib/serverAdminApi";
import SeasonalTrendsClientPage from "./SeasonalTrendsClientPage";

export const metadata = pageSeo(
    "Seasonal Trends",
    "Yearly and monthly seasonality, heatmaps, and currency seasonality to time forex exposure with historical tendencies.",
    "/seasonal-trends",
);

const YEARLY_SEASONALITY_IDENTIFIER = "yearly_seasonality_trends";
const MONTHLY_HEATMAP_IDENTIFIER = "monthly_performance_heatmap";
const CURRENCY_SEASONALITY_IDENTIFIER = "currency_seasonality";

async function SeasonalTrendsWithData() {
    const [initialYearly, initialMonthly, initialCurrencySeasonality] = await Promise.all([
        serverFetchDynamicTableByIdentifier(YEARLY_SEASONALITY_IDENTIFIER),
        serverFetchDynamicTableByIdentifier(MONTHLY_HEATMAP_IDENTIFIER),
        serverFetchDynamicTableByIdentifier(CURRENCY_SEASONALITY_IDENTIFIER),
    ]);

    const initialTableExists: Record<string, boolean> = {
        [YEARLY_SEASONALITY_IDENTIFIER]: Boolean(initialYearly),
        [MONTHLY_HEATMAP_IDENTIFIER]: Boolean(initialMonthly),
        [CURRENCY_SEASONALITY_IDENTIFIER]: Boolean(initialCurrencySeasonality),
    };

    return (
        <SeasonalTrendsClientPage
            initialYearly={initialYearly}
            initialMonthly={initialMonthly}
            initialCurrencySeasonality={initialCurrencySeasonality}
            initialTableExists={initialTableExists}
        />
    );
}

export default function SeasonalTrendsPage() {
    return (
        <Suspense
            fallback={
                <Container>
                    <SeasonalTrendsPageSkeleton />
                </Container>
            }
        >
            <SeasonalTrendsWithData />
        </Suspense>
    );
}
