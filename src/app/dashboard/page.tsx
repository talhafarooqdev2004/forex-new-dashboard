import { pageSeo } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata = pageSeo(
    "Dashboard",
    "Redirect to your primary forex workspace and market dashboards.",
    "/dashboard",
);

/** User dashboard is not the primary app shell yet — send everyone to the technical dashboard. */
export default function DashboardPage() {
    redirect("/technical-dashboard");
}
