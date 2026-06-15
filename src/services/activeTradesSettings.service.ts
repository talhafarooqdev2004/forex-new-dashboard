import { apiConfig, fetchAPI } from "./api.config";

const BASE = apiConfig.baseUrl;
const SETTINGS_KEY = "active_trades_settings";
const SETTINGS_URL = `${BASE}/api/v1/admin/app-configs/${SETTINGS_KEY}`;

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

class ActiveTradesSettingsService {
    getSettings = async (): Promise<Record<string, unknown> | null> => {
        const res = await fetchAPI<ApiResponse<{ key: string; value: string | null }>>(SETTINGS_URL, {
            method: "GET",
        });
        const value = res?.data?.value;
        if (!value) return null;
        try {
            return JSON.parse(value) as Record<string, unknown>;
        } catch {
            return null;
        }
    };

    saveSettings = async (settings: Record<string, unknown>): Promise<void> => {
        await fetchAPI<ApiResponse<unknown>>(SETTINGS_URL, {
            method: "PUT",
            body: JSON.stringify({ value: JSON.stringify(settings) }),
        });
    };
}

export const activeTradesSettingsService = new ActiveTradesSettingsService();
