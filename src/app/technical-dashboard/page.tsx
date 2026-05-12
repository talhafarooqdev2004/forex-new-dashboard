import { Suspense } from "react";

import TechnicalDashboardClientPage from "@/components/features/pages/TechnicalDashboardClientPage";
import Container from "@/components/ui/layout/Container";
import { pageSeo } from "@/lib/seo";
import { loadTechnicalDashboardInitialWidgetTables } from "./loadTechnicalDashboardData";
import TechnicalDashboardPageSkeleton from "./TechnicalDashboardPageSkeleton";

export const metadata = pageSeo(
    "Technical Dashboard",
    "Technical market overview: pair levels, widgets, and charts to support intraday and swing forex analysis.",
    "/technical-dashboard",
);

const pairTickers = [
    { pair: "EUR/USD", price: 1.1045, change: -0.15 },
    { pair: "GBP/USD", price: 1.2693, change: -0.12 },
    { pair: "USD/JPY", price: 1.2345, change: -0.15 },
    { pair: "USD/CHF", price: 0.9124, change: 0.08 },
];

async function TechnicalDashboardWithData() {
    const initialWidgetTables = await loadTechnicalDashboardInitialWidgetTables();
    return (
        <TechnicalDashboardClientPage pairTickers={pairTickers} initialWidgetTables={initialWidgetTables} />
    );
}

export default function TechnicalDashboardPage() {
    return (
        <Suspense
            fallback={
                <Container>
                    <TechnicalDashboardPageSkeleton />
                </Container>
            }
        >
            <TechnicalDashboardWithData />
        </Suspense>
    );
}
