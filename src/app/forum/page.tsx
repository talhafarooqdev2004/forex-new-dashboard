import ForumClientPage from "@/components/features/pages/ForumClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Forum",
    "Community forum for Forex Fundamentals Edge: announcements, discussions, and trader collaboration.",
    "/forum",
);

export default function ForumPage() {
    return <ForumClientPage />;
}