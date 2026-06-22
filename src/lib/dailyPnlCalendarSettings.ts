/** `YYYY-MM-DD` key for a calendar day (month is 0-based, same as `Date#getMonth`). */
export function calendarDayKey(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

export type DailyPnlCalendarSettings = {
    hiddenDays: string[];
};

export const DEFAULT_DAILY_PNL_CALENDAR_SETTINGS: DailyPnlCalendarSettings = {
    hiddenDays: [],
};

export function parseDailyPnlCalendarSettings(raw: Record<string, unknown> | null): DailyPnlCalendarSettings {
    if (!raw || !Array.isArray(raw.hiddenDays)) return DEFAULT_DAILY_PNL_CALENDAR_SETTINGS;
    const hiddenDays = raw.hiddenDays.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d));
    return { hiddenDays };
}

export function hiddenDaysSet(settings: DailyPnlCalendarSettings): Set<string> {
    return new Set(settings.hiddenDays);
}
