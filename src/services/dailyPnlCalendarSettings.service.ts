import {
    DEFAULT_DAILY_PNL_CALENDAR_SETTINGS,
    parseDailyPnlCalendarSettings,
    type DailyPnlCalendarSettings,
} from "@/lib/dailyPnlCalendarSettings";
import { apiConfig, fetchAPI } from "./api.config";

const BASE = apiConfig.baseUrl;
export const DAILY_PNL_CALENDAR_SETTINGS_KEY = "daily_pnl_calendar_settings";
const SETTINGS_URL = `${BASE}/api/v1/admin/app-configs/${DAILY_PNL_CALENDAR_SETTINGS_KEY}`;

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

class DailyPnlCalendarSettingsService {
    getSettings = async (): Promise<DailyPnlCalendarSettings> => {
        const res = await fetchAPI<ApiResponse<{ key: string; value: string | null }>>(SETTINGS_URL, {
            method: "GET",
        });
        const value = res?.data?.value;
        if (!value) return DEFAULT_DAILY_PNL_CALENDAR_SETTINGS;
        try {
            return parseDailyPnlCalendarSettings(JSON.parse(value) as Record<string, unknown>);
        } catch {
            return DEFAULT_DAILY_PNL_CALENDAR_SETTINGS;
        }
    };

    saveSettings = async (settings: DailyPnlCalendarSettings): Promise<void> => {
        await fetchAPI<ApiResponse<unknown>>(SETTINGS_URL, {
            method: "PUT",
            body: JSON.stringify({ value: JSON.stringify(settings) }),
        });
    };

    toggleHiddenDay = async (dateKey: string, hidden: boolean): Promise<DailyPnlCalendarSettings> => {
        const current = await this.getSettings();
        const set = new Set(current.hiddenDays);
        if (hidden) set.add(dateKey);
        else set.delete(dateKey);
        const next: DailyPnlCalendarSettings = { hiddenDays: [...set].sort() };
        await this.saveSettings(next);
        return next;
    };
}

export const dailyPnlCalendarSettingsService = new DailyPnlCalendarSettingsService();
