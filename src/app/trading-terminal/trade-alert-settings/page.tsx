import TradeAlertSettingsClientPage from "@/components/features/pages/TradeAlertSettingsClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Trade Alert Settings",
    "Configure trade alert presets, automation, channels, and message templates.",
    "/trading-terminal/trade-alert-settings",
    { noIndex: true },
);

export default function TradeAlertSettingsPage() {
    return <TradeAlertSettingsClientPage />;
}
