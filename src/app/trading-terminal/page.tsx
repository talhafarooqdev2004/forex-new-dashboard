import TradingTerminalClientPage from "@/components/features/pages/TradingTerminalClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Trading Terminal & Alerts",
    "Trading terminal and alerts workspace for execution-focused workflows (preview).",
    "/trading-terminal",
);

export default function TradingTerminalPage() {
    return <TradingTerminalClientPage />;
}