import { apiConfig } from "@/services/api.config";

export type ColorConfigurationType =
    | "gauge"
    | "fundamental"
    | "trend"
    | "momentum"
    | "sentiment"
    | "volatility"
    | "risk_mode"
    | "currency_strength_gauge"
    | "chart_range"
    | "currency_strength";

export interface ColorConfiguration {
    id: number | string;
    type: string;
    name: string;
    min_value: number;
    max_value: number;
    color: string;
    created_at?: string;
    updated_at?: string;
}

export interface ColorConfigurationPayload {
    type: ColorConfigurationType;
    name: string;
    min_value: number;
    max_value: number;
    color: string;
}

function authHeader(token: string | null): HeadersInit {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
}

type ApiListResponse = { success?: boolean; data?: ColorConfiguration[]; message?: string };

const base = () => `${apiConfig.baseURL}/api/v1/admin/score-configurations`;

export async function getColorConfigurations(
    type: ColorConfigurationType,
    token: string | null,
): Promise<ColorConfiguration[]> {
    const res = await fetch(`${base()}?type=${encodeURIComponent(type)}`, {
        credentials: "include",
        headers: { ...authHeader(token) },
    });
    const json = (await res.json()) as ApiListResponse;
    if (!res.ok || !json.success || !Array.isArray(json.data)) {
        return [];
    }
    return json.data;
}

export async function bulkUpdateColorConfigurations(
    type: ColorConfigurationType,
    configurations: ColorConfigurationPayload[],
    token: string,
): Promise<ColorConfiguration[]> {
    const res = await fetch(`${base()}/bulk-update`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(token),
        },
        body: JSON.stringify({ type, configurations }),
    });
    const json = (await res.json()) as ApiListResponse;
    if (!res.ok || !json.success || !Array.isArray(json.data)) {
        throw new Error(json.message || res.statusText || "Save failed");
    }
    return json.data;
}
