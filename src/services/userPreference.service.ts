import { apiConfig, fetchAPI } from "./api.config";
import {
    ACTIVE_TRADES_COLUMNS_PREF_KEY,
    type ActiveTradesColumnVisibility,
    parseActiveTradesColumnVisibility,
    serializeActiveTradesColumnVisibility,
} from "@/lib/activeTradesColumns";

const BASE = `${apiConfig.baseUrl}/api/v1/user-preferences`;

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

class UserPreferenceService {
    getActiveTradesColumnVisibility = async (): Promise<ActiveTradesColumnVisibility> => {
        const res = await fetchAPI<ApiResponse<{ key: string; value: string | null }>>(
            `${BASE}/${ACTIVE_TRADES_COLUMNS_PREF_KEY}`,
            { method: "GET" },
        );
        return parseActiveTradesColumnVisibility(res?.data?.value);
    };

    saveActiveTradesColumnVisibility = async (visibility: ActiveTradesColumnVisibility): Promise<void> => {
        await fetchAPI<ApiResponse<unknown>>(`${BASE}/${ACTIVE_TRADES_COLUMNS_PREF_KEY}`, {
            method: "PUT",
            body: JSON.stringify({ value: serializeActiveTradesColumnVisibility(visibility) }),
        });
    };
}

export const userPreferenceService = new UserPreferenceService();
