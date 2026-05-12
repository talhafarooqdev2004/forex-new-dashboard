import { apiConfig } from "@/services/api.config";

export const COT_APP_CONFIG_MARKET_COMMENTARY_KEY = "cot_analysis_market_commentary" as const;
export const COT_APP_CONFIG_SENTIMENT_MONTH_KEY = "cot_analysis_overall_sentiment_month" as const;

export const COT_DEFAULT_MARKET_COMMENTARY =
    "Traders are favoring riskier currencies and assets. This typically results in a bullish bias for USD, EUR, GBP, and AUD, and a bearish bias for JPY, CHF, and NZD.";

type AppConfigEnvelope = {
    success?: boolean;
    data?: { value?: string | null; key?: string } | null;
};

function parseAppConfigString(json: unknown): string | null {
    const o = json as AppConfigEnvelope;
    const v = o?.data?.value;
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s.length ? s : null;
}

/** Admin-only save (browser; requires JWT). */
export async function putAdminAppConfig(configKey: string, value: string, token: string): Promise<boolean> {
    const res = await fetch(`${apiConfig.baseURL}/api/v1/admin/app-configs/${encodeURIComponent(configKey)}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ value, description: "COT data analysis page copy" }),
    });
    return res.ok;
}

/** Server or client: unauthenticated read for whitelisted keys. */
export async function fetchPublicAppConfigValue(configKey: string): Promise<string | null> {
    const url = `${apiConfig.baseURL}/api/v1/public/config/${encodeURIComponent(configKey)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type");
    if (!ct?.includes("application/json")) return null;
    const json = (await res.json()) as unknown;
    return parseAppConfigString(json);
}
