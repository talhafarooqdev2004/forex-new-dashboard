import HistoricalAnalysisClientPage from "@/components/features/pages/HistoricalAnalysisClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Historical Analysis",
    "Archived UAE-day market driver boards and headlines after the Asia/Dubai midnight reset.",
    "/historical-analysis",
);

export default function HistoricalAnalysisPage() {
    return <HistoricalAnalysisClientPage />;
}
