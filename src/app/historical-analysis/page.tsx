import HistoricalAnalysisClientPage from "@/components/features/pages/HistoricalAnalysisClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Historical Analysis",
    "Archived UAE market-day catalyst boards and news after the Daily Market View 1:00 AM Dubai reset.",
    "/historical-analysis",
);

export default function HistoricalAnalysisPage() {
    return <HistoricalAnalysisClientPage />;
}
