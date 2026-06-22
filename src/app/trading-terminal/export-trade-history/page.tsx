import { Suspense } from "react";
import ExportTradeHistoryClientPage from "@/components/features/pages/ExportTradeHistoryClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Export Trade History",
    "Download closed trades for a selected date range as an Excel file.",
    "/trading-terminal/export-trade-history",
    { noIndex: true },
);

export default function ExportTradeHistoryPage() {
    return (
        <Suspense fallback={null}>
            <ExportTradeHistoryClientPage />
        </Suspense>
    );
}
