import ActiveTradesSettingsClientPage from "@/components/features/pages/ActiveTradesSettingsClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Active Trades Settings",
    "Configure breakeven rules and client alert generation for active trades.",
    "/trading-terminal/active-trades-settings",
    { noIndex: true },
);

export default function ActiveTradesSettingsPage() {
    return <ActiveTradesSettingsClientPage />;
}
