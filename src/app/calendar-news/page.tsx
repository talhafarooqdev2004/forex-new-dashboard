import CalendarNewsClientPage from "@/components/features/pages/CalendarNewsClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Calendar & News",
    "Economic calendar and market news context to align forex trades with scheduled events and headlines.",
    "/calendar-news",
);

export default function CalendarNewsPage() {
    return <CalendarNewsClientPage />;
}