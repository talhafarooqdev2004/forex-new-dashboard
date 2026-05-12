import TradingAnalysisClientPage from "@/components/features/pages/TradingAnalysisClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Trading Analysis",
    "Trading analysis tools and views for deeper post-trade and setup review (preview).",
    "/trading-analysis",
);

export default function TradingAnalysisPage() {
    return <TradingAnalysisClientPage />;
}