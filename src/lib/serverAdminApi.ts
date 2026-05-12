import { cookies } from "next/headers";

import { apiConfig } from "@/services/api.config";
import type { DynamicTable } from "@/services/dynamicTable.service";

const AUTH_COOKIE = "forex_jwt";

type ApiEnvelope<T> = {
    success?: boolean;
    message?: string;
    data?: T;
};

async function authHeaders(): Promise<Record<string, string>> {
    const jar = await cookies();
    const raw = jar.get(AUTH_COOKIE)?.value;
    const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    if (raw) {
        try {
            headers.Authorization = `Bearer ${decodeURIComponent(raw)}`;
        } catch {
            headers.Authorization = `Bearer ${raw}`;
        }
    }
    return headers;
}

/** Authenticated admin API fetch from Server Components (uses `forex_jwt` cookie). */
export async function serverAdminFetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
    const headers = { ...(await authHeaders()), ...(init?.headers as Record<string, string> | undefined) };
    const res = await fetch(url, {
        ...init,
        headers,
        cache: "no-store",
        credentials: "include",
    });
    if (!res.ok) {
        return null;
    }
    const ct = res.headers.get("content-type");
    if (!ct?.includes("application/json")) {
        return null;
    }
    return (await res.json()) as T;
}

export async function serverFetchDynamicTableByIdentifier(identifier: string): Promise<DynamicTable | null> {
    const url = `${apiConfig.endpoints.dynamicTables}/identifier/${encodeURIComponent(identifier)}`;
    const json = await serverAdminFetchJson<ApiEnvelope<DynamicTable>>(url, { method: "GET" });
    return json?.data ?? null;
}

export async function serverFetchDynamicTablesByIdentifiers(
    identifiers: readonly string[],
): Promise<Record<string, DynamicTable | null>> {
    const entries = await Promise.all(
        identifiers.map(async (id) => [id, await serverFetchDynamicTableByIdentifier(id)] as const),
    );
    return Object.fromEntries(entries);
}

const tableEditorBase = () => `${apiConfig.baseURL}/api/v1/admin/table-editor`;

export async function serverFetchGoogleSheetCell(tableId: string, cell: string): Promise<unknown | null> {
    const url = `${tableEditorBase()}/cell?tableId=${encodeURIComponent(tableId)}&cell=${encodeURIComponent(cell)}`;
    const json = await serverAdminFetchJson<ApiEnvelope<{ tableId: string; cell: string; value: unknown }>>(url, {
        method: "GET",
    });
    if (!json?.success || json.data === undefined) return null;
    return json.data.value;
}

/** e.g. range `A180:G187` (tab resolved via `tableId` same as single-cell reads). */
export async function serverFetchGoogleSheetRange(tableId: string, range: string): Promise<unknown[][] | null> {
    const url = `${tableEditorBase()}/range?tableId=${encodeURIComponent(tableId)}&range=${encodeURIComponent(range)}`;
    const json = await serverAdminFetchJson<ApiEnvelope<{ tableId: string; range: string; values: unknown[][] }>>(url, {
        method: "GET",
    });
    if (!json?.success || json.data === undefined) return null;
    return json.data.values ?? null;
}

export async function serverFetchAppConfigValue(configKey: string): Promise<string | null> {
    const url = `${apiConfig.baseURL}/api/v1/admin/app-configs/${encodeURIComponent(configKey)}`;
    const json = await serverAdminFetchJson<ApiEnvelope<{ value?: string | null }>>(url, { method: "GET" });
    const raw = json?.data?.value;
    if (raw === undefined || raw === null) return null;
    return String(raw);
}

/** Whitelisted app config (no auth). Used for COT page copy on SSR. */
export async function serverFetchPublicAppConfigValue(configKey: string): Promise<string | null> {
    const url = `${apiConfig.baseURL}/api/v1/public/config/${encodeURIComponent(configKey)}`;
    try {
        const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        const json = (await res.json()) as ApiEnvelope<{ value?: string | null }>;
        const raw = json?.data?.value;
        if (raw === undefined || raw === null) return null;
        const s = String(raw).trim();
        return s.length ? s : null;
    } catch {
        return null;
    }
}

/**
 * Sync FX technical trends + levels from Google Sheets into DB (requires `forex_jwt` cookie).
 * Prefer this over the webhook when `SCRAPER_WEBHOOK_SECRET` is only configured on the API.
 */
export async function serverSyncFxAnalyzerTechnicalTablesFromSession(): Promise<boolean> {
    const url = `${apiConfig.baseURL}/api/v1/admin/fx-analyzer-technical/sync-from-sheets`;
    const json = await serverAdminFetchJson<ApiEnvelope<unknown>>(url, {
        method: "POST",
        body: JSON.stringify({}),
    });
    return json?.success === true;
}

/** Triggers backend sync: Google Sheets → `fx_technical_trends` + `fx_technical_levels`, then clients get updates via `tableUpdate`. Uses `SCRAPER_WEBHOOK_SECRET` when set (same as other sheet webhooks). */
export async function serverTriggerFxAnalyzerTechnicalSheetSync(): Promise<boolean> {
    const url = `${apiConfig.baseURL}/api/v1/webhooks/fx-analyzer-technical/sync`;
    const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    const secret = process.env.SCRAPER_WEBHOOK_SECRET?.trim();
    if (secret) {
        headers["x-scraper-webhook-key"] = secret;
    }
    try {
        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({}),
            cache: "no-store",
        });
        return res.ok;
    } catch {
        return false;
    }
}

/** Sync Edge Tools dynamic tables from Google Sheets (session JWT). */
export async function serverSyncEdgeToolsFromSession(): Promise<boolean> {
    const url = `${apiConfig.baseURL}/api/v1/admin/edge-tools/sync-from-sheets`;
    const json = await serverAdminFetchJson<ApiEnvelope<unknown>>(url, {
        method: "POST",
        body: JSON.stringify({}),
    });
    return json?.success === true;
}

/** Webhook: Edge Tools sheet → DB (optional `SCRAPER_WEBHOOK_SECRET` on Next + API). */
export async function serverTriggerEdgeToolsSheetSync(): Promise<boolean> {
    const url = `${apiConfig.baseURL}/api/v1/webhooks/edge-tools/sync-from-sheets`;
    const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    const secret = process.env.SCRAPER_WEBHOOK_SECRET?.trim();
    if (secret) {
        headers["x-scraper-webhook-key"] = secret;
    }
    try {
        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({}),
            cache: "no-store",
        });
        return res.ok;
    } catch {
        return false;
    }
}

/** Sync COT Data & Analysis dynamic tables from Google Sheets (session JWT). */
export async function serverSyncCotDataAnalysisFromSession(): Promise<boolean> {
    const url = `${apiConfig.baseURL}/api/v1/admin/cot-data-analysis/sync-from-sheets`;
    const json = await serverAdminFetchJson<ApiEnvelope<unknown>>(url, {
        method: "POST",
        body: JSON.stringify({}),
    });
    return json?.success === true;
}

/** Webhook: COT sheet ranges → DB for `currency_pair_sentiment`, `cot_sentiment_net_score`, `cot_raw_data`. */
export async function serverTriggerCotDataAnalysisSheetSync(): Promise<boolean> {
    const url = `${apiConfig.baseURL}/api/v1/webhooks/cot-data-analysis/sync-from-sheets`;
    const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    const secret = process.env.SCRAPER_WEBHOOK_SECRET?.trim();
    if (secret) {
        headers["x-scraper-webhook-key"] = secret;
    }
    try {
        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({}),
            cache: "no-store",
        });
        return res.ok;
    } catch {
        return false;
    }
}
