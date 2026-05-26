import { pageSeo } from "@/lib/seo";
import FXAnalyzerProClient from "./FXAnalyzerProClient";

export const metadata = pageSeo(
    "FX Analyzer Pro",
    "Dynamic forex tables and structured analysis workflows for pairs, scores, and institutional-style data views.",
    "/fx-analyzer-pro",
);

/** Sync page (no async RSC) — data + sheet sync run on the client to avoid nested Suspense / DevTools warnings. */
export default function FxAnalyzerProPage() {
    return <FXAnalyzerProClient />;
}
