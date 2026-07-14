import { redirect } from "next/navigation";

import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Daily Market View",
    "Redirecting to Daily Market View.",
    "/daily-market-view",
);

/** Old `/calendar-news` bookmarks → new Daily Market View URL. */
export default function CalendarNewsRedirectPage() {
    redirect("/daily-market-view");
}
