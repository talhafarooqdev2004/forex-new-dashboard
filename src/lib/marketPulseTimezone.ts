/** Cookie + legacy localStorage key for Market Pulse timezone preference (30-day cookie is canonical). */
export const MARKET_PULSE_TZ_STORAGE_KEY = "forex_market_pulse_timezone_v1";

/** HttpOnly=false client cookie; `Max-Age` = 30 days. */
export const MARKET_PULSE_TZ_COOKIE_NAME = "forex_market_pulse_timezone_v1";

/** Stored value: IANA zone id, or this sentinel to mirror the browser/device zone. */
export const MARKET_PULSE_TZ_DEVICE = "__device__";

const MARKET_PULSE_TZ_COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60;

function readCookieRaw(name: string): string | null {
    if (typeof document === "undefined") return null;
    const prefix = `${name}=`;
    for (const part of document.cookie.split(";")) {
        const t = part.trim();
        if (t.startsWith(prefix)) {
            const rawVal = t.slice(prefix.length);
            try {
                return decodeURIComponent(rawVal);
            } catch {
                return rawVal;
            }
        }
    }
    return null;
}

/** Read persisted Market Pulse timezone (cookie first, then legacy localStorage). */
export function readMarketPulseTimezonePreference(): string {
    const fromCookie = readCookieRaw(MARKET_PULSE_TZ_COOKIE_NAME);
    if (fromCookie != null && fromCookie !== "") return fromCookie;
    try {
        return localStorage.getItem(MARKET_PULSE_TZ_STORAGE_KEY) ?? MARKET_PULSE_TZ_DEVICE;
    } catch {
        return MARKET_PULSE_TZ_DEVICE;
    }
}

/** Persist timezone for 30 days (`Path=/`, `SameSite=Lax`). Value should be IANA id or {@link MARKET_PULSE_TZ_DEVICE}. */
export function writeMarketPulseTimezonePreference(value: string): void {
    if (typeof document === "undefined") return;
    const enc = encodeURIComponent(value);
    document.cookie = `${MARKET_PULSE_TZ_COOKIE_NAME}=${enc}; Path=/; Max-Age=${MARKET_PULSE_TZ_COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
    try {
        localStorage.setItem(MARKET_PULSE_TZ_STORAGE_KEY, value);
    } catch {
        /* optional mirror for older builds */
    }
}

export type MarketPulseTimezoneOption = {
    value: string;
    label: string;
};

/**
 * Preset zones for the Market Pulse time axis (IANA ids).
 * Covers major trading / population regions; “Device timezone” follows the browser.
 */
export const MARKET_PULSE_TIMEZONE_OPTIONS: readonly MarketPulseTimezoneOption[] = [
    { value: MARKET_PULSE_TZ_DEVICE, label: "Device timezone" },
    { value: "UTC", label: "UTC" },
    /* Americas */
    { value: "America/New_York", label: "USA — Eastern" },
    { value: "America/Chicago", label: "USA — Central" },
    { value: "America/Denver", label: "USA — Mountain" },
    { value: "America/Los_Angeles", label: "USA — Pacific" },
    { value: "America/Toronto", label: "Canada — Toronto" },
    { value: "America/Vancouver", label: "Canada — Vancouver" },
    { value: "America/Mexico_City", label: "Mexico" },
    { value: "America/Sao_Paulo", label: "Brazil" },
    { value: "America/Argentina/Buenos_Aires", label: "Argentina" },
    { value: "America/Santiago", label: "Chile" },
    /* Europe */
    { value: "Europe/London", label: "United Kingdom" },
    { value: "Europe/Dublin", label: "Ireland" },
    { value: "Europe/Lisbon", label: "Portugal" },
    { value: "Europe/Madrid", label: "Spain" },
    { value: "Europe/Paris", label: "France" },
    { value: "Europe/Brussels", label: "Belgium" },
    { value: "Europe/Amsterdam", label: "Netherlands" },
    { value: "Europe/Berlin", label: "Germany" },
    { value: "Europe/Zurich", label: "Switzerland" },
    { value: "Europe/Rome", label: "Italy" },
    { value: "Europe/Athens", label: "Greece" },
    { value: "Europe/Warsaw", label: "Poland" },
    { value: "Europe/Stockholm", label: "Sweden" },
    { value: "Europe/Moscow", label: "Russia — Moscow" },
    { value: "Europe/Kyiv", label: "Ukraine" },
    { value: "Europe/Istanbul", label: "Türkiye" },
    /* Africa & Middle East */
    { value: "Africa/Johannesburg", label: "South Africa" },
    { value: "Africa/Lagos", label: "Nigeria" },
    { value: "Africa/Cairo", label: "Egypt" },
    { value: "Asia/Dubai", label: "UAE — Dubai" },
    { value: "Asia/Riyadh", label: "Saudi Arabia" },
    { value: "Asia/Jerusalem", label: "Israel" },
    { value: "Asia/Tehran", label: "Iran" },
    /* Asia Pacific */
    { value: "Asia/Kolkata", label: "India" },
    { value: "Asia/Karachi", label: "Pakistan" },
    { value: "Asia/Dhaka", label: "Bangladesh" },
    { value: "Asia/Bangkok", label: "Thailand" },
    { value: "Asia/Jakarta", label: "Indonesia — Jakarta" },
    { value: "Asia/Manila", label: "Philippines" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Kuala_Lumpur", label: "Malaysia" },
    { value: "Asia/Ho_Chi_Minh", label: "Vietnam" },
    { value: "Asia/Shanghai", label: "China" },
    { value: "Asia/Hong_Kong", label: "Hong Kong" },
    { value: "Asia/Taipei", label: "Taiwan" },
    { value: "Asia/Seoul", label: "South Korea" },
    { value: "Asia/Tokyo", label: "Japan" },
    { value: "Australia/Sydney", label: "Australia — Sydney" },
    { value: "Pacific/Auckland", label: "New Zealand" },
] as const;

export function getEffectiveIanaTimeZone(stored: string | null | undefined): string {
    if (!stored || stored === MARKET_PULSE_TZ_DEVICE) {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return "UTC";
        }
    }
    return stored;
}

/** Compact 12h label for narrow chart slots (single line; no narrow no-break spaces). */
export function formatMarketPulseAxisTime(epochMs: number, ianaTimeZone: string): string {
    const raw = new Intl.DateTimeFormat("en-US", {
        timeZone: ianaTimeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(epochMs));
    return raw
        .replace(/\u202f|\u00a0/g, " ")
        .replace(/ AM$/i, " am")
        .replace(/ PM$/i, " pm")
        .trim();
}
