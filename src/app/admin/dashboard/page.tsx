import AdminDashboardClientPage from "@/components/features/pages/admin/AdminDashboardClientPage";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Admin Dashboard",
    "Administrator overview for Forex Fundamentals Edge: usage, content, and platform health.",
    "/admin/dashboard",
    { noIndex: true },
);

export default function AdminDashboardPage() {
    return <AdminDashboardClientPage />;
}