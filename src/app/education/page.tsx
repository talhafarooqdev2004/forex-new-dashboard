import EducationClientPage from "@/components/features/pages/EducationClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Education",
    "Education Center: curated forex topics, lessons, and references to sharpen your trading and market literacy.",
    "/education",
);

export default function EducationPage() {
    return <EducationClientPage />;
}