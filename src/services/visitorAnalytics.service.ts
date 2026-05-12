import { apiConfig } from "@/services/api.config";

export type VisitorGeoCountryRow = {
    countryCode: string | null;
    countryName: string | null;
    visitorCount: number;
    percentOfResolved: number;
};

export type VisitorGeoRegionRow = {
    countryCode: string | null;
    countryName: string | null;
    regionName: string | null;
    visitorCount: number;
    percentOfResolved: number;
};

export type VisitorGeoAdminStats = {
    totalDistinctIps: number;
    resolvedVisitors: number;
    pendingCount: number;
    failedCount: number;
    byCountry: VisitorGeoCountryRow[];
    byRegion: VisitorGeoRegionRow[];
};

export async function fetchVisitorGeoAdminStats(token: string): Promise<VisitorGeoAdminStats | null> {
    const res = await fetch(`${apiConfig.baseURL}/api/v1/admin/analytics/visitor-locations`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
    });
    const json = (await res.json()) as { success?: boolean; data?: VisitorGeoAdminStats };
    if (!res.ok || !json.success || !json.data) return null;
    return json.data;
}
