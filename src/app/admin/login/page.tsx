import AdminLoginPageClient from "./AdminLoginPageClient";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Admin sign in",
    "Administrator sign-in for Forex Fundamentals Edge.",
    "/admin/login",
    { noIndex: true },
);

export default function AdminLoginPage() {
    return <AdminLoginPageClient />;
}
