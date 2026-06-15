import { apiConfig, fetchAPI } from "./api.config";

const BASE = apiConfig.baseUrl;
const PAIRS_URL = `${BASE}/api/v1/admin/trade-alert-pairs`;
const SETTINGS_KEY = "trade_alert_settings";
const SETTINGS_URL = `${BASE}/api/v1/admin/app-configs/${SETTINGS_KEY}`;

export type TradeAlertPair = {
    id: number;
    name: string;
    scalping_sl: number | null;
    swing_sl: number | null;
    display_order: number;
    is_active: boolean;
};

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

class TradeAlertSettingsService {
    listPairs = async (): Promise<TradeAlertPair[]> => {
        const res = await fetchAPI<ApiResponse<TradeAlertPair[]>>(PAIRS_URL, { method: "GET" });
        return res?.data ?? [];
    };

    createPair = async (name: string): Promise<TradeAlertPair | null> => {
        const res = await fetchAPI<ApiResponse<TradeAlertPair>>(PAIRS_URL, {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        return res?.data ?? null;
    };

    upsertPairPreset = async (
        name: string,
        scalping_sl: number | null,
        swing_sl: number | null,
    ): Promise<TradeAlertPair | null> => {
        const res = await fetchAPI<ApiResponse<TradeAlertPair>>(`${PAIRS_URL}/presets`, {
            method: "POST",
            body: JSON.stringify({ name, scalping_sl, swing_sl }),
        });
        return res?.data ?? null;
    };

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

export const tradeAlertSettingsService = new TradeAlertSettingsService();
