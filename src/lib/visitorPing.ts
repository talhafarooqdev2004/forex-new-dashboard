import { apiConfig } from "@/services/api.config";

const SESSION_KEY = "fx_visitor_geo_ping_v1";

/**
 * Records a first-seen IP for geo analytics (server dedupes by IP).
 * Uses sessionStorage so we do not POST on every client navigation.
 */
export async function pingVisitorLocationFromBrowser(): Promise<void> {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    try {
        const res = await fetch(`${apiConfig.baseURL}/api/v1/public/analytics/visit`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: "{}",
        });
        if (res.ok) sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
        /* ignore */
    }
}

/** Clears the per-tab ping flag (e.g. after logout). */
export function clearVisitorPingSessionFlag(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Always POSTs (e.g. after login/register) so a returning user in a new tab
 * still triggers a server check; the backend skips work when the IP row already exists.
 */
export async function pingVisitorLocationAfterAuth(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
        await fetch(`${apiConfig.baseURL}/api/v1/public/analytics/visit`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: "{}",
        });
        sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
        /* ignore */
    }
}
