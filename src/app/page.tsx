import { pageSeo } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata = pageSeo(
    "Home",
    "Forex Fundamentals Edge — technical and fundamental dashboards, tools, and education for currency traders.",
    "/",
);

export default function HomePage() {
    redirect("/technical-dashboard");
}
