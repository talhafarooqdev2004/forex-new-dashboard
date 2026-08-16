import { pageSeo } from "@/lib/seo";
import AiUsageClientPage from "./AiUsageClientPage";

export const metadata = pageSeo(
    "AI Usage & Processing",
    "Administrator view of headline processing, provider usage, queue health, and estimated AI cost.",
    "/admin/ai-usage",
    { noIndex: true },
);

export default function AiUsagePage() {
    return <AiUsageClientPage />;
}
