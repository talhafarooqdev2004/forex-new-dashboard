import { pageSeo } from "@/lib/seo";
import NewsDecisionAuditClientPage from "./NewsDecisionAuditClientPage";

export const metadata = pageSeo("News Decision Audit", "Admin-only audit trail for Daily Market View news decisions.", "/admin/news-decision-audit", { noIndex: true });

export default function NewsDecisionAuditPage() {
    return <NewsDecisionAuditClientPage />;
}
