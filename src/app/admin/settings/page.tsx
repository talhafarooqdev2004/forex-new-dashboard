import { Suspense } from "react";

import AdminSettingsClientPage from "./AdminSettingsClientPage";
import AdminSettingsPageSkeleton from "./AdminSettingsPageSkeleton";
import { pageSeo } from "@/lib/seo";
import { serverFetchAppConfigValue } from "@/lib/serverAdminApi";

export const metadata = pageSeo(
    "Admin Settings",
    "Configure platform options, maintenance mode, and application settings for Forex Fundamentals Edge.",
    "/admin/settings",
    { noIndex: true },
);

const MAINTENANCE_KEY = "maintenance_mode";

function parseMaintenanceValue(raw: string | null): boolean {
    if (!raw) return false;
    return raw === "true" || raw === "1" || raw === "yes";
}

async function AdminSettingsWithData() {
    const raw = await serverFetchAppConfigValue(MAINTENANCE_KEY);
    const initialMaintenanceEnabled = parseMaintenanceValue(raw);
    return <AdminSettingsClientPage initialMaintenanceEnabled={initialMaintenanceEnabled} />;
}

export default function AdminSettingsPage() {
    return (
        <Suspense fallback={<AdminSettingsPageSkeleton />}>
            <AdminSettingsWithData />
        </Suspense>
    );
}
