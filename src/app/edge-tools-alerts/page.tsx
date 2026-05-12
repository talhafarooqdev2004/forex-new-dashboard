import { pageSeo } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata = pageSeo(
    "Edge Tools Alerts",
    "Edge tools alerts — redirecting to the main Edge Tools workspace.",
    "/edge-tools-alerts",
);

export default function EdgeToolsAlertsRedirectPage() {
    redirect("/edge-tools");
}
