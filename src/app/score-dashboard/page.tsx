import { Suspense } from "react";

import Container from "@/components/ui/layout/Container";
import ScoreDashboardPageSkeleton from "./ScoreDashboardPageSkeleton";
import { pageSeo } from "@/lib/seo";
import { serverFetchDynamicTableByIdentifier } from "@/lib/serverAdminApi";
import ScoreDashboardClientPage from "./ScoreDashboardClientPage";

export const metadata = pageSeo(
    "Score Dashboard",
    "Composite scoring views and ranked signals to compare forex opportunities across pairs and themes.",
    "/score-dashboard",
);

const TABLE_IDENTIFIER = "score_dashboard_sheet76";

async function ScoreDashboardWithData() {
    const initialTable = await serverFetchDynamicTableByIdentifier(TABLE_IDENTIFIER);
    return <ScoreDashboardClientPage initialTable={initialTable} />;
}

export default function ScoreDashboardPage() {
    return (
        <Suspense
            fallback={
                <Container>
                    <ScoreDashboardPageSkeleton />
                </Container>
            }
        >
            <ScoreDashboardWithData />
        </Suspense>
    );
}
