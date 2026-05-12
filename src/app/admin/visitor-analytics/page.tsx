import VisitorAnalyticsClientPage from "./VisitorAnalyticsClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Visitor Analytics",
    "Traffic and visitor analytics for administrators of Forex Fundamentals Edge.",
    "/admin/visitor-analytics",
    { noIndex: true },
);

export default function AdminVisitorAnalyticsPage() {
    return <VisitorAnalyticsClientPage />;
}
